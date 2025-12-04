'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Code, Database, Palette, Zap, Server, Smartphone } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { getSkills, Skill, categorizeSkills } from '@/lib/api';
import { SectionWrapper } from '@/components/SectionWrapper';

const categoryIcons = {
  frontend: Code,
  backend: Server,
  database: Database,
  design: Palette,
  mobile: Smartphone,
  devops: Zap,
  other: Code,
};

const categoryColors = {
  frontend: 'text-accent-blue',
  backend: 'text-accent-green',
  database: 'text-yellow-500',
  design: 'text-purple-500',
  mobile: 'text-orange-500',
  devops: 'text-red-500',
  other: 'text-neutral-500',
};

export function SkillsSection() {
  const { t } = useLanguage();
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [hoveredSkill, setHoveredSkill] = useState<string | null>(null);

  useEffect(() => {
    fetchSkills();
  }, []);

  const fetchSkills = async () => {
    try {
      setLoading(true);
      const data = await getSkills();
      setSkills(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch skills');
    } finally {
      setLoading(false);
    }
  };

  const skillsByCategory = categorizeSkills(skills);
  const categories = ['all', ...Object.keys(skillsByCategory)];
  
  const filteredSkills = (selectedCategory === 'all' 
    ? skills 
    : skills.filter(skill => skill.category === selectedCategory))
    .filter(skill => skill.visible)
    .sort((a, b) => b.proficiency - a.proficiency);

  const getProficiencyColor = (proficiency: number) => {
    if (proficiency >= 90) return 'bg-accent-green';
    if (proficiency >= 70) return 'bg-accent-blue';
    if (proficiency >= 50) return 'bg-yellow-500';
    return 'bg-orange-500';
  };

  if (loading) {
    return (
      <SectionWrapper id="skills">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <div className="w-32 h-8 bg-neutral-200 dark:bg-neutral-800 rounded animate-pulse mx-auto mb-4"></div>
            <div className="w-64 h-4 bg-neutral-200 dark:bg-neutral-800 rounded animate-pulse mx-auto"></div>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white dark:bg-neutral-900 rounded-lg shadow-lg p-6">
                <div className="w-12 h-12 bg-neutral-200 dark:bg-neutral-800 rounded-lg animate-pulse mb-4"></div>
                <div className="w-24 h-6 bg-neutral-200 dark:bg-neutral-800 rounded animate-pulse mb-2"></div>
                <div className="w-16 h-4 bg-neutral-200 dark:bg-neutral-800 rounded animate-pulse mb-4"></div>
                <div className="w-full h-2 bg-neutral-200 dark:bg-neutral-800 rounded-full animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>
      </SectionWrapper>
    );
  }

  if (error) {
    return (
      <SectionWrapper id="skills">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 dark:text-white mb-4">
            {t('skills.title')}
          </h2>
          <p className="text-neutral-600 dark:text-neutral-400 mb-8">{error}</p>
          <button
            onClick={fetchSkills}
            className="px-6 py-3 bg-accent-blue hover:bg-accent-blue-dark text-white rounded-lg transition-colors duration-200"
          >
            {t('common.retry')}
          </button>
        </div>
      </SectionWrapper>
    );
  }

  return (
    <SectionWrapper id="skills">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 dark:text-white mb-4">
              {t('skills.title')}
            </h2>
            <p className="text-lg text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
              {t('skills.subtitle')}
            </p>
          </motion.div>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {categories.map((category) => {
            const Icon = categoryIcons[category as keyof typeof categoryIcons] || Code;
            return (
              <motion.button
                key={category}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedCategory(category)}
                className={`flex items-center px-4 py-2 rounded-full font-medium transition-all duration-200 ${
                  selectedCategory === category
                    ? 'bg-accent-blue text-white shadow-lg'
                    : 'bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700'
                }`}
              >
                <Icon className="w-4 h-4 mr-2" />
                {t(`skills.categories.${category}`)}
              </motion.button>
            );
          })}
        </div>

        {/* Skills Grid */}
        {filteredSkills.length === 0 ? (
          <div className="text-center">
            <p className="text-neutral-600 dark:text-neutral-400">{t('skills.noSkills')}</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredSkills.map((skill, index) => {
              const Icon = categoryIcons[skill.category as keyof typeof categoryIcons] || Code;
              const colorClass = categoryColors[skill.category as keyof typeof categoryColors] || 'text-neutral-500';
              
              return (
                <motion.div
                  key={skill.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ scale: 1.05, y: -5 }}
                  className="bg-white dark:bg-neutral-900 rounded-lg shadow-lg p-6 hover:shadow-xl transition-all duration-300 cursor-pointer"
                  onMouseEnter={() => setHoveredSkill(skill.id)}
                  onMouseLeave={() => setHoveredSkill(null)}
                >
                  {/* Skill Icon */}
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-lg bg-neutral-100 dark:bg-neutral-800 ${colorClass} overflow-hidden w-12 h-12 flex items-center justify-center`}>
                      {skill.icon && (skill.icon.startsWith('/') || skill.icon.startsWith('http')) ? (
                        <img src={skill.icon} alt={skill.name} className="w-full h-full object-cover" />
                      ) : (
                        <Icon className="w-6 h-6" />
                      )}
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-neutral-900 dark:text-white">
                        {skill.proficiency}%
                      </div>
                      <div className="text-xs text-neutral-500 dark:text-neutral-400">
                        {t('skills.proficiency')}
                      </div>
                    </div>
                  </div>

                  {/* Skill Name */}
                  <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-2">
                    {skill.name}
                  </h3>

                  {/* Skill Description */}
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4 line-clamp-2">
                    {skill.description}
                  </p>

                  {/* Proficiency Bar */}
                  <div className="mb-3">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs text-neutral-500 dark:text-neutral-400">
                        {t('skills.proficiency')}
                      </span>
                      <span className="text-xs text-neutral-500 dark:text-neutral-400">
                        {skill.proficiency}%
                      </span>
                    </div>
                    <div className="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-2">
                      <motion.div
                        className={`h-2 rounded-full ${getProficiencyColor(skill.proficiency)}`}
                        initial={{ width: 0 }}
                        whileInView={{ width: `${skill.proficiency}%` }}
                        transition={{ duration: 1, delay: index * 0.1 + 0.3 }}
                        viewport={{ once: true }}
                      />
                    </div>
                  </div>

                  {/* Category Badge */}
                  <div className="flex items-center justify-between">
                    <span className={`text-xs px-2 py-1 rounded-full ${colorClass} bg-current/10`}>
                      {t(`skills.categories.${skill.category}`)}
                    </span>
                  </div>

                  {/* Hover Effect */}
                  {hoveredSkill === skill.id && (
                    <motion.div
                      className="absolute inset-0 rounded-lg border-2 border-accent-blue pointer-events-none"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.2 }}
                    />
                  )}
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Skills Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
          className="mt-12 bg-gradient-to-r from-accent-blue/10 to-accent-green/10 dark:from-accent-blue/20 dark:to-accent-green/20 rounded-lg p-6 text-center"
        >
          <h3 className="text-xl font-semibold text-neutral-900 dark:text-white mb-2">
            {t('skills.continuousLearning')}
          </h3>
          <p className="text-neutral-600 dark:text-neutral-400">
            {t('skills.learningDescription')}
          </p>
        </motion.div>
      </div>
    </SectionWrapper>
  );
}