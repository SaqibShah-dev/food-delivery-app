import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from 'react-router-dom';
import AdminLayout from './layouts/AdminLayout';
import Dashboard from './pages/admin/Dashboard';
import Orders from './pages/admin/Orders';

function FoodManagementPlaceholder() {
  return (
    <main className="min-h-screen bg-slate-100 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <p className="text-sm font-medium text-indigo-600">
          Administration
        </p>
        <h1 className="mt-1 text-3xl font-bold text-slate-900">
          Food Menu
        </h1>
        <p className="mt-2 text-slate-600">
          Food management will be added here next.
        </p>
      </div>
    </main>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<div>Home page coming soon</div>} />

        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="orders" element={<Orders />} />
          <Route path="food" element={<FoodManagementPlaceholder />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;