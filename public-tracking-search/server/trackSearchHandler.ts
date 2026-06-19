import type { IncomingMessage, ServerResponse } from 'node:http';
import type { Connect } from 'vite';

import { loadClientConfigFromEnv, searchTracking } from './opentrackClient';
import type { SearchErrorResponse, SearchResponse } from './types';

function sendJson(res: ServerResponse, statusCode: number, body: SearchResponse | SearchErrorResponse): void {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(body));
}

function readQueryParam(url: string | undefined, key: string): string | null {
  if (!url) {
    return null;
  }

  const value = new URL(url, 'http://localhost').searchParams.get(key);
  return value?.trim() ? value.trim() : null;
}

export function createTrackSearchMiddleware(): Connect.NextHandleFunction {
  return async (req, res, next) => {
    if (!req.url?.startsWith('/api/track')) {
      next();
      return;
    }

    if (req.method !== 'GET') {
      sendJson(res, 405, { error: 'Method not allowed' });
      return;
    }

    const query = readQueryParam(req.url, 'q');

    if (!query) {
      sendJson(res, 400, { error: 'Missing required query parameter: q' });
      return;
    }

    try {
      const result = await searchTracking(loadClientConfigFromEnv(), query);

      if ('found' in result && result.found === false) {
        sendJson(res, 404, result);
        return;
      }

      sendJson(res, 200, result);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unexpected server error';
      sendJson(res, 500, { error: message });
    }
  };
}

export async function handleTrackSearchRequest(req: IncomingMessage, res: ServerResponse): Promise<void> {
  if (req.method !== 'GET') {
    sendJson(res, 405, { error: 'Method not allowed' });
    return;
  }

  const requestUrl = req.url ?? '';
  const query = readQueryParam(requestUrl, 'q');

  if (!query) {
    sendJson(res, 400, { error: 'Missing required query parameter: q' });
    return;
  }

  try {
    const result = await searchTracking(loadClientConfigFromEnv(), query);

    if ('found' in result && result.found === false) {
      sendJson(res, 404, result);
      return;
    }

    sendJson(res, 200, result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unexpected server error';
    sendJson(res, 500, { error: message });
  }
}
