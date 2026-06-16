import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import CreateInvitation from './pages/CreateInvitation';
import EditInvitation from './pages/EditInvitation';
import InvitationView from './pages/InvitationView';
import AdminDashboard from './pages/AdminDashboard';

export default function App() {
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'light';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  return (
    <>
      <Navbar theme={theme} toggleTheme={toggleTheme} />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/create" element={<CreateInvitation />} />
        <Route path="/edit/:id" element={<EditInvitation />} />
        <Route path="/invitation/:slug" element={<InvitationView />} />
        <Route path="/admin" element={user?.role === 'admin' ? <AdminDashboard /> : <Home />} />
      </Routes>
      <Footer />
    </>
  );
}
