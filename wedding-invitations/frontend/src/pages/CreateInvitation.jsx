import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiClock, FiHeart, FiSend, FiCopy, FiEye, FiEdit2, FiGlobe, FiMusic, FiUpload, FiYoutube, FiPlay, FiPause } from 'react-icons/fi';
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
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    invitationType: 'dasem',
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
    customMp3Url: '',
    language: 'sq',
    gender: 'male',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(null);
  const [musicSource, setMusicSource] = useState('default');
  const [customMp3File, setCustomMp3File] = useState(null);
  const [isPreviewPlaying, setIsPreviewPlaying] = useState(false);
  const audioPreviewRef = useRef(null);

  const goToStep = (nextStep) => {
    setError('');
    setStep(nextStep);
  };

  const getDefaultSongName = () => {
    const names = {
      dasem: 'Irma Libohova - Martesa Jonë',
      kanagjegj: 'Motrat Mustafa - Kanagjegji',
      syneti: 'Lavdrim Xhelili - Synetia e Djalit',
      birthday: 'Dafina Zeqiri - Happy Birthday',
    };
    return names[form.invitationType] || 'Pa muzike (default)';
  };

  const togglePreview = () => {
    if (isPreviewPlaying) {
      if (audioPreviewRef.current) {
        audioPreviewRef.current.pause();
        audioPreviewRef.current = null;
      }
      setIsPreviewPlaying(false);
      return;
    }
    let src = '';
    if (musicSource === 'upload' && customMp3File) {
      src = URL.createObjectURL(customMp3File);
    } else if (musicSource === 'youtube' && form.customMp3Url) {
      window.open(form.customMp3Url, '_blank');
      return;
    } else if (musicSource === 'local' && form.customMp3Url) {
      src = form.customMp3Url;
    } else if (musicSource === 'default') {
      src = '';
    }
    if (!src) return;
    const audio = new Audio(src);
    audio.volume = 0.3;
    audio.play().catch(() => {});
    audio.onended = () => setIsPreviewPlaying(false);
    audioPreviewRef.current = audio;
    setIsPreviewPlaying(true);
  };

  useEffect(() => {
    return () => {
      if (audioPreviewRef.current) {
        audioPreviewRef.current.pause();
        audioPreviewRef.current = null;
      }
    };
  }, []);

  const handleMusicSourceChange = (source) => {
    if (audioPreviewRef.current) {
      audioPreviewRef.current.pause();
      audioPreviewRef.current = null;
      setIsPreviewPlaying(false);
    }
    setMusicSource(source);
    if (source === 'default') {
      setCustomMp3File(null);
      setForm(prev => ({ ...prev, customMp3Url: '' }));
    } else if (source === 'local') {
      setCustomMp3File(null);
      setForm(prev => ({ ...prev, customMp3Url: '' }));
    }
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
            if (form.invitationType === 'kanagjegj') {
              fd.append('bridePhone', form[key]);
            } else {
              fd.append('groomPhone', form[key]);
            }
        } else if (key === 'customMp3Url' && musicSource !== 'youtube' && musicSource !== 'local') {
          return;
        } else {
          fd.append(key, form[key]);
        }
      });
      if (musicSource === 'default') {
        fd.set('customMp3Url', '');
      }
      if (customMp3File) {
        fd.append('customMp3File', customMp3File);
      }
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
          <div className={`step ${step >= 0 ? 'active' : ''}`}>
            <div className="step-num">1</div>
            <span>Lloji</span>
          </div>
          <div className={`step ${step >= 1 ? 'active' : ''}`}>
            <div className="step-num">2</div>
            <span>Templati</span>
          </div>
          <div className={`step ${step >= 2 ? 'active' : ''}`}>
            <div className="step-num">3</div>
            <span>Detajet</span>
          </div>
          <div className={`step ${step >= 3 ? 'active' : ''}`}>
            <div className="step-num">4</div>
            <span>Dizajni</span>
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          {step === 0 && (
            <motion.div key="step0" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
              <h2 className="step-title">Zgjidh Llojin e Ftesës</h2>
              <div className="type-select-grid">
                <div
                  className={`type-select-card ${form.invitationType === 'dasem' ? 'selected' : ''}`}
                  onClick={() => setForm(prev => ({ ...prev, invitationType: 'dasem' }))}
                >
                  <div className="type-select-icon">💍</div>
                  <h3>Dasëm</h3>
                  <p>Ftesë për ceremoninë e martesës</p>
                </div>
                <div
                  className={`type-select-card ${form.invitationType === 'kanagjegj' ? 'selected' : ''}`}
                  onClick={() => setForm(prev => ({ ...prev, invitationType: 'kanagjegj' }))}
                >
                  <div className="type-select-icon">🌙</div>
                  <h3>Kanagjegj</h3>
                  <p>Ftesë për natën e kanagjegjit</p>
                </div>
                <div
                  className={`type-select-card ${form.invitationType === 'syneti' ? 'selected' : ''}`}
                  onClick={() => setForm(prev => ({ ...prev, invitationType: 'syneti' }))}
                >
                  <div className="type-select-icon">✨</div>
                  <h3>Synet</h3>
                  <p>Ftesë për synetin e djalit</p>
                </div>
                <div
                  className={`type-select-card ${form.invitationType === 'birthday' ? 'selected' : ''}`}
                  onClick={() => setForm(prev => ({ ...prev, invitationType: 'birthday' }))}
                >
                  <div className="type-select-icon">🎂</div>
                  <h3>Ditëlindje</h3>
                  <p>Ftesë për ditëlindje</p>
                </div>
              </div>
              <div className="step-buttons">
                <button type="button" className="btn btn-gold" onClick={() => goToStep(1)}>
                  Vazhdo <FiHeart />
                </button>
              </div>
            </motion.div>
          )}

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
                <button type="button" className="btn btn-outline" onClick={() => goToStep(0)}>Prapa</button>
                <button type="button" className="btn btn-gold" onClick={() => goToStep(2)} disabled={!form.templateId}>
                  Vazhdo <FiHeart />
                </button>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
              <h2 className="step-title">{form.invitationType === 'kanagjegj' ? 'Detajet e Kanagjegjit' : form.invitationType === 'syneti' ? 'Detajet e Synetit' : form.invitationType === 'birthday' ? 'Detajet e Ditëlindjes' : 'Detajet e Dasmës'}</h2>
              <div className="create-form">
                <div className="form-row">
                  {form.invitationType === 'syneti' || form.invitationType === 'birthday' ? (
                    <>
                      <div className="form-group">
                        <label>{form.invitationType === 'birthday' ? 'Emri i Personit' : 'Emri i Djalit'}</label>
                        <input type="text" name="groomName" value={form.groomName} onChange={handleChange} required placeholder={form.invitationType === 'birthday' ? 'Shkruaj emrin e personit' : 'Shkruaj emrin e djalit'} />
                      </div>
                      {form.invitationType === 'birthday' && (
                        <div className="form-group">
                          <label>Gjinia</label>
                          <div className="gender-select">
                            <label className={`gender-option ${form.gender === 'male' ? 'selected' : ''}`}>
                              <input type="radio" name="gender" value="male" checked={form.gender === 'male'} onChange={handleChange} />
                              <span>Mashkull</span>
                            </label>
                            <label className={`gender-option ${form.gender === 'female' ? 'selected' : ''}`}>
                              <input type="radio" name="gender" value="female" checked={form.gender === 'female'} onChange={handleChange} />
                              <span>Femër</span>
                            </label>
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <>
                      {form.invitationType !== 'kanagjegj' && (
                        <div className="form-group">
                          <label>Emri i Dhëndrit</label>
                          <input type="text" name="groomName" value={form.groomName} onChange={handleChange} required={form.invitationType !== 'kanagjegj'} placeholder="Shkruaj emrin e dhëndrit" />
                        </div>
                      )}
                      <div className="form-group">
                        <label>Emri i Nuses</label>
                        <input type="text" name="brideName" value={form.brideName} onChange={handleChange} required placeholder="Shkruaj emrin e nuses" />
                      </div>
                    </>
                  )}
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label><FiClock /> {form.invitationType === 'kanagjegj' ? 'Data e Kanagjegjit' : form.invitationType === 'syneti' ? 'Data e Synetit' : form.invitationType === 'birthday' ? 'Data e Ditëlindjes' : 'Data e Dasmës'}</label>
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

                <div className="form-group">
                  <label><FiGlobe /> Gjuha / Language / Jezik</label>
                  <select name="language" value={form.language} onChange={handleChange} className="language-select">
                    <option value="sq">Shqip</option>
                    <option value="en">English</option>
                    <option value="sr">Srpski</option>
                  </select>
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
                      <option value="Cormorant Garamond">Cormorant Garamond</option>
                      <option value="Parisienne">Parisienne</option>
                      <option value="Tangerine">Tangerine</option>
                      <option value="Cinzel">Cinzel</option>
                      <option value="Bodoni Moda">Bodoni Moda</option>
                      <option value="Mr De Haviland">Mr De Haviland</option>
                      <option value="Petit Formal Script">Petit Formal Script</option>
                      <option value="Cormorant Infant">Cormorant Infant</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label><FiMusic /> Muzika (opsionale)</label>
                    <div className="music-source-selector">
                      <button
                        type="button"
                        className={`music-source-btn ${musicSource === 'default' ? 'active' : ''}`}
                        onClick={() => handleMusicSourceChange('default')}
                      >
                        <FiMusic /> Parazgjedhur
                      </button>
                      <button
                        type="button"
                        className={`music-source-btn ${musicSource === 'upload' ? 'active' : ''}`}
                        onClick={() => handleMusicSourceChange('upload')}
                      >
                        <FiUpload /> Ngarko MP3
                      </button>
                      <button
                        type="button"
                        className={`music-source-btn ${musicSource === 'youtube' ? 'active' : ''}`}
                        onClick={() => handleMusicSourceChange('youtube')}
                      >
                        <FiYoutube /> YouTube
                      </button>
                      <button
                        type="button"
                        className={`music-source-btn ${musicSource === 'local' ? 'active' : ''}`}
                        onClick={() => handleMusicSourceChange('local')}
                      >
                        🎵 Lokal
                      </button>
                    </div>

                    <div className="music-source-content">
                      {musicSource === 'default' && (
                        <div className="music-default-info">
                          <p>Pa muzikë të parazgjedhur. Mund të ngarkoni një këngë ose të vendosni një link të YouTube.</p>
                          <p className="music-default-name">{getDefaultSongName()}</p>
                        </div>
                      )}

                      {musicSource === 'upload' && (
                        <div className="music-upload-area">
                          <input
                            type="file"
                            accept=".mp3,audio/*"
                            onChange={(e) => setCustomMp3File(e.target.files[0] || null)}
                            className="music-file-input"
                            id="mp3-upload"
                          />
                          <label htmlFor="mp3-upload" className="music-upload-label">
                            <FiUpload />
                            {customMp3File ? customMp3File.name : 'Zgjidhni një skedar MP3'}
                          </label>
                        </div>
                      )}

                      {musicSource === 'youtube' && (
                        <input
                          type="text"
                          name="customMp3Url"
                          value={form.customMp3Url}
                          onChange={handleChange}
                          placeholder="https://www.youtube.com/watch?v=..."
                          className="music-youtube-input"
                        />
                      )}
                      {musicSource === 'local' && (
                        <input
                          type="text"
                          name="customMp3Url"
                          value={form.customMp3Url}
                          onChange={handleChange}
                          placeholder="/Kole Oroshi - Nata e kanes.mp3"
                          className="music-youtube-input"
                        />
                      )}
                    </div>

                    <button
                      type="button"
                      className="music-preview-btn"
                      onClick={togglePreview}
                      disabled={musicSource === 'default' && false || (musicSource === 'upload' && !customMp3File) || (musicSource === 'youtube' && !form.customMp3Url) || (musicSource === 'local' && !form.customMp3Url)}
                    >
                      {isPreviewPlaying ? <><FiPause /> Ndalo</> : <><FiPlay /> Dëgjo</>}
                    </button>
                  </div>
                </div>

                <div className="design-preview-box" style={{
                  fontFamily: form.customFont,
                  background: `linear-gradient(135deg, ${form.customSecondaryColor}, white)`
                }}>
                  <div className="preview-ornament" style={{ color: form.customPrimaryColor }}>✦</div>
                  <div className="preview-couple">
                    {form.invitationType === 'kanagjegj' ? (
                      <span>{form.brideName || 'Nusja'}</span>
                    ) : form.invitationType === 'syneti' ? (
                      <span>{form.groomName || 'Djali'}</span>
                    ) : form.invitationType === 'birthday' ? (
                      <span>{form.groomName || 'Personi'}</span>
                    ) : (
                      <>
                        <span>{form.groomName || 'Dhëndri'}</span>
                        <span style={{ color: form.customPrimaryColor }}>❤</span>
                        <span>{form.brideName || 'Nusja'}</span>
                      </>
                    )}
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
                <div className="success-icon">{form.invitationType === 'syneti' ? '✨' : form.invitationType === 'birthday' ? '🎂' : '💍'}</div>
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
