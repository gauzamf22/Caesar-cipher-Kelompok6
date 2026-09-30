import React from 'react';

export function Header() {
  return (
    <header>
      <div className="chip">KELOMPOK 6 · KRIPTOGRAFI DAN KEAMANAN INFORMASI</div>
      <h1>Caesar Cipher Toolkit</h1>
      <div className="formula">
        <span>E(x) = (x + n) mod 26</span>
        <span>D(x) = (x − n) mod 26</span>
      </div>
    </header>
  );
}

