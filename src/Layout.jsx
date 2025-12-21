import React from 'react';
import { base44 } from "@/api/base44Client";
import { Link } from 'react-router-dom';
import { createPageUrl } from "@/utils";
import { Settings, Home, User, BarChart2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import ParentGate from "@/components/common/ParentGate";
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import BrandHeader from "@/components/common/BrandHeader";

export default function Layout({ children, currentPageName }) {
  const navigate = useNavigate();
  // Fetch user profile settings to apply global styles like high contrast
  const { data: user } = useQuery({ queryKey: ['me'], queryFn: () => base44.auth.me().catch(() => null) });
  
  const { data: userProfile } = useQuery({
    queryKey: ['userProfile'],
    queryFn: async () => {
      if (!user) return null;
      const profiles = await base44.entities.UserProfile.filter({ created_by: user.email });
      return profiles[0] || null;
    },
    enabled: !!user
  });

  const isHighContrast = userProfile?.high_contrast;
  const hideNav = !user || ['Privacy', 'Support', 'LandingPage'].includes(currentPageName);
  const showHeader = !['LandingPage', 'Game'].includes(currentPageName) && user; // Only show auth header if logged in and not on game/landing

  // Base styles
  const baseBg = isHighContrast ? "bg-black" : "bg-slate-50"; // Neutral background to let colors pop
  const baseText = isHighContrast ? "text-yellow-400" : "text-slate-800";
  const navBg = isHighContrast ? "bg-slate-900 border-t-2 border-yellow-400" : "bg-white/90 backdrop-blur-sm border-t border-slate-100 shadow-lg";

  // PWA & Meta Tags Configuration
  React.useEffect(() => {
    // Set basic PWA meta tags dynamically
    const metaTags = [
      { name: 'application-name', content: 'MathBits' },
      { name: 'apple-mobile-web-app-capable', content: 'yes' },
      { name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' },
      { name: 'apple-mobile-web-app-title', content: 'MathBits' },
      { name: 'theme-color', content: isHighContrast ? '#0f172a' : '#f0f9ff' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no' } // Prevent zoom for app-like feel
    ];

    metaTags.forEach(tag => {
      let element = document.querySelector(`meta[name="${tag.name}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute('name', tag.name);
        document.head.appendChild(element);
      }
      element.setAttribute('content', tag.content);
    });

    // Add Favicon
    let link = document.querySelector("link[rel~='icon']");
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.head.appendChild(link);
    }
    link.href = 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6943cd50422bb5e9998a81f4/158ba1973_20251219_1510_MinimalisticMathIcon_remix_01kctctz0gfw2r93yvjvc3j675.png';

    // Add Apple Touch Icon
    let appleLink = document.querySelector("link[rel='apple-touch-icon']");
    if (!appleLink) {
        appleLink = document.createElement('link');
        appleLink.rel = 'apple-touch-icon';
        document.head.appendChild(appleLink);
    }
    appleLink.href = 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6943cd50422bb5e9998a81f4/158ba1973_20251219_1510_MinimalisticMathIcon_remix_01kctctz0gfw2r93yvjvc3j675.png';

    document.title = "MathBits";
  }, [isHighContrast]);

  return (
    <div className={`min-h-screen ${baseBg} ${baseText} transition-colors duration-300 font-sans selection:bg-sky-200 selection:text-sky-900 flex flex-col`}>
      <style>{`
        body { 
          overscroll-behavior-y: none; 
          -webkit-tap-highlight-color: transparent;
        }
        .tap-target {
          min-height: 48px;
          min-width: 48px;
        }
      `}</style>
      
      {showHeader && <BrandHeader isHighContrast={isHighContrast} />}

      {/* Main Content Area */}
      <main className="flex-grow w-full max-w-md mx-auto p-4 pb-24 md:max-w-4xl md:p-8">
        {/* Page Transitions */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPageName}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="h-full"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Bottom Navigation Bar - Mobile First, Accessible */}
      {!hideNav && (
        <nav className={`fixed bottom-0 left-0 right-0 ${navBg} z-50`}>
          <div className="max-w-md mx-auto flex justify-around items-center p-4 md:max-w-4xl">
            <NavItem 
              icon={Home} 
              label="Home" 
              isActive={currentPageName === 'Home'} 
              to={createPageUrl('Home')}
              isHighContrast={isHighContrast}
            />
            
            <ParentGate onUnlock={() => navigate(createPageUrl('ParentDashboard'))}>
              <div className="pointer-events-none">
                <NavItem 
                  icon={BarChart2} 
                  label="Progress" 
                  isActive={currentPageName === 'ParentDashboard'} 
                  to="#"
                  isHighContrast={isHighContrast}
                />
              </div>
            </ParentGate>

            <ParentGate onUnlock={() => navigate(createPageUrl('Settings'))}>
              <div className="pointer-events-none">
                <NavItem 
                  icon={Settings} 
                  label="Settings" 
                  isActive={currentPageName === 'Settings'} 
                  to="#"
                  isHighContrast={isHighContrast}
                />
              </div>
            </ParentGate>
          </div>
        </nav>
      )}
    </div>
  );
}

function NavItem({ icon: Icon, label, isActive, to, isHighContrast }) {
  const activeColor = isHighContrast ? "text-yellow-400 scale-110" : "text-[hsl(191,75%,29%)] scale-110";
  const inactiveColor = isHighContrast ? "text-slate-500" : "text-slate-400";
  
  return (
    <Link 
      to={to} 
      className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-300 tap-target
        ${isActive ? activeColor : inactiveColor}
        active:scale-95
      `}
    >
      <Icon className="w-8 h-8 mb-1" strokeWidth={2.5} />
      <span className="text-xs font-bold tracking-wide">{label}</span>
    </Link>
  );
}