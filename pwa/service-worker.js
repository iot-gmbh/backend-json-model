// This is the service worker with the Advanced caching

const CACHE = "advanced-caching-1668068768867";
const precacheFiles = [
  // "/index.html",
  "/offline.html",
  "/view/App.view.xml",
  "/view/NotFound.view.xml",
  "/view/Home.view.xml",
  "/controller/Home.controller.js",
  "/controller/App.controller.js",
  "/resources/sap-ui-custom.js",
];

const offlineFallbackPage = "offline.html";

const networkFirstPaths = [];

const avoidCachingPaths = ["//v2/.*/", "/v2"];
// const avoidCachingPaths = ["/auth"];

// const neverRespondToPaths = ["//auth//.*/", "//login.microsoftonline.com//.*/"];
const neverRespondToPaths = [
  "/auth/signin",
  "/auth/signout",
  "/auth/redirect",
  "/index.html",
];

function pathComparer(requestUrl, pathRegEx) {
  return requestUrl.match(new RegExp(pathRegEx));
}

function comparePaths(requestUrl, pathsArray) {
  if (requestUrl) {
    for (let index = 0; index < pathsArray.length; index++) {
      const pathRegEx = pathsArray[index];
      if (pathComparer(requestUrl, pathRegEx)) {
        return true;
      }
    }
  }

  return false;
}

self.addEventListener("install", (event) => {
  console.log("[Service Worker] Install Event processing");

  console.log("[Service Worker] Skip waiting on install");
  self.skipWaiting();

  event.waitUntil(
    caches.open(CACHE).then((cache) => {
      console.log("[Service Worker] Caching pages during install");

      return cache
        .addAll(precacheFiles)
        .then(() => cache.add(offlineFallbackPage));
    })
  );
});

// Allow sw to control of current page
self.addEventListener("activate", (event) => {
  console.log("[Service Worker] Claiming clients for current page");
  event.waitUntil(self.clients.claim());
});

// If any fetch fails, it will look for the request in the cache and serve it from there first
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  if (comparePaths(event.request.url, neverRespondToPaths)) return;
  if (event.request.url === "https://project-planning.herokuapp.com/") return;
  if (event.request.url.includes("https://project-planning.herokuapp.com/#"))
    return;
  if (event.request.url.endsWith("/")) return;

  if (comparePaths(event.request.url, networkFirstPaths)) {
    networkFirstFetch(event);
  } else {
    cacheFirstFetch(event);
  }
});

function cacheFirstFetch(event) {
  event.respondWith(
    fromCache(event.request).then(
      (response) => {
        // The response was found in the cache so we responde with it and update the entry

        // This is where we call the server to get the newest version of the
        // file to use the next time we show view
        event.waitUntil(
          fetch(event.request)
            .then((response) => {
              updateCache(event.request, response);
            })
            .catch((error) => {
              console.log(error);
              console.log(event.request);
            })
        );

        return response;
      },
      () =>
        // The response was not found in the cache so we look for it on the server
        fetch(event.request)
          .then((response) => {
            // If request was success, add or update it in the cache
            event.waitUntil(updateCache(event.request, response.clone()));

            return response;
          })
          .catch((error) => {
            // The following validates that the request was for a navigation to a new document
            if (
              event.request.destination !== "document" ||
              event.request.mode !== "navigate"
            ) {
              return;
            }

            console.log(
              `[Service Worker] Network request failed and no cache.${error}`
            );
            // Use the precached offline page as fallback
            return caches.open(CACHE).then((cache) => {
              cache.match(offlineFallbackPage);
            });
          })
    )
  );
}

function networkFirstFetch(event) {
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // If request was success, add or update it in the cache
        event.waitUntil(updateCache(event.request, response.clone()));
        return response;
      })
      .catch((error) => {
        console.log(
          `[Service Worker] Network request Failed. Serving content from cache: ${error}`
        );
        return fromCache(event.request);
      })
  );
}

function fromCache(request) {
  // Check to see if you have it in the cache
  // Return response
  // If not in the cache, then return error page
  return caches.open(CACHE).then((cache) =>
    cache.match(request).then((matching) => {
      if (!matching || matching.status === 404) {
        return Promise.reject("no-match");
      }

      return matching;
    })
  );
}

function updateCache(request, response) {
  if (!comparePaths(request.url, avoidCachingPaths)) {
    return caches.open(CACHE).then((cache) => cache.put(request, response));
  }

  return Promise.resolve();
}
