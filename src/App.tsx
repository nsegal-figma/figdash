import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Navigation } from './components/Navigation';
import { Upload, Dashboard, Insights } from './pages';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <Routes>
          <Route path="/" element={<Upload />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/insights" element={<Insights />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
