"use client";
// Error boundaries must be client components. In production Next hides the server's message, so the
// likely causes are listed here instead; the full message is in the server log.

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <section className="board" aria-labelledby="error-heading">
      <p className="kicker">Something went wrong</p>
      <h1 id="error-heading" className="mb-3 font-display text-3xl font-bold">
        The team API didn&apos;t answer
      </h1>
      <p className="max-w-[60ch]">Usually one of these:</p>
      <ul className="mb-4 list-disc pl-5">
        <li>CREW_API_BASE points somewhere the API isn&apos;t running.</li>
        <li>The API wants a token: set CREW_ADMIN_TOKEN (it stays on the server).</li>
        <li>The API is up but returned an error. The server log has the detail.</li>
      </ul>
      {process.env.NODE_ENV !== "production" ? <p className="text-sm text-pearl-soft">{error.message}</p> : null}
      {error.digest ? <p className="text-sm text-pearl-soft">Reference: {error.digest}</p> : null}
      <button type="button" className="btn" onClick={reset}>
        Try again
      </button>
    </section>
  );
}
