import type { MetadataRoute } from 'next';
import { CLINIC } from '@/lib/clinic';

/**
 * robots.txt — AI 크롤러를 명시적으로 허용한다. 이게 이 사이트의 목적이다.
 * ⚠️ AI 크롤러 차단을 추가하지 말 것 — 차단하는 순간 AEO 노력 전체가 무의미해진다.
 */
export default function robots(): MetadataRoute.Robots {
  const ai = [
    'GPTBot', 'OAI-SearchBot', 'ChatGPT-User', 'ClaudeBot', 'anthropic-ai', 'Claude-Web', 'PerplexityBot', 'Perplexity-User',
    'Google-Extended', 'Applebot-Extended', 'CCBot', 'cohere-ai', 'Amazonbot', 'Bytespider', 'DeepSeek', 'MistralAI-User', 'Grok', 'Qwen', 'PhindBot', 'YouBot', 'BraveBot',
    'Googlebot', 'bingbot', 'Yeti', 'Daumoa',
  ];
  return {
    rules: [
      /* ⚠️ 관리자 화면과 API 는 검색에 안 실린다 — app/admin/layout.tsx 의 noindex 와 한 쌍. */
      { userAgent: '*', allow: '/', disallow: ['/admin', '/api/'] },
      ...ai.map((userAgent) => ({ userAgent, allow: '/' })),
      ...['AhrefsBot', 'SemrushBot', 'MJ12bot', 'DotBot', 'DataForSeoBot', 'BLEXBot'].map((userAgent) => ({ userAgent, disallow: '/' })),
    ],
    sitemap: `${CLINIC.url}/sitemap.xml`,
    host: CLINIC.url,
  };
}
