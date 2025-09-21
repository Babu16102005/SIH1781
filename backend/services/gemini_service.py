import google.generativeai as genai
import os
from typing import Dict, List, Any
import json
import logging

class GeminiService:
    def __init__(self):
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            # Fall back gracefully when no API key is configured
            logging.warning("GEMINI_API_KEY not set. GeminiService will use fallback recommendations.")
            self.model = None
            return
        
        genai.configure(api_key=api_key)
        self.model = genai.GenerativeModel('gemini-1.5-flash')
    
    def stream_chat(self, prompt: str):
        """Yield model tokens incrementally for real-time chat."""
        try:
            if self.model is None:
                # Fallback streaming when no API key/model configured
                fallback = "I'm running in fallback mode. Configure GEMINI_API_KEY to enable live AI responses."
                for chunk in [fallback]:
                    yield chunk
                return

            if not prompt or not prompt.strip():
                yield "Please provide a valid question or message."
                return

            stream = self.model.generate_content(prompt, stream=True)
            for event in stream:
                # Each event may contain text; yield as soon as available
                text = getattr(event, 'text', None)
                if text:
                    yield text
        except Exception as e:
            logging.error(f"Error in stream_chat: {e}")
            # Graceful degradation: send a short error message to the client
            yield f"[Error generating response: {str(e)[:100]}]"
    
    def analyze_aptitude_results(self, aptitude_scores: Dict[str, float]) -> Dict[str, Any]:
        """Analyze aptitude test results using Gemini AI"""
        prompt = f"""
        Analyze the following aptitude test scores and provide insights:
        
        Scores: {json.dumps(aptitude_scores, indent=2)}
        
        Please provide:
        1. Strengths and areas of excellence
        2. Areas for improvement
        3. Career fields that align with these aptitudes
        4. Specific roles that would be suitable
        
        Format the response as a JSON object with the following structure:
        {{
            "strengths": ["strength1", "strength2"],
            "improvement_areas": ["area1", "area2"],
            "suitable_careers": ["career1", "career2"],
            "recommended_roles": ["role1", "role2"],
            "analysis_summary": "brief summary"
        }}
        """
        
        try:
            if self.model is None:
                raise RuntimeError("Gemini model not configured; using fallback.")
            response = self.model.generate_content(prompt)
            if not response.text:
                raise ValueError("Empty response from Gemini API")
            
            # Parse and validate JSON response
            result = json.loads(response.text)
            return self._validate_aptitude_analysis(result)
        except (json.JSONDecodeError, ValueError) as e:
            logging.error(f"Failed to parse Gemini response: {e}")
            return self._get_fallback_aptitude_analysis()
        except Exception as e:
            logging.error(f"Error in analyze_aptitude_results: {e}")
            return self._get_fallback_aptitude_analysis()
    
    def generate_career_recommendations(
        self, 
        user_profile: Dict[str, Any],
        aptitude_scores: Dict[str, float],
        interest_scores: Dict[str, float],
        skill_evaluation: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Generate comprehensive career recommendations using Gemini AI"""
        
        prompt = f"""
        Generate comprehensive career recommendations based on the following user profile and assessments:
        
        User Profile:
        - Age Range: {user_profile.get('age_range', 'Not specified')}
        - Current Role: {user_profile.get('current_job_role', 'Not specified')}
        - Industry: {user_profile.get('industry', 'Not specified')}
        - Education: {user_profile.get('educational_background', 'Not specified')}
        - Experience: {user_profile.get('years_of_experience', 0)} years
        
        Aptitude Scores: {json.dumps(aptitude_scores, indent=2)}
        Interest Scores: {json.dumps(interest_scores, indent=2)}
        Skill Evaluation: {json.dumps(skill_evaluation, indent=2)}
        
        Please provide career recommendations with the following structure:
        {{
            "recommended_careers": [
                {{
                    "title": "Career Title",
                    "industry": "Industry",
                    "skill_match_score": 0.85,
                    "interest_alignment_score": 0.78,
                    "overall_score": 0.82,
                    "description": "Brief description",
                    "required_skills": ["skill1", "skill2"],
                    "growth_potential": "High/Medium/Low",
                    "salary_range": "Range information"
                }}
            ],
            "career_progression_path": {{
                "short_term": ["step1", "step2"],
                "long_term": ["goal1", "goal2"]
            }},
            "skill_development_plan": {{
                "priority_skills": ["skill1", "skill2"],
                "learning_resources": ["resource1", "resource2"],
                "timeline": "6-12 months"
            }},
            "market_trend_analysis": {{
                "industry_trends": ["trend1", "trend2"],
                "demand_forecast": "High/Medium/Low",
                "emerging_roles": ["role1", "role2"]
            }},
            "rationale": "Detailed explanation of recommendations"
        }}
        """
        
        try:
            if self.model is None:
                raise RuntimeError("Gemini model not configured; using fallback.")
            response = self.model.generate_content(prompt)
            if not response.text:
                raise ValueError("Empty response from Gemini API")
            
            # Parse and validate JSON response
            result = json.loads(response.text)
            return self._validate_career_recommendations(result)
        except (json.JSONDecodeError, ValueError) as e:
            logging.error(f"Failed to parse Gemini response: {e}")
            return self.get_fallback_recommendations(user_profile, aptitude_scores, interest_scores)
        except Exception as e:
            logging.error(f"Error in generate_career_recommendations: {e}")
            return self.get_fallback_recommendations(user_profile, aptitude_scores, interest_scores)
    
    def get_fallback_recommendations(
        self, 
        user_profile: Dict[str, Any],
        aptitude_scores: Dict[str, float],
        interest_scores: Dict[str, float]
    ) -> Dict[str, Any]:
        """Provide fallback recommendations when Gemini API fails"""
        
        # Simple recommendation logic based on highest scores
        top_aptitude = max(aptitude_scores.items(), key=lambda x: x[1]) if aptitude_scores else ("logical_reasoning", 0.7)
        top_interest = max(interest_scores.items(), key=lambda x: x[1]) if interest_scores else ("technology", 0.7)
        
        return {
            "recommended_careers": [
                {
                    "title": "Software Developer",
                    "industry": "Technology",
                    "skill_match_score": 0.8,
                    "interest_alignment_score": 0.75,
                    "overall_score": 0.78,
                    "description": "Develop and maintain software applications",
                    "required_skills": ["Programming", "Problem Solving", "Communication"],
                    "growth_potential": "High",
                    "salary_range": "$60,000 - $120,000"
                }
            ],
            "career_progression_path": {
                "short_term": ["Complete relevant certifications", "Build portfolio projects"],
                "long_term": ["Senior Developer", "Tech Lead", "Engineering Manager"]
            },
            "skill_development_plan": {
                "priority_skills": ["Programming Languages", "System Design", "Leadership"],
                "learning_resources": ["Online courses", "Bootcamps", "Mentorship"],
                "timeline": "6-12 months"
            },
            "market_trend_analysis": {
                "industry_trends": ["AI/ML", "Cloud Computing", "Cybersecurity"],
                "demand_forecast": "High",
                "emerging_roles": ["AI Engineer", "DevOps Engineer", "Data Scientist"]
            },
            "rationale": f"Based on your strong {top_aptitude[0]} abilities and interest in {top_interest[0]}, software development appears to be a suitable career path."
        }
    
    def analyze_skill_gaps(self, current_skills: Dict[str, Any], target_role: str) -> Dict[str, Any]:
        """Analyze skill gaps for a specific target role"""
        
        prompt = f"""
        Analyze skill gaps for someone targeting the role: {target_role}
        
        Current Skills: {json.dumps(current_skills, indent=2)}
        
        Provide:
        1. Missing critical skills
        2. Skills that need improvement
        3. Learning recommendations
        4. Priority order for skill development
        
        Format as JSON:
        {{
            "missing_skills": ["skill1", "skill2"],
            "skills_to_improve": ["skill1", "skill2"],
            "learning_recommendations": ["recommendation1", "recommendation2"],
            "priority_order": ["skill1", "skill2"],
            "estimated_timeline": "6-12 months"
        }}
        """
        
        try:
            if self.model is None:
                raise RuntimeError("Gemini model not configured; using fallback.")
            response = self.model.generate_content(prompt)
            if not response.text:
                raise ValueError("Empty response from Gemini API")
            
            # Parse and validate JSON response
            result = json.loads(response.text)
            return self._validate_skill_gaps_analysis(result)
        except (json.JSONDecodeError, ValueError) as e:
            logging.error(f"Failed to parse Gemini response: {e}")
            return self._get_fallback_skill_gaps()
        except Exception as e:
            logging.error(f"Error in analyze_skill_gaps: {e}")
            return self._get_fallback_skill_gaps()
    
    def _validate_aptitude_analysis(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Validate and ensure proper structure for aptitude analysis response"""
        required_keys = ["strengths", "improvement_areas", "suitable_careers", "recommended_roles", "analysis_summary"]
        
        for key in required_keys:
            if key not in data:
                data[key] = []
            elif not isinstance(data[key], list) and key != "analysis_summary":
                data[key] = [str(data[key])] if data[key] else []
        
        return data
    
    def _validate_career_recommendations(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Validate and ensure proper structure for career recommendations response"""
        required_keys = ["recommended_careers", "career_progression_path", "skill_development_plan", 
                        "market_trend_analysis", "rationale"]
        
        for key in required_keys:
            if key not in data:
                if key == "recommended_careers":
                    data[key] = []
                elif key == "rationale":
                    data[key] = "No rationale provided"
                else:
                    data[key] = {}
        
        return data
    
    def _validate_skill_gaps_analysis(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Validate and ensure proper structure for skill gaps analysis response"""
        required_keys = ["missing_skills", "skills_to_improve", "learning_recommendations", 
                        "priority_order", "estimated_timeline"]
        
        for key in required_keys:
            if key not in data:
                if key == "estimated_timeline":
                    data[key] = "6-12 months"
                else:
                    data[key] = []
            elif not isinstance(data[key], list) and key != "estimated_timeline":
                data[key] = [str(data[key])] if data[key] else []
        
        return data
    
    def _get_fallback_aptitude_analysis(self) -> Dict[str, Any]:
        """Get fallback aptitude analysis when API fails"""
        return {
            "strengths": ["Analytical thinking", "Problem solving"],
            "improvement_areas": ["Communication", "Time management"],
            "suitable_careers": ["Technology", "Engineering", "Data Science"],
            "recommended_roles": ["Software Developer", "Data Analyst", "Systems Engineer"],
            "analysis_summary": "Strong analytical abilities with potential in technical fields"
        }
    
    def _get_fallback_skill_gaps(self) -> Dict[str, Any]:
        """Get fallback skill gaps analysis when API fails"""
        return {
            "missing_skills": ["Advanced Programming", "System Design"],
            "skills_to_improve": ["Communication", "Leadership"],
            "learning_recommendations": ["Take online courses", "Join professional groups"],
            "priority_order": ["Advanced Programming", "System Design", "Communication"],
            "estimated_timeline": "6-12 months"
        }
