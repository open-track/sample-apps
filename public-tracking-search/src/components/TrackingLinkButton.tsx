import type { TrackedContainer } from '../../server/types';

type TrackingLinkButtonProps = {
  container: TrackedContainer;
};

export function TrackingLinkButton({ container }: TrackingLinkButtonProps) {
  return (
    <a className="tracking-link-button" href={container.trackingPage} rel="noreferrer" target="_blank">
      <span className="tracking-link-button__label">View {container.containerId}</span>
      {container.status ? <span className="tracking-link-button__status">{container.status}</span> : null}
    </a>
  );
}
