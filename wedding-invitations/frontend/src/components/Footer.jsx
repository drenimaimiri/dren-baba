import React from 'react';
import { FiHeart } from 'react-icons/fi';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-logo">
            <FiHeart style={{ color: 'var(--gold)' }} />
            <span>FtesaDasme</span>
          </div>
          <p>Bëje ditën tënde speciale me një ftesë të paharrueshme</p>
          <div className="footer-divider">✦ ✦ ✦</div>
          <p className="footer-copy">© {new Date().getFullYear()} FtesaDasme. Të gjitha të drejtat e rezervuara.</p>
        </div>
      </div>
    </footer>
  );
}
