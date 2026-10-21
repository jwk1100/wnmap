/* 세계 소설 지도 — 웹앱(PWA) 전용 스크립트
   1) 서비스 워커를 등록해 한 번 연 뒤에는 인터넷 없이도 열리게 한다
   2) 탐험 노트 사진을 이 기기 안(Cache Storage "wfa-blobs")에 저장한다 → journal.js가 window.WFA_ASSETS로 쓴다
      저장한 사진은 /_blob/<id> 주소로 보이며, 서비스 워커가 이 저장소에서 꺼내 준다
   3) 설치할 수 있는 브라우저에서는 오른쪽 아래에 "앱으로 설치" 단추를 띄운다 */
(function () {
  "use strict";
  const BLOBS = "wfa-blobs";
  const TYPES = /^image\/(png|jpeg|gif|webp)$/;
  const MAX = 20 * 1024 * 1024;

  const blobKey = (id) => new URL("/_blob/" + id, location.origin).href;
  const newId = () => [...crypto.getRandomValues(new Uint8Array(16))].map((b) => b.toString(16).padStart(2, "0")).join("");
  const fail = (code) => { const e = new Error(code); e.code = code; return e; };

  if ("caches" in window && window.isSecureContext) {
    window.WFA_ASSETS = {
      async upload(blob) {
        if (!blob || !TYPES.test(blob.type || "")) throw fail("unsupported_type");
        if (blob.size > MAX) throw fail("too_large");
        const id = newId();
        const c = await caches.open(BLOBS);
        await c.put(blobKey(id), new Response(blob, { headers: { "Content-Type": blob.type, "Cache-Control": "no-store" } }));
        return { id };
      },
      async delete(id) {
        if (!/^[0-9a-f]{32}$/i.test(String(id))) return;
        const c = await caches.open(BLOBS);
        await c.delete(blobKey(id));
      }
    };
    // 브라우저가 공간이 모자랄 때 기록·사진을 함부로 지우지 않도록 요청(허락 여부는 브라우저가 정한다)
    if (navigator.storage && navigator.storage.persist) navigator.storage.persisted().then((p) => p || navigator.storage.persist()).catch(() => {});
  }

  const toast = (t) => { const a = window.ATLAS && window.ATLAS.app; if (a && a.toast) a.toast(t); };

  if ("serviceWorker" in navigator && window.isSecureContext) {
    const hadController = !!navigator.serviceWorker.controller;
    navigator.serviceWorker.register("sw.js").then((reg) => {
      // 사진이 처음부터 보이도록, 새로 설치된 워커가 이 페이지를 맡으면 알린다
      reg.addEventListener("updatefound", () => {
        const w = reg.installing;
        if (w) w.addEventListener("statechange", () => {
          if (w.state === "activated" && !hadController) toast("이제 인터넷 없이도 열 수 있어요.");
        });
      });
    }).catch(() => { /* file:// 등 등록할 수 없는 곳에서는 그냥 웹페이지로 동작 */ });
    navigator.serviceWorker.addEventListener("controllerchange", () => {
      if (hadController) toast("새 버전을 받았어요. 앱을 다시 열면 적용돼요.");
    });
  }

  // 설치 단추(크롬·엣지·안드로이드). iOS 사파리는 공유 → "홈 화면에 추가"로 설치한다
  let deferred = null;
  const standalone = () => matchMedia("(display-mode: standalone)").matches || navigator.standalone === true;
  function installButton() {
    let b = document.getElementById("pwaInstall");
    if (b) return b;
    const css = document.createElement("style");
    css.textContent = "#pwaInstall{position:fixed;left:max(14px,env(safe-area-inset-left));bottom:max(14px,env(safe-area-inset-bottom));z-index:9000;display:flex;align-items:center;gap:6px;padding:9px 14px 9px 10px;border:2px solid #3b2a24;border-radius:999px;background:#fffaf0;color:#3b2a24;font:600 14px 'Gowun Dodum',system-ui,sans-serif;box-shadow:3px 3px 0 #3b2a24;cursor:pointer}#pwaInstall img{width:24px;height:24px}#pwaInstall:hover{background:#ffe9c7}#pwaInstall .x{margin-left:4px;padding:0 4px;opacity:.6;font-size:16px;line-height:1}#pwaInstall .x:hover{opacity:1}";
    document.head.appendChild(css);
    b = document.createElement("button");
    b.id = "pwaInstall";
    b.type = "button";
    b.hidden = true;
    b.innerHTML = '<img src="icons/icon-192.png" alt=""><span>앱으로 설치</span><span class="x" role="button" aria-label="설치 안내 닫기" title="닫기">×</span>';
    b.addEventListener("click", async (e) => {
      if (e.target.classList.contains("x")) { b.hidden = true; try { sessionStorage.setItem("wfa.pwa.hide", "1"); } catch (er) { /* 무시 */ } return; }
      if (!deferred) return;
      b.hidden = true;
      deferred.prompt();
      try { await deferred.userChoice; } catch (er) { /* 무시 */ }
      deferred = null;
    });
    document.body.appendChild(b);
    return b;
  }
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferred = e;
    let hide = false;
    try { hide = sessionStorage.getItem("wfa.pwa.hide") === "1"; } catch (er) { /* 무시 */ }
    if (!standalone() && !hide) installButton().hidden = false;
  });
  window.addEventListener("appinstalled", () => {
    deferred = null;
    const b = document.getElementById("pwaInstall");
    if (b) b.hidden = true;
    toast("설치했어요. 홈 화면·시작 메뉴에서 바로 열 수 있어요.");
  });
})();
