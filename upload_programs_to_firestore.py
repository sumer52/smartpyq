#!/usr/bin/env python3
"""
Firebase Firestore Program Data Upload Script

This script reads programs.json and uploads the degree program data to Firebase Firestore
with the following hierarchy:
- Root Collection: 'pyq'
- Document for each degree (BSc, BCom, etc.)
- Subcollections: streams, years, semesters
- Each semester document has a 'subjects' field containing the array of subjects
"""

import json
import os
from typing import Dict, Any

try:
    import firebase_admin
    from firebase_admin import credentials, firestore
except ImportError:
    print("Error: firebase-admin package not found. Please install it using:")
    print("pip install firebase-admin")
    exit(1)


class FirestoreProgramUploader:
    def __init__(self, credentials_path: str = None):
        """
        Initialize Firebase Admin SDK and Firestore client
        
        Args:
            credentials_path: Path to Firebase service account credentials JSON file
        """
        self.db = None
        self.initialize_firebase(credentials_path)
    
    def initialize_firebase(self, credentials_path: str = None):
        """
        Initialize Firebase Admin SDK
        """
        try:
            # Check if Firebase app is already initialized
            if not firebase_admin._apps:
                if credentials_path and os.path.exists(credentials_path):
                    # Use service account credentials
                    cred = credentials.Certificate(credentials_path)
                    firebase_admin.initialize_app(cred)
                    print(f"✅ Firebase initialized with credentials: {credentials_path}")
                else:
                    # Use default credentials (for local development or cloud environment)
                    firebase_admin.initialize_app()
                    print("✅ Firebase initialized with default credentials")
            
            # Initialize Firestore client
            self.db = firestore.client()
            print("✅ Firestore client initialized successfully")
            
        except Exception as e:
            print(f"❌ Error initializing Firebase: {str(e)}")
            print("Make sure you have proper Firebase credentials configured.")
            exit(1)
    
    def load_programs_data(self, json_file_path: str) -> Dict[str, Any]:
        """
        Load programs data from JSON file
        
        Args:
            json_file_path: Path to programs.json file
            
        Returns:
            Dictionary containing programs data
        """
        try:
            with open(json_file_path, 'r', encoding='utf-8') as file:
                data = json.load(file)
            print(f"✅ Successfully loaded data from {json_file_path}")
            return data
        except FileNotFoundError:
            print(f"❌ Error: File {json_file_path} not found")
            exit(1)
        except json.JSONDecodeError as e:
            print(f"❌ Error parsing JSON file: {str(e)}")
            exit(1)
    
    def upload_programs_to_firestore(self, programs_data: Dict[str, Any]):
        """
        Upload programs data to Firestore with the specified hierarchy
        
        Hierarchy:
        pyq (collection)
        ├── BSc (document)
        │   ├── streams (subcollection)
        │   │   ├── MSCS (document)
        │   │   │   ├── years (subcollection)
        │   │   │   │   ├── 1st Year (document)
        │   │   │   │   │   ├── semesters (subcollection)
        │   │   │   │   │   │   ├── Semester 1 (document)
        │   │   │   │   │   │   │   └── subjects: [array]
        """
        try:
            # Extract languages if present
            languages = programs_data.pop('languages', ['English', 'Hindi', 'Telugu'])
            
            # Upload languages as a separate document
            languages_ref = self.db.collection('pyq').document('config')
            languages_ref.set({
                'languages': languages,
                'created_at': firestore.SERVER_TIMESTAMP,
                'updated_at': firestore.SERVER_TIMESTAMP
            })
            print(f"✅ Uploaded languages configuration: {languages}")
            
            # Process each degree program
            for degree_name, degree_data in programs_data.items():
                print(f"\n📚 Processing degree: {degree_name}")
                
                # Create degree document
                degree_ref = self.db.collection('pyq').document(degree_name)
                degree_ref.set({
                    'name': degree_name,
                    'created_at': firestore.SERVER_TIMESTAMP,
                    'updated_at': firestore.SERVER_TIMESTAMP
                })
                print(f"✅ Created degree document: {degree_name}")
                
                # Process each stream within the degree
                for stream_name, stream_data in degree_data.items():
                    print(f"  📖 Processing stream: {stream_name}")
                    
                    # Create stream document in streams subcollection
                    stream_ref = degree_ref.collection('streams').document(stream_name)
                    stream_ref.set({
                        'name': stream_name,
                        'degree': degree_name,
                        'created_at': firestore.SERVER_TIMESTAMP,
                        'updated_at': firestore.SERVER_TIMESTAMP
                    })
                    print(f"    ✅ Created stream document: {stream_name}")
                    
                    # Process each year within the stream
                    for year_name, year_data in stream_data.items():
                        print(f"    📅 Processing year: {year_name}")
                        
                        # Create year document in years subcollection
                        year_ref = stream_ref.collection('years').document(year_name)
                        year_ref.set({
                            'name': year_name,
                            'stream': stream_name,
                            'degree': degree_name,
                            'created_at': firestore.SERVER_TIMESTAMP,
                            'updated_at': firestore.SERVER_TIMESTAMP
                        })
                        print(f"      ✅ Created year document: {year_name}")
                        
                        # Process each semester within the year
                        for semester_name, subjects in year_data.items():
                            print(f"      📝 Processing semester: {semester_name}")
                            
                            # Create semester document in semesters subcollection
                            semester_ref = year_ref.collection('semesters').document(semester_name)
                            semester_ref.set({
                                'name': semester_name,
                                'subjects': subjects,
                                'year': year_name,
                                'stream': stream_name,
                                'degree': degree_name,
                                'subject_count': len(subjects),
                                'created_at': firestore.SERVER_TIMESTAMP,
                                'updated_at': firestore.SERVER_TIMESTAMP
                            })
                            print(f"        ✅ Created semester document: {semester_name} with {len(subjects)} subjects")
                            print(f"        📚 Subjects: {', '.join(subjects)}")
            
            print("\n🎉 All program data uploaded successfully to Firestore!")
            
        except Exception as e:
            print(f"❌ Error uploading data to Firestore: {str(e)}")
            raise
    
    def verify_upload(self):
        """
        Verify that the data was uploaded correctly by reading some documents
        """
        try:
            print("\n🔍 Verifying upload...")
            
            # Check if pyq collection exists
            pyq_docs = list(self.db.collection('pyq').limit(5).stream())
            print(f"✅ Found {len(pyq_docs)} documents in 'pyq' collection")
            
            # Check a specific path
            bsc_ref = self.db.collection('pyq').document('BSc')
            if bsc_ref.get().exists:
                print("✅ BSc degree document exists")
                
                # Check streams
                streams = list(bsc_ref.collection('streams').limit(3).stream())
                print(f"✅ Found {len(streams)} streams in BSc")
                
                if streams:
                    stream_doc = streams[0]
                    print(f"✅ Sample stream: {stream_doc.id}")
                    
                    # Check years
                    years = list(stream_doc.reference.collection('years').limit(2).stream())
                    print(f"✅ Found {len(years)} years in {stream_doc.id}")
                    
                    if years:
                        year_doc = years[0]
                        print(f"✅ Sample year: {year_doc.id}")
                        
                        # Check semesters
                        semesters = list(year_doc.reference.collection('semesters').limit(2).stream())
                        print(f"✅ Found {len(semesters)} semesters in {year_doc.id}")
                        
                        if semesters:
                            semester_doc = semesters[0]
                            semester_data = semester_doc.to_dict()
                            print(f"✅ Sample semester: {semester_doc.id}")
                            print(f"✅ Subject count: {semester_data.get('subject_count', 0)}")
            
            print("\n✅ Verification completed successfully!")
            
        except Exception as e:
            print(f"❌ Error during verification: {str(e)}")


