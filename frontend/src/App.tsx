import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/admin/Dashboard';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<div>Home page coming soon</div>} />

        <Route
          path="/admin/dashboard"
          element={<Dashboard />}
        />

        <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;