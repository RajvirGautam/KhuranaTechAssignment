export const ApplicationCardSkeleton = () => (
  <div className="bg-slate-700 rounded-lg p-4 animate-pulse">
    <div className="h-6 bg-slate-600 rounded w-3/4 mb-3"></div>
    <div className="h-4 bg-slate-600 rounded w-1/2 mb-2"></div>
    <div className="h-4 bg-slate-600 rounded w-2/3"></div>
  </div>
);

export const BoardColumnSkeleton = () => (
  <div className="bg-slate-700 rounded-lg p-4 animate-pulse">
    <div className="h-6 bg-slate-600 rounded w-1/2 mb-4"></div>
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <ApplicationCardSkeleton key={i} />
      ))}
    </div>
  </div>
);

export const DashboardCardSkeleton = () => (
  <div className="bg-slate-700 rounded-lg p-6 animate-pulse">
    <div className="h-4 bg-slate-600 rounded w-1/3 mb-4"></div>
    <div className="h-10 bg-slate-600 rounded w-2/3"></div>
  </div>
);

export const ChartSkeleton = () => (
  <div className="bg-slate-700 rounded-lg p-6 animate-pulse">
    <div className="h-4 bg-slate-600 rounded w-1/4 mb-4"></div>
    <div className="flex items-center justify-center h-64 bg-slate-600 rounded"></div>
  </div>
);

export const LoadingSpinner = ({ size = "md" }: { size?: "sm" | "md" | "lg" }) => {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-8 h-8",
    lg: "w-12 h-12",
  };

  return (
    <div className="flex justify-center items-center">
      <div className={`${sizeClasses[size]} border-2 border-blue-500/20 border-t-blue-500 rounded-full animate-spin`}></div>
    </div>
  );
};
