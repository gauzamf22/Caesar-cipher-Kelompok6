import React from 'react';
import type { BruteForceRow } from '@/lib/caesar';

interface BruteForcePanelProps {
  bf: string;
  setBf: (val: string) => void;
  bfRows: BruteForceRow[];
  onBruteForce: () => void;
  onSampleText: () => void;
}

export function BruteForcePanel({
  bf,
  setBf,
  bfRows,
  onBruteForce,
  onSampleText,
}: BruteForcePanelProps) {
  return (
    <section className="panel active reveal">
      <p className="hint">
        Caesar Cipher hanya punya 25 kemungkinan key, sehingga semua bisa dicoba dalam sekejap.
      </p>

      <label className="lbl" htmlFor="bfIn">
        Ciphertext
      </label>
      <textarea
        id="bfIn"
        value={bf}
        onChange={(e) => setBf(e.target.value)}
        placeholder="Tempel ciphertext di sini..."
      />

      <button
        type="button"
        className="link"
        onClick={onSampleText}
      >
        Isi contoh ciphertext
      </button>

      <button
        type="button"
        className="btn"
        onClick={onBruteForce}
      >
        Start Brute Force
      </button>

      {bfRows.length > 0 && (
        <div className="scroll">
          <table>
            <thead>
              <tr>
                <th>Shift</th>
                <th>Hasil dekripsi</th>
              </tr>
            </thead>
            <tbody>
              {bfRows.map((r) => (
                <tr key={r.k} className={r.best ? 'best' : ''}>
                  <td>{r.k}</td>
                  <td>
                    {r.text}
                    {r.best && <span className="badge">Paling mungkin</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
