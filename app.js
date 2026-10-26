(() => {
  'use strict';
  const config = window.SITE_CONFIG || {};
  const checkoutDialog = document.getElementById('checkout-dialog');
  let previousFocus;
  function validHttpUrl(value) {
    try { const url = new URL(value); return ['https:', 'http:'].includes(url.protocol) ? url.href : ''; }
    catch { return ''; }
  }
  const checkoutUrls = {
    basic: validHttpUrl(config.CHECKOUT_BASIC_URL),
    complete: validHttpUrl(config.CHECKOUT_COMPLETE_URL)
  };
  const planNames = {basic: 'Essential Guide · £14.90', complete: 'Complete Collection · £24.90'};
  document.querySelectorAll('[data-checkout]').forEach(link => {
    const plan = link.dataset.checkout;
    const checkoutUrl = checkoutUrls[plan];
    if (checkoutUrl) link.href = checkoutUrl;
    else link.addEventListener('click', event => {
      event.preventDefault();
      previousFocus = link;
      document.getElementById('checkout-selection').textContent = planNames[plan] || '';
      checkoutDialog.showModal();
    });
  });
  document.querySelectorAll('[data-close-checkout]').forEach(button => button.addEventListener('click', () => checkoutDialog.close()));
  [checkoutDialog].forEach(dialog => {
    dialog.addEventListener('click', event => {
      if (event.target === dialog) {
        const box = dialog.getBoundingClientRect();
        if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) dialog.close();
      }
    });
    dialog.addEventListener('close', () => previousFocus?.focus({preventScroll:true}));
  });
  const siteUrl = validHttpUrl(config.SITE_URL);
  if (siteUrl) {
    const imageMeta = document.querySelector('meta[property="og:image"]');
    imageMeta.content = new URL('assets/images/mockups/hero-transformation-v2.jpg', siteUrl.endsWith('/') ? siteUrl : siteUrl + '/').href;
    const urlMeta = document.querySelector('meta[property="og:url"]') || document.createElement('meta');
    urlMeta.setAttribute('property', 'og:url'); urlMeta.content = siteUrl; document.head.append(urlMeta);
    const canonical = document.querySelector('link[rel="canonical"]') || document.createElement('link'); canonical.rel = 'canonical'; canonical.href = siteUrl; document.head.append(canonical);
  }
  // Optional sections accept plain text only. They stay absent until real data is supplied.
  if (config.GUARANTEE?.title && config.GUARANTEE?.text) {
    const section = document.getElementById('guarantee-policy');
    const title = document.createElement('h2'); title.textContent = config.GUARANTEE.title;
    const text = document.createElement('p'); text.textContent = config.GUARANTEE.text;
    section.append(title, text); section.hidden = false;
  }
  const reviews = (config.VERIFIED_REVIEWS || []).filter(review => review.name && review.quote && review.consent === true);
  if (reviews.length) {
    const section = document.getElementById('verified-reviews');
    const title = document.createElement('h2'); title.textContent = 'From people who have used the guide'; section.append(title);
    reviews.forEach(review => {
      const figure = document.createElement('figure'); const quote = document.createElement('blockquote');
      quote.textContent = review.quote; const caption = document.createElement('figcaption'); caption.textContent = review.name;
      figure.append(quote, caption); section.append(figure);
    }); section.hidden = false;
  }
  document.querySelectorAll('[data-year]').forEach(node => { node.textContent = new Date().getFullYear(); });

  // Show the mobile price reminder only after the first pricing section has been reached.
  const sticky = document.getElementById('mobile-offer');
  const firstPrices = document.getElementById('options');
  const priceSections = [...document.querySelectorAll('.pricing-section')];
  const footer = document.querySelector('.site-footer');
  if (sticky && firstPrices && 'IntersectionObserver' in window) {
    const updateOffer = () => {
      const inView = el => { const r = el.getBoundingClientRect(); return r.top < innerHeight && r.bottom > 0; };
      sticky.hidden = !(firstPrices.getBoundingClientRect().bottom < 0 && !priceSections.some(inView) && !inView(footer));
    };
    const observer = new IntersectionObserver(updateOffer, {threshold: [0, 0.01]});
    [...priceSections, footer].forEach(el => observer.observe(el));
    window.addEventListener('scroll', updateOffer, {passive:true});
    window.addEventListener('resize', updateOffer, {passive:true});
    updateOffer();
  }
})();
