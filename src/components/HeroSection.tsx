'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Download, Mail, ChevronDown, Terminal } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

export function HeroSection() {
  const { t } = useLanguage();
  const [displayText, setDisplayText] = useState('');
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(true);

  const phrases = [
    'Full-Stack Developer',
    'Laravel Expert',
    'React Enthusiast',
    'Problem Solver',
    'Code Artisan',
  ];

  useEffect(() => {
    const phrase = phrases[currentPhraseIndex];
    let currentIndex = 0;
    let timeoutId: NodeJS.Timeout;

    const typeCharacter = () => {
      if (currentIndex <= phrase.length) {
        setDisplayText(phrase.slice(0, currentIndex));
        currentIndex++;
        timeoutId = setTimeout(typeCharacter, 100);
      } else {
        setIsTyping(false);
        // Start erasing after a pause
        timeoutId = setTimeout(() => {
          setIsTyping(true);
          eraseCharacter();
        }, 2000);
      }
    };

    const eraseCharacter = () => {
      if (currentIndex >= 0) {
        setDisplayText(phrase.slice(0, currentIndex));
        currentIndex--;
        timeoutId = setTimeout(eraseCharacter, 50);
      } else {
        // Move to next phrase
        setCurrentPhraseIndex((prev) => (prev + 1) % phrases.length);
      }
    };

    typeCharacter();

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [currentPhraseIndex]);

  const handleDownloadResume = async () => {
    try {
      console.log('📥 Starting resume download...');
      const res = await fetch('/api/resume');
      let url = `/resume.pdf?v=${Date.now()}`;
      if (res.ok) {
        const data = await res.json();
        if (data?.pdfUrl) {
          url = `${data.pdfUrl}?v=${Date.now()}`;
        }
      }
      const link = document.createElement('a');
      link.href = url;
      link.download = 'Resume.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      console.log('✅ Download triggered successfully');
    } catch (error) {
      console.error('❌ Error downloading resume:', error);
      window.open(`/resume.pdf?v=${Date.now()}`, '_blank');
    }
  };

  const handleScrollToContact = () => {
    const contactSection = document.querySelector('#contact');
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleScrollToProjects = () => {
    const projectsSection = document.querySelector('#projects');
    if (projectsSection) {
      projectsSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="home" className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-neutral-50 via-white to-neutral-100 dark:from-neutral-950 dark:via-neutral-900 dark:to-black">
      {/* Background Elements */}
      <div className="absolute inset-0 z-0">
        {/* Floating code snippets */}
        <motion.div
          className="absolute top-20 left-10 text-xs text-neutral-400 dark:text-neutral-600 font-mono"
          animate={{
            y: [0, -20, 0],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          const developer = {'{'}
          <br />
          &nbsp;&nbsp;name: "Coderman",
          <br />
          &nbsp;&nbsp;role: "Full-Stack",
          <br />
          &nbsp;&nbsp;passion: true
          <br />
          {'}'};
        </motion.div>

        <motion.div
          className="absolute bottom-20 right-10 text-xs text-neutral-400 dark:text-neutral-600 font-mono"
          animate={{
            y: [0, 20, 0],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          function buildSolutions() {'{'}
          <br />
          &nbsp;&nbsp;innovate();
          <br />
          &nbsp;&nbsp;create();
          <br />
          &nbsp;&nbsp;deliver();
          <br />
          {'{'}
        </motion.div>

        {/* Terminal window */}
        <motion.div
          className="absolute top-1/3 right-10 w-64 h-32 bg-neutral-900 dark:bg-black rounded-lg shadow-xl border border-neutral-700 hidden lg:block"
          animate={{
            scale: [1, 1.02, 1],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <div className="flex items-center p-2 border-b border-neutral-700">
            <div className="flex space-x-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            </div>
            <span className="ml-3 text-xs text-neutral-400">coderman-portfolio:~</span>
          </div>
          <div className="p-3 text-green-400 text-xs font-mono">
            <div>$ npm run portfolio</div>
            <div className="mt-1">
              <span className="text-blue-400">✓</span> Building amazing experiences...
            </div>
            <div className="mt-1">
              <span className="animate-pulse">▋</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 z-10">
        <div className="text-center">
          {/* Greeting */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-4"
          >
            <span className="text-accent-blue dark:text-accent-blue font-medium">
              {t('hero.greeting')}
            </span>
          </motion.div>

          {/* Name */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-4xl md:text-6xl lg:text-7xl font-bold text-neutral-900 dark:text-white mb-4"
          >
            {t('hero.name')}
          </motion.h1>

          {/* Animated Title */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="h-16 md:h-20 mb-6"
          >
            <div className="text-xl md:text-2xl lg:text-3xl font-mono text-neutral-600 dark:text-neutral-400">
              <span className="text-accent-green dark:text-accent-green">&gt; </span>
              {displayText}
              <span className={`inline-block w-3 h-6 bg-accent-green dark:bg-accent-green ml-1 ${isTyping ? 'animate-pulse' : ''}`}></span>
            </div>
          </motion.div>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="text-lg text-neutral-600 dark:text-neutral-400 mb-8 max-w-2xl mx-auto"
          >
            {t('hero.subtitle')}
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <button
              onClick={handleDownloadResume}
              className="flex items-center px-6 py-3 bg-accent-blue hover:bg-accent-blue-dark text-white rounded-lg transition-all duration-200 hover:scale-105 font-medium"
            >
              <Download className="w-5 h-5 mr-2" />
              {t('hero.downloadResume')}
            </button>
            
            <button
              onClick={handleScrollToContact}
              className="flex items-center px-6 py-3 border-2 border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:border-accent-blue dark:hover:border-accent-blue hover:text-accent-blue dark:hover:text-accent-blue rounded-lg transition-all duration-200 hover:scale-105 font-medium"
            >
              <Mail className="w-5 h-5 mr-2" />
              {t('hero.contactMe')}
            </button>
          </motion.div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        animate={{
          y: [0, 10, 0],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <button
          onClick={handleScrollToProjects}
          className="flex flex-col items-center text-neutral-500 dark:text-neutral-400 hover:text-accent-blue dark:hover:text-accent-blue transition-colors duration-200"
        >
          <span className="text-sm mb-2">Scroll to explore</span>
          <ChevronDown className="w-6 h-6" />
        </button>
      </motion.div>
    </section>
  );
}
