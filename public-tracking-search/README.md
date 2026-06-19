# Public tracking search (OpenTrack sample app)

A minimal TypeScript + React app you can clone, run locally, and remix. It shows a common customer pattern:

1. A user lands on a page with a search box
2. They enter a **container number**, **master bill of lading (MBL)**, or **ocean carrier booking reference**
3. The app calls the [OpenTrack API](https://developers.opentrack.co/docs/getting-started) and reads the `trackingPage` URL from the response
4. For a single container, the user gets one button that opens the live tracking page
5. For an MBL with multiple containers, the user gets one button per container
6. If nothing is tracked yet, the user sees a friendly message to contact their representative

## Why there is a small server

Your OpenTrack API key must **not** ship to the browser. This sample keeps the key in environment variables and exposes a tiny `/api/track` endpoint that proxies lookups to OpenTrack.

In production you can keep the included Express server, or move the same logic to your existing backend, a serverless function, or an edge route.

## Quick start

```bash
cd public-tracking-search
cp .env.example .env
# Edit .env and set OPENTRACK_API_KEY (or DEMO_MODE=true to try without a key)

npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

### Production build

```bash
npm run build
npm run start
```

The production server serves the built React app and the `/api/track` endpoint on port `4173` by default.

## Environment variables

| Variable | Required | Description |
| --- | --- | --- |
| `OPENTRACK_API_KEY` | Yes* | API key from the OpenTrack dashboard |
| `DEMO_MODE` | No | Set to `true` to use canned demo responses without an API key |
| `OPENTRACK_API_URL` | No | Defaults to `https://api.opentrack.co` |
| `SUPPORT_CONTACT_MESSAGE` | No | Message shown when no tracked shipment is found |
| `PORT` | No | Production server port (default `4173`) |

\*Not required when `DEMO_MODE=true`.

## OpenTrack API calls used

The sample uses the public v1 read endpoints documented in the [OpenTrack API getting started guide](https://developers.opentrack.co/docs/getting-started):

| User input | HTTP call | Response field used |
| --- | --- | --- |
| Container number | `GET /v1/containers/{containerId}` | `trackingPage` |
| MBL / booking | `GET /v1/master-bills/{masterBillNumber}` | each item in `containers[].trackingPage` |

Both requests send the API key in the `Opentrack-API-Key` header.

The search logic lives in [`server/opentrackClient.ts`](./server/opentrackClient.ts):

- Normalizes input (trim, uppercase, remove spaces)
- If the query looks like a container ID (`AAAA1234567`), it tries the container endpoint first, then the MBL endpoint
- Otherwise it tries MBL first, then container
- Returns `404` to the UI when neither endpoint finds a tracked shipment

## Project layout

```text
public-tracking-search/
├── src/                     React UI
│   ├── api/searchTracking.ts
│   └── components/
├── server/                  API proxy + OpenTrack client
│   ├── opentrackClient.ts
│   └── trackSearchHandler.ts
├── vite.config.ts           Dev server + /api/track middleware
└── server/index.ts          Production Express server
```

## Customization ideas

- Replace the placeholder not-found copy via `SUPPORT_CONTACT_MESSAGE`
- Add your logo and brand colors in `src/styles/app.css`
- Gate the page behind your own auth before calling `/api/track`
- Persist recent searches in local storage
- Extend the UI with ETA, status badges, or webhook-driven live updates

## Demo mode

Set `DEMO_MODE=true` in `.env` to explore the UI without an API key:

| Query | Result |
| --- | --- |
| `MSCU1234567` | Single container tracking link |
| `MAEU589677982` | MBL with three container links |
| `NOTFOUND` | Representative contact message |

## Related docs

- [OpenTrack API getting started](https://developers.opentrack.co/docs/getting-started)

## License

MIT. See [LICENSE](../LICENSE).
