# Troubleshooting Guide - Career Guidance System

## Common Issues and Solutions

### 1. Frontend Issues

#### Problem: Application won't start or shows errors
**Solution:**
```bash
cd my-app
npm install
npm run dev
```

#### Problem: CSS styling issues
**Solution:**
- The `index.css` has been updated to work with our application
- Make sure `App.css` is properly imported in `App.jsx`

#### Problem: Import errors
**Solution:**
- Check that all files are in the correct directories
- Verify import paths in components

### 2. Backend Issues

#### Problem: Backend won't start
**Solution:**
```bash
cd backend
pip install -r requirements.txt
python run.py
```

#### Problem: Database connection issues
**Solution:**
1. Create a `.env` file in the backend directory
2. Copy the contents from `env_example.txt`
3. Update the database URL with your Oracle Database credentials

#### Problem: Gemini API issues
**Solution:**
1. Get a Gemini API key from Google AI Studio
2. Add it to your `.env` file as `GEMINI_API_KEY=your-key-here`

### 3. Environment Setup

#### Required Environment Variables (backend/.env):
```env
DATABASE_URL=oracle+oracledb://username:password@localhost:1521/xe
SECRET_KEY=your-secret-key-here
GEMINI_API_KEY=your-gemini-api-key-here
DEBUG=True
HOST=0.0.0.0
PORT=8000
```

### 4. Dependencies

#### Frontend Dependencies:
- React 19.1.1
- React Router DOM 6.8.1
- Axios 1.6.2
- Recharts 2.8.0

#### Backend Dependencies:
- FastAPI 0.104.1
- SQLAlchemy 2.0.23
- Oracle DB driver
- Google Generative AI
- JWT authentication libraries

### 5. Quick Start Commands

#### Start Frontend:
```bash
cd my-app
npm install
npm run dev
```
Access at: http://localhost:5173

#### Start Backend:
```bash
cd backend
pip install -r requirements.txt
python run.py
```
Access at: http://localhost:8000
API Docs at: http://localhost:8000/docs

### 6. Testing the Application

1. **Frontend Test:**
   - Open http://localhost:5173
   - You should see the home page with "AI-Driven Career Guidance System"

2. **Backend Test:**
   - Open http://localhost:8000/api/health
   - You should see: `{"status": "healthy", "message": "AI Career Guidance System is running"}`

3. **Full Flow Test:**
   - Register a new account
   - Complete aptitude test
   - Evaluate skills
   - Generate recommendations

### 7. Common Error Messages

#### "Module not found" errors:
- Run `npm install` in the my-app directory
- Check that all files are in the correct locations

#### "Connection refused" errors:
- Make sure the backend is running on port 8000
- Check that the API URL in frontend matches backend

#### "Authentication failed" errors:
- Check that JWT secret is set in backend .env file
- Verify user registration/login flow

### 8. File Structure Verification

Make sure you have this structure:
```
├── backend/
│   ├── main.py
│   ├── database.py
│   ├── models.py
│   ├── schemas.py
│   ├── services/
│   └── requirements.txt
├── my-app/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── contexts/
│   │   ├── utils/
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
```

### 9. Browser Console Errors

If you see errors in the browser console:
1. Check the Network tab for failed API calls
2. Verify that the backend is running
3. Check for CORS issues (should be handled by FastAPI middleware)

### 10. Still Having Issues?

1. Check the terminal/console for error messages
2. Verify all dependencies are installed
3. Make sure both frontend and backend are running
4. Check that all environment variables are set correctly

## Getting Help

If you're still experiencing issues:
1. Check the browser console for JavaScript errors
2. Check the backend terminal for Python errors
3. Verify the file structure matches the expected layout
4. Make sure all dependencies are properly installed
