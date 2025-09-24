'use client';

import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  text?: string;
  subtext?: string;
  variant?: 'primary' | 'secondary' | 'accent';
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  text = 'Cargando...',
  subtext,
  variant = 'primary'
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  const colorClasses = {
    primary: 'text-blue-600',
    secondary: 'text-gray-600',
    accent: 'text-indigo-600'
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-3">
      <div className={`${sizeClasses[size]} ${colorClasses[variant]} animate-spin`}>
        <svg
          className="w-full h-full"
          fill="none"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      </div>
      
      {text && (
        <div className="text-center">
          <p className={`font-medium ${colorClasses[variant]}`}>
            {text}
          </p>
          {subtext && (
            <p className="text-sm text-gray-500 mt-1">
              {subtext}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

interface LoadingOverlayProps {
  isVisible: boolean;
  text?: string;
  subtext?: string;
  variant?: 'primary' | 'secondary' | 'accent';
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  isVisible,
  text = 'Procesando...',
  subtext,
  variant = 'primary'
}) => {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-white rounded-lg p-8 shadow-2xl">
        <LoadingSpinner size="lg" text={text} subtext={subtext} variant={variant} />
      </div>
    </div>
  );
};

interface ProgressBarProps {
  progress: number;
  label?: string;
  showPercentage?: boolean;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  label,
  showPercentage = true,
  variant = 'primary'
}) => {
  const variantClasses = {
    primary: 'bg-blue-600',
    secondary: 'bg-gray-600',
    success: 'bg-green-600',
    warning: 'bg-yellow-600',
    danger: 'bg-red-600'
  };

  return (
    <div className="w-full">
      {label && (
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">{label}</span>
          {showPercentage && (
            <span className="text-sm text-gray-500">{Math.round(progress)}%</span>
          )}
        </div>
      )}
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className={`h-2 rounded-full transition-all duration-500 ease-out ${variantClasses[variant]}`}
          style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
        />
      </div>
    </div>
  );
};

interface LoadingStateProps {
  isLoading: boolean;
  error?: string | null;
  children: React.ReactNode;
  loadingComponent?: React.ReactNode;
  emptyComponent?: React.ReactNode;
  isEmpty?: boolean;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  isLoading,
  error,
  children,
  loadingComponent,
  emptyComponent,
  isEmpty = false
}) => {
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <div className="w-16 h-16 text-red-500 mb-4">
          <svg fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Error</h3>
        <p className="text-gray-600">{error}</p>
      </div>
    );
  }

  if (isLoading) {
    return loadingComponent || (
      <div className="flex items-center justify-center p-8">
        <LoadingSpinner size="lg" text="Cargando datos..." subtext="Esto puede tomar unos segundos" />
      </div>
    );
  }

  if (isEmpty) {
    return emptyComponent || (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <div className="w-16 h-16 text-gray-400 mb-4">
          <svg fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No hay datos</h3>
        <p className="text-gray-600">No se encontraron elementos para mostrar</p>
      </div>
    );
  }

  return <>{children}</>;
};
