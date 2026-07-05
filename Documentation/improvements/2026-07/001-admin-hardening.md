# Admin hardening

## Date
2026-07-04

## Summary
Improved the admin area so it is hidden from the main storefront experience and no longer depends on the old unsafe seed-data pattern for admin access.

## What changed
- Replaced the previous inline admin seed logic with a safer bootstrap initializer.
- Switched admin credentials to configurable values instead of hardcoded plaintext defaults in the app logic.
- Added hidden admin routes under /hidden-admin/*.
- Updated login redirects so admins land on the hidden admin area.
- Removed the visible admin dropdown from the public navbar.
- Added support for an admin-only host so the admin experience can be served from a separate domain in the future.

## Current access guidance
- Public storefront routes remain available from the normal site.
- Admin pages are intended to be accessed only from the admin host, such as admin.sokoonline.co.ke.
- If the app is running locally, the admin routes are still reachable through the hidden paths such as /hidden-admin/products while the host-based guard is configured.
- Admin users should sign in through the normal login flow and must have the ADMIN role.

## Admin setup flow
1. Set the admin creation secret in the backend config using the property app.admin.create-secret.
2. Start the backend.
3. Open the frontend admin setup page at /admin-setup.
4. Enter the same secret value in the Admin secret field.
5. Submit the form to create the first admin account.
6. Sign in at /login with the new admin credentials.

## Admin host setup
- Frontend: set VITE_ADMIN_HOST to the dedicated admin domain, for example admin.sokoonline.co.ke.
- Backend: set CORS origins to include both the public storefront domain and the admin domain.
- DNS and hosting must route the admin domain to the frontend build.

## Operational notes
- Production should override the admin credentials via environment variables.
- The admin area should later be hardened further with MFA, IP allowlisting, and stronger audit logging.
- Keep the admin bootstrap disabled unless an initial admin account is explicitly required.
