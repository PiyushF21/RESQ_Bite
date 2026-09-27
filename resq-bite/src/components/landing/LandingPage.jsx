import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../layout/Navbar';
import HeroSection from './HeroSection';
import LiveImpactCounter from './LiveImpactCounter';
import HowItWorks from './HowItWorks';
import TestimonialsSection from './TestimonialsSection';
import MissionSection from './MissionSection';
import FAQSection from './FAQSection';
import PartnersMarquee from './PartnersMarquee';
import Footer from '../layout/Footer';
import AuthModal from '../auth/AuthModal';

export default function LandingPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('login');

  useEffect(() => {
    if (user) {
      navigate(`/dashboard/${user.role}`);
    }
  }, [user, navigate]);

  const handleAuthClick = (mode) => {
    setAuthMode(mode);
    setShowAuthModal(true);
  };

  return (
    <div className="min-h-screen bg-stone-50 font-sans selection:bg-emerald-500/30">
      <Navbar onAuthClick={handleAuthClick} />
      
      <main>
        <HeroSection 
          onGetStarted={() => handleAuthClick('register')} 
          onNGOPartner={() => handleAuthClick('register')} 
        />
        <LiveImpactCounter />
        <HowItWorks />
        <TestimonialsSection />
        <MissionSection />
        <FAQSection />
        <PartnersMarquee />
      </main>

      <Footer />

      {showAuthModal && (
        <AuthModal 
          isOpen={showAuthModal} 
          onClose={() => setShowAuthModal(false)} 
          initialMode={authMode} 
        />
      )}
    </div>
  );
}
