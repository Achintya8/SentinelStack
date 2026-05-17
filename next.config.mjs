// SECURITY FIX: hardened response headers (clickjacking, MIME sniffing, referrer
// leakage, capability scoping, CSP) applied to every route.
// CSP is intentionally permissive enough to keep existing features working:
//   - Google reCAPTCHA v3 (www.google.com, www.gstatic.com, www.recaptcha.net)
//   - Cloudflare Turnstile (challenges.cloudflare.com)
//   - react-globe.gl texture CDN (unpkg.com)
//   - Next.js inline scripts/styles need 'unsafe-inline'
//   - three.js WebGL workers may use blob: URIs
// `unsafe-eval` is included because react-three-fiber / three.js use it; remove
// once those deps stop relying on it.

const ContentSecurityPolicy = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.google.com https://www.gstatic.com https://www.recaptcha.net https://challenges.cloudflare.com",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data: https://fonts.gstatic.com",
  "connect-src 'self' https://www.google.com https://www.recaptcha.net https://api.resend.com https://generativelanguage.googleapis.com",
  "frame-src https://www.google.com https://challenges.cloudflare.com",
  "worker-src 'self' blob:",
  "media-src 'self' data: blob:",
  "manifest-src 'self'"
].join("; ");

const securityHeaders = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), interest-cohort=(), payment=(), usb=()"
  },
  { key: "X-DNS-Prefetch-Control", value: "on" },
  { key: "Content-Security-Policy", value: ContentSecurityPolicy }
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders
      }
    ];
  }
};

export default nextConfig;
