import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const CURRENT_YEAR = new Date().getFullYear();

export const Footer: React.FC = () => {
  return (
    <footer className="footer">
      <div className="container footer-content">
        <div className="footer-brand">
          <Link to="/" className="footer-logo">Counselly</Link>
          <p className="footer-tagline">Legal expertise, built around your business.</p>
        </div>
        
        <div className="footer-links-grid">
          <div className="footer-col">
            <h4 className="footer-col-title">Company</h4>
            <Link to="/about">About</Link>
            <Link to="/?role=startup">For Startups</Link>
            <Link to="/?role=lawyer">For Lawyers</Link>
            <a href="#how-it-works">How It Works</a>
          </div>
          <div className="footer-col">
            <h4 className="footer-col-title">Legal</h4>
            <Link to="/privacy">Privacy Policy</Link>
            <Link to="/terms">Terms of Service</Link>
          </div>
          <div className="footer-col">
            <h4 className="footer-col-title">Contact</h4>
            <a href="mailto:support@counselly.com">support@counselly.com</a>
          </div>
        </div>
      </div>
      <div className="container footer-bottom">
        <p>&copy; {CURRENT_YEAR} Counselly. All rights reserved.</p>
      </div>
    </footer>
  );
};
