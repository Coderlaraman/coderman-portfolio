'use client';

import { motion } from 'framer-motion';
import { Heart, Code } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

export function Footer() {
  const { t } = useLanguage();
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    {
      name: 'LinkedIn',
      url: 'https://linkedin.com/in/jaime-alberto-sierra-mazo',
      icon: '🌐',
    },
    {
      name: 'GitHub',
      url: 'https://github.com/jaime-alberto-sierra-mazo',
      icon: '💻',
    },
    {
      name: 'Email',
      url: 'mailto:jaime.alberto.sierra.mazo@gmail.com',
      icon: '📧',
    },
  ];

  return (
    <footer className="bg-neutral-900 text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center mb-4">
              <Code className="w-8 h-8 text-accent-blue mr-2" />
              <span className="text-xl font-semibold">Jaime Sierra</span>
            </div>
            <p className="text-neutral-400 mb-4">
              {t('footer.description')}
            </p>
            <div className="flex space-x-4">
              {socialLinks.map((link) => (
                <motion.a
                  key={link.name}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className="text-neutral-400 hover:text-accent-blue transition-colors duration-200"
                  title={link.name}
                >
                  <span className="text-xl">{link.icon}</span>
                </motion.a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">{t('footer.quickLinks')}</h3>
            <ul className="space-y-2">
              <li>
                <motion.a
                  href="#home"
                  whileHover={{ x: 5 }}
                  className="text-neutral-400 hover:text-white transition-colors duration-200"
                >
                  {t('nav.home')}
                </motion.a>
              </li>
              <li>
                <motion.a
                  href="#projects"
                  whileHover={{ x: 5 }}
                  className="text-neutral-400 hover:text-white transition-colors duration-200"
                >
                  {t('nav.projects')}
                </motion.a>
              </li>
              <li>
                <motion.a
                  href="#skills"
                  whileHover={{ x: 5 }}
                  className="text-neutral-400 hover:text-white transition-colors duration-200"
                >
                  {t('nav.skills')}
                </motion.a>
              </li>
              <li>
                <motion.a
                  href="#contact"
                  whileHover={{ x: 5 }}
                  className="text-neutral-400 hover:text-white transition-colors duration-200"
                >
                  {t('nav.contact')}
                </motion.a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4">{t('footer.contact')}</h3>
            <div className="space-y-2 text-neutral-400">
              <p>📧 jaime.alberto.sierra.mazo@gmail.com</p>
              <p>📍 Colombia</p>
              <p>🌐 {t('footer.available')}</p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-neutral-800 mt-8 pt-8 text-center">
          <div className="flex items-center justify-center text-neutral-400 mb-2">
            <span>{t('footer.builtWith')}</span>
            <Heart className="w-4 h-4 mx-1 text-red-500" />
            <span>{t('footer.and')}</span>
            <Code className="w-4 h-4 mx-1 text-accent-blue" />
            <span>{t('footer.by')} Jaime Sierra</span>
          </div>
          <p className="text-neutral-500 text-sm">
            © {currentYear} Jaime Alberto Sierra Mazo. {t('footer.rightsReserved')}
          </p>
        </div>
      </div>
    </footer>
  );
}