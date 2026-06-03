interface ErrorBannerProps {
  message: string;
  onDismiss?: () => void;
}

export function ErrorBanner({ message, onDismiss }: ErrorBannerProps) {
  return (
    <div className="solution-error-banner">
      <span>{message}</span>
      {onDismiss && (
        <button className="solution-error-dismiss" onClick={onDismiss}>✕</button>
      )}
    </div>
  );
}
