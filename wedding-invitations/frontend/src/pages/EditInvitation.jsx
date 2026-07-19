import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiSave, FiEye, FiGlobe, FiMusic, FiUpload, FiYoutube, FiPlay, FiPause } from 'react-icons/fi';
import { getMyInvitations, updateInvitation, publishInvitation } from '../api';
import './CreateInvitation.css';

export default function EditInvitation() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    invitationType: 'dasem',
    groomName: '', brideName: '', phone: '',
    weddingDate: '', weddingTime: '',
    location: '', locationLat: '', locationLng: '', personalMessage: '',
    customPrimaryColor: '#D4AF37', customSecondaryColor: '#FFF8E7',     customFont: 'Georgia', customMp3Url: '', language: '',
    gender: 'male',
  });
  const [invitation, setInvitation] = useState(null);
  const [musicSource, setMusicSource] = useState('default');
  const [customMp3File, setCustomMp3File] = useState(null);
  const [isPreviewPlaying, setIsPreviewPlaying] = useState(false);
  const audioPreviewRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return navigate('/login');
    loadInvitation();
  }, [id]);

  const loadInvitation = async () => {
    try {
      const res = await getMyInvitations();
      const inv = res.data.find(i => i._id === id);
      if (!inv) return navigate('/dashboard');
      setInvitation(inv);

      const existingUrl = inv.customMp3Url || '';
      const isYoutube = existingUrl && (existingUrl.includes('youtube.com/watch') || existingUrl.includes('youtu.be/'));
      const isLocal = existingUrl && existingUrl.startsWith('/');

      setMusicSource(isYoutube ? 'youtube' : existingUrl ? (isLocal ? 'local' : 'upload') : 'default');
      setCustomMp3File(null);

      setForm({
        invitationType: inv.invitationType || 'dasem',
        groomName: inv.groomName,
        brideName: inv.brideName,
        phone: inv.invitationType === 'kanagjegj' ? (inv.bridePhone || '') : (inv.groomPhone || ''),
        weddingDate: inv.weddingDate?.split('T')[0] || '',
        weddingTime: inv.weddingTime,
        location: inv.location,
        locationLat: inv.locationLat || '',
        locationLng: inv.locationLng || '',
        personalMessage: inv.personalMessage || '',
        customPrimaryColor: inv.customPrimaryColor,
        customSecondaryColor: inv.customSecondaryColor,
        customFont: inv.customFont,
        customMp3Url: existingUrl,
        language: inv.language || 'sq',
        gender: inv.gender || 'male',

      });
    } catch (err) {
      navigate('/dashboard');
    }
  };

  const getDefaultSongName = () => {
    return 'Pa muzike (default)';
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
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
      await updateInvitation(id, fd);
      alert('Ftesa u përditësua me sukses!');
    } catch (err) {
      alert('Error: ' + (err.response?.data?.error || 'Something went wrong'));
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    try {
      await publishInvitation(id, true);
      loadInvitation();
      alert('Ftesa u publikua!');
    } catch (err) {
      alert('Error publishing');
    }
  };

  if (!invitation) return <div className="dashboard-loading">Duke ngarkuar...</div>;

  return (
    <div className="create-page">
      <div className="container">
        <div className="create-header">
          <h1>Ndrysho Ftesën</h1>
           <p>{invitation.invitationType === 'kanagjegj' ? invitation.brideName : invitation.invitationType === 'syneti' || invitation.invitationType === 'birthday' ? invitation.groomName : `${invitation.groomName} & ${invitation.brideName}`}</p>
        </div>

        <form onSubmit={handleSubmit}>
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            <h2 className="step-title">{form.invitationType === 'kanagjegj' ? 'Detajet e Kanagjegjit' : form.invitationType === 'syneti' ? 'Detajet e Synetit' : form.invitationType === 'birthday' ? 'Detajet e Ditëlindjes' : 'Detajet e Dasmës'}</h2>
            <div className="create-form">
              <div className="form-group">
                <label>Lloji i Ftesës</label>
                <div className="type-select-grid" style={{ maxWidth: '100%', marginBottom: 20 }}>
                  <div
                    className={`type-select-card ${form.invitationType === 'dasem' ? 'selected' : ''}`}
                    onClick={() => setForm(prev => ({ ...prev, invitationType: 'dasem' }))}
                    style={{ padding: '16px 20px' }}
                  >
                    <div className="type-select-icon" style={{ fontSize: '1.6rem', marginBottom: 6 }}>💍</div>
                    <h3 style={{ fontSize: '1rem' }}>Dasëm</h3>
                  </div>
                  <div
                    className={`type-select-card ${form.invitationType === 'kanagjegj' ? 'selected' : ''}`}
                    onClick={() => setForm(prev => ({ ...prev, invitationType: 'kanagjegj' }))}
                    style={{ padding: '16px 20px' }}
                  >
                    <div className="type-select-icon" style={{ fontSize: '1.6rem', marginBottom: 6 }}>🌙</div>
                    <h3 style={{ fontSize: '1rem' }}>Kanagjegj</h3>
                  </div>
                  <div
                  className={`type-select-card ${form.invitationType === 'syneti' ? 'selected' : ''}`}
                  onClick={() => setForm(prev => ({ ...prev, invitationType: 'syneti' }))}
                  style={{ padding: '16px 20px' }}
                >
                  <div className="type-select-icon" style={{ fontSize: '1.6rem', marginBottom: 6 }}>✨</div>
                  <h3 style={{ fontSize: '1rem' }}>Synet</h3>
                </div>
                <div
                  className={`type-select-card ${form.invitationType === 'birthday' ? 'selected' : ''}`}
                  onClick={() => setForm(prev => ({ ...prev, invitationType: 'birthday' }))}
                  style={{ padding: '16px 20px' }}
                >
                  <div className="type-select-icon" style={{ fontSize: '1.6rem', marginBottom: 6 }}>🎂</div>
                  <h3 style={{ fontSize: '1rem' }}>Ditëlindje</h3>
                </div>
                </div>
              </div>
              <div className="form-row">
                {form.invitationType === 'syneti' || form.invitationType === 'birthday' ? (
                  <>
                    <div className="form-group">
                      <label>{form.invitationType === 'birthday' ? 'Emri i Personit' : 'Emri i Djalit'}</label>
                      <input type="text" name="groomName" value={form.groomName} onChange={handleChange} required />
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
                        <input type="text" name="groomName" value={form.groomName} onChange={handleChange} required={form.invitationType !== 'kanagjegj'} />
                      </div>
                    )}
                    <div className="form-group">
                      <label>Emri i Nuses</label>
                      <input type="text" name="brideName" value={form.brideName} onChange={handleChange} required />
                    </div>
                  </>
                )}
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>{form.invitationType === 'kanagjegj' ? 'Data e Kanagjegjit' : form.invitationType === 'syneti' ? 'Data e Synetit' : form.invitationType === 'birthday' ? 'Data e Ditëlindjes' : 'Data e Dasmës'}</label>
                  <input type="date" name="weddingDate" value={form.weddingDate} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label>Ora</label>
                  <input type="time" name="weddingTime" value={form.weddingTime} onChange={handleChange} required />
                </div>
              </div>
              <div className="form-group">
                <label>Lokacioni</label>
                <input type="text" name="location" value={form.location} onChange={handleChange} required />
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
              <div className="form-row">
                <div className="form-group">
                  <label>Latitude</label>
                  <input type="number" step="any" name="locationLat" value={form.locationLat} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label>Longitude</label>
                  <input type="number" step="any" name="locationLng" value={form.locationLng} onChange={handleChange} />
                </div>
              </div>
              <div className="form-group">
                <label>Mesazhi Personal</label>
                <textarea name="personalMessage" value={form.personalMessage} onChange={handleChange} />
              </div>

              <h2 className="step-title" style={{ marginTop: 40 }}>Personalizo Dizajnin</h2>
              <div className="design-customizer">
                <div className="design-form">
                  <div className="form-group">
                    <label>Ngjyra Kryesore</label>
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
                            id="mp3-upload-edit"
                          />
                          <label htmlFor="mp3-upload-edit" className="music-upload-label">
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
                      <span>{form.brideName}</span>
                    ) : form.invitationType === 'syneti' || form.invitationType === 'birthday' ? (
                      <span>{form.groomName}</span>
                    ) : (
                      <><span>{form.groomName}</span>
                        <span style={{ color: form.customPrimaryColor }}>❤</span>
                        <span>{form.brideName}</span></>
                    )}
                  </div>
                  {form.weddingDate && <div className="preview-date">{new Date(form.weddingDate).toLocaleDateString('sq-AL')}</div>}
                  <div className="preview-ornament" style={{ color: form.customPrimaryColor }}>✦</div>
                </div>
              </div>
            </div>

            <div className="step-buttons" style={{ marginTop: 40 }}>
              <button type="button" className="btn btn-outline" onClick={() => navigate('/dashboard')}>
                Anulo
              </button>
              <button type="button" className="btn btn-outline" onClick={() => {
                if (invitation.isPublished) window.open(`/invitation/${invitation.slug}`, '_blank');
                else alert('Ftesa nuk është publikuar ende.');
              }}>
                <FiEye /> Parapamje
              </button>
              {!invitation.isPublished && (
                <button type="button" className="btn btn-outline" onClick={handlePublish}>
                  <FiGlobe /> Publiko
                </button>
              )}
              <button type="submit" className="btn btn-gold" disabled={saving}>
                <FiSave /> {saving ? 'Duke ruajtur...' : 'Ruaj Ndryshimet'}
              </button>
            </div>
          </motion.div>
        </form>
      </div>
    </div>
  );
}
