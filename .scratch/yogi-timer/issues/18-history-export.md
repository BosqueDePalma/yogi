# History Export

Status: needs-triage
Type: feature
Blocked by: 17
Blocks: None

**Why:** History lives only on the Teacher's phone. If she removes the app from her Home Screen, or iOS clears its storage, every Lesson is gone, and today there is no way to keep a copy ([ADR 0001](../../../docs/adr/0001-static-home-screen-web-app.md): "there is no backup until an Export feature exists"). An Export in the Settings sheet (issue 17) would let her keep one.

Raised in the Settings grilling session of 2026-11-24 and set aside so that session stayed about the sheet. It needs its own grilling before it is ready.

**Not part of the first version.** It stands on its own: hosting (issue 19) and the real-iPhone test (issue 20) don't wait for it, and it may come after the app is live. It only needs the Settings sheet (issue 17) to live in.

## Open questions

- **What it is for:** a backup she can restore from, or a record she can read (or both)?
- **Format:** JSON (exactly what the app stores, easy to restore), CSV (opens in Numbers), or both?
- **How it leaves the phone on iOS:** the share sheet (`navigator.share` with a file: AirDrop, Files, Mail, Messages) or a plain download into Files? How each behaves in the Home Screen app has to be checked in the Simulator.
- **Import:** is restoring from a file part of this, or later? If it is, does it replace History or merge with it, and what happens to a Run that is going?
- **Reminder:** should the app ever nudge her to export (say, every few weeks), or is it only there when she looks?
- **What goes in:** Lessons and Runs only, or also the Chime and Theme?

## Comments
