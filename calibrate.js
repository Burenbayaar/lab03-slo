// Лаб 3 — калибровк: SLO-гийн босго сонгохын ӨМНӨ endpoint тус бүрийн бодит тоог хэмжих.
// Threshold байхгүй — зөвхөн хэмжилт. Ачаалал slo-test.js-тэй ижил: 20 VU, 1 мин.
import http from 'k6/http';
import { check, sleep } from 'k6';
import { Trend, Rate } from 'k6/metrics';

const cartMs = new Trend('cart_duration', true);
const reportMs = new Trend('report_duration', true);
const payFailed = new Rate('pay_failed');

export const options = { vus: 20, duration: '1m' };

export default function () {
  const base = 'http://localhost:3000';
  const c = http.post(`${base}/cart/add`, null, { tags: { name: 'cart' } });
  const r = http.get(`${base}/report`, { tags: { name: 'report' } });
  const p = http.post(`${base}/pay`, null, { tags: { name: 'pay' } });
  cartMs.add(c.timings.duration);
  reportMs.add(r.timings.duration);
  payFailed.add(p.status !== 200);
  check(c, { 'cart 200': (x) => x.status === 200 });
  check(r, { 'report 200': (x) => x.status === 200 });
  check(p, { 'pay 200': (x) => x.status === 200 });
  sleep(1);
}
