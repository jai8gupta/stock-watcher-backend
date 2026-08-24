# Stock Watcher Backend

Read-only Zerodha Kite Connect backend for the NSE Pulse Expo application. It keeps
broker credentials off the phone, resolves the supplied watchlist, streams live
quotes, constructs five-minute candles, calculates signals and sends Expo pushes.

## Local setup

Requires Node.js 22.13 or newer.

```bash
cp .env.example .env
npm install
npm run dev
```

Add `KITE_API_KEY` and `KITE_API_SECRET` to `.env`, then visit
`http://localhost:4000/auth/zerodha` to establish the daily Kite session.

## Railway

Deploy this repository directly. Railway detects the root `Dockerfile`.

- Health check: `/health`
- Persistent volume mount: `/app/server/.data`
- Public port: Railway injects `PORT`; do not set it manually
- Kite redirect: `https://YOUR_DOMAIN/auth/zerodha/callback`

Configure variables from `.env.example` in Railway rather than uploading `.env`.

## API

- `GET /health`
- `GET /auth/zerodha`
- `GET /auth/zerodha/callback`
- `GET /v1/status`
- `GET /v1/quotes`
- `GET /v1/candles?symbol=NSE:RELIANCE&interval=5m&limit=100`
- `GET /v1/analysis?symbol=NSE:RELIANCE`
- `POST /v1/devices`

This service does not place orders.
