import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { handleTrackSearchRequest } from './trackSearchHandler';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.resolve(__dirname, '../dist');
const port = Number(process.env.PORT ?? 4173);

const app = express();

app.get('/api/track', (req, res) => {
  void handleTrackSearchRequest(req, res);
});

app.use(express.static(distDir));

app.get('*', (_req, res) => {
  res.sendFile(path.join(distDir, 'index.html'));
});

app.listen(port, () => {
  console.log(`OpenTrack sample app running at http://localhost:${port}`);
});
