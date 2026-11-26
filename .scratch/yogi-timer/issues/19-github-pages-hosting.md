# GitHub Pages hosting

Status: resolved
Type: task
Blocked by: 01, 02, 03, 04, 05, 06, 07, 08, 09, 10, 11, 12, 13, 14, 15, 16, 17, 25, 26, 27, 28
Blocks: 20

**Remind the user once the app is finished. Do not create anything on GitHub without their go-ahead.**

- Create a **public** GitHub repo (free Pages needs public). It contains no personal data, because History stays on the Teacher's phone.
- Add a GitHub Actions workflow that builds with Vite and publishes to Pages on every push to `main`. Set Vite's `base` to the repo path.
- The Teacher opens the https URL in Safari once and adds it to her Home Screen, following the app's install guide ([issue 25](25-install-guide.md)).

## Comments

### 2026-11-25, done.

- **The repo:** the user created the public repo [BosqueDePalma/yogi](https://github.com/BosqueDePalma/yogi) and asked for the app to go up there, with this branch as `main`.
- **Vite's `base`** is `/yogi/` for the build only. The dev server stays at `/`, where the Simulator's Home Screen app points. The built page, manifest, icons, guide screenshots and service worker (scope `/yogi/`) all sit under `/yogi/`.
- **The workflow**, `.github/workflows/pages.yml`, runs the tests, builds and publishes `dist/` to Pages on every push to `main`. Pages is set to build from GitHub Actions.
- **The URL:** https://bosquedepalma.github.io/yogi/
- **Saved data on a shared origin:** every Pages site of the account shares `bosquedepalma.github.io`, and so its localStorage. Yogi Timer's keys all start with `yogi-timer.`, so another site there won't clash with them.
- **Next:** the Teacher opens the URL in Safari and installs it with the guide, the real-iPhone test ([issue 20](20-real-iphone-acceptance-test.md)).
