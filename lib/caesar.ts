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
  best: boolean;
}

export const COMMON_WORDS = [
  'the', 'and', 'is', 'are', 'of', 'to', 'in', 'that', 'it', 'for', 'you', 'with', 'this',
  'hello', 'world', 'secret', 'message',
  'yang', 'dan', 'di', 'ini', 'itu', 'dengan', 'untuk', 'dari', 'ke', 'pada', 'adalah', 'saya', 'kami',
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
 * Mencoba seluruh 25 kemungkinan pergeseran dan menentukan kemungkinan kata paling masuk akal.
 */
export function solveBruteForce(ciphertext: string): BruteForceRow[] {
  const trimmed = ciphertext.trim();
  if (!trimmed) return [];

  const rows = Array.from({ length: 25 }, (_, i) => ({
    k: i + 1,
    text: caesar(trimmed, -(i + 1)),
    best: false,
  }));

  const scores = rows.map((r) => {
    const words = r.text.toLowerCase().split(/[^a-z]+/).filter(Boolean);
    return words.filter((w) => COMMON_WORDS.includes(w)).length;
  });

  const maxScore = Math.max(...scores);

  return rows.map((r, i) => ({
    ...r,
    best: maxScore > 0 && scores[i] === maxScore,
  }));
}
