import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiPlus, FiEye, FiEdit2, FiTrash2, FiGlobe, FiCopy, FiSmartphone } from 'react-icons/fi';
import { QRCodeCanvas } from 'qrcode.react';
import { getMyInvitations, deleteInvitation, publishInvitation } from '../api';
import './Dashboard.css';

const BASE_URL = import.meta.env.VITE_PUBLIC_URL || window.location.origin;

export default function Dashboard() {
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [qrInv, setQrInv] = useState(null);
  const [qrTarget, setQrTarget] = useState('groom');
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return navigate('/login');
    loadInvitations();
  }, []);

  const loadInvitations = async () => {
    try {
      const res = await getMyInvitations();
      setInvitations(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Jeni të sigurt që doni ta fshini këtë ftesë?')) return;
    try {
      await deleteInvitation(id);
      loadInvitations();
    } catch (err) {
      console.error(err);
    }
  };

  const handlePublish = async (id, current) => {
    try {
      await publishInvitation(id, !current);
      loadInvitations();
    } catch (err) {
      console.error(err);
    }
  };

  const copyLink = (slug) => {
    navigator.clipboard.writeText(`${BASE_URL}/invitation/${slug}`);
    alert('Linku u kopjua!');
  };

  if (loading) return <div className="dashboard-loading">Duke ngarkuar...</div>;

  return (
    <div className="dashboard-page">
      <div className="container">
        <div className="dashboard-header">
          <div>
            <h1>Ftesat e Mia</h1>
            <p>Menaxho të gjitha ftesat e tua të dasmës</p>
          </div>
          <Link to="/create" className="btn btn-gold">
            <FiPlus /> Krijo Ftesë të Re
          </Link>
        </div>

        {invitations.length === 0 ? (
          <div className="dashboard-empty">
            <div className="empty-icon">💍</div>
            <h2>Nuk keni asnjë ftesë ende</h2>
            <p>Krijoni ftesën tuaj të parë të dasmës tani!</p>
            <Link to="/create" className="btn btn-gold">
              <FiPlus /> Krijo Ftesën e Parë
            </Link>
          </div>
        ) : (
          <div className="invitations-grid">
            {invitations.map((inv, i) => (
              <motion.div
                key={inv._id}
                className="invitation-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <div className="inv-card-header" style={{
                  background: `linear-gradient(135deg, ${inv.customPrimaryColor || '#D4AF37'}, ${inv.customSecondaryColor || '#FFF8E7'})`
                }}>
                  <div className="inv-card-names">
                    <h3>{inv.groomName}</h3>
                    <span className="inv-card-ampersand">&</span>
                    <h3>{inv.brideName}</h3>
                  </div>
                  <div className={`inv-card-status ${inv.isPublished ? 'published' : 'draft'}`}>
                    {inv.isPublished ? 'Publikuar' : 'Draft'}
                  </div>
                </div>
                <div className="inv-card-body">
                  <div className="inv-card-date">
                    {new Date(inv.weddingDate).toLocaleDateString('sq-AL', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </div>
                  <div className="inv-card-actions">
                    {inv.isPublished && (
                      <button className="action-btn" onClick={() => window.open(`/invitation/${inv.slug}`, '_blank')} title="Shiko">
                        <FiEye />
                      </button>
                    )}
                    <button className="action-btn" onClick={() => navigate(`/edit/${inv._id}`)} title="Ndrysho">
                      <FiEdit2 />
                    </button>
                    <button className="action-btn" onClick={() => handlePublish(inv._id, inv.isPublished)} title={inv.isPublished ? 'Çpubliko' : 'Publiko'}>
                      <FiGlobe />
                    </button>
                    {inv.isPublished && (
                      <button className="action-btn" onClick={() => copyLink(inv.slug)} title="Kopjo linkun">
                        <FiCopy />
                      </button>
                    )}
                    <button className="action-btn" onClick={() => { setQrInv(inv); setQrTarget(inv.groomPhone ? 'groom' : 'bride'); }} title="QR kod për WhatsApp">
                      <FiSmartphone />
                    </button>
                    <button className="action-btn action-delete" onClick={() => handleDelete(inv._id)} title="Fshij">
                      <FiTrash2 />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {qrInv && (
        <div className="qr-modal-overlay" onClick={() => setQrInv(null)}>
          <motion.div
            className="qr-modal"
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            onClick={e => e.stopPropagation()}
          >
            <button className="qr-modal-close" onClick={() => setQrInv(null)}>&times;</button>
            <h3 className="qr-modal-title">QR Kod për WhatsApp</h3>
            <p className="qr-modal-names">{qrInv.groomName} & {qrInv.brideName}</p>

            {qrInv.groomPhone && qrInv.bridePhone && (
              <div className="qr-modal-toggle">
                <button
                  className={`qr-modal-btn ${qrTarget === 'groom' ? 'active' : ''}`}
                  onClick={() => setQrTarget('groom')}
                  style={qrTarget === 'groom' ? { background: qrInv.customPrimaryColor || '#D4AF37', borderColor: qrInv.customPrimaryColor || '#D4AF37' } : {}}
                >
                  {qrInv.groomName}
                </button>
                <button
                  className={`qr-modal-btn ${qrTarget === 'bride' ? 'active' : ''}`}
                  onClick={() => setQrTarget('bride')}
                  style={qrTarget === 'bride' ? { background: qrInv.customPrimaryColor || '#D4AF37', borderColor: qrInv.customPrimaryColor || '#D4AF37' } : {}}
                >
                  {qrInv.brideName}
                </button>
              </div>
            )}

            <div className="qr-modal-code">
              <QRCodeCanvas
                value={`https://wa.me/${((qrTarget === 'groom' ? qrInv.groomPhone : qrInv.bridePhone) || '').replace(/[^0-9]/g, '')}`}
                size={200}
                bgColor="#ffffff"
                fgColor={qrInv.customPrimaryColor || '#D4AF37'}
                level="M"
              />
              <p className="qr-modal-label">Skano për të dërguar mesazh në WhatsApp</p>
              <p className="qr-modal-number">{qrTarget === 'groom' ? qrInv.groomPhone : qrInv.bridePhone}</p>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
