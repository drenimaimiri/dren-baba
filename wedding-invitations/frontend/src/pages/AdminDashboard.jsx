import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiUsers, FiMail, FiGlobe, FiLayout, FiTrash2, FiBarChart2 } from 'react-icons/fi';
import { getAdminStats, getAdminUsers, deleteUser, getAllInvitations, getTemplates } from '../api';
import './AdminDashboard.css';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [invitations, setInvitations] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [tab, setTab] = useState('overview');
  const navigate = useNavigate();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    if (!user || user.role !== 'admin') return navigate('/');
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [statsRes, usersRes, invRes, tmplRes] = await Promise.all([
        getAdminStats(), getAdminUsers(), getAllInvitations(), getTemplates()
      ]);
      setStats(statsRes.data);
      setUsers(usersRes.data);
      setInvitations(invRes.data);
      setTemplates(tmplRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm('Delete this user and all their invitations?')) return;
    try {
      await deleteUser(id);
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  if (!stats) return <div className="dashboard-loading">Duke ngarkuar...</div>;

  return (
    <div className="admin-page">
      <div className="container">
        <div className="admin-header">
          <h1><FiBarChart2 /> Paneli i Adminit</h1>
        </div>

        <div className="admin-tabs">
          <button className={`admin-tab ${tab === 'overview' ? 'active' : ''}`} onClick={() => setTab('overview')}>Përmbledhje</button>
          <button className={`admin-tab ${tab === 'users' ? 'active' : ''}`} onClick={() => setTab('users')}>Përdoruesit</button>
          <button className={`admin-tab ${tab === 'invitations' ? 'active' : ''}`} onClick={() => setTab('invitations')}>Ftesat</button>
          <button className={`admin-tab ${tab === 'templates' ? 'active' : ''}`} onClick={() => setTab('templates')}>Template-t</button>
        </div>

        {tab === 'overview' && (
          <div className="admin-overview">
            <div className="stats-grid">
              {[
                { icon: <FiUsers />, label: 'Përdorues', value: stats.totalUsers, color: '#4caf50' },
                { icon: <FiMail />, label: 'Ftesa Gjithsej', value: stats.totalInvitations, color: '#2196f3' },
                { icon: <FiGlobe />, label: 'Të Publikuara', value: stats.publishedInvitations, color: '#ff9800' },
                { icon: <FiLayout />, label: 'Template-t', value: stats.totalTemplates, color: '#9c27b0' }
              ].map((s, i) => (
                <motion.div
                  key={i}
                  className="stat-card"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <div className="stat-icon" style={{ background: s.color + '20', color: s.color }}>{s.icon}</div>
                  <div className="stat-info">
                    <h3>{s.value}</h3>
                    <p>{s.label}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="admin-recent">
              <h3>Përdoruesit e Fundit</h3>
              <div className="admin-list">
                {stats.recentUsers?.map(u => (
                  <div key={u._id} className="admin-list-item">
                    <div className="admin-list-avatar">{u.name[0]}</div>
                    <div>
                      <strong>{u.name}</strong>
                      <p>{u.email}</p>
                    </div>
                    <span className={`admin-role-badge ${u.role}`}>{u.role}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {tab === 'users' && (
          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Emri</th>
                  <th>Email</th>
                  <th>Roli</th>
                  <th>Data</th>
                  <th>Veprime</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u._id}>
                    <td><strong>{u.name}</strong></td>
                    <td>{u.email}</td>
                    <td><span className={`admin-role-badge ${u.role}`}>{u.role}</span></td>
                    <td>{new Date(u.createdAt).toLocaleDateString('sq-AL')}</td>
                    <td>
                      {u.role !== 'admin' && (
                        <button className="action-btn action-delete" onClick={() => handleDeleteUser(u._id)}>
                          <FiTrash2 />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab === 'invitations' && (
          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Çifti</th>
                  <th>Përdoruesi</th>
                  <th>Data</th>
                  <th>Statusi</th>
                  <th>RSVP</th>
                </tr>
              </thead>
              <tbody>
                {invitations.map(inv => (
                  <tr key={inv._id}>
                    <td><strong>{inv.groomName} & {inv.brideName}</strong></td>
                    <td>{inv.user?.name || 'N/A'}</td>
                    <td>{new Date(inv.weddingDate).toLocaleDateString('sq-AL')}</td>
                    <td><span className={`status-badge ${inv.isPublished ? 'published' : 'draft'}`}>{inv.isPublished ? 'Publik' : 'Draft'}</span></td>
                    <td>{inv.rsvpList?.length || 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab === 'templates' && (
          <div className="admin-templates-grid">
            {templates.map(t => (
              <div key={t._id} className="admin-template-card" style={{ borderTop: `4px solid ${t.primaryColor}` }}>
                <h4>{t.name}</h4>
                <p>{t.description}</p>
                <div className="admin-template-meta">
                  <span style={{ background: t.primaryColor + '20', color: t.primaryColor }}>{t.style}</span>
                  <span style={{ fontFamily: t.font }}>{t.font}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
