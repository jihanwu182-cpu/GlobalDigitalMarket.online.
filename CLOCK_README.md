# 🌍 Global Market Digital Clock

A beautiful, real-time digital clock application that displays the current time in major financial centers around the world. Built with Python (Flask) backend and modern HTML/CSS/JavaScript frontend.

## Features

✨ **Core Features:**
- Real-time clock display for 12 major financial hubs
- Automatic refresh every second
- 24-hour and 12-hour time format toggle
- UTC offset display for each timezone
- Responsive design (works on desktop, tablet, mobile)
- Beautiful gradient UI with glass-morphism effects
- Smooth animations and transitions

🌐 **Supported Time Zones:**
1. New York (America/New_York)
2. London (Europe/London)
3. Tokyo (Asia/Tokyo)
4. Hong Kong (Asia/Hong_Kong)
5. Sydney (Australia/Sydney)
6. Dubai (Asia/Dubai)
7. Singapore (Asia/Singapore)
8. Frankfurt (Europe/Berlin)
9. Toronto (America/Toronto)
10. São Paulo (America/Sao_Paulo)
11. Mumbai (Asia/Kolkata)
12. Moscow (Europe/Moscow)

## Project Structure

```
clock/
├── __init__.py
├── app.py                 # Flask backend application
├── requirements.txt       # Python dependencies
├── run.py                 # Entry point
└── static/
    ├── index.html         # Frontend HTML
    ├── styles.css         # Styling
    └── script.js          # Frontend JavaScript
```

## Installation & Setup

### Prerequisites
- Python 3.8+
- pip (Python package manager)

### Step 1: Install Dependencies

```bash
cd clock
pip install -r requirements.txt
```

### Step 2: Run the Application

```bash
python run.py
```

The application will start on:
- **Backend API**: http://localhost:5000
- **Frontend**: Open your browser and navigate to `http://localhost:5000/static/index.html`

## API Endpoints

### Get Current Time in All Time Zones
```
GET /api/time
```

**Response:**
```json
{
  "New York": {
    "timezone": "America/New_York",
    "time": "14:30:45",
    "date": "2024-08-22",
    "12hour": "02:30:45 PM",
    "offset": "-0400"
  },
  "London": {
    "timezone": "Europe/London",
    "time": "19:30:45",
    "date": "2024-08-22",
    "12hour": "07:30:45 PM",
    "offset": "+0100"
  },
  ...
}
```

### Get Available Time Zones
```
GET /api/timezones
```

**Response:**
```json
{
  "timezones": ["New York", "London", "Tokyo", ...],
  "count": 12
}
```

### Health Check
```
GET /api/health
```

**Response:**
```json
{
  "status": "ok",
  "message": "Digital Clock API is running"
}
```

## Usage

1. **View Real-Time Clocks**: The application automatically updates every second
2. **Toggle Time Format**: Click "Switch to 12-Hour Format" or "Switch to 24-Hour Format" button
3. **Manual Refresh**: Click "Refresh Now" button to fetch the latest time data
4. **Responsive Design**: Works seamlessly on different screen sizes

## Customization

### Add More Time Zones

Edit `clock/app.py` and add to the `TIME_ZONES` dictionary:

```python
TIME_ZONES = {
    'New York': 'America/New_York',
    'London': 'Europe/London',
    # Add your timezone here
    'Your City': 'Continent/City',
}
```

Refer to [pytz documentation](https://pypi.org/project/pytz/) for timezone names.

### Modify Colors

Edit `clock/static/styles.css` and change the gradient in the `body` selector:

```css
body {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}
```

### Change Refresh Interval

Edit `clock/static/script.js` and modify the interval (in milliseconds):

```javascript
function startAutoUpdate() {
    updateInterval = setInterval(() => {
        fetchAndDisplayClocks();
    }, 1000); // Change 1000 to desired milliseconds
}
```

## Technologies Used

**Backend:**
- Python 3.x
- Flask 2.3.0
- Flask-CORS 3.0.10
- pytz (timezone library)

**Frontend:**
- HTML5
- CSS3 (with animations and glass-morphism)
- Vanilla JavaScript (ES6)

## Troubleshooting

### "Failed to load time data" error
- Make sure the Flask server is running on port 5000
- Check browser console for detailed error messages
- Try `http://localhost:5000/api/health` to verify the server is running

### Port 5000 Already in Use
```bash
# Change the port in clock/run.py
app.run(host='0.0.0.0', port=5001, debug=True)  # Use 5001 instead
```

### CORS Issues
- Ensure Flask-CORS is properly installed
- Check that `CORS(app)` is initialized in `clock/app.py`

## Performance Notes

- Each clock updates independently
- API calls are made once per second (configurable)
- The frontend uses efficient DOM manipulation
- CSS animations are GPU-accelerated for smooth performance

## Browser Support

- Chrome/Edge: ✅ Full support
- Firefox: ✅ Full support
- Safari: ✅ Full support
- Mobile browsers: ✅ Full support (responsive design)

## Future Enhancements

- [ ] Add user preferences for selected time zones
- [ ] Store user preferences in browser localStorage
- [ ] Add weather information for each city
- [ ] Add market status indicators (market open/closed)
- [ ] Add sound notifications at specific times
- [ ] Export time data to CSV/JSON
- [ ] Dark/Light theme toggle
- [ ] Add analog clock visualization option

## License

This project is part of GlobalMarket.com broker investment platform.

## Support

For issues or feature requests, please create an issue in the repository.
