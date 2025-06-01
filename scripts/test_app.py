import os
import json
import sqlite3
from datetime import datetime

def test_database():
    """Test database connectivity and structure"""
    print("Testing database...")
    
    try:
        conn = sqlite3.connect('../netflix_titles.db')
        cursor = conn.cursor()
        
        # Check if tables exist
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
        tables = cursor.fetchall()
        print(f"Found tables: {[t[0] for t in tables]}")
        
        # Check record count
        cursor.execute("SELECT COUNT(*) FROM netflix_titles")
        count = cursor.fetchone()[0]
        print(f"Total records in netflix_titles: {count}")
        
        conn.close()
        print("✓ Database tests passed")
        return True
    except Exception as e:
        print(f"✗ Database test failed: {str(e)}")
        return False

def test_json_data():
    """Test JSON data file"""
    print("\nTesting JSON data...")
    
    try:
        json_path = '../data/netflix_titles.json'
        if not os.path.exists(json_path):
            print(f"✗ JSON file not found at {json_path}")
            return False
            
        with open(json_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
            
        print(f"JSON records: {len(data)}")
        
        # Test date format
        date_format = '%Y-%m-%d'
        invalid_dates = []
        for item in data[:100]:  # Test first 100 records
            if item.get('date_added'):
                try:
                    datetime.strptime(item['date_added'], date_format)
                except ValueError:
                    invalid_dates.append(item['date_added'])
        
        if invalid_dates:
            print(f"✗ Found invalid dates: {invalid_dates[:5]}")
            return False
            
        print("✓ JSON data tests passed")
        return True
    except Exception as e:
        print(f"✗ JSON data test failed: {str(e)}")
        return False

def test_file_structure():
    """Test required files and directories"""
    print("\nTesting file structure...")
    
    required_files = [
        '../index.html',
        '../css/style.css',
        '../js/main.js',
        '../js/political_context.js',
        '../manifest.json',
        '../sw.js',
        '../README.md',
        '../requirements.txt'
    ]
    
    missing_files = []
    for file_path in required_files:
        if not os.path.exists(file_path):
            missing_files.append(file_path)
    
    if missing_files:
        print(f"✗ Missing required files: {missing_files}")
        return False
    
    print("✓ File structure tests passed")
    return True

def run_tests():
    """Run all tests"""
    print("Running application tests...\n")
    
    tests = [
        test_database(),
        test_json_data(),
        test_file_structure()
    ]
    
    if all(tests):
        print("\n✓ All tests passed!")
        return True
    else:
        print("\n✗ Some tests failed")
        return False

if __name__ == '__main__':
    run_tests() 