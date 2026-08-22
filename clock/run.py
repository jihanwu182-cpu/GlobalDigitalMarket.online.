"""Entry point for digital clock application"""

import os
from clock.app import app

if __name__ == '__main__':
    # Serve static files
    print("\n" + "="*50)
    print("🌍 Global Market Digital Clock")
    print("="*50)
    print("Backend running on: http://localhost:5000")
    print("Frontend running on: http://localhost:5000/static/index.html")
    print("API endpoint: http://localhost:5000/api/time")
    print("="*50 + "\n")
    
    app.run(host='0.0.0.0', port=5000, debug=True)
