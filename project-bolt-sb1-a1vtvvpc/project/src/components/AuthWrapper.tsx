import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { Brain, Loader } from 'lucide-react';

interface AuthWrapperProps {
  children: React.ReactNode;
}

const AuthWrapper: React.FC<AuthWrapperProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative mb-4">
            <Brain className="w-12 h-12 text-purple-600 mx-auto" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader className="w-6 h-6 text-blue-500 animate-spin" />
            </div>
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Initializing Codex Agent</h2>
          <p className="text-gray-600">Setting up your secure session...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <Brain className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Authentication Failed</h2>
          <p className="text-gray-600">Unable to establish secure session. Please refresh the page.</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default AuthWrapper;