'use client';

import React, { useEffect, useMemo, useState } from 'react';
import './cipher.css';

import {
  caesar,
  diagnose,
  solveBruteForce,
  TEST_CASES,
  type BruteForceRow,
  type TestResult,
} from '@/lib/caesar';

import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { CryptPanel } from '@/components/crypt-panel';
import { BruteForcePanel } from '@/components/brute-force-panel';
import { TestCasesPanel } from '@/components/test-cases-panel';

type TabType = 'crypt' | 'brute' | 'tests';

const NAV_TABS: [TabType, string][] = [
  ['crypt', 'Enkripsi & Dekripsi'],
  ['brute', 'Brute Force'],
  ['tests', 'Test Cases'],
];

export default function Page() {
  // Navigation & Mode
  const [activeTab, setActiveTab] = useState<TabType>('crypt');
  const [mode, setMode] = useState<'enc' | 'dec'>('enc');

  // Encryption & Decryption state
  const [text, setText] = useState('Hello, World! 123');
  const [shiftKey, setShiftKey] = useState(1);
  const [isCopied, setIsCopied] = useState(false);

  // Brute Force state
  const [bfInput, setBfInput] = useState('');
  const [bfRows, setBfRows] = useState<BruteForceRow[]>([]);

  // Test Cases state
  const [simulateBug, setSimulateBug] = useState(false);
  const [testResults, setTestResults] = useState<TestResult[]>(
    Array(TEST_CASES.length).fill(null)
  );
  const [openCases, setOpenCases] = useState<boolean[]>(
    Array(TEST_CASES.length).fill(false)
  );

  // Computed cipher output
  const output = useMemo(() => {
    return caesar(text, mode === 'enc' ? shiftKey : -shiftKey);
  }, [text, mode, shiftKey]);

  // Observer for reveal animations on tab change
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
          }
        });
      },
      { threshold: 0.12 }
    );

    document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [activeTab, testResults.length]);

  // Copy handler
  const handleCopy = () => {
    if (!navigator.clipboard) return;
    navigator.clipboard.writeText(output);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 1400);
  };

  // Brute force solver handler
  const handleBruteForce = (inputStr?: string) => {
    const query = inputStr !== undefined ? inputStr : bfInput;
    const resolvedRows = solveBruteForce(query);
    setBfRows(resolvedRows);
  };

  const handleSampleBruteForce = () => {
    const sample = 'WKLV LV D VHFUHW PHVVDJH';
    setBfInput(sample);
    setTimeout(() => handleBruteForce(sample), 0);
  };

  // Test cases handlers
  const handleRunTest = (i: number) => {
    const test = TEST_CASES[i];
    const execShift = (s: string, n: number) => caesar(s, n, simulateBug);

    let actual = '';
    if (test.op === 'enc') {
      actual = execShift(test.input, test.key);
    } else if (test.op === 'dec') {
      actual = execShift(test.input, -test.key);
    } else {
      // round-trip
      actual = execShift(execShift(test.input, test.key), -test.key);
    }

    const isPassed = actual === test.expected;
    const diagnosis = isPassed ? '' : diagnose(test, actual);

    setTestResults((prev) => {
      const next = [...prev];
      next[i] = { actual, ok: isPassed, why: diagnosis };
      return next;
    });

    setOpenCases((prev) => {
      const next = [...prev];
      next[i] = true;
      return next;
    });
  };

  const handleResetTest = (i: number) => {
    setTestResults((prev) =>
      prev.map((result, index) => (index === i ? null : result))
    );
  };

  const handleToggleOpenCase = (i: number) => {
    setOpenCases((prev) => {
      const next = [...prev];
      next[i] = !next[i];
      return next;
    });
  };

  const handleRunAllTests = () => {
    setTestResults(Array(TEST_CASES.length).fill(null));
    setOpenCases(Array(TEST_CASES.length).fill(false));

    TEST_CASES.forEach((_, i) => {
      setTimeout(() => handleRunTest(i), i * 360);
    });
  };

  const handleResetAllTests = () => {
    setTestResults(Array(TEST_CASES.length).fill(null));
    setOpenCases(Array(TEST_CASES.length).fill(false));
  };

  // Test summary computation
  const summary = useMemo(() => {
    const completed = testResults.filter(Boolean) as NonNullable<TestResult>[];
    const passedCount = completed.filter((r) => r.ok).length;
    return { done: completed.length, pass: passedCount };
  }, [testResults]);

  return (
    <main className="wrap">
      <Header />

      {/* Main Tabs Navigation */}
      <div className="tabs" role="tablist">
        {NAV_TABS.map(([id, label]) => (
          <button
            key={id}
            type="button"
            className="tab"
            role="tab"
            aria-selected={activeTab === id}
            onClick={() => setActiveTab(id)}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Tab Panels */}
      {activeTab === 'crypt' && (
        <CryptPanel
          mode={mode}
          setMode={setMode}
          keyVal={shiftKey}
          setKeyVal={setShiftKey}
          text={text}
          setText={setText}
          output={output}
          copied={isCopied}
          onCopy={handleCopy}
        />
      )}

      {activeTab === 'brute' && (
        <BruteForcePanel
          bf={bfInput}
          setBf={setBfInput}
          bfRows={bfRows}
          onBruteForce={() => handleBruteForce()}
          onSampleText={handleSampleBruteForce}
        />
      )}

      {activeTab === 'tests' && (
        <TestCasesPanel
          tests={TEST_CASES}
          results={testResults}
          open={openCases}
          bug={simulateBug}
          setBug={setSimulateBug}
          summary={summary}
          onRunAll={handleRunAllTests}
          onResetAll={handleResetAllTests}
          onToggleOpen={handleToggleOpenCase}
          onRunTest={handleRunTest}
          onResetTest={handleResetTest}
        />
      )}

      <Footer />
    </main>
  );
}
