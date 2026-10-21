/* 문학 탐험 노트 — 나의 서재 · 문화 탐험 기록 · 문장 수집함
   지도 쪽 코드는 window.ATLAS.app(연결 고리)으로만 부른다. 문학 데이터(window.ATLAS.countries)는 읽기만 한다.
   저장: claude.ai 계정의 개인 저장소(db, data/users/<id>) → 없으면 이 브라우저(localStorage) → 둘 다 없으면 메모리. */
(function () {
  "use strict";
  const ATLAS = window.ATLAS || {};
  const APP = ATLAS.app;
  const C = ATLAS.countries || {};
  if (!APP) return;

  const esc = (v) => String(v == null ? "" : v).replace(/[&<>"']/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch]));
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const toast = (m) => APP.toast(m);
  const today = () => { const d = new Date(); return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10); };
  const newId = (p) => p + "_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);

  /* ───────── 분류 ───────── */
  const STATUS = { want: "읽고 싶은 책", reading: "읽는 중", done: "완독" };
  const CATS = [
    { id: "food", name: "음식", svg: '<path d="M4 12h16a8 8 0 0 1-16 0z"/><path d="M9 8c0-1.6 1.6-1.6 1.6-3.4M13.4 8c0-1.6 1.6-1.6 1.6-3.4"/>' },
    { id: "music", name: "음악", svg: '<path d="M9 18V6l10-2v12"/><circle cx="6.6" cy="18" r="2.4"/><circle cx="16.6" cy="16" r="2.4"/>' },
    { id: "clothing", name: "복장", svg: '<path d="M8.5 4 12 6l3.5-2L20 8l-3 3v9H7v-9L4 8z"/>' },
    { id: "architecture", name: "건축", svg: '<path d="M3 11l9-7 9 7"/><path d="M5 10v10h14V10"/><path d="M10 20v-5h4v5"/>' },
    { id: "place", name: "장소", svg: '<path d="M12 21s-6-6-6-11a6 6 0 0 1 12 0c0 5-6 11-6 11z"/><circle cx="12" cy="10" r="2.2"/>' },
    { id: "history", name: "역사", svg: '<path d="M7 4h10a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H8"/><path d="M7 4a2 2 0 0 0-2 2v2h4V6a2 2 0 0 0-2-2z"/><path d="M11 9h5M11 13h5"/>' },
    { id: "art", name: "미술·예술", svg: '<path d="M12 3a9 9 0 1 0 0 18c1.4 0 1.9-1 1.4-2.2-.6-1.4.4-2.8 1.9-2.8H18a3 3 0 0 0 3-3c0-5.5-4-10-9-10z"/><circle cx="8" cy="10.5" r="1.1"/><circle cx="12" cy="7.2" r="1.1"/><circle cx="16" cy="10.5" r="1.1"/>' },
    { id: "religion", name: "종교·풍습", svg: '<path d="M3 6.5h18M5.5 9.5h13M7.5 6.5V20M16.5 6.5V20"/><path d="M4 4.5c3 1 13 1 16 0"/>' },
    { id: "language", name: "언어·표현", svg: '<path d="M4 5h16v10H9l-5 4z"/><path d="M8 9h8M8 12h5"/>' },
    { id: "etc", name: "기타", svg: '<path d="M12 3.5l2.5 5.3 5.8.7-4.3 4 1.1 5.7L12 16.4l-5.1 2.8 1.1-5.7-4.3-4 5.8-.7z"/>' }
  ];
  const CAT = Object.fromEntries(CATS.map((c) => [c.id, c]));
  const NOTE_ICON = '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 3.5h11a1.5 1.5 0 0 1 1.5 1.5v14a1.5 1.5 0 0 1-1.5 1.5H6z"/><path d="M6 3.5v17M3.8 7h3.6M3.8 12h3.6M3.8 17h3.6"/><path d="M15 3.5v6l-1.6-1.2L11.8 9.5v-6" fill="var(--accent)" stroke="var(--ink)"/></svg>';

  /* ───────── 기록 정리(저장·불러오기·가져오기에 공통) ─────────
     모양이 틀린 기록은 버려서 지도 기능이 멈추지 않게 한다. */
  const ID_RE = /^[A-Za-z0-9_\-.~:@+]{1,150}$/;
  const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
  const str = (v, n) => (typeof v === "string" ? v : v == null ? "" : String(v)).slice(0, n);
  const strArr = (v, n, m) => (Array.isArray(v) ? v.filter((x) => typeof x === "string" && x.trim()).slice(0, n).map((x) => x.trim().slice(0, m)) : []);
  const int = (v, max) => { if (v === "" || v == null) return null; const n = Number(v); return Number.isFinite(n) && n >= 0 ? Math.min(Math.round(n), max) : null; };
  const ymd = (v) => (typeof v === "string" && DATE_RE.test(v) ? v : "");
  const iso = (v) => (typeof v === "string" && !isNaN(Date.parse(v)) ? v.slice(0, 40) : new Date().toISOString());
  // 독서 기록(독서 달력): 날짜마다 그날 읽은 데까지의 쪽수 { d: "YYYY-MM-DD", p: 쪽 }. 같은 날은 마지막 기록만
  function cleanLog(v) {
    if (!Array.isArray(v)) return [];
    const m = new Map();
    v.forEach((x) => { if (x && typeof x === "object") { const d = ymd(x.d), p = int(x.p, 100000); if (d && p != null) m.set(d, p); } });
    return [...m].sort((a, b) => a[0].localeCompare(b[0])).slice(-400).map(([d, p]) => ({ d, p }));
  }
  const pad2 = (n) => String(n).padStart(2, "0");
  const ymdOf = (dt) => `${dt.getFullYear()}-${pad2(dt.getMonth() + 1)}-${pad2(dt.getDate())}`;
  const todayYmd = () => ymdOf(new Date());
  const upsertLog = (log, d, p) => cleanLog([...(log || []).filter((x) => x.d !== d), ...(p == null ? [] : [{ d, p }])]);
  const assetIds = (v) => (Array.isArray(v) ? [...new Set(v.filter((x) => typeof x === "string" && /^[0-9a-f]{32}$/i.test(x)))].slice(0, 30) : []);
  function clean(raw, idOverride) {
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
    const id = idOverride || raw.id;
    if (typeof id !== "string" || !ID_RE.test(id)) return null;
    const kind = raw.kind;
    const base = { id, kind, countryCode: str(raw.countryCode, 12), bookId: str(raw.bookId, 160), createdAt: iso(raw.createdAt), updatedAt: iso(raw.updatedAt) };
    if (kind === "lib") {
      const cu = raw.custom && typeof raw.custom === "object" ? { title: str(raw.custom.title, 200).trim(), author: str(raw.custom.author, 120), year: str(raw.custom.year, 20), country: str(raw.custom.country, 60) } : null;
      if (!(base.countryCode && base.bookId) && !(cu && cu.title)) return null;
      return Object.assign(base, {
        status: STATUS[raw.status] ? raw.status : "want", startDate: ymd(raw.startDate), endDate: ymd(raw.endDate),
        currentPage: int(raw.currentPage, 100000), totalPages: int(raw.totalPages, 100000),
        rating: Math.min(5, int(raw.rating, 5) || 0), review: str(raw.review, 8000), custom: cu,
        coverAssetId: typeof raw.coverAssetId === "string" && /^[0-9a-f]{32}$/i.test(raw.coverAssetId) ? raw.coverAssetId : "",
        log: cleanLog(raw.log),
        // 책마다 자유롭게 적는 메모: [문화] · [문장] 두 장. 장마다 붙여 넣은 사진(캡처)도 30장까지
        memo: raw.memo && typeof raw.memo === "object"
          ? { cul: str(raw.memo.cul, 20000), quo: str(raw.memo.quo, 20000), imgs: { cul: assetIds(raw.memo.imgs && raw.memo.imgs.cul), quo: assetIds(raw.memo.imgs && raw.memo.imgs.quo) } }
          : { cul: "", quo: "", imgs: { cul: [], quo: [] } }
      });
    }
    if (kind === "cul") {
      const o = Object.assign(base, {
        regionIds: strArr(raw.regionIds, 20, 40), category: CAT[raw.category] ? raw.category : "etc",
        keyword: str(raw.keyword, 120).trim(), page: str(raw.page, 40), excerpt: str(raw.excerpt, 5000), description: str(raw.description, 8000),
        sourceTitle: str(raw.sourceTitle, 300), sourceUrl: str(raw.sourceUrl, 2000), imageUrl: str(raw.imageUrl, 2000),
        extraLinks: strArr(raw.extraLinks, 10, 2000), learned: str(raw.learned, 5000), personalMemo: str(raw.personalMemo, 8000),
        imageAssetId: typeof raw.imageAssetId === "string" && /^[0-9a-f]{32}$/i.test(raw.imageAssetId) ? raw.imageAssetId : "",
        tags: strArr(raw.tags, 20, 40), date: ymd(raw.date)
      });
      return o.keyword ? o : null;
    }
    if (kind === "quo") {
      const o = Object.assign(base, {
        quote: str(raw.quote, 5000).trim(), page: str(raw.page, 40), edition: str(raw.edition, 120), publisher: str(raw.publisher, 120),
        translator: str(raw.translator, 120), reflection: str(raw.reflection, 5000), tags: strArr(raw.tags, 20, 40), isFavorite: raw.isFavorite === true
      });
      return o.quote ? o : null;
    }
    return null;
  }

  /* ───────── 저장소 ───────── */
  const LS_KEY = "wfa.journal.v1";
  const store = { mode: "loading", items: new Map(), coll: null, assets: null, downloads: null, localLeft: 0, listeners: new Set() };
  const changed = () => store.listeners.forEach((f) => { try { f(); } catch (e) { console.error(e); } });

  function lsRead() {
    try { const raw = localStorage.getItem(LS_KEY); if (!raw) return []; const j = JSON.parse(raw); return Array.isArray(j && j.items) ? j.items : []; }
    catch (e) { return []; }
  }
  function lsWrite(items) {
    try { localStorage.setItem(LS_KEY, JSON.stringify({ v: 1, items })); return true; } catch (e) { return false; }
  }
  function lsAvailable() { try { localStorage.setItem("wfa.t", "1"); localStorage.removeItem("wfa.t"); return true; } catch (e) { return false; } }
  function loadLocal() {
    store.items = new Map();
    lsRead().forEach((r) => { const it = clean(r); if (it) store.items.set(it.id, it); });
  }
  function useLocal(reason) {
    store.coll = null;
    store.mode = lsAvailable() ? "local" : "memory";
    loadLocal();
    if (reason) toast(reason);
    changed();
  }

  /* 설치형(바탕화면 폴더): 함께 깔린 작은 로컬 서버가 기록을 설치 폴더의 data\journal.json에, 사진을 data\images에 저장한다.
     설치형 index.html만 window.WFA_LOCAL을 정해 두므로 온라인(claude.ai) 버전에는 영향이 없다. */
  const LOCAL = window.WFA_LOCAL && typeof window.WFA_LOCAL.api === "string" ? window.WFA_LOCAL : null;
  async function fileWrite(items) {
    const r = await fetch(LOCAL.api + "journal", { method: "PUT", headers: { "Content-Type": "application/json; charset=utf-8" }, body: JSON.stringify({ v: 1, items }) });
    if (!r.ok) throw new Error("설치 폴더에 저장하지 못했습니다. 바로가기로 다시 열어 주세요.");
  }
  const localAssets = LOCAL && {
    async upload(blob) {
      const r = await fetch(LOCAL.api + "assets", { method: "POST", headers: { "Content-Type": blob.type || "application/octet-stream" }, body: blob });
      if (!r.ok) { const e = new Error("upload failed"); e.code = r.status === 413 ? "too_large" : r.status === 415 ? "unsupported_type" : "upload_failed"; throw e; }
      return r.json();
    },
    async delete(id) { await fetch(LOCAL.api + "assets/" + encodeURIComponent(id), { method: "DELETE" }); }
  };
  async function initFileStore() {
    store.assets = localAssets;
    store.downloads = null;
    try {
      const r = await fetch(LOCAL.api + "journal", { cache: "no-store" });
      if (!r.ok) throw new Error();
      const j = await r.json();
      store.items = new Map();
      (Array.isArray(j && j.items) ? j.items : []).forEach((raw) => { const it = clean(raw); if (it) store.items.set(it.id, it); });
      store.mode = "file";
      changed();
    } catch (e) { useLocal("설치 폴더에 연결하지 못해 이 브라우저에 임시로 저장합니다."); return; }
    // 예전 설치형(브라우저 저장)에서 옮겨 온 기록이 있으면 합친다(같은 기록은 더 최근에 고친 쪽)
    try {
      const r = await fetch(LOCAL.api + "legacy", { cache: "no-store" });
      if (r.ok) {
        const j = await r.json();
        const rows = (Array.isArray(j && j.items) ? j.items : []).map((x) => clean(x)).filter(Boolean);
        if (rows.length) {
          const w = await writeMany(rows);
          toast(`예전에 이 컴퓨터에 저장한 기록 ${w.ok}개를 설치 폴더로 옮겼습니다.`);
          if (!w.failed) await fetch(LOCAL.api + "legacy", { method: "DELETE" });
        }
      }
    } catch (e) { /* 옮길 기록 없음 */ }
    // 창이 열려 있는 동안 서버에 알린다(창을 닫으면 서버가 잠시 뒤 스스로 꺼진다)
    setInterval(() => { fetch(LOCAL.api + "ping", { cache: "no-store" }).catch(() => {}); }, 60000);
  }

  async function initStore() {
    if (LOCAL) return initFileStore();
    loadLocal();
    store.mode = "loading";
    changed();
    const cl = window.claude;
    const use = (n) => (cl && typeof cl.use === "function" ? cl.use(n).catch(() => null) : Promise.resolve(null));
    const [user, db, assets, downloads] = await Promise.all([use("user"), use("db"), use("assets"), use("downloads")]);
    // 웹앱(PWA) 판은 사진을 이 기기 안(Cache Storage)에 두는 작은 저장소를 window.WFA_ASSETS로 넘겨준다
    store.assets = assets || (window.WFA_ASSETS && typeof window.WFA_ASSETS.upload === "function" ? window.WFA_ASSETS : null);
    store.downloads = downloads;
    let uid = null;
    try { uid = user ? await user.id() : null; } catch (e) { uid = null; }
    if (!db || !uid) { useLocal(); return; }
    try {
      store.coll = db.collection("data/users/" + uid);
    } catch (e) { useLocal(); return; }
    store.localLeft = lsRead().length;
    let first = true;
    store.coll.onSnapshot((snap) => {
      const m = new Map();
      snap.docs.forEach((d) => { const it = clean(d.data(), d.id); if (it) m.set(it.id, it); });
      store.items = m;
      store.mode = "db";
      first = false;
      changed();
    }, () => {
      useLocal(first ? null : "계정 저장소 연결이 끊겨 이 브라우저에 저장된 기록으로 바꿨습니다.");
    });
  }

  function dbMessage(e) {
    const code = e && e.code;
    if (code === "quota_exceeded") return "저장 공간이 가득 찼습니다. 오래된 기록을 지운 뒤 다시 저장해 주세요.";
    if (code === "invalid_argument") return "이 보기에서는 계정 저장소에 쓸 수 없습니다(보기 전용 권한). 이 브라우저에 저장하도록 바꿉니다.";
    if (code === "resource_exhausted") return "잠깐 너무 많이 저장했습니다. 몇 초 뒤 다시 시도해 주세요.";
    return "저장하지 못했습니다. 잠시 뒤 다시 시도해 주세요.";
  }
  async function putItem(raw) {
    const it = clean(Object.assign({}, raw, { updatedAt: new Date().toISOString() }));
    if (!it) throw new Error("기록 내용이 올바르지 않습니다.");
    if (store.mode === "db" && store.coll) {
      try { await store.coll.doc(it.id).set(it); }
      catch (e) {
        if (e && e.code === "unavailable") {
          await new Promise((r) => setTimeout(r, 600 + Math.random() * 600));
          try { await store.coll.doc(it.id).set(it); store.items.set(it.id, it); changed(); return it; } catch (e2) { throw new Error(dbMessage(e2)); }
        }
        if (e && e.code === "invalid_argument") { useLocal(dbMessage(e)); return putItem(raw); }
        throw new Error(dbMessage(e));
      }
      store.items.set(it.id, it);
    } else {
      const next = new Map(store.items); next.set(it.id, it);
      if (store.mode === "file") await fileWrite([...next.values()]);
      if (store.mode === "local" && !lsWrite([...next.values()])) throw new Error("브라우저 저장 공간에 쓰지 못했습니다(용량 초과 또는 저장 차단). 백업 탭에서 기록을 내보내 두세요.");
      store.items = next;
    }
    changed();
    return it;
  }
  async function removeItem(id, keepAssets) {
    const it = keepAssets ? null : store.items.get(id);
    if (store.mode === "db" && store.coll) {
      try { await store.coll.doc(id).delete(); } catch (e) { throw new Error(dbMessage(e)); }
      store.items.delete(id);
    } else {
      const next = new Map(store.items); next.delete(id);
      if (store.mode === "file") await fileWrite([...next.values()]);
      if (store.mode === "local" && !lsWrite([...next.values()])) throw new Error("브라우저 저장 공간에 쓰지 못했습니다.");
      store.items = next;
    }
    const memoImgs = it && it.memo && it.memo.imgs ? [...it.memo.imgs.cul, ...it.memo.imgs.quo] : [];
    for (const a of [it && it.imageAssetId, it && it.coverAssetId, ...memoImgs]) {
      if (a && store.assets) { try { await store.assets.delete(a); } catch (e) { /* 이미지가 이미 없거나 지울 권한 없음 */ } }
    }
    changed();
  }

  const all = (kind) => [...store.items.values()].filter((x) => x.kind === kind);
  const libId = (cc, bid) => "lib_" + cc + "_" + bid;
  const libOf = (cc, bid) => store.items.get(libId(cc, bid));

  /* ───────── 작품 찾기 ───────── */
  function countryName(cc, fallback) { return (C[cc] && C[cc].name) || fallback || ""; }
  function bookInfo(cc, bid) {
    if (!bid) return null;
    if (bid.startsWith("custom-")) {
      const li = store.items.get(bid.slice(7));
      if (!li || !li.custom) return { custom: true, t: "(지워진 직접 추가 책)", a: "", y: "", cc: "", country: "" };
      return { custom: true, t: li.custom.title, a: li.custom.author, y: li.custom.year, cc: li.countryCode, country: countryName(li.countryCode, li.custom.country), lib: li };
    }
    const c = C[cc], b = c && c.byId && c.byId[bid];
    if (!b) return null;
    return { t: b.t, a: b.a, y: b.y, yl: b.yl, cc, country: c.name, b };
  }
  function itemBook(it) {
    if (it.kind === "lib" && it.custom) return { custom: true, t: it.custom.title, a: it.custom.author, y: it.custom.year, cc: it.countryCode, country: countryName(it.countryCode, it.custom.country), lib: it };
    return bookInfo(it.countryCode, it.bookId) || { t: "(목록에 없는 작품)", a: "", y: "", cc: it.countryCode, country: countryName(it.countryCode) };
  }
  const itemCountry = (it) => it.countryCode || "";

  /* ───────── 스타일 ───────── */
  const CSS = `
.journal-btn { display: inline-flex; align-items: center; gap: 6px; padding: 6px 12px 6px 9px; border: 2px solid var(--ink); border-radius: 999px; background: var(--surface); color: var(--ink); cursor: pointer; font-family: var(--f-display); font-size: 15px; box-shadow: 2px 2px 0 rgba(58,42,34,.18); white-space: nowrap; }
.journal-btn:hover { background: var(--mustard); }
.topbar .journal-btn { margin-left: auto; }
.topbar .journal-btn + .bar-search { margin-left: 0; }
.topbar .cal-btn { margin-left: 8px; }
/* 독서 달력 */
.jcal { position: fixed; inset: 0; z-index: 66; background: rgba(58,42,34,.32); display: flex; align-items: stretch; justify-content: center; padding: 16px; padding-top: calc(16px + env(safe-area-inset-top, 0px)); padding-bottom: calc(16px + env(safe-area-inset-bottom, 0px)); }
.jcal[hidden] { display: none; }
.jcalbook { position: relative; width: min(1180px, 100%); display: grid; grid-template-rows: auto minmax(0, 1fr); background: var(--surface); border: 2px solid var(--ink); border-radius: var(--hand-radius); box-shadow: var(--shadow); overflow: hidden; }
.jchead { display: flex; align-items: center; gap: 14px; flex-wrap: wrap; padding: 12px 18px; border-bottom: 2px dashed var(--rule-strong); background: var(--bg); }
.jchead .jt { display: flex; align-items: center; gap: 10px; }
.jchead h2 { font-family: var(--f-display); font-size: 24px; }
.jchead > .icon-btn { margin-left: auto; }
.jcnav { display: flex; align-items: center; gap: 8px; margin-left: auto; }
.jcnav b { min-width: 9.5em; text-align: center; font-family: var(--f-display); font-weight: 400; font-size: 20px; }
.jcnav .jadd { height: 32px; font-size: 13px; }
.jcbody { min-height: 0; display: grid; grid-template-columns: minmax(0, 1fr) 300px; }
.jcmain { min-height: 0; overflow: auto; padding: 12px 16px 14px; display: flex; flex-direction: column; gap: 6px; }
.jcweek, .jcgrid { display: grid; grid-template-columns: repeat(7, minmax(0, 1fr)); gap: 4px; }
.jcweek span { text-align: center; font-family: var(--f-hand); font-size: 14px; color: var(--ink-2); }
.jcweek span:first-child { color: var(--accent); } .jcweek span:last-child { color: var(--teal); }
.jcgrid { grid-auto-rows: minmax(96px, 1fr); flex: 1; }
.jcd { position: relative; display: flex; flex-direction: column; align-items: stretch; gap: 3px; min-width: 0; padding: 5px 5px 12px; border: 1.5px dashed var(--rule-strong); border-radius: 10px; background: #fffdf7; text-align: left; cursor: pointer; overflow: hidden; font: inherit; color: var(--ink); }
.jcd:hover { border-color: var(--ink); }
.jcd.out { opacity: .45; }
.jcd .n { font: 500 13px var(--f-mono); color: var(--ink-2); }
.jcd.w0 .n { color: var(--accent); } .jcd.w6 .n { color: var(--teal); }
.jcd.today { background: #fff3d6; border-style: solid; border-color: var(--mustard); }
.jcd.today .n::after { content: " 오늘"; font: 400 11px var(--f-hand); color: var(--accent-hover); }
.jcd.sel { border: 2px solid var(--ink); box-shadow: 2px 2px 0 rgba(58,42,34,.18); }
.jcchip { display: flex; align-items: baseline; gap: 4px; min-width: 0; padding: 1px 6px 1px 5px; border-left: 4px solid var(--spine, var(--accent)); border-radius: 4px; background: var(--chip-bg); font-size: 11.5px; line-height: 1.5; }
.jcchip b { min-width: 0; font-weight: 500; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.jcchip i { flex: none; margin-left: auto; font-style: normal; font: 500 11px var(--f-mono); color: var(--teal); }
.jcchip.end { background: #e3f1d6; } .jcchip.end i { color: var(--green, #3d8a4a); }
.jcmore { font-size: 11px; color: var(--ink-3); padding-left: 4px; }
.jcspan { position: absolute; left: 5px; right: 5px; bottom: 4px; display: flex; gap: 2px; }
.jcspan i { flex: 1; height: 4px; border-radius: 2px; opacity: .75; }
.jcsum { font-size: 13px; color: var(--ink-2); padding-top: 2px; }
.jcsum b { font-family: var(--f-display); font-weight: 400; font-size: 15px; color: var(--accent); }
.jcday { min-height: 0; overflow: auto; border-left: 2px dashed var(--rule); padding: 14px 16px; display: flex; flex-direction: column; gap: 10px; background: repeating-linear-gradient(transparent 0 27px, rgba(149,128,111,.10) 27px 28px), var(--surface); }
.jcday h3 { font-family: var(--f-display); font-weight: 400; font-size: 20px; }
.jcday .hint { font-size: 12.5px; color: var(--ink-3); }
.jclist { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 8px; }
.jclist li { position: relative; display: flex; flex-direction: column; gap: 4px; padding: 8px 30px 8px 12px; border: 1.5px solid var(--ink); border-left: 6px solid var(--spine, var(--accent)); border-radius: 10px; background: var(--surface); }
.jct { border: 0; background: none; padding: 0; text-align: left; cursor: pointer; font-family: var(--f-display); font-size: 16px; color: var(--ink); }
.jct:hover { color: var(--accent); text-decoration: underline; text-underline-offset: 3px; }
.jcs { font-size: 12.5px; color: var(--ink-2); }
.jcdel { position: absolute; top: 6px; right: 6px; width: 22px; height: 22px; padding: 0; border: 1.5px solid var(--rule-strong); border-radius: 50%; background: var(--surface); cursor: pointer; font-size: 13px; line-height: 1; color: var(--ink-3); }
.jcdel:hover { border-color: var(--ink); color: var(--accent); }
.jcalso { font-size: 13px; color: var(--ink-2); }
.jcalso .jct { font-family: inherit; font-size: 13px; color: var(--teal); }
.jcrec { margin-top: auto; display: flex; flex-direction: column; gap: 6px; padding: 10px 12px; border: 2px dashed var(--rule-strong); border-radius: 12px; background: #fffdf7; }
.jcrec h4 { font-family: var(--f-hand); font-weight: 400; font-size: 15px; color: var(--teal); }
.jcrec select, .jcrec input { font: inherit; font-size: 14px; color: var(--ink); background: #fff; border: 1.5px solid var(--rule-strong); border-radius: 8px; padding: 6px 8px; min-width: 0; }
.jcrow { display: flex; align-items: center; gap: 6px; }
.jcrow input { flex: 1; width: 0; }
.jcrow span { font-size: 13px; color: var(--ink-3); white-space: nowrap; }
.jcrow .jadd { height: 34px; }
@media (max-width: 860px) {
  .jcal { padding: 0; }
  .jcalbook { border-radius: 0; border-width: 0; overflow: auto; grid-template-rows: auto auto; }
  .jcbody { grid-template-columns: 1fr; }
  .jcday { border-left: 0; border-top: 2px dashed var(--rule); }
  .jcgrid { grid-auto-rows: minmax(64px, auto); }
  .jcchip b { display: none; }
  .jcchip { justify-content: center; }
}
.journal-btn .jn { font: 500 11px var(--f-mono); color: var(--accent-hover); }
body.jopen { overflow: hidden; }
.journal { position: fixed; inset: 0; z-index: 65; background: rgba(58,42,34,.32); display: flex; align-items: stretch; justify-content: center; padding: 16px; padding-top: calc(16px + env(safe-area-inset-top, 0px)); padding-bottom: calc(16px + env(safe-area-inset-bottom, 0px)); }
.journal[hidden] { display: none; }
.jbook { position: relative; width: min(1200px, 100%); display: grid; grid-template-columns: 220px minmax(0, 1fr); grid-template-rows: auto minmax(0, 1fr); background: var(--surface); border: 2px solid var(--ink); border-radius: var(--hand-radius); box-shadow: var(--shadow); overflow: hidden; }
.jbook::before { content: ""; position: absolute; top: -2px; right: 70px; width: 22px; height: 64px; background: var(--teal); clip-path: polygon(0 0,100% 0,100% 100%,50% 82%,0 100%); z-index: 2; }
.jhead { grid-column: 1 / -1; display: flex; align-items: center; gap: 14px; padding: 14px 18px; border-bottom: 2px dashed var(--rule-strong); background: var(--bg); }
.jhead .jt { display: flex; align-items: center; gap: 10px; min-width: 0; }
.jhead h2 { font-family: var(--f-display); font-size: 24px; }
.jstore { margin-left: auto; font-size: 12.5px; color: var(--ink-2); display: flex; align-items: center; gap: 6px; text-align: right; }
.jstore i { width: 9px; height: 9px; border-radius: 50%; background: var(--teal); flex: none; }
.jstore.local i { background: var(--mustard); } .jstore.memory i, .jstore.loading i { background: var(--accent); }
.jside { border-right: 2px dashed var(--rule); padding: 14px 12px; display: flex; flex-direction: column; gap: 14px; overflow: auto; background: repeating-linear-gradient(transparent 0 27px, rgba(149,128,111,.10) 27px 28px), var(--surface); }
.jtabs { display: flex; flex-direction: column; gap: 6px; }
.jtab { display: flex; align-items: center; gap: 8px; width: 100%; text-align: left; padding: 9px 12px; border: 1.5px solid var(--rule-strong); border-radius: 12px 4px 4px 12px; background: var(--tabc, var(--surface)); cursor: pointer; font-family: var(--f-display); font-size: 16px; }
.jtab .n { margin-left: auto; font: 500 11.5px var(--f-mono); color: var(--ink-3); }
.jtab[aria-selected="true"] { border: 2px solid var(--ink); box-shadow: 3px 2px 0 var(--ink); transform: translateX(4px); }
.jside h4 { font-family: var(--f-hand); font-weight: 400; font-size: 14px; color: var(--teal); margin-bottom: 4px; }
.jcountries { display: flex; flex-direction: column; gap: 4px; }
.jcbtn { display: flex; justify-content: space-between; gap: 6px; padding: 5px 9px; border: 1px dashed var(--rule-strong); border-radius: 8px; background: transparent; cursor: pointer; font-size: 13px; text-align: left; }
.jcbtn[aria-pressed="true"] { border-style: solid; border-color: var(--ink); background: var(--accent-soft); }
.jcbtn .mono { font-size: 11px; color: var(--ink-3); }
.jmain { min-height: 0; overflow: auto; padding: 16px 20px 28px; display: flex; flex-direction: column; gap: 14px; }
.jtools { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; }
.jtools .jsearch { flex: 1 1 220px; min-width: 0; height: 38px; padding: 0 14px; border: 2px solid var(--ink); border-radius: 999px; background: #fff; font: inherit; font-size: 14px; color: var(--ink); }
.jtools .jsb { position: relative; flex: 1 1 220px; min-width: 0; }
.jtools .jsb .jsearch { width: 100%; }
.jtools .jsb .results { z-index: 5; }
.jres .ri .act { margin-left: auto; flex: none; font-size: 12.5px; color: var(--accent-hover); }
.jres .ri .act + .n { margin-left: 8px; }
.jtools select { height: 38px; padding: 0 10px; border: 1.5px solid var(--rule-strong); border-radius: 999px; background: var(--surface); font: inherit; font-size: 13.5px; color: var(--ink); max-width: 100%; }
.jadd { height: 38px; padding: 0 16px; border: 2px solid var(--ink); border-radius: 999px; background: var(--accent); color: #fff; font-family: var(--f-display); font-size: 15px; cursor: pointer; box-shadow: 2px 2px 0 var(--ink); white-space: nowrap; }
.jadd:hover { background: var(--accent-hover); }
.jadd.ghost { background: var(--surface); color: var(--ink); }
.jadd.ghost:hover { background: var(--mustard); }
.jchips { display: flex; flex-wrap: wrap; gap: 6px; }
.jchip { display: inline-flex; align-items: center; gap: 5px; padding: 4px 11px 4px 8px; border: 1.5px solid var(--rule-strong); border-radius: 999px; background: var(--surface); cursor: pointer; font-size: 13px; }
.jchip[aria-pressed="true"] { background: var(--teal-soft); border-color: var(--teal); color: var(--ink); }
.jchip .cat-ic { color: var(--teal); }
.jcount { font-size: 13px; color: var(--ink-3); }
.jgrid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 16px; align-items: start; }
.jempty { padding: 36px 12px; text-align: center; color: var(--ink-3); border: 2px dashed var(--rule-strong); border-radius: var(--hand-radius); }
.jempty b { display: block; font-family: var(--f-display); font-weight: 400; font-size: 18px; color: var(--ink-2); margin-bottom: 4px; }
.jcard { position: relative; display: flex; flex-direction: column; gap: 6px; padding: 16px; background: var(--surface); border: 2px solid var(--ink); border-radius: var(--hand-radius); box-shadow: 3px 3px 0 rgba(58,42,34,.14); min-width: 0; }
.jcard h5 { font-family: var(--f-display); font-weight: 400; font-size: 19px; line-height: 1.3; margin: 0; word-break: keep-all; }
.jcard .meta { font-size: 12.5px; color: var(--ink-3); }
.jcard .txt { font-size: 14px; color: var(--ink-2); white-space: pre-wrap; word-break: break-word; display: -webkit-box; -webkit-line-clamp: 4; -webkit-box-orient: vertical; overflow: hidden; }
.jcard .acts { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 6px; padding-top: 8px; border-top: 1.5px dashed var(--rule); }
.jcard .acts button { padding: 4px 10px; border: 1.5px solid var(--rule-strong); border-radius: 999px; background: var(--surface); cursor: pointer; font-size: 12.5px; }
.jcard .acts button:hover { background: var(--mustard); border-color: var(--ink); }
.jcard .acts .del { margin-left: auto; color: var(--accent-hover); }
.jcard a { color: var(--teal); word-break: break-all; }
.j-badurl { color: var(--ink-3); word-break: break-all; }
.jtags { display: flex; flex-wrap: wrap; gap: 4px; }
.jtags span { font-size: 11.5px; padding: 1px 8px; border-radius: 999px; background: var(--chip-bg); border: 1px solid var(--rule); color: var(--ink-2); }
.jtags span::before { content: "#"; color: var(--ink-3); }
/* 서재: 책등 띠 */
.jlib { padding-left: 24px; }
.jlib::before { content: ""; position: absolute; left: 8px; top: 10px; bottom: 10px; width: 6px; border-radius: 3px; background: var(--spine, var(--accent)); }
.jpill { align-self: flex-start; font-size: 12px; padding: 2px 10px; border-radius: 999px; border: 1.5px solid var(--ink); background: var(--mustard); }
.jpill.reading { background: var(--teal-soft); } .jpill.done { background: #d8ecc5; }
.jprog { height: 8px; border-radius: 99px; background: var(--chip-bg); border: 1px solid var(--rule-strong); overflow: hidden; }
.jprog i { display: block; height: 100%; background: var(--teal); }
.jstars { color: var(--mustard); letter-spacing: 1px; font-size: 15px; }
.jstars .off { color: var(--rule-strong); }
/* 서재 카드: 같은 크기의 칸에 상태·제목·진행률만. 마우스를 올리거나 눌러 고르면 칸 위로 아래쪽까지 펼쳐진다(옆 카드는 그대로) */
.jslot { position: relative; height: 122px; }
.jslot > .jcard { position: absolute; left: 0; right: 0; top: 0; height: 100%; overflow: hidden; outline: none; transition: box-shadow .15s; }
.jslot > .jcard h5 { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.jslot > .jcard .jmore { display: none; }
.jslot > .jcard:is(:hover, :focus-within) { height: auto; min-height: 100%; overflow: visible; z-index: 8; box-shadow: 5px 6px 0 rgba(58,42,34,.18), 0 14px 30px rgba(58,42,34,.18); }
.jslot > .jcard:is(:hover, :focus-within) h5 { white-space: normal; }
.jslot > .jcard:is(:hover, :focus-within) .jmore { display: flex; flex-direction: column; gap: 6px; }
.jslot > .jcard:focus-visible { border-color: var(--accent); }
.jslot > .jlib.hascover { padding-right: 16px; }
.jslot > .jlib.hascover:is(:hover, :focus-within) { padding-right: 84px; }
.jrate { display: flex; align-items: center; gap: 8px; margin-top: 2px; }
.jrate .jprog { flex: 1; }
.jrate span { flex: none; min-width: 3ch; text-align: right; font: 500 12.5px var(--f-mono); color: var(--teal); }
.jcustom { font-size: 11px; color: var(--ink-3); border: 1px dashed var(--rule-strong); border-radius: 999px; padding: 0 7px; align-self: flex-start; }
/* 문화 기록: 사진을 붙인 카드 */
.jcul { padding-top: 12px; }
.jphoto { position: relative; margin: 6px 6px 10px; background: #fff; padding: 8px 8px 26px; box-shadow: 1px 2px 0 rgba(58,42,34,.18); border: 1px solid var(--rule); transform: rotate(var(--tilt, -1.2deg)); }
.jphoto::before, .jphoto::after { content: ""; position: absolute; top: -8px; width: 52px; height: 18px; background: rgba(242,179,61,.55); border: 1px solid rgba(58,42,34,.12); }
.jphoto::before { left: 10px; transform: rotate(-6deg); } .jphoto::after { right: 10px; transform: rotate(5deg); }
.jphoto .ph { aspect-ratio: 4 / 3; max-width: 100%; display: grid; place-items: center; background: var(--catbg, var(--teal-soft)); color: var(--ink); overflow: hidden; }
.jphoto .ph img { width: 100%; height: 100%; object-fit: cover; display: block; }
.jphoto .cap { position: absolute; left: 10px; right: 10px; bottom: 5px; font-family: var(--f-hand); font-size: 14px; color: var(--ink-2); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.jstamp { position: absolute; top: 8px; right: 8px; width: 46px; height: 46px; border-radius: 50%; border: 2px dashed var(--accent); color: var(--accent); background: var(--surface); display: grid; place-items: center; transform: rotate(10deg); z-index: 1; }
/* 문장 카드: 손글씨 종이 */
.jquo { background: #fffaf0; background-image: repeating-linear-gradient(transparent 0 29px, rgba(149,128,111,.16) 29px 30px); padding-left: 30px; }
.jquo::before { content: ""; position: absolute; left: 20px; top: 0; bottom: 0; width: 1.5px; background: rgba(223,90,74,.45); }
.jquo .q { font-family: "Nanum Pen Script", var(--f-hand); font-size: 23px; line-height: 30px; color: var(--ink); white-space: pre-wrap; word-break: break-word; }
.jquo .q::before { content: "“"; color: var(--accent); font-size: 30px; margin-right: 2px; }
.jquo .q::after { content: "”"; color: var(--accent); font-size: 30px; margin-left: 2px; }
.jquo .refl { font-size: 13.5px; color: var(--ink-2); padding: 8px 10px; background: var(--surface); border: 1.5px dashed var(--rule-strong); border-radius: 10px; white-space: pre-wrap; word-break: break-word; }
.jquo .refl::before { content: "나의 생각 · "; font-family: var(--f-hand); color: var(--teal); }
.jfav { position: absolute; top: 8px; right: 10px; border: 0; background: none; cursor: pointer; font-size: 22px; line-height: 1; color: var(--rule-strong); }
.jfav[aria-pressed="true"] { color: var(--mustard); text-shadow: 0 0 0 var(--ink); }
/* 보관·백업 */
.jbox { display: flex; flex-direction: column; gap: 10px; padding: 16px; border: 2px solid var(--ink); border-radius: var(--hand-radius); background: var(--surface); }
.jbox h5 { font-family: var(--f-display); font-weight: 400; font-size: 18px; margin: 0; }
.jbox p { font-size: 14px; color: var(--ink-2); }
.jbox textarea { width: 100%; min-height: 120px; font: 12px var(--f-mono); padding: 8px; border: 1.5px solid var(--rule-strong); border-radius: 10px; background: #fff; color: var(--ink); }
.jrow { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; }
/* 작품 상세창 · 나라 화면 연결 */
.jx { border: 2px dashed var(--rule-strong); border-radius: 14px; padding: 12px 14px; background: var(--bg); }
.jx h3 { display: flex; align-items: center; gap: 6px; }
.jx .jxrow { display: flex; flex-wrap: wrap; gap: 6px; align-items: center; }
.jx .jxcount { font-size: 13.5px; color: var(--ink-2); }
.jx button { padding: 6px 12px; border: 1.5px solid var(--ink); border-radius: 999px; background: var(--surface); cursor: pointer; font-family: var(--f-display); font-size: 14px; }
.jx button:hover { background: var(--mustard); }
.jx button.main { background: var(--accent); color: #fff; }
.jx button.main:hover { background: var(--accent-hover); }
.jx button.link { border: 0; background: none; padding: 0; color: var(--teal); text-decoration: underline; text-underline-offset: 3px; font-family: var(--f-body); font-size: 13px; }
.cjx { grid-column: 1 / -1; display: flex; flex-wrap: wrap; align-items: center; gap: 8px 14px; padding: 10px 14px; border: 2px dashed var(--rule-strong); border-radius: 14px; background: var(--surface); font-size: 14px; color: var(--ink-2); }
.cjx b { font-family: var(--f-display); font-weight: 400; color: var(--ink); }
.cjx button { padding: 5px 12px; border: 1.5px solid var(--ink); border-radius: 999px; background: var(--surface); cursor: pointer; font-family: var(--f-display); font-size: 14px; }
.cjx button:hover { background: var(--mustard); }
/* 작성 화면 */
.jmodal { position: fixed; inset: 0; z-index: 88; background: rgba(58,42,34,.38); display: flex; justify-content: center; align-items: flex-start; overflow: auto; padding: 24px 16px; padding-top: calc(24px + env(safe-area-inset-top, 0px)); }
.jmodal[hidden] { display: none; }
.jsheet { width: min(720px, 100%); background: var(--surface); border: 2px solid var(--ink); border-radius: var(--hand-radius); box-shadow: var(--shadow); }
.jsheet header { display: flex; align-items: center; gap: 10px; padding: 14px 18px; border-bottom: 2px dashed var(--rule-strong); background: var(--bg); border-radius: 18px 24px 0 0; }
.jsheet header h3 { font-family: var(--f-display); font-weight: 400; font-size: 21px; margin: 0; }
.jsheet header .icon-btn { margin-left: auto; }
/* 옮기거나 크기를 바꾼 작성 창: 머리는 그대로, 내용만 창 안에서 스크롤 */
/* 작성 창의 나라·작가 칸 연관 목록(칸 바로 아래) */
.jacw { position: relative; }
.jac { top: calc(100% + 4px); z-index: 30; max-height: 260px; padding: 4px; border: 2px solid var(--ink); }
.jac .ri { padding: 6px 10px; }
.jsheet.fp-pinned { display: flex; flex-direction: column; overflow: hidden; }
.jsheet.fp-pinned > form { flex: 1 1 auto; min-height: 0; overflow: auto; }
.jform { padding: 16px 18px 20px; display: flex; flex-direction: column; gap: 16px; }
.jform fieldset { border: 0; margin: 0; padding: 0; display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px 14px; }
.jform legend { grid-column: 1 / -1; font-family: var(--f-hand); font-size: 15px; color: var(--teal); padding: 0; margin-bottom: 4px; }
.jf { display: flex; flex-direction: column; gap: 3px; min-width: 0; }
.jf.full { grid-column: 1 / -1; }
.jf > span { font-size: 12.5px; color: var(--ink-2); }
.jf > span em { color: var(--accent); font-style: normal; }
.jf input, .jf select, .jf textarea { width: 100%; font: inherit; font-size: 14.5px; color: var(--ink); background: transparent; border: 0; border-bottom: 1.5px dashed var(--rule-strong); padding: 6px 2px; border-radius: 0; }
.jf textarea { min-height: 72px; resize: vertical; background: repeating-linear-gradient(transparent 0 25px, rgba(149,128,111,.12) 25px 26px); line-height: 26px; padding-top: 0; }
.jf input:focus, .jf select:focus, .jf textarea:focus { outline: 0; border-bottom: 2px solid var(--accent); }
.jf .hint { font-size: 12px; color: var(--ink-3); }
.jstarsin input, .jstatus input { position: absolute; opacity: 0; pointer-events: none; }
.jstatus { display: flex; gap: 6px; flex-wrap: wrap; }
.jstatus label { padding: 5px 12px; border: 1.5px solid var(--rule-strong); border-radius: 999px; cursor: pointer; font-size: 13.5px; }
.jstatus label:has(input:checked) { background: var(--mustard); border-color: var(--ink); }
.jstarsin { display: flex; gap: 2px; }
.jstarsin label { font-size: 26px; cursor: pointer; color: var(--rule-strong); line-height: 1; }
.jstarsin label.on { color: var(--mustard); }
.jlinks { display: flex; flex-wrap: wrap; gap: 6px 12px; font-size: 13px; }
.jlinks a { color: var(--teal); }
.jnote { font-size: 12.5px; color: var(--ink-3); background: var(--bg); border-radius: 10px; padding: 8px 10px; }
/* 직접 추가한 책의 표지 사진 */
/* 메모장: 위에 [문화]·[문장] 탭, 아래에 줄 쳐진 종이에 자유롭게 적는다 */
.jmtabs { display: flex; align-items: flex-end; gap: 10px; margin-bottom: -2px; position: relative; z-index: 1; }
.jmtablist { display: flex; gap: 6px; flex: none; }
/* 탭 옆 구글 검색창 */
.jgsearch { margin-left: auto; margin-bottom: 8px; flex: 0 1 340px; min-width: 0; display: flex; align-items: center; gap: 6px; height: 36px; padding: 0 4px 0 12px; border: 2px solid var(--ink); border-radius: 999px; background: #fff; color: var(--ink-3); }
.jgsearch:focus-within { box-shadow: 0 0 0 3px var(--accent-soft); }
.jgsearch input { flex: 1; min-width: 0; border: 0; outline: 0; background: transparent; font: inherit; font-size: 14px; color: var(--ink); }
.jgsearch input::-webkit-search-cancel-button { display: none; }
.jgsearch button { flex: none; height: 28px; padding: 0 12px; border: 0; border-radius: 999px; background: var(--teal); color: #fff; font-family: var(--f-display); font-size: 14px; cursor: pointer; }
.jgsearch button:hover { background: var(--ink); }
@media (max-width: 560px) { .jmtabs { flex-wrap: wrap; } .jgsearch { flex-basis: 100%; order: -1; margin-left: 0; } }
.jmtab { padding: 7px 20px; border: 2px solid var(--rule-strong); border-bottom: 0; border-radius: 12px 12px 0 0; background: var(--chip-bg); cursor: pointer; font-family: var(--f-display); font-size: 16px; color: var(--ink-2); }
.jmtab[aria-selected="true"] { background: #fffdf5; border-color: var(--ink); color: var(--ink); }
.jmemo { display: block; width: 100%; min-height: min(52vh, 460px); resize: vertical; padding: 14px 18px; border: 2px solid var(--ink); border-radius: 0 12px 12px 12px; outline: 0;
  font: 16px/32px var(--f-body); color: var(--ink); background-color: #fffdf5; background-attachment: local;
  background-image: linear-gradient(to bottom, transparent 31px, #e8dcc6 31px); background-size: 100% 32px; background-position: 0 14px; }
.jmemo:focus { box-shadow: 0 0 0 3px var(--accent-soft); }
.jmemo[hidden] { display: none; }
.jmemo.drop { border-style: dashed; border-color: var(--teal); box-shadow: 0 0 0 4px var(--teal-soft); }
/* 메모 칸(글 사이에 사진이 들어가는 칸): 줄 공책 모양은 그대로 */
div.jmemo { position: relative; white-space: pre-wrap; overflow-wrap: anywhere; overflow: auto; cursor: text; }
div.jmemo.is-empty::before { content: attr(data-ph); position: absolute; left: 18px; right: 18px; top: 14px; color: var(--ink-3); pointer-events: none; }
/* 메모 칸 안의 사진: 사진 아래 줄에 설명을 이어 적는다 */
.jmfig { position: relative; display: block; width: fit-content; max-width: 100%; margin: 0; padding: 8px 0; user-select: none; cursor: default; }
.jmfig img { display: block; max-width: min(100%, 560px); max-height: 380px; border: 2px solid var(--ink); border-radius: 8px; background: #fff; box-shadow: 3px 3px 0 rgba(58,42,34,.14); cursor: zoom-in; }
.jmfig.up img { opacity: .55; }
.jmfig.up::after { content: "올리는 중…"; position: absolute; left: 10px; bottom: 16px; padding: 1px 8px; border-radius: 999px; font-size: 12px; line-height: 1.6; background: rgba(255,253,245,.9); }
.jmfig-k { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }
.jmfig-x { position: absolute; top: 14px; right: 6px; width: 26px; height: 26px; padding: 0; border: 1.5px solid var(--ink); border-radius: 50%; background: var(--surface); cursor: pointer; opacity: 0; transition: opacity .15s; }
.jmfig-x::before { content: "×"; font-size: 16px; line-height: 1; }
.jmfig:hover .jmfig-x, .jmfig-x:focus-visible { opacity: 1; }
/* 크기 손잡이: 사진 오른쪽 아래 모서리 */
.jmfig-r { position: absolute; right: -7px; bottom: 1px; width: 18px; height: 18px; border: 2px solid var(--ink); border-radius: 4px; background: var(--surface); cursor: nwse-resize; touch-action: none; opacity: 0; transition: opacity .15s; }
.jmfig-r::before { content: ""; position: absolute; inset: 3px; background: linear-gradient(135deg, transparent 45%, var(--ink) 45%, var(--ink) 55%, transparent 55%, transparent 70%, var(--ink) 70%, var(--ink) 80%, transparent 80%); }
.jmfig:hover .jmfig-r, .jmfig.sizing .jmfig-r { opacity: 1; }
.jmfig.sizing, .jmfig.sizing * { cursor: nwse-resize !important; }
.jmfig.sizing img { outline: 2px dashed var(--teal); outline-offset: 2px; }
.jmfig-x:hover { background: var(--mustard); }
/* 메모에 붙인 사진(캡처) */
.jmimgs { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 8px; }
.jmimgs:empty, .jmimgs[hidden] { display: none; }
.jmimg { position: relative; margin: 0; width: 112px; height: 84px; border: 2px solid var(--ink); border-radius: 8px; overflow: hidden; background: var(--chip-bg); box-shadow: 2px 2px 0 rgba(58,42,34,.14); }
.jmimg img { display: block; width: 100%; height: 100%; object-fit: cover; }
.jmimg-v { display: block; width: 100%; height: 100%; padding: 0; border: 0; background: none; cursor: zoom-in; }
.jmimg-x { position: absolute; top: 3px; right: 3px; width: 22px; height: 22px; display: grid; place-items: center; padding: 0; border: 1.5px solid var(--ink); border-radius: 50%; background: var(--surface); cursor: pointer; font-size: 14px; line-height: 1; }
.jmimg-x:hover { background: var(--mustard); }
.jmimg.up img { opacity: .5; }
.jmimg.up span { position: absolute; inset: auto 0 0 0; padding: 2px 4px; font-size: 11px; text-align: center; background: rgba(255,253,245,.85); }
.jmimgbar { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; margin-top: 8px; }
.jmimgbar .jadd { height: 30px; font-size: 13px; }
.jmimgbar .hint { font-size: 12.5px; color: var(--ink-3); }
.jmimgbar kbd { font: 500 11px var(--f-mono); border: 1px solid var(--rule-strong); border-radius: 4px; padding: 0 4px; background: #fff; }
.jmcthumbs { display: flex; align-items: center; gap: 6px; }
.jmcthumbs img { width: 44px; height: 34px; object-fit: cover; border: 1.5px solid var(--ink); border-radius: 5px; }
.jmcthumbs span { font-size: 12px; color: var(--ink-3); margin-left: 2px; }
.jlight { position: fixed; inset: 0; z-index: 99; display: grid; place-items: center; padding: 24px; background: rgba(30,22,18,.72); cursor: zoom-out; }
.jlight img { max-width: 100%; max-height: 100%; object-fit: contain; border: 2px solid var(--ink); border-radius: 8px; background: #fff; box-shadow: var(--shadow); }
.jlight .pc-x { position: fixed; top: 16px; right: 16px; }
.jmemo-meta { display: flex; justify-content: space-between; gap: 10px; font-size: 12.5px; color: var(--ink-3); margin-top: 6px; }
.jhint { font-size: 13px; color: var(--ink-3); margin: 8px 2px 0; }
.jmemocard .jmp { border-top: 1px dashed var(--rule-strong); padding-top: 6px; }
.jmemocard .jmp b { font-family: var(--f-display); font-weight: 400; font-size: 14px; color: var(--teal); }
.jmemocard .jmp p { font-size: 13.5px; color: var(--ink-2); white-space: pre-line; display: -webkit-box; -webkit-line-clamp: 4; -webkit-box-orient: vertical; overflow: hidden; }
.jcoverbox { display: flex; gap: 14px; align-items: flex-start; }
.jcoverpv { flex: none; width: 76px; height: 108px; border: 1.5px dashed var(--rule-strong); border-radius: 6px; display: grid; place-items: center; overflow: hidden; background: var(--chip-bg); color: var(--ink-3); font-size: 12px; }
.jcoverpv img { width: 100%; height: 100%; object-fit: cover; }
.jcoverside { display: flex; flex-direction: column; gap: 6px; min-width: 0; align-items: flex-start; }
.jcoverside input[type=file] { font-size: 13px; max-width: 100%; }
.jlib.hascover { padding-right: 84px; }
.jcover-th { position: absolute; top: 14px; right: 14px; width: 58px; height: 82px; object-fit: cover; border: 1.5px solid var(--ink); border-radius: 4px; box-shadow: 2px 2px 0 rgba(58,42,34,.14); }
.jimg { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
.jimg img { width: 96px; height: 72px; object-fit: cover; border: 1px solid var(--rule); }
.jfoot { display: flex; gap: 8px; justify-content: flex-end; flex-wrap: wrap; padding-top: 6px; border-top: 2px dashed var(--rule); }
.jerr { color: var(--accent-hover); font-size: 13px; margin-right: auto; align-self: center; }
.jconfirm { position: fixed; inset: 0; z-index: 95; background: rgba(58,42,34,.42); display: grid; place-items: center; padding: 16px; }
.jconfirm[hidden] { display: none; }
.jconfirm .jsheet { width: min(420px, 100%); }
.jconfirm p { padding: 16px 18px 0; font-size: 15px; white-space: pre-wrap; }
.jconfirm .jfoot { padding: 14px 18px 16px; border: 0; }
@media (max-width: 760px) {
  .journal { padding: 0; }
  .jbook { grid-template-columns: 1fr; grid-template-rows: auto auto minmax(0, 1fr); border-radius: 0; border-width: 0; }
  .jbook::before { right: 56px; height: 44px; }
  .jside { border-right: 0; border-bottom: 2px dashed var(--rule); padding: 10px 12px; gap: 8px; overflow: visible; }
  .jtabs { flex-direction: row; overflow-x: auto; padding-bottom: 4px; }
  .jtab { flex: none; width: auto; border-radius: 999px; font-size: 14.5px; padding: 7px 12px; }
  .jtab[aria-selected="true"] { transform: none; box-shadow: 2px 2px 0 var(--ink); }
  .jside .jcountries { flex-direction: row; flex-wrap: wrap; }
  .jhead { padding: 10px 12px; gap: 10px; flex-wrap: wrap; }
  .jhead h2 { font-size: 20px; }
  .jstore { order: 3; width: 100%; margin-left: 0; justify-content: flex-start; text-align: left; }
  .jmain { padding: 12px 12px 24px; }
  .jgrid { grid-template-columns: 1fr; }
  .jform fieldset { grid-template-columns: 1fr; }
  .jmodal { padding: 0; }
  .jsheet { min-height: 100%; border-radius: 0; border-width: 0; }
  .jsheet header { border-radius: 0; position: sticky; top: 0; z-index: 1; }
  .journal-btn .jl { display: none; }
}
`;
  const st = document.createElement("style");
  st.textContent = CSS;
  document.head.appendChild(st);

  /* ───────── 뼈대 DOM ───────── */
  const TAB_COLORS = { lib: "#fde0bf", memo: "#c6e6e3", box: "#eadbc8" };
  const root = document.createElement("div");
  root.innerHTML = `
<section class="journal" id="journal" hidden role="dialog" aria-modal="true" aria-labelledby="jTitle">
  <div class="jbook">
    <header class="jhead">
      <div class="jt">${NOTE_ICON}<div><p class="eyebrow">Literary Explorer's Journal</p><h2 id="jTitle">문학 탐험 노트</h2></div></div>
      <p class="jstore" id="jStore" role="status"></p>
      <button class="icon-btn" id="jClose" type="button" aria-label="노트 닫기">×</button>
    </header>
    <aside class="jside">
      <div class="jtabs" role="tablist" aria-label="노트 메뉴">
        <button class="jtab" role="tab" type="button" data-tab="lib" id="jtab-lib" style="--tabc:${TAB_COLORS.lib}">나의 서재<span class="n"></span></button>
        <button class="jtab" role="tab" type="button" data-tab="memo" id="jtab-memo" style="--tabc:${TAB_COLORS.memo}">메모<span class="n"></span></button>
        <button class="jtab" role="tab" type="button" data-tab="box" id="jtab-box" style="--tabc:${TAB_COLORS.box}">보관·백업</button>
      </div>
      <div><h4>나라별 기록</h4><div class="jcountries" id="jCountries"></div></div>
    </aside>
    <div class="jmain" id="jMain" role="tabpanel"></div>
  </div>
</section>
<div class="jmodal" id="jModal" hidden><div class="jsheet" role="dialog" aria-modal="true" aria-labelledby="jmTitle">
  <header><h3 id="jmTitle"></h3><button class="icon-btn" type="button" id="jmClose" aria-label="작성 닫기">×</button></header>
  <form class="jform" id="jForm" novalidate></form>
</div></div>
<div class="jconfirm" id="jConfirm" hidden><div class="jsheet" role="alertdialog" aria-modal="true" aria-labelledby="jcTitle" aria-describedby="jcMsg">
  <header><h3 id="jcTitle"></h3></header><p id="jcMsg"></p>
  <div class="jfoot"><button class="jadd ghost" type="button" id="jcNo">취소</button><button class="jadd" type="button" id="jcYes">확인</button></div>
</div></div>`;
  while (root.firstElementChild) document.body.appendChild(root.firstElementChild);
  // 노트와 작성 창도 머리를 끌어 옮기고, 오른쪽 아래 모서리로 크기를 바꾼다(index.html의 floatPanel)
  //  지도 쪽 코드가 아직 준비 전이면 줄에 세워 두고, 준비되면 지도 쪽에서 등록한다
  [[$(".jbook"), { handle: ".jhead", fixH: true, minW: 360, minH: 320 }],
   [$("#jModal .jsheet"), { handle: "header", minW: 320, minH: 240 }]].forEach(([el, o]) => {
    if (ATLAS.floatPanel) ATLAS.floatPanel(el, o);
    else (ATLAS.fpQueue = ATLAS.fpQueue || []).push([el, o]);
  });

  // 상단 메뉴 버튼
  const topbar = $(".topbar");
  const jbtn = document.createElement("button");
  jbtn.className = "journal-btn";
  jbtn.type = "button";
  jbtn.id = "journalBtn";
  jbtn.setAttribute("aria-label", "문학 탐험 노트 열기");
  jbtn.innerHTML = `${NOTE_ICON}<span class="jl">탐험 노트</span><span class="jn" id="jBtnN"></span>`;
  const barSlot = $("#barSlot");
  if (topbar) topbar.insertBefore(jbtn, barSlot || null);

  /* ───────── 사진 크게 보기(누르거나 Esc로 닫는다) ───────── */
  function showLight(src) {
    closeLight();
    const d = document.createElement("div");
    d.className = "jlight";
    d.setAttribute("role", "dialog"); d.setAttribute("aria-label", "사진 크게 보기");
    d.innerHTML = `<img src="${esc(src)}" alt="붙인 사진"><button type="button" class="pc-x" aria-label="닫기">×</button>`;
    d.onclick = closeLight;
    document.body.appendChild(d);
    d.querySelector("button").focus();
  }
  function closeLight() { const d = $(".jlight"); if (d) { d.remove(); return true; } return false; }

  /* ───────── 확인 창(브라우저 confirm 대신) ───────── */
  function askConfirm(title, msg, yes) {
    return new Promise((resolve) => {
      const box = $("#jConfirm");
      $("#jcTitle").textContent = title;
      $("#jcMsg").textContent = msg;
      $("#jcYes").textContent = yes || "확인";
      box.hidden = false;
      const done = (v) => { box.hidden = true; $("#jcYes").onclick = $("#jcNo").onclick = null; resolve(v); };
      $("#jcYes").onclick = () => done(true);
      $("#jcNo").onclick = () => done(false);
      $("#jcNo").focus();
    });
  }

  /* ───────── 노트 화면 ───────── */
  const J = { tab: "lib", q: "", country: "", status: "", cat: "", fav: false, book: "" };
  const jEl = $("#journal");
  let jLastFocus = null;
  function openJournal(opts) {
    Object.assign(J, { q: "", status: "", cat: "", fav: false, book: "" }, opts || {});
    if (!["lib", "memo", "box"].includes(J.tab)) J.tab = "lib";
    if (!jEl.hidden) { renderJournal(); return; }
    jLastFocus = document.activeElement;
    jEl.hidden = false;
    document.body.classList.add("jopen");
    renderJournal();
    $("#jClose").focus({ preventScroll: true });
  }
  function closeJournal() {
    if (jEl.hidden) return;
    jEl.hidden = true;
    document.body.classList.remove("jopen");
    if (jLastFocus && document.body.contains(jLastFocus)) jLastFocus.focus({ preventScroll: true });
  }
  jbtn.onclick = () => openJournal();
  $("#jClose").onclick = closeJournal;
  $$(".jtab").forEach((b) => { b.onclick = () => { J.tab = b.dataset.tab; J.q = ""; J.book = ""; renderJournal(); }; });

  function storeLabel() {
    const n = store.items.size;
    if (store.mode === "db") return ["db", `claude.ai 계정에 저장 중 · 기록 ${n}개 · 같은 계정으로 연 기기에서 함께 보이고, 다른 사람은 볼 수 없어요`];
    if (store.mode === "file") return ["db", `설치 폴더에 저장 중 · 기록 ${n}개 · 세계소설지도\\data 폴더에 남아 다음에 열 때도 그대로 보여요`];
    if (store.mode === "local") return ["local", `이 브라우저에만 저장 중 · 기록 ${n}개 · 다른 기기와 동기화되지 않으니 가끔 백업하세요`];
    if (store.mode === "memory") return ["memory", "저장할 수 없는 환경이에요 · 페이지를 닫으면 기록이 사라집니다. 백업 탭에서 내보내 두세요"];
    return ["loading", "저장소를 여는 중…"];
  }
  function countsByCountry() {
    const m = new Map();
    store.items.forEach((it) => {
      if (it.kind !== "lib") return; // 예전 문화·문장 기록은 책 메모로 옮겨지는 중이라 세지 않는다
      const cc = itemCountry(it) || (it.kind === "lib" && it.custom ? "_x" : "");
      const key = cc || "_none";
      m.set(key, (m.get(key) || 0) + 1);
    });
    return m;
  }
  function renderJournal() {
    if (jEl.hidden) return;
    const [cls, label] = storeLabel();
    const s = $("#jStore");
    s.className = "jstore " + cls;
    s.innerHTML = `<i></i><span>${esc(label)}</span>`;
    const counts = { lib: all("lib").length, memo: all("lib").filter(hasMemo).length };
    $$(".jtab").forEach((b) => {
      b.setAttribute("aria-selected", String(b.dataset.tab === J.tab));
      const n = b.querySelector(".n"); if (n) n.textContent = counts[b.dataset.tab] != null ? counts[b.dataset.tab] : "";
    });
    $("#jMain").setAttribute("aria-labelledby", "jtab-" + J.tab);
    const cm = countsByCountry();
    const rows = [["", "모든 나라", all("lib").length]].concat(
      Object.values(C).map((c) => [c.code, c.name, cm.get(c.code) || 0]).filter((r) => r[2] > 0),
      cm.get("_x") || cm.get("_none") ? [["_none", "지도 밖 · 직접 추가", (cm.get("_x") || 0) + (cm.get("_none") || 0)]] : []
    );
    $("#jCountries").innerHTML = rows.map(([cc, name, n]) => `<button class="jcbtn" type="button" data-cc="${esc(cc)}" aria-pressed="${J.country === cc}"><span>${esc(name)}</span><span class="mono">${n}</span></button>`).join("");
    $$("#jCountries .jcbtn").forEach((b) => { b.onclick = () => { J.country = b.dataset.cc; renderJournal(); }; });
    if (J.tab === "box") return renderBox();
    renderTools();
    renderList();
  }

  function matchCountry(it) {
    if (!J.country) return true;
    if (J.country === "_none") return !it.countryCode || !C[it.countryCode];
    return it.countryCode === J.country;
  }
  const hay = (...xs) => xs.flat().filter(Boolean).join(" ").toLowerCase();

  function renderTools() {
    const m = $("#jMain");
    const isLib = J.tab === "lib";
    const extra = isLib ? `<select id="jStatus" aria-label="독서 상태"><option value="">모든 상태</option>${Object.entries(STATUS).map(([k, v]) => `<option value="${k}" ${J.status === k ? "selected" : ""}>${v}</option>`).join("")}</select>` : "";
    m.innerHTML = `
      <div class="jtools">
        <div class="jsb">
          <input class="jsearch" id="jQ" type="search" placeholder="${isLib ? "책 제목, 작가, 감상 검색" : "책 제목, 작가, 메모 내용 검색"}" value="${esc(J.q)}" aria-label="노트 검색" autocomplete="off"
            role="combobox" aria-autocomplete="list" aria-expanded="false" aria-controls="jRes">
          <div class="results jres" id="jRes" role="listbox" aria-label="연관 검색어" hidden></div>
        </div>
        ${extra}
        ${isLib ? `<button class="jadd" type="button" id="jAdd">+ 직접 책 추가</button>` : ""}
      </div>
      ${isLib ? "" : `<p class="jhint">서재 카드나 작품 상세창의 「메모」를 누르면 그 책의 메모장이 열려요. 메모장 위의 [문화]·[문장] 탭에서 자유롭게 적으세요.</p>`}
      <p class="jcount" id="jCount"></p>
      <div id="jList"></div>`;
    $("#jQ").addEventListener("input", (e) => { J.q = e.target.value; renderList(); renderSuggest(); });
    bindSuggest();
    const so = $("#jStatus"); if (so) so.onchange = () => { J.status = so.value; renderList(); };
    const add = $("#jAdd"); if (add) add.onclick = () => openLibForm(null, { custom: true });
  }

  /* ───────── 연관 검색어 ─────────
     메인 검색창처럼 입력하는 동안 아래에 띄운다: 내 기록(지금 탭) → 작가 → 지도의 작품.
     기록·작가를 고르면 그 말로 목록을 거르고, 지도의 작품을 고르면 그 작품으로 새 기록을 시작한다
     (서재에 이미 있는 책이면 목록에서 그 책을 찾아 준다). */
  const ALL_BOOKS = Object.values(C).flatMap((c) => (c.books || []).map((b) => ({ b, c })));
  const squash = (s) => String(s == null ? "" : s).toLowerCase().replace(/\s+/g, "");
  function hlq(text, q) {
    const t = String(text || ""), i = t.toLowerCase().indexOf(q.trim().toLowerCase());
    if (!q.trim() || i < 0) return esc(t);
    const L = q.trim().length;
    return esc(t.slice(0, i)) + "<mark>" + esc(t.slice(i, i + L)) + "</mark>" + esc(t.slice(i + L));
  }
  function suggest(q) {
    const n = squash(q);
    if (!n) return [];
    const has = (v) => (Array.isArray(v) ? v : [v]).some((x) => squash(x).includes(n));
    const groups = [];
    const mine = [];
    const isMemo = J.tab === "memo";
    all("lib").filter(matchCountry).filter((it) => !isMemo || hasMemo(it)).forEach((it) => {
      const b = itemBook(it);
      const fields = isMemo ? [b.t, b.a, b.country, memoPlain(it.memo.cul), memoPlain(it.memo.quo)] : [b.t, b.a, it.review, b.country];
      if (!fields.some(has)) return;
      mine.push({ type: "filter", label: b.t, sub: [b.a, b.country].filter(Boolean).join(" · "), q: b.t });
    });
    if (mine.length) groups.push({ label: "내 기록", items: mine.slice(0, 5) });
    const authors = new Map();
    ALL_BOOKS.forEach(({ b }) => { if (b.a && has(b.a)) authors.set(b.a, (authors.get(b.a) || 0) + 1); });
    all("lib").forEach((it) => { const a = itemBook(it).a; if (a && has(a) && !authors.has(a)) authors.set(a, 0); });
    const as = [...authors].sort((x, y) => y[1] - x[1]).slice(0, 4);
    if (as.length) groups.push({ label: "작가", items: as.map(([a, cnt]) => ({ type: "filter", label: a, sub: cnt ? `지도에 ${cnt}편` : "", q: a })) });
    const bs = ALL_BOOKS.filter(({ b }) => has(b.t) || has(b.o) || has(b.a))
      .map((x) => ({ x, s: squash(x.b.t).startsWith(n) ? 0 : has(x.b.t) ? 1 : 2 }))
      .sort((p, r) => p.s - r.s).slice(0, 7).map(({ x }) => x);
    if (bs.length) {
      groups.push({ label: "지도의 작품", items: bs.map(({ b, c }) => {
        const lib = libOf(c.code, b.id);
        const inLib = !isMemo && !!lib;
        const act = isMemo ? (lib && hasMemo(lib) ? "메모 열기" : "+ 메모") : inLib ? "서재에 있음" : "+ 서재에 담기";
        return { type: "book", label: b.t, sub: [b.a, b.y].filter(Boolean).join(" · "), n: c.name, act, cc: c.code, id: b.id, inLib };
      }) });
    }
    return groups;
  }
  let sFlat = [], sActive = -1;
  function closeSuggest() {
    const r = $("#jRes"), qi = $("#jQ");
    if (r) r.hidden = true;
    if (qi) { qi.setAttribute("aria-expanded", "false"); qi.removeAttribute("aria-activedescendant"); }
    sActive = -1;
  }
  function renderSuggest() {
    const r = $("#jRes"), qi = $("#jQ");
    if (!r || !qi) return;
    const q = qi.value;
    sFlat = [];
    if (!q.trim()) { closeSuggest(); return; }
    const groups = suggest(q);
    r.innerHTML = groups.length ? groups.map((g) => `<div class="rg">${esc(g.label)}</div>` + g.items.map((it) => {
      const i = sFlat.push(it) - 1;
      return `<button type="button" class="ri" role="option" id="jr${i}" data-i="${i}" aria-selected="false">` +
        `<span class="m">${hlq(it.label, q)}</span>${it.sub ? `<span class="s">${hlq(it.sub, q)}</span>` : ""}` +
        `${it.act ? `<span class="act">${esc(it.act)}</span>` : ""}${it.n ? `<span class="n">${esc(it.n)}</span>` : ""}</button>`;
    }).join("")).join("")
      : `<div class="r-empty">‘${esc(q)}’에 맞는 기록이나 작품이 없어요.</div>`;
    r.hidden = false;
    qi.setAttribute("aria-expanded", "true");
    sActive = -1;
    $$(".ri", r).forEach((el) => {
      el.onmousedown = (e) => e.preventDefault(); // 고르기 전에 입력창이 흐려져 목록이 닫히지 않게
      el.onclick = () => pickSuggest(sFlat[+el.dataset.i]);
    });
  }
  function setSuggestActive(i) {
    const r = $("#jRes"), items = r ? $$(".ri", r) : [];
    if (!items.length) return;
    sActive = (i + items.length) % items.length;
    items.forEach((el, j) => el.setAttribute("aria-selected", j === sActive ? "true" : "false"));
    items[sActive].scrollIntoView({ block: "nearest" });
    $("#jQ").setAttribute("aria-activedescendant", items[sActive].id);
  }
  function pickSuggest(it) {
    if (!it) return;
    closeSuggest();
    const qi = $("#jQ");
    if (it.type === "book" && J.tab === "memo") { memoForBook(it.cc, it.id); return; }
    if (it.type === "book" && !it.inLib) { openLibForm(null, { countryCode: it.cc, bookId: it.id }); return; }
    J.q = it.type === "book" ? it.label : it.q;
    qi.value = J.q;
    renderList();
  }
  function bindSuggest() {
    const qi = $("#jQ");
    qi.addEventListener("focus", renderSuggest);
    qi.addEventListener("blur", () => setTimeout(closeSuggest, 120));
    qi.addEventListener("keydown", (e) => {
      const open = !$("#jRes").hidden;
      if (e.key === "ArrowDown") { e.preventDefault(); if (!open) renderSuggest(); setSuggestActive(sActive + 1); }
      else if (e.key === "ArrowUp" && open) { e.preventDefault(); setSuggestActive(sActive - 1); }
      else if (e.key === "Enter" && open && sActive >= 0) { e.preventDefault(); pickSuggest(sFlat[sActive]); }
      // Esc는 아래 노트 전체의 Esc 처리(캡처 단계)에서 목록부터 닫는다
    });
  }

  function renderList() {
    const list = $("#jList");
    if (!list) return;
    const q = J.q.trim().toLowerCase();
    const isMemo = J.tab === "memo";
    const pool = all("lib").filter((x) => !isMemo || hasMemo(x));
    let items = pool.filter(matchCountry);
    if (!isMemo) {
      if (J.status) items = items.filter((x) => x.status === J.status);
      if (q) items = items.filter((x) => { const b = itemBook(x); return hay(b.t, b.a, x.review, b.country).includes(q); });
      const ord = { reading: 0, want: 1, done: 2 };
      items.sort((a, b) => ord[a.status] - ord[b.status] || b.updatedAt.localeCompare(a.updatedAt));
    } else {
      if (q) items = items.filter((x) => { const b = itemBook(x); return hay(b.t, b.a, b.country, memoPlain(x.memo.cul), memoPlain(x.memo.quo)).includes(q); });
      items.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    }
    const total = pool.length;
    $("#jCount").textContent = total ? `${items.length}개 표시 · 전체 ${total}개` : "";
    if (!items.length) {
      const empty = isMemo
        ? ["아직 메모가 없어요", "서재 카드나 작품 상세창의 「메모」를 눌러 책마다 문화 이야기와 마음에 남은 문장을 자유롭게 적어 보세요."]
        : ["서재가 비어 있어요", "지도에서 작품을 열고 「내 서재에 담기」를 누르거나, 위의 「직접 책 추가」로 지도에 없는 책도 담을 수 있어요."];
      list.innerHTML = `<div class="jempty"><b>${total ? "조건에 맞는 기록이 없어요" : empty[0]}</b>${total ? "검색어나 필터를 바꿔 보세요." : esc(empty[1])}</div>`;
      return;
    }
    list.innerHTML = `<div class="jgrid">${items.map((it) => (isMemo ? memoCard(it) : libCard(it))).join("")}</div>`;
    bindCards(list);
  }

  const stars = (n) => `<span class="jstars" aria-label="별점 ${n}점">${"★".repeat(n)}<span class="off">${"★".repeat(5 - n)}</span></span>`;
  const SPINES = ["#df5a4a", "#2f8d99", "#f2b33d", "#8a6fb3", "#6aa9c9", "#b98e69"];
  const spineFor = (cc) => SPINES[Math.abs([...String(cc || "x")].reduce((a, ch) => a + ch.charCodeAt(0), 0)) % SPINES.length];

  function libCard(it) {
    const b = itemBook(it);
    const pct = it.totalPages ? Math.min(100, Math.round(((it.currentPage || 0) / it.totalPages) * 100)) : (it.status === "done" ? 100 : null);
    const dates = [it.startDate && `시작 ${it.startDate}`, it.endDate && `완독 ${it.endDate}`].filter(Boolean).join(" · ");
    // 카드는 모두 같은 크기: 독서 상태·제목·진행률만 보이고, 마우스를 올리거나(눌러) 고르면 아래로 펼쳐져 나머지가 보인다
    return `<div class="jslot"><article class="jcard jlib${it.coverAssetId ? " hascover" : ""}" style="--spine:${spineFor(it.countryCode)}" data-id="${esc(it.id)}" tabindex="0" aria-label="${esc(b.t)} · ${STATUS[it.status]}${pct != null ? ` · ${pct}%` : ""}">
      <span class="jpill ${it.status}">${STATUS[it.status]}</span>
      <h5 title="${esc(b.t)}">${esc(b.t)}</h5>
      <div class="jrate"><div class="jprog" role="progressbar" aria-valuenow="${pct || 0}" aria-valuemin="0" aria-valuemax="100" aria-label="독서 진행률"><i style="width:${pct || 0}%"></i></div><span>${pct != null ? `${pct}%` : "—"}</span></div>
      <div class="jmore">
        ${it.coverAssetId ? `<img class="jcover-th" src="/_blob/${esc(it.coverAssetId)}" alt="${esc(b.t)} 표지" loading="lazy" onerror="this.remove()">` : ""}
        <p class="meta">${esc([b.a, b.y, b.country].filter(Boolean).join(" · "))}</p>
        ${it.custom ? `<span class="jcustom">직접 추가한 책 · 지도에 없음</span>` : ""}
        ${it.totalPages ? `<p class="meta">${it.currentPage || 0} / ${it.totalPages}쪽</p>` : ""}
        ${dates ? `<p class="meta">${esc(dates)}</p>` : ""}
        ${it.rating ? stars(it.rating) : ""}
        ${it.review ? `<p class="txt">${esc(it.review)}</p>` : ""}
        <div class="acts">
          <button type="button" data-act="edit">기록 수정</button>
          ${b.b ? `<button type="button" data-act="book">작품 보기</button>` : ""}
          <button type="button" data-act="memo">메모${hasMemo(it) ? " ✎" : ""}</button>
          <button type="button" class="del" data-act="del">삭제</button>
        </div>
      </div></article></div>`;
  }
  // 메모 탭의 카드: 책 정보와 [문화]·[문장] 메모 앞부분
  function memoCard(it) {
    const b = itemBook(it);
    const part = (label, text) => text.trim() ? `<div class="jmp"><b>${label}</b><p>${esc(text.trim().slice(0, 400))}</p></div>` : "";
    return `<article class="jcard jlib jmemocard" style="--spine:${spineFor(it.countryCode)}" data-id="${esc(it.id)}">
      <h5>${esc(b.t)}</h5>
      <p class="meta">${esc([b.a, b.y, b.country].filter(Boolean).join(" · "))}</p>
      ${part("문화", memoPlain(it.memo.cul))}${part("문장", memoPlain(it.memo.quo))}
      ${memoImgCount(it) ? `<div class="jmcthumbs">${[...it.memo.imgs.cul, ...it.memo.imgs.quo].slice(0, 4).map((id) => `<img src="/_blob/${esc(id)}" alt="" loading="lazy" onerror="this.remove()">`).join("")}<span>사진 ${memoImgCount(it)}장</span></div>` : ""}
      <p class="meta">고친 날 ${esc(it.updatedAt.slice(0, 10))}</p>
      <div class="acts">
        <button type="button" data-act="memo">메모 열기</button>
        ${b.b ? `<button type="button" data-act="book">작품 보기</button>` : ""}
      </div></article>`;
  }
  function bindCards(list) {
    $$(".jcard", list).forEach((card) => {
      const it = store.items.get(card.dataset.id);
      if (!it) return;
      $$("[data-act]", card).forEach((btn) => {
        btn.onclick = () => cardAction(btn.dataset.act, it);
      });
    });
  }
  async function cardAction(act, it) {
    const b = itemBook(it);
    if (act === "edit") return openLibForm(it);
    if (act === "book" && b.b) return APP.openBook(b.cc, b.b.id);
    if (act === "memo") return openMemo(it);
    if (act === "del") {
      const memoNote = hasMemo(it) ? "\n이 책에 적은 메모도 함께 지워집니다." : "";
      if (!(await askConfirm("기록 삭제", `『${b.t}』${objJosa(b.t)} 서재에서 뺄까요?${memoNote}\n지운 기록은 되돌릴 수 없습니다.`, "삭제"))) return;
      try { await removeItem(it.id); toast("삭제했습니다."); } catch (e) { toast(e.message); }
    }
  }
  function objJosa(w) { const ch = String(w).trim().slice(-1).charCodeAt(0); return ch >= 0xac00 && ch <= 0xd7a3 ? ((ch - 0xac00) % 28 ? "을" : "를") : "을(를)"; }

  /* ───────── 메모: 책마다 자유롭게 적는 메모장 ─────────
     위쪽 [문화] · [문장] 탭을 오가며 적는다. 적는 동안 잠시 멈추면 저장하고, 「저장」을 누르면 저장하고 닫는다. */
  // 메모 글 속 사진 자리 표시 [[사진:id]] · 크기를 바꾼 사진은 [[사진:id|너비px]]
  // 사진 id 뽑기 · 표시를 뺀 글(검색·카드 미리 보기용)
  const memoIds = (s) => [...new Set([...String(s || "").matchAll(/\[\[사진:([0-9a-f]{32})(?:\|\d{2,4})?\]\]/g)].map((m) => m[1]))].slice(0, 30);
  const memoPlain = (s) => String(s || "").replace(/\[\[사진:[0-9a-f]{32}(?:\|\d{2,4})?\]\]/g, "").replace(/\n{3,}/g, "\n\n").trim();
  const imgTok = (id, w) => `[[사진:${id}${w ? "|" + w : ""}]]`;
  const pendRe = (n, nl) => new RegExp(`${nl ? "\\n?" : ""}\\[\\[사진:pending-${n}(?:\\|\\d+)?\\]\\]`, "g");
  let memoCloser = null; // 열린 메모 창을 닫을 때 마지막 저장·정리
  const memoImgCount = (it) => (it && it.memo && it.memo.imgs ? it.memo.imgs.cul.length + it.memo.imgs.quo.length : 0);
  const hasMemo = (it) => !!(it && it.kind === "lib" && it.memo && (it.memo.cul.trim() || it.memo.quo.trim() || memoImgCount(it)));
  const MEMO_TABS = [
    ["cul", "문화", "책에서 만난 음식·건축·음악·옷차림·풍습 같은 문화 이야기, 찾아본 내용과 새로 알게 된 점을 자유롭게 적어 보세요."],
    ["quo", "문장", "마음에 남은 문장을 옮겨 적고(쪽수도 함께), 그 문장을 읽고 떠오른 생각을 자유롭게 적어 보세요."]
  ];
  // 지도의 작품에서 메모 열기: 서재에 없으면 「읽고 싶은 책」으로 담은 뒤 연다
  async function memoForBook(cc, id) {
    let lib = libOf(cc, id);
    if (!lib) {
      try { lib = await putItem({ id: libId(cc, id), kind: "lib", countryCode: cc, bookId: id, status: "want", createdAt: new Date().toISOString() }); toast("서재에 담고 메모를 엽니다 · 읽고 싶은 책"); }
      catch (e) { toast(e.message); return; }
    }
    openMemo(lib);
  }
  function openMemo(it, startTab) {
    const b = itemBook(it);
    let tab = startTab || (it.memo.cul.trim() || !it.memo.quo.trim() ? "cul" : "quo");
    const html = `
      <div class="jmtabs"><div class="jmtablist" role="tablist" aria-label="메모 종류">${MEMO_TABS.map(([k, label]) =>
        `<button type="button" role="tab" class="jmtab" data-m="${k}" aria-selected="${k === tab}">${label}</button>`).join("")}</div>
        <div class="jgsearch" role="search">
          <svg width="16" height="16" viewBox="0 0 18 18" aria-hidden="true"><circle cx="7.5" cy="7.5" r="5.5" fill="none" stroke="currentColor" stroke-width="1.7"/><path d="M11.6 11.6 16 16" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>
          <input type="search" id="jgQ" placeholder="구글에서 찾아보기" aria-label="구글 검색어" autocomplete="off">
          <button type="button" id="jgGo">검색</button>
        </div></div>
      ${MEMO_TABS.map(([k, label, ph]) => `<div class="jmemo" data-m="${k}" contenteditable="true" role="textbox" aria-multiline="true" aria-label="${label} 메모" data-ph="${esc(ph)}" spellcheck="false" ${k === tab ? "" : "hidden"}></div>`).join("")}
      <div class="jmimgbar"><button type="button" class="jadd ghost" id="jmPick">사진 넣기</button>
        <span class="hint">캡처한 화면·이미지를 메모 칸의 원하는 곳에 <kbd>Ctrl</kbd>+<kbd>V</kbd>로 붙여 넣거나 끌어다 놓고, 그 아래에 설명을 이어 적으세요.</span>
        <input type="file" id="jmFile" accept="image/png,image/jpeg,image/gif,image/webp" multiple hidden></div>
      <p class="jmemo-meta"><span id="jmMeta">${esc([b.a, b.country].filter(Boolean).join(" · "))}</span><span id="jmSaved"></span></p>`;
    /* 메모 칸 안에 사진을 넣는다. 저장은 글 그대로이고, 사진 자리는 한 줄짜리 표시 [[사진:id]]로 남긴다
       (예전 버전에서 칸 아래에 따로 붙였던 사진은 그 장의 끝으로 옮긴다).
       숨긴 장은 글자를 읽을 수 없으므로, 장마다 마지막으로 읽은 글을 text[k]에 담아 둔다. */
    const text = {};
    MEMO_TABS.forEach(([k]) => {
      const t = it.memo[k] || "", have = new Set(memoIds(t));
      const extra = it.memo.imgs[k].filter((id) => !have.has(id));
      text[k] = extra.length ? (t.replace(/\s+$/, "") + "\n" + extra.map((id) => `[[사진:${id}]]`).join("\n")).replace(/^\n/, "") : t;
    });
    const memoOf = () => {
      const m = {};
      MEMO_TABS.forEach(([k]) => { m[k] = text[k].replace(pendRe("\\d+", true), ""); });
      m.imgs = { cul: memoIds(m.cul), quo: memoIds(m.quo) };
      return m;
    };
    const ed = {};
    const readTab = (k) => { if (ed[k] && !ed[k].hidden && ed[k].isConnected) text[k] = ed[k].innerText.replace(/ /g, " ").replace(/\s+$/, ""); };
    const jobs = new Set(), seen = new Set([...it.memo.imgs.cul, ...it.memo.imgs.quo, ...memoIds(text.cul), ...memoIds(text.quo)]);
    let timer = 0, closed = false, lastSaved = JSON.stringify({ cul: it.memo.cul, quo: it.memo.quo, imgs: it.memo.imgs });
    const status = (t) => { const s = $("#jmSaved"); if (s) s.textContent = t; };
    const save = async (quiet) => {
      const memo = memoOf(), key = JSON.stringify(memo);
      if (key === lastSaved) return;
      const latest = store.items.get(it.id) || it;
      await putItem(Object.assign({}, latest, { memo }));
      lastSaved = key;
      if (quiet) status("자동 저장됨 " + new Date().toTimeString().slice(0, 5));
    };
    const queueSave = () => {
      clearTimeout(timer);
      timer = setTimeout(() => { readTab(tab); save(true).catch((e) => status(e.message)); }, 1200);
    };
    // 창을 닫을 때: 남은 사진이 다 올라가면 마지막으로 저장하고, 메모에서 뺀 사진은 저장소에서도 지운다
    async function finish() {
      if (jobs.size) await Promise.allSettled([...jobs]);
      await save(false);
      const keep = new Set([...memoIds(text.cul), ...memoIds(text.quo)]);
      for (const id of seen) if (!keep.has(id) && store.assets) { try { await store.assets.delete(id); } catch (e) { /* 이미 없음 */ } }
    }
    // 사진 하나(메모 칸 안의 한 덩어리). 지우기·크기 단추는 글로 읽히지 않게 그림 글자(::before)로만 그린다
    // 오른쪽 아래 모서리를 끌면 크기가 바뀌고(너비를 표시에 함께 저장), 두 번 누르면 처음 크기로
    function makeFig(id, w, src) {
      const fig = document.createElement("figure");
      fig.className = "jmfig";
      fig.contentEditable = "false";
      fig.dataset.id = id;
      if (w) fig.dataset.w = w;
      fig.innerHTML = `<img alt="붙인 사진" draggable="false"><span class="jmfig-k" aria-hidden="true"></span>` +
        `<span class="jmfig-r" role="slider" aria-label="사진 크기 (끌어서 조절, 두 번 누르면 처음 크기)" title="끌어서 크기 조절 · 두 번 누르면 처음 크기"></span>` +
        `<button type="button" class="jmfig-x" aria-label="사진 빼기" title="사진 빼기"></button>`;
      const img = fig.querySelector("img"), grip = fig.querySelector(".jmfig-r");
      const host = () => fig.closest(".jmemo");
      const changed = () => { const h = host(); if (h) { readTab(h.dataset.m); h.dispatchEvent(new Event("input")); } };
      const apply = () => {
        const v = Number(fig.dataset.w) || 0;
        img.style.width = v ? v + "px" : "";
        img.style.maxWidth = v ? "100%" : "";
        img.style.maxHeight = v ? "none" : "";
        fig.querySelector(".jmfig-k").textContent = imgTok(fig.dataset.id, v);
      };
      fig._apply = apply;
      apply();
      img.src = src;
      img.onclick = () => showLight(img.src);
      grip.addEventListener("pointerdown", (e) => {
        if (e.button !== 0) return;
        e.preventDefault(); e.stopPropagation();
        const h = host(), max = Math.max(80, (h ? h.clientWidth : 1200) - 44);
        const x0 = e.clientX, w0 = img.getBoundingClientRect().width, pid = e.pointerId;
        fig.classList.add("sizing");
        const mv = (ev) => { if (ev.pointerId === pid) { fig.dataset.w = Math.round(Math.min(Math.max(60, w0 + ev.clientX - x0), max, 1600)); apply(); } };
        const up = (ev) => {
          if (ev.pointerId !== pid) return;
          removeEventListener("pointermove", mv); removeEventListener("pointerup", up); removeEventListener("pointercancel", up);
          fig.classList.remove("sizing");
          changed();
        };
        addEventListener("pointermove", mv); addEventListener("pointerup", up); addEventListener("pointercancel", up);
      });
      grip.addEventListener("dblclick", (e) => { e.preventDefault(); delete fig.dataset.w; apply(); changed(); });
      fig.querySelector(".jmfig-x").onclick = () => { const h = host(); fig.remove(); if (h) { readTab(h.dataset.m); h.dispatchEvent(new Event("input")); } };
      return fig;
    }
    function fillEditor(el, t) {
      el.textContent = "";
      const parts = t.split(/(\[\[사진:[0-9a-f]{32}(?:\|\d{2,4})?\]\])/);
      parts.forEach((p, i) => {
        const m = /^\[\[사진:([0-9a-f]{32})(?:\|(\d{2,4}))?\]\]$/.exec(p);
        if (m) { el.appendChild(makeFig(m[1], m[2] ? Number(m[2]) : 0, `/_blob/${m[1]}`)); return; }
        // 사진은 그 자체로 한 줄이라, 사진 앞뒤의 줄바꿈 하나씩은 사진이 대신한다
        let s = p;
        if (i > 0) s = s.replace(/^\n/, "");
        if (i < parts.length - 1) s = s.replace(/\n$/, "");
        if (s) el.appendChild(document.createTextNode(s));
      });
      if (el.lastChild && el.lastChild.nodeName === "FIGURE") el.appendChild(document.createElement("br")); // 마지막 사진 아래에도 적을 수 있게
      syncEmpty(el);
    }
    const syncEmpty = (el) => el.classList.toggle("is-empty", !el.textContent.trim() && !el.querySelector(".jmfig"));
    // 커서가 있던 자리(사진 넣기 단추를 눌러도 기억). 없으면 칸 끝
    const lastRange = {};
    document.addEventListener("selectionchange", function track() {
      if (closed) { document.removeEventListener("selectionchange", track); return; }
      const s = getSelection();
      if (s.rangeCount && ed[tab] && ed[tab].contains(s.getRangeAt(0).startContainer)) lastRange[tab] = s.getRangeAt(0).cloneRange();
    });
    function insertFig(k, fig, at) {
      const el = ed[k];
      let r = at || (lastRange[k] && el.contains(lastRange[k].startContainer) ? lastRange[k] : null);
      if (!r) { r = document.createRange(); r.selectNodeContents(el); r.collapse(false); }
      r.deleteContents();
      r.insertNode(fig);
      const nx = fig.nextSibling;
      if (!nx || nx.nodeName === "FIGURE" || (nx.nodeType === 3 && !nx.nodeValue)) fig.after(document.createElement("br"));
      const after = document.createRange();
      after.setStartAfter(fig); after.collapse(true);
      const s = getSelection(); s.removeAllRanges(); s.addRange(after);
      lastRange[k] = after.cloneRange();
      el.focus();
      syncEmpty(el);
    }
    // 사진을 올리며 커서 자리에 넣는다(붙여 넣기·끌어다 놓기·사진 넣기 공통). 올리는 동안은 미리 보기로 먼저 보인다
    let pendN = 0;
    function addFiles(k, files, at) {
      const list = [...(files || [])].filter((fl) => /^image\/(png|jpeg|gif|webp)$/.test(fl.type));
      if (!list.length) return false;
      if (!store.assets) { status("지금 저장 방식(이 브라우저에만 저장)에서는 사진을 넣을 수 없어요. 글만 저장돼요."); return true; }
      for (const fl of list) {
        if (fl.size > 20 * 1024 * 1024) { status("사진은 20MB 이하만 넣을 수 있어요."); continue; }
        if (ed[k].querySelectorAll(".jmfig").length >= 30) { status("한 장에 사진은 30장까지 넣을 수 있어요."); break; }
        const n = ++pendN, url = URL.createObjectURL(fl);
        const fig = makeFig(`pending-${n}`, 0, url);
        fig.classList.add("up");
        insertFig(k, fig, at); at = null;
        readTab(k);
        status("사진 올리는 중…");
        const job = store.assets.upload(fl).then((up) => {
          seen.add(up.id);
          fig.dataset.id = up.id;
          fig._apply();
          fig.classList.remove("up");
          text[k] = text[k].replace(pendRe(n), imgTok(up.id, Number(fig.dataset.w) || 0)); // 창을 닫은 뒤에 끝나도 저장되게
          readTab(k);
          status("사진을 넣었어요 · 아래에 설명을 적어 보세요");
          if (closed) save(true).catch(() => {}); else queueSave();
        }).catch(() => {
          fig.remove();
          text[k] = text[k].replace(pendRe(n, true), "");
          readTab(k);
          status("사진을 올리지 못했어요. 잠시 뒤 다시 해 보세요.");
        }).finally(() => { jobs.delete(job); setTimeout(() => URL.revokeObjectURL(url), 60000); });
        jobs.add(job);
      }
      return true;
    }
    if (memoCloser) { const f = memoCloser; memoCloser = null; f(); }
    memoCloser = () => { closed = true; clearTimeout(timer); readTab(tab); finish().catch(() => {}); };
    openModal(`메모 · ${b.t}`, html, async () => {
      clearTimeout(timer);
      readTab(tab);
      if (jobs.size) { status("사진을 마저 올리는 중…"); await Promise.allSettled([...jobs]); }
      await save(false);
      return "메모를 저장했습니다.";
    }, () => {
      $$(".jmtab", form).forEach((t) => {
        t.onclick = () => {
          readTab(tab); // 숨기기 전에 지금 장의 글을 담아 둔다
          tab = t.dataset.m;
          $$(".jmtab", form).forEach((x) => x.setAttribute("aria-selected", String(x === t)));
          $$(".jmemo", form).forEach((x) => { x.hidden = x.dataset.m !== tab; });
          ed[tab].focus();
        };
      });
      $$(".jmemo", form).forEach((el) => {
        const k = el.dataset.m;
        ed[k] = el;
        fillEditor(el, text[k]);
        el.addEventListener("input", () => { syncEmpty(el); readTab(k); status("적는 중…"); queueSave(); });
        // 붙여 넣기(Ctrl+V): 이미지가 있으면 그 자리에 사진으로, 글은 꾸밈 없이 글로만 넣는다
        el.addEventListener("paste", (e) => {
          const cd = e.clipboardData;
          if (!cd) return;
          e.preventDefault();
          const fs = [...cd.files];
          if (fs.some((fl) => /^image\//.test(fl.type))) { addFiles(k, fs); return; }
          const t = cd.getData("text/plain");
          if (t) document.execCommand("insertText", false, t);
        });
        el.addEventListener("dragover", (e) => { if (e.dataTransfer && [...e.dataTransfer.types].includes("Files")) { e.preventDefault(); el.classList.add("drop"); } });
        el.addEventListener("dragleave", () => el.classList.remove("drop"));
        el.addEventListener("drop", (e) => {
          el.classList.remove("drop");
          if (!e.dataTransfer || !e.dataTransfer.files.length) return;
          e.preventDefault();
          const at = document.caretRangeFromPoint ? document.caretRangeFromPoint(e.clientX, e.clientY) : null;
          addFiles(k, e.dataTransfer.files, at && el.contains(at.startContainer) ? at : null);
        });
      });
      const file = $("#jmFile", form);
      $("#jmPick", form).onclick = () => file.click();
      file.onchange = () => { addFiles(tab, file.files); file.value = ""; };
      // 구글 검색: 새 창으로 구글 결과를 연다. 비워 두면 이 책의 제목과 작가로 찾는다.
      // (Enter가 메모 저장·닫기로 넘어가지 않게 막는다)
      const gq = $("#jgQ", form);
      const google = () => {
        const q = gq.value.trim() || [b.t, b.a].filter(Boolean).join(" ");
        const a = document.createElement("a");
        a.href = "https://www.google.com/search?q=" + encodeURIComponent(q);
        a.target = "_blank"; a.rel = "noopener noreferrer";
        document.body.appendChild(a); a.click(); a.remove();
      };
      $("#jgGo", form).onclick = google;
      gq.addEventListener("keydown", (e) => { if (e.key === "Enter") { e.preventDefault(); google(); } });
      // 열자마자 메모 칸에 바로 적을 수 있게(작성 창은 첫 입력칸에 초점을 주므로 그 뒤에 옮긴다)
      setTimeout(() => {
        const el = ed[tab], r = document.createRange();
        r.selectNodeContents(el); r.collapse(false);
        el.focus();
        const s = getSelection(); s.removeAllRanges(); s.addRange(r);
      }, 0);
    });
  }

  /* 예전 「문화 탐험 기록」·「문장 수집함」 기록은 그 책의 메모([문화]·[문장])로 한 번 옮긴다.
     작품과 이어지지 않은 기록은 「책 없이 남긴 메모」라는 직접 추가한 책 한 권에 모은다. */
  let migrating = false;
  function oldCulText(o) {
    return [
      `■ ${(CAT[o.category] || CAT.etc).name} · ${o.keyword}${o.page ? ` (${o.page}쪽)` : ""}`,
      o.excerpt, o.description, o.learned && `새로 안 점: ${o.learned}`, o.personalMemo,
      (o.sourceTitle || o.sourceUrl) && `출처: ${[o.sourceTitle, o.sourceUrl].filter(Boolean).join(" ")}`,
      o.tags.length && "#" + o.tags.join(" #"), o.imageAssetId && "(이 기록의 사진은 아래 사진 칸에 붙여 두었어요)"
    ].filter(Boolean).join("\n");
  }
  function oldQuoText(o) {
    return [`“${o.quote}”${o.page ? ` (${o.page}쪽)` : ""}${o.isFavorite ? " ★" : ""}`, o.reflection, o.tags.length && "#" + o.tags.join(" #")].filter(Boolean).join("\n");
  }
  async function migrateOldNotes() {
    if (migrating || !["db", "file", "local", "memory"].includes(store.mode)) return;
    const olds = [...store.items.values()].filter((x) => x.kind === "cul" || x.kind === "quo")
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
    if (!olds.length) return;
    migrating = true;
    let moved = 0;
    try {
      for (const o of olds) {
        let lib = null;
        if (o.bookId && o.bookId.startsWith("custom-")) lib = store.items.get(o.bookId.slice(7)) || null;
        else if (o.countryCode && o.bookId && bookInfo(o.countryCode, o.bookId)) {
          lib = libOf(o.countryCode, o.bookId) || { id: libId(o.countryCode, o.bookId), kind: "lib", countryCode: o.countryCode, bookId: o.bookId, status: "want", createdAt: o.createdAt };
        }
        if (!lib) lib = store.items.get("lib_x_loose") || { id: "lib_x_loose", kind: "lib", status: "want", custom: { title: "책 없이 남긴 메모", author: "", year: "", country: "" }, countryCode: "", bookId: "", createdAt: o.createdAt };
        const memo = Object.assign({ cul: "", quo: "" }, lib.memo);
        const li = (lib.memo && lib.memo.imgs) || {};
        memo.imgs = { cul: (li.cul || []).slice(), quo: (li.quo || []).slice() };
        if (o.imageAssetId) memo.imgs.cul.push(o.imageAssetId); // 예전 기록의 사진은 [문화] 메모의 사진으로
        const text = o.kind === "cul" ? oldCulText(o) : oldQuoText(o);
        memo[o.kind] = memo[o.kind].trim() ? memo[o.kind].replace(/\s+$/, "") + "\n\n" + text : text;
        await putItem(Object.assign({}, lib, { memo }));
        await removeItem(o.id, true); // 붙어 있던 사진 파일은 지우지 않는다
        moved++;
      }
    } catch (e) { /* 다음에 다시 시도한다 */ }
    migrating = false;
    if (moved) toast(`예전 문화·문장 기록 ${moved}개를 책 메모로 옮겼습니다.`);
  }

  /* ───────── 보관·백업 ───────── */
  function renderBox() {
    const m = $("#jMain");
    const n = store.items.size;
    const modeText = {
      db: "지금은 <b>claude.ai 계정의 개인 저장소</b>에 저장하고 있어요. 같은 계정으로 이 페이지를 열면 다른 기기에서도 보이고, 이 페이지를 공유받은 다른 사람(소유자 포함)은 볼 수 없어요.",
      file: "지금은 <b>설치 폴더(세계소설지도\\data)</b>에 저장하고 있어요. 기록은 journal.json, 붙인 사진은 images 폴더에 들어가서 프로그램을 다시 열어도 그대로 불러와요. 폴더를 지우면 기록도 사라지니 가끔 아래에서 내보내 두세요.",
      local: "지금은 <b>이 브라우저(localStorage)</b>에만 저장하고 있어요. 다른 기기나 브라우저와 자동으로 동기화되지 않고, 브라우저 데이터를 지우면 사라져요. 아래에서 정기적으로 내보내 두세요." + (store.assets ? " 붙인 사진도 이 기기 안에만 저장돼요." : ""),
      memory: "지금은 <b>저장할 수 없는 환경</b>이에요. 페이지를 닫으면 기록이 사라지니, 꼭 아래에서 내보내 두세요.",
      loading: "저장소를 여는 중이에요."
    }[store.mode];
    m.innerHTML = `
      <div class="jbox"><h5>저장 방식</h5><p>${modeText}</p>
        ${store.mode === "db" && store.localLeft ? `<p>이 브라우저에 예전에 저장한 기록이 ${store.localLeft}개 남아 있어요.</p><div class="jrow"><button class="jadd ghost" type="button" id="jMigrate">계정 저장소로 옮기기</button></div>` : ""}
      </div>
      <div class="jbox"><h5>내보내기 (JSON 백업)</h5><p>서재·문화 기록·문장 ${n}개를 JSON 파일 하나로 저장해요. 업로드한 사진은 파일에 들어가지 않고 연결 정보만 남아요.</p>
        <div class="jrow"><button class="jadd" type="button" id="jExport" ${n ? "" : "disabled"}>JSON 파일로 내보내기</button><button class="jadd ghost" type="button" id="jShowJson" ${n ? "" : "disabled"}>내용 보기·복사</button></div>
        <textarea id="jJsonOut" readonly hidden aria-label="백업 JSON"></textarea>
      </div>
      <div class="jbox"><h5>가져오기 (복원)</h5><p>내보낸 JSON 파일을 고르거나 내용을 붙여 넣으세요. 같은 기록(같은 ID)은 더 최근에 고친 쪽으로 합치고, 형식이 맞지 않는 항목은 건너뛰어요.</p>
        <div class="jrow"><input type="file" id="jFile" accept="application/json,.json" aria-label="백업 파일 고르기"></div>
        <textarea id="jJsonIn" placeholder="여기에 백업 JSON을 붙여 넣어도 돼요" aria-label="복원할 JSON"></textarea>
        <div class="jrow"><button class="jadd" type="button" id="jImport">가져오기</button><span class="jerr" id="jImpMsg"></span></div>
      </div>`;
    const payload = () => JSON.stringify({ app: "world-fiction-atlas-journal", version: 1, exportedAt: new Date().toISOString(), items: [...store.items.values()] }, null, 2);
    const ex = $("#jExport");
    if (ex) ex.onclick = async () => {
      const name = `문학탐험노트-${today()}.json`;
      if (store.downloads) {
        try { await store.downloads.save({ filename: name, data: payload() }); toast("백업 파일을 저장했습니다."); return; }
        catch (e) { if (e && e.code === "declined") return; }
      }
      // claude.ai 밖(내려받은 설치형 등)에서는 브라우저가 바로 파일로 저장한다
      if (!window.claude) {
        try {
          const a = document.createElement("a");
          a.href = URL.createObjectURL(new Blob([payload()], { type: "application/json" }));
          a.download = name;
          document.body.appendChild(a); a.click(); a.remove();
          setTimeout(() => URL.revokeObjectURL(a.href), 4000);
          toast("백업 파일을 내려받았습니다.");
          return;
        } catch (e) { /* 아래의 내용 보기로 넘어간다 */ }
      }
      const out = $("#jJsonOut"); out.hidden = false; out.value = payload(); out.select();
      toast("파일 저장을 쓸 수 없어 내용을 보여 드려요. 복사해서 보관하세요.");
    };
    const sj = $("#jShowJson");
    if (sj) sj.onclick = async () => {
      const out = $("#jJsonOut"); out.hidden = false; out.value = payload(); out.select();
      try { await navigator.clipboard.writeText(out.value); toast("백업 내용을 복사했습니다."); } catch (e) { /* 선택해 두었으니 직접 복사 */ }
    };
    $("#jFile").onchange = (e) => {
      const f = e.target.files && e.target.files[0];
      if (!f) return;
      if (f.size > 20 * 1024 * 1024) { $("#jImpMsg").textContent = "파일이 너무 큽니다(20MB 이하)."; return; }
      const rd = new FileReader();
      rd.onload = () => { $("#jJsonIn").value = String(rd.result || ""); };
      rd.onerror = () => { $("#jImpMsg").textContent = "파일을 읽지 못했습니다."; };
      rd.readAsText(f);
    };
    $("#jImport").onclick = () => importJson($("#jJsonIn").value);
    const mg = $("#jMigrate");
    if (mg) mg.onclick = async () => {
      const rows = lsRead().map((r) => clean(r)).filter(Boolean);
      if (!(await askConfirm("기록 옮기기", `이 브라우저에 남은 기록 ${rows.length}개를 계정 저장소로 옮길까요?\n같은 기록이 있으면 더 최근에 고친 쪽을 남겨요.`, "옮기기"))) return;
      const r = await writeMany(rows);
      if (!r.failed) { try { localStorage.setItem(LS_KEY + ".moved", new Date().toISOString()); } catch (e) { /* 무시 */ } store.localLeft = 0; }
      toast(`${r.ok}개를 옮겼습니다${r.failed ? ` · ${r.failed}개 실패` : ""}.`);
      renderJournal();
    };
  }
  async function writeMany(rows) {
    let ok = 0, failed = 0;
    for (const r of rows) {
      const cur = store.items.get(r.id);
      if (cur && cur.updatedAt >= r.updatedAt) { ok++; continue; }
      try { await putItem(Object.assign({}, r, { updatedAt: r.updatedAt })); ok++; } catch (e) { failed++; }
    }
    return { ok, failed };
  }
  async function importJson(text) {
    const msg = $("#jImpMsg");
    msg.textContent = "";
    let data;
    try { data = JSON.parse(text); } catch (e) { msg.textContent = "JSON 형식이 아닙니다. 내보낸 파일 내용을 그대로 넣어 주세요."; return; }
    const arr = Array.isArray(data) ? data : data && Array.isArray(data.items) ? data.items : null;
    if (!arr) { msg.textContent = "기록 목록(items)을 찾지 못했습니다."; return; }
    const rows = arr.map((r) => clean(r)).filter(Boolean).slice(0, 5000);
    const skipped = arr.length - rows.length;
    if (!rows.length) { msg.textContent = "가져올 수 있는 기록이 없습니다."; return; }
    const c = { lib: 0, cul: 0, quo: 0 }; rows.forEach((r) => c[r.kind]++);
    if (!(await askConfirm("기록 가져오기", `서재 ${c.lib}개 · 문화 기록 ${c.cul}개 · 문장 ${c.quo}개를 가져올까요?${skipped ? `\n형식이 맞지 않는 ${skipped}개는 건너뜁니다.` : ""}\n같은 기록이 있으면 더 최근에 고친 쪽을 남겨요.`, "가져오기"))) return;
    const r = await writeMany(rows.map((x) => Object.assign(x, { updatedAt: x.updatedAt })));
    toast(`${r.ok}개를 가져왔습니다${r.failed ? ` · ${r.failed}개 실패` : ""}.`);
    renderJournal();
  }

  /* ───────── 작성 화면 공통 ───────── */
  const mEl = $("#jModal"), form = $("#jForm");
  let mLastFocus = null, onSubmit = null;
  function openModal(title, html, submit, after) {
    mLastFocus = document.activeElement;
    $("#jmTitle").textContent = title;
    form.innerHTML = html + `<div class="jfoot"><span class="jerr" id="jfErr" role="alert"></span><button class="jadd ghost" type="button" id="jfCancel">취소</button><button class="jadd" type="submit" id="jfSave">저장</button></div>`;
    onSubmit = submit;
    mEl.hidden = false;
    $("#jfCancel").onclick = closeModal;
    if (after) after();
    const first = form.querySelector("input:not([type=hidden]):not([type=radio]):not([type=checkbox]), select, textarea");
    if (first) first.focus({ preventScroll: true });
  }
  function closeModal() {
    if (mEl.hidden) return;
    if (memoCloser) { const f = memoCloser; memoCloser = null; f(); } // 메모 칸 글은 보이는 동안 읽어야 해서 지우기 전에
    mEl.hidden = true;
    form.innerHTML = "";
    onSubmit = null;
    if (mLastFocus && document.body.contains(mLastFocus)) mLastFocus.focus({ preventScroll: true });
  }
  $("#jmClose").onclick = closeModal;
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!onSubmit) return;
    const btn = $("#jfSave"), err = $("#jfErr");
    btn.disabled = true; err.textContent = "";
    try { const msg = await onSubmit(new FormData(form)); closeModal(); if (msg) toast(msg); }
    catch (x) { err.textContent = x && x.message ? x.message : "저장하지 못했습니다."; btn.disabled = false; }
  });
  // Esc: 크게 본 사진·연관 검색어·확인 창만 닫는다. 노트와 작성(메모) 창은 × 단추로만 닫는다(적던 것이 실수로 닫히지 않게)
  window.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    if (closeLight()) { e.stopPropagation(); e.preventDefault(); return; } // 크게 본 사진부터
    const res = $("#jRes");
    if (res && !res.hidden) { e.stopPropagation(); e.preventDefault(); closeSuggest(); return; }
    const acl = mEl.hidden ? null : form.querySelector(".jac:not([hidden])"); // 작성 창의 나라·작가 연관 목록
    if (acl) { e.stopPropagation(); e.preventDefault(); acl.hidden = true; return; }
    if (!$("#jConfirm").hidden) { e.stopPropagation(); $("#jcNo").click(); return; }
    // 노트·작성 창이 열려 있으면 Esc가 뒤의 작품 상세창도 닫지 않게 여기서 멈춘다
    if (!mEl.hidden || (!jEl.hidden && !($("#drawer") && $("#drawer").classList.contains("open")))) e.stopPropagation();
  }, true);

  const f = (name, label, inner, full, hint) => `<label class="jf${full ? " full" : ""}"><span>${label}</span>${inner}${hint ? `<span class="hint">${hint}</span>` : ""}</label>`;
  const inp = (name, val, attrs) => `<input name="${name}" value="${esc(val == null ? "" : val)}" ${attrs || ""}>`;
  const area = (name, val, attrs) => `<textarea name="${name}" ${attrs || ""}>${esc(val || "")}</textarea>`;
  const fv =(fd, k) => String(fd.get(k) || "").trim();

  /* ───────── 입력칸 연관 목록(나라·작가) ─────────
     글자를 치면 칸 아래에 맞는 것을 띄운다. ↑↓로 고르고 Enter·클릭으로 넣는다. Esc는 목록만 닫는다. */
  // 나라: 가나다순. 한국어 이름·영어 이름·현지 이름으로 찾는다
  const COUNTRIES = Object.values(C).map((c) => ({ code: c.code, name: c.name, en: c.nameEn || "", nat: c.native || "", cnt: (c.books || []).length }))
    .sort((a, b) => a.name.localeCompare(b.name, "ko"));
  const findCountry = (s) => { const n = squash(s); return n ? COUNTRIES.find((c) => squash(c.name) === n || squash(c.en) === n || squash(c.nat) === n) : null; };
  function countryItems(q) {
    const n = squash(q);
    const rank = (c) => (squash(c.name).startsWith(n) || squash(c.en).startsWith(n) ? 0 : 1);
    const list = n ? COUNTRIES.filter((c) => [c.name, c.en, c.nat].some((v) => squash(v).includes(n))).sort((a, b) => rank(a) - rank(b)) : COUNTRIES;
    return list.map((c) => ({ label: c.name, sub: c.en, n: `${c.cnt}편`, c }));
  }
  // 작가: 지도 데이터의 작가(+ 내 서재에 직접 적은 작가). 편수가 많은 작가부터
  let AUTHORS = null;
  function authorList() {
    if (AUTHORS) return AUTHORS;
    const m = new Map();
    ALL_BOOKS.forEach(({ b, c }) => {
      if (!b.a || b.a === "작자 미상") return;
      const x = m.get(b.a) || { a: b.a, ao: b.ao || "", cnt: 0, cs: new Map() };
      x.cnt++; if (!x.ao && b.ao) x.ao = b.ao;
      x.cs.set(c.code, (x.cs.get(c.code) || 0) + 1);
      m.set(b.a, x);
    });
    return (AUTHORS = [...m.values()]);
  }
  function authorItems(q) {
    const n = squash(q);
    if (!n) return [];
    const mine = new Set();
    all("lib").forEach((it) => { const a = it.custom && it.custom.author; if (a && squash(a).includes(n)) mine.add(a); });
    const hit = authorList().filter((x) => squash(x.a).includes(n) || squash(x.ao).includes(n));
    hit.forEach((x) => mine.delete(x.a));
    const rank = (x) => (squash(x.a).startsWith(n) || squash(x.ao).startsWith(n) ? 0 : 1);
    const out = hit.sort((p, r) => rank(p) - rank(r) || r.cnt - p.cnt).slice(0, 8).map((x) => {
      const main = [...x.cs].sort((p, r) => r[1] - p[1])[0][0];
      return { label: x.a, sub: x.ao, n: `${C[main] ? C[main].name : ""} · ${x.cnt}편`, author: x, cc: x.cs.size === 1 ? main : "" };
    });
    return out.concat([...mine].slice(0, 3).map((a) => ({ label: a, n: "내 서재", author: null, cc: "" })));
  }
  function bindAC(input, list, source, pick, firstOnEnter) {
    let items = [], act = -1;
    const close = () => { list.hidden = true; input.setAttribute("aria-expanded", "false"); input.removeAttribute("aria-activedescendant"); act = -1; };
    const choose = (it) => { if (it) pick(it); close(); };
    const render = () => {
      items = source(input.value);
      if (!items.length) { close(); return; }
      const q = input.value;
      list.innerHTML = items.map((it, i) => `<button type="button" class="ri" role="option" id="${list.id}-${i}" data-i="${i}" aria-selected="false">` +
        `<span class="m">${hlq(it.label, q)}</span>${it.sub ? `<span class="s">${hlq(it.sub, q)}</span>` : ""}${it.n ? `<span class="n">${esc(it.n)}</span>` : ""}</button>`).join("");
      list.hidden = false; input.setAttribute("aria-expanded", "true"); act = -1;
      $$(".ri", list).forEach((el) => {
        el.onmousedown = (e) => e.preventDefault(); // 고르기 전에 칸이 흐려져 목록이 닫히지 않게
        el.onclick = () => choose(items[+el.dataset.i]);
      });
    };
    const setAct = (i) => {
      const els = $$(".ri", list);
      if (!els.length) return;
      act = (i + els.length) % els.length;
      els.forEach((el, j) => el.setAttribute("aria-selected", j === act ? "true" : "false"));
      els[act].scrollIntoView({ block: "nearest" });
      input.setAttribute("aria-activedescendant", els[act].id);
    };
    input.addEventListener("input", render);
    input.addEventListener("focus", render);
    input.addEventListener("blur", () => setTimeout(close, 120));
    input.addEventListener("keydown", (e) => {
      const open = !list.hidden;
      if (e.key === "ArrowDown") { e.preventDefault(); if (!open) render(); setAct(act + 1); }
      else if (e.key === "ArrowUp" && open) { e.preventDefault(); setAct(act - 1); }
      else if (e.key === "Enter" && open && (act >= 0 || firstOnEnter)) { e.preventDefault(); choose(items[act >= 0 ? act : 0]); }
      // Esc는 아래 노트 전체의 Esc 처리(캡처 단계)에서 목록부터 닫는다
    });
  }
  const acField = (key, label, name, val, attrs, extra) => `<div class="jf jacf"><span>${label}</span><div class="jacw">` +
    `<input name="${name}" value="${esc(val == null ? "" : val)}" autocomplete="off" role="combobox" aria-autocomplete="list" aria-expanded="false" aria-controls="jac-${key}" aria-label="${esc(label.replace(/<[^>]+>/g, ""))}" ${attrs || ""}>` +
    `${extra || ""}<div class="results jres jac" id="jac-${key}" role="listbox" hidden></div></div></div>`;

  /* ───────── 서재 작성 ───────── */
  function addToLibrary(cc, bid) {
    const id = libId(cc, bid);
    if (store.items.has(id)) { toast("이미 서재에 담긴 작품입니다."); return Promise.resolve(store.items.get(id)); }
    const now = new Date().toISOString();
    return putItem({ id, kind: "lib", countryCode: cc, bookId: bid, status: "want", createdAt: now })
      .then((it) => { toast("서재에 담았습니다 · 읽고 싶은 책"); return it; })
      .catch((e) => { toast(e.message); });
  }
  /* 표지 사진으로 책 정보 채우기: 사진은 assets에 표지로 저장하고, 같은 사진을 Claude(sample)에게 보여 제목·작가·연도·나라를 읽는다.
     둘 다 claude.ai에서 열었을 때만 된다. 쓸 수 없는 화면에서는 해당 기능을 숨긴다. */
  let samplePromise = null;
  function getSample() {
    if (!samplePromise) {
      const cl = window.claude;
      samplePromise = cl && typeof cl.use === "function"
        ? cl.use("sample").then(async (s) => { if (!s) return null; const lim = await s.limits().catch(() => null); return lim && lim.images ? { s, lim } : null; }).catch(() => null)
        : Promise.resolve(null);
    }
    return samplePromise;
  }
  const COVER_PROMPT = [
    "이 이미지는 사용자가 독서 기록에 추가하려는 책의 표지(또는 책 정보가 보이는 사진)입니다.",
    "이미지에서 읽을 수 있는 글자와, 당신이 확실히 아는 서지 정보만으로 아래 JSON 하나로 답하세요.",
    '{"title": "한국어판 제목(없으면 표지에 적힌 제목)", "author": "작가 이름(한국어 표기)", "year": "원작이 처음 나온 연도 네 자리(모르면 빈 문자열)", "country": "작가·작품의 나라 이름을 한국어로(예: 미국, 일본)"}',
    "책 표지가 아니거나 제목을 읽을 수 없으면 title을 빈 문자열로 두세요. 모르는 칸은 지어내지 말고 빈 문자열로 두세요."
  ].join("\n");
  const coverCopy = {
    not_granted: "Claude 사용을 허락하지 않아 자동 채우기를 쓸 수 없어요. 직접 적어 주세요.",
    sampling_disabled: "이 계정에서는 자동 채우기를 쓸 수 없어요. 직접 적어 주세요.",
    rate_limited: "지금은 요청이 많아요. 잠시 뒤 사진을 다시 골라 보세요.",
    image_rejected: "이 사진은 읽을 수 없어요. PNG·JPG·WEBP 사진으로 다시 골라 주세요.",
    session_expired: "다시 로그인한 뒤 사진을 골라 주세요."
  };

  function openLibForm(it, opts) {
    const o = opts || {};
    const isCustom = it ? !!it.custom : !!o.custom;
    const b = it ? itemBook(it) : o.countryCode ? bookInfo(o.countryCode, o.bookId) : null;
    const cur = it || { status: "want", rating: 0 };
    let coverId = cur.coverAssetId || "", removedCover = "", coverUpload = null;
    const curCountry = cur.countryCode && C[cur.countryCode] ? C[cur.countryCode].name : "";
    const html = `
      <fieldset><legend>책 정보</legend>
        ${isCustom ? `<div class="jf full jcoverf" id="jlCoverF" hidden><span>표지 사진</span>
            <div class="jcoverbox"><div class="jcoverpv" id="jlCoverPv"></div>
              <div class="jcoverside"><input type="file" id="jlFile" accept="image/png,image/jpeg,image/gif,image/webp" aria-label="표지 사진 고르기">
                <span class="hint" id="jlHint"></span>
                <button type="button" class="jadd ghost" id="jlCoverDel" style="height:30px;font-size:13px" hidden>사진 빼기</button></div></div></div>`
          + f("t", "책 제목 <em>*</em>", inp("title", cur.custom && cur.custom.title, 'required maxlength="200"'), true)
          + acField("a", "작가", "author", cur.custom && cur.custom.author, 'maxlength="120" placeholder="이름을 치면 지도에 있는 작가가 떠요"')
          + f("y", "출간 연도", inp("year", cur.custom && cur.custom.year, 'maxlength="20" inputmode="numeric"'))
          + acField("cc", "나라", "countryName", curCountry, 'maxlength="60" placeholder="나라 이름을 치거나 골라요 (비우면 모름)"',
            `<input type="hidden" name="countryCode" value="${esc(curCountry ? cur.countryCode : "")}">`)
          + f("cn", "나라 이름(지도에 없을 때)", inp("countryText", cur.custom && cur.custom.country, 'maxlength="60"'), false, "지도에 없는 책은 지도 핀에 연결되지 않아요.")
          : `<div class="jf full"><span>작품</span><b style="font-family:var(--f-display);font-weight:400;font-size:19px">${esc(b ? b.t : "")}</b><span class="hint">${esc(b ? [b.a, b.yl || b.y, b.country].filter(Boolean).join(" · ") : "")} · 작품 정보는 지도 데이터에서 가져와요</span></div>`}
      </fieldset>
      <fieldset><legend>나의 독서</legend>
        <div class="jf full"><span>독서 상태</span><div class="jstatus">${Object.entries(STATUS).map(([k, v]) => `<label><input type="radio" name="status" value="${k}" ${cur.status === k ? "checked" : ""}>${v}</label>`).join("")}</div></div>
        ${f("sd", "독서 시작일", `<input type="date" name="startDate" value="${esc(cur.startDate || "")}">`)}
        ${f("ed", "완독일", `<input type="date" name="endDate" value="${esc(cur.endDate || "")}">`)}
        ${f("cp", "현재 페이지", `<input type="number" min="0" max="100000" name="currentPage" value="${cur.currentPage == null ? "" : cur.currentPage}" inputmode="numeric">`)}
        ${f("tp", "전체 페이지", `<input type="number" min="0" max="100000" name="totalPages" value="${cur.totalPages == null ? "" : cur.totalPages}" inputmode="numeric">`)}
        <div class="jf full"><span>별점</span><div class="jstarsin" role="radiogroup" aria-label="별점">${[1, 2, 3, 4, 5].map((n) => `<label class="${n <= (cur.rating || 0) ? "on" : ""}" title="${n}점"><input type="radio" name="rating" value="${n}" ${cur.rating === n ? "checked" : ""} aria-label="${n}점">★</label>`).join("")}<button type="button" class="jadd ghost" id="jRate0" style="height:30px;font-size:13px;margin-left:8px">별점 지우기</button></div></div>
        ${f("rv", "감상", area("review", cur.review, 'maxlength="8000" rows="5"'), true)}
      </fieldset>`;
    openModal(it ? "서재 기록 수정" : isCustom ? "지도에 없는 책 추가" : "서재에 담기", html, async (fd) => {
      const rec = Object.assign({}, cur, {
        kind: "lib", status: fv(fd, "status") || "want", startDate: fv(fd, "startDate"), endDate: fv(fd, "endDate"),
        currentPage: fv(fd, "currentPage"), totalPages: fv(fd, "totalPages"), rating: Number(fv(fd, "rating")) || 0, review: fv(fd, "review"),
        createdAt: cur.createdAt || new Date().toISOString()
      });
      const cp = int(rec.currentPage, 100000), tp = int(rec.totalPages, 100000);
      if (cp != null && tp != null && tp > 0 && cp > tp) throw new Error("현재 페이지가 전체 페이지보다 큽니다.");
      // 현재 페이지를 바꾸면 오늘 읽은 데까지로 독서 달력에 남긴다
      if (cp != null && cp !== (cur.currentPage == null ? null : cur.currentPage)) rec.log = upsertLog(cur.log, todayYmd(), cp);
      if (rec.startDate && rec.endDate && rec.endDate < rec.startDate) throw new Error("완독일이 시작일보다 빠릅니다.");
      if (isCustom) {
        const title = fv(fd, "title");
        if (!title) throw new Error("책 제목을 적어 주세요.");
        if (coverUpload) await coverUpload; // 표지가 아직 올라가는 중이면 끝날 때까지 기다린다
        // 나라 칸: 지도에 있는 나라면 그 나라에 잇고, 없는 이름이면 '나라 이름(지도에 없을 때)'로 남긴다
        const cName = fv(fd, "countryName"), cHit = findCountry(cName);
        rec.custom = { title, author: fv(fd, "author"), year: fv(fd, "year"), country: fv(fd, "countryText") || (cHit ? "" : cName) };
        rec.countryCode = cHit ? cHit.code : "";
        rec.bookId = "";
        rec.id = cur.id || newId("lib_x");
        rec.coverAssetId = coverId;
      } else {
        rec.id = cur.id || libId(o.countryCode, o.bookId);
        rec.countryCode = cur.countryCode || o.countryCode;
        rec.bookId = cur.bookId || o.bookId;
        if (!it && store.items.has(rec.id)) throw new Error("이미 서재에 담긴 작품입니다.");
      }
      await putItem(rec);
      if (removedCover && removedCover !== coverId && store.assets) { try { await store.assets.delete(removedCover); } catch (e) { /* 무시 */ } }
      return it ? "서재 기록을 고쳤습니다." : "서재에 담았습니다.";
    }, () => {
      const box = form.querySelector(".jstarsin");
      const paint = () => { const v = Number((form.querySelector('input[name="rating"]:checked') || {}).value || 0); $$("label", box).forEach((l, i) => l.classList.toggle("on", i < v)); };
      $$("input", box).forEach((x) => x.addEventListener("change", paint));
      $("#jRate0").onclick = () => { $$("input", box).forEach((x) => { x.checked = false; }); paint(); };
      if (isCustom) { bindCountryAuthor(); bindCover(); }
    });

    // 나라·작가 칸 연관 목록. 작가를 고르면, 그 작가가 한 나라에만 있을 때 비어 있는 나라 칸도 채운다
    function bindCountryAuthor() {
      const cIn = form.querySelector('[name="countryName"]'), cCode = form.querySelector('[name="countryCode"]'), aIn = form.querySelector('[name="author"]');
      const setCountry = (c) => { cIn.value = c ? c.name : ""; cCode.value = c ? c.code : ""; };
      bindAC(cIn, $("#jac-cc"), countryItems, (it) => { setCountry(it.c); cIn.dataset.auto = ""; }, true);
      cIn.addEventListener("input", () => { const m = findCountry(cIn.value); cCode.value = m ? m.code : ""; });
      bindAC(aIn, $("#jac-a"), authorItems, (it) => {
        aIn.value = it.label; aIn.dataset.auto = "";
        if (it.cc && C[it.cc] && !cIn.value.trim()) setCountry(COUNTRIES.find((c) => c.code === it.cc));
      });
    }

    // 표지 사진: 미리 보기 → (가능하면) 표지로 저장 + Claude가 읽어 빈 칸 채우기
    function bindCover() {
      const wrap = $("#jlCoverF"), pv = $("#jlCoverPv"), file = $("#jlFile"), hint = $("#jlHint"), del = $("#jlCoverDel");
      if (!wrap) return;
      let localUrl = "", ai = null;
      const paintCover = () => {
        const src = localUrl || (coverId ? `/_blob/${coverId}` : "");
        pv.innerHTML = src ? `<img src="${esc(src)}" alt="표지 사진">` : `<span>표지</span>`;
        del.hidden = !src;
      };
      const setHint = (t) => { hint.textContent = t; };
      const baseHint = () => setHint(ai ? "표지 사진을 고르면 제목·작가·연도·나라를 자동으로 채워요. 채운 뒤 고칠 수 있어요." : "표지 사진을 붙여 두면 서재 카드에 보여요.");
      del.onclick = () => { if (coverId) removedCover = coverId; coverId = ""; localUrl = ""; file.value = ""; paintCover(); baseHint(); };
      paintCover();
      getSample().then((r) => {
        ai = r;
        if (!document.body.contains(wrap)) return;
        if (!ai && !store.assets) return; // 사진을 쓸 곳이 없으면 칸을 숨긴 채로 둔다
        if (ai) file.accept = ai.lim.images.mediaTypes.join(",");
        wrap.hidden = false;
        baseHint();
      });
      file.onchange = async () => {
        const fl = file.files && file.files[0];
        if (!fl) return;
        if (fl.size > 20 * 1024 * 1024) { setHint("사진은 20MB 이하만 쓸 수 있어요."); return; }
        localUrl = URL.createObjectURL(fl);
        paintCover();
        // 1) 표지로 저장(서재 카드에 보이도록)
        if (store.assets) {
          coverUpload = store.assets.upload(fl).then((up) => {
            if (coverId && !removedCover) removedCover = coverId;
            coverId = up.id;
          }).catch(() => { setHint("표지 사진을 저장하지 못했어요. 책 정보는 그대로 채울 수 있어요."); }).finally(() => { coverUpload = null; });
        }
        // 2) Claude가 표지를 읽어 빈 칸을 채운다(사람이 적은 칸은 건드리지 않는다)
        if (!ai) return;
        setHint("표지를 읽는 중… 처음이면 Claude 사용 허락 창이 떠요.");
        file.disabled = true;
        try {
          const out = await ai.s.json(COVER_PROMPT, { images: [fl], modelTier: "default" });
          if (!document.body.contains(wrap)) return; // 그새 창을 닫았다
          const got = out && typeof out === "object" ? out : {};
          const title = String(got.title || "").trim();
          if (!title) { setHint("표지에서 책 정보를 읽지 못했어요. 직접 적어 주세요."); return; }
          const fill = (name, val) => {
            const el = form.querySelector(`[name="${name}"]`);
            val = String(val || "").trim();
            if (!el || !val) return false;
            if (el.value.trim() && el.dataset.auto !== "1") return false;
            el.value = val.slice(0, Number(el.getAttribute("maxlength")) || 200);
            el.dataset.auto = "1";
            return true;
          };
          let n = 0;
          n += fill("title", title);
          n += fill("author", got.author);
          n += fill("year", String(got.year || "").replace(/[^0-9\-~년 ]/g, "").trim());
          const country = String(got.country || "").trim();
          const cIn = form.querySelector('[name="countryName"]'), cCode = form.querySelector('[name="countryCode"]');
          if (country && cIn && (!cIn.value.trim() || cIn.dataset.auto === "1")) {
            const match = findCountry(country);
            cIn.value = match ? match.name : country;
            cCode.value = match ? match.code : "";
            cIn.dataset.auto = "1";
            n += 1;
          }
          setHint(n ? "표지를 읽어 빈 칸을 채웠어요. 맞는지 확인해 주세요." : "이미 적어 둔 칸은 그대로 두었어요.");
        } catch (e) {
          const code = e && e.code;
          if (code === "images_unavailable" || code === "not_declared" || code === "capability_disabled" || code === "capability_removed") { ai = null; baseHint(); return; }
          setHint(coverCopy[code] || "표지에서 책 정보를 읽지 못했어요. 직접 적어 주세요.");
        } finally {
          if (document.body.contains(file)) file.disabled = false;
        }
      };
      // 직접 고친 칸은 다시 자동으로 덮어쓰지 않는다
      ["title", "author", "year", "countryText", "countryName"].forEach((nm) => {
        const el = form.querySelector(`[name="${nm}"]`);
        if (el) el.addEventListener("input", () => { el.dataset.auto = ""; });
      });
    }
  }

  /* ───────── 작품 상세창: 나의 문학 탐험 ───────── */
  let drawerBook = null;
  function onBookOpen(b) {
    drawerBook = b ? { cc: b.c.code, id: b.id, t: b.t } : null;
    paintDrawer();
  }
  function paintDrawer() {
    const body = $("#dBody");
    if (!body || !drawerBook) return;
    const cur = APP.currentBook && APP.currentBook();
    if (!cur || cur.id !== drawerBook.id || cur.c.code !== drawerBook.cc) return;
    let sec = $("#jxSec", body);
    if (!sec) { sec = document.createElement("section"); sec.className = "d-sec jx"; sec.id = "jxSec"; body.appendChild(sec); }
    const { cc, id } = drawerBook;
    const lib = libOf(cc, id);
    const memoed = hasMemo(lib);
    const pct = lib && lib.totalPages ? Math.min(100, Math.round(((lib.currentPage || 0) / lib.totalPages) * 100)) : null;
    sec.innerHTML = `
      <h3>${NOTE_ICON}나의 문학 탐험</h3>
      <div class="jxrow">${lib
        ? `<span class="jpill ${lib.status}">${STATUS[lib.status]}</span>${pct != null ? `<span class="jxcount">${pct}% 읽음</span>` : ""}${lib.rating ? stars(lib.rating) : ""}<button type="button" data-x="libedit">서재 기록 수정</button>`
        : `<button type="button" class="main" data-x="lib">내 서재에 담기</button>`}</div>
      <div class="jxrow"><button type="button" data-x="memo">${memoed ? "메모 열기 ✎" : "+ 메모"}</button></div>
      <p class="jxcount">${lib ? (memoed ? "이 책에 적은 메모가 있어요. " : "서재에 담긴 책이에요. ") : "아직 이 작품의 기록이 없어요. "}<button type="button" class="link" data-x="open">노트에서 보기</button></p>`;
    $$("[data-x]", sec).forEach((btn) => {
      btn.onclick = () => {
        const x = btn.dataset.x;
        if (x === "lib") addToLibrary(cc, id);
        if (x === "libedit") openLibForm(libOf(cc, id));
        if (x === "memo") memoForBook(cc, id);
        if (x === "open") {
          // 메모가 있으면 메모 탭, 아니면 서재를 열고 이 작품으로 좁혀 보여 준다
          APP.closeBook();
          openJournal({ tab: memoed ? "memo" : "lib", country: cc, q: drawerBook.t });
        }
      };
    });
  }

  /* ───────── 나라 화면: 내 기록 요약 ───────── */
  function onCountryRender(c) {
    const head = $("#chead");
    if (!head || !c) return;
    let box = $("#cjx", head);
    if (!box) { box = document.createElement("div"); box.className = "cjx"; box.id = "cjx"; head.appendChild(box); }
    const cc = c.code;
    const libs = all("lib").filter((it) => it.countryCode === cc);
    const nMemo = libs.filter(hasMemo).length;
    box.innerHTML = `${NOTE_ICON}<span><b>나의 ${esc(c.name)} 탐험</b> · 서재 ${libs.length}권 · 메모 ${nMemo}권</span>
      <button type="button" id="cjxOpen">노트에서 보기</button>`;
    $("#cjxOpen").onclick = () => openJournal({ tab: "lib", country: cc });
  }

  /* ───────── 독서 달력 ─────────
     서재의 책을 달력에 올린다: 시작일·완독일, 날마다 읽은 데까지(쪽·진행률), 읽고 있던 기간(칸 아래 색 띠).
     날짜를 누르면 오른쪽에 그날의 기록이 보이고, 그날 몇 쪽까지 읽었는지 바로 남길 수 있다. */
  const CAL_ICON = '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3.5" y="5" width="17" height="15.5" rx="2"/><path d="M3.5 9.5h17M8 3v4M16 3v4"/><rect x="7" y="12.5" width="4" height="3.5" rx=".6" fill="var(--accent)" stroke="var(--ink)"/></svg>';
  const WEEK = ["일", "월", "화", "수", "목", "금", "토"];
  const calRoot = document.createElement("section");
  calRoot.className = "jcal"; calRoot.id = "jCal"; calRoot.hidden = true;
  calRoot.setAttribute("role", "dialog"); calRoot.setAttribute("aria-modal", "true"); calRoot.setAttribute("aria-labelledby", "jcalTitle");
  calRoot.innerHTML = `<div class="jcalbook">
    <header class="jchead">
      <div class="jt">${CAL_ICON}<div><p class="eyebrow">Reading Calendar</p><h2 id="jcalTitle">독서 달력</h2></div></div>
      <div class="jcnav"><button class="icon-btn" type="button" id="jcPrev" aria-label="이전 달">‹</button><b id="jcMonth" aria-live="polite"></b><button class="icon-btn" type="button" id="jcNext" aria-label="다음 달">›</button><button class="jadd ghost" type="button" id="jcToday">오늘</button></div>
      <button class="icon-btn" id="jcClose" type="button" aria-label="달력 닫기">×</button>
    </header>
    <div class="jcbody">
      <div class="jcmain"><div class="jcweek">${WEEK.map((w) => `<span>${w}</span>`).join("")}</div><div class="jcgrid" id="jcGrid" role="grid"></div><p class="jcsum" id="jcSum"></p></div>
      <aside class="jcday" id="jcDay" aria-live="polite"></aside>
    </div></div>`;
  document.body.appendChild(calRoot);
  const calBtn = document.createElement("button");
  calBtn.className = "journal-btn cal-btn"; calBtn.type = "button"; calBtn.id = "calBtn";
  calBtn.setAttribute("aria-label", "독서 달력 열기");
  calBtn.innerHTML = `${CAL_ICON}<span class="jl">독서 달력</span>`;
  jbtn.after(calBtn);
  if (ATLAS.floatPanel) ATLAS.floatPanel($(".jcalbook"), { handle: ".jchead", fixH: true, minW: 420, minH: 360 });
  else (ATLAS.fpQueue = ATLAS.fpQueue || []).push([$(".jcalbook"), { handle: ".jchead", fixH: true, minW: 420, minH: 360 }]);

  const CAL = { y: 0, m: 0, sel: "" };
  const pctOf = (it, p) => (it.totalPages ? Math.min(100, Math.round((p / it.totalPages) * 100)) : null);
  const dayLabel = (d) => { const dt = new Date(d + "T00:00:00"); return `${dt.getMonth() + 1}월 ${dt.getDate()}일 (${WEEK[dt.getDay()]})`; };
  function openCal() {
    const t = new Date();
    if (!CAL.sel) { CAL.y = t.getFullYear(); CAL.m = t.getMonth(); CAL.sel = todayYmd(); }
    calRoot.hidden = false;
    document.body.classList.add("jopen");
    renderCal();
    $("#jcClose").focus({ preventScroll: true });
  }
  function closeCal() { calRoot.hidden = true; if ($("#journal").hidden) document.body.classList.remove("jopen"); calBtn.focus({ preventScroll: true }); }
  calBtn.onclick = openCal;
  $("#jcClose").onclick = closeCal; // 달력도 × 단추로만 닫는다
  const moveMonth = (n) => { const dt = new Date(CAL.y, CAL.m + n, 1); CAL.y = dt.getFullYear(); CAL.m = dt.getMonth(); renderCal(); };
  $("#jcPrev").onclick = () => moveMonth(-1);
  $("#jcNext").onclick = () => moveMonth(1);
  $("#jcToday").onclick = () => { const t = new Date(); CAL.y = t.getFullYear(); CAL.m = t.getMonth(); CAL.sel = todayYmd(); renderCal(); };

  // 날짜별 기록 모으기: { 날짜 → [{ it, log, start, end }] } · 읽던 기간
  function calData() {
    const byDay = new Map(), spans = [], today = todayYmd();
    const slot = (d, it) => {
      if (!byDay.has(d)) byDay.set(d, new Map());
      const m = byDay.get(d);
      if (!m.has(it.id)) m.set(it.id, { it });
      return m.get(it.id);
    };
    all("lib").forEach((it) => {
      it.log.forEach((x, i) => { slot(x.d, it).log = { p: x.p, prev: i ? it.log[i - 1].p : null }; });
      if (it.startDate) slot(it.startDate, it).start = true;
      if (it.endDate) slot(it.endDate, it).end = true;
      const from = it.startDate || (it.log[0] && it.log[0].d);
      const lastLog = it.log.length ? it.log[it.log.length - 1].d : "";
      const to = it.endDate || (it.status === "reading" ? (lastLog > today ? lastLog : today) : lastLog || from);
      if (from && to && to >= from) spans.push({ it, from, to });
    });
    return { byDay, spans };
  }
  function chipText(e) {
    const t = itemBook(e.it).t;
    if (e.log) { const pc = pctOf(e.it, e.log.p); return [t, pc != null ? `${pc}%` : `${e.log.p}쪽`]; }
    return [t, e.end ? "완독" : "시작"];
  }
  function renderCal() {
    if (calRoot.hidden) return;
    const { byDay, spans } = calData(), today = todayYmd();
    $("#jcMonth").textContent = `${CAL.y}년 ${CAL.m + 1}월`;
    const first = new Date(CAL.y, CAL.m, 1), start = new Date(CAL.y, CAL.m, 1 - first.getDay());
    const weeks = Math.ceil((first.getDay() + new Date(CAL.y, CAL.m + 1, 0).getDate()) / 7);
    let html = "";
    for (let i = 0; i < weeks * 7; i++) {
      const dt = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i), d = ymdOf(dt);
      const evs = [...(byDay.get(d) || new Map()).values()];
      const sp = spans.filter((s) => s.from <= d && d <= s.to);
      const chips = evs.slice(0, 3).map((e) => { const [t, v] = chipText(e); return `<span class="jcchip${e.end ? " end" : ""}" style="--spine:${spineFor(e.it.countryCode)}"><b>${esc(t)}</b><i>${esc(v)}</i></span>`; }).join("");
      html += `<button type="button" class="jcd${dt.getMonth() !== CAL.m ? " out" : ""}${d === today ? " today" : ""}${d === CAL.sel ? " sel" : ""} w${dt.getDay()}" data-d="${d}" role="gridcell" aria-selected="${d === CAL.sel}" aria-label="${dayLabel(d)}${evs.length ? ` · 기록 ${evs.length}개` : ""}">
        <span class="n">${dt.getDate()}</span>${chips}${evs.length > 3 ? `<span class="jcmore">+${evs.length - 3}</span>` : ""}
        ${sp.length ? `<span class="jcspan">${sp.slice(0, 5).map((s) => `<i style="background:${spineFor(s.it.countryCode)}" title="${esc(itemBook(s.it).t)} 읽는 기간"></i>`).join("")}</span>` : ""}</button>`;
    }
    const grid = $("#jcGrid");
    grid.innerHTML = html;
    $$(".jcd", grid).forEach((el) => { el.onclick = () => { CAL.sel = el.dataset.d; renderCal(); }; });
    // 이번 달 요약: 읽은 날 · 읽은 쪽 · 완독 · 함께한 책
    const pre = `${CAL.y}-${pad2(CAL.m + 1)}-`;
    let days = new Set(), pages = 0, done = 0, books = new Set();
    all("lib").forEach((it) => {
      it.log.forEach((x, i) => { if (x.d.startsWith(pre)) { days.add(x.d); books.add(it.id); pages += Math.max(0, x.p - (i ? it.log[i - 1].p : 0)); } });
      if (it.endDate && it.endDate.startsWith(pre)) { done++; books.add(it.id); }
      if (it.startDate && it.startDate.startsWith(pre)) books.add(it.id);
    });
    $("#jcSum").innerHTML = books.size
      ? `이번 달 · 읽은 날 <b>${days.size}</b>일 · 읽은 쪽 <b>${pages.toLocaleString()}</b>쪽 · 완독 <b>${done}</b>권 · 함께한 책 <b>${books.size}</b>권`
      : `이 달에는 아직 기록이 없어요. 날짜를 누르고 그날 읽은 쪽수를 남겨 보세요.`;
    renderCalDay(byDay, spans);
  }
  function renderCalDay(byDay, spans) {
    const d = CAL.sel, box = $("#jcDay");
    const evs = [...(byDay.get(d) || new Map()).values()];
    const reading = spans.filter((s) => s.from <= d && d <= s.to && !evs.some((e) => e.it === s.it)).map((s) => s.it);
    const row = (e) => {
      const b = itemBook(e.it), bits = [];
      if (e.start) bits.push("읽기 시작");
      if (e.log) {
        const pc = pctOf(e.it, e.log.p), gain = e.log.prev != null ? e.log.p - e.log.prev : null;
        bits.push(`${e.log.p}쪽까지${pc != null ? ` · ${pc}%` : ""}${gain > 0 ? ` (+${gain}쪽)` : ""}`);
      }
      if (e.end) bits.push("완독 🎉");
      const pc = e.log ? pctOf(e.it, e.log.p) : e.end ? 100 : null;
      return `<li style="--spine:${spineFor(e.it.countryCode)}"><button type="button" class="jct" data-id="${esc(e.it.id)}">${esc(b.t)}</button>
        <span class="jcs">${esc(bits.join(" · "))}</span>
        ${pc != null ? `<div class="jprog"><i style="width:${pc}%"></i></div>` : ""}
        ${e.log ? `<button type="button" class="jcdel" data-id="${esc(e.it.id)}" aria-label="이날 쪽수 기록 지우기" title="이날 쪽수 기록 지우기">×</button>` : ""}</li>`;
    };
    const libs = all("lib").sort((a, b) => ({ reading: 0, want: 1, done: 2 })[a.status] - ({ reading: 0, want: 1, done: 2 })[b.status] || b.updatedAt.localeCompare(a.updatedAt));
    box.innerHTML = `<h3>${esc(dayLabel(d))}</h3>
      ${evs.length ? `<ul class="jclist">${evs.map(row).join("")}</ul>` : `<p class="hint">이날 남긴 기록이 없어요.</p>`}
      ${reading.length ? `<p class="jcalso">읽던 책 · ${reading.map((it) => `<button type="button" class="jct" data-id="${esc(it.id)}">${esc(itemBook(it).t)}</button>`).join(", ")}</p>` : ""}
      ${libs.length ? `<div class="jcrec"><h4>이날 읽은 데까지 남기기</h4>
        <select id="jcBook" aria-label="책">${libs.map((it) => `<option value="${esc(it.id)}">${esc(itemBook(it).t)} · ${STATUS[it.status]}</option>`).join("")}</select>
        <div class="jcrow"><input type="number" id="jcPage" min="0" max="100000" inputmode="numeric" placeholder="몇 쪽까지" aria-label="읽은 데까지 쪽수"><span id="jcOf"></span><button type="button" class="jadd" id="jcSave">기록</button></div>
        <p class="hint" id="jcMsg">서재의 현재 페이지·진행률도 함께 바뀌어요. 마지막 쪽까지 남기면 완독으로 표시돼요.</p></div>`
        : `<p class="hint">서재에 책을 담으면 여기에서 날마다 읽은 쪽수를 남길 수 있어요.</p>`}`;
    $$(".jct", box).forEach((el) => { el.onclick = () => { const it = store.items.get(el.dataset.id); if (it) openLibForm(it); }; });
    $$(".jcdel", box).forEach((el) => {
      el.onclick = async () => {
        const it = store.items.get(el.dataset.id);
        if (!it) return;
        const log = upsertLog(it.log, d, null);
        const rec = Object.assign({}, it, { log });
        if (it.log.length && it.log[it.log.length - 1].d === d && log.length) rec.currentPage = log[log.length - 1].p; // 가장 최근 기록을 지우면 그 전 기록으로
        try { await putItem(rec); toast("이날 쪽수 기록을 지웠습니다."); } catch (e) { toast(e.message); }
      };
    });
    const sel = $("#jcBook");
    if (!sel) return;
    const pg = $("#jcPage"), of = $("#jcOf");
    const sync = () => {
      const it = store.items.get(sel.value);
      const x = it && it.log.find((l) => l.d === d);
      pg.value = x ? x.p : "";
      pg.placeholder = it && it.currentPage != null ? `지금 ${it.currentPage}쪽` : "몇 쪽까지";
      of.textContent = it && it.totalPages ? `/ ${it.totalPages}쪽` : "쪽";
    };
    if (evs[0]) sel.value = evs[0].it.id;
    sel.onchange = sync; sync();
    const save = async () => {
      const it = store.items.get(sel.value), p = int(pg.value, 100000);
      if (!it || p == null) { $("#jcMsg").textContent = "읽은 데까지 쪽수를 적어 주세요."; return; }
      if (it.totalPages && p > it.totalPages) { $("#jcMsg").textContent = `전체 ${it.totalPages}쪽보다 클 수 없어요.`; return; }
      const log = upsertLog(it.log, d, p);
      const rec = Object.assign({}, it, { log, currentPage: log[log.length - 1].p });
      if (rec.status === "want") rec.status = "reading";
      if (!rec.startDate || d < rec.startDate) rec.startDate = d;
      if (rec.totalPages && p >= rec.totalPages) { rec.status = "done"; if (!rec.endDate) rec.endDate = d; }
      try { await putItem(rec); toast(rec.status === "done" && it.status !== "done" ? "완독을 축하해요! 달력에 남겼습니다." : "달력에 남겼습니다."); } catch (e) { $("#jcMsg").textContent = e.message; }
    };
    $("#jcSave").onclick = save;
    pg.addEventListener("keydown", (e) => { if (e.key === "Enter") { e.preventDefault(); save(); } });
  }

  /* ───────── 변경 반영 ───────── */
  store.listeners.add(() => {
    renderCal();
    migrateOldNotes();
    const n = all("lib").length;
    const bn = $("#jBtnN"); if (bn) bn.textContent = n ? String(n) : "";
    renderJournal();
    if ($("#drawer") && $("#drawer").classList.contains("open")) paintDrawer();
    const cc = APP.country && APP.country();
    if (cc && C[cc] && APP.mode() === "country") onCountryRender(C[cc]);
  });

  ATLAS.journal = { onBookOpen, onCountryRender, open: openJournal };
  // 지도 쪽이 이미 나라 화면이나 상세창을 열어 둔 채로 시작했을 수 있다
  if (APP.mode() === "country" && APP.country()) onCountryRender(C[APP.country()]);
  if (APP.currentBook && APP.currentBook()) onBookOpen(APP.currentBook());
  initStore();
})();
