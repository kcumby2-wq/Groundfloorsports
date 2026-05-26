# Sign-In Page - Claude JS Review Packet

## File
- sign-in.html

## Purpose
Static sign-in demo behavior for local preview route mapping.

## JavaScript
```javascript
(function () {
  if (window.location.protocol !== 'file:') return;

  const map = {
    '/forgot-password': 'preview-route.html?path=%2Fforgot-password',
    '/terms': 'preview-route.html?path=%2Fterms',
    '/privacy': 'preview-route.html?path=%2Fprivacy',
    '/nil': 'preview-route.html?path=%2Fnil'
  };

  document.querySelectorAll('a[href^="/"]').forEach((link) => {
    const href = link.getAttribute('href') || '';
    if (map[href]) {
      link.setAttribute('href', map[href]);
    }
  });
})();
```

## Prompt For Claude
```text
Review this static sign-in page script.
I use it only in file:// preview mode to remap production-style routes.

Please evaluate:
1) route mapping robustness
2) maintainability if route list grows
3) accessibility or UX side effects
4) possible broken-link scenarios
5) safer patterns for static preview mode

Return:
1. Top 6 improvements by impact
2. Quick wins under 20 minutes
3. Medium improvements (1-2 hours)
4. Example revised implementation
```
