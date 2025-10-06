import firebase_admin
from firebase_admin import credentials
import os
import json
from dotenv import load_dotenv

load_dotenv()

def initialize_firebase_admin():
    use_firebase = os.getenv("USE_FIREBASE", "false").lower() == "true"
    if not use_firebase:
        # Skip initialization entirely when Firebase auth is disabled
        return
    # Prevent re-initialization error during hot-reloads
    if firebase_admin._apps:
        return

    # Recommended: Load credentials from JSON string in environment variable
    cred_json_str = os.getenv("FIREBASE_SERVICE_ACCOUNT_JSON")
    if cred_json_str:
        try:
            cred_dict = json.loads(cred_json_str)
            cred = credentials.Certificate(cred_dict)
            firebase_admin.initialize_app(cred)
            return
        except (json.JSONDecodeError, ValueError) as e:
            raise ValueError(f"Error parsing FIREBASE_SERVICE_ACCOUNT_JSON: {e}")

    # Fallback: Load from file path (for local development)
    cred_path = os.getenv("FIREBASE_SERVICE_ACCOUNT_KEY_PATH", "./firebase-service-account-key.json")
    if cred_path:
        if not os.path.exists(cred_path):
            raise FileNotFoundError(f"Firebase service account key file not found at: {cred_path}. Make sure the file exists or set FIREBASE_SERVICE_ACCOUNT_JSON in your .env file.")
        
        cred = credentials.Certificate(cred_path)
        firebase_admin.initialize_app(cred)
        return

    raise ValueError("Firebase credentials not found. Set either FIREBASE_SERVICE_ACCOUNT_JSON or FIREBASE_SERVICE_ACCOUNT_KEY_PATH in your .env file.")
