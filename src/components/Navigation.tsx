'use client';

import { useState, useEffect } from 'react';
import { Menu, X, Code, Download, Mail } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { ThemeToggle } from '@/components/ThemeToggle';
import { LanguageToggle } from '@/components/LanguageToggle';

export function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { t } = useLanguage();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { href: '#home', label: t('nav.home') },
    { href: '#projects', label: t('nav.projects') },
    { href: '#skills', label: t('nav.skills') },
    { href: '#contact', label: t('nav.contact') },
  ];

  const handleNavClick = (href: string) => {
    setIsMobileMenuOpen(false);
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleDownloadResume = () => {
    // Replace with actual resume URL
    window.open('/resume.pdf', '_blank');
  };

  const handleContactClick = () => {
    setIsMobileMenuOpen(false);
    const contactSection = document.querySelector('#contact');
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-white/90 dark:bg-neutral-900/90 backdrop-blur-md shadow-lg'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Code className="w-8 h-8 text-accent-blue dark:text-accent-blue" />
            <span className="ml-2 text-xl font-semibold text-neutral-900 dark:text-white">
              Jaime Sierra
            </span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <button
                key={item.href}
                onClick={() => handleNavClick(item.href)}
                className="text-neutral-600 dark:text-neutral-300 hover:text-accent-blue dark:hover:text-accent-blue transition-colors duration-200 font-medium"
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            <button
              onClick={handleDownloadResume}
              className="flex items-center px-4 py-2 text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:text-accent-blue dark:hover:text-accent-blue transition-colors duration-200"
            >
              <Download className="w-4 h-4 mr-2" />
              {t('hero.downloadResume')}
            </button>
            
            <button
              onClick={handleContactClick}
              className="flex items-center px-4 py-2 bg-accent-blue hover:bg-accent-blue-dark text-white rounded-lg transition-colors duration-200 font-medium"
            >
              <Mail className="w-4 h-4 mr-2" />
              {t('hero.contactMe')}
            </button>

            <div className="flex items-center space-x-2">
              <LanguageToggle />
              <ThemeToggle />
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-2">
            <LanguageToggle />
            <ThemeToggle />
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-lg text-neutral-600 dark:text-neutral-300 hover:text-accent-blue dark:hover:text-accent-blue hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors duration-200"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-white dark:bg-neutral-900 rounded-lg shadow-lg border border-neutral-200 dark:border-neutral-800">
              {navItems.map((item) => (
                <button
                  key={item.href}
                  onClick={() => handleNavClick(item.href)}
                  className="block w-full text-left px-3 py-2 text-neutral-700 dark:text-neutral-300 hover:text-accent-blue dark:hover:text-accent-blue hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-md transition-colors duration-200 font-medium"
                >
                  {item.label}
                </button>
              ))}
              <div className="border-t border-neutral-200 dark:border-neutral-800 pt-2 mt-2">
                <button
                  onClick={handleDownloadResume}
                  className="flex items-center w-full px-3 py-2 text-neutral-700 dark:text-neutral-300 hover:text-accent-blue dark:hover:text-accent-blue transition-colors duration-200 font-medium"
                >
                  <Download className="w-4 h-4 mr-2" />
                  {t('hero.downloadResume')}
                </button>
                <button
                  onClick={handleContactClick}
                  className="flex items-center w-full px-3 py-2 bg-accent-blue hover:bg-accent-blue-dark text-white rounded-md transition-colors duration-200 font-medium"
                >
                  <Mail className="w-4 h-4 mr-2" />
                  {t('hero.contactMe')}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}