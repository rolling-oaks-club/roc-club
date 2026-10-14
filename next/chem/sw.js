// Pool Log's service worker (2026-10-14): shows the Manager's notifications. Built into chem/sw.js by .deploy/build-chem.js
// (API is filled in there). The push itself is empty; the words come from the Chemistry web app's pushInbox (Notify.gs),
// which hands this phone whatever it hasn't shown yet. A push must always show something, so a failed look-up still does.
var API = 'https://script.google.com/macros/s/AKfycbzLpS38sr24wHiNVOI8ZdR_hiHaMhLyOcp51w-Rek-U9yTLJZ3FEIwJn5sZSwnzSPgz/exec';
self.addEventListener('install', function () { self.skipWaiting(); });
self.addEventListener('activate', function (e) { e.waitUntil(self.clients.claim()); });
self.addEventListener('push', function (e) {
  e.waitUntil(self.registration.pushManager.getSubscription().then(function (sub) {
    if (!sub) return [];
    return fetch(API, { method: 'POST', body: JSON.stringify({ fn: 'pushInbox', args: [sub.endpoint] }), headers: { 'Content-Type': 'text/plain;charset=utf-8' } })
      .then(function (r) { return r.json(); })
      .then(function (j) { return (j && j.value && j.value.items) || []; });
  }).catch(function () { return []; }).then(function (items) {
    if (!items.length) items = [{ title: 'Pool Log', body: 'Something new: open Pool Log to see it.', tag: 'pool-log' }];
    return Promise.all(items.map(function (it) {
      return self.registration.showNotification(it.title, { body: it.body || '', tag: it.tag || 'pool-log', icon: 'apple-touch-icon.png' });
    }));
  }));
});
self.addEventListener('notificationclick', function (e) {
  e.notification.close();
  e.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (list) {
    for (var i = 0; i < list.length; i++) if ('focus' in list[i]) return list[i].focus();
    return self.clients.openWindow('./');
  }));
});
