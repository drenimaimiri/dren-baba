import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiClock, FiHeart, FiSend, FiCopy, FiEye, FiEdit2 } from 'react-icons/fi';
import { getTemplates, createInvitation } from '../api';
import LocationPicker from '../components/LocationPicker';
import { playSound } from '../utils/playSound';
import '../components/LocationPicker.css';
import './CreateInvitation.css';

const BASE_URL = import.meta.env.VITE_PUBLIC_URL || window.location.origin;

export default function CreateInvitation() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [templates, setTemplates] = useState([]);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    templateId: searchParams.get('template') || '',
    groomName: '',
    brideName: '',
    phone: '',
    weddingDate: '',
    weddingTime: '',
    location: '',
    locationLat: '',
    locationLng: '',
    personalMessage: '',
    customPrimaryColor: '#D4AF37',
    customSecondaryColor: '#FFF8E7',
    customFont: 'Georgia',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(null);

  const goToStep = (nextStep) => {
    setError('');
    setStep(nextStep);
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return navigate('/login');
    getTemplates()
      .then(res => setTemplates(res.data))
      .catch(() => setError('Templates nuk mund të ngarkoheshin. Kontrolloni lidhjen me serverin.'));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleLocationChange = (lat, lng, address) => {
    setForm(prev => ({
      ...prev,
      locationLat: String(lat),
      locationLng: String(lng),
      location: address || prev.location,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    playSound();
    setLoading(true);
    try {
      const fd = new FormData();
      Object.keys(form).forEach(key => {
        if (key === 'phone') {
          fd.append('groomPhone', form[key]);
        } else {
          fd.append(key, form[key]);
        }
      });
      fd.append('isPublished', 'false');

      const res = await createInvitation(fd);
      setSuccess(res.data);
    } catch (err) {
      alert('Error: ' + (err.response?.data?.error || 'Something went wrong'));
    } finally {
      setLoading(false);
    }
  };

  const selectedTemplate = templates.find(t => t._id === form.templateId);

  return (
    <div className="create-page">
      <div className="container">
        <div className="create-header">
          <h1>Krijo Ftesën Tënde</h1>
          <p>Personalizo çdo detaj për ftesën perfekte</p>
        </div>

        <div className="create-steps">
          <div className={`step ${step >= 1 ? 'active' : ''}`}>
            <div className="step-num">1</div>
            <span>Templati</span>
          </div>
          <div className={`step ${step >= 2 ? 'active' : ''}`}>
            <div className="step-num">2</div>
            <span>Detajet</span>
          </div>
          <div className={`step ${step >= 3 ? 'active' : ''}`}>
            <div className="step-num">3</div>
            <span>Dizajni</span>
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
              <h2 className="step-title">Zgjidhni një Template</h2>
              <div className="template-select-grid">
                {templates.map(t => (
                  <div
                    key={t._id}
                    className={`template-select-card ${form.templateId === t._id ? 'selected' : ''}`}
                    onClick={() => setForm(prev => ({ ...prev, templateId: t._id }))}
                  >
                    <div className="template-select-preview" style={{
                      background: `linear-gradient(135deg, ${t.secondaryColor}, white)`,
                      borderColor: form.templateId === t._id ? t.primaryColor : '#e0e0e0'
                    }}>
                      <div className="template-mini-ring" style={{ borderColor: t.primaryColor }} />
                      <div className="template-mini-names" style={{ color: t.primaryColor, fontFamily: t.font }}>
                        {t.name}
                      </div>
                    </div>
                    <div className="template-select-info">
                      <h4>{t.name}</h4>
                      <p>{t.description}</p>
                      <span className="template-style-badge" style={{ background: t.primaryColor + '20', color: t.primaryColor }}>
                        {t.style}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="step-buttons">
                <button type="button" className="btn btn-gold" onClick={() => goToStep(2)} disabled={!form.templateId}>
                  Vazhdo <FiHeart />
                </button>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
              <h2 className="step-title">Detajet e Dasmës</h2>
              <div className="create-form">
                <div className="form-row">
                  <div className="form-group">
                    <label>Emri i Dhëndrit</label>
                    <input type="text" name="groomName" value={form.groomName} onChange={handleChange} required placeholder="Shkruaj emrin e dhëndrit" />
                  </div>
                  <div className="form-group">
                    <label>Emri i Nuses</label>
                    <input type="text" name="brideName" value={form.brideName} onChange={handleChange} required placeholder="Shkruaj emrin e nuses" />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label><FiClock /> Data e Dasmës</label>
                    <input type="date" name="weddingDate" value={form.weddingDate} onChange={handleChange} required />
                  </div>
                  <div className="form-group">
                    <label><FiClock /> Ora</label>
                    <input type="time" name="weddingTime" value={form.weddingTime} onChange={handleChange} required />
                  </div>
                </div>
                <div className="form-group">
                  <label>Numri i Telefonit për Konfirmim</label>
                  <input type="tel" name="phone" value={form.phone} onChange={handleChange} placeholder="+383 4X XXX XXX" />
                </div>

                <LocationPicker
                  lat={form.locationLat}
                  lng={form.locationLng}
                  onLocationChange={handleLocationChange}
                />

                <div className="form-group">
                  <label>Adresa e Lokacionit</label>
                  <input type="text" name="location" value={form.location} onChange={handleChange} required placeholder="Emri i vendit dhe adresa" />
                </div>
                <div className="form-group">
                  <label>Mesazhi Personal</label>
                  <textarea name="personalMessage" value={form.personalMessage} onChange={handleChange} placeholder="Shkruaj një mesazh të bukur për të ftuarit..." />
                </div>
              </div>
              <div className="step-buttons">
                <button type="button" className="btn btn-outline" onClick={() => goToStep(1)}>Prapa</button>
                <button type="button" className="btn btn-gold" onClick={() => goToStep(3)}>Vazhdo <FiHeart /></button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
              <h2 className="step-title">Personalizo Dizajnin</h2>
              <div className="design-customizer">
                <div className="design-form">
                  <div className="form-group">
                    <label>Ngjyra Kryesore (Ari)</label>
                    <div className="color-input-group">
                      <input type="color" name="customPrimaryColor" value={form.customPrimaryColor} onChange={handleChange} />
                      <input type="text" name="customPrimaryColor" value={form.customPrimaryColor} onChange={handleChange} />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Ngjyra Dytësore</label>
                    <div className="color-input-group">
                      <input type="color" name="customSecondaryColor" value={form.customSecondaryColor} onChange={handleChange} />
                      <input type="text" name="customSecondaryColor" value={form.customSecondaryColor} onChange={handleChange} />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Fonti</label>
                    <select name="customFont" value={form.customFont} onChange={handleChange}>
                      <option value="Georgia">Georgia</option>
                      <option value="Playfair Display">Playfair Display</option>
                      <option value="Great Vibes">Great Vibes</option>
                      <option value="Lora">Lora</option>
                    </select>
                  </div>
                </div>

                <div className="design-preview-box" style={{
                  fontFamily: form.customFont,
                  background: `linear-gradient(135deg, ${form.customSecondaryColor}, white)`
                }}>
                  <div className="preview-ornament" style={{ color: form.customPrimaryColor }}>✦</div>
                  <div className="preview-couple">
                    <span>{form.groomName || 'Dhëndri'}</span>
                    <span style={{ color: form.customPrimaryColor }}>❤</span>
                    <span>{form.brideName || 'Nusja'}</span>
                  </div>
                  {form.weddingDate && <div className="preview-date">{new Date(form.weddingDate).toLocaleDateString('sq-AL')}</div>}
                  {form.location && <div className="preview-location">{form.location}</div>}
                  {form.personalMessage && <div className="preview-message">"{form.personalMessage}"</div>}
                  <div className="preview-ornament" style={{ color: form.customPrimaryColor }}>✦</div>
                </div>
              </div>

              <div className="step-buttons">
                <button type="button" className="btn btn-outline" onClick={() => goToStep(2)}>Prapa</button>
                <button type="submit" className="btn btn-gold" disabled={loading}>
                  {loading ? 'Duke krijuar...' : <><FiSend /> Krijo Ftesën</>}
                </button>
              </div>
            </motion.div>
          )}
        </form>

        <AnimatePresence>
          {success && (
            <motion.div
              className="success-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="success-modal"
                initial={{ opacity: 0, scale: 0.8, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: 30 }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              >
                <div className="success-icon">💍</div>
                <h2>Ftesa u krijua me sukses!</h2>
                <p>Linku i ftesës suaj:</p>
                <div className="success-link-box">
                  <input
                    type="text"
                    readOnly
                    value={`${BASE_URL}/invitation/${success.slug}`}
                    className="success-link-input"
                  />
                  <button
                    className="success-copy-btn"
                    onClick={() => {
                      navigator.clipboard.writeText(`${BASE_URL}/invitation/${success.slug}`);
                      alert('Linku u kopjua!');
                    }}
                    title="Kopjo linkun"
                  >
                    <FiCopy />
                  </button>
                </div>
                <div className="success-actions">
                  <button
                    className="btn btn-gold"
                    onClick={() => window.open(`/invitation/${success.slug}`, '_blank')}
                  >
                    <FiEye /> Shiko Ftesën
                  </button>
                  <button
                    className="btn btn-outline"
                    onClick={() => navigate(`/edit/${success._id}`)}
                  >
                    <FiEdit2 /> Ndrysho Ftesën
                  </button>
                  <button
                    className="btn btn-outline"
                    onClick={() => navigate('/dashboard')}
                  >
                    Shko në Dashboard
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
