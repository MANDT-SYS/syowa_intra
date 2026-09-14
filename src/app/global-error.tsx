'use client' // Error boundaries must be Client Components
 
export default function GlobalError({
  unstable_retry,
}: {
  unstable_retry: () => void//例外が発生したページの再レンダリングを行う関数
}) {
  return (
    // global-error must include html and body tags
    <html>
      <body>
        <h2>エラーが発生しました。</h2>
        <p>時間をおいて再度お試しください。</p>
        <button onClick={() => unstable_retry()}>再試行</button>
      </body>
    </html>
  )
}
