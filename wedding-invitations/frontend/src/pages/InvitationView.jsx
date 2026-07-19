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

const particles = ['✦', '✧', '❋', '◆', '✶'];

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
          height: '1', width: '1',
          videoId: youtubeId,
          playerVars: { autoplay: 1, loop: 1, playlist: youtubeId, controls: 0, showinfo: 0, modestbranding: 1, rel: 0 },
          events: {
            onReady: (event) => { event.target.setVolume(40); event.target.playVideo(); setIsMusicPlaying(true); }
          }
        });
        youTubePlayerRef.current = player;
      });
    } else {
      const defaultSongs = {
        dasem: '/Irma Libohova - Martesa Jonë.mp3',
        kanagjegj: '/Motrat Mustafa - Kanagjegji (2018).mp3',
        syneti: '/Lavdrim Xhelili - SYNETIA E DJALIT.mp3',
        birthday: '/Dafina Zeqiri - Happy Birthday.mp3',
      };
      const defaultSong = songUrl || defaultSongs[inv.invitationType] || '';
      if (!defaultSong) return;
      const audio = new Audio(defaultSong);
      audio.loop = true;
      audio.volume = 0.4;
      audioRef.current = audio;
      audio.play().then(() => setIsMusicPlaying(true)).catch(() => setIsMusicPlaying(false));
    }
  }, [inv, loadYouTubeAPI]);

  useEffect(() => {
    if (!inv) return;
    const handleInteraction = () => startMusic();
    document.addEventListener('click', handleInteraction, { once: true });
    document.addEventListener('touchstart', handleInteraction, { once: true });
    return () => {
      document.removeEventListener('click', handleInteraction);
      document.removeEventListener('touchstart', handleInteraction);
    };
  }, [inv, startMusic]);

  const openInvitation = () => {
    if (isOpen) return;
    setIsOpen(true);
    if (!audioRef.current && !youTubePlayerRef.current) startMusic();
    setTimeout(() => {
      setShowContent(true);
      setTimeout(() => contentRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
    }, 2600);
  };

  useEffect(() => {
    if (inv) {
      if (inv.invitationType === 'syneti') setQrTarget('groom');
      else if (!inv.groomPhone && inv.bridePhone) setQrTarget('bride');
      else setQrTarget('groom');
    }
  }, [inv]);

  const toggleMusic = () => {
    if (isYouTube && youTubePlayerRef.current) {
      if (isMusicPlaying) { youTubePlayerRef.current.pauseVideo(); setIsMusicPlaying(false); }
      else { youTubePlayerRef.current.playVideo(); setIsMusicPlaying(true); }
      return;
    }
    if (!audioRef.current) {
      const songUrl = inv?.customMp3Url || '';
      const youtubeId = extractYouTubeId(songUrl);
      if (youtubeId) {
        setIsYouTube(true);
        loadYouTubeAPI().then((YT) => {
          const player = new YT.Player('youtube-player', {
            height: '1', width: '1', videoId: youtubeId,
            playerVars: { autoplay: 1, loop: 1, playlist: youtubeId, controls: 0, showinfo: 0, modestbranding: 1, rel: 0 },
            events: { onReady: (event) => { event.target.setVolume(40); event.target.playVideo(); setIsMusicPlaying(true); } }
          });
          youTubePlayerRef.current = player;
        });
        return;
      }
      const defaultSongs = { dasem: '/Irma Libohova - Martesa Jonë.mp3', kanagjegj: '/Motrat Mustafa - Kanagjegji (2018).mp3', syneti: '/Lavdrim Xhelili - SYNETIA E DJALIT.mp3', birthday: '/Dafina Zeqiri - Happy Birthday.mp3' };
      const defaultSong = songUrl || (inv ? defaultSongs[inv.invitationType] : '') || '';
      if (!defaultSong) return;
      const audio = new Audio(defaultSong);
      audio.loop = true; audio.volume = 0.4;
      audioRef.current = audio;
      audio.play().then(() => setIsMusicPlaying(true)).catch(() => setIsMusicPlaying(false));
      return;
    }
    if (audioRef.current.paused) { audioRef.current.play().catch(() => {}); setIsMusicPlaying(true); }
    else { audioRef.current.pause(); setIsMusicPlaying(false); }
  };

  useEffect(() => {
    return () => {
      if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
      if (youTubePlayerRef.current) { youTubePlayerRef.current.destroy(); youTubePlayerRef.current = null; }
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
      case 'birthday': return t('invitation.envelopeBirthday');
      default: return t('invitation.envelopeWedding');
    }
  };

  const getEnvelopeTitle = () => {
    switch (inv.invitationType) {
      case 'kanagjegj': return t('invitation.envelopeTitleKanagjegj');
      case 'syneti': return t('invitation.envelopeTitleSynet');
      case 'birthday': return t('invitation.envelopeTitleBirthday');
      default: return t('invitation.envelopeTitleWedding');
    }
  };

  const getSubtitle = () => {
    switch (inv.invitationType) {
      case 'kanagjegj': return t('invitation.subtitleKanagjegj');
      case 'syneti': return t('invitation.subtitleSynet');
      case 'birthday': return t('invitation.subtitleBirthday');
      default: return t('invitation.subtitleWedding');
    }
  };

  const getGallerySubtitle = () => {
    switch (inv.invitationType) {
      case 'kanagjegj': return t('invitation.gallerySubtitleKanagjegj');
      case 'syneti': return t('invitation.gallerySubtitleSynet');
      case 'birthday': return t('invitation.gallerySubtitleBirthday');
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
              style={{
                '--env-primary': primaryColor,
                '--env-secondary': inv.customSecondaryColor || '#FFF8E7',
                background: `radial-gradient(ellipse at 50% 40%, ${inv.customSecondaryColor || '#FFF8E7'} 0%, #f5efe4 60%, #e8dfd0 100%)`
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.6 }}
            >
              <div className="env-particles">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="env-particle" style={{
                    left: `${15 + i * 14}%`,
                    animationDelay: `${i * 0.7}s`,
                    color: primaryColor
                  }}>✦</div>
                ))}
              </div>
              <div className="envelope-container">
                <div className="env-corner-deco env-corner-tl" style={{ borderColor: `${primaryColor}25` }}></div>
                <div className="env-corner-deco env-corner-tr" style={{ borderColor: `${primaryColor}25` }}></div>
                <div className="env-corner-deco env-corner-bl" style={{ borderColor: `${primaryColor}25` }}></div>
                <div className="env-corner-deco env-corner-br" style={{ borderColor: `${primaryColor}25` }}></div>
                <div className="env-glow" style={{ background: `radial-gradient(circle, ${primaryColor}15 0%, transparent 70%)` }}></div>
                <div className={`envelope${isOpen ? ' open' : ''}${!isOpen ? ' float' : ''}`} onClick={openInvitation}>
                  <div className="envelope-body">
                    <div className="env-body-border" style={{ borderColor: `${primaryColor}30` }}></div>
                    <div className="env-body-shine"></div>
                    <div className="env-body-deco" style={{ borderColor: `${primaryColor}12` }}></div>
                  </div>
                  <div className="envelope-flap">
                    <div className="env-flap-inner"></div>
                  </div>
                  <div className="envelope-wax-seal" style={{ background: `radial-gradient(circle at 35% 35%, ${primaryColor}dd, ${primaryColor}40%, ${primaryColor}cc 100%)` }}>
                    <div className="wax-ring"></div>
                    <div className="wax-inner">
                      <span className="wax-initials" style={{ fontFamily: '"Great Vibes", cursive' }}>
                        {inv.invitationType === 'kanagjegj' ? inv.brideName?.charAt(0) : inv.invitationType === 'syneti' || inv.invitationType === 'birthday' ? inv.groomName?.charAt(0) : `${inv.groomName?.charAt(0)}${inv.brideName?.charAt(0)}`}
                      </span>
                    </div>
                    <div className="wax-drip wax-drip-1"></div>
                    <div className="wax-drip wax-drip-2"></div>
                  </div>
                  <div className="env-invitation-card" style={{ fontFamily }}>
                    <div className="env-card-border" style={{ borderColor: `${primaryColor}15` }}></div>
                    <div className="env-card-border-inner" style={{ borderColor: `${primaryColor}08` }}></div>
                    <div className="env-card-top-deco" style={{ color: primaryColor }}>✧</div>
                    <div className="env-card-hearts" style={{ color: primaryColor }}>✧ ✧ ✧</div>
                    <div className="env-card-names" style={{ fontFamily: fontFamily.includes('Great Vibes') || fontFamily.includes('cursive') || fontFamily.includes('Mr De') || fontFamily.includes('Parisienne') || fontFamily.includes('Tangerine') || fontFamily.includes('Petit') ? fontFamily : '"Great Vibes", cursive' }}>
                      {inv.invitationType === 'kanagjegj' ? inv.brideName : inv.invitationType === 'syneti' || inv.invitationType === 'birthday' ? inv.groomName : <>{inv.groomName} <span className="env-card-ampersand" style={{ color: primaryColor }}>&</span> {inv.brideName}</>}
                    </div>
                    <div className="env-card-divider" style={{ background: `linear-gradient(90deg, transparent, ${primaryColor}, transparent)` }}></div>
                    <div className="env-card-text">{getEnvelopeText()}</div>
                    <div className="env-card-date" style={{ color: primaryColor }}>{weddingDate.toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric' })}</div>
                    <div className="env-card-sub" style={{ color: primaryColor }}>{getEnvelopeTitle()}</div>
                    <div className="env-card-bottom-deco" style={{ color: primaryColor }}>✧</div>
                  </div>
                  <div className="envelope-shadow"></div>
                </div>
                {!isOpen && <p className="click-hint" style={{ color: `${primaryColor}99` }}>{t('invitation.clickToOpen')}</p>}
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
              <div className="inv-sparkle-container">
                {[...Array(20)].map((_, i) => (
                  <div key={i} className="inv-sparkle" style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    animationDelay: `${Math.random() * 6}s`,
                    animationDuration: `${4 + Math.random() * 6}s`,
                    fontSize: `${0.4 + Math.random() * 0.6}rem`,
                    color: primaryColor
                  }}>{particles[i % particles.length]}</div>
                ))}
              </div>
              <div className="inv-hero-section" style={{ background: `linear-gradient(175deg, ${inv.customSecondaryColor || '#FFF8E7'} 0%, #fff 30%, ${inv.customSecondaryColor || '#FFF8E7'} 70%, ${inv.customSecondaryColor || '#FFF8E7'} 100%)` }}>
                <div className="inv-hero-bg-circle" style={{ borderColor: `${primaryColor}08` }}></div>
                <div className="inv-hero-bg-circle-2" style={{ borderColor: `${primaryColor}05` }}></div>
                <div className="inv-hero-content">
                  <div className="inv-hero-top-line" style={{ background: `linear-gradient(90deg, transparent, ${primaryColor}, transparent)` }}></div>
                  <div className="inv-hero-blessing" style={{ color: primaryColor }}>{t('invitation.blessing')}</div>
                  <h1 className="inv-couple-names">
                    {inv.invitationType === 'kanagjegj' ? (
                      <span className="inv-couple-single">{inv.brideName}</span>
                    ) : inv.invitationType === 'syneti' || inv.invitationType === 'birthday' ? (
                      <span className="inv-couple-single">{inv.groomName}</span>
                    ) : (
                      <><span className="inv-name">{inv.groomName}</span>
                        <span className="inv-ampersand" style={{ color: primaryColor, fontFamily: "'Great Vibes', cursive" }}>&</span>
                        <span className="inv-name">{inv.brideName}</span></>
                    )}
                  </h1>
                  <p className="inv-hero-subtitle">{getSubtitle()}</p>
                  <div className="inv-hero-bottom-line" style={{ background: `linear-gradient(90deg, transparent, ${primaryColor}, transparent)` }}></div>
                  <div className="inv-hero-date">
                    <FiCalendar style={{ color: primaryColor }} />
                    <span>{weddingDate.toLocaleDateString(locale, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
                  </div>
                </div>
              </div>

              <section className="inv-section inv-section-gold" style={{ background: `linear-gradient(135deg, ${primaryColor}, ${primaryColor}dd)` }}>
                <div className="container">
                  <div className="inv-section-ornament inv-section-ornament-top" style={{ color: 'white' }}>✦</div>
                  <motion.h2
                    className="inv-section-title inv-section-title-light"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                  >
                    {t('invitation.countdownTitle')}
                  </motion.h2>
                  <motion.p
                    className="inv-section-subtitle inv-section-subtitle-light"
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                  >
                    {t('invitation.countdownSubtitle')}
                  </motion.p>
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
                        <div className="countdown-value">{String(item.value).padStart(2, '0')}</div>
                        <div className="countdown-label">{item.label}</div>
                      </motion.div>
                    ))}
                  </div>
                  <div className="inv-section-ornament inv-section-ornament-bottom" style={{ color: 'white' }}>✦</div>
                </div>
              </section>

              <section className="inv-section">
                <div className="container">
                  <motion.h2
                    className="inv-section-title"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                  >
                    {t('invitation.detailsTitle')}
                  </motion.h2>
                  <motion.div
                    className="inv-details-card"
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    style={{ borderColor: `${primaryColor}15` }}
                  >
                    <div className="inv-details-ornament" style={{ color: primaryColor }}>❋</div>
                    <div className="inv-detail-item">
                      <div className="inv-detail-icon" style={{ color: primaryColor, background: `${primaryColor}12` }}>
                        <FiCalendar />
                      </div>
                      <h3>{t('invitation.dateLabel')}</h3>
                      <p>{weddingDate.toLocaleDateString(locale, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
                    </div>
                    <div className="inv-detail-divider" style={{ background: `${primaryColor}20` }} />
                    <div className="inv-detail-item">
                      <div className="inv-detail-icon" style={{ color: primaryColor, background: `${primaryColor}12` }}>
                        <FiClock />
                      </div>
                      <h3>{t('invitation.timeLabel')}</h3>
                      <p>{inv.weddingTime}</p>
                    </div>
                    <div className="inv-detail-divider" style={{ background: `${primaryColor}20` }} />
                    <div className="inv-detail-item">
                      <div className="inv-detail-icon" style={{ color: primaryColor, background: `${primaryColor}12` }}>
                        <FiMapPin />
                      </div>
                      <h3>{t('invitation.locationLabel')}</h3>
                      <p>{inv.location}</p>
                    </div>
                  </motion.div>
                </div>
              </section>

              {inv.personalMessage && (
                <section className="inv-section inv-message-section" style={{ background: inv.customSecondaryColor || '#FFF8E7' }}>
                  <div className="container">
                    <motion.h2
                      className="inv-section-title"
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                    >
                      {t('invitation.messageTitle')}
                    </motion.h2>
                    <motion.div
                      className="inv-message"
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                    >
                      <div className="inv-quote-open" style={{ color: primaryColor }}>"</div>
                      <p style={{ fontFamily: fontFamily.includes('cursive') || fontFamily.includes('Great Vibes') || fontFamily.includes('Parisienne') || fontFamily.includes('Tangerine') ? fontFamily : undefined }}>{inv.personalMessage}</p>
                      <div className="inv-quote-close" style={{ color: primaryColor }}>"</div>
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
                <section className="inv-section" style={{ background: inv.customSecondaryColor || '#FFF8E7' }}>
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
                      className="inv-rsvp-card"
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      style={{ borderColor: `${primaryColor}15` }}
                    >
                      <div className="inv-rsvp-ornament" style={{ color: primaryColor }}>✧</div>
                      <h2 className="inv-section-title">{t('invitation.confirmTitle')}</h2>
                      <p className="inv-section-subtitle">{t('invitation.confirmDesc')}</p>
                      <div className="inv-rsvp-contact">
                        <div className="inv-rsvp-phone" style={{ borderColor: `${primaryColor}20` }}>
                          <FiPhone style={{ color: primaryColor }} />
                          <span>{groomPhone || bridePhone}</span>
                        </div>
                        <a
                          href={`https://wa.me/${(groomPhone || bridePhone).replace(/[^0-9]/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inv-rsvp-wa"
                          style={{ background: '#25D366' }}
                        >
                          <FiMessageSquare /> WhatsApp
                        </a>
                      </div>
                      {waNumber && (
                        <div className="inv-rsvp-qr">
                          <div className="inv-rsvp-or" style={{ color: primaryColor }}>{t('invitation.qrOr')}</div>
                          <p className="inv-rsvp-qr-title">{t('invitation.qrTitle')}</p>
                          {hasBothPhones && (
                            <div className="inv-rsvp-toggle">
                              <button
                                className={`inv-rsvp-toggle-btn ${effectiveTarget === 'groom' ? 'active' : ''}`}
                                onClick={() => setQrTarget('groom')}
                                style={effectiveTarget === 'groom' ? { background: primaryColor, borderColor: primaryColor, color: '#fff' } : { borderColor: `${primaryColor}40`, color: primaryColor }}
                              >{inv.groomName}</button>
                              <button
                                className={`inv-rsvp-toggle-btn ${effectiveTarget === 'bride' ? 'active' : ''}`}
                                onClick={() => setQrTarget('bride')}
                                style={effectiveTarget === 'bride' ? { background: primaryColor, borderColor: primaryColor, color: '#fff' } : { borderColor: `${primaryColor}40`, color: primaryColor }}
                              >{inv.brideName}</button>
                            </div>
                          )}
                          <div className="inv-rsvp-qr-box" style={{ borderColor: `${primaryColor}15` }}>
                            <QRCodeCanvas
                              value={`https://wa.me/${waNumber}`}
                              size={160}
                              bgColor="#ffffff"
                              fgColor={primaryColor}
                              level="M"
                              style={{ borderRadius: 12 }}
                            />
                            <p className="inv-rsvp-qr-label">{t('invitation.qrLabel')}</p>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  </div>
                </section>
              )}

              <section className="inv-footer-section" style={{ background: `linear-gradient(135deg, ${primaryColor}, ${primaryColor}cc)` }}>
                <div className="container">
                  <div className="inv-footer-inner">
                    <div className="inv-footer-sparkle inv-footer-sparkle-top" style={{ color: 'white' }}>✧ ✧ ✧</div>
                    <FiHeart style={{ fontSize: '2.2rem', color: 'white', opacity: 0.7 }} />
                    <h2 className="inv-footer-names" style={{ fontFamily: fontFamily.includes('Great Vibes') || fontFamily.includes('cursive') || fontFamily.includes('Parisienne') ? fontFamily : '"Great Vibes", cursive' }}>
                      {inv.invitationType === 'kanagjegj' ? inv.brideName : inv.invitationType === 'syneti' || inv.invitationType === 'birthday' ? inv.groomName : `${inv.groomName} & ${inv.brideName}`}
                    </h2>
                    <div className="inv-footer-line" style={{ background: 'rgba(255,255,255,0.15)' }}></div>
                    <p className="inv-footer-date">{weddingDate.toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                    <div className="inv-footer-sparkle inv-footer-sparkle-bottom" style={{ color: 'white' }}>✧ ✧ ✧</div>
                    <p className="inv-footer-credit">{t('app.footerCredit')}</p>
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
          >{l.label}</button>
        ))}
      </div>

      <div id="youtube-player" style={{ position: 'fixed', bottom: -9999, left: -9999, width: 1, height: 1, opacity: 0, pointerEvents: 'none' }}></div>

      <button className={`music-btn${isMusicPlaying ? ' playing' : ''}`} onClick={toggleMusic}>
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
