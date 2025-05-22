import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { StickyNote as NuxpadIcon } from 'lucide-react';

interface LoadingScreenProps {
  onLoadingComplete?: () => void;
}

export function LoadingScreen({ onLoadingComplete }: LoadingScreenProps) {
  const [progress, setProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [isFullyLoaded, setIsFullyLoaded] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress(prev => {
        const nextProgress = prev + Math.random() * 12;
        if (nextProgress >= 100) {
          clearInterval(timer);
          setIsFullyLoaded(true);
          return 100;
        }
        return nextProgress;
      });
    }, 200);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (isFullyLoaded) {
      const finalTimer = setTimeout(() => {
        setIsVisible(false);
        onLoadingComplete?.();
      }, 500);

      return () => clearTimeout(finalTimer);
    }
  }, [isFullyLoaded, onLoadingComplete]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#f8fafc] dark:bg-gray-950 overflow-hidden"
        >
          {/* Background pulse effects */}
          <motion.div
            className="absolute inset-0 pointer-events-none"
            animate={{
              background: [
                'radial-gradient(circle at 50% 50%, rgba(14, 165, 233, 0.05) 0%, rgba(14, 165, 233, 0) 70%)',
                'radial-gradient(circle at 50% 50%, rgba(14, 165, 233, 0.1) 0%, rgba(14, 165, 233, 0) 70%)',
                'radial-gradient(circle at 50% 50%, rgba(14, 165, 233, 0.05) 0%, rgba(14, 165, 233, 0) 70%)',
              ]
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          
          <div className="w-full max-w-[360px] mx-auto px-6 relative">
            {/* Floating particles */}
            <motion.div
              className="absolute inset-0 pointer-events-none"
              initial="initial"
              animate="animate"
            >
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-1 h-1 rounded-full bg-sky-500/30"
                  initial={{
                    x: Math.random() * 360 - 180,
                    y: Math.random() * 360 - 180,
                  }}
                  animate={{
                    x: Math.random() * 360 - 180,
                    y: Math.random() * 360 - 180,
                    opacity: [0.3, 0.8, 0.3],
                    scale: [1, 1.5, 1],
                  }}
                  transition={{
                    duration: 3 + Math.random() * 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: Math.random() * 2,
                  }}
                />
              ))}
            </motion.div>

            {/* Logo Section */}
            <div className="flex flex-col items-center mb-16">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="relative"
              >
                <motion.div 
                  className="relative z-10 bg-white dark:bg-gray-900 rounded-2xl p-4 shadow-lg border border-sky-100 dark:border-sky-900"
                  animate={{
                    boxShadow: [
                      "0px 0px 0px rgba(14, 165, 233, 0)",
                      "0px 0px 30px rgba(14, 165, 233, 0.3)",
                      "0px 0px 0px rgba(14, 165, 233, 0)"
                    ],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  <motion.div
                    animate={{
                      scale: [1, 1.1, 1],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                    <NuxpadIcon className="w-12 h-12 text-sky-500" />
                  </motion.div>
                </motion.div>

                {/* Animated rings */}
                {[...Array(4)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute inset-0 rounded-2xl border-2"
                    style={{
                      borderColor: `rgba(14, 165, 233, ${0.2 - i * 0.05})`,
                    }}
                    animate={{
                      scale: [1, 1 + (i + 1) * 0.2, 1],
                      opacity: [0.3 - i * 0.05, 0.1 - i * 0.02, 0.3 - i * 0.05],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: i * 0.2,
                    }}
                  />
                ))}
              </motion.div>
            </div>

            {/* Loading Text */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center space-y-2 mb-8"
            >
              <motion.h1 
                className="text-xl font-semibold text-gray-900 dark:text-white"
                animate={{
                  opacity: [0.7, 1, 0.7],
                  scale: [1, 1.02, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                Setting up your workspace
              </motion.h1>
              <motion.p 
                className="text-sm text-sky-600 dark:text-sky-400"
                animate={{
                  opacity: [0.6, 1, 0.6],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                This will only take a moment
              </motion.p>
            </motion.div>

            {/* Progress Bar */}
            <div className="relative w-full h-1.5 bg-sky-100 dark:bg-sky-900/30 rounded-full overflow-hidden">
              <motion.div
                className="absolute inset-0 bg-sky-500"
                initial={{ width: '0%' }}
                animate={{
                  width: `${progress}%`,
                }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                style={{
                  boxShadow: '0 0 20px rgba(14, 165, 233, 0.5)',
                }}
              />
              <motion.div
                className="absolute inset-0 bg-sky-400/50"
                initial={{ width: '0%' }}
                animate={{
                  width: `${progress}%`,
                  opacity: [0.3, 0.6, 0.3],
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />
            </div>

            {/* Loading Steps */}
            <motion.div 
              className="mt-8 space-y-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              {[
                'Initializing application',
                'Loading components',
                'Preparing your canvas',
                'Almost ready'
              ].map((step, index) => {
                const stepProgress = (100 / 4) * (index + 1);
                const isActive = progress >= stepProgress;
                
                return (
                  <motion.div
                    key={step}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ 
                      opacity: isActive ? 1 : 0.4,
                      x: 0,
                      scale: isActive ? [1, 1.02, 1] : 1,
                    }}
                    transition={{ 
                      delay: index * 0.15,
                      ...(isActive && {
                        scale: {
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }
                      })
                    }}
                    className="flex items-center space-x-3"
                  >
                    <motion.div 
                      className={`w-2 h-2 rounded-full ${
                        isActive 
                          ? 'bg-sky-500' 
                          : 'bg-sky-200 dark:bg-sky-900'
                      }`}
                      animate={isActive ? {
                        scale: [1, 1.5, 1],
                        boxShadow: [
                          '0 0 0 0 rgba(14, 165, 233, 0.4)',
                          '0 0 0 4px rgba(14, 165, 233, 0)',
                          '0 0 0 0 rgba(14, 165, 233, 0.4)'
                        ]
                      } : {}}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    />
                    <span className={`text-sm ${
                      isActive
                        ? 'text-sky-600 dark:text-sky-400 font-medium'
                        : 'text-sky-400/60 dark:text-sky-600/40'
                    }`}>
                      {step}
                    </span>
                  </motion.div>
                );
              })}
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
} 