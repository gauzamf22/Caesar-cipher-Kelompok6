import React from 'react';

const MEMBERS = [
  '555306_Gradient',
  '555851_Gauza',
  '561611_Nidya',
  '564999_Aziz',
  '568048_Sadhu',
];

export function Footer() {
  return (
    <footer className="team">
      <div className="team-h">
        <div className="team-chip">KELOMPOK 6 · Kriptografi Dan Keamanan Informasi</div>
      </div>
      <div className="members">
        {MEMBERS.map((member) => (
          <div className="member" key={member}>
            <span>{member}</span>
          </div>
        ))}
      </div>
    </footer>
  );
}

