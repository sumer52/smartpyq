#!/usr/bin/env python3
"""
Firestore Data Structure Demo

This script demonstrates how the programs.json data would be structured in Firestore
and creates a local representation of the database structure.
"""

import json
import os
from typing import Dict, Any
from datetime import datetime

class FirestoreStructureDemo:
    def __init__(self):
        self.firestore_structure = {}
        self.upload_count = 0
    
    def load_programs_data(self, json_file_path: str) -> Dict[str, Any]:
        """
        Load programs data from JSON file
        """
        try:
            with open(json_file_path, 'r', encoding='utf-8') as file:
                data = json.load(file)
            print(f"✅ Successfully loaded data from {json_file_path}")
            return data
        except FileNotFoundError:
            print(f"❌ Error: File {json_file_path} not found")
            return {}
        except json.JSONDecodeError as e:
            print(f"❌ Error parsing JSON file: {str(e)}")
            return {}
    
    def simulate_firestore_upload(self, programs_data: Dict[str, Any]):
        """
        Simulate the Firestore upload process and show the structure
        """
        print("\n🔥 Simulating Firestore Upload Process")
        print("=" * 50)
        
        # Initialize the pyq collection
        self.firestore_structure['pyq'] = {}
        
        # Extract languages if present
        languages = programs_data.pop('languages', ['English', 'Hindi', 'Telugu'])
        
        # Create config document
        self.firestore_structure['pyq']['config'] = {
            'languages': languages,
            'created_at': datetime.now().isoformat(),
            'updated_at': datetime.now().isoformat()
        }
        print(f"✅ Created config document with languages: {languages}")
        self.upload_count += 1
        
        # Process each degree program
        for degree_name, degree_data in programs_data.items():
            print(f"\n📚 Processing degree: {degree_name}")
            
            # Create degree document
            self.firestore_structure['pyq'][degree_name] = {
                'name': degree_name,
                'created_at': datetime.now().isoformat(),
                'updated_at': datetime.now().isoformat(),
                'streams': {}  # Subcollection
            }
            print(f"✅ Created degree document: {degree_name}")
            self.upload_count += 1
            
            # Process each stream within the degree
            for stream_name, stream_data in degree_data.items():
                print(f"  📖 Processing stream: {stream_name}")
                
                # Create stream document in streams subcollection
                self.firestore_structure['pyq'][degree_name]['streams'][stream_name] = {
                    'name': stream_name,
                    'degree': degree_name,
                    'created_at': datetime.now().isoformat(),
                    'updated_at': datetime.now().isoformat(),
                    'years': {}  # Subcollection
                }
                print(f"    ✅ Created stream document: {stream_name}")
                self.upload_count += 1
                
                # Process each year within the stream
                for year_name, year_data in stream_data.items():
                    print(f"    📅 Processing year: {year_name}")
                    
                    # Create year document in years subcollection
                    self.firestore_structure['pyq'][degree_name]['streams'][stream_name]['years'][year_name] = {
                        'name': year_name,
                        'stream': stream_name,
                        'degree': degree_name,
                        'created_at': datetime.now().isoformat(),
                        'updated_at': datetime.now().isoformat(),
                        'semesters': {}  # Subcollection
                    }
                    print(f"      ✅ Created year document: {year_name}")
                    self.upload_count += 1
                    
                    # Process each semester within the year
                    for semester_name, subjects in year_data.items():
                        print(f"      📝 Processing semester: {semester_name}")
                        
                        # Create semester document in semesters subcollection
                        self.firestore_structure['pyq'][degree_name]['streams'][stream_name]['years'][year_name]['semesters'][semester_name] = {
                            'name': semester_name,
                            'subjects': subjects,
                            'year': year_name,
                            'stream': stream_name,
                            'degree': degree_name,
                            'subject_count': len(subjects),
                            'created_at': datetime.now().isoformat(),
                            'updated_at': datetime.now().isoformat()
                        }
                        print(f"        ✅ Created semester document: {semester_name} with {len(subjects)} subjects")
                        print(f"        📚 Subjects: {', '.join(subjects)}")
                        self.upload_count += 1
        
        print(f"\n🎉 Simulation completed! Total documents that would be created: {self.upload_count}")
    
    def save_structure_to_file(self, output_file: str = "firestore_structure_demo.json"):
        """
        Save the simulated Firestore structure to a JSON file
        """
        try:
            with open(output_file, 'w', encoding='utf-8') as f:
                json.dump(self.firestore_structure, f, indent=2, ensure_ascii=False)
            print(f"\n💾 Firestore structure saved to: {output_file}")
        except Exception as e:
            print(f"❌ Error saving structure: {str(e)}")
    
    def print_firestore_paths(self):
        """
        Print example Firestore document paths
        """
        print("\n🗂️  Example Firestore Document Paths:")
        print("=" * 40)
        
        paths = [
            "pyq/config",
            "pyq/BSc",
            "pyq/BSc/streams/MSCS",
            "pyq/BSc/streams/MSCS/years/1st Year",
            "pyq/BSc/streams/MSCS/years/1st Year/semesters/Semester 1",
            "pyq/BSc/streams/MSDS",
            "pyq/BSc/streams/Life Sciences",
            "pyq/BCom",
            "pyq/BCom/streams/General"
        ]
        
        for path in paths:
            print(f"  📄 {path}")
    
    def generate_firestore_rules(self):
        """
        Generate Firestore security rules for the data structure
        """
        rules = '''
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read access to all pyq data
    match /pyq/{document=**} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.token.admin == true;
    }
    
    // Specific rules for different collections
    match /pyq/config {
      allow read: if true;
    }
    
    match /pyq/{degree} {
      allow read: if true;
      
      match /streams/{stream} {
        allow read: if true;
        
        match /years/{year} {
          allow read: if true;
          
          match /semesters/{semester} {
            allow read: if true;
          }
        }
      }
    }
  }
}
'''
        
        with open('firestore.rules', 'w') as f:
            f.write(rules)
        
        print("\n🔒 Generated firestore.rules file with security rules")

def main():
    print("🚀 Firestore Data Structure Demo")
    print("=" * 40)
    
    # Initialize demo
    demo = FirestoreStructureDemo()
    
    # Load programs data
    programs_data = demo.load_programs_data("programs.json")
    
    if not programs_data:
        print("❌ No data to process")
        return
    
    # Simulate Firestore upload
    demo.simulate_firestore_upload(programs_data)
    
    # Save structure to file
    demo.save_structure_to_file()
    
    # Print example paths
    demo.print_firestore_paths()
    
    # Generate Firestore rules
    demo.generate_firestore_rules()
    
    print("\n📊 Summary:")
    print(f"   • Total documents to be created: {demo.upload_count}")
    print(f"   • Degrees: BSc, BCom")
    print(f"   • Streams: MSCS, MSDS, Life Sciences, General")
    print(f"   • Languages supported: Hindi, English, Telugu")
    print(f"   • Structure: pyq -> degrees -> streams -> years -> semesters")
    
    print("\n🔧 To upload to actual Firestore:")
    print("   1. Set up Firebase credentials (see setup_firebase_credentials.py)")
    print("   2. Run: python upload_programs_to_firestore.py")
    print("   3. Or use Firebase emulator for testing")
    
    print("\n✅ Demo completed successfully!")

if __name__ == "__main__":
    main()