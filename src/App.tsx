import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Navigation } from './components/Navigation';
import { Upload, Dashboard, Insights } from './pages';

// Spike: Visualization library evaluation
import { ComparisonPage } from '../spike/ComparisonPage';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <Routes>
          <Route path="/" element={<Upload />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/insights" element={<Insights />} />
          <Route path="/spike/viz-eval" element={<ComparisonPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
