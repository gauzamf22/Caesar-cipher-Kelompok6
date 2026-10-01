import { DICTIONARY_SET } from './dictionary';

export type TestOperation = 'enc' | 'dec' | 'round';

export interface TestCase {
  name: string;
  op: TestOperation;
  input: string;
  key: number;
  expected: string;
}

export type TestResult = {
  actual: string;
  ok: boolean;
  why: string;
} | null;

export interface BruteForceRow {
  k: number;
  text: string;
  score?: number;
  best: boolean;
}

// Blended English + Indonesian letter weights for statistical language detection
const LETTER_WEIGHTS: Record<string, number> = {
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

export const TEST_CASES: TestCase[] = [
  { name: 'Huruf besar', op: 'enc', input: 'HELLO WORLD', key: 3, expected: 'KHOOR ZRUOG' },
  { name: 'Huruf kecil', op: 'enc', input: 'hello world', key: 3, expected: 'khoor zruog' },
  { name: 'Huruf campuran + tanda baca', op: 'enc', input: 'Hello, World!', key: 5, expected: 'Mjqqt, Btwqi!' },
  { name: 'Angka & simbol tidak berubah', op: 'enc', input: 'Kriptografi 2024 #UTS!', key: 7, expected: 'Rypwavnyhmp 2024 #BAZ!' },
  { name: 'Wrap-around Z → A (enkripsi)', op: 'enc', input: 'XYZ xyz', key: 3, expected: 'ABC abc' },
  { name: 'Wrap-around A → Z (dekripsi)', op: 'dec', input: 'ABC abc', key: 3, expected: 'XYZ xyz' },
  { name: 'Key 13 (ROT13)', op: 'enc', input: 'Caesar Cipher', key: 13, expected: 'Pnrfne Pvcure' },
  { name: 'Round-trip enkripsi lalu dekripsi', op: 'round', input: 'Attack at Dawn!', key: 17, expected: 'Attack at Dawn!' },
];

/**
 * Menggeser huruf teks berdasarkan shift tertentu.
 * Jika buggy=true, mod 26 diabaikan untuk mensimulasikan kegagalan wrap-around.
 */
export function caesar(text: string, shift: number, buggy = false): string {
  return text.replace(/[a-zA-Z]/g, (char) => {
    const base = char <= 'Z' ? 65 : 97;
    const x = char.charCodeAt(0) - base;
    const shiftedCode = buggy
      ? x + shift
      : (((x + shift) % 26) + 26) % 26;

    return String.fromCharCode(shiftedCode + base);
  });
}

/**
 * Menghasilkan pesan diagnostik ketika hasil pengujian tidak sesuai dengan yang diharapkan.
 */
export function diagnose(t: TestCase, actual: string): string {
  const i = [...t.expected].findIndex((c, n) => c !== actual[n]);
  if (actual.length !== t.expected.length) {
    return `Panjang output ${actual.length} berbeda dari yang diharapkan (${t.expected.length}). Ada karakter yang hilang atau bertambah.`;
  }

  const inCh = t.input[i];
  const n = t.op === 'dec' ? -t.key : t.key;
  const x = inCh.charCodeAt(0) - (inCh <= 'Z' ? 65 : 97);
  const r = (((x + n) % 26) + 26) % 26;

  return `Beda pertama di posisi ${i + 1}: diharapkan '${t.expected[i]}', hasil '${actual[i]}'. Untuk '${inCh}' indeks x = ${x}, dan (x ${n < 0 ? '−' : '+'} ${Math.abs(n)}) mod 26 = ${r}. Hasil keluar dari rentang huruf, tanda bahwa indeks tidak di-wrap dengan mod 26.`;
}

/**
 * Multi-tier linguistic score for decrypted text
 * Mengombinasikan pencocokan kamus luas Bahasa Indonesia & English (1300+ kata),
 * rasio vokal, bobot frekuensi huruf alami, serta penalti kluster konsonan aneh.
 */
export function scoreDecryption(text: string): number {
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
 * Mencoba seluruh 25 kemungkinan pergeseran dan menentukan kemungkinan teks terang paling masuk akal.
 */
export function solveBruteForce(ciphertext: string): BruteForceRow[] {
  const trimmed = ciphertext.trim();
  if (!trimmed) return [];

  const rows = Array.from({ length: 25 }, (_, i) => {
    const shift = i + 1;
    const decrypted = caesar(trimmed, -shift);
    return {
      k: shift,
      text: decrypted,
      score: scoreDecryption(decrypted),
      best: false,
    };
  });

  const maxScore = Math.max(...rows.map((r) => r.score ?? -9999));

  return rows.map((r) => ({
    k: r.k,
    text: r.text,
    score: r.score,
    best: (r.score ?? -9999) === maxScore,
  }));
}
