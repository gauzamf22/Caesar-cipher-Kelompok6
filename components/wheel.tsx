import React from 'react';

interface WheelProps {
  n: number;
  enc: boolean;
}

const LETTERS = Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i));
const round = (val: number) => Math.round(val * 1000) / 1000;

export function Wheel({ n, enc }: WheelProps) {
  // Huruf inner yang tepat berada di atas (sejajar dengan A)
  const topIdx = enc ? n % 26 : (26 - (n % 26)) % 26;

  return (
    <svg id="wheel" viewBox="0 0 220 220" role="img" aria-label="Lingkaran Caesar Cipher">
      <circle cx="110" cy="110" r="102" fill="#0A1128" stroke="#263566" />
      <circle cx="110" cy="110" r="80" fill="none" stroke="#263566" />
      <circle cx="110" cy="110" r="52" fill="none" stroke="#263566" />

      {/* Ring luar: plaintext */}
      {LETTERS.map((letter, i) => {
        const angle = (i * 360) / 26;
        const rad = (angle * Math.PI) / 180;
        const x = round(110 + 92 * Math.sin(rad));
        const y = round(110 - 92 * Math.cos(rad));
        const isA = i === 0;

        return (
          <text
            key={`outer-${letter}`}
            x={x}
            y={y}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={12}
            fontFamily="JetBrains Mono, monospace"
            fill={isA ? '#FFD700' : '#F4F6FB'}
            fontWeight={isA ? 700 : 400}
            transform={`rotate(${angle} ${x} ${y})`}
          >
            {letter}
          </text>
        );
      })}

      {/* Ring dalam: ciphertext, berputar sebesar n */}
      <g
        className="inner"
        style={{
          transform: `rotate(${enc ? (-n * 360) / 26 : (n * 360) / 26}deg)`,
        }}
      >
        {LETTERS.map((letter, i) => {
          const angle = (i * 360) / 26;
          const rad = (angle * Math.PI) / 180;
          const x = round(110 + 66 * Math.sin(rad));
          const y = round(110 - 66 * Math.cos(rad));
          const isTarget = i === topIdx;

          return (
            <text
              key={`inner-${letter}`}
              x={x}
              y={y}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={isTarget ? 13 : 11}
              fontFamily="JetBrains Mono, monospace"
              fill={isTarget ? '#FFD700' : '#8E9BC4'}
              fontWeight={isTarget ? 700 : 400}
              transform={`rotate(${angle} ${x} ${y})`}
            >
              {letter}
            </text>
          );
        })}
      </g>

      {/* Marker segitiga di bagian atas */}
      <polygon points="102,0 118,0 110,11" fill="#FFD700" />

      {/* Teks indikator tengah */}
      <text
        x="110"
        y="103"
        textAnchor="middle"
        fontSize={7}
        fontFamily="JetBrains Mono, monospace"
        fill="#8E9BC4"
      >
        {enc ? 'PLAIN → CIPHER' : 'CIPHER → PLAIN'}
      </text>
      <text
        x="110"
        y="120"
        textAnchor="middle"
        fontSize={15}
        fontWeight={700}
        fontFamily="JetBrains Mono, monospace"
        fill="#FFD700"
      >
        {`n = ${n}`}
      </text>
    </svg>
  );
}

