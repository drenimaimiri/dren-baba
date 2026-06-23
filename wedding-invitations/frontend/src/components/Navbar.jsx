import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiHeart, FiUser, FiLogOut, FiMenu, FiX, FiGrid, FiSun, FiMoon, FiSmartphone } from 'react-icons/fi';
import './Navbar.css';

export default function Navbar({ theme, toggleTheme }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  const menuRef = useRef(null);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setMenuOpen(false);
    navigate('/');
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuOpen && menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpen]);

  return (
    <nav className="navbar" ref={menuRef}>
      <div className="nav-container">
          <Link to="/" className="nav-logo">
          <FiHeart className="nav-logo-icon" />
          <span>FtesaDasme</span>
        </Link>

        <button className="nav-toggle" onClick={() => setMenuOpen(!menuOpen)} aria-label={menuOpen ? 'Mbyll menunë' : 'Hap menunë'}>
          {menuOpen ? <FiX /> : <FiMenu />}
        </button>

        <div className={`nav-links ${menuOpen ? 'active' : ''}`}>
          <button className="theme-toggle" onClick={toggleTheme} aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}>
            {theme === 'light' ? <FiMoon /> : <FiSun />}
          </button>
          <Link to="/" onClick={() => setMenuOpen(false)}>Ballina</Link>

          {user ? (
            <>
              <Link to="/dashboard" onClick={() => setMenuOpen(false)}>
                <FiGrid /> Dashboard
              </Link>
              <Link to="/create-qr" onClick={() => setMenuOpen(false)}>
                <FiSmartphone /> QR Code
              </Link>
              <Link to="/create" onClick={() => setMenuOpen(false)} className="nav-create-btn">
                Krijo Ftesë
              </Link>
              {user.role === 'admin' && (
                <Link to="/admin" onClick={() => setMenuOpen(false)}>Admin</Link>
              )}
              <div className="nav-user">
                <FiUser />
                <span>{user.name}</span>
              </div>
              <button onClick={handleLogout} className="nav-logout-btn">
                <FiLogOut /> Dil
              </button>
            </>
          ) : (
            <>
              <Link to="/login" onClick={() => setMenuOpen(false)}>Hyr</Link>
              <Link to="/register" onClick={() => setMenuOpen(false)} className="nav-register-btn">Regjistrohu</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
