import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

// Try direct URL first, then pooler URL
const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;

console.log('Connecting to PostgreSQL Supabase database...');

const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false }
});

async function migrate() {
  const client = await pool.connect();
  try {
    console.log('Connected successfully! Creating brute_force_history table...');

    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS brute_force_history (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        ciphertext TEXT NOT NULL,
        best_shift INTEGER NOT NULL,
        best_text TEXT NOT NULL,
        best_score INTEGER DEFAULT 0,
        results JSONB NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      ALTER TABLE brute_force_history ENABLE ROW LEVEL SECURITY;

      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_policies WHERE tablename = 'brute_force_history' AND policyname = 'Allow public read'
        ) THEN
          CREATE POLICY "Allow public read" ON brute_force_history FOR SELECT USING (true);
        END IF;

        IF NOT EXISTS (
          SELECT 1 FROM pg_policies WHERE tablename = 'brute_force_history' AND policyname = 'Allow public insert'
        ) THEN
          CREATE POLICY "Allow public insert" ON brute_force_history FOR INSERT WITH CHECK (true);
        END IF;
      END
      $$;
    `;

    await client.query(createTableQuery);
    console.log('Table brute_force_history and RLS policies created/verified successfully!');

    // Test a quick select
    const testRes = await client.query('SELECT COUNT(*) FROM brute_force_history;');
    console.log('Current rows in brute_force_history:', testRes.rows[0].count);

  } catch (err) {
    console.error('Migration error:', err);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

migrate();
