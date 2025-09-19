import { createContext, useContext, useState, useEffect } from 'react'
import axios from 'axios'

// Optional Firebase imports (loaded only when enabled)
let useFirebase = false
try {
  // Vite env flag to toggle Firebase auth mode
  useFirebase = import.meta?.env?.VITE_USE_FIREBASE === 'true'
} catch (_) {
  useFirebase = false
}

let firebaseApi = null
if (useFirebase) {
  // Lazy import local firebase helpers
  // eslint-disable-next-line import/no-unresolved
  firebaseApi = await import('../firebase')
}

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [token, setToken] = useState(localStorage.getItem('token'))

  // Configure axios defaults
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
    } else {
      delete axios.defaults.headers.common['Authorization']
    }
  }, [token])

  // Check if user is logged in on app start
  useEffect(() => {
    const checkAuth = async () => {
      if (useFirebase && firebaseApi) {
        const { getFirebaseAuth, onAuthStateChanged } = firebaseApi
        const auth = getFirebaseAuth()
        const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
          if (fbUser) {
            const idToken = await fbUser.getIdToken()
            localStorage.setItem('token', idToken)
            setToken(idToken)
            setUser({
              id: fbUser.uid,
              email: fbUser.email,
              full_name: fbUser.displayName || fbUser.email,
            })
          } else {
            localStorage.removeItem('token')
            setToken(null)
            setUser(null)
          }
          setLoading(false)
        })
        return () => unsubscribe()
      } else {
        // Only check backend auth if we have a token
        if (token) {
          try {
            const response = await axios.get('http://localhost:8000/api/users/profile')
            setUser(response.data)
          } catch (error) {
            console.error('Auth check failed:', error)
            localStorage.removeItem('token')
            setToken(null)
            setUser(null)
          }
        }
        setLoading(false)
      }
    }
    const unsub = checkAuth()
    return () => {
      if (typeof unsub === 'function') unsub()
    }
  }, [token])

  const login = async (email, password) => {
    if (useFirebase && firebaseApi) {
      try {
        const { getFirebaseAuth, signInWithEmailAndPassword } = firebaseApi
        const auth = getFirebaseAuth()
        const cred = await signInWithEmailAndPassword(auth, email, password)
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
      const response = await axios.post('http://localhost:8000/api/users/login', {
        email,
        password
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
    if (useFirebase && firebaseApi) {
      try {
        const { getFirebaseAuth, createUserWithEmailAndPassword } = firebaseApi
        const auth = getFirebaseAuth()
        const { email, password, full_name } = userData
        const cred = await createUserWithEmailAndPassword(auth, email, password)
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
      const response = await axios.post('http://localhost:8000/api/users/register', userData)
      return { success: true, user: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.detail || 'Registration failed' 
      }
    }
  }

  const logout = async () => {
    if (useFirebase && firebaseApi) {
      try {
        const { getFirebaseAuth, signOut } = firebaseApi
        const auth = getFirebaseAuth()
        await signOut(auth)
      } catch (e) {
        // no-op
      }
    }
    localStorage.removeItem('token')
    setToken(null)
    setUser(null)
    delete axios.defaults.headers.common['Authorization']
  }

  const value = {
    user,
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
