import React from 'react';
import { Wheel } from './wheel';

interface CryptPanelProps {
  mode: 'enc' | 'dec';
  setMode: (mode: 'enc' | 'dec') => void;
  keyVal: number;
  setKeyVal: (val: number) => void;
  text: string;
  setText: (val: string) => void;
  output: string;
  copied: boolean;
  onCopy: () => void;
}

export function CryptPanel({
  mode,
  setMode,
  keyVal,
  setKeyVal,
  text,
  setText,
  output,
  copied,
  onCopy,
}: CryptPanelProps) {
  const isEncrypt = mode === 'enc';

  const handleKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const parsed = parseInt(e.target.value, 10) || 1;
    setKeyVal(Math.min(25, Math.max(1, parsed)));
  };

  return (
    <section className="panel active reveal">
      {/* Mode Switcher */}
      <div className="toggle">
        <button
          type="button"
          aria-pressed={isEncrypt}
          onClick={() => setMode('enc')}
        >
          Mode Enkripsi
        </button>
        <button
          type="button"
          aria-pressed={!isEncrypt}
          onClick={() => setMode('dec')}
        >
          Mode Dekripsi
        </button>
      </div>

      {/* Wheel & Key Controls */}
      <div className="keyzone">
        <Wheel n={keyVal} enc={isEncrypt} />

        <div className="key">
          <label className="lbl" htmlFor="keyRange">
            Key (n)
          </label>
          <input
            id="keyRange"
            type="range"
            min="1"
            max="25"
            value={keyVal}
            onChange={(e) => setKeyVal(Number(e.target.value))}
          />
          <input
            type="number"
            min="1"
            max="25"
            value={keyVal}
            aria-label="Nilai key"
            onChange={handleKeyChange}
          />
        </div>
      </div>

      {/* Input / Output Textareas */}
      <div className="grid2">
        <div>
          <label className="lbl" htmlFor="inText">
            {isEncrypt ? 'Plaintext' : 'Ciphertext'}
          </label>
          <textarea
            id="inText"
            spellCheck={false}
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
        </div>

        <div className="outbox">
          <label className="lbl" htmlFor="outText">
            {isEncrypt ? 'Ciphertext' : 'Plaintext'}
          </label>
          <textarea
            id="outText"
            readOnly
            spellCheck={false}
            value={output}
          />
          <button
            type="button"
            className="copy"
            onClick={onCopy}
          >
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
      </div>
    </section>
  );
}
