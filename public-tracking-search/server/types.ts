export type TrackedContainer = {
  containerId: string;
  trackingPage: string;
  status: string | null;
};

export type ContainerStatusResponse = {
  containerId: string;
  trackingPage: string;
  status?: string | null;
};

export type MasterBillStatusResponse = {
  number: string;
  status: string;
  containers: ContainerStatusResponse[];
};

export type SearchSuccessResponse = {
  kind: 'container' | 'masterBill';
  query: string;
  masterBillNumber?: string;
  containers: TrackedContainer[];
};

export type SearchNotFoundResponse = {
  found: false;
  message: string;
};

export type SearchErrorResponse = {
  error: string;
};

export type SearchResponse = SearchSuccessResponse | SearchNotFoundResponse;
