"use client";

interface ErrorBannerProps {
  message: string;
  onDismiss?: () => void;
}

export function ErrorBanner({ message, onDismiss }: ErrorBannerProps) {
  return (
    <div style={{
      display: "flex",
      alignItems: "flex-start",
      gap: "0.75rem",
      borderRadius: "0.75rem",
      border: "1px solid rgba(239,68,68,0.3)",
      background: "rgba(239,68,68,0.1)",
      padding: "0.75rem 1rem",
      fontSize: "0.875rem",
      color: "#f87171",
    }}>
      <span style={{ flex: 1, lineHeight: 1.5 }}>{message}</span>
      {onDismiss && (
        <button onClick={onDismiss} style={{ background: "none", border: "none", cursor: "pointer", color: "#ef4444", fontSize: "1rem" }}>
          ✕
        </button>
      )}
    </div>
  );
}
