# Subscription Tracker TODO

## Backend
- [x] Remove Arcjet (config, middleware, app.js, package.json)
- [x] Fix package.json (mongoose version, add resend + node-cron)
- [x] Simplify signUp (remove Mongo transaction)
- [x] Remove duplicate/unused routes (getUserSubscriptions, getUsers if unused)
- [x] Add .env.example
- [x] Resend email integration + HTML template
- [x] node-cron reminder job (7/3/1 day, no duplicates)
- [x] Final backend verification

## Frontend
- [x] React + Vite + Tailwind setup
- [x] Auth pages (Login/Register)
- [x] Dashboard (totals, active, upcoming renewals)
- [x] Add/Edit/View Subscription pages
- [x] API integration (axios, protected routes, loading/error states)
- [x] Final full-app verification
