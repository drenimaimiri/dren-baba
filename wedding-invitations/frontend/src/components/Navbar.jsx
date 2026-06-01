import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiHeart, FiUser, FiLogOut, FiMenu, FiX, FiGrid } from 'react-icons/fi';
import './Navbar.css';

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || 'null');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/" className="nav-logo">
          <FiHeart className="nav-logo-icon" />
          FtesaDasme
        </Link>

        <button className="nav-toggle" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <FiX /> : <FiMenu />}
        </button>

        <div className={`nav-links ${menuOpen ? 'active' : ''}`}>
          <Link to="/" onClick={() => setMenuOpen(false)}>Ballina</Link>

          {user ? (
            <>
              <Link to="/dashboard" onClick={() => setMenuOpen(false)}>
                <FiGrid /> Dashboard
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
