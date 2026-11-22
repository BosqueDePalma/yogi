# Yogi Timer

A one-tap countdown timer a yoga teacher uses while teaching, which keeps a history of her lessons.

## Language

**Teacher**:
The person running the app on her phone while leading a class. The app has exactly one user.
_Avoid_: User, yogi master, instructor

**Preset**:
One of the fixed durations that starts a Run with a single tap: 1, 2, 3, 5 or 10 minutes.
_Avoid_: Button, option, timer length

**Run**:
One countdown from a Preset's duration toward zero. A Run belongs to exactly one Lesson.
_Avoid_: Timer, session, round

**Completed Run**:
A Run that counted all the way down to zero.

**Stopped Run**:
A Run the Teacher ended before it reached zero. A Stopped Run shorter than 5 seconds is a **Mis-tap** and is not kept in History.
_Avoid_: Cancelled, aborted

**Replace**:
Starting a new Run from any Preset while a Run is still going, which the Teacher confirms with a second tap. The replaced Run becomes a Stopped Run. Restarting is replacing with the same Preset.
_Avoid_: Switch, override

**Lesson**:
One class the Teacher teaches, holding every Run she started during it. Lessons begin and end on their own: a long enough gap between Runs starts a new Lesson, and the Teacher never opens or closes one by hand.
_Avoid_: Session, class

**Lesson Gap**:
The 90 minutes after the end of the last Run. A Run started after the Lesson Gap has passed belongs to a new Lesson. Calendar days play no part, so a class running past midnight stays one Lesson.

**History**:
The Teacher's record of past Lessons and their Runs. It lives only on her phone.
_Avoid_: Log, stats
