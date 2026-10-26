/* Global Meta Pixel. Include once in the shared <head> on every public page. */
(() => {
  'use strict';
  const pixelId = '28954247230907460';
  const guard = '__brushstrokesMetaPixel';
  if (window[guard]) return;
  const state = window[guard] = {viewContent: false};

  // Official Meta asynchronous base loader; reuse any existing fbq instance.
  !function(f,b,e,v,n,t,s)
  {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
  n.callMethod.apply(n,arguments):n.queue.push(arguments)};
  if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
  n.queue=[];t=b.createElement(e);t.async=!0;
  t.src=v;s=b.getElementsByTagName(e)[0];
  s.parentNode.insertBefore(t,s)}(window,document,'script',
  'https://connect.facebook.net/en_US/fbevents.js');

  // Only explicit events: no automatic form/metadata matching configuration.
  window.fbq('set', 'autoConfig', false, pixelId);
  window.fbq('init', pixelId);
  window.fbq('trackSingle', pixelId, 'PageView');

  function salesPageView() {
    if (state.viewContent || !document.body?.classList.contains('sales-v2')) return;
    state.viewContent = true;
    window.fbq('trackSingle', pixelId, 'ViewContent');
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', salesPageView, {once: true});
  } else salesPageView();

  function checkoutClick(event) {
    if (event.defaultPrevented) return;
    if (event.type === 'click' && event.button !== 0) return;
    if (event.type === 'auxclick' && event.button !== 1) return;
    const link = event.target?.closest?.('a[data-checkout]');
    if (!link || link.hasAttribute('download')) return;
    const offers = {
      basic: {key: 'CHECKOUT_BASIC_URL', value: 14.90},
      complete: {key: 'CHECKOUT_COMPLETE_URL', value: 24.90}
    };
    const offer = offers[link.dataset.checkout];
    if (!offer) return;
    const configured = (window.SITE_CONFIG || {})[offer.key];
    if (!configured) return;
    try {
      // Require a real, absolute HTTP(S) checkout URL and the actual matching link.
      const expected = new URL(configured);
      const destination = new URL(link.href);
      const current = new URL(window.location.href);
      if (!['https:', 'http:'].includes(expected.protocol)) return;
      if (destination.href !== expected.href) return;
      if (destination.origin === current.origin && destination.pathname === current.pathname) return;
    } catch { return; }
    window.fbq('trackSingle', pixelId, 'InitiateCheckout', {
      currency: 'GBP', value: offer.value
    });
  }
  // One delegated listener also handles future/re-rendered offer links.
  document.addEventListener('click', checkoutClick);
  document.addEventListener('auxclick', checkoutClick);
})();
