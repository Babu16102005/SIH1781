import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import './Navbar.css'

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          <h2>CareerGuide AI</h2>
        </Link>
        
        <div className="navbar-menu">
          {isAuthenticated ? (
            <>
              <Link to="/dashboard" className="navbar-link">Dashboard</Link>
              <Link to="/aptitude-test" className="navbar-link">Aptitude Test</Link>
              <Link to="/skill-evaluation" className="navbar-link">Skills</Link>
              <Link to="/recommendations" className="navbar-link">Recommendations</Link>
              <Link to="/profile" className="navbar-link">Profile</Link>
              <div className="navbar-user">
                <span>Welcome, {user?.full_name}</span>
                <button onClick={handleLogout} className="logout-btn">Logout</button>
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="navbar-link">Login</Link>
              <Link to="/register" className="navbar-link">Register</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}

export default Navbar
