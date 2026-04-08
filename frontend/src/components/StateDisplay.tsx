interface ErrorDisplayProps {
  message: string;
  onRetry?: () => void;
  onDismiss?: () => void;
}

export const ErrorDisplay = ({ message, onRetry, onDismiss }: ErrorDisplayProps) => (
  <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 flex items-start gap-3">
    <div className="text-red-500 text-xl flex-shrink-0">⚠️</div>
    <div className="flex-1">
      <p className="text-red-200 text-sm">{message}</p>
      <div className="flex gap-2 mt-3">
        {onRetry && (
          <button
            onClick={onRetry}
            className="px-3 py-1 text-sm bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
          >
            Retry
          </button>
        )}
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="px-3 py-1 text-sm text-red-300 hover:text-red-100 transition-colors"
          >
            Dismiss
          </button>
        )}
      </div>
    </div>
  </div>
);

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export const EmptyState = ({ title, description, icon = "📭", action }: EmptyStateProps) => (
  <div className="flex flex-col items-center justify-center py-12 px-4">
    <div className="text-5xl mb-4">{icon}</div>
    <h3 className="text-lg font-semibold text-white mb-1">{title}</h3>
    {description && <p className="text-slate-400 text-sm mb-4">{description}</p>}
    {action && (
      <button
        onClick={action.onClick}
        className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
      >
        {action.label}
      </button>
    )}
  </div>
);
