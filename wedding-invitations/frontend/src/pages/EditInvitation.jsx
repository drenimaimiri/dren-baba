import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiSave, FiEye, FiGlobe, FiSend } from 'react-icons/fi';
import { getMyInvitations, updateInvitation, publishInvitation } from '../api';
import './CreateInvitation.css';

export default function EditInvitation() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    groomName: '', brideName: '', phone: '',
    weddingDate: '', weddingTime: '',
    location: '', locationLat: '', locationLng: '', personalMessage: '',
    customPrimaryColor: '#D4AF37', customSecondaryColor: '#FFF8E7', customFont: 'Georgia',
    photos: []
  });
  const [existingPhotos, setExistingPhotos] = useState([]);
  const [preview, setPreview] = useState([]);
  const [invitation, setInvitation] = useState(null);

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
      setForm({
        groomName: inv.groomName,
        brideName: inv.brideName,
        phone: inv.groomPhone || '',
        weddingDate: inv.weddingDate?.split('T')[0] || '',
        weddingTime: inv.weddingTime,
        location: inv.location,
        locationLat: inv.locationLat || '',
        locationLng: inv.locationLng || '',
        personalMessage: inv.personalMessage || '',
        customPrimaryColor: inv.customPrimaryColor,
        customSecondaryColor: inv.customSecondaryColor,
        customFont: inv.customFont,
        photos: []
      });
      setExistingPhotos(inv.photos || []);
    } catch (err) {
      navigate('/dashboard');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handlePhoto = (e) => {
    const files = Array.from(e.target.files);
    setForm(prev => ({ ...prev, photos: [...prev.photos, ...files] }));
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (ev) => setPreview(p => [...p, ev.target.result]);
      reader.readAsDataURL(file);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const fd = new FormData();
      Object.keys(form).forEach(key => {
        if (key === 'photos') {
          form.photos.forEach(photo => fd.append('photos', photo));
        } else if (key === 'phone') {
          fd.append('groomPhone', form[key]);
        } else {
          fd.append(key, form[key]);
        }
      });
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
          <p>{invitation.groomName} & {invitation.brideName}</p>
        </div>

        <form onSubmit={handleSubmit}>
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            <h2 className="step-title">Detajet e Dasmës</h2>
            <div className="create-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Emri i Dhëndrit</label>
                  <input type="text" name="groomName" value={form.groomName} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label>Emri i Nuses</label>
                  <input type="text" name="brideName" value={form.brideName} onChange={handleChange} required />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Data e Dasmës</label>
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

              <div className="form-group">
                <label>Fotot Ekzistuese</label>
                <div className="photo-previews">
                  {existingPhotos.map((p, i) => (
                    <div key={i} className="photo-preview-item">
                      <img src={p} alt="" />
                    </div>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label>Shto Foto të Reja</label>
                <div className="photo-upload-area">
                  <input type="file" multiple accept="image/*" onChange={handlePhoto} id="photo-upload" hidden />
                  <label htmlFor="photo-upload" className="photo-upload-label">
                    Shto Foto
                  </label>
                </div>
                {preview.length > 0 && (
                  <div className="photo-previews">
                    {preview.map((p, i) => (
                      <div key={i} className="photo-preview-item">
                        <img src={p} alt="" />
                      </div>
                    ))}
                  </div>
                )}
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
                    </select>
                  </div>
                </div>

                <div className="design-preview-box" style={{
                  fontFamily: form.customFont,
                  background: `linear-gradient(135deg, ${form.customSecondaryColor}, white)`
                }}>
                  <div className="preview-ornament" style={{ color: form.customPrimaryColor }}>✦</div>
                  <div className="preview-couple">
                    <span>{form.groomName}</span>
                    <span style={{ color: form.customPrimaryColor }}>❤</span>
                    <span>{form.brideName}</span>
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
