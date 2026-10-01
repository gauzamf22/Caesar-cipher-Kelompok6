import React from 'react';
import type { BruteForceRow } from '@/lib/caesar';

export interface BruteForceHistoryItem {
  id: string;
  ciphertext: string;
  best_shift: number;
  best_text: string;
  best_score: number;
  results: BruteForceRow[];
  created_at: string;
}

interface BruteForcePanelProps {
  bf: string;
  setBf: (val: string) => void;
  bfRows: BruteForceRow[];
  loading: boolean;
  error: string | null;
  history: BruteForceHistoryItem[];
  historyLoading?: boolean;
  onClearError: () => void;
  onBruteForce: () => void;
  onSampleText: () => void;
  onSelectHistory: (item: BruteForceHistoryItem) => void;
}

export function BruteForcePanel({
  bf,
  setBf,
  bfRows,
  loading,
  error,
  history,
  historyLoading,
  onClearError,
  onBruteForce,
  onSampleText,
  onSelectHistory,
}: BruteForcePanelProps) {
  return (
    <section className="panel active reveal">
      <p className="hint">
        Caesar Cipher memiliki 25 kemungkinan key (k = 1 s.d. 25). Semua 25 kemungkinan diuji secara lengkap.
      </p>

      {error && (
        <div className="alert-box error" role="alert">
          <span>{error}</span>
          <button
            type="button"
            className="alert-close"
            onClick={onClearError}
            aria-label="Tutup notifikasi error"
          >
            ✕
          </button>
        </div>
      )}

      <label className="lbl" htmlFor="bfIn">
        Ciphertext
      </label>
      <textarea
        id="bfIn"
        value={bf}
        onChange={(e) => {
          setBf(e.target.value);
          if (error) onClearError();
        }}
        disabled={loading}
        placeholder="Tempel ciphertext di sini..."
      />

      <div style={{ display: 'flex', gap: '12px', alignItems: 'center', margin: '8px 0 16px' }}>
        <button
          type="button"
          className="link"
          onClick={onSampleText}
          disabled={loading}
        >
          Isi contoh ciphertext
        </button>
      </div>

      <button
        type="button"
        className="btn"
        onClick={onBruteForce}
        disabled={loading}
      >
        {loading ? (
          <span className="btn-loading">
            <span className="spinner" />
            Memproses brute force...
          </span>
        ) : (
          'Start Brute Force'
        )}
      </button>

      {history.length > 0 && (
        <div className="history-sec">
          <div className="history-title">
            <span>Riwayat Brute Force</span>
            {historyLoading && <span className="spinner" style={{ width: 12, height: 12 }} />}
          </div>
          <div className="history-pills">
            {history.map((item) => (
              <button
                key={item.id}
                type="button"
                className="history-pill"
                onClick={() => onSelectHistory(item)}
                title={`Kunci terbaik: Shift ${item.best_shift} - "${item.best_text}"`}
              >
                <span className="pill-key">K={item.best_shift}</span>
                <span className="pill-text">{item.ciphertext}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {bfRows.length > 0 && (
        <div className="scroll" style={{ marginTop: '20px' }}>
          <table>
            <thead>
              <tr>
                <th style={{ width: '90px' }}>Key (k)</th>
                <th>Hasil Dekripsi</th>
              </tr>
            </thead>
            <tbody>
              {bfRows.map((r) => (
                <tr key={r.k} className={r.best ? 'best' : ''}>
                  <td style={{ fontWeight: 600 }}>{r.k}</td>
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
