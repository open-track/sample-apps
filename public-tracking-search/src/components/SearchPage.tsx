import { FormEvent, useState } from 'react';

import { searchTracking, type SearchResult } from '../api/searchTracking';
import { TrackingLinkButton } from './TrackingLinkButton';

const OPENTRACK_DOCS_URL = 'https://developers.opentrack.co/docs/getting-started';
const DEMO_SEARCH_QUERY = 'MAEU589677982';

export function SearchPage() {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<SearchResult>({ status: 'idle' });

  async function runSearch(searchQuery: string) {
    const trimmedQuery = searchQuery.trim();
    if (!trimmedQuery) {
      return;
    }

    setQuery(trimmedQuery);
    setResult({ status: 'loading' });

    const nextResult = await searchTracking(trimmedQuery);
    setResult(nextResult);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await runSearch(query);
  }

  async function handleDemoSearchClick() {
    await runSearch(DEMO_SEARCH_QUERY);
  }

  return (
    <main className="page">
      <section className="hero">
        <div className="hero__brand">
          <img alt="OpenTrack" className="hero__logo" src="/opentrack-logo.png" />
          <p className="hero__badge">Sample app</p>
        </div>
        <h1>Find a container or master bill/booking</h1>
        <p className="lede">
          Search by container, MBL, or ocean carrier booking reference. When OpenTrack is already tracking the
          shipment, we fetch the public TrackIt URL from the API and link your user straight to the live tracking
          page.
        </p>
      </section>

      <section className="search-panel">
        <form className="search-form" onSubmit={handleSubmit}>
          <label className="search-form__label" htmlFor="tracking-search">
            Container or MBL
          </label>
          <div className="search-form__row">
            <input
              autoComplete="off"
              className="search-form__input"
              id="tracking-search"
              name="q"
              placeholder="e.g. MSCU1234567 or MAEU589677982"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
            <button className="search-form__button" disabled={result.status === 'loading'} type="submit">
              {result.status === 'loading' ? 'Searching…' : 'Search'}
            </button>
          </div>
          {!query.trim() ? (
            <p className="search-form__demo-hint">
              Want to see what search looks like? Set <code>DEMO_MODE=true</code> in <code>.env</code>, then try
              searching{' '}
              <button
                className="search-form__demo-link"
                disabled={result.status === 'loading'}
                type="button"
                onClick={handleDemoSearchClick}
              >
                {DEMO_SEARCH_QUERY}
              </button>
              .
            </p>
          ) : null}
        </form>

        <SearchResultPanel result={result} />
      </section>

      <section className="footnote">
        <p>
          This demo calls <code>GET /v1/containers/:containerId</code> and{' '}
          <code>GET /v1/master-bills/:masterBillNumber</code> on the{' '}
          <a href={OPENTRACK_DOCS_URL} rel="noreferrer" target="_blank">
            OpenTrack API
          </a>
          . Your API key stays on the server, not in the browser.
        </p>
      </section>
    </main>
  );
}

type SearchResultPanelProps = {
  result: SearchResult;
};

function SearchResultPanel({ result }: SearchResultPanelProps) {
  if (result.status === 'idle') {
    return null;
  }

  if (result.status === 'loading') {
    return <p className="result-message result-message--loading">Looking up tracking in OpenTrack…</p>;
  }

  if (result.status === 'error') {
    return <p className="result-message result-message--error">{result.message}</p>;
  }

  if (result.status === 'notFound') {
    return <p className="result-message result-message--empty">{result.data.message}</p>;
  }

  const { data } = result;
  const isMasterBill = data.kind === 'masterBill';

  return (
    <div className="result-panel">
      <p className="result-panel__summary">
        {isMasterBill ? (
          <>
            Found <strong>{data.containers.length}</strong> tracked containers on MBL{' '}
            <strong>{data.masterBillNumber ?? data.query}</strong>.
          </>
        ) : (
          <>
            Found tracking for container <strong>{data.containers[0]?.containerId}</strong>.
          </>
        )}
      </p>

      <div className="result-panel__links">
        {data.containers.map((container) => (
          <TrackingLinkButton key={container.containerId} container={container} />
        ))}
      </div>
    </div>
  );
}
