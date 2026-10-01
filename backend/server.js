import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';
import pg from 'pg';
import { DICTIONARY_SET } from './dictionary.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '.env') });

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Supabase Client Setup
const supabaseUrl = process.env.SUPABASE_URL || 'https://fbjxvlrozqwwryumpore.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

// PostgreSQL pool fallback for direct DB access
const { Pool } = pg;
const dbPool = new Pool({
  connectionString: process.env.DIRECT_URL || process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// Blended English + Indonesian letter weights for statistical language detection
const LETTER_WEIGHTS = {
  a: 15, e: 13, i: 10, n: 9, t: 8, r: 7, s: 7, u: 6, d: 5, m: 5,
  l: 5, o: 5, k: 5, g: 4, h: 4, b: 4, p: 3, y: 3, c: 2, w: 2,
  f: 1, v: 1, j: 0, z: -8, x: -9, q: -10
};

// Gibberish / impossible 2-letter consonant clusters in natural language
const FORBIDDEN_CLUSTERS = [
  'qj', 'jq', 'qx', 'xq', 'qz', 'zq', 'jx', 'xj', 'jz', 'zj',
  'qg', 'qk', 'qb', 'qp', 'vq', 'vj', 'vx', 'vz',
  'cb', 'cd', 'cf', 'cg', 'cj', 'ck', 'cp', 'cq', 'cv', 'cw', 'cx', 'cz'
];

/**
 * Caesar cipher decryption for a given shift
 */
function decryptCaesar(text, shift) {
  return text.replace(/[a-zA-Z]/g, (char) => {
    const base = char <= 'Z' ? 65 : 97;
    const x = char.charCodeAt(0) - base;
    const shiftedCode = (((x - shift) % 26) + 26) % 26;
    return String.fromCharCode(shiftedCode + base);
  });
}

/**
 * Multi-tier linguistic score for decrypted text
 * Mengombinasikan pencocokan kamus luas Bahasa Indonesia & English (1300+ kata),
 * rasio vokal, bobot frekuensi huruf alami, serta penalti kluster konsonan aneh.
 */
function scoreDecryption(text) {
  const lower = text.toLowerCase();
  const wordList = lower.split(/[^a-z]+/).filter(Boolean);

  let wordMatches = 0;
  let matchedChars = 0;
  for (const w of wordList) {
    if (DICTIONARY_SET.has(w)) {
      wordMatches++;
      matchedChars += w.length;
    }
  }

  const matchRatio = wordList.length > 0 ? wordMatches / wordList.length : 0;
  let dictScore = matchedChars * 40;
  if (matchRatio === 1 && wordList.length > 0) {
    dictScore += 250; // Bonus kalimat yang seluruh katanya valid
  } else if (matchRatio > 0) {
    dictScore += Math.round(matchRatio * 80);
  }

  const clean = lower.replace(/[^a-z]/g, '');
  if (!clean.length) return dictScore;

  // 1. Bobot frekuensi huruf alami
  let freqScore = 0;
  for (const ch of clean) {
    freqScore += LETTER_WEIGHTS[ch] ?? 0;
  }

  // 2. Evaluasi rasio vokal (bahasa alami berkisar 28% - 52%)
  const vowels = (clean.match(/[aeiou]/g) || []).length;
  const vRatio = vowels / clean.length;
  let vowelScore = 0;
  if (vRatio >= 0.28 && vRatio <= 0.52) {
    vowelScore = 20 - Math.abs(vRatio - 0.40) * 40;
  } else if (vRatio === 0 || vRatio > 0.65) {
    vowelScore = -50;
  } else {
    vowelScore = -15;
  }

  // 3. Penalti kluster konsonan mustahil / tak bermakna
  let clusterPenalty = 0;
  for (const fc of FORBIDDEN_CLUSTERS) {
    if (clean.includes(fc)) {
      clusterPenalty -= 40;
    }
  }

  return Math.round(dictScore + freqScore + vowelScore + clusterPenalty);
}

/**
 * Calculate brute force for all 25 shifts and score them
 */
function calculateBruteForce(ciphertext) {
  const trimmed = ciphertext.trim();
  if (!trimmed) return { rows: [], bestShift: 0, bestText: '', maxScore: 0 };

  const rows = Array.from({ length: 25 }, (_, i) => {
    const shift = i + 1;
    const decrypted = decryptCaesar(trimmed, shift);
    return {
      k: shift,
      text: decrypted,
      score: scoreDecryption(decrypted),
      best: false,
    };
  });

  const maxScore = Math.max(...rows.map((r) => r.score));
  let bestShift = 0;
  let bestText = '';

  const scoredRows = rows.map((r) => {
    const isBest = r.score === maxScore;
    if (isBest && !bestShift) {
      bestShift = r.k;
      bestText = r.text;
    }
    return {
      ...r,
      best: isBest,
    };
  });

  return {
    rows: scoredRows,
    bestShift: bestShift || 1,
    bestText: bestText || scoredRows[0]?.text || '',
    maxScore: Math.round(maxScore),
  };
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'caesar-cipher-backend',
    timestamp: new Date().toISOString(),
  });
});

