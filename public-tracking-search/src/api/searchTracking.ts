import type { SearchErrorResponse, SearchNotFoundResponse, SearchSuccessResponse } from '../../server/types';

export type SearchResult =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: SearchSuccessResponse }
  | { status: 'notFound'; data: SearchNotFoundResponse }
  | { status: 'error'; message: string };

export async function searchTracking(query: string): Promise<SearchResult> {
  const response = await fetch(`/api/track?q=${encodeURIComponent(query)}`, {
    headers: {
      Accept: 'application/json',
    },
  });

  const body = (await response.json()) as SearchSuccessResponse | SearchNotFoundResponse | SearchErrorResponse;

  if (response.status === 404 && 'found' in body && body.found === false) {
    return { status: 'notFound', data: body };
  }

  if (!response.ok) {
    const message = 'error' in body ? body.error : 'Something went wrong while searching.';
    return { status: 'error', message };
  }

  return { status: 'success', data: body as SearchSuccessResponse };
}
