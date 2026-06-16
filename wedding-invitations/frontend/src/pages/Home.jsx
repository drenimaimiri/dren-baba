import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiHeart, FiArrowRight, FiStar, FiCamera, FiMapPin, FiClock } from 'react-icons/fi';
import { getTemplates } from '../api';
import './Home.css';

export default function Home() {
  const [templates, setTemplates] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    getTemplates().then(res => setTemplates(res.data)).catch(() => {});
  }, []);

  const user = JSON.parse(localStorage.getItem('user') || 'null');

  return (
    <div className="home">
      <section className="hero">
        <div className="hero-particles">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="particle" style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${3 + Math.random() * 4}s`
            }}>✦</div>
          ))}
        </div>
        <div className="container">
          <motion.div
            className="hero-content"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="hero-badge">Ftesa Dasme Online</span>
            <h1>Krijo ftesën perfekte për ditën tënde speciale</h1>
            <p>Zgjidh nga template-t tona elegante dhe personalizo çdo detaj për një ftesë unike dhe të paharrueshme.</p>
            <div className="hero-buttons">
              {user ? (
                <Link to="/create" className="btn btn-gold">
                  Krijo Ftesën Tënde <FiArrowRight />
                </Link>
              ) : (
                <>
                  <Link to="/register" className="btn btn-gold">
                    Filloni Tani <FiArrowRight />
                  </Link>
                  <Link to="/login" className="btn btn-outline">
                    Kam Llogari
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      <section className="features">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="section-title">Pse FtesaDasme?</h2>
            <p className="section-subtitle">Gjithçka që ju nevojitet për ftesën perfekte</p>
          </motion.div>
          <div className="features-grid">
            {[
              { icon: <FiStar />, title: 'Template Elegante', desc: 'Dizajne profesionale dhe moderne për çdo stil dasme' },
              { icon: <FiCamera />, title: 'Galeria Fotove', desc: 'Shtoni fotot tuaja më të bukura në ftesë' },
              { icon: <FiMapPin />, title: 'Lokacioni', desc: 'Vendosni lokacionin e dasmës' },
              { icon: <FiClock />, title: 'Countdown', desc: 'Numërimi mbrapsht automatik deri në ditën e madhe' }
            ].map((f, i) => (
              <motion.div
                key={i}
                className="feature-card"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                viewport={{ once: true }}
              >
                <div className="feature-icon">{f.icon}</div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="templates-section">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="section-title">Template-t Tona</h2>
            <p className="section-subtitle">Zgjidhni stilin që i përshtatet më së mbi historisë suaj</p>
          </motion.div>

          <div className="templates-grid">
            {templates.length === 0 ? (
              [1, 2, 3, 4].map((_, i) => (
                <div key={i} className="template-card skeleton">
                  <div className="template-preview" style={{ height: 300, background: '#eee' }} />
                </div>
              ))
            ) : (
              templates.map((template, i) => (
                <motion.div
                  key={template._id}
                  className="template-card"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1, duration: 0.5 }}
                  viewport={{ once: true }}
                  onClick={() => {
                    if (user) navigate(`/create?template=${template._id}`);
                    else navigate('/register');
                  }}
                >
                  <div className="template-preview" style={{
                    background: `linear-gradient(135deg, ${template.secondaryColor}, white)`
                  }}>
                    <div className="template-preview-content">
                      <div className="preview-ring" style={{ borderColor: template.primaryColor }} />
                      <div className="preview-hearts">
                        <FiHeart style={{ color: template.primaryColor }} />
                      </div>
                      <div className="preview-names" style={{ fontFamily: template.font, color: template.primaryColor }}>
                        {template.name}
                      </div>
                    </div>
                    <div className="template-overlay">
                      <span className="template-select-btn" style={{ background: template.primaryColor }}>
                        Zgjidhni Këtë Template
                      </span>
                    </div>
                  </div>
                  <div className="template-info">
                    <h3>{template.name}</h3>
                    <p>{template.description}</p>
                    <div className="template-tags">
                      <span style={{ background: template.primaryColor + '20', color: template.primaryColor }}>
                        {template.style}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </section>

      <section className="cta-section">
        <div className="container">
          <motion.div
            className="cta-content"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2>Gati për të krijuar ftesën tënde?</h2>
            <p>Bashkohu me qindra çifte që kanë zgjedhur FtesaDasme</p>
            {user ? (
              <Link to="/create" className="btn btn-gold" style={{ fontSize: 18, padding: '16px 40px' }}>
                Krijo Ftesën <FiArrowRight />
              </Link>
            ) : (
              <Link to="/register" className="btn btn-gold" style={{ fontSize: 18, padding: '16px 40px' }}>
                Filloni Falas <FiArrowRight />
              </Link>
            )}
          </motion.div>
        </div>
      </section>
    </div>
  );
}
