# Sign-Up Page - Claude JS Review Packet

## File
- sign-up.html

## Purpose
Static sign-up demo behavior with account role selection and local route remapping.

## JavaScript
```javascript
// Simple account type selector for the prototype
// In production, this maps to Clerk publicMetadata.role on signup
document.querySelectorAll('.type-card').forEach(card => {
  card.addEventListener('click', () => {
    document.querySelectorAll('.type-card').forEach(c => c.classList.remove('active'));
    card.classList.add('active');
  });
});

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
Review this static sign-up page script.
It handles role-card selection in the UI prototype and route remapping in file:// mode.

Please evaluate:
1) UX and accessibility of role selection
2) route mapping robustness
3) maintainability and extensibility
4) likely bugs when integrating real auth
5) improvements for keyboard-only users

Return:
1. Top 8 improvements by impact
2. Quick wins under 30 minutes
3. Medium changes (1-3 hours)
4. Suggested refactored JS structure
```
