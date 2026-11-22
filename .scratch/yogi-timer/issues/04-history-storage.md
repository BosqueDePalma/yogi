# History storage in localStorage

Status: ready-for-agent
Type: task
Blocked by: 03

A small module that loads and saves History (Lessons and their Runs) as one JSON document in localStorage.

## Scope

- Load: return an empty History if nothing is saved or the saved data is corrupt (never crash).
- Save after every change: a Run completed, a Run stopped, a Run replaced, a Lesson deleted.
- Delete a Lesson by id.
- Put a version number in the JSON so later changes to the format can be migrated.
- Save the Run that is going (`activeRun`) in the same document: the whole `{ lessons, activeRun }` state from issue 03. Save when a Run starts as well.

## Done when

Vitest covers loading, saving, corrupt data and deletion, using a fake storage object.

## Comments
