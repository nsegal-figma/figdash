import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Navigation } from './components/Navigation';
import { ScrollToTop } from './components/ScrollToTop';
import { ThemeEditor } from './components/ThemeEditor';
import { Upload, Dashboard, Insights } from './pages';

function App() {
  return (
    <Router>
      <ScrollToTop />
      <div className="min-h-screen bg-white">
        <Navigation />
        <Routes>
          <Route path="/" element={<Upload />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/insights" element={<Insights />} />
        </Routes>
      </div>
      {/* Theme Editor renders as a slide-out panel */}
      <ThemeEditor />
    </Router>
  );
}

export default App;
