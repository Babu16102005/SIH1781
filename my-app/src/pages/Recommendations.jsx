import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import axios from 'axios'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import './Recommendations.css'

const Recommendations = () => {
  const { user } = useAuth()
  const [recommendations, setRecommendations] = useState(null)
  const [loading, setLoading] = useState(false)
  const [generating, setGenerating] = useState(false)

  useEffect(() => {
    fetchRecommendations()
  }, [])

  const fetchRecommendations = async () => {
    setLoading(true)
    try {
      const response = await axios.get('http://localhost:8000/api/recommendations')
      if (response.data.length > 0) {
        setRecommendations(response.data[0]) // Get the latest recommendation
      }
    } catch (error) {
      console.error('Error fetching recommendations:', error)
    } finally {
      setLoading(false)
    }
  }

  const generateNewRecommendations = async () => {
    setGenerating(true)
    try {
      const response = await axios.post('http://localhost:8000/api/recommendations/generate')
      setRecommendations(response.data)
    } catch (error) {
      console.error('Error generating recommendations:', error)
      alert('Error generating recommendations. Please try again.')
    } finally {
      setGenerating(false)
    }
  }

  const downloadReport = () => {
    if (!recommendations) return
    
    const reportData = {
      user: user,
      recommendations: recommendations,
      generatedAt: new Date().toISOString()
    }
    
    const dataStr = JSON.stringify(reportData, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `career-recommendations-${user?.full_name?.replace(' ', '-')}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div className="recommendations">
        <div className="container">
          <div className="loading-state">Loading your recommendations...</div>
        </div>
      </div>
    )
  }

  if (!recommendations) {
    return (
      <div className="recommendations">
        <div className="container">
          <div className="no-recommendations">
            <h1>Generate Career Recommendations</h1>
            <p>Complete your assessments to get personalized career recommendations powered by AI.</p>
            <button 
              className="btn btn-primary"
              onClick={generateNewRecommendations}
              disabled={generating}
            >
              {generating ? 'Generating...' : 'Generate Recommendations'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  const careerData = recommendations.recommended_careers?.map(career => ({
    name: career.title,
    score: Math.round(career.overall_score * 100)
  })) || []

  const skillMatchData = [
    { name: 'Skill Match', value: Math.round(recommendations.skill_match_score * 100), color: '#4CAF50' },
    { name: 'Interest Alignment', value: Math.round(recommendations.interest_alignment_score * 100), color: '#2196F3' }
  ]

  return (
    <div className="recommendations">
      <div className="container">
        <div className="recommendations-header">
          <h1>Your Career Recommendations</h1>
          <p>AI-powered insights based on your assessments and profile</p>
          <div className="header-actions">
            <button 
              className="btn btn-secondary"
              onClick={generateNewRecommendations}
              disabled={generating}
            >
              {generating ? 'Regenerating...' : 'Regenerate'}
            </button>
            <button 
              className="btn btn-primary"
              onClick={downloadReport}
            >
              Download Report
            </button>
          </div>
        </div>

        <div className="recommendations-content">
          <div className="overview-section">
            <h2>Recommendation Overview</h2>
            <div className="overview-cards">
              <div className="overview-card">
                <h3>Overall Score</h3>
                <div className="score-display">
                  <span className="score-value">{Math.round(recommendations.overall_recommendation_score * 100)}%</span>
                </div>
              </div>
              <div className="overview-card">
                <h3>Skill Match</h3>
                <div className="score-display">
                  <span className="score-value">{Math.round(recommendations.skill_match_score * 100)}%</span>
                </div>
              </div>
              <div className="overview-card">
                <h3>Interest Alignment</h3>
                <div className="score-display">
                  <span className="score-value">{Math.round(recommendations.interest_alignment_score * 100)}%</span>
                </div>
              </div>
            </div>
          </div>

          <div className="careers-section">
            <h2>Recommended Career Paths</h2>
            <div className="careers-grid">
              {recommendations.recommended_careers?.map((career, index) => (
                <div key={index} className="career-card">
                  <div className="career-header">
                    <h3>{career.title}</h3>
                    <span className="career-industry">{career.industry}</span>
                  </div>
                  <div className="career-scores">
                    <div className="score-item">
                      <span>Overall Score</span>
                      <span className="score">{Math.round(career.overall_score * 100)}%</span>
                    </div>
                    <div className="score-item">
                      <span>Skill Match</span>
                      <span className="score">{Math.round(career.skill_match_score * 100)}%</span>
                    </div>
                    <div className="score-item">
                      <span>Interest</span>
                      <span className="score">{Math.round(career.interest_alignment_score * 100)}%</span>
                    </div>
                  </div>
                  <p className="career-description">{career.description}</p>
                  <div className="career-details">
                    <div className="detail-item">
                      <strong>Growth Potential:</strong> {career.growth_potential}
                    </div>
                    <div className="detail-item">
                      <strong>Salary Range:</strong> {career.salary_range}
                    </div>
                  </div>
                  <div className="required-skills">
                    <strong>Required Skills:</strong>
                    <div className="skills-tags">
                      {career.required_skills?.map((skill, skillIndex) => (
                        <span key={skillIndex} className="skill-tag">{skill}</span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="charts-section">
            <div className="chart-container">
              <h3>Career Match Scores</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={careerData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="score" fill="#667eea" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            
            <div className="chart-container">
              <h3>Recommendation Factors</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={skillMatchData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {skillMatchData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="progression-section">
            <h2>Career Progression Path</h2>
            <div className="progression-timeline">
              <div className="timeline-item">
                <h3>Short-term (6-12 months)</h3>
                <ul>
                  {recommendations.career_progression_path?.short_term?.map((step, index) => (
                    <li key={index}>{step}</li>
                  ))}
                </ul>
              </div>
              <div className="timeline-item">
                <h3>Long-term (2-5 years)</h3>
                <ul>
                  {recommendations.career_progression_path?.long_term?.map((step, index) => (
                    <li key={index}>{step}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="development-section">
            <h2>Skill Development Plan</h2>
            <div className="development-plan">
              <div className="plan-item">
                <h3>Priority Skills</h3>
                <div className="skills-list">
                  {recommendations.skill_development_plan?.priority_skills?.map((skill, index) => (
                    <span key={index} className="skill-badge">{skill}</span>
                  ))}
                </div>
              </div>
              <div className="plan-item">
                <h3>Learning Resources</h3>
                <ul>
                  {recommendations.skill_development_plan?.learning_resources?.map((resource, index) => (
                    <li key={index}>{resource}</li>
                  ))}
                </ul>
              </div>
              <div className="plan-item">
                <h3>Timeline</h3>
                <p>{recommendations.skill_development_plan?.timeline}</p>
              </div>
            </div>
          </div>

          <div className="rationale-section">
            <h2>Recommendation Rationale</h2>
            <div className="rationale-content">
              <p>{recommendations.rationale}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Recommendations
