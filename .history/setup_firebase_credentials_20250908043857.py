#!/usr/bin/env python3
"""
Firebase Project Setup and Credentials Helper

This script helps set up Firebase credentials and provides instructions
for obtaining the necessary service account key.
"""

import os
import json

def create_sample_credentials():
    """
    Create a sample credentials file template
    """
    sample_creds = {
        "type": "service_account",
        "project_id": "your-project-id",
        "private_key_id": "your-private-key-id",
        "private_key": "-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----\n",
        "client_email": "your-service-account@your-project-id.iam.gserviceaccount.com",
        "client_id": "your-client-id",
        "auth_uri": "https://accounts.google.com/o/oauth2/auth",
        "token_uri": "https://oauth2.googleapis.com/token",
        "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
        "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/your-service-account%40your-project-id.iam.gserviceaccount.com"
    }
    
    with open('firebase-credentials-template.json', 'w') as f:
        json.dump(sample_creds, f, indent=2)
    
    print("✅ Created firebase-credentials-template.json")

def print_setup_instructions():
    """
    Print detailed setup instructions
    """
    print("\n🔧 Firebase Credentials Setup Instructions")
    print("=" * 50)
    print("\n1. Go to Firebase Console: https://console.firebase.google.com/")
    print("2. Select your project (smartpyq-2201ans)")
    print("3. Go to Project Settings (gear icon) > Service Accounts")
    print("4. Click 'Generate new private key'")
    print("5. Download the JSON file")
    print("6. Rename it to 'firebase-credentials.json'")
    print("7. Place it in this directory: C:\\Users\\sumer\\Desktop\\ANS\\")
    print("\n📋 Alternative: Use Firebase CLI Authentication")
    print("1. Run: firebase login --reauth")
    print("2. Run: firebase projects:list")
    print("3. Run: firebase use smartpyq-2201ans")
    print("\n⚠️  Security Note: Never commit credentials to version control!")
    print("Add firebase-credentials.json to your .gitignore file.")

def check_firebase_project():
    """
    Check if Firebase project is properly configured
    """
    print("\n🔍 Checking Firebase Project Configuration...")
    
    # Check if .firebaserc exists
    if os.path.exists('.firebaserc'):
        try:
            with open('.firebaserc', 'r') as f:
                config = json.load(f)
            project_id = config.get('projects', {}).get('default')
            if project_id:
                print(f"✅ Firebase project configured: {project_id}")
                return project_id
        except:
            pass
    
    print("❌ Firebase project not configured")
    return None

def main():
    print("🚀 Firebase Credentials Setup Helper")
    print("=" * 40)
    
    # Check current directory
    print(f"📁 Current directory: {os.getcwd()}")
    
    # Check Firebase project
    project_id = check_firebase_project()
    
    # Check for existing credentials
    creds_file = 'firebase-credentials.json'
    if os.path.exists(creds_file):
        print(f"✅ Credentials file found: {creds_file}")
        try:
            with open(creds_file, 'r') as f:
                creds = json.load(f)
            print(f"✅ Project ID in credentials: {creds.get('project_id', 'Not found')}")
        except:
            print("❌ Error reading credentials file")
    else:
        print(f"❌ Credentials file not found: {creds_file}")
        create_sample_credentials()
    
    # Print setup instructions
    print_setup_instructions()
    
    print("\n🎯 Next Steps:")
    print("1. Follow the instructions above to get your credentials")
    print("2. Run: python upload_programs_to_firestore.py")
    print("3. Your data will be uploaded to Firestore!")

if __name__ == "__main__":
    main()