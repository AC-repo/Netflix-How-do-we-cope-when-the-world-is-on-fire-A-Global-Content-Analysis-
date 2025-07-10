import http.server
import socketserver
import os
import sys
import json
import time
import signal
import mimetypes
import socket
import threading
from urllib.parse import parse_qs, urlparse, unquote
import sqlite3
import pandas as pd
from functools import wraps

# Configuration
PREFERRED_PORTS = [8080]  # Stick to one port to avoid confusion
MAX_PORT_ATTEMPTS = 3
CHUNK_SIZE = 1024 * 1024  # 1MB chunks for better performance
MAX_RETRIES = 3
RETRY_DELAY = 2
BASE_PATH = ''  # Remove base path to simplify routing

# Store the actual port being used
ACTIVE_PORT = None
active_server = None

def retry_on_error(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        retries = 0
        while retries < MAX_RETRIES:
            try:
                return func(*args, **kwargs)
            except (sqlite3.Error, pd.errors.DatabaseError) as e:
                print(f"Database error (attempt {retries + 1}/{MAX_RETRIES}): {e}", file=sys.stderr)
                retries += 1
                if retries == MAX_RETRIES:
                    raise
                time.sleep(RETRY_DELAY)
    return wrapper

def normalize_path(path):
    """Normalize path to handle both root and base path prefixes"""
    path = unquote(path)
    
    # Remove base path if present
    if path.startswith(BASE_PATH):
        path = path[len(BASE_PATH):]
    
    # Clean up path
    path = path.lstrip('/')
    if not path:
        path = 'index.html'
    
    return path

class NetflixHandler(http.server.SimpleHTTPRequestHandler):
    protocol_version = 'HTTP/1.1'
    
    def __init__(self, *args, **kwargs):
        # Increase buffer sizes for better performance
        self.rbufsize = CHUNK_SIZE
        self.wbufsize = CHUNK_SIZE
        super().__init__(*args, **kwargs)

    def end_headers(self):
        # CORS headers
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', '*')
        
        # Cache control
        path = self.translate_path(self.path)
        if path.endswith(('.html', '.json', '.js')):
            self.send_header('Cache-Control', 'no-cache')
        else:
            self.send_header('Cache-Control', 'public, max-age=3600')
        
        super().end_headers()

    def handle_one_request(self):
        try:
            super().handle_one_request()
        except ConnectionError as e:
            self.log_error(f"Connection error: {str(e)}")
        except Exception as e:
            self.log_error(f"Error handling request: {str(e)}")
            try:
                self.send_error(500, "Internal server error")
            except:
                pass

    def do_GET(self):
        try:
            print(f"Handling request for: {self.path}")
            
            # Normalize path
            self.path = normalize_path(self.path)
            
            # Get the absolute file path
            file_path = os.path.abspath(os.path.join(os.getcwd(), self.path))
            
            # Security check
            if not file_path.startswith(os.getcwd()):
                self.send_error(403, "Forbidden")
                return

            # Handle API endpoints
            if self.path.startswith('api/'):
                self.handle_api_request()
                return

            # Check if file exists
            if not os.path.exists(file_path):
                self.send_error(404, f"File not found: {self.path}")
                return

            # Handle different file types
            if file_path.endswith('.json'):
                self.send_chunked_file(file_path, 'application/json')
            elif file_path.endswith(('.js', '.mjs')):
                self.send_chunked_file(file_path, 'application/javascript')
            elif file_path.endswith('.css'):
                self.send_chunked_file(file_path, 'text/css')
            elif file_path.endswith(('.jpg', '.jpeg', '.png', '.gif', '.svg')):
                self.send_binary_file(file_path)
            else:
                return http.server.SimpleHTTPRequestHandler.do_GET(self)
            
        except Exception as e:
            self.log_error(f"Error handling request {self.path}: {str(e)}")
            self.send_error(500, "Internal server error")

    def handle_api_request(self):
        try:
            if self.path == 'api/countries':
                self.send_json(self.get_countries())
            elif self.path.startswith('api/country/'):
                country = self.path[12:]  # Remove 'api/country/'
                self.send_json(self.get_country_data(country))
            else:
                self.send_error(404, "API endpoint not found")
        except Exception as e:
            self.log_error(f"API error: {str(e)}")
            self.send_error(500, "Internal server error")

    @retry_on_error
    def get_db_connection(self):
        if not os.path.exists('netflix_titles.db'):
            raise FileNotFoundError("Database file not found. Please run setup_database.py first.")
        
        conn = sqlite3.connect('netflix_titles.db', timeout=30)
        conn.row_factory = sqlite3.Row
        return conn

def setup_environment():
    """Set up the server environment"""
    # Ensure we're in the right directory
    script_dir = os.path.dirname(os.path.abspath(__file__))
    os.chdir(script_dir)
    
    # Ensure required directories exist
    required_dirs = ['data', 'js', 'css', 'images']
    for directory in required_dirs:
        dir_path = os.path.join(os.getcwd(), directory)
        if not os.path.exists(dir_path):
            try:
                os.makedirs(dir_path)
                print(f"Created directory: {directory}")
            except Exception as e:
                print(f"Warning: Could not create directory {directory}: {e}", file=sys.stderr)
    
    # Check for required files
    required_files = [
        ('netflix_titles.db', 'Database file not found. Please run setup_database.py first.'),
        ('data/netflix_titles.json', 'JSON data file not found. Please run convert_csv.py first.'),
        ('index.html', 'Main HTML file not found.'),
        ('js/main.js', 'Main JavaScript file not found.')
    ]
    
    missing_files = []
    for file_path, message in required_files:
        if not os.path.exists(file_path):
            missing_files.append(message)
    
    if missing_files:
        print("\nMissing required files:", file=sys.stderr)
        for message in missing_files:
            print(f"- {message}", file=sys.stderr)
        sys.exit(1)

def run_server():
    """Run the server with proper setup"""
    global ACTIVE_PORT, active_server
    
    print("\nInitializing server...")
    
    # Set up environment
    try:
        setup_environment()
    except Exception as e:
        print(f"\nFailed to initialize server environment: {e}", file=sys.stderr)
        sys.exit(1)
    
    # Set up signal handlers
    signal.signal(signal.SIGINT, signal_handler)
    signal.signal(signal.SIGTERM, signal_handler)

    # Try to start server
    for port in PREFERRED_PORTS:
        try:
            print(f"\nStarting server on port {port}...")
            server = socketserver.ThreadingTCPServer(('', port), NetflixHandler)
            server.daemon_threads = True
            ACTIVE_PORT = port
            active_server = server
            
            print(f"\nServer running at: http://localhost:{port}/")
            print("\nPress Ctrl+C to stop the server")
            
            server.serve_forever()
            break
        except OSError as e:
            print(f"Port {port} is in use. Error: {e}", file=sys.stderr)
    else:
        print("\nCould not find an available port.", file=sys.stderr)
        print("Please ensure no other servers are running and try again.", file=sys.stderr)
        sys.exit(1)

def signal_handler(signum, frame):
    """Handle graceful shutdown"""
    print("\nShutting down server...")
    if active_server:
        active_server.shutdown()
        active_server.server_close()
    sys.exit(0)

if __name__ == '__main__':
    run_server() 