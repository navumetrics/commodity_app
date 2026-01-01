# Commodity Market Dashboard

Real-time commodity and index market data dashboard with live LTP updates from Upstox API.

## Features

- 📊 **Stock Cards**: Display commodity futures data
- 📈 **Index Cards**: Real-time Nifty index with options analysis
- 🔴 **Live Data**: WebSocket streaming from local backend
- 📱 **Responsive Design**: Works on desktop, tablet, and mobile
- 🎨 **Modern UI**: Clean, animated interface with Tailwind CSS

---

## Project Structure

```
commodity_app/
├── src/                    # Frontend (React + Vite)
│   ├── components/
│   │   ├── IndexCard.jsx   # Nifty index card with live LTP
│   │   └── StockCard.jsx   # Commodity stock cards
│   ├── services/
│   │   └── marketDataService.js  # WebSocket client
│   ├── App.jsx
│   └── main.jsx
├── server/                 # Backend (Node.js + Express)
│   ├── server.js          # WebSocket server
│   ├── upstoxService.js   # Upstox API integration
│   ├── package.json
│   └── .env               # Environment variables
├── data.json              # Nifty static data
└── package.json           # Frontend dependencies
```

---

## Setup Instructions

### 1. Install Frontend Dependencies

```bash
npm install
```

### 2. Install Backend Dependencies

```bash
cd server
npm install
cd ..
```

### 3. Configure Upstox API

Edit `server/.env` and add your Upstox access token:

```env
UPSTOX_ACCESS_TOKEN=your_actual_token_here
UPSTOX_API_BASE=https://api.upstox.com/v2
PORT=3001
UPDATE_INTERVAL_MS=3000
MAX_REQUESTS_PER_MINUTE=12
MAX_REQUESTS_PER_30MIN=500
```

---

## Running the Application

### Option 1: Run Both Servers Separately

**Terminal 1 - Backend:**
```bash
cd server
npm start
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

### Option 2: Add Combined Script (Recommended)

Add to root `package.json`:

```json
{
  "scripts": {
    "dev": "vite",
    "server": "cd server && npm start",
    "dev:all": "concurrently \"npm run server\" \"npm run dev\""
  }
}
```

Install concurrently:
```bash
npm install -D concurrently
```

Then run both:
```bash
npm run dev:all
```

---

## How It Works

### Backend (Port 3001)
1. Loads Nifty data from `data.json`
2. Extracts 9 instrument keys (1 index + 8 options)
3. Fetches LTP from Upstox every 3 seconds
4. Broadcasts updates via WebSocket to connected clients
5. Respects rate limits (12 req/min, 500 req/30min)
6. Auto-backoff on 429 errors

### Frontend (Port 5173)
1. Connects to WebSocket on `ws://localhost:3001`
2. Receives initial data + live updates
3. Updates IndexCard with real-time LTP
4. Shows connection status (Live/Offline)
5. Falls back to CP when offline

### Data Flow
```
Upstox API → Backend Server → WebSocket → Frontend → IndexCard
```

---

## API Rate Limits

**Upstox Free Tier:**
- 12 requests per minute
- 500 requests per 30 minutes
- Max 500 instrument keys per request

**Current Usage:**
- 9 keys per request (Nifty + 8 options)
- 1 request every 3 seconds = 20 req/min
- **Adjusted to 12 req/min** to stay within limits

---

## Connection Status

The app shows a live connection indicator:
- 🟢 **Live**: Connected to backend, receiving updates
- 🔴 **Offline**: Backend not running or disconnected

---

## Troubleshooting

### Backend won't start
- Check if port 3001 is available
- Verify Upstox token in `.env`
- Run `cd server && npm install`

### Frontend shows "Offline"
- Ensure backend is running on port 3001
- Check browser console for WebSocket errors
- Verify CORS is enabled in backend

### No LTP updates
- Check Upstox token validity
- Verify instrument keys in `data.json`
- Check backend console for API errors

### Rate limit errors (429)
- Backend will auto-backoff (60s → 5min)
- Reduce `UPDATE_INTERVAL_MS` in `.env`
- Check Upstox dashboard for quota

---

## Future Enhancements

- [ ] Add more indices (Bank Nifty, Fin Nifty)
- [ ] Live stock card data
- [ ] Historical charts
- [ ] Price alerts
- [ ] Mobile app
- [ ] Deploy backend to cloud (Render/Railway)

---

## Tech Stack

**Frontend:**
- React 19
- Vite
- Tailwind CSS
- Motion (Framer Motion)
- Lucide Icons
- WebSocket Client

**Backend:**
- Node.js
- Express
- WebSocket (ws)
- Upstox API
- dotenv

---

## License

MIT

---

## Support

For issues or questions, check:
- Upstox API docs: https://upstox.com/developer/api-documentation
- WebSocket docs: https://developer.mozilla.org/en-US/docs/Web/API/WebSocket
