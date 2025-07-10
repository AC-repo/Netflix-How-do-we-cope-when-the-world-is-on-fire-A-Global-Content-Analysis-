import csv
import json
from datetime import datetime

def clean_value(value):
    if value == '' or value.lower() == 'nan':
        return None
    try:
        # Try to convert to int
        if value.isdigit():
            return int(value)
        # Try to convert to float
        float_val = float(value)
        return float_val if float_val.is_integer() else float_val
    except ValueError:
        # If not a number, return as string
        return value

def convert_csv_to_json(csv_file, json_file):
    data = []
    with open(csv_file, 'r', encoding='utf-8') as file:
        csv_reader = csv.DictReader(file)
        for row in csv_reader:
            # Clean and convert each value
            cleaned_row = {
                key: clean_value(value)
                for key, value in row.items()
            }
            data.append(cleaned_row)
    
    # Write to JSON file with proper formatting
    with open(json_file, 'w', encoding='utf-8') as file:
        json.dump(data, file, indent=2, ensure_ascii=False)

if __name__ == '__main__':
    convert_csv_to_json('data/netflix_titles.csv', 'data/netflix_titles.json')
    print("Conversion complete. Check netflix_titles.json for the result.") 