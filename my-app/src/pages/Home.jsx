import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import './Home.css'

const Home = () => {
  const { isAuthenticated } = useAuth()

  return (
    <div className="home">
      <section className="hero">
        <div className="hero-content">
          <h1>AI-Driven Career Guidance System</h1>
          <p className="hero-subtitle">
            Make informed career decisions with comprehensive aptitude assessment, 
            skill evaluation, and personalized AI-powered recommendations.
          </p>
          <div className="hero-buttons">
            {isAuthenticated ? (
              <Link to="/dashboard" className="btn btn-primary">
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link to="/register" className="btn btn-primary">
                  Get Started
                </Link>
                <Link to="/login" className="btn btn-secondary">
                  Login
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      <section className="features">
        <div className="container">
          <h2>Comprehensive Career Assessment</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🧠</div>
              <h3>Aptitude Assessment</h3>
              <p>
                Scientifically validated aptitude tests covering logical reasoning, 
                verbal ability, numerical skills, and analytical thinking.
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🎯</div>
              <h3>Skill Evaluation</h3>
              <p>
                Comprehensive skill matrix analysis including technical skills, 
                soft skills, and industry-specific competencies.
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🤖</div>
              <h3>AI Recommendations</h3>
              <p>
                Advanced AI algorithms powered by Gemini API to provide 
                personalized career recommendations and progression paths.
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📊</div>
              <h3>Career Analytics</h3>
              <p>
                Data-driven insights with market trend analysis, skill gap 
                identification, and personalized development plans.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="how-it-works">
        <div className="container">
          <h2>How It Works</h2>
          <div className="steps">
            <div className="step">
              <div className="step-number">1</div>
              <h3>Complete Assessment</h3>
              <p>Take comprehensive aptitude and skill evaluations</p>
            </div>
            <div className="step">
              <div className="step-number">2</div>
              <h3>AI Analysis</h3>
              <p>Our AI analyzes your results and career aspirations</p>
            </div>
            <div className="step">
              <div className="step-number">3</div>
              <h3>Get Recommendations</h3>
              <p>Receive personalized career paths and development plans</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home
