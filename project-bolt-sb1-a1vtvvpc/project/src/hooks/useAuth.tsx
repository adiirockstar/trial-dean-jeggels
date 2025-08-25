import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is already signed in
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        setIsAuthenticated(true);
        setIsLoading(false);
      } else {
        // Auto sign-in with generic credentials
        await signInGenericUser();
      }
    };

    const signInGenericUser = async () => {
      try {
        // Try to sign in with generic user
        const { data, error } = await supabase.auth.signInWithPassword({
          email: 'generic.user@codexagent.app',
          password: 'codex-agent-2024'
        });

        if (error && error.message.includes('Invalid login credentials')) {
          // If user doesn't exist, create account
          const { error: signUpError } = await supabase.auth.signUp({
            email: 'generic.user@codexagent.app',
            password: 'codex-agent-2024',
            options: {
              emailRedirectTo: undefined // Disable email confirmation
            }
          });

          if (!signUpError) {
            // Sign in after signup
            await supabase.auth.signInWithPassword({
              email: 'generic.user@codexagent.app',
              password: 'codex-agent-2024'
            });
          }
        }

        setIsAuthenticated(true);
      } catch (error) {
        console.error('Authentication error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkUser();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setIsAuthenticated(!!session);
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  return { isAuthenticated, isLoading };
};