"use client";
export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return <div role="alert" className="py-16 text-center"><h1 className="text-2xl font-semibold">Something went wrong</h1><p className="mt-1 text-sm text-muted">{error.message}</p><button onClick={reset} className="mt-3 rounded-lg bg-brand px-3.5 py-2 text-sm text-white">Try again</button></div>;
}
