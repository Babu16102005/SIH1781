import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { assessmentAPI, recommendationAPI } from '../utils/api'
import './Dashboard.css'

const Dashboard = () => {
  const { user, token, isAuthenticated } = useAuth()
  const [stats, setStats] = useState({
    assessmentsCompleted: 0,
    recommendationsGenerated: 0,
    skillScore: 0,
    nextSteps: []
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isAuthenticated || !token) {
      setLoading(false)
      return
    }
    
    const controller = new AbortController()
    const signal = controller.signal
    
    fetchDashboardData(signal)
    
    return () => {
      controller.abort()
    }
  }, [isAuthenticated, token])
  
  const fetchDashboardData = async (signal) => {
    try {
      setLoading(true)
      
      // Fetch user's assessments and recommendations with abort signal
      const [assessmentsRes, recommendationsRes] = await Promise.all([
        assessmentAPI.getAll({ signal }),
        recommendationAPI.getAll({ signal })
      ])
      
      // Only update state if component is still mounted and not aborted
      if (!signal?.aborted) {
        setStats({
          assessmentsCompleted: assessmentsRes?.data?.length || 0,
          recommendationsGenerated: recommendationsRes?.data?.length || 0,
          skillScore: 75, // This would come from skill evaluation
          nextSteps: [
            assessmentsRes?.data?.length === 0 ? 'Complete aptitude assessment' : 'Review your assessment results',
            'Evaluate your skills',
            recommendationsRes?.data?.length === 0 ? 'Generate career recommendations' : 'View your career recommendations'
          ].filter(Boolean)
        })
      }
    } catch (error) {
      // Ignore aborted requests
      if (error.name !== 'AbortError' && error.name !== 'CanceledError') {
        console.error('Error fetching dashboard data:', error)
        // You might want to show an error message to the user here
      }
    } finally {
      if (!signal?.aborted) {
        setLoading(false)
      }
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="dashboard">
        <div className="container">
          <div className="dashboard-header">
            <h1>Please log in to access your dashboard</h1>
            <p>You need to be logged in to view your career guidance data.</p>
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return <div className="dashboard-loading">Loading dashboard...</div>
  }

  return (
    <div className="dashboard">
      <div className="container">
        <div className="dashboard-header">
          <h1>Welcome back, {user?.full_name}!</h1>
          <p>Track your career development progress and discover new opportunities.</p>
        </div>

        <div className="dashboard-grid">
          <div className="stats-cards">
            <div className="stat-card">
              <div className="stat-icon">📊</div>
              <div className="stat-content">
                <h3>{stats.assessmentsCompleted}</h3>
                <p>Assessments Completed</p>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon">🎯</div>
              <div className="stat-content">
                <h3>{stats.recommendationsGenerated}</h3>
                <p>Recommendations Generated</p>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon">⭐</div>
              <div className="stat-content">
                <h3>{stats.skillScore}%</h3>
                <p>Overall Skill Score</p>
              </div>
            </div>
          </div>

          <div className="dashboard-content">
            <div className="quick-actions">
              <h2>Quick Actions</h2>
              <div className="action-buttons">
                <Link to="/aptitude-test" className="action-btn">
                  <div className="action-icon">🧠</div>
                  <div className="action-content">
                    <h3>Take Aptitude Test</h3>
                    <p>Assess your cognitive abilities</p>
                  </div>
                </Link>
                
                <Link to="/skill-evaluation" className="action-btn">
                  <div className="action-icon">🎯</div>
                  <div className="action-content">
                    <h3>Evaluate Skills</h3>
                    <p>Analyze your current skills</p>
                  </div>
                </Link>
                
                <Link to="/recommendations" className="action-btn">
                  <div className="action-icon">🤖</div>
                  <div className="action-content">
                    <h3>Get Recommendations</h3>
                    <p>AI-powered career guidance</p>
                  </div>
                </Link>
              </div>
            </div>

            <div className="next-steps">
              <h2>Next Steps</h2>
              <div className="steps-list">
                {stats.nextSteps.map((step, index) => (
                  <div key={index} className="step-item">
                    <div className="step-number">{index + 1}</div>
                    <div className="step-content">
                      <h4>{step}</h4>
                      <p>Complete this step to continue your career journey</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
