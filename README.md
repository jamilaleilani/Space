# Inventory Keeper

A React app for tracking physical items by person and role. It can still run in
local browser mode, but it now also supports a shared Supabase-backed data mode.

## Features

- Sample sign-in flow for `User` and `Admin` accounts
- User dashboard with add, edit, delete, and status/location updates
- Item image upload when creating or editing an item
- Two-step item creation flow with image upload first, then manual item details
- User action choices: `Store`, `Sell`, and `Dispose`
- Lifecycle tabs for `In Storage`, `Returned`, `To Sell`, `To Dispose`, `Sold`, and `Disposed`
- Lifecycle tabs for `In Storage`, `Returned`, `To Sell`, `To Dispose`, `Sold`, `Disposed`, and `Archive`
- Return scheduling for items in storage and storage scheduling for returned items
- Returned items completed from `Cancel storage`, plus `Sold` and `Disposed` items, move into `Archive` after one week
- Admin inbox that highlights items needing action
- Admin dashboard that shows all users, their items, and summary counts
- Search and tab-based status filtering
- Browser persistence with `localStorage`
- Optional shared Supabase backend for accounts and items across browsers

## Run it

Use the locally installed Node binaries in this workspace:

```bash
PATH="/Users/jamilaleilani/Documents/New project 7/.local-node/bin:$PATH" npm install
PATH="/Users/jamilaleilani/Documents/New project 7/.local-node/bin:$PATH" npm run dev
```

Then open the local Vite URL shown in the terminal.

## Shared Supabase setup

To make accounts and items available across browsers for admins and users:

1. Create a Supabase project.
2. Run the SQL in [supabase/schema.sql](/Users/jamilaleilani/Documents/New%20project%207/supabase/schema.sql).
3. Copy `.env.example` to `.env`.
4. Fill in:

```bash
VITE_SUPABASE_URL=your_project_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

5. Restart the Vite app.

When those env vars are present, the app will read and write shared account/item
data through Supabase. If they are missing or Supabase is unreachable, the app
falls back to local browser storage and shows a status banner.

## GitHub Pages

This repo includes a GitHub Actions workflow at [.github/workflows/deploy-pages.yml](/Users/jamilaleilani/Documents/New%20project%207/.github/workflows/deploy-pages.yml).

To publish it:

1. Create a GitHub repository and add it as this repo's `origin` remote.
2. Push the `main` branch to GitHub.
3. In GitHub, open `Settings > Pages` and set `Source` to `GitHub Actions`.
4. The workflow will build and publish the site automatically on each push to `main`.

## Demo accounts

- `Maya Patel` - User - `maya@example.com` / `Maya123!`
- `Jordan Lee` - User - `jordan@example.com` / `Jordan123!`
- `David Balaban` - User - `balabdavid@gmail.com` / `Temp123!`
- `James Breedlove` - Admin - `Breedlovejames@yahoo.com` / `Admin123!`
