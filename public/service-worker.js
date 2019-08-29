/*
 * @license
 * Your First PWA Codelab (https://g.co/codelabs/pwa)
 * Copyright 2019 Google Inc. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License
 */
'use strict';

// CODELAB: Update cache names any time any of the cached files change.
const CACHE_NAME = 'static-cache-v1';

// CODELAB: Add list of files to cache here.
const FILES_TO_CACHE = [
  //'/',
  '/offline.html',
  '/index.html',
  '/assets/js/app.js',
  '/assets/js/install.js',
  '/assets/js/intlTelInput-jquery.min.js',
  '/assets/js/intlTelInput.js',
  '/assets/js/script.min.js',
  '/assets/js/utils.js',
  '/assets/js/jquery.min.js',

  '/assets/bootstrap/css/bootstrap.min.css',
  '/assets/bootstrap/js/bootstrap.min.js',

  '/assets/css/styles.min.css',
  '/assets/css/styles.css',
  '/assets/css/Map-Clean.css',
  '/assets/css/Profile-Card.css',
  '/assets/css/Profile-Card-1.css',
  '/assets/css/Registration-Form-with-Photo.css',
  '/assets/css/Navigation-with-Button.css',
  '/assets/css/Login-Form-Clean.css',
  '/assets/css/intlTelInput.css',
  '/assets/css/Footer-Dark.css',
  '/assets/css/Features-Clean.css',
  '/assets/css/Features-Boxed.css',

  '/assets/img/2.jpg',
  '/assets/img/flags.png',
  '/assets/img/flags@2x.png',
  '/assets/img/index.png',
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
