const CONTAINER_ID_PATTERN = /^[A-Z]{4}\d{7}$/;

export function normalizeSearchQuery(raw: string): string {
  return raw.trim().toUpperCase().replace(/\s+/g, '');
}

export function looksLikeContainerId(query: string): boolean {
  return CONTAINER_ID_PATTERN.test(query);
}
