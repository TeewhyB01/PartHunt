# PartHunt AI Desktop

This is the Electron desktop shell for PartHunt AI.

The first desktop release loads the production web app:

```text
https://parthunt.vercel.app
```

That keeps the desktop, web, and iOS versions on the same Firebase backend and user data.

## Run

```sh
cd desktop
pnpm install
pnpm start
```

If pnpm blocks Electron's postinstall script, approve it once:

```sh
pnpm approve-builds
```

## Build

```sh
pnpm build:mac
pnpm build:win
pnpm build:linux
```

## Security

- Node integration is disabled.
- Context isolation is enabled.
- External seller links open in the system browser.
- Firebase credentials are client-safe web credentials only.
- Private backend/search keys must stay in Firebase Functions.
