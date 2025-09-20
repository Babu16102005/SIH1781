import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import axios from 'axios'
import './AptitudeTest.css'

const AptitudeTest = () => {
  const { user, token } = useAuth()
  const [questions, setQuestions] = useState([])
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState({})
  const [loading, setLoading] = useState(false)
  const [testCompleted, setTestCompleted] = useState(false)
  const [scores, setScores] = useState(null)

  // Fetch questions dynamically from backend
  useEffect(() => {
    const fetchQuestions = async () => {
      setLoading(true)
      try {
        const response = await axios.post(
  "http://localhost:8000/api/assessments/questions",
    { assessment_type: "aptitude" },
    {
      headers: token
        ? { Authorization: `Bearer ${token}` }
        : undefined,
    }
)

        // Shuffle questions
        const shuffled = response.data.questions
          .map(q => ({ ...q }))
          .sort(() => Math.random() - 0.5)

        setQuestions(shuffled)
        setCurrentQuestion(0)
        setAnswers({})
        setTestCompleted(false)
        setScores(null)
      } catch (error) {
        console.error('Failed to load questions:', error)
        alert('Failed to load questions. Please try again.')
      } finally {
        setLoading(false)
      }
    }

    fetchQuestions()
  }, [token])

  const handleAnswerSelect = (questionId, answerIndex) => {
    setAnswers({
      ...answers,
      [questionId]: answerIndex
    })
  }

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    } else {
      submitTest()
    }
  }

  const handlePrevious = () => {
    if (currentQuestion > 0) setCurrentQuestion(currentQuestion - 1)
  }

  const submitTest = async () => {
    setLoading(true)
    try {
      const response = await axios.post(
        'http://localhost:8000/api/assessments',
        {
          assessment_type: 'aptitude',
          questions: questions,
          answers: answers
        },
        {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        }
      )

      setScores(response.data.scores)
      setTestCompleted(true)
    } catch (error) {
      console.error('Error submitting test:', error)
      alert('Error submitting test. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const getScoreColor = (score) => {
    if (score >= 80) return '#4CAF50'
    if (score >= 60) return '#FF9800'
    return '#F44336'
  }

  if (loading && questions.length === 0) {
    return <div className="aptitude-test">Loading questions...</div>
  }

  if (testCompleted && scores) {
    return (
      <div className="aptitude-test">
        <div className="container">
          <div className="test-results">
            <h1>Your Aptitude Test Results</h1>
            <p className="results-subtitle">
              Here's how you performed in different cognitive areas:
            </p>

            <div className="scores-grid">
              {Object.entries(scores).map(([category, score]) => (
                <div key={category} className="score-card">
                  <h3>{category.replace('_', ' ').toUpperCase()}</h3>
                  <div className="score-circle">
                    <span style={{ color: getScoreColor(score) }}>
                      {score.toFixed(1)}
                    </span>
                  </div>
                  <p>Out of 100</p>
                </div>
              ))}
            </div>

            <div className="results-actions">
              <button
                className="btn btn-primary"
                onClick={() => window.location.href = '/skill-evaluation'}
              >
                Continue to Skill Evaluation
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

  const currentQ = questions[currentQuestion]
  const progress =
    questions.length > 0 ? ((currentQuestion + 1) / questions.length) * 100 : 0

  return (
    <div className="aptitude-test">
      <div className="container">
        <div className="test-header">
          <h1>Aptitude Assessment</h1>
          <p>Test your cognitive abilities across different domains</p>
        </div>

        {questions.length > 0 && (
          <div className="test-progress">
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <p>
              Question {currentQuestion + 1} of {questions.length}
            </p>
          </div>
        )}

        <div className="test-content">
          {currentQ && (
            <div className="question-card">
              <div className="question-header">
                <span className="question-category">
                  {currentQ.category.replace('_', ' ').toUpperCase()}
                </span>
                <h2>{currentQ.question}</h2>
              </div>

              <div className="options">
                {currentQ.options.map((option, index) => (
                  <label
                    key={index}
                    className={`option ${
                      answers[currentQ.id] === index ? 'selected' : ''
                    }`}
                  >
                    <input
                      type="radio"
                      name={`question_${currentQ.id}`}
                      value={index}
                      checked={answers[currentQ.id] === index}
                      onChange={() => handleAnswerSelect(currentQ.id, index)}
                    />
                    <span className="option-text">{option}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          <div className="test-navigation">
            <button
              className="btn btn-secondary"
              onClick={handlePrevious}
              disabled={currentQuestion === 0}
            >
              Previous
            </button>

            <button
              className="btn btn-primary"
              onClick={handleNext}
              disabled={!currentQ || answers[currentQ.id] === undefined}
            >
              {currentQuestion === questions.length - 1
                ? 'Submit Test'
                : 'Next'}
            </button>
          </div>
        </div>

        {loading && (
          <div className="loading-overlay">
            <div className="loading-spinner">Processing your results...</div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AptitudeTest