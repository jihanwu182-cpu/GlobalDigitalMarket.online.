"""Flask backend for digital clock application"""

from flask import Flask, jsonify
from flask_cors import CORS
from datetime import datetime
import pytz

app = Flask(__name__)
CORS(app)

# Major financial time zones
TIME_ZONES = {
    'New York': 'America/New_York',
    'London': 'Europe/London',
    'Tokyo': 'Asia/Tokyo',
    'Hong Kong': 'Asia/Hong_Kong',
    'Sydney': 'Australia/Sydney',
    'Dubai': 'Asia/Dubai',
    'Singapore': 'Asia/Singapore',
    'Frankfurt': 'Europe/Berlin',
    'Toronto': 'America/Toronto',
    'São Paulo': 'America/Sao_Paulo',
    'Mumbai': 'Asia/Kolkata',
    'Moscow': 'Europe/Moscow'
}

@app.route('/api/time', methods=['GET'])
def get_current_time():
    """Get current time in all configured time zones"""
    times = {}
    
    for city, tz_name in TIME_ZONES.items():
        tz = pytz.timezone(tz_name)
        current_time = datetime.now(tz)
        times[city] = {
            'timezone': tz_name,
            'time': current_time.strftime('%H:%M:%S'),
            'date': current_time.strftime('%Y-%m-%d'),
            '12hour': current_time.strftime('%I:%M:%S %p'),
            'offset': current_time.strftime('%z')
        }
    
    return jsonify(times), 200

@app.route('/api/timezones', methods=['GET'])
def get_timezones():
    """Get list of available time zones"""
    return jsonify({
        'timezones': list(TIME_ZONES.keys()),
        'count': len(TIME_ZONES)
    }), 200

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({'status': 'ok', 'message': 'Digital Clock API is running'}), 200

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
