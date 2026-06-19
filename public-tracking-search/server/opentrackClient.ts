import type {
  ContainerStatusResponse,
  MasterBillStatusResponse,
  SearchNotFoundResponse,
  SearchSuccessResponse,
  TrackedContainer,
} from './types';
import { getDemoSearchResult } from './demoFixtures';
import { looksLikeContainerId, normalizeSearchQuery } from './parseSearchQuery';

const DEFAULT_API_BASE_URL = 'https://api.opentrack.co';

type OpenTrackClientConfig = {
  apiKey?: string;
  apiBaseUrl?: string;
  supportContactMessage?: string;
  demoMode?: boolean;
};

function getApiBaseUrl(config: OpenTrackClientConfig): string {
  return config.apiBaseUrl?.replace(/\/$/, '') ?? DEFAULT_API_BASE_URL;
}

async function readErrorMessage(response: Response): Promise<string> {
  try {
    const body = (await response.json()) as { message?: string };
    if (body.message) {
      return body.message;
    }
  } catch {
    // Fall through to generic message.
  }

  return `OpenTrack API request failed (${response.status})`;
}

function toTrackedContainer(container: ContainerStatusResponse): TrackedContainer | null {
  if (!container.trackingPage) {
    return null;
  }

  return {
    containerId: container.containerId,
    trackingPage: container.trackingPage,
    status: container.status ?? null,
  };
}

async function fetchContainer(
  config: OpenTrackClientConfig,
  containerId: string,
): Promise<TrackedContainer | null> {
  if (!config.apiKey) {
    throw new Error('Missing OPENTRACK_API_KEY. Copy .env.example to .env and add your API key.');
  }

  const response = await fetch(
    `${getApiBaseUrl(config)}/v1/containers/${encodeURIComponent(containerId)}`,
    {
      headers: {
        'Opentrack-API-Key': config.apiKey,
        Accept: 'application/json',
      },
    },
  );

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error(await readErrorMessage(response));
  }

  const data = (await response.json()) as ContainerStatusResponse;
  return toTrackedContainer(data);
}

async function fetchMasterBillContainers(
  config: OpenTrackClientConfig,
  masterBillNumber: string,
): Promise<{ masterBillNumber: string; containers: TrackedContainer[] } | null> {
  if (!config.apiKey) {
    throw new Error('Missing OPENTRACK_API_KEY. Copy .env.example to .env and add your API key.');
  }

  const response = await fetch(
    `${getApiBaseUrl(config)}/v1/master-bills/${encodeURIComponent(masterBillNumber)}`,
    {
      headers: {
        'Opentrack-API-Key': config.apiKey,
        Accept: 'application/json',
      },
    },
  );

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error(await readErrorMessage(response));
  }

  const data = (await response.json()) as MasterBillStatusResponse;
  const containers = (data.containers ?? [])
    .map(toTrackedContainer)
    .filter((container): container is TrackedContainer => container !== null);

  if (!containers.length) {
    return null;
  }

  return {
    masterBillNumber: data.number ?? masterBillNumber,
    containers,
  };
}

export async function searchTracking(
  config: OpenTrackClientConfig,
  rawQuery: string,
): Promise<SearchSuccessResponse | SearchNotFoundResponse> {
  const query = normalizeSearchQuery(rawQuery);

  if (config.demoMode) {
    const demoResult = getDemoSearchResult(query);
    if (demoResult) {
      return demoResult;
    }
  }

  if (!query) {
    return {
      found: false,
      message:
        config.supportContactMessage ??
        'Enter a container number or master bill of lading to look up tracking.',
    };
  }

  const tryContainerFirst = looksLikeContainerId(query);

  if (tryContainerFirst) {
    const container = await fetchContainer(config, query);
    if (container) {
      return {
        kind: 'container',
        query,
        containers: [container],
      };
    }

    const masterBill = await fetchMasterBillContainers(config, query);
    if (masterBill) {
      return {
        kind: 'masterBill',
        query,
        masterBillNumber: masterBill.masterBillNumber,
        containers: masterBill.containers,
      };
    }
  } else {
    const masterBill = await fetchMasterBillContainers(config, query);
    if (masterBill) {
      return {
        kind: 'masterBill',
        query,
        masterBillNumber: masterBill.masterBillNumber,
        containers: masterBill.containers,
      };
    }

    const container = await fetchContainer(config, query);
    if (container) {
      return {
        kind: 'container',
        query,
        containers: [container],
      };
    }
  }

  return {
    found: false,
    message:
      config.supportContactMessage ??
      'We could not find tracking for that shipment. Contact your OpenTrack representative to start tracking.',
  };
}

export function loadClientConfigFromEnv(): OpenTrackClientConfig {
  const apiKey = process.env.OPENTRACK_API_KEY;
  const demoMode = process.env.DEMO_MODE === 'true';

  if (!apiKey && !demoMode) {
    throw new Error(
      'Missing OPENTRACK_API_KEY. Copy .env.example to .env and add your API key, or set DEMO_MODE=true.',
    );
  }

  return {
    apiKey,
    apiBaseUrl: process.env.OPENTRACK_API_URL,
    supportContactMessage: process.env.SUPPORT_CONTACT_MESSAGE,
    demoMode,
  };
}
