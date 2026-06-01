import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiHeart, FiMapPin, FiClock, FiCalendar, FiPhone, FiMessageSquare } from 'react-icons/fi';
import { getPublicInvitation } from '../api';
import './InvitationView.css';

export default function InvitationView() {
  const { slug } = useParams();
  const [inv, setInv] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [timeLeft, setTimeLeft] = useState({});
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [envelopeOpen, setEnvelopeOpen] = useState(false);
  const [showCard, setShowCard] = useState(false);

  useEffect(() => {
    loadInvitation();
  }, [slug]);

  useEffect(() => {
    if (!inv?.weddingDate) return;
    const timer = setInterval(() => {
      const wedding = new Date(inv.weddingDate).getTime();
      const now = new Date().getTime();
      const diff = wedding - now;
      if (diff <= 0) { setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 }); return; }
      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000)
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [inv?.weddingDate]);

  const loadInvitation = async () => {
    try {
      const res = await getPublicInvitation(slug);
      setInv(res.data);
    } catch (err) {
      setError('Ftesa nuk u gjet.');
    } finally {
      setLoading(false);
    }
  };

  const openEnvelope = () => {
    setEnvelopeOpen(true);
    setTimeout(() => setShowCard(true), 800);
  };

  if (loading) return <div className="inv-loading">Duke ngarkuar...</div>;
  if (error) return <div className="inv-loading">{error}</div>;
  if (!inv) return null;

  const fontFamily = inv.customFont || 'Georgia';
  const primaryColor = inv.customPrimaryColor || '#D4AF37';
  const weddingDate = new Date(inv.weddingDate);

  return (
    <div className="invitation-view" style={{ fontFamily }}>
      <section className="inv-envelope-section">
        <AnimatePresence>
          {!showCard && (
            <motion.div
              className="envelope-wrapper"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
            >
              <div className={`envelope ${envelopeOpen ? 'open' : ''}`}>
                <div className="envelope-back" />
                <div className="envelope-flap-top" style={{ background: `linear-gradient(135deg, ${primaryColor}, ${primaryColor}dd)` }} />
                <div className="envelope-flap-bottom" style={{ background: `linear-gradient(135deg, ${primaryColor}, ${primaryColor}dd)` }} />
                <div className="envelope-body" style={{ background: `linear-gradient(135deg, ${inv.customSecondaryColor || '#FFF8E7'}, white)` }}>
                  <div className="envelope-seal" style={{ borderColor: primaryColor }}>
                    <FiHeart style={{ color: primaryColor }} />
                  </div>
                </div>
                <div className="envelope-shadow" />
              </div>
              {!envelopeOpen && (
                <motion.button
                  className="envelope-open-btn"
                  style={{ background: `linear-gradient(135deg, ${primaryColor}, ${primaryColor}dd)` }}
                  onClick={openEnvelope}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Hape Ftesën
                </motion.button>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showCard && (
            <motion.div
              className="invitation-card-content"
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            >
              <div className="inv-hero-particles">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="inv-particle" style={{
                    left: `${Math.random() * 100}%`,
                    animationDelay: `${Math.random() * 4}s`,
                    color: primaryColor
                  }}>✦</div>
                ))}
              </div>
              <div className="inv-hero-content">
                <div className="inv-hero-ornament" style={{ color: primaryColor }}>✦ ✦ ✦</div>
                <h1 className="inv-couple-names">
                  <span>{inv.groomName}</span>
                  <span className="inv-ampersand" style={{ color: primaryColor }}>&</span>
                  <span>{inv.brideName}</span>
                </h1>
                <p className="inv-hero-subtitle">Ju ftojnë në dasmën e tyre</p>
                <div className="inv-hero-date">
                  <FiCalendar style={{ color: primaryColor }} />
                  {weddingDate.toLocaleDateString('sq-AL', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                </div>
                <div className="inv-hero-ornament" style={{ color: primaryColor }}>✦ ✦ ✦</div>
              </div>

              <section className="inv-section inv-countdown-section" style={{ background: `linear-gradient(135deg, ${primaryColor}, ${primaryColor}dd)` }}>
                <div className="container">
                  <motion.h2
                    className="inv-section-title"
                    style={{ color: 'white' }}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                  >
                    Mbetën
                  </motion.h2>
                  <div className="countdown-grid">
                    {[
                      { label: 'Ditë', value: timeLeft.days || 0 },
                      { label: 'Orë', value: timeLeft.hours || 0 },
                      { label: 'Minuta', value: timeLeft.minutes || 0 },
                      { label: 'Sekonda', value: timeLeft.seconds || 0 }
                    ].map((item, i) => (
                      <motion.div
                        key={i}
                        className="countdown-item"
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        viewport={{ once: true }}
                      >
                        <div className="countdown-value">{item.value}</div>
                        <div className="countdown-label">{item.label}</div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </section>

              <section className="inv-section">
                <div className="container">
                  <motion.div
                    className="inv-details-card"
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                  >
                    <div className="inv-detail-item">
                      <FiCalendar style={{ color: primaryColor }} />
                      <h3>Data</h3>
                      <p>{weddingDate.toLocaleDateString('sq-AL', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
                    </div>
                    <div className="inv-detail-divider" style={{ background: primaryColor }} />
                    <div className="inv-detail-item">
                      <FiClock style={{ color: primaryColor }} />
                      <h3>Ora</h3>
                      <p>{inv.weddingTime}</p>
                    </div>
                    <div className="inv-detail-divider" style={{ background: primaryColor }} />
                    <div className="inv-detail-item">
                      <FiMapPin style={{ color: primaryColor }} />
                      <h3>Lokacioni</h3>
                      <p>{inv.location}</p>
                    </div>
                  </motion.div>
                </div>
              </section>

              {inv.personalMessage && (
                <section className="inv-section inv-message-section" style={{ background: inv.customSecondaryColor }}>
                  <div className="container">
                    <motion.div
                      className="inv-message"
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                    >
                      <div className="inv-quote-mark" style={{ color: primaryColor }}>"</div>
                      <p>{inv.personalMessage}</p>
                      <div className="inv-quote-mark" style={{ color: primaryColor }}>"</div>
                    </motion.div>
                  </div>
                </section>
              )}

              {inv.photos && inv.photos.length > 0 && (
                <section className="inv-section">
                  <div className="container">
                    <motion.h2
                      className="inv-section-title"
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                    >
                      Galeria
                    </motion.h2>
                    <p className="inv-section-subtitle">Momente të bukura nga dashuria juaj</p>
                    <div className="inv-gallery">
                      {inv.photos.map((photo, i) => (
                        <motion.div
                          key={i}
                          className="inv-gallery-item"
                          initial={{ opacity: 0, scale: 0.9 }}
                          whileInView={{ opacity: 1, scale: 1 }}
                          transition={{ delay: i * 0.1 }}
                          viewport={{ once: true }}
                          onClick={() => setSelectedPhoto(photo)}
                        >
                          <img src={photo} alt="" />
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </section>
              )}

              {inv.locationLat && inv.locationLng && (
                <section className="inv-section" style={{ background: inv.customSecondaryColor }}>
                  <div className="container">
                    <motion.h2
                      className="inv-section-title"
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                    >
                      Lokacioni
                    </motion.h2>
                    <motion.div
                      className="inv-map-container"
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                    >
                      <iframe
                        title="location"
                        width="100%"
                        height="400"
                        style={{ border: 0, borderRadius: 16 }}
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                        src={`https://maps.google.com/maps?q=${inv.locationLat},${inv.locationLng}&z=15&output=embed`}
                      />
                    </motion.div>
                  </div>
                </section>
              )}

              {(inv.groomPhone || inv.bridePhone) && (
                <section className="inv-section">
                  <div className="container">
                    <motion.div
                      className="inv-contact-section"
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                    >
                      <h2 className="inv-section-title">Konfirmoni Ardhjen Tuaj</h2>
                      <p className="inv-section-subtitle">
                        Ju lutemi na njoftoni për pjesëmarrjen tuaj duke na kontaktuar në një nga numrat më poshtë.
                      </p>

                      <div className="contact-cards">
                        {inv.groomPhone && (
                          <div className="contact-card" style={{ borderColor: primaryColor + '30' }}>
                            <div className="contact-card-header">
                              <div className="contact-avatar" style={{ background: `linear-gradient(135deg, ${primaryColor}, ${primaryColor}dd)` }}>
                                {inv.groomName.charAt(0)}
                              </div>
                              <div>
                                <h4>{inv.groomName}</h4>
                                <p>Dhëndri</p>
                              </div>
                            </div>
                            <p className="contact-phone">{inv.groomPhone}</p>
                            <div className="contact-actions">
                              <a href={`tel:${inv.groomPhone}`} className="contact-btn call-btn" style={{ borderColor: primaryColor, color: primaryColor }}>
                                <FiPhone /> Telefono
                              </a>
                              <a
                                href={`https://wa.me/${inv.groomPhone.replace(/[^0-9]/g, '')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="contact-btn whatsapp-btn"
                                style={{ background: '#25D366', color: 'white' }}
                              >
                                <FiMessageSquare /> WhatsApp
                              </a>
                            </div>
                          </div>
                        )}

                        {inv.bridePhone && (
                          <div className="contact-card" style={{ borderColor: primaryColor + '30' }}>
                            <div className="contact-card-header">
                              <div className="contact-avatar" style={{ background: `linear-gradient(135deg, ${primaryColor}, ${primaryColor}dd)` }}>
                                {inv.brideName.charAt(0)}
                              </div>
                              <div>
                                <h4>{inv.brideName}</h4>
                                <p>Nusja</p>
                              </div>
                            </div>
                            <p className="contact-phone">{inv.bridePhone}</p>
                            <div className="contact-actions">
                              <a href={`tel:${inv.bridePhone}`} className="contact-btn call-btn" style={{ borderColor: primaryColor, color: primaryColor }}>
                                <FiPhone /> Telefono
                              </a>
                              <a
                                href={`https://wa.me/${inv.bridePhone.replace(/[^0-9]/g, '')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="contact-btn whatsapp-btn"
                                style={{ background: '#25D366', color: 'white' }}
                              >
                                <FiMessageSquare /> WhatsApp
                              </a>
                            </div>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  </div>
                </section>
              )}

              <section className="inv-footer-section" style={{ background: `linear-gradient(135deg, ${primaryColor}, ${primaryColor}cc)` }}>
                <div className="container">
                  <div className="inv-footer-content">
                    <FiHeart style={{ fontSize: '2rem', color: 'white', opacity: 0.8 }} />
                    <h2 style={{ color: 'white', fontFamily: 'Great Vibes, cursive', fontSize: '2rem' }}>
                      {inv.groomName} & {inv.brideName}
                    </h2>
                    <p style={{ color: 'rgba(255,255,255,0.8)' }}>
                      {weddingDate.toLocaleDateString('sq-AL', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                    <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, marginTop: 20 }}>
                      Krijuar me ❤ nga FtesaDasme
                    </p>
                  </div>
                </div>
              </section>

              {selectedPhoto && (
                <div className="inv-lightbox" onClick={() => setSelectedPhoto(null)}>
                  <img src={selectedPhoto} alt="" />
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </section>
    </div>
  );
}
