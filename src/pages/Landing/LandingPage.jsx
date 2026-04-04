import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Eye, 
  ShieldAlert, 
  Cpu, 
  Activity, 
  ArrowRight,
  Database,
  Users,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import './LandingPage.css';

const LandingPage = () => {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="landing-page dark-theme">
      {/* Background Elements */}
      <div className="bg-grid"></div>
      <div className="bg-glow blob-1"></div>
      <div className="bg-glow blob-2"></div>

      {/* Navigation */}
      <nav className={`landing-nav ${scrolled ? 'nav-scrolled glass' : ''}`}>
        <div className="nav-inner">
          <div className="nav-brand" onClick={() => navigate('/')}>
            <div className="nav-logo shadow-sm">
              <Activity size={20} strokeWidth={2.5} color="#fff" />
            </div>
            <span className="nav-title">GoldenHour</span>
          </div>
          
          <div className="nav-links hidden-mobile">
            <a href="#how-it-works">How it Works</a>
            <a href="#features">Features</a>
            <a href="#security">Security</a>
          </div>

          <div className="nav-actions">
            <button className="btn-nav-outline" onClick={() => navigate('/login')}>
              Log in
            </button>
            <button className="btn-nav-primary" onClick={() => navigate('/login')}>
              Get Started <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero">
        <div className={`hero-content ${isVisible ? 'animate-fade-up' : ''}`}>
          <div className="hero-badge badge-pulse glass">
            <Activity size={14} color="#3B82F6" /> System Active & Ready
          </div>
          
          <h1 className="hero-title">
            Intelligent Triage for the <br />
            <span className="hero-highlight text-gradient d-block">Golden Hour</span>
          </h1>
          
          <p className="hero-subtitle">
            Harnessing Computer Vision and AI to instantly assess casualty severity during critical incidents, connecting first responders with hospitals in real-time.
          </p>
          
          <div className="hero-cta">
            <button className="btn btn-primary-large btn-glow" onClick={() => navigate('/login')}>
              Enter System <ArrowRight size={20} />
            </button>
            <button className="btn btn-secondary-large" onClick={() => document.getElementById('how-it-works').scrollIntoView({ behavior: 'smooth' })}>
              Learn More
            </button>
          </div>

          <div className="hero-trust">
            <div className="trust-avatars">
              <div className="trust-avatar" style={{zIndex: 3}}><ShieldCheck size={16} color="#10B981" /></div>
              <div className="trust-avatar" style={{zIndex: 2, backgroundColor: '#DBEAFE', color: '#1D4ED8'}}><Users size={16} /></div>
              <div className="trust-avatar" style={{zIndex: 1, backgroundColor: '#E0E7FF', color: '#4338CA'}}><Database size={16} /></div>
            </div>
            <div className="trust-text">Trusted by emergency responders globally</div>
          </div>
        </div>

        <div className={`hero-visual ${isVisible ? 'animate-slide-left' : ''}`}>
          <div className="glass-mockup hover-lift">
            <div className="mockup-header">
              <div className="dots"><i></i><i></i><i></i></div>
              <span className="mockup-url">System Overview</span>
            </div>
            <div className="mockup-body align-left">
              <div className="preview-stat-row dash-row">
                <div className="preview-stat dash-card">
                  <div className="preview-icon red-icon"><ShieldAlert size={20} color="#EF4444" /></div>
                  <div className="text-left-margin">
                    <span className="preview-stat-val dash-num">12</span>
                    <span className="preview-stat-lbl dash-val">Critical</span>
                  </div>
                </div>
                <div className="preview-stat dash-card">
                  <div className="preview-icon blue-icon"><Activity size={20} color="#3B82F6" /></div>
                  <div className="text-left-margin">
                    <span className="preview-stat-val dash-num">48</span>
                    <span className="preview-stat-lbl dash-val">Active</span>
                  </div>
                </div>
              </div>
              <div className="preview-severity-bars dash-alert" style={{ flexDirection: 'column', gap: '8px', alignItems: 'stretch' }}>
                <div className="sev-bar"><span className="sev-label" style={{color: '#94A3B8'}}>T1 (Red)</span><div className="sev-fill" style={{width: '35%', backgroundColor: '#EF4444', height: '8px', borderRadius: '4px'}}></div></div>
                <div className="sev-bar"><span className="sev-label" style={{color: '#94A3B8'}}>T2 (Yellow)</span><div className="sev-fill" style={{width: '50%', backgroundColor: '#F59E0B', height: '8px', borderRadius: '4px'}}></div></div>
                <div className="sev-bar"><span className="sev-label" style={{color: '#94A3B8'}}>T3 (Green)</span><div className="sev-fill" style={{width: '75%', backgroundColor: '#10B981', height: '8px', borderRadius: '4px'}}></div></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Metrics Section */}
      <section className="stats-section metrics-section">
        <div className="stats-grid metrics-grid">
          <div className="stat-card metric-item glass-panel">
            <h3 className="stat-value metric-val">&lt; 3s</h3>
            <p className="stat-label metric-lbl">Assessment Time</p>
          </div>
          <div className="stat-card metric-item glass-panel">
            <h3 className="stat-value metric-val">99.9%</h3>
            <p className="stat-label metric-lbl">Uptime</p>
          </div>
          <div className="stat-card metric-item glass-panel">
            <h3 className="stat-value metric-val">AES-256</h3>
            <p className="stat-label metric-lbl">Encrypted Data</p>
          </div>
          <div className="stat-card metric-item glass-panel">
            <h3 className="stat-value metric-val">24/7</h3>
            <p className="stat-label metric-lbl">Continuous Sync</p>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="workflow-section" id="how-it-works">
        <div className="workflow-container glass-panel">
          <div className="workflow-header">
            <div className="section-tag mb-2" style={{color: '#3B82F6', fontWeight: 600}}><Activity size={16} className="inline mr-1" /> Workflow</div>
            <h2 className="section-title">The Golden Hour Protocol</h2>
            <p className="section-subtitle">Seamless integration from the disaster scene directly to emergency room dashboards.</p>
          </div>

          <div className="steps-row">
            <div className="step-wrapper">
              <div className="step-card">
                <div className="step-number">01</div>
                <div className="step-icon-wrap" style={{color: '#3B82F6', marginBottom: '8px'}}><Eye size={24} /></div>
                <h4 className="step-title">Capture & Upload</h4>
                <p className="step-desc">First responders capture scene data or images using mobile devices or drone feeds.</p>
              </div>
              <div className="step-arrow hidden-mobile"><ArrowRight size={24} color="#334155" /></div>
            </div>
            
            <div className="step-wrapper">
              <div className="step-card">
                <div className="step-number">02</div>
                <div className="step-icon-wrap" style={{color: '#F59E0B', marginBottom: '8px'}}><Cpu size={24} /></div>
                <h4 className="step-title">AI Analysis</h4>
                <p className="step-desc">Our Neural Networks quickly identify severe injuries and sort patients into priority groups.</p>
              </div>
              <div className="step-arrow hidden-mobile"><ArrowRight size={24} color="#334155" /></div>
            </div>

            <div className="step-wrapper">
              <div className="step-card">
                <div className="step-number">03</div>
                <div className="step-icon-wrap" style={{color: '#10B981', marginBottom: '8px'}}><Database size={24} /></div>
                <h4 className="step-title">Hospital Sync</h4>
                <p className="step-desc">Receiving hospitals get live dashboards of incoming patients to prepare resources.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section" id="features">
        <div className="section-header text-center">
          <div className="section-tag mb-2" style={{color: '#10B981', fontWeight: 600}}><ShieldCheck size={16} className="inline mr-1" /> Capabilities</div>
          <h2 className="section-title">Engineered for Extremes</h2>
          <p className="section-subtitle">Delivering robust performance, accuracy, and security when lives are on the line.</p>
        </div>

        <div className="features-grid">
          <div className="feature-card glass-panel hover-lift">
            <div className="feature-icon-wrapper" style={{background: 'rgba(59, 130, 246, 0.1)', color: '#3B82F6'}}>
              <Eye size={28} />
            </div>
            <h3 className="feature-title">Computer Vision Triage</h3>
            <p className="feature-desc">Advanced CNN models calculate injury severity based on posture, bleeding, and visibility parameters.</p>
          </div>
          <div className="feature-card glass-panel hover-lift">
            <div className="feature-icon-wrapper" style={{background: 'rgba(16, 185, 129, 0.1)', color: '#10B981'}}>
              <CheckCircle2 size={28} />
            </div>
            <h3 className="feature-title">High Accuracy</h3>
            <p className="feature-desc">Trained on thousands of simulated casualty scenarios to minimize false negatives in critical situations.</p>
          </div>
          <div className="feature-card glass-panel hover-lift">
            <div className="feature-icon-wrapper" style={{background: 'rgba(239, 68, 68, 0.1)', color: '#EF4444'}}>
              <ShieldAlert size={28} />
            </div>
            <h3 className="feature-title">Low Latency Edge AI</h3>
            <p className="feature-desc">Optimized for rapid inference, returning prioritization data in seconds even on limited bandwidth.</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="glass-panel cta-box text-center hover-lift" style={{position: 'relative', overflow: 'hidden'}}>
          <div className="cta-glow" style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', height: '100px', background: 'radial-gradient(circle, rgba(59,130,246,0.2) 0%, transparent 70%)', pointerEvents: 'none' }}></div>
          <h2 style={{color: '#fff', fontSize: '2rem', marginBottom: '16px'}}>Ready to optimize triage response?</h2>
          <p style={{color: '#94A3B8', fontSize: '1.2rem', marginBottom: '32px', maxWidth: '600px', margin: '0 auto 32px'}}>Join the networks utilizing cutting-edge AI for emergency casualty management.</p>
          <div className="cta-actions" style={{display: 'flex', justifyContent: 'center'}}>
            <button className="btn-primary-large" onClick={() => navigate('/login')}>
              Launch Platform
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-top">
          <div className="footer-brand">
            <div className="nav-logo" style={{width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#3B82F6', borderRadius: '8px', marginBottom: '16px'}}>
              <Activity size={18} strokeWidth={2.5} color="#fff" />
            </div>
            <span style={{fontSize: '1.2rem', fontWeight: 600, color: '#F8FAFC'}}>GoldenHour System</span>
            <p className="footer-desc" style={{color: '#64748B', marginTop: '12px', lineHeight: 1.6, maxWidth: '300px'}}>
              Next-generation triage technology saving lives by optimizing the critical first 60 minutes after a disaster.
            </p>
          </div>
          <div className="footer-links">
            <div className="link-col">
              <h4 style={{color: '#F8FAFC', marginBottom: '16px', fontWeight: 600}}>System</h4>
              <a href="#" style={{color: '#64748B', textDecoration: 'none', marginBottom: '12px', display: 'block', transition: 'color 0.2s'}}>AI Models</a>
              <a href="#" style={{color: '#64748B', textDecoration: 'none', marginBottom: '12px', display: 'block', transition: 'color 0.2s'}}>Edge Infrastructure</a>
              <a href="#" style={{color: '#64748B', textDecoration: 'none', marginBottom: '12px', display: 'block', transition: 'color 0.2s'}}>Hospital Dashboards</a>
            </div>
            <div className="link-col">
              <h4 style={{color: '#F8FAFC', marginBottom: '16px', fontWeight: 600}}>Company</h4>
              <a href="#" style={{color: '#64748B', textDecoration: 'none', marginBottom: '12px', display: 'block', transition: 'color 0.2s'}}>About Us</a>
              <a href="#" style={{color: '#64748B', textDecoration: 'none', marginBottom: '12px', display: 'block', transition: 'color 0.2s'}}>Security</a>
              <a href="#" style={{color: '#64748B', textDecoration: 'none', marginBottom: '12px', display: 'block', transition: 'color 0.2s'}}>Contact</a>
            </div>
            <div className="link-col">
              <h4 style={{color: '#F8FAFC', marginBottom: '16px', fontWeight: 600}}>Legal</h4>
              <a href="#" style={{color: '#64748B', textDecoration: 'none', marginBottom: '12px', display: 'block', transition: 'color 0.2s'}}>Privacy Policy</a>
              <a href="#" style={{color: '#64748B', textDecoration: 'none', marginBottom: '12px', display: 'block', transition: 'color 0.2s'}}>Terms of Service</a>
              <a href="#" style={{color: '#64748B', textDecoration: 'none', marginBottom: '12px', display: 'block', transition: 'color 0.2s'}}>HIPAA</a>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p style={{color: '#64748B', textAlign: 'center', paddingTop: '24px', borderTop: '1px solid #1E293B'}}>&copy; {new Date().getFullYear()} GoldenHour Emergency Technologies. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