/**
 * POST /api/brute-force
 * Body: { ciphertext: string }
 * Solves brute force, calculates scores, saves to Supabase, and returns the results.
 */
app.post('/api/brute-force', async (req, res) => {
  try {
    const { ciphertext } = req.body;

    if (!ciphertext || typeof ciphertext !== 'string' || !ciphertext.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Ciphertext harus berupa teks yang tidak kosong.',
      });
    }

    const trimmed = ciphertext.trim();
    const { rows, bestShift, bestText, maxScore } = calculateBruteForce(trimmed);

    let savedRecord = null;

    // 1. Try saving to Supabase via Supabase client
    try {
      const { data, error } = await supabase
        .from('brute_force_history')
        .insert([
          {
            ciphertext: trimmed,
            best_shift: bestShift,
            best_text: bestText,
            best_score: maxScore,
            results: rows,
          },
        ])
        .select()
        .single();

      if (!error && data) {
        savedRecord = data;
      } else if (error) {
        console.warn('Supabase JS Client insert warning:', error.message);
      }
    } catch (sbErr) {
      console.warn('Supabase JS Client exception:', sbErr.message);
    }

    // 2. Fallback to direct PostgreSQL pool if Supabase client had an issue
    if (!savedRecord) {
      try {
        const client = await dbPool.connect();
        const insertQuery = `
          INSERT INTO brute_force_history (ciphertext, best_shift, best_text, best_score, results)
          VALUES ($1, $2, $3, $4, $5)
          RETURNING *;
        `;
        const result = await client.query(insertQuery, [
          trimmed,
          bestShift,
          bestText,
          maxScore,
          JSON.stringify(rows),
        ]);
        client.release();
        if (result.rows.length > 0) {
          savedRecord = result.rows[0];
        }
      } catch (dbErr) {
        console.error('PostgreSQL direct fallback error:', dbErr.message);
      }
    }

    return res.status(200).json({
      success: true,
      data: {
        id: savedRecord?.id || null,
        ciphertext: trimmed,
        bestShift,
        bestText,
        bestScore: maxScore,
        results: rows,
        createdAt: savedRecord?.created_at || new Date().toISOString(),
      },
    });
  } catch (err) {
    console.error('Error in POST /api/brute-force:', err);
    return res.status(500).json({
      success: false,
      error: 'Terjadi kesalahan pada server saat memproses brute force.',
      details: err.message,
    });
  }
});

/**
 * GET /api/brute-force
 * Query: ?limit=10
 * Returns recent brute force history from Supabase
 */
app.get('/api/brute-force', async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit, 10) || 10, 50);

    // Try Supabase client first
    const { data, error } = await supabase
      .from('brute_force_history')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (!error && data) {
      return res.status(200).json({
        success: true,
        data,
      });
    }

    // Fallback to PostgreSQL pool
    const client = await dbPool.connect();
    const query = 'SELECT * FROM brute_force_history ORDER BY created_at DESC LIMIT $1;';
    const result = await client.query(query, [limit]);
    client.release();

    return res.status(200).json({
      success: true,
      data: result.rows,
    });
  } catch (err) {
    console.error('Error in GET /api/brute-force:', err);
    return res.status(500).json({
      success: false,
      error: 'Gagal mengambil riwayat brute force dari database Supabase.',
      details: err.message,
    });
  }
});

/**
 * GET /api/brute-force/:id
 * Returns a specific brute force record by ID
 */
app.get('/api/brute-force/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('brute_force_history')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      return res.status(404).json({
        success: false,
        error: 'Data brute force tidak ditemukan.',
      });
    }

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (err) {
    console.error('Error in GET /api/brute-force/:id:', err);
    return res.status(500).json({
      success: false,
      error: 'Gagal mengambil data brute force.',
      details: err.message,
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Caesar Cipher Express Backend running on http://localhost:${PORT}`);
  console.log(`Connected to Supabase project: ${supabaseUrl}`);
});
