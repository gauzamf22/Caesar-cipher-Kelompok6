import React from 'react';
import type { TestCase, TestResult } from '@/lib/caesar';

interface TestCasesPanelProps {
  tests: TestCase[];
  results: TestResult[];
  open: boolean[];
  bug: boolean;
  setBug: (val: boolean) => void;
  summary: { done: number; pass: number };
  onRunAll: () => void;
  onResetAll: () => void;
  onToggleOpen: (index: number) => void;
  onRunTest: (index: number) => void;
  onResetTest: (index: number) => void;
}

export function TestCasesPanel({
  tests,
  results,
  open,
  bug,
  setBug,
  summary,
  onRunAll,
  onResetAll,
  onToggleOpen,
  onRunTest,
  onResetTest,
}: TestCasesPanelProps) {
  const getSummaryBadge = () => {
    if (!summary.done) {
      return <span className="badge idle">BELUM ADA HASIL</span>;
    }
    if (summary.pass === summary.done && summary.done === tests.length) {
      return <span className="badge pass">ALL PASSED</span>;
    }
    if (summary.pass === summary.done) {
      return <span className="badge pass">{`${summary.pass} / ${summary.done} PASSED`}</span>;
    }
    return <span className="badge fail">{`${summary.pass} / ${summary.done} PASSED`}</span>;
  };

  return (
    <section className="panel active reveal">
      <p className="hint">
        Jalankan test case satu per satu, atau semuanya sekaligus. Aktifkan simulasi bug untuk melihat bagaimana test yang gagal dijelaskan.
      </p>

      {/* Action Toolbar */}
      <div className="bar">
        <button
          type="button"
          className="btn sm"
          onClick={onRunAll}
        >
          Run All
        </button>
        <button
          type="button"
          className="btn sm ghost"
          onClick={onResetAll}
        >
          Reset
        </button>
        <label className="bug">
          <input
            type="checkbox"
            checked={bug}
            onChange={(e) => setBug(e.target.checked)}
          />
          Simulasikan bug (tanpa mod 26)
        </label>
      </div>

      {/* Summary Indicator */}
      <div className="summary">
        {getSummaryBadge()}
        <span>
          {summary.done} dari {tests.length} test case sudah dijalankan
        </span>
      </div>

      {/* Test Cases Accordion List */}
      <div>
        {tests.map((test, i) => {
          const res = results[i];
          const isOpen = open[i];

          let badgeClass = 'idle';
          let badgeText = 'NOT RUN';
          if (res) {
            badgeClass = res.ok ? 'pass' : 'fail';
            badgeText = res.ok ? 'PASSED' : 'FAILED';
          }

          const opLabel =
            test.op === 'enc'
              ? 'Enkripsi'
              : test.op === 'dec'
              ? 'Dekripsi'
              : 'Enkripsi → Dekripsi';

          return (
            <div className={`acc ${isOpen ? 'open' : ''}`} key={test.name}>
              <div className="acc-h">
                <button
                  type="button"
                  className="acc-t"
                  onClick={() => onToggleOpen(i)}
                >
                  <span>{test.name}</span>
                  <span className={`badge ${badgeClass}`}>{badgeText}</span>
                </button>

                <button
                  type="button"
                  className="runb"
                  onClick={() => (res ? onResetTest(i) : onRunTest(i))}
                >
                  {res ? 'Reset' : 'Run'}
                </button>
              </div>

              {isOpen && (
                <div className="acc-b">
                  <div className="row">
                    <b>Operasi</b>
                    <span>{opLabel}</span>
                  </div>
                  <div className="row">
                    <b>Input Text</b>
                    <span>{test.input}</span>
                  </div>
                  <div className="row">
                    <b>Key</b>
                    <span>{test.key}</span>
                  </div>
                  <div className="row">
                    <b>Expected</b>
                    <span>{test.expected}</span>
                  </div>
                  <div className="row">
                    <b>Actual</b>
                    <span>{res?.actual ?? '(belum dijalankan)'}</span>
                  </div>

                  {res && !res.ok && <div className="why">{res.why}</div>}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
