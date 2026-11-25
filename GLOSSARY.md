# Yogi Timer

A countdown timer a yoga teacher uses while teaching, which keeps a history of her lessons.

## Language

The app speaks English and Spanish. A term's _En español_ line is the one word the Spanish app uses for it.

**Teacher**:
A yoga teacher running the app on her own phone while leading a class. Anyone who teaches can use it, and each phone has one Teacher, whose History never leaves that phone.
_Avoid_: User, yogi master, instructor

**Preset**:
One of the fixed durations a Run starts from: 1, 2, 3, 5 or 10 minutes. A tap on a Preset makes it the **Selected Preset**; it doesn't start a Run.
_Avoid_: Button, option, timer length
_En español_: tiempo

**Run**:
One countdown from a Preset's duration, or from that duration once Adjusted, toward zero. A Run belongs to exactly one Lesson. While it is going it can be paused and resumed any number of times.
_Avoid_: Timer, session, round
_En español_: ronda

**Completed Run**:
A Run that counted all the way down to zero.
_En español_: ronda completada

**Stopped Run**:
A Run the Teacher ended before it reached zero, from a pause or by Replacing it. A Stopped Run that counted for less than 5 seconds is a **Mis-tap** and is not kept in History.
_Avoid_: Cancelled, aborted
_En español_: ronda detenida

**Pause**:
Holding a Run's countdown where it is, with a tap on the Lotus dial; another tap **Resumes** it. Time spent paused doesn't count as time the Run ran. The Teacher can stop a Run only while it is paused.
_Avoid_: Hold, freeze
_En español_: pausa (pausar, reanudar)

**Paused Run**:
A Run whose countdown is on hold. A Paused Run still left paused when the Lesson Gap has passed becomes a Stopped Run, ending when it was paused.
_En español_: ronda en pausa

**Selected Preset**:
The Preset the Teacher has tapped and not yet started. She can Adjust its time, then start its Run with a tap on the Lotus dial. Nothing is kept of a Selected Preset that is never started.
_Avoid_: Draft, pending Run, armed Preset
_En español_: tiempo elegido

**Adjust**:
Changing a Selected Preset's time before its Run starts, a step at a time, up or down. Only that Run changes; the Preset stays the same.
_Avoid_: Tweak, edit, fine-tune
_En español_: ajustar

**Chime**:
The sound played once when a Run completes. The Teacher can switch at any time between Singing bowl (the default), Tingsha and Gong.
_Avoid_: Alarm, beep, bell, notification
_En español_: campana (Singing bowl: cuenco)

**Theme**:
The look the Teacher chooses for the app: Glow or Bead, each light or dark. A fixed Theme follows the phone's light or dark mode. **Auto** (the default) rotates through the four looks by the clock instead: Glow light, Glow dark, Bead light, Bead dark, changing at 6:30 am and 6:30 pm.
_Avoid_: Skin, style, colour scheme
_En español_: tema (Glow, Bead and Auto keep their names)

**Replace**:
Ending the Run that is going, paused or not, to select a Preset, which the Teacher confirms with a second tap on that Preset. The replaced Run becomes a Stopped Run and the Preset becomes the Selected Preset; its Run starts like any other. Restarting is replacing with the same Preset.
_Avoid_: Switch, override
_En español_: cambiar

**Lesson**:
One class the Teacher teaches, holding every Run she started during it. Lessons begin and end on their own: a long enough gap between Runs starts a new Lesson, and the Teacher never opens or closes one by hand.
_Avoid_: Session, class
_En español_: clase

**Lesson Gap**:
The 90 minutes after the end of the last Run. A Run started after the Lesson Gap has passed belongs to a new Lesson. Calendar days play no part, so a class running past midnight stays one Lesson.

**History**:
The Teacher's record of past Lessons and their Runs. It lives only in the Home Screen app on her phone.
_Avoid_: Log, stats
_En español_: historial

**Home Screen app**:
Yogi Timer added to the phone's Home Screen and opened from its icon. It keeps its own History, apart from any browser tab, and only it works offline.
_Avoid_: PWA, web app, installed app
_En español_: app de la pantalla de inicio
