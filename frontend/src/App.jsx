import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import MainLayout from './layouts/MainLayout';

// Pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import ProductsPage from './pages/ProductsPage';
import WarehousesPage from './pages/WarehousesPage';
import SuppliersPage from './pages/SuppliersPage';
import UsersPage from './pages/UsersPage';
import InventoryPage from './pages/InventoryPage';
import ReportsPage from './pages/ReportsPage';
import NotFoundPage from './pages/NotFoundPage';

import './App.css';

import { ThemeProvider } from './context/ThemeContext';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<MainLayout><DashboardPage /></MainLayout>} />
            <Route path="/products" element={<MainLayout><ProductsPage /></MainLayout>} />
            <Route path="/warehouses" element={<MainLayout><WarehousesPage /></MainLayout>} />
            <Route path="/suppliers" element={<MainLayout><SuppliersPage /></MainLayout>} />
            <Route path="/inventory" element={<MainLayout><InventoryPage /></MainLayout>} />
            <Route path="/reports" element={<MainLayout><ReportsPage /></MainLayout>} />
            
            {/* Admin only routes */}
            <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
              <Route path="/users" element={<MainLayout><UsersPage /></MainLayout>} />
            </Route>
          </Route>

          {/* Catch-all */}
          <Route path="/404" element={<NotFoundPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
