import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { FiHeart, FiMapPin, FiClock, FiCalendar, FiPhone, FiMessageSquare, FiGlobe } from 'react-icons/fi';
import { getPublicInvitation } from '../api';
import { QRCodeCanvas } from 'qrcode.react';
import '../i18n';
import './InvitationView.css';

const languages = [
  { code: 'sq', label: 'Shqip' },
  { code: 'en', label: 'English' },
  { code: 'sr', label: 'Srpski' },
];

export default function InvitationView() {
  const { t, i18n } = useTranslation();
  const { slug } = useParams();
  const [inv, setInv] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [timeLeft, setTimeLeft] = useState({});
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [showContent, setShowContent] = useState(false);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [qrTarget, setQrTarget] = useState('groom');
  const [langOpen, setLangOpen] = useState(false);
  const audioRef = useRef(null);
  const youTubePlayerRef = useRef(null);
  const contentRef = useRef(null);
  const [isYouTube, setIsYouTube] = useState(false);

  const extractYouTubeId = (url) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const loadYouTubeAPI = useCallback(() => {
    return new Promise((resolve) => {
      if (window.YT && window.YT.Player) {
        resolve(window.YT);
        return;
      }
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
      window.onYouTubeIframeAPIReady = () => resolve(window.YT);
    });
  }, []);

  useEffect(() => {
    loadInvitation();
  }, [slug]);

  useEffect(() => {
    if (inv?.language) {
      i18n.changeLanguage(inv.language);
    }
  }, [inv?.language]);

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
      setError(t('invitation.notFound'));
    } finally {
      setLoading(false);
    }
  };

  const startMusic = useCallback(() => {
    if (!inv || audioRef.current || youTubePlayerRef.current) return;

    const songUrl = inv.customMp3Url || '';
    const youtubeId = extractYouTubeId(songUrl);

    if (youtubeId) {
      setIsYouTube(true);
      loadYouTubeAPI().then((YT) => {
        const player = new YT.Player('youtube-player', {
          height: '1',
          width: '1',
          videoId: youtubeId,
          playerVars: {
            autoplay: 1,
            loop: 1,
            playlist: youtubeId,
            controls: 0,
            showinfo: 0,
            modestbranding: 1,
            rel: 0
          },
          events: {
            onReady: (event) => {
              event.target.setVolume(40);
              event.target.playVideo();
              setIsMusicPlaying(true);
            }
          }
        });
        youTubePlayerRef.current = player;
      });
    } else {
      const defaultSong = songUrl || (inv.invitationType === 'syneti' ? '/Lavdrim Xhelili - SYNETIA E DJALIT.mp3' : inv.invitationType === 'kanagjegj' ? '/Motrat Mustafa - Kanagjegji (2018).mp3' : '/Irma Libohova - Martesa Jonë.mp3');
      const audio = new Audio(defaultSong);
      audio.loop = true;
      audio.volume = 0.4;
      audio.play().catch(() => {});
      audioRef.current = audio;
      setIsMusicPlaying(true);
    }
  }, [inv, loadYouTubeAPI]);

  useEffect(() => {
    if (inv) startMusic();
  }, [inv, startMusic]);

  const openInvitation = () => {
    if (isOpen) return;
    setIsOpen(true);

    if (!audioRef.current && !youTubePlayerRef.current) {
      startMusic();
    }

    setTimeout(() => {
      setShowContent(true);
      setTimeout(() => {
        contentRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }, 2600);
  };

  useEffect(() => {
    if (inv) {
      if (inv.invitationType === 'syneti') {
        setQrTarget('groom');
      } else if (!inv.groomPhone && inv.bridePhone) {
        setQrTarget('bride');
      } else {
        setQrTarget('groom');
      }
    }
  }, [inv]);

  const toggleMusic = () => {
    if (isYouTube && youTubePlayerRef.current) {
      if (isMusicPlaying) {
        youTubePlayerRef.current.pauseVideo();
        setIsMusicPlaying(false);
      } else {
        youTubePlayerRef.current.playVideo();
        setIsMusicPlaying(true);
      }
      return;
    }
    if (!audioRef.current) return;
    if (audioRef.current.paused) {
      audioRef.current.play().catch(() => {});
      setIsMusicPlaying(true);
    } else {
      audioRef.current.pause();
      setIsMusicPlaying(false);
    }
  };

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      if (youTubePlayerRef.current) {
        youTubePlayerRef.current.destroy();
        youTubePlayerRef.current = null;
      }
    };
  }, []);

  if (loading) return <div className="inv-loading">{t('invitation.loading')}</div>;
  if (error) return <div className="inv-loading">{error}</div>;
  if (!inv) return null;

  const fontFamily = inv.customFont || 'Georgia';
  const primaryColor = inv.customPrimaryColor || '#D4AF37';
  const weddingDate = new Date(inv.weddingDate);
  const groomPhone = inv.groomPhone;
  const bridePhone = inv.bridePhone;
  const hasBothPhones = groomPhone && bridePhone;
  const effectiveTarget = !groomPhone ? 'bride' : qrTarget;
  const qrNumber = effectiveTarget === 'groom' ? groomPhone : bridePhone;
  const waNumber = (qrNumber || '').replace(/[^0-9]/g, '');
  const locale = i18n.language === 'sq' ? 'sq-AL' : i18n.language === 'sr' ? 'sr-RS' : 'en-US';

  const getEnvelopeText = () => {
    switch (inv.invitationType) {
      case 'kanagjegj': return t('invitation.envelopeKanagjegj');
      case 'syneti': return t('invitation.envelopeSynet');
      default: return t('invitation.envelopeWedding');
    }
  };

  const getEnvelopeTitle = () => {
    switch (inv.invitationType) {
      case 'kanagjegj': return t('invitation.envelopeTitleKanagjegj');
      case 'syneti': return t('invitation.envelopeTitleSynet');
      default: return t('invitation.envelopeTitleWedding');
    }
  };

  const getSubtitle = () => {
    switch (inv.invitationType) {
      case 'kanagjegj': return t('invitation.subtitleKanagjegj');
      case 'syneti': return t('invitation.subtitleSynet');
      default: return t('invitation.subtitleWedding');
    }
  };

  const getGallerySubtitle = () => {
    switch (inv.invitationType) {
      case 'kanagjegj': return t('invitation.gallerySubtitleKanagjegj');
      case 'syneti': return t('invitation.gallerySubtitleSynet');
      default: return t('invitation.gallerySubtitleWedding');
    }
  };

  const countdownLabels = [
    { label: t('invitation.countdownDays'), value: timeLeft.days || 0 },
    { label: t('invitation.countdownHours'), value: timeLeft.hours || 0 },
    { label: t('invitation.countdownMinutes'), value: timeLeft.minutes || 0 },
    { label: t('invitation.countdownSeconds'), value: timeLeft.seconds || 0 }
  ];

  return (
    <div className="invitation-view" style={{ fontFamily }}>
      <AnimatePresence mode="wait">
        {!showContent ? (
          <motion.section
            key="envelope"
            className="inv-cover-section"
            style={{ background: `linear-gradient(160deg, ${inv.customSecondaryColor || '#FFF8E7'}, #fff, ${inv.customSecondaryColor || '#FFF8E7'})`, '--env-primary': primaryColor, '--env-secondary': inv.customSecondaryColor || '#FFF8E7' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.6 }}
          >
            <div className="envelope-container">
              <div className="corner-deco corner-tl"></div>
              <div className="corner-deco corner-tr"></div>
              <div className="corner-deco corner-bl"></div>
              <div className="corner-deco corner-br"></div>
              <div className="glow-orb"></div>
              <div className={`envelope${isOpen ? ' open' : ''}${!isOpen ? ' float' : ''}`} onClick={openInvitation}>
                <div className="envelope-interior"></div>
                <div className="envelope-body">
                  <div className="env-deco"></div>
                  <div className="env-deco-2"></div>
                </div>
                <div className="envelope-flap">
                  <div className="envelope-flap-inner"></div>
                </div>
                <div className="envelope-seal">{inv.invitationType === 'kanagjegj' ? inv.brideName?.charAt(0) : inv.invitationType === 'syneti' ? inv.groomName?.charAt(0) : `${inv.groomName?.charAt(0)}${inv.brideName?.charAt(0)}`}</div>
                <div className="env-invitation-card">
                  <div className="env-card-heart">✧</div>
                  <div className="env-card-names">{inv.invitationType === 'kanagjegj' ? inv.brideName : inv.invitationType === 'syneti' ? inv.groomName : <>{inv.groomName} <span>&</span> {inv.brideName}</>}</div>
                  <div className="env-card-line"></div>
                  <div className="env-card-text">{getEnvelopeText()}</div>
                  <div className="env-card-date">{weddingDate.toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric' })}</div>
                  <div className="env-card-sub">{getEnvelopeTitle()}</div>
                </div>
                <div className="envelope-shadow"></div>
              </div>
              {!isOpen && <p className="click-hint">{t('invitation.clickToOpen')}</p>}
            </div>
          </motion.section>
        ) : (
          <motion.div
            key="content"
            className="invitation-card-content"
            ref={contentRef}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
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
                {inv.invitationType === 'kanagjegj' ? (
                  <span>{inv.brideName}</span>
                ) : inv.invitationType === 'syneti' ? (
                  <span>{inv.groomName}</span>
                ) : (
                  <><span>{inv.groomName}</span>
                    <span className="inv-ampersand" style={{ color: primaryColor }}>&</span>
                    <span>{inv.brideName}</span></>
                )}
              </h1>
              <p className="inv-hero-subtitle">{getSubtitle()}</p>
              <div className="inv-hero-date">
                <FiCalendar style={{ color: primaryColor }} />
                {weddingDate.toLocaleDateString(locale, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
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
                  {t('invitation.countdownTitle')}
                </motion.h2>
                <div className="countdown-grid">
                  {countdownLabels.map((item, i) => (
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
                    <h3>{t('invitation.dateLabel')}</h3>
                    <p>{weddingDate.toLocaleDateString(locale, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
                  </div>
                  <div className="inv-detail-divider" style={{ background: primaryColor }} />
                  <div className="inv-detail-item">
                    <FiClock style={{ color: primaryColor }} />
                    <h3>{t('invitation.timeLabel')}</h3>
                    <p>{inv.weddingTime}</p>
                  </div>
                  <div className="inv-detail-divider" style={{ background: primaryColor }} />
                  <div className="inv-detail-item">
                    <FiMapPin style={{ color: primaryColor }} />
                    <h3>{t('invitation.locationLabel')}</h3>
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
                    {t('invitation.galleryTitle')}
                  </motion.h2>
                  <p className="inv-section-subtitle">{getGallerySubtitle()}</p>
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
                    {t('invitation.mapTitle')}
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
                      style={{ border: 0, borderRadius: 16, maxWidth: '100%' }}
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      src={`https://maps.google.com/maps?q=${inv.locationLat},${inv.locationLng}&z=15&output=embed`}
                    />
                  </motion.div>
                </div>
              </section>
            )}

            {(groomPhone || bridePhone) && (
              <section className="inv-section">
                <div className="container">
                  <motion.div
                    className="inv-contact-section"
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                  >
                    <h2 className="inv-section-title">{t('invitation.confirmTitle')}</h2>
                    <p className="inv-section-subtitle">
                      {t('invitation.confirmDesc')}
                    </p>

                    <div className="contact-single">
                      <div className="contact-card" style={{ borderColor: primaryColor + '30' }}>
                        <div className="contact-actions" style={{ flexDirection: 'column', gap: 15 }}>
                          <p className="contact-phone-single">{groomPhone || bridePhone}</p>
                          <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
                            <a
                              href={`https://wa.me/${(groomPhone || bridePhone).replace(/[^0-9]/g, '')}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="contact-btn whatsapp-btn"
                              style={{ background: '#25D366', color: 'white' }}
                            >
                              <FiMessageSquare /> WhatsApp
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>

                    {waNumber && (
                      <div className="qr-section">
                        <div className="qr-divider"><span style={{ color: primaryColor }}>{t('invitation.qrOr')}</span></div>
                        <h3 className="qr-title">{t('invitation.qrTitle')}</h3>
                        {hasBothPhones && (
                          <div className="qr-toggle">
                            <button
                              className={`qr-toggle-btn ${effectiveTarget === 'groom' ? 'active' : ''}`}
                              onClick={() => setQrTarget('groom')}
                              style={effectiveTarget === 'groom' ? { background: primaryColor, color: '#fff', borderColor: primaryColor } : { borderColor: primaryColor + '40', color: primaryColor }}
                            >
                              {inv.groomName}
                            </button>
                            <button
                              className={`qr-toggle-btn ${effectiveTarget === 'bride' ? 'active' : ''}`}
                              onClick={() => setQrTarget('bride')}
                              style={effectiveTarget === 'bride' ? { background: primaryColor, color: '#fff', borderColor: primaryColor } : { borderColor: primaryColor + '40', color: primaryColor }}
                            >
                              {inv.brideName}
                            </button>
                          </div>
                        )}
                        <div className="qr-code-box" style={{ borderColor: primaryColor + '20' }}>
                          <QRCodeCanvas
                            value={`https://wa.me/${waNumber}`}
                            size={160}
                            bgColor="#ffffff"
                            fgColor={primaryColor}
                            level="M"
                            style={{ borderRadius: 12 }}
                          />
                          <p className="qr-label">{t('invitation.qrLabel')}</p>
                        </div>
                      </div>
                    )}
                  </motion.div>
                </div>
              </section>
            )}

            <section className="inv-footer-section" style={{ background: `linear-gradient(135deg, ${primaryColor}, ${primaryColor}cc)` }}>
              <div className="container">
                <div className="inv-footer-content">
                  <FiHeart style={{ fontSize: '2rem', color: 'white', opacity: 0.8 }} />
                  <h2 style={{ color: 'white', fontFamily: 'Great Vibes, cursive', fontSize: '2rem' }}>
                    {inv.invitationType === 'kanagjegj' ? inv.brideName : inv.invitationType === 'syneti' ? inv.groomName : `${inv.groomName} & ${inv.brideName}`}
                  </h2>
                  <p style={{ color: 'rgba(255,255,255,0.8)' }}>
                    {weddingDate.toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                  <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, marginTop: 20 }}>
                    {t('app.footerCredit')}
                  </p>
                </div>
              </div>
            </section>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="inv-lang-bar">
        {languages.map(l => (
          <button
            key={l.code}
            className={`inv-lang-btn ${l.code === i18n.language ? 'active' : ''}`}
            onClick={() => i18n.changeLanguage(l.code)}
          >
            {l.label}
          </button>
        ))}
      </div>

      <div id="youtube-player" style={{ position: 'fixed', bottom: -9999, left: -9999, width: 1, height: 1, opacity: 0, pointerEvents: 'none' }}></div>

      <button
        className={`music-btn${isMusicPlaying ? ' playing' : ''}`}
        onClick={toggleMusic}
      >
        {isMusicPlaying ? '♫' : '♪'}
      </button>

      {selectedPhoto && (
        <div className="inv-lightbox" onClick={() => setSelectedPhoto(null)}>
          <img src={selectedPhoto} alt="" />
        </div>
      )}
    </div>
  );
}
