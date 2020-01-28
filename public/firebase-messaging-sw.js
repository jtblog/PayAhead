importScripts('/firebase/config.js');
importScripts('/assets/js/firebase-app.js');
importScripts('/assets/js/firebase-messaging.js');

firebase.initializeApp(config);
const messaging = firebase.messaging();


/*messaging.setBackgroundMessageHandler(function(payload) {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  // Customize notification here
  const notificationTitle = 'Background Message Title';
  const notificationOptions = {
    body: 'Background Message body.',
    icon: '/firebase-logo.png'
  };

  return self.registration.showNotification(notificationTitle,
    notificationOptions);
});
// [END background_handler]
*/
