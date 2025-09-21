import { createContext, useState, useEffect } from 'react'
import { authAPI } from '../utils/api'
import * as firebaseApi from '../firebase' // Import all exports from firebase.js

const useFirebase = import.meta.env.VITE_USE_FIREBASE === 'true'

const AuthContext = createContext()

// useAuth has been moved to a separate file in the hooks folder.

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [token, setToken] = useState(localStorage.getItem('token'))

  // Effect for handling Firebase authentication state.
  // Runs when the `useFirebase` flag changes.
  useEffect(() => {
    if (!useFirebase) {
      // This effect is only for Firebase.
      // For non-Firebase, loading is handled in the backend auth check effect.
      return;
    }

    const auth = firebaseApi.getFirebaseAuth();
    const unsubscribe = firebaseApi.onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        const idToken = await fbUser.getIdToken();
        localStorage.setItem('token', idToken);
        setToken(idToken);
        setUser({
          id: fbUser.uid,
          email: fbUser.email,
          full_name: fbUser.displayName || fbUser.email,
        });
      } else {
        // On logout or session expiry, the listener will clear the user state.
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
      }
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => {
      unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [useFirebase]);

  // Effect for handling custom backend authentication state.
  // Runs when the token or useFirebase flag changes.
  useEffect(() => {
    if (useFirebase) {
      return;
    }

    const checkBackendAuth = async () => {
      if (token) {
        try {
          const response = await authAPI.getProfile();
          setUser(response.data);
        } catch (error) {
          console.error('Auth check failed:', error);
          logout(); // Use logout function to clear state on auth failure
        }
      }
      setLoading(false);
    };

    checkBackendAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, useFirebase]);

  const login = async (email, password) => {
    if (useFirebase) {
      try {
        const auth = firebaseApi.getFirebaseAuth()
        const cred = await firebaseApi.signInWithEmailAndPassword(auth, email, password)
        const idToken = await cred.user.getIdToken()
        localStorage.setItem('token', idToken)
        setToken(idToken)
        setUser({ id: cred.user.uid, email: cred.user.email, full_name: cred.user.displayName || cred.user.email })
        return { success: true }
      } catch (error) {
        return { success: false, error: error.message || 'Login failed' }
      }
    }

    try {
      const response = await authAPI.login({
        username: email,
        password: password,
      })
      const { access_token, user: userData } = response.data
      localStorage.setItem('token', access_token)
      setToken(access_token)
      setUser(userData)
      
      return { success: true }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.detail || 'Login failed' 
      }
    }
  }

  const register = async (userData) => {
    if (useFirebase) {
      try {
        const auth = firebaseApi.getFirebaseAuth()
        const { email, password, full_name } = userData
        const cred = await firebaseApi.createUserWithEmailAndPassword(auth, email, password)
        const idToken = await cred.user.getIdToken()
        localStorage.setItem('token', idToken)
        setToken(idToken)
        setUser({ id: cred.user.uid, email: cred.user.email, full_name: full_name || cred.user.displayName || cred.user.email })
        return { success: true, user: { id: cred.user.uid, email: cred.user.email } }
      } catch (error) {
        return { success: false, error: error.message || 'Registration failed' }
      }
    }

    try {
      const response = await authAPI.register(userData)
      return { success: true, user: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.detail || 'Registration failed' 
      }
    }
  }

  const logout = async () => {
    if (useFirebase) {
      try {
        const auth = firebaseApi.getFirebaseAuth()
        await firebaseApi.signOut(auth)
      } catch {
        // no-op
      }
    }
    localStorage.removeItem('token')
    setToken(null)
    setUser(null)
    // The axios header is automatically removed by the other useEffect watching `token`
  }

  const value = {
    user,
    token,
    login,
    register,
    logout,
    loading,
    isAuthenticated: !!user
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}