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

        self.__swgohLastApiCall = self.__swgohLastApiCall || 0;

        return new Promise(resolve => {
          const waitTime = Math.max(
            0,
            self.__swgohLastApiCall + 700 - Date.now()
          );
          self.__swgohLastApiCall = Date.now() + waitTime;
          setTimeout(() => {
            caches
              .open(CACHE_NAME)
              .then(cache =>
                cache.add(request).then(() => cache.match(request))
              )
              .then(resolve)
              .catch(error => {
                throw error;
              });
          }, waitTime);
        });
      });

    event.respondWith(findResponsePromise);
  } else {
    event.respondWith(fetch(request));
  }
});
