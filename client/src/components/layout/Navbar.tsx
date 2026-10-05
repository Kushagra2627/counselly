import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../ui/Button';
import './Navbar.css';

export const Navbar: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`navbar ${scrolled ? 'navbar-scrolled' : ''}`}>
      <div className="container flex-between" style={{ height: '100%' }}>
        <Link to="/" className="navbar-logo">
          Counselly
        </Link>
        
        <div className="navbar-links">
          <Link to="/?role=startup" className="navbar-link">For Startups</Link>
          <Link to="/?role=lawyer" className="navbar-link">For Lawyers</Link>
          <a href="#how-it-works" className="navbar-link">How It Works</a>
        </div>

        <div className="navbar-actions">
          <Button variant="ghost" onClick={() => navigate('/login')}>Sign In</Button>
          <Button variant="primary" onClick={() => navigate('/register')}>Get Started</Button>
        </div>
      </div>
    </nav>
  );
};
