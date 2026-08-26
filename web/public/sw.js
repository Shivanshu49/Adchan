const CACHE_PREFIX = "adchan-offline-";
const CACHE_NAME = `${CACHE_PREFIX}v2`;

// Keep install-time transfer tiny. Build-hashed CSS/font URLs and the two audio
// files for the page being viewed are sent by the page after window.load.
const INSTALL_URLS = [
  "/offline.html",
];

async function fetchAndCache(cache, url) {
  const request = new Request(url, { cache: "reload" });
  const response = await fetch(request);
  if (!response.ok) throw new Error(`Could not cache ${url}: ${response.status}`);
  await cache.put(url, response.clone());
  return response;
}

self.addEventListener("install", (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    await Promise.all(INSTALL_URLS.map((url) => fetchAndCache(cache, url)));
    await self.skipWaiting();
  })());
});

self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    const names = await caches.keys();
    await Promise.all(
      names
        .filter((name) => name.startsWith(CACHE_PREFIX) && name !== CACHE_NAME)
        .map((name) => caches.delete(name)),
    );
    await self.clients.claim();
  })());
});

function isCurrentPageAsset(pathname) {
  return (
    pathname.startsWith("/_next/static/css/") ||
    (pathname.startsWith("/_next/static/media/") && pathname.endsWith(".woff2")) ||
    pathname.startsWith("/fonts/") ||
    pathname.startsWith("/audio/")
  );
}

function referencedAssets(html, baseUrl) {
  const urls = new Set();
  const pattern = /["'(]([^"')\s]+\.(?:css|woff2|mp3)(?:\?[^"')\s]*)?)/g;
  for (const match of html.matchAll(pattern)) {
    const url = new URL(match[1], baseUrl);
    if (url.origin === self.location.origin && isCurrentPageAsset(url.pathname)) {
      urls.add(url.pathname);
    }
  }
  return urls;
}

// The first navigation is normally not controlled by the worker, so cache the
// current HTML plus only the assets visible on that page once it has loaded.
self.addEventListener("message", (event) => {
  if (event.data?.type !== "CACHE_CURRENT_PAGE") return;

  event.waitUntil((async () => {
    const clientUrl = event.source?.url ? new URL(event.source.url) : null;
    const requestedPage = new URL(event.data.page || "/", self.location.origin);
    const sameCurrentPage =
      clientUrl &&
      requestedPage.origin === self.location.origin &&
      requestedPage.pathname === clientUrl.pathname;

    const cache = await caches.open(CACHE_NAME);
    const urls = new Set();
    if (sameCurrentPage) {
      const pageResponse = await fetchAndCache(cache, requestedPage.pathname);
      const html = await pageResponse.text();
      for (const url of referencedAssets(html, requestedPage)) urls.add(url);
    }

    const results = await Promise.allSettled(
      [...urls].map((url) => fetchAndCache(cache, url)),
    );
    event.ports[0]?.postMessage({
      cached: results.filter((result) => result.status === "fulfilled").length,
      requested: results.length + (sameCurrentPage ? 1 : 0),
    });
  })());
});

async function networkFirstApi(request) {
  try {
    return await fetch(request);
  } catch {
    return new Response(
      JSON.stringify({
        detail: "ऑफलाइन होने पर आवाज़ और नई शिकायत का निदान उपलब्ध नहीं है।",
      }),
      { status: 503, headers: { "Content-Type": "application/json; charset=utf-8" } },
    );
  }
}

async function cacheFirst(request) {
  const url = new URL(request.url);
  const cacheKey = request.mode === "navigate" ? url.pathname : request;
  const cached = await caches.match(cacheKey);
  if (cached) return cached;

  try {
    const response = await fetch(request);
    if (response.ok && request.method === "GET") {
      const cache = await caches.open(CACHE_NAME);
      await cache.put(cacheKey, response.clone());
    }
    return response;
  } catch {
    if (request.mode === "navigate") {
      return (await caches.match("/offline.html")) || Response.error();
    }
    return Response.error();
  }
}

self.addEventListener("fetch", (event) => {
  const request = event.request;
  const url = new URL(request.url);

  if (url.pathname === "/diagnose" || url.pathname === "/transcribe") {
    event.respondWith(networkFirstApi(request));
    return;
  }

  const cacheFirstAsset =
    request.mode === "navigate" ||
    url.pathname.startsWith("/audio/") ||
    url.pathname.startsWith("/fonts/") ||
    url.pathname.startsWith("/_next/static/css/") ||
    (url.pathname.startsWith("/_next/static/media/") && url.pathname.endsWith(".woff2"));

  if (request.method === "GET" && cacheFirstAsset) {
    event.respondWith(cacheFirst(request));
  }
});
