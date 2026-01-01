# Quick Start Guide

## Running the Application

### 1. Start Backend Servers (2 terminals)

**Terminal 1 - Main Server:**
```bash
cd d:\commodity_app\server
npm start
```
Runs on: `http://localhost:3001`

**Terminal 2 - MongoDB Server:**
```bash
cd d:\commodity_app\server
npm run mongo-server
```
Runs on: `http://localhost:3002`

### 2. Start Frontend (1 terminal)

**Terminal 3 - React App:**
```bash
cd d:\commodity_app
npm run dev
```
Access at: `http://localhost:5173/commodity_app/`

---

## Deploying to GitHub Pages

### 3. Start Cloudflare Tunnels (2 terminals)

**Terminal 4 - Main Server Tunnel:**
```bash
cd d:\commodity_app
cloudflared tunnel --url http://localhost:3001
```
Copy the URL (e.g., `https://xxx-yyy.trycloudflare.com`)

**Terminal 5 - Mongo Server Tunnel:**
```bash
cd d:\commodity_app
cloudflared tunnel --url http://localhost:3002
```
Copy the URL (e.g., `https://aaa-bbb.trycloudflare.com`)

### 4. Update Production Config

Edit `d:\commodity_app\.env.production`:
```bash
VITE_WS_URL=wss://your-main-tunnel-url.trycloudflare.com
VITE_API_URL=https://your-mongo-tunnel-url.trycloudflare.com
```

### 5. Deploy

```bash
cd d:\commodity_app
git add .
git commit -m "Your changes"
git push
npm run deploy
```

Live at: `https://navumetrics.github.io/commodity_app/`

---

## Quick Reference

| Service | Command | Port/URL |
|---------|---------|----------|
| Main Server | `npm start` | 3001 |
| Mongo Server | `npm run mongo-server` | 3002 |
| Frontend Dev | `npm run dev` | 5173 |
| Preview Build | `npm run preview` | 4173 |
| Main Tunnel | `cloudflared tunnel --url http://localhost:3001` | HTTPS |
| Mongo Tunnel | `cloudflared tunnel --url http://localhost:3002` | HTTPS |
| Deploy | `npm run deploy` | GitHub Pages |

**Note:** Keep all 5 terminals running for the live site to work!
