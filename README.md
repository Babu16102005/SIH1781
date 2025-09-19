# AI-Driven Career Guidance System

A comprehensive AI-driven career guidance system designed to help individuals make informed career decisions by holistically assessing their aptitude, interests, skills, and potential career trajectories.

## Features

### 🧠 Comprehensive Assessment
- **Aptitude Testing**: Scientifically validated tests covering logical reasoning, verbal ability, numerical skills, and analytical thinking
- **Skill Evaluation**: Multi-dimensional skill matrix analysis including technical, soft, and industry-specific skills
- **Interest Assessment**: Career interest mapping and alignment analysis

### 🤖 AI-Powered Recommendations
- **Gemini AI Integration**: Advanced AI algorithms for precise skill and aptitude matching
- **Personalized Career Paths**: Data-driven recommendations with 60% skill match and 40% interest alignment weighting
- **Market Trend Analysis**: Industry trend analysis and demand forecasting
- **Career Progression Planning**: Short-term and long-term career development roadmaps

### 📊 Analytics & Insights
- **Visual Analytics**: Interactive charts and graphs for career match scores
- **Skill Gap Analysis**: Identification of skill gaps and development opportunities
- **Downloadable Reports**: Comprehensive career insights reports in JSON format
- **Progress Tracking**: Dashboard with assessment completion and recommendation tracking

### 🔒 User Management
- **Secure Authentication**: JWT-based authentication system
- **Profile Management**: Comprehensive user profile with demographic and professional information
- **Data Privacy**: Secure user data storage with Oracle Database integration

## Technology Stack

### Frontend
- **React 19.1.1**: Modern React with hooks and functional components
- **React Router**: Client-side routing for single-page application
- **Axios**: HTTP client for API communication
- **Recharts**: Data visualization and charting library
- **Plain CSS**: Custom styling without external frameworks

### Backend
- **FastAPI**: Modern, fast web framework for building APIs
- **SQLAlchemy**: SQL toolkit and Object-Relational Mapping (ORM)
- **Oracle Database**: Enterprise-grade database for data persistence
- **JWT Authentication**: Secure token-based authentication
- **Google Gemini AI**: Advanced AI for career recommendations

## Project Structure

```
├── backend/                    # FastAPI backend
│   ├── main.py                # FastAPI application entry point
│   ├── database.py            # Database configuration
│   ├── models.py              # SQLAlchemy models
│   ├── schemas.py             # Pydantic schemas
│   ├── services/              # Business logic services
│   │   ├── user_service.py    # User management
│   │   ├── assessment_service.py # Assessment processing
│   │   ├── skill_evaluation_service.py # Skill analysis
│   │   ├── recommendation_service.py # AI recommendations
│   │   └── gemini_service.py  # Gemini AI integration
│   └── requirements.txt       # Python dependencies
├── my-app/                    # React frontend
│   ├── src/
│   │   ├── components/        # Reusable UI components
│   │   ├── pages/            # Page components
│   │   ├── contexts/         # React contexts
│   │   └── App.jsx           # Main application component
│   └── package.json          # Node.js dependencies
└── README.md                 # Project documentation
```

## Installation & Setup

### Prerequisites
- Python 3.8+
- Node.js 16+
- Oracle Database (or compatible database)
- Google Gemini API key

### Backend Setup

1. **Navigate to backend directory**:
   ```bash
   cd backend
   ```

2. **Create virtual environment**:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

4. **Environment Configuration**:
   Create a `.env` file in the backend directory:
   ```env
   DATABASE_URL=oracle+oracledb://username:password@localhost:1521/xe
   SECRET_KEY=your-secret-key-here
   GEMINI_API_KEY=your-gemini-api-key-here
   DEBUG=True
   ```

5. **Run the backend server**:
   ```bash
   python main.py
   ```
   The API will be available at `http://localhost:8000`

### Frontend Setup

1. **Navigate to frontend directory**:
   ```bash
   cd my-app
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```
   The application will be available at `http://localhost:5173`

## API Endpoints

### Authentication
- `POST /api/users/register` - User registration
- `POST /api/users/login` - User login
- `GET /api/users/profile` - Get user profile

### Assessments
- `POST /api/assessments` - Create new assessment
- `GET /api/assessments/{id}` - Get assessment results

### Skill Evaluation
- `POST /api/skills/evaluate` - Evaluate user skills
- `GET /api/skills/evaluate` - Get skill evaluation results

### Career Recommendations
- `POST /api/recommendations/generate` - Generate AI recommendations
- `GET /api/recommendations` - Get user recommendations

## Usage Guide

### 1. User Registration
- Create an account with personal and professional information
- Provide age range, current role, industry, and education background

### 2. Aptitude Assessment
- Complete comprehensive aptitude tests covering:
  - Logical reasoning
  - Verbal ability
  - Numerical skills
  - Spatial reasoning
  - Analytical thinking

### 3. Skill Evaluation
- Rate proficiency levels for:
  - Technical skills (Programming, Data Analysis, etc.)
  - Soft skills (Communication, Leadership, etc.)
  - Industry-specific skills

### 4. AI Recommendations
- Generate personalized career recommendations
- View detailed career paths with skill match scores
- Access career progression timelines
- Download comprehensive reports

### 5. Profile Management
- Update personal information
- Download assessment data
- Manage account settings

## Key Features Implementation

### AI Recommendation Algorithm
The system uses a weighted scoring approach:
- **Skill Match (60%)**: How well user skills align with career requirements
- **Interest Alignment (40%)**: How well career matches user interests

### Gemini AI Integration
- Analyzes aptitude test results
- Generates career recommendations based on user profile
- Provides skill gap analysis
- Offers market trend insights

### Data Visualization
- Interactive charts showing career match scores
- Pie charts displaying recommendation factors
- Progress tracking and analytics

## Security & Privacy

- JWT-based authentication
- Secure password handling
- Data encryption in transit
- User data privacy protection
- Oracle Database security features

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions, please contact the development team or create an issue in the repository.

## Future Enhancements

- [ ] Machine learning model training on user feedback
- [ ] Integration with job boards and career platforms
- [ ] Advanced personality assessments
- [ ] Multi-language support
- [ ] Mobile application
- [ ] Real-time career market data integration
