# Inventory Keeper

A local React app for tracking physical items by person and role.

## Features

- Sample sign-in flow for `User` and `Admin` accounts
- User dashboard with add, edit, delete, and status/location updates
- Item image upload when creating or editing an item
- Request-style item statuses: `In Storage`, `To Sell`, and `To Give Away`
- Admin inbox that highlights items users want sold or given away
- Admin dashboard that shows all users, their items, and summary counts
- Search and status filtering
- Browser persistence with `localStorage`

## Run it

Use the locally installed Node binaries in this workspace:

```bash
PATH="/Users/jamilaleilani/Documents/New project 7/.local-node/bin:$PATH" npm install
PATH="/Users/jamilaleilani/Documents/New project 7/.local-node/bin:$PATH" npm run dev
```

Then open the local Vite URL shown in the terminal.

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
- `Riley Chen` - Admin - `riley@example.com` / `Admin123!`
