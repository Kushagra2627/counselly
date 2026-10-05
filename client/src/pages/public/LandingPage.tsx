import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { PRACTICE_AREAS } from '../../config/constants';
import { Avatar } from '../../components/ui/Avatar';
import './LandingPage.css';

const DEMO_LAWYERS = [
  {
    name: 'Arjun Sharma',
    title: 'Corporate & Commercial Counsel',
    experience: '14 yrs',
    jurisdiction: 'India',
    rate: 'INR 1,20,000–1,80,000/mo',
    areas: ['Corporate', 'Commercial Contracts']
  },
  {
    name: 'Priya Mehta',
    title: 'Technology & SaaS Counsel',
    experience: '10 yrs',
    jurisdiction: 'India + Singapore',
    rate: 'INR 90,000–1,50,000/mo',
    areas: ['SaaS & Technology', 'Privacy & Data Protection']
  },
  {
    name: 'David Chen',
    title: 'IP & Commercial Counsel',
    experience: '12 yrs',
    jurisdiction: 'United States',
    rate: '$8,000–$12,000/mo',
    areas: ['Intellectual Property', 'Commercial Contracts']
  }
];

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="landing-page">
      {/* 1. Hero Section */}
      <section className="hero-section">
        <div className="hero-content container">
          <h1 className="hero-title">Legal expertise, built around your business.</h1>
          <p className="hero-subtitle">
            Connect with verified corporate and commercial lawyers for flexible, ongoing legal support.
          </p>
          <div className="hero-actions">
            <Button size="lg" onClick={() => navigate('/register?role=startup')}>Find Legal Counsel</Button>
            <Button variant="secondary" size="lg" className="btn-hero-secondary" onClick={() => navigate('/register?role=lawyer')}>For Lawyers</Button>
          </div>
        </div>
        <div className="hero-overlay"></div>
      </section>

      {/* 2. Trust Section */}
      <section className="trust-section">
        <div className="container">
          <p className="trust-label">Built for companies that treat legal as a strategic function.</p>
          <div className="trust-pills">
            {PRACTICE_AREAS.slice(0, 7).map(area => (
              <span key={area} className="trust-pill">{area}</span>
            ))}
          </div>
        </div>
      </section>

      {/* 3. How It Works */}
      <section id="how-it-works" className="how-section section">
        <div className="container">
          <h2 className="section-title">How It Works</h2>
          <div className="how-steps">
            <div className="how-step">
              <span className="how-step-num">01</span>
              <h3>Define your legal need</h3>
              <p>Outline your requirements, practice area, and budget to help us understand your strategic goals.</p>
            </div>
            <div className="how-step">
              <span className="how-step-num">02</span>
              <h3>Meet relevant counsel</h3>
              <p>Review curated profiles of verified practitioners matched specifically to your industry and needs.</p>
            </div>
            <div className="how-step">
              <span className="how-step-num">03</span>
              <h3>Build an ongoing engagement</h3>
              <p>Collaborate seamlessly with your matched counsel through our platform for long-term success.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Legal Expertise */}
      <section className="expertise-section section">
        <div className="container">
          <h2 className="section-title">Areas of Expertise</h2>
          <div className="expertise-grid">
            {PRACTICE_AREAS.map(area => (
              <div key={area} className="expertise-card">
                <h4>{area}</h4>
                <p>Specialized counsel to navigate complex {area.toLowerCase()} matters.</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Lawyer Preview Cards */}
      <section className="preview-section section">
        <div className="container">
          <div className="preview-header">
            <h2 className="section-title">Elite Legal Talent</h2>
            <p>Access practitioners with top-tier law firm and in-house experience.</p>
          </div>
          <div className="lawyer-cards">
            {DEMO_LAWYERS.map((lawyer, i) => (
              <div key={i} className="lawyer-card">
                <div className="lawyer-card-header">
                  <Avatar name={lawyer.name} size="lg" />
                  <div>
                    <h4 className="lawyer-name">{lawyer.name}</h4>
                    <p className="lawyer-title">{lawyer.title}</p>
                  </div>
                </div>
                <div className="lawyer-tags">
                  {lawyer.areas.map(a => <Badge key={a}>{a}</Badge>)}
                </div>
                <div className="lawyer-details">
                  <div className="detail-item">
                    <span className="detail-label">Experience</span>
                    <span className="detail-value">{lawyer.experience}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Jurisdiction</span>
                    <span className="detail-value">{lawyer.jurisdiction}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Retainer</span>
                    <span className="detail-value">{lawyer.rate}</span>
                  </div>
                </div>
                <div className="lawyer-demo-label">Demo Profile — Not a verified practitioner</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. Split CTA Section */}
      <section className="split-section">
        <div className="split-side split-startup">
          <div className="split-content">
            <h2>For Startups</h2>
            <p>Get legal support without building a full legal department.</p>
            <ul>
              <li>Access verified, specialized counsel</li>
              <li>Transparent, predictable retainer pricing</li>
              <li>Flexible engagements that scale with you</li>
            </ul>
            <Button variant="primary" onClick={() => navigate('/register?role=startup')}>Hire Counsel</Button>
          </div>
        </div>
        <div className="split-side split-lawyer">
          <div className="split-content">
            <h2>For Lawyers</h2>
            <p>Build long-term relationships with companies that need your expertise.</p>
            <ul>
              <li>Curated matches based on your expertise</li>
              <li>Focus on high-value, strategic work</li>
              <li>Streamlined engagement management</li>
            </ul>
            <Button variant="secondary" onClick={() => navigate('/register?role=lawyer')}>Apply as Counsel</Button>
          </div>
        </div>
      </section>

      {/* 7. Workflow */}
      <section className="workflow-section section">
        <div className="container text-center">
          <h2 className="section-title">The Engagement Flow</h2>
          <div className="workflow-steps">
            <span>Requirement</span>
            <span className="workflow-arrow">→</span>
            <span>Match</span>
            <span className="workflow-arrow">→</span>
            <span>Selection</span>
            <span className="workflow-arrow">→</span>
            <span>Engagement</span>
            <span className="workflow-arrow">→</span>
            <span>Completion</span>
          </div>
        </div>
      </section>

      {/* 8. Final CTA */}
      <section className="final-cta">
        <div className="container text-center">
          <h2>Your next legal matter deserves the right counsel.</h2>
          <Button size="lg" onClick={() => navigate('/register?role=startup')}>Get Started Today</Button>
        </div>
      </section>
    </div>
  );
};
