import React from 'react';
import { AuthProvider } from '../contexts/AuthContext';
import SimpleDashboard from './SimpleDashboard';

const DashboardWrapper: React.FC = () => {
  return (
    <AuthProvider>
      <SimpleDashboard />
    </AuthProvider>
  );
};

export default DashboardWrapper;