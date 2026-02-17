import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Navigation } from './components/Navigation';
import { ScrollToTop } from './components/ScrollToTop';
import { ThemeEditor } from './components/ThemeEditor';
import { useReducedMotion } from './hooks/useReducedMotion';

// Lazy-load pages for code splitting
const Upload = lazy(() => import('./pages/Upload').then(m => ({ default: m.Upload })));
const Dashboard = lazy(() => import('./pages/Dashboard').then(m => ({ default: m.Dashboard })));
const Insights = lazy(() => import('./pages/Insights').then(m => ({ default: m.Insights })));

function PageFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-pulse text-gray-400 text-sm">Loading...</div>
    </div>
  );
}

function AnimatedRoutes() {
  const location = useLocation();
  const prefersReducedMotion = useReducedMotion();

  const pageVariants = prefersReducedMotion
    ? { initial: {}, animate: {}, exit: {} }
    : {
        initial: { opacity: 0, y: 8 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -8 },
      };

  const pageTransition = prefersReducedMotion
    ? { duration: 0 }
    : { duration: 0.2, ease: 'easeInOut' as const };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial="initial"
        animate="animate"
        exit="exit"
        variants={pageVariants}
        transition={pageTransition}
      >
        <Suspense fallback={<PageFallback />}>
          <Routes location={location}>
            <Route path="/" element={<Upload />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/insights" element={<Insights />} />
          </Routes>
        </Suspense>
      </motion.div>
    </AnimatePresence>
  );
}

function App() {
  return (
    <Router>
      <ScrollToTop />
      <div className="min-h-screen bg-white">
        <Navigation />
        <AnimatedRoutes />
      </div>
      {/* Theme Editor renders as a slide-out panel */}
      <ThemeEditor />
    </Router>
  );
}

export default App;
