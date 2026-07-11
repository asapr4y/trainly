# Trainly Supabase Setup

This app stays usable with `localStorage` when Supabase is not configured. Once you add a Supabase URL and anon key, Trainly hydrates from Supabase on load and writes changes back to these tables.

## Create The Project

1. Create a Supabase project.
2. Open the SQL editor.
3. Run `supabase/schema.sql`.
4. Copy the project URL and anon public key from Project Settings > API.

## Connect The Frontend

For local testing, open Trainly in the browser and run this once in DevTools:

```js
localStorage.setItem(
  "trainly.supabase.config",
  JSON.stringify({
    url: "https://YOUR_PROJECT_REF.supabase.co",
    anonKey: "YOUR_ANON_PUBLIC_KEY"
  })
);
location.reload();
```

After reload, Trainly will try Supabase first. If the remote tables are empty, the current local/demo data is seeded into Supabase.

## Important

The included policies allow anonymous read/write/delete access for portfolio demo speed. This is not a production security model. Before storing real client data, add authentication and trainer-scoped Row Level Security policies.
