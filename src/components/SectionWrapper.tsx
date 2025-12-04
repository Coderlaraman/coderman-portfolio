'use client';

import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

interface SectionWrapperProps {
  children: ReactNode;
  id?: string;
  className?: string;
  animation?: 'fadeIn' | 'slideUp' | 'none';
  delay?: number;
  threshold?: number;
}

export function SectionWrapper({
  children,
  id,
  className = '',
  animation = 'fadeIn',
  delay = 0,
  threshold = 0.1,
}: SectionWrapperProps) {
  const [ref, inView] = useInView({
    threshold,
    triggerOnce: true,
  });

  const getAnimation = () => {
    switch (animation) {
      case 'fadeIn':
        return {
          hidden: { opacity: 0, y: 20 },
          visible: { opacity: 1, y: 0 },
        };
      case 'slideUp':
        return {
          hidden: { opacity: 0, y: 30 },
          visible: { opacity: 1, y: 0 },
        };
      case 'none':
        return {
          hidden: { opacity: 1 },
          visible: { opacity: 1 },
        };
      default:
        return {
          hidden: { opacity: 0, y: 20 },
          visible: { opacity: 1, y: 0 },
        };
    }
  };

  const animationVariants = getAnimation();

  return (
    <motion.section
      ref={ref}
      id={id}
      className={`min-h-screen py-20 ${className}`}
      initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
      variants={animationVariants}
      transition={{
        duration: 0.6,
        delay,
        ease: 'easeOut',
      }}
    >
      {children}
    </motion.section>
  );
}