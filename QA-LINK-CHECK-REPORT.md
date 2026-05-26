# Static Link QA Report

Date: 2026-05-22
Scope: Static file-preview navigation and link integrity checks
Tester: GitHub Copilot (GPT-5.3-Codex)

## Summary

- Overall status: PASS
- Dead-end links found: 0
- File:// navigation regressions: 0
- Pages covered: marketplace, sign-in, sign-up, admin

## Pass/Fail Matrix

| Page | Links Checked | Passed | Failed | Notes |
|---|---:|---:|---:|---|
| marketplace.html | 21 | 21 | 0 | Includes nav links, template link, and all game cards |
| sign-in.html | 3 | 3 | 0 | Forgot password route mapped to static fallback |
| sign-up.html | 5 | 5 | 0 | Terms, Privacy, NIL routes mapped to static fallback |
| admin.html | 0 | 0 | 0 | Setup state shows no anchor links; modal interaction verified |

## What Was Validated

- Home/logo links resolve to local static pages.
- App-only routes are remapped to static fallback route page.
- Marketplace game cards resolve to local game preview pages.
- Auth cross-links (sign-in/sign-up) resolve correctly.
- No chrome-error dead-end navigations during link traversal.

## Interaction Sanity Checks

- Reconnect Supabase button on admin setup view opens the configuration modal.
- Marketplace search/filter/pagination behavior remained functional after routing changes.

## Known Non-Blocking Notes

- Stripe script requests may show blocked/aborted events in static file preview.
- These events do not break navigation flows in the static prototype.

## Related Files

- marketplace.html
- preview-route.html
- marketplace-game-preview.html
- sign-in.html
- sign-up.html
- admin.html

## Re-Run Guidance

If you want a fresh report after future UI edits, re-run the same click-map flow across:

1. marketplace.html (all visible links)
2. sign-in.html (logo, forgot password, create account)
3. sign-up.html (logo, legal links, sign-in)
4. admin.html (setup state interactions)
