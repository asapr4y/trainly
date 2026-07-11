# Trainly

A fitness coaching platform for managing clients, workouts, sessions, and progress tracking.

## Features

- Coach dashboard with active clients, upcoming sessions, pending plans, and check-ins
- Client management with profiles, goals, attendance, progress, and coach notes
- Workout plan builder with day presets and exercise details
- Exercise library with muscle-group filtering
- Session scheduling cards with status and quick actions
- Progress tracking with strength trends and goal milestones
- Client check-ins for recovery, adherence, and coach follow-up
- Responsive layout for desktop, tablet, and mobile screens

## Run Locally

```powershell
powershell.exe -ExecutionPolicy Bypass -File .\start.ps1
```

Then open:

```text
http://localhost:4173
```

## Build

```powershell
npm.cmd run build
```

## Supabase

Trainly now has an optional Supabase setup. Without credentials, the app continues to use `localStorage`.

1. Create a Supabase project.
2. Run `supabase/schema.sql` in the Supabase SQL editor.
3. Add the project URL and anon key in browser DevTools:

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

See `supabase/README.md` for details and security notes.
