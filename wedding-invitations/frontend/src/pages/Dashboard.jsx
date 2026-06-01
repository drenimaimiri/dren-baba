import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiPlus, FiEye, FiEdit2, FiTrash2, FiGlobe, FiCopy } from 'react-icons/fi';
import { getMyInvitations, deleteInvitation, publishInvitation } from '../api';
import './Dashboard.css';

export default function Dashboard() {
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);
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
    navigator.clipboard.writeText(`${window.location.origin}/invitation/${slug}`);
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
    </div>
  );
}
