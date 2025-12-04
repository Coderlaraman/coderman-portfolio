'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, User, MessageSquare, Send, CheckCircle, AlertCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useLanguage } from '@/contexts/LanguageContext';
import { createContactMessage } from '@/lib/api';
import { SectionWrapper } from '@/components/SectionWrapper';

const contactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  subject: z.string().min(5, 'Subject must be at least 5 characters'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
});

type ContactFormData = z.infer<typeof contactSchema>;

export function ContactSection() {
  const { t } = useLanguage();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [submitMessage, setSubmitMessage] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
  });

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      await createContactMessage(data);
      setSubmitStatus('success');
      setSubmitMessage(t('contact.successMessage'));
      reset();
    } catch (error) {
      setSubmitStatus('error');
      setSubmitMessage(
        error instanceof Error ? error.message : t('contact.errorMessage')
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const socialLinks = [
    {
      name: 'LinkedIn',
      url: 'https://www.linkedin.com/in/jaalsima/',
      icon: '🌐',
    },
    {
      name: 'GitHub',
      url: 'https://github.com/Coderlaraman/',
      icon: '💻',
    },
    {
      name: 'Email',
      url: 'mailto:coderman1980@gmail.com',
      icon: '📧',
    },
  ];

  return (
    <SectionWrapper id="contact">
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
              {t('contact.title')}
            </h2>
            <p className="text-lg text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
              {t('contact.subtitle')}
            </p>
          </motion.div>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Information */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <div className="bg-white dark:bg-neutral-900 rounded-lg shadow-lg p-8">
              <h3 className="text-2xl font-semibold text-neutral-900 dark:text-white mb-6">
                {t('contact.getInTouch')}
              </h3>
              
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="p-3 bg-accent-blue/10 dark:bg-accent-blue/20 rounded-lg">
                    <Mail className="w-6 h-6 text-accent-blue" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-neutral-900 dark:text-white">
                      {t('contact.email')}
                    </h4>
                    <p className="text-neutral-600 dark:text-neutral-400">
                      coderman1980@gmail.com
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="p-3 bg-accent-green/10 dark:bg-accent-green/20 rounded-lg">
                    <CheckCircle className="w-6 h-6 text-accent-green" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-neutral-900 dark:text-white">
                      {t('contact.responseTime')}
                    </h4>
                    <p className="text-neutral-600 dark:text-neutral-400">
                      {t('contact.responseTimeValue')}
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="p-3 bg-yellow-500/10 dark:bg-yellow-500/20 rounded-lg">
                    <AlertCircle className="w-6 h-6 text-yellow-500" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-neutral-900 dark:text-white">
                      {t('contact.availability')}
                    </h4>
                    <p className="text-neutral-600 dark:text-neutral-400">
                      {t('contact.availabilityValue')}
                    </p>
                  </div>
                </div>
              </div>

              {/* Social Links */}
              <div className="mt-8 pt-8 border-t border-neutral-200 dark:border-neutral-800">
                <h4 className="font-semibold text-neutral-900 dark:text-white mb-4">
                  {t('contact.connectWithMe')}
                </h4>
                <div className="flex space-x-4">
                  {socialLinks.map((link) => (
                    <motion.a
                      key={link.name}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex items-center px-4 py-2 bg-neutral-100 dark:bg-neutral-800 hover:bg-accent-blue hover:text-white dark:hover:bg-accent-blue rounded-lg transition-all duration-200"
                    >
                      <span className="mr-2">{link.icon}</span>
                      {link.name}
                    </motion.a>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <div className="bg-white dark:bg-neutral-900 rounded-lg shadow-lg p-8">
              <h3 className="text-2xl font-semibold text-neutral-900 dark:text-white mb-6">
                {t('contact.sendMessage')}
              </h3>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Name Field */}
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                    {t('contact.name')}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-neutral-400" />
                    </div>
                    <input
                      {...register('name')}
                      type="text"
                      id="name"
                      className={`block w-full pl-10 pr-3 py-3 border ${
                        errors.name
                          ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                          : 'border-neutral-300 dark:border-neutral-700 focus:ring-accent-blue focus:border-accent-blue'
                      } rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white placeholder-neutral-500 dark:placeholder-neutral-400 focus:outline-none focus:ring-2 transition-colors duration-200`}
                      placeholder={t('contact.namePlaceholder')}
                    />
                  </div>
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.name.message}</p>
                  )}
                </div>

                {/* Email Field */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                    {t('contact.email')}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-neutral-400" />
                    </div>
                    <input
                      {...register('email')}
                      type="email"
                      id="email"
                      className={`block w-full pl-10 pr-3 py-3 border ${
                        errors.email
                          ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                          : 'border-neutral-300 dark:border-neutral-700 focus:ring-accent-blue focus:border-accent-blue'
                      } rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white placeholder-neutral-500 dark:placeholder-neutral-400 focus:outline-none focus:ring-2 transition-colors duration-200`}
                      placeholder={t('contact.emailPlaceholder')}
                    />
                  </div>
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.email.message}</p>
                  )}
                </div>

                {/* Subject Field */}
                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                    {t('contact.subject')}
                  </label>
                  <input
                    {...register('subject')}
                    type="text"
                    id="subject"
                    className={`block w-full px-3 py-3 border ${
                      errors.subject
                        ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                        : 'border-neutral-300 dark:border-neutral-700 focus:ring-accent-blue focus:border-accent-blue'
                    } rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white placeholder-neutral-500 dark:placeholder-neutral-400 focus:outline-none focus:ring-2 transition-colors duration-200`}
                    placeholder={t('contact.subjectPlaceholder')}
                  />
                  {errors.subject && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.subject.message}</p>
                  )}
                </div>

                {/* Message Field */}
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                    {t('contact.message')}
                  </label>
                  <div className="relative">
                    <div className="absolute top-3 left-3 flex items-center pointer-events-none">
                      <MessageSquare className="h-5 w-5 text-neutral-400" />
                    </div>
                    <textarea
                      {...register('message')}
                      id="message"
                      rows={4}
                      className={`block w-full pl-10 pr-3 py-3 border ${
                        errors.message
                          ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                          : 'border-neutral-300 dark:border-neutral-700 focus:ring-accent-blue focus:border-accent-blue'
                      } rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white placeholder-neutral-500 dark:placeholder-neutral-400 focus:outline-none focus:ring-2 transition-colors duration-200 resize-none`}
                      placeholder={t('contact.messagePlaceholder')}
                    />
                  </div>
                  {errors.message && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.message.message}</p>
                  )}
                </div>

                {/* Submit Status */}
                {submitStatus !== 'idle' && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-4 rounded-lg flex items-center ${
                      submitStatus === 'success'
                        ? 'bg-accent-green/10 text-accent-green'
                        : 'bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400'
                    }`}
                  >
                    {submitStatus === 'success' ? (
                      <CheckCircle className="w-5 h-5 mr-2" />
                    ) : (
                      <AlertCircle className="w-5 h-5 mr-2" />
                    )}
                    {submitMessage}
                  </motion.div>
                )}

                {/* Submit Button */}
                <motion.button
                  type="submit"
                  disabled={isSubmitting}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`w-full flex items-center justify-center px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                    isSubmitting
                      ? 'bg-neutral-400 dark:bg-neutral-600 cursor-not-allowed'
                      : 'bg-accent-blue hover:bg-accent-blue-dark text-white'
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      {t('contact.sending')}
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5 mr-2" />
                      {t('contact.sendMessage')}
                    </>
                  )}
                </motion.button>
              </form>
            </div>
          </motion.div>
        </div>
      </div>
    </SectionWrapper>
  );
}