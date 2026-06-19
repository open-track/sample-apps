import type { SearchNotFoundResponse, SearchSuccessResponse } from './types';
import { normalizeSearchQuery } from './parseSearchQuery';

const DEMO_TRACKING_BASE = 'https://app.opentrack.co/track/demo';

export function getDemoSearchResult(query: string): SearchSuccessResponse | SearchNotFoundResponse | null {
  const normalized = normalizeSearchQuery(query);

  if (normalized === 'MSCU1234567') {
    return {
      kind: 'container',
      query: normalized,
      containers: [
        {
          containerId: 'MSCU1234567',
          trackingPage: `${DEMO_TRACKING_BASE}/MSCU1234567`,
          status: 'AVAILABLE',
        },
      ],
    };
  }

  if (normalized === 'MAEU589677982') {
    return {
      kind: 'masterBill',
      query: normalized,
      masterBillNumber: 'MAEU589677982',
      containers: [
        {
          containerId: 'MSCU1234567',
          trackingPage: `${DEMO_TRACKING_BASE}/MSCU1234567`,
          status: 'AVAILABLE',
        },
        {
          containerId: 'TCLU9876543',
          trackingPage: `${DEMO_TRACKING_BASE}/TCLU9876543`,
          status: 'LOADED',
        },
        {
          containerId: 'OOLU2468135',
          trackingPage: `${DEMO_TRACKING_BASE}/OOLU2468135`,
          status: 'DISCHARGED',
        },
      ],
    };
  }

  if (normalized === 'NOTFOUND') {
    return {
      found: false,
      message:
        'We could not find tracking for that shipment. Contact your OpenTrack representative to start tracking.',
    };
  }

  return null;
}
