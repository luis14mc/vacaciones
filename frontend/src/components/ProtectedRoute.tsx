import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'rrhh' | 'jefe_superior' | 'empleado';
  fallback?: React.ReactNode;
}

export default function ProtectedRoute({ 
  children, 
  requiredRole,
  fallback 
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      // Redirigir al login si no está autenticado
      window.location.href = '/login';
      return;
    }

    if (requiredRole && user && user.rol !== requiredRole) {
      // Si requiere un rol específico y no lo tiene
      if (fallback) {
        setShouldRender(true);
        return;
      }
      
      // Redirigir según el rol del usuario
      switch (user.rol) {
        case 'rrhh':
          window.location.href = '/admin/dashboard';
          break;
        case 'jefe_superior':
          window.location.href = '/manager/dashboard';
          break;
        case 'empleado':
          window.location.href = '/dashboard';
          break;
        default:
          window.location.href = '/login';
      }
      return;
    }

    setShouldRender(true);
  }, [isAuthenticated, isLoading, user, requiredRole, fallback]);

  // Mostrar loading mientras se verifica la autenticación
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="loading loading-spinner loading-lg text-primary mb-4"></div>
          <p className="text-gray-600">Verificando sesión...</p>
        </div>
      </div>
    );
  }

  // Si no debe renderizar, no mostrar nada (la redirección ya está en proceso)
  if (!shouldRender) {
    return null;
  }

  // Si hay fallback y no tiene el rol requerido, mostrar fallback
  if (requiredRole && user && user.rol !== requiredRole && fallback) {
    return <>{fallback}</>;
  }

  // Renderizar el contenido protegido
  return <>{children}</>;
}

// Componente de acceso denegado
export function AccessDenied({ userRole }: { userRole?: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center max-w-md mx-auto">
        <div className="mb-8">
          <svg className="mx-auto h-24 w-24 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Acceso Denegado</h1>
        
        <p className="text-lg text-gray-600 mb-6">
          No tienes permisos para acceder a esta página.
        </p>
        
        {userRole && (
          <p className="text-sm text-gray-500 mb-6">
            Tu rol actual: <span className="font-medium">{userRole}</span>
          </p>
        )}
        
        <div className="space-y-3">
          <button 
            onClick={() => window.history.back()}
            className="btn btn-primary w-full"
          >
            Regresar
          </button>
          
          <a 
            href="/dashboard" 
            className="btn btn-outline w-full"
          >
            Ir al Dashboard
          </a>
        </div>
        
        <div className="mt-8 text-xs text-gray-400">
          <p>Si crees que esto es un error, contacta al administrador</p>
        </div>
      </div>
    </div>
  );
}