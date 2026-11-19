# Kategorien für Habits mit Filter

Issue: #1  ·  Status: approved  ·  Approved-by: Philip Rekers, 2026-11-19

## Context

Wer viele Habits verfolgt, kann sie gruppieren und die Habit-Liste oder Today-Ansicht auf eine Gruppe eingrenzen. Die Zuordnung bleibt im Browser, lässt sich jederzeit am Habit ändern und bleibt beim Backup erhalten.

## Research

| File | Why it matters |
| --- | --- |
| [Original-Issue #1](https://github.com/dinooo13/habit-tracker-demo/issues/1) | Verlangt optionale Zuordnung, URL-Filter, korrekte Leerzustände sowie Unterstützung alter Browserdaten und Backups. |
| [App-Daten](../app/types/app-data.ts), [Store](../app/stores/habits.ts), [HabitForm](../app/components/HabitForm.vue) | `Habit`, `HabitCreateInput`, `HabitUpdateInput` und `createHabit`/`updateHabit` bilden Modell, Formular und Speicherung ab. |
| [Habit-Liste](../app/pages/app/habits/index.vue), [Today](../app/pages/app/index.vue) | Die Liste hat Archivfilter und Seitennavigation. Today leitet Open, Reviewed und den Fortschritt aus fälligen Habits ab. |
| [Zod-Schema](../app/utils/persistence/storage-schema.ts), [Backup](../app/utils/persistence/backup.ts), [Tab-Merge](../app/utils/persistence/merge-app-data.ts) | Aktuelles und lenientes Schema validieren getrennt. Habits-only-Import führt Datensätze per ID zusammen. Der Tab-Merge vergleicht Habit-Felder. |
| [Browser-Fixtures](../e2e/support/data.ts), [Habit-Tests](../e2e/specs/habits.spec.ts), [Today-Tests](../e2e/specs/dashboard.spec.ts) | Vorhandene Builder und Browserabläufe für Zuordnung, Reload und Statuswechsel. |

ADR-0006 und ADR-0022 regeln Validierung und Versionsmigration. ADR-0024 regelt den Tab-Merge. Die additive Erweiterung erhält einen eigenen ADR.

Entschieden sind feste Kategorien plus eigene Namen, `No category` für fehlende Zuordnungen und Badges in beiden Ansichten. Eigene Kategorien werden im Habit-Formular verwaltet.

## Requirements

### Must

- Das Create/Edit-Formular bietet `Health`, `Learning`, `Work`, `Other` und `No category`. Nutzer können eine eigene Kategorie mit einem getrimmten, nicht leeren Namen von bis zu 40 Zeichen anlegen oder einen vorhandenen Namen wiederverwenden. Der Vergleich für neue Namen ignoriert Groß-/Kleinschreibung, nutzt reservierte Anzeigenamen nicht als eigene Kategorie und berücksichtigt archivierte Habits. Eine Änderung oder Entfernung im Formular betrifft das bearbeitete Habit. Eigene Kategorien stehen zur Auswahl, solange mindestens ein Habit sie verwendet. Karten mit Zuordnung zeigen deren Namen als Badge in Liste und Today.
- Die Listenfilter bieten `All categories`, die festen Kategorien, vorhandene eigene Kategorien und `No category`. `?category=` enthält einen festen Schlüssel, den reservierten Schlüssel für fehlende Zuordnung oder eine stabile, mit `createId` erzeugte Kategorie-ID. Eigene Namen erscheinen nicht im URL-Wert. Reload, Direktaufruf und Browser-Navigation stellen den gültigen Filter wieder her. Ein unbekannter Wert zeigt alle Habits. Zurücksetzen entfernt nur `category`. Eigene Filterlinks brauchen Kategorie-IDs, die im jeweiligen Browserdatenbestand oder importierten Backup vorhanden sind.
- In der Habit-Liste wirkt der Filter mit der Archivoption zusammen und setzt die Seitennavigation auf Seite 1. Today filtert Open und Reviewed sowie die zugehörigen Zähler. Datumsnavigation, pausierte Habits und der Streak-Überblick behalten ihren aktuellen Geltungsbereich. Bei leerer Auswahl nennt die Ansicht Kategorie und Grund und bietet `Show all categories` an. Sind außerhalb des Filters fällige Habits offen, zeigt Today an, dass der Filter sie ausblendet.
- `schemaVersion` bleibt 2. Das optionale Habit-Feld speichert einen festen Schlüssel, eine eigene Kategorie als `{ id, label }` oder `null` bei explizit entfernter Zuordnung. V1 und bisherige V2-Daten ohne das Feld lesen sich als `No category`. Vollbackups behalten gültige Kategorien und ihre IDs. Beim Habits-only-Import bleibt eine bestehende Zuordnung bei fehlendem Feld erhalten, während `null` sie entfernt und eine gültige Kategorie sie ersetzt. Das leniente Schema lässt eine ungültige Zuordnung bei einem ansonsten importierbaren Habit aus. Ein reiner Kategoriewechsel wird beim Tab-Merge als Änderung erkannt.

### Should

- Filter und Badges bleiben im mobilen Layout bedienbar. Die Auswahl im Formular kann nach vorhandenen Namen durchsucht werden.

### Won't (this time)

- Zentrale Kategorieverwaltung, Mehrfachzuordnung und zusätzliche Filter in Review oder Insights.

## Non-goals

Die Daten bleiben im Browser. Die bestehenden KI-Prompts erhalten keine Kategorienamen. Demo- und Altdaten ohne Zuordnung bleiben unzugeordnet.

## Tasks

1. [x] Schema-, Backup-, Merge- und Store-Regressionen zuerst in `tests/storage-schema.test.ts`, `tests/backup.test.ts`, `tests/merge-app-data.test.ts` und `tests/habits-store.test.ts` abdecken. Typen, Domänenhelfer, Store, Schemas und Merge anpassen. Den neuen ADR in `docs/adr/` indexieren.
2. [ ] Formular- und E2E-Tests für Auswahl, Wiederverwendung und Löschen der Zuordnung ergänzen. `HabitForm.vue`, `app/pages/app/habits/new.vue`, `app/pages/app/habits/[id].vue` und bei Bedarf die Builder unter `e2e/support/` anpassen.
3. [ ] URL-, Archiv- und Paginierungsfälle in der Habit-Liste testen. Danach einen gemeinsamen URL-Filter unter `app/composables/` und die Listenansicht implementieren.
4. [ ] Today-Regressionen in `e2e/specs/dashboard.spec.ts` oder einem eigenen Kategorien-Spec abdecken. Danach `app/pages/app/index.vue` um Filter, Badges, Zähler und Leerzustände ergänzen.

## Acceptance criteria

- [ ] AC1 — Feste Kategorie, eigener Name und leere Zuordnung lassen sich im Create/Edit-Formular wählen und nach Reload wiederfinden. Eine vorhandene eigene Kategorie ist wiederverwendbar. Badges zeigen die Zuordnung.
- [ ] AC2 — Beide Ansichten filtern nach festen und eigenen Kategorien sowie nach `No category`. Gültige geteilte Links und Reload stellen die Auswahl wieder her. Ein unbekannter Wert zeigt alle. Zurücksetzen erhält andere Query-Parameter. Archivoption und Listenpagination bleiben korrekt.
- [ ] AC3 — Open, Reviewed und die Today-Zähler sind kategoriekonsistent. Sind zwei Health-Habits erledigt und ein Learning-Habit offen, erscheint unter Health nur die passende Leermeldung mit Hinweis auf das ausgeblendete Habit. Reset zeigt das offene Habit. Auch eine Kategorie ohne fällige Habits und eine leere Liste bieten Reset an.
- [ ] AC4 — Alte Browserdaten, V1- und bisherige V2-Backups laden ohne Datenverlust. Neue Backups erhalten Namen und IDs. Ein Legacy-Teilimport behält eine bestehende Zuordnung, und explizites `null` entfernt sie.
- [ ] AC5 — Der Tab-Merge erkennt eine Kategorieänderung. Der neue ADR erklärt Kompatibilität und URL-Verhalten. Alle vier Gates laufen grün.

## Verification plan

| AC | How we prove it | Type |
| --- | --- | --- |
| AC1 | Formular testen. In Habit List → Create habit `Health` speichern, neu laden, bearbeiten, einen eigenen Namen anlegen und bei einem zweiten Habit auswählen. Reload, Badge und `No category` prüfen. | unit / e2e / browser |
| AC2 | In Habit List und Today Filter auswählen, URL kopieren, neu öffnen und zurücksetzen. Unbekannten Schlüssel, einen zusätzlichen Query-Parameter, Archivoption und Seitenwechsel prüfen. Mobile Playwright-Konfiguration ausführen. | e2e / browser |
| AC3 | Zwei Health-Habits plus offenes und geprüftes Learning-Habit vorbereiten. Today → Health → Open, beide Health-Habits erledigen, Hinweis nach Reload prüfen, Reviewed öffnen, fremdes geprüftes Habit ausschließen und mit `Show all categories` das offene Learning-Habit sehen. Zusätzlich leere Kategorie in Today und der Habit-Liste wählen. | e2e / browser |
| AC4 | V1- und bisherige V2-Fixtures, Wiederherstellung aus IndexedDB und Vollbackup, Legacy-Teilimport und explizites Leeren prüfen. | unit / e2e |
| AC5 | Kategorie-only-Merge und ADR-Index prüfen, danach alle Gates ausführen. | unit / e2e |

Gates: `npm run lint`, `npm run typecheck`, `npm test`, `PORT=3110 E2E_PORT=3110 npm run test:e2e`.
