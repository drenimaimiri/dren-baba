import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiHeart, FiMail, FiLock, FiUser } from 'react-icons/fi';
import { register } from '../api';
import './Auth.css';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await register(form);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <motion.div
        className="auth-card"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="auth-header">
          <FiHeart className="auth-icon" />
          <h2>Krijo Llogari</h2>
          <p>Filloni të krijoni ftesën tuaj të dasmës</p>
        </div>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label><FiUser /> Emri</label>
            <input type="text" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Emri juaj" />
          </div>
          <div className="form-group">
            <label><FiMail /> Email</label>
            <input type="email" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="your@email.com" />
          </div>
          <div className="form-group">
            <label><FiLock /> Fjalëkalimi</label>
            <input type="password" required value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="Min 6 karaktere" minLength={6} />
          </div>
          <button type="submit" className="btn btn-gold auth-btn" disabled={loading}>
            {loading ? 'Duke u regjistruar...' : 'Regjistrohu'}
          </button>
        </form>

        <p className="auth-footer">
          Keni llogari? <Link to="/login">Hyni</Link>
        </p>
      </motion.div>
    </div>
  );
}
