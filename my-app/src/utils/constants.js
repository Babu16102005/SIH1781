// Constants for the Career Guidance System

export const API_ENDPOINTS = {
  BASE_URL: 'http://localhost:8000/api',
  AUTH: {
    REGISTER: '/users/register',
    LOGIN: '/users/login',
    PROFILE: '/users/profile',
  },
  ASSESSMENTS: {
    CREATE: '/assessments',
    GET: '/assessments',
  },
  SKILLS: {
    EVALUATE: '/skills/evaluate',
  },
  RECOMMENDATIONS: {
    GENERATE: '/recommendations/generate',
    GET: '/recommendations',
  },
  HEALTH: '/health',
}

export const ASSESSMENT_TYPES = {
  APTITUDE: 'aptitude',
  INTEREST: 'interest',
  PERSONALITY: 'personality',
}

export const SKILL_CATEGORIES = {
  TECHNICAL: 'technical_skills',
  SOFT: 'soft_skills',
  INDUSTRY: 'industry_skills',
}

export const APTITUDE_CATEGORIES = {
  LOGICAL_REASONING: 'logical_reasoning',
  VERBAL_ABILITY: 'verbal_ability',
  NUMERICAL_ABILITY: 'numerical_ability',
  SPATIAL_REASONING: 'spatial_reasoning',
  ANALYTICAL_THINKING: 'analytical_thinking',
}

export const INTEREST_CATEGORIES = {
  TECHNOLOGY: 'technology',
  BUSINESS: 'business',
  HEALTHCARE: 'healthcare',
  EDUCATION: 'education',
  ARTS: 'arts',
  SCIENCE: 'science',
  ENGINEERING: 'engineering',
  SOCIAL_WORK: 'social_work',
}

export const PERSONALITY_TRAITS = {
  OPENNESS: 'openness',
  CONSCIENTIOUSNESS: 'conscientiousness',
  EXTRAVERSION: 'extraversion',
  AGREEABLENESS: 'agreeableness',
  NEUROTICISM: 'neuroticism',
}

export const AGE_RANGES = [
  '18-25',
  '26-35',
  '36-45',
  '46-55',
  '55+',
]

export const INDUSTRIES = [
  'Technology',
  'Healthcare',
  'Finance',
  'Education',
  'Manufacturing',
  'Retail',
  'Other',
]

export const EDUCATION_LEVELS = [
  'High School',
  'Associate Degree',
  'Bachelor\'s Degree',
  'Master\'s Degree',
  'PhD',
  'Other',
]

export const SKILL_LEVELS = {
  1: 'Beginner',
  2: 'Basic',
  3: 'Intermediate',
  4: 'Advanced',
  5: 'Expert',
}

export const RECOMMENDATION_WEIGHTS = {
  SKILL_MATCH: 0.6,
  INTEREST_ALIGNMENT: 0.4,
}

export const CHART_COLORS = {
  PRIMARY: '#667eea',
  SECONDARY: '#764ba2',
  SUCCESS: '#4CAF50',
  WARNING: '#FF9800',
  ERROR: '#F44336',
  INFO: '#2196F3',
}

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
  APTITUDE_TEST: '/aptitude-test',
  SKILL_EVALUATION: '/skill-evaluation',
  RECOMMENDATIONS: '/recommendations',
  PROFILE: '/profile',
}

export const STORAGE_KEYS = {
  TOKEN: 'token',
  USER: 'user',
  ASSESSMENT_DATA: 'assessment_data',
  SKILL_DATA: 'skill_data',
}

export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  UNAUTHORIZED: 'You are not authorized to access this resource.',
  NOT_FOUND: 'The requested resource was not found.',
  SERVER_ERROR: 'Server error. Please try again later.',
  VALIDATION_ERROR: 'Please check your input and try again.',
}

export const SUCCESS_MESSAGES = {
  REGISTRATION_SUCCESS: 'Account created successfully!',
  LOGIN_SUCCESS: 'Welcome back!',
  ASSESSMENT_COMPLETE: 'Assessment completed successfully!',
  SKILL_EVALUATION_COMPLETE: 'Skill evaluation completed successfully!',
  RECOMMENDATIONS_GENERATED: 'Recommendations generated successfully!',
  PROFILE_UPDATED: 'Profile updated successfully!',
}