def main():
    """
    Main function to execute the upload process
    """
    print("🚀 Starting Firebase Firestore Program Data Upload")
    print("=" * 50)
    
    # Configuration
    json_file_path = "programs.json"
    credentials_path = os.getenv('FIREBASE_CREDENTIALS_PATH', 'firebase-credentials.json')
    
    # Check if credentials file exists, if not, try default authentication
    if not os.path.exists(credentials_path):
        print(f"⚠️  Credentials file not found at {credentials_path}")
        print("Attempting to use default Firebase authentication...")
        credentials_path = None
    
    try:
        # Initialize uploader
        uploader = FirestoreProgramUploader(credentials_path)
        
        # Load programs data
        programs_data = uploader.load_programs_data(json_file_path)
        
        # Upload to Firestore
        uploader.upload_programs_to_firestore(programs_data)
        
        # Verify upload
        uploader.verify_upload()
        
        print("\n🎉 Program data upload completed successfully!")
        print("\n📊 Summary:")
        print(f"   • Degrees: {len([k for k in programs_data.keys() if k != 'languages'])}")
        print(f"   • Languages supported: Hindi, English, Telugu")
        print(f"   • Data structure: pyq -> degrees -> streams -> years -> semesters")
        print(f"   • Each semester contains subjects array and metadata")
        
    except Exception as e:
        print(f"\n❌ Upload failed: {str(e)}")
        print("\n🔧 Troubleshooting tips:")
        print("   1. Make sure Firebase Admin SDK is installed: pip install firebase-admin")
        print("   2. Ensure you have proper Firebase credentials configured")
        print("   3. Check that the programs.json file exists in the current directory")
        print("   4. Verify your Firebase project permissions")
        exit(1)


if __name__ == "__main__":
    main()