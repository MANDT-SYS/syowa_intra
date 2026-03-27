'use client' // Error boundaries must be Client Components
 
export default function GlobalError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string }
  unstable_retry: () => void//例外が発生したページの再レンダリングを行う関数
}) {
  return (
    // global-error must include html and body tags
    <html>
      <body>
        <h2>GlobalError!</h2>
        <p>{error.message}</p>
        <button onClick={() => unstable_retry()}>Try again</button>
      </body>
    </html>
  )
}