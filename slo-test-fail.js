// Лаб 3 — Алхам 6: threshold-ыг ЗОРИУД эвдсэн хувилбар (/report p95 < 100 ms → FAIL).
// Босго бүр README-ийн SLO хүснэгттэй ИЖИЛ (калибровк: results/calibration.txt).
// Энгийн ажиллуулалт 1 мин; chaos туршилтад: k6 run -e DURATION=2m slo-test.js
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  vus: 20,
  duration: __ENV.DURATION || '1m',
  thresholds: {
    'http_req_duration{name:cart}': ['p(95)<10'],    // Performance SLO: /cart/add p95 < 10 ms
    'http_req_failed{name:pay}': ['rate<0.08'],      // Reliability SLO: /pay error rate < 8%
    'checks': ['rate>0.90'],                         // Availability SLO: амжилттай хүсэлт > 90%
    'http_req_duration{name:report}': ['p(95)<100'], // ЗОРИУД FAIL: /report хэзээ ч 200 ms-ээс хурдан хариулдаггүй
  },
};

export default function () {
  const base = 'http://localhost:3000';
  // name tag-аар endpoint бүрийг ялгаж, threshold-ыг tag тус бүрд тавина.
  const c = http.post(`${base}/cart/add`, null, { tags: { name: 'cart' } });
  const r = http.get(`${base}/report`, { tags: { name: 'report' } });
  const p = http.post(`${base}/pay`, null, { tags: { name: 'pay' } });
  check(c, { 'cart 200': (x) => x.status === 200 });
  check(r, { 'report 200': (x) => x.status === 200 });
  check(p, { 'pay 200': (x) => x.status === 200 });
  sleep(1);
}
