import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { skillAPI } from '../utils/api'
import './SkillEvaluation.css'

const SkillEvaluation = () => {
  const { user } = useAuth()
  const [currentStep, setCurrentStep] = useState(0)
  const [skillData, setSkillData] = useState({
    technical_skills: {},
    soft_skills: {},
    industry_skills: {}
  })
  const [loading, setLoading] = useState(false)
  const [evaluationComplete, setEvaluationComplete] = useState(false)
  const [results, setResults] = useState(null)

  const skillCategories = [
    {
      title: "Technical Skills",
      key: "technical_skills",
      skills: [
        { name: "Programming", description: "Software development and coding" },
        { name: "Data Analysis", description: "Statistical analysis and data interpretation" },
        { name: "Project Management", description: "Planning and executing projects" },
        { name: "Database Management", description: "Database design and administration" },
        { name: "System Administration", description: "IT infrastructure management" }
      ]
    },
    {
      title: "Soft Skills",
      key: "soft_skills",
      skills: [
        { name: "Communication", description: "Verbal and written communication" },
        { name: "Leadership", description: "Leading teams and initiatives" },
        { name: "Problem Solving", description: "Analytical thinking and solution finding" },
        { name: "Time Management", description: "Organizing and prioritizing tasks" },
        { name: "Teamwork", description: "Collaborating with others" }
      ]
    },
    {
      title: "Industry Skills",
      key: "industry_skills",
      skills: [
        { name: "Industry Knowledge", description: "Understanding of your industry" },
        { name: "Regulatory Compliance", description: "Knowledge of industry regulations" },
        { name: "Market Analysis", description: "Understanding market trends" },
        { name: "Customer Relations", description: "Managing client relationships" },
        { name: "Quality Assurance", description: "Ensuring quality standards" }
      ]
    }
  ]

  const handleSkillRating = (category, skillName, rating) => {
    setSkillData(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [skillName]: rating
      }
    }))
  }

  const handleNext = () => {
    if (currentStep < skillCategories.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      submitEvaluation()
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const submitEvaluation = async () => {
    setLoading(true)
    try {
      const response = await skillAPI.evaluate(skillData)
      setResults(response.data)
      setEvaluationComplete(true)
    } catch (error) {
      console.error('Error submitting evaluation:', error)
      alert('Error submitting evaluation. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const getRatingColor = (rating) => {
    if (rating >= 4) return '#4CAF50'
    if (rating >= 3) return '#FF9800'
    if (rating >= 2) return '#FF5722'
    return '#F44336'
  }

  if (evaluationComplete && results) {
    return (
      <div className="skill-evaluation">
        <div className="container">
          <div className="evaluation-results">
            <h1>Your Skill Evaluation Results</h1>
            <p className="results-subtitle">Here's a comprehensive analysis of your skills:</p>
            
            <div className="overall-score">
              <h2>Overall Skill Score</h2>
              <div className="score-display">
                <span className="score-value">{results.overall_score.toFixed(1)}</span>
                <span className="score-label">out of 5.0</span>
              </div>
            </div>

            <div className="skill-gaps">
              <h2>Skill Gaps Identified</h2>
              <div className="gaps-grid">
                {results.skill_gaps.priority_skills?.slice(0, 5).map((gap, index) => (
                  <div key={index} className="gap-card">
                    <h3>{gap.skill}</h3>
                    <div className="gap-info">
                      <span>Current: {gap.current_level}/5</span>
                      <span>Target: {gap.target_level}/5</span>
                      <span>Gap: {gap.gap}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="results-actions">
              <button 
                className="btn btn-primary"
                onClick={() => window.location.href = '/recommendations'}
              >
                Generate Career Recommendations
              </button>
              <button 
                className="btn btn-secondary"
                onClick={() => window.location.href = '/dashboard'}
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const currentCategory = skillCategories[currentStep]
  const progress = ((currentStep + 1) / skillCategories.length) * 100

  return (
    <div className="skill-evaluation">
      <div className="container">
        <div className="evaluation-header">
          <h1>Skill Evaluation</h1>
          <p>Rate your proficiency level for each skill (1 = Beginner, 5 = Expert)</p>
        </div>

        <div className="evaluation-progress">
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <p>Step {currentStep + 1} of {skillCategories.length}: {currentCategory.title}</p>
        </div>

        <div className="evaluation-content">
          <div className="category-card">
            <h2>{currentCategory.title}</h2>
            <p className="category-description">
              Rate your proficiency level for each skill in this category
            </p>

            <div className="skills-list">
              {currentCategory.skills.map((skill, index) => (
                <div key={index} className="skill-item">
                  <div className="skill-info">
                    <h3>{skill.name}</h3>
                    <p>{skill.description}</p>
                  </div>
                  
                  <div className="skill-rating">
                    <div className="rating-scale">
                      {[1, 2, 3, 4, 5].map((rating) => (
                        <label key={rating} className="rating-option">
                          <input
                            type="radio"
                            name={`${currentCategory.key}_${skill.name}`}
                            value={rating}
                            checked={skillData[currentCategory.key][skill.name] === rating}
                            onChange={() => handleSkillRating(currentCategory.key, skill.name, rating)}
                          />
                          <span className="rating-label">{rating}</span>
                        </label>
                      ))}
                    </div>
                    <div className="rating-labels">
                      <span>Beginner</span>
                      <span>Expert</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="evaluation-navigation">
            <button 
              className="btn btn-secondary"
              onClick={handlePrevious}
              disabled={currentStep === 0}
            >
              Previous
            </button>
            
            <button 
              className="btn btn-primary"
              onClick={handleNext}
              disabled={!isCurrentStepComplete()}
            >
              {currentStep === skillCategories.length - 1 ? 'Complete Evaluation' : 'Next'}
            </button>
          </div>
        </div>

        {loading && (
          <div className="loading-overlay">
            <div className="loading-spinner">Analyzing your skills...</div>
          </div>
        )}
      </div>
    </div>
  )

  function isCurrentStepComplete() {
    const currentSkills = skillCategories[currentStep].skills
    return currentSkills.every(skill => 
      skillData[skillCategories[currentStep].key][skill.name] !== undefined
    )
  }
}

export default SkillEvaluation
