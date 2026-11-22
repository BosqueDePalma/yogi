# Static home-screen web app, no backend, no native app

The Teacher uses an iPhone. We ship Yogi Timer as static files on GitHub Pages. She adds it to her home screen once, and after that it runs fully offline, with History kept only in the phone's browser storage. We chose this over a native iOS app to avoid App Store distribution, Xcode and a developer account for a single-user tool, and over a backend because there is only one user and nothing to sync.

## Consequences

- iOS may suspend web apps when the screen locks or another app comes to the front, so the app keeps the screen awake during a Run. On the Teacher's iPhone (tested 2026-11-21) the app kept running while locked and the chime still sounded, with `navigator.audioSession.type = "playback"`. iOS does not promise this, so the Run rules still cover a phone that froze the app: the Run is completed at its planned end and there is no late chime. If a guaranteed chime on a locked phone ever becomes a must-have, we have to revisit this decision and build a native app.
- History lives only on the Teacher's phone. Removing the app from the home screen deletes it, and there is no backup until an Export feature exists.
- Installing on iPhone needs the page served over https once, which is why we use static hosting rather than "no server at all".
