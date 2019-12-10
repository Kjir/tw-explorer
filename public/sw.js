console.log("From service worker");

const CACHE_NAME = "swgoh.help";

self.addEventListener("fetch", event => {
  const { request } = event;
  if (request.url.indexOf("api.swgoh.help") !== -1) {
    const findResponsePromise = caches
      .open(CACHE_NAME)
      .then(cache => cache.match(request))
      .then(response => {
        if (response) {
          return response;
        }

        return caches.open(CACHE_NAME).then(cache =>
          fetch(request).then(response => {
            return cache.put(request, response);
          })
        );
      });

    event.respondWith(findResponsePromise);
  } else {
    event.respondWith(fetch(request));
  }
});
