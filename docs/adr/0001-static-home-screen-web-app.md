# Static home-screen web app, no backend, no native app

The Teacher uses an iPhone. We ship Yogi Timer as static files on GitHub Pages. She adds it to her home screen once, and after that it runs fully offline, with History kept only in the phone's browser storage. We chose this over a native iOS app to avoid App Store distribution, Xcode and a developer account for a single-user tool, and over a backend because there is only one user and nothing to sync.

## Consequences

- iOS suspends web apps when the screen locks or another app comes to the front. A Run's end chime is only reliable while the app is in front with the screen awake, so the app keeps the screen awake during a Run. If a chime at zero on a locked phone ever becomes a must-have, we have to revisit this decision and build a native app.
- History lives only on the Teacher's phone. Removing the app from the home screen deletes it, and there is no backup until an Export feature exists.
- Installing on iPhone needs the page served over https once, which is why we use static hosting rather than "no server at all".
