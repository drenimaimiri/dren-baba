import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { QRCodeCanvas } from 'qrcode.react';
import { FiSmartphone, FiDownload, FiCopy } from 'react-icons/fi';
import './CreateQR.css';

export default function CreateQR() {
  const [phone, setPhone] = useState('');
  const [label, setLabel] = useState('');
  const [generated, setGenerated] = useState(false);
  const qrRef = useRef(null);

  const cleanNumber = phone.replace(/[^0-9]/g, '');
  const waLink = `https://wa.me/${cleanNumber}`;

  const handleGenerate = (e) => {
    e.preventDefault();
    if (!cleanNumber) return;
    setGenerated(true);
  };

  const downloadQR = () => {
    const canvas = qrRef.current.querySelector('canvas');
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `whatsapp-qr-${cleanNumber}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const copyLink = () => {
    navigator.clipboard.writeText(waLink);
    alert('Linku u kopjua!');
  };

  return (
    <div className="createqr-page">
      <div className="container">
        <motion.div
          className="createqr-card"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="createqr-header">
            <FiSmartphone className="createqr-icon" />
            <h1>Krijo QR Kod për WhatsApp</h1>
            <p>Shkruaj numrin e telefonit dhe gjenero një QR kod që të çon direkt në WhatsApp</p>
          </div>

          <form onSubmit={handleGenerate} className="createqr-form">
            <div className="createqr-input-group">
              <label>Numri i Telefonit</label>
              <input
                type="tel"
                value={phone}
                onChange={e => { setPhone(e.target.value); setGenerated(false); }}
                placeholder="+383 4X XXX XXX"
                required
              />
            </div>
            <div className="createqr-input-group">
              <label>Emërtimi (opsional)</label>
              <input
                type="text"
                value={label}
                onChange={e => setLabel(e.target.value)}
                placeholder="p.sh. Nusja, Dhëndri..."
              />
            </div>
            <button type="submit" className="btn btn-gold" disabled={!cleanNumber}>
              <FiSmartphone /> Gjenero QR Kod
            </button>
          </form>

          {generated && (
            <motion.div
              className="createqr-result"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring', damping: 20, stiffness: 250 }}
            >
              <div className="qr-result-divider" />
              <div className="createqr-code" ref={qrRef}>
                {label && <p className="createqr-label">{label}</p>}
                <QRCodeCanvas
                  value={waLink}
                  size={200}
                  bgColor="#ffffff"
                  fgColor="#D4AF37"
                  level="M"
                />
                <p className="createqr-number">{phone}</p>
              </div>
              <div className="createqr-actions">
                <button className="btn btn-gold" onClick={downloadQR}>
                  <FiDownload /> Shkarko
                </button>
                <button className="btn btn-outline" onClick={copyLink}>
                  <FiCopy /> Kopjo Linkun
                </button>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
