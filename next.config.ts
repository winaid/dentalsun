import type { NextConfig } from 'next';

/**
 * 옛 홈페이지(dentalsun.co.kr) 주소 → 새 주소.
 * ★ 도메인을 옮기는 순간부터 옛 주소로 들어오는 링크·색인이 전부 404 가 되지 않도록 301 로 잇는다.
 *   옛 사이트는 쪽 하나에 #1 #2 조각이었으므로 조각은 새 허브로 보낸다(조각은 서버가 못 본다).
 */
const OLD_SITE: Array<[string, string]> = [
  ['/index.html', '/'],
  ['/dental-introduction.html', '/about'],
  ['/implant.html', '/treatment/implant'],
  ['/jaw-joint-treatment.html', '/treatment/tmj'],
  ['/makingteeth.html', '/treatment/aesthetic'],
  ['/dentures.html', '/treatment/insurance'],
  ['/wisdomteeth.html', '/treatment/wisdom-tooth'],
  ['/toothsaving.html', '/treatment/natural-tooth'],
  ['/anesthetic.html', '/treatment/painless'],
];
const CONVENTIONAL: Array<[string, string]> = [
  ['/service', '/treatment'],
  ['/services', '/treatment'],
  ['/clinic', '/about'],
  ['/location', '/visit'],
  ['/contact', '/visit'],
  ['/doctors', '/about/doctors'],
  ['/implant', '/treatment/implant'],
  ['/tmj', '/treatment/tmj'],
];

const SECURITY_HEADERS = [
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), payment=(), usb=()' },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  devIndicators: false,
  outputFileTracingRoot: __dirname,
  images: { formats: ['image/avif', 'image/webp'] },
  async redirects() {
    return [
      ...OLD_SITE.map(([source, destination]) => ({ source, destination, permanent: true })),
      ...CONVENTIONAL.map(([source, destination]) => ({ source, destination, permanent: true })),
    ];
  },
  async headers() {
    return [
      { source: '/:path*', headers: SECURITY_HEADERS },
      { source: '/llms.txt', headers: [{ key: 'Content-Type', value: 'text/plain; charset=utf-8' }] },
    ];
  },
};

export default nextConfig;
