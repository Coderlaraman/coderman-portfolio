'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ExternalLink, Github, ChevronLeft, ChevronRight, Code, Zap, Trophy } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { getProjects, Project } from '@/lib/api';
import { SectionWrapper } from '@/components/SectionWrapper';

export function ProjectsSection() {
  const { t } = useLanguage();
  const [projects, setProjects] = useState<Project[]>([]);
  const [allProjects, setAllProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState<{ [key: string]: number }>({});
  const [showAll, setShowAll] = useState(false);
  const INITIAL_PROJECT_COUNT = 3;

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      // Fetch all projects, not just featured
      const data = await getProjects();
      setAllProjects(data);
      // Initially show only featured or first N projects
      const featured = data.filter(p => p.featured);
      const initialProjects = featured.length > 0 ? featured : data.slice(0, INITIAL_PROJECT_COUNT);
      setProjects(initialProjects);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch projects');
    } finally {
      setLoading(false);
    }
  };

  const handleViewMore = () => {
    setProjects(allProjects);
    setShowAll(true);
  };

  const nextImage = (projectId: string, totalImages: number) => {
    setCurrentImageIndex(prev => ({
      ...prev,
      [projectId]: ((prev[projectId] || 0) + 1) % totalImages
    }));
  };

  const prevImage = (projectId: string, totalImages: number) => {
    setCurrentImageIndex(prev => ({
      ...prev,
      [projectId]: ((prev[projectId] || 0) - 1 + totalImages) % totalImages
    }));
  };

  if (loading) {
    return (
      <SectionWrapper id="projects">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <div className="w-32 h-8 bg-neutral-200 dark:bg-neutral-800 rounded animate-pulse mx-auto mb-4"></div>
            <div className="w-64 h-4 bg-neutral-200 dark:bg-neutral-800 rounded animate-pulse mx-auto"></div>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white dark:bg-neutral-900 rounded-lg shadow-lg overflow-hidden">
                <div className="h-48 bg-neutral-200 dark:bg-neutral-800 animate-pulse"></div>
                <div className="p-6">
                  <div className="w-32 h-6 bg-neutral-200 dark:bg-neutral-800 rounded animate-pulse mb-2"></div>
                  <div className="w-full h-4 bg-neutral-200 dark:bg-neutral-800 rounded animate-pulse mb-4"></div>
                  <div className="flex flex-wrap gap-2">
                    {[1, 2, 3].map((j) => (
                      <div key={j} className="w-16 h-6 bg-neutral-200 dark:bg-neutral-800 rounded-full animate-pulse"></div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </SectionWrapper>
    );
  }

  if (error) {
    return (
      <SectionWrapper id="projects">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 dark:text-white mb-4">
            {t('projects.title')}
          </h2>
          <p className="text-neutral-600 dark:text-neutral-400 mb-8">{error}</p>
          <button
            onClick={fetchProjects}
            className="px-6 py-3 bg-accent-blue hover:bg-accent-blue-dark text-white rounded-lg transition-colors duration-200"
          >
            {t('common.retry')}
          </button>
        </div>
      </SectionWrapper>
    );
  }

  return (
    <SectionWrapper id="projects">
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
              {t('projects.title')}
            </h2>
            <p className="text-lg text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
              {t('projects.subtitle')}
            </p>
          </motion.div>
        </div>

        {/* Projects Grid */}
        {projects.length === 0 ? (
          <div className="text-center">
            <p className="text-neutral-600 dark:text-neutral-400">{t('projects.noProjects')}</p>
          </div>
        ) : (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project, index) => (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="bg-white dark:bg-neutral-900 rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer"
                  onClick={() => setSelectedProject(project)}
                >
                  {/* Project Image */}
                  <div className="relative h-48 bg-neutral-200 dark:bg-neutral-800 overflow-hidden">
                    {project.imageUrls.length > 0 && (
                      <img
                        src={project.imageUrls[currentImageIndex[project.id] || 0]}
                        alt={project.title}
                        className="w-full h-full object-cover"
                      />
                    )}
                    {project.imageUrls.length > 1 && (
                      <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1">
                        {project.imageUrls.map((_, imgIndex) => (
                          <button
                            key={imgIndex}
                            onClick={(e) => {
                              e.stopPropagation();
                              setCurrentImageIndex(prev => ({ ...prev, [project.id]: imgIndex }));
                            }}
                            className={`w-2 h-2 rounded-full transition-colors duration-200 ${
                              (currentImageIndex[project.id] || 0) === imgIndex
                                ? 'bg-white'
                                : 'bg-white/50'
                            }`}
                          />
                        ))}
                      </div>
                    )}
                    <div className="absolute top-2 right-2">
                      {project.featured && (
                        <div className="bg-accent-green text-white px-2 py-1 rounded-full text-xs font-medium">
                          Featured
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Project Content */}
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-neutral-900 dark:text-white mb-2">
                      {project.title}
                    </h3>
                    <p className="text-neutral-600 dark:text-neutral-400 mb-4 line-clamp-2">
                      {project.description}
                    </p>

                    {/* Technologies */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {project.technologies.slice(0, 3).map((tech) => (
                        <span
                          key={tech}
                          className="px-2 py-1 bg-accent-blue/10 text-accent-blue dark:bg-accent-blue/20 dark:text-accent-blue text-xs rounded-full font-medium"
                        >
                          {tech}
                        </span>
                      ))}
                      {project.technologies.length > 3 && (
                        <span className="px-2 py-1 bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 text-xs rounded-full">
                          +{project.technologies.length - 3}
                        </span>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex space-x-3">
                      {project.projectUrl && (
                        <a
                          href={project.projectUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center text-sm text-accent-blue hover:text-accent-blue-dark dark:text-accent-blue dark:hover:text-accent-blue-dark transition-colors duration-200"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <ExternalLink className="w-4 h-4 mr-1" />
                          {t('projects.viewProject')}
                        </a>
                      )}
                      {project.codeUrl && (
                        <a
                          href={project.codeUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center text-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors duration-200"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Github className="w-4 h-4 mr-1" />
                          {t('projects.viewCode')}
                        </a>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* View More Button */}
            {!showAll && allProjects.length > projects.length && (
              <div className="mt-12 text-center">
                <button
                  onClick={handleViewMore}
                  className="px-8 py-3 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 rounded-full font-medium hover:scale-105 transition-transform duration-200 shadow-lg"
                >
                  View More Projects
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Project Detail Modal */}
      <AnimatePresence>
        {selectedProject && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedProject(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-neutral-900 rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="sticky top-0 bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 p-6 flex justify-between items-center">
                <h3 className="text-2xl font-bold text-neutral-900 dark:text-white">
                  {selectedProject.title}
                </h3>
                <button
                  onClick={() => setSelectedProject(null)}
                  className="text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors duration-200"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6">
                {/* Image Gallery */}
                {selectedProject.imageUrls.length > 0 && (
                  <div className="relative h-64 bg-neutral-200 dark:bg-neutral-800 rounded-lg overflow-hidden mb-6">
                    <img
                      src={selectedProject.imageUrls[currentImageIndex[selectedProject.id] || 0]}
                      alt={selectedProject.title}
                      className="w-full h-full object-cover"
                    />
                    {selectedProject.imageUrls.length > 1 && (
                      <>
                        <button
                          onClick={() => prevImage(selectedProject.id, selectedProject.imageUrls.length)}
                          className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors duration-200"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => nextImage(selectedProject.id, selectedProject.imageUrls.length)}
                          className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors duration-200"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                )}

                {/* Description */}
                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-neutral-900 dark:text-white mb-2">
                    {t('projects.description')}
                  </h4>
                  <p className="text-neutral-600 dark:text-neutral-400">
                    {selectedProject.fullDescription}
                  </p>
                </div>

                {/* Technologies */}
                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-neutral-900 dark:text-white mb-3 flex items-center">
                    <Code className="w-5 h-5 mr-2 text-accent-blue" />
                    {t('projects.technologies')}
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedProject.technologies.map((tech) => (
                      <span
                        key={tech}
                        className="px-3 py-1 bg-accent-blue/10 text-accent-blue dark:bg-accent-blue/20 dark:text-accent-blue rounded-full font-medium"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Challenges */}
                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-neutral-900 dark:text-white mb-3 flex items-center">
                    <Zap className="w-5 h-5 mr-2 text-yellow-500" />
                    {t('projects.challenges')}
                  </h4>
                  <ul className="space-y-2">
                    {selectedProject.challenges.map((challenge, index) => (
                      <li key={index} className="text-neutral-600 dark:text-neutral-400 flex items-start">
                        <span className="text-yellow-500 mr-2">•</span>
                        {challenge}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Results */}
                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-neutral-900 dark:text-white mb-3 flex items-center">
                    <Trophy className="w-5 h-5 mr-2 text-accent-green" />
                    {t('projects.results')}
                  </h4>
                  <ul className="space-y-2">
                    {selectedProject.results.map((result, index) => (
                      <li key={index} className="text-neutral-600 dark:text-neutral-400 flex items-start">
                        <span className="text-accent-green mr-2">✓</span>
                        {result}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-4">
                  {selectedProject.projectUrl && (
                    <a
                      href={selectedProject.projectUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center px-4 py-2 bg-accent-blue hover:bg-accent-blue-dark text-white rounded-lg transition-colors duration-200"
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      {t('projects.viewProject')}
                    </a>
                  )}
                  {selectedProject.codeUrl && (
                    <a
                      href={selectedProject.codeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center px-4 py-2 border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 rounded-lg transition-colors duration-200"
                    >
                      <Github className="w-4 h-4 mr-2" />
                      {t('projects.viewCode')}
                    </a>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </SectionWrapper>
  );
}