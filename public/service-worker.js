
'use strict';
importScripts('/workbox/workbox-v4.3.1/workbox-sw.js');
//importScripts('/firebase/config.js');
//importScripts('/assets/js/firebase-app.js');
//importScripts('/assets/js/firebase-messaging.js');

workbox.setConfig({
  modulePathPrefix: '/workbox/workbox-v4.3.1/'
});

workbox.routing.registerRoute(
  new RegExp('^https://upayahead.web.app/*'),
  new workbox.strategies.CacheFirst()
);

// CODELAB: Update cache names any time any of the cached files change.
const CACHE_NAME = 'static-cache-v1';

// CODELAB: Add list of files to cache here.
const FILES_TO_CACHE = [
  '/',
  '/offline.html',
  '/index.html',
  '/signin.html',
  '/signup.html',
  '/landing.html',
  '/user.html',
  '/pay.html'
];

self.addEventListener('install', (evt) => {
  console.log('[ServiceWorker] Install');

  // CODELAB: Precache static resources here.
  evt.waitUntil(
	    caches.open(CACHE_NAME).then((cache) => {
	      console.log('[ServiceWorker] Pre-caching offline page');
	      return cache.addAll(FILES_TO_CACHE);
	    })
	);


  self.skipWaiting();
});

self.addEventListener('activate', (evt) => {
  console.log('[ServiceWorker] Activate');

  // CODELAB: Remove previous cached data from disk.
  evt.waitUntil(
	    caches.keys().then((keyList) => {
	      return Promise.all(keyList.map((key) => {
	        if (key !== CACHE_NAME) {
	          console.log('[ServiceWorker] Removing old cache', key);
	          return caches.delete(key);
	        }
	      }));
	    })
	);


  self.clients.claim();
});

self.addEventListener('fetch', (evt) => {
  console.log('[ServiceWorker] Fetch', evt.request.url);
  
  // CODELAB: Add fetch event handler here.
  if (evt.request.mode !== 'navigate') {
    // Not a page navigation, bail.
    return;
  }
  evt.respondWith(
      fetch(evt.request)
          .catch(() => {
            return caches.open(CACHE_NAME)
                .then((cache) => {
                  return cache.match('offline.html');
                });
          })
  );

});


//const host = self.location.href.slice(0, self.location.href.lastIndexOf("/"));
/*firebase.initializeApp(config);
const msging  = firebase.messaging();

/*msging.setBackgroundMessageHandler(function(payload) {
  //console.log('[firebase-messaging-sw.js] Received background message ', payload);
  // Customize notification here
  console.log(payload);
  /*const notificationTitle = 'PayAhead';
  const notificationOptions = {
    //icon: 'assets/img/icons/icon-32x32.png',
    body: 'Background Message body.'
  };*

  //return self.registration.showNotification(notificationTitle, notificationOptions);
  return null;
});*/