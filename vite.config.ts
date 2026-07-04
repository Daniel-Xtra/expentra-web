import { defineConfig, loadEnv, type Plugin } from "vite"
import react from "@vitejs/plugin-react"
import path from "path"

function contentSecurityPolicyPlugin(mode: string, apiUrl: string): Plugin {
  return {
    name: "content-security-policy",
    transformIndexHtml(html) {
      if (mode !== "production") {
        return html
      }

      const connectSrc = apiUrl.startsWith("http")
        ? `'self' ${new URL(apiUrl).origin}`
        : "'self'"

      const csp = [
        "default-src 'self'",
        "script-src 'self'",
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
        "font-src 'self' https://fonts.gstatic.com data:",
        "img-src 'self' data: blob:",
        `connect-src ${connectSrc}`,
        "frame-src 'self' blob:",
        "frame-ancestors 'none'",
        "object-src 'none'",
        "base-uri 'self'",
        "form-action 'self'",
      ].join("; ")

      return html.replace(
        "<head>",
        `<head>\n    <meta http-equiv="Content-Security-Policy" content="${csp}" />`,
      )
    },
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "")
  const apiUrl = env.VITE_API_URL ?? "/api/v1"
  const proxyTarget =
    env.VITE_API_PROXY_TARGET ??
    (apiUrl.startsWith("http://") || apiUrl.startsWith("https://")
      ? new URL(apiUrl).origin
      : undefined)

  return {
    plugins: [react(), contentSecurityPolicyPlugin(mode, apiUrl)],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    server: proxyTarget
      ? {
          proxy: {
            "/api": {
              target: proxyTarget,
              changeOrigin: true,
            },
          },
        }
      : undefined,
  }
})
