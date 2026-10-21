/**
 * Renders an inline script that executes while the browser parses the HTML.
 *
 * React warns in development when a `<script>` is produced by a component, so
 * the type is switched to `text/plain` on the client. The script has already
 * run by then — it only needs to exist in the server-rendered markup.
 */
export function InlineScript({ html }: { html: string }) {
  return (
    <script
      type={typeof window === "undefined" ? "text/javascript" : "text/plain"}
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
