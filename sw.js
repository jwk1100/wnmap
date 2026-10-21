/* 세계 소설 지도 — 서비스 워커
   VERSION은 build-pwa.ps1이 파일 내용으로 계산해 넣는다. 파일이 하나라도 바뀌면 VERSION이 바뀌고,
   브라우저가 새 워커를 받아 앱 전체를 한 번에 새 판으로 바꾼다(데이터 파일끼리 판이 섞이지 않게). */
const VERSION = "f3b0987f7c29";
const APP = "wfa-app-" + VERSION;
const FONTS = "wfa-fonts";
const BLOBS = "wfa-blobs"; // 탐험 노트 사진(pwa.js가 넣는다). 판이 바뀌어도 지우지 않는다
const FILES = [
  "./",
  "index.html",
  "manifest.webmanifest",
  "pwa.js",
  "journal.js",
  "world.js",
  "lib/d3.min.js",
  "lib/topojson-client.min.js",
  "lib/topojson-simplify.min.js",
  "icons/apple-touch-icon.png",
  "icons/favicon-32.png",
  "icons/icon-192.png",
  "icons/icon-512.png",
  "icons/icon-maskable-512.png",
  "data-ar.js",
  "data-arab.js",
  "data-at.js",
  "data-au.js",
  "data-balkans.js",
  "data-baltic.js",
  "data-be.js",
  "data-bg.js",
  "data-bo.js",
  "data-br.js",
  "data-by.js",
  "data-bz.js",
  "data-ca.js",
  "data-caribbean.js",
  "data-caucasus.js",
  "data-centralasia.js",
  "data-ch.js",
  "data-cl.js",
  "data-cn.js",
  "data-co.js",
  "data-cr.js",
  "data-cu.js",
  "data-cz.js",
  "data-de.js",
  "data-dk.js",
  "data-dz.js",
  "data-ec.js",
  "data-eg.js",
  "data-es.js",
  "data-fi.js",
  "data-fr.js",
  "data-gb.js",
  "data-gr.js",
  "data-gt.js",
  "data-hn.js",
  "data-hu.js",
  "data-ie.js",
  "data-il.js",
  "data-in.js",
  "data-ir.js",
  "data-is.js",
  "data-it.js",
  "data-jp.js",
  "data-ke.js",
  "data-kr.js",
  "data-mx.js",
  "data-ng.js",
  "data-ni.js",
  "data-nl.js",
  "data-no.js",
  "data-nz.js",
  "data-pa.js",
  "data-pacific.js",
  "data-pe.js",
  "data-pl.js",
  "data-pt.js",
  "data-py.js",
  "data-ro.js",
  "data-ru.js",
  "data-se.js",
  "data-seasia.js",
  "data-smalleu.js",
  "data-sn.js",
  "data-southasia.js",
  "data-sv.js",
  "data-tr.js",
  "data-tz.js",
  "data-ua.js",
  "data-us.js",
  "data-uy.js",
  "data-ve.js",
  "data-za.js"
];

self.addEventListener("install", (e) => {
  e.waitUntil((async () => {
    const c = await caches.open(APP);
    await c.addAll(FILES.map((f) => new Request(f, { cache: "reload" })));
    await self.skipWaiting();
  })());
});

self.addEventListener("activate", (e) => {
  e.waitUntil((async () => {
    const keep = new Set([APP, FONTS, BLOBS]);
    for (const k of await caches.keys()) if (k.startsWith("wfa-") && !keep.has(k)) await caches.delete(k);
    await self.clients.claim();
  })());
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);

  // 탐험 노트 사진: /_blob/<32자리 id>
  const m = url.origin === location.origin && url.pathname.match(/\/_blob\/([0-9a-f]{32})$/i);
  if (m) {
    e.respondWith((async () => {
      const c = await caches.open(BLOBS);
      const hit = await c.match(new URL("/_blob/" + m[1].toLowerCase(), location.origin).href);
      return hit || new Response("", { status: 404 });
    })());
    return;
  }

  // 글꼴(Google Fonts): 저장해 둔 것을 먼저 쓰고 뒤에서 새로 받아 둔다
  if (url.hostname === "fonts.googleapis.com" || url.hostname === "fonts.gstatic.com") {
    e.respondWith((async () => {
      const c = await caches.open(FONTS);
      const hit = await c.match(req);
      const net = fetch(req).then((r) => { if (r.ok || r.type === "opaque") c.put(req, r.clone()); return r; }).catch(() => null);
      if (hit) { e.waitUntil(net); return hit; }
      return (await net) || new Response("", { status: 504 });
    })());
    return;
  }

  if (url.origin !== location.origin) return;

  // 앱 파일: 이 판에 저장해 둔 것 → 없으면 인터넷. 페이지 이동은 언제나 index.html로
  e.respondWith((async () => {
    const c = await caches.open(APP);
    if (req.mode === "navigate") {
      return (await c.match("index.html")) || fetch(req);
    }
    const hit = await c.match(req, { ignoreSearch: true });
    if (hit) return hit;
    try { return await fetch(req); }
    catch (err) { return new Response("", { status: 504 }); }
  })());
});
