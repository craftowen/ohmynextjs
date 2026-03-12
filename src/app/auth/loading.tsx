export default function AuthLoading() {
  return (
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center px-4 py-12">
      <div className="mx-auto w-full max-w-md px-4 sm:px-0">
        <div className="rounded-lg border border-border bg-card p-6 sm:p-8 shadow-sm space-y-4">
          <div className="h-6 w-32 animate-pulse rounded bg-muted" />
          <div className="h-10 w-full animate-pulse rounded bg-muted" />
          <div className="h-10 w-full animate-pulse rounded bg-muted" />
          <div className="h-10 w-full animate-pulse rounded bg-muted" />
        </div>
      </div>
    </div>
  );
}
