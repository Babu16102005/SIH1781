import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import axios from 'axios'
import './Profile.css'

const Profile = () => {
  const { user, logout } = useAuth()
  const [profileData, setProfileData] = useState({
    full_name: '',
    email: '',
    age_range: '',
    current_job_role: '',
    industry: '',
    educational_background: '',
    years_of_experience: ''
  })
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (user) {
      setProfileData({
        full_name: user.full_name || '',
        email: user.email || '',
        age_range: user.age_range || '',
        current_job_role: user.current_job_role || '',
        industry: user.industry || '',
        educational_background: user.educational_background || '',
        years_of_experience: user.years_of_experience || ''
      })
    }
  }, [user])

  const handleChange = (e) => {
    setProfileData({
      ...profileData,
      [e.target.name]: e.target.value
    })
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    setMessage('')

    try {
      // In a real app, you'd have an update profile endpoint
      // For now, we'll just show a success message
      setMessage('Profile updated successfully!')
      setTimeout(() => setMessage(''), 3000)
    } catch (error) {
      setMessage('Error updating profile. Please try again.')
      setTimeout(() => setMessage(''), 3000)
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteAccount = () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      // In a real app, you'd call a delete account endpoint
      logout()
    }
  }

  if (loading) {
    return (
      <div className="profile">
        <div className="container">
          <div className="loading-state">Loading profile...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="profile">
      <div className="container">
        <div className="profile-header">
          <h1>Profile Settings</h1>
          <p>Manage your personal information and account settings</p>
        </div>

        <div className="profile-content">
          <div className="profile-form-section">
            <h2>Personal Information</h2>
            <form onSubmit={handleSave} className="profile-form">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="full_name">Full Name</label>
                  <input
                    type="text"
                    id="full_name"
                    name="full_name"
                    value={profileData.full_name}
                    onChange={handleChange}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="email">Email Address</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={profileData.email}
                    onChange={handleChange}
                    required
                    disabled
                  />
                  <small>Email cannot be changed</small>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="age_range">Age Range</label>
                  <select
                    id="age_range"
                    name="age_range"
                    value={profileData.age_range}
                    onChange={handleChange}
                  >
                    <option value="">Select age range</option>
                    <option value="18-25">18-25</option>
                    <option value="26-35">26-35</option>
                    <option value="36-45">36-45</option>
                    <option value="46-55">46-55</option>
                    <option value="55+">55+</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label htmlFor="years_of_experience">Years of Experience</label>
                  <input
                    type="number"
                    id="years_of_experience"
                    name="years_of_experience"
                    value={profileData.years_of_experience}
                    onChange={handleChange}
                    min="0"
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="current_job_role">Current Job Role</label>
                <input
                  type="text"
                  id="current_job_role"
                  name="current_job_role"
                  value={profileData.current_job_role}
                  onChange={handleChange}
                  placeholder="e.g., Software Developer, Marketing Manager"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="industry">Industry</label>
                  <select
                    id="industry"
                    name="industry"
                    value={profileData.industry}
                    onChange={handleChange}
                  >
                    <option value="">Select industry</option>
                    <option value="Technology">Technology</option>
                    <option value="Healthcare">Healthcare</option>
                    <option value="Finance">Finance</option>
                    <option value="Education">Education</option>
                    <option value="Manufacturing">Manufacturing</option>
                    <option value="Retail">Retail</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label htmlFor="educational_background">Educational Background</label>
                  <select
                    id="educational_background"
                    name="educational_background"
                    value={profileData.educational_background}
                    onChange={handleChange}
                  >
                    <option value="">Select education level</option>
                    <option value="High School">High School</option>
                    <option value="Associate Degree">Associate Degree</option>
                    <option value="Bachelor's Degree">Bachelor's Degree</option>
                    <option value="Master's Degree">Master's Degree</option>
                    <option value="PhD">PhD</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              {message && (
                <div className={`message ${message.includes('Error') ? 'error' : 'success'}`}>
                  {message}
                </div>
              )}

              <div className="form-actions">
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={saving}
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>

          <div className="profile-actions-section">
            <h2>Account Actions</h2>
            <div className="action-cards">
              <div className="action-card">
                <h3>Download Data</h3>
                <p>Download all your assessment data and recommendations</p>
                <button className="btn btn-secondary">Download</button>
              </div>
              
              <div className="action-card">
                <h3>Reset Assessments</h3>
                <p>Clear all your assessment data and start fresh</p>
                <button className="btn btn-secondary">Reset</button>
              </div>
              
              <div className="action-card danger">
                <h3>Delete Account</h3>
                <p>Permanently delete your account and all data</p>
                <button 
                  className="btn btn-danger"
                  onClick={handleDeleteAccount}
                >
                  Delete Account
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile
