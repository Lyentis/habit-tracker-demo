# Verify-Skill für den Habit Tracker

Issue: none  ·  Status: approved  ·  Approved-by: Philip Rekers, 2026-11-19

## Context

Das Entwicklungsteam des Habit Trackers soll nach `/code` mit einem Aufruf prüfen können, ob die Umsetzung die freigegebene Spezifikation erfüllt. `/verify` führt die Gates aus, sammelt Belege je Akzeptanzkriterium und übergibt behebbare Befunde an `/code`. Nach der Integration wiederholt der Lauf die Prüfung und hält Befunde und Fixes im Abschlussbericht fest.

## Research

| File | Why it matters |
| --- | --- |
| [AGENTS.md](../AGENTS.md), [Code-Skill](../.agents/skills/code/SKILL.md) | Regeln für Skill-Pfade, Gates, Red-Nachweis und einen Commit je Aufgabe. Code delegiert bereits über getrennte Worktrees. Der neue Fix-Lauf ergänzt die Berichtsaufnahme und den Umgang mit bekannten Fehlern im Ausgangsstand. |
| [package.json](../package.json), [vitest.config.ts](../vitest.config.ts), [playwright.config.ts](../playwright.config.ts) | `npm test` startet `unit` und `nuxt`. Playwright fährt Desktop und Mobile und kann lokal einen vorhandenen Server wiederverwenden. |
| [Kategorie-Spec](kategorien.md#verification-plan), [Today-Ansicht](../app/pages/app/index.vue#L650), [E2E E4](../e2e/specs/categories.spec.ts#L105), [Kategorie-Tests](../tests/categories.test.ts#L70) | Reale Belege für AC5 (Filter, Leerzustand, Reload) und AC6 (Altdaten und Backups). |

ADR-0012 legt die beiden Vitest-Projekte fest. ADR-0020 beschreibt auch die lokale Playwright-Vorschau. ADR-0026 ist beim Abgleich der Kategorie-Spec relevant. Die Änderung betrifft den Prüfablauf des Projekts und braucht keinen neuen App-ADR.

Entscheidungen aus der Klärung: automatisierter Prüf- und Fix-Ablauf, automatische Übernahme des Berichts durch `/code` und ein separater Commit für den Abschlussbericht. Eigenständige Prüfungen und Fixes können an Subagenten übergeben werden.

## Requirements

### Must

- `$verify specs/<slug>.md` liest die Spec vollständig, prüft den aktuellen Stand samt Diff zum Ausgangspunkt und protokolliert Branch, geprüften SHA und gegebenenfalls lokale Änderungen. Bei fehlendem Argument darf der Skill eine eindeutige Spec aus dem Kontext wählen. Bei Mehrdeutigkeit fragt er nach.
- Alle vier Gates laufen einzeln im geprüften Checkout, auch wenn ein vorheriges Gate fehlschlägt. E2E verwendet die lokale Playwright-Vorschau des geprüften Checkouts auf Port 3110 und beide konfigurierten Projekte. Geerbte E2E-Overrides dürfen weder auf einen entfernten Server zeigen noch die Vorschau durch den Dev-Server ersetzen. Bei fremdem oder ungeklärtem Portinhaber bleibt dessen Prozess unangetastet und E2E wird als blockiert gemeldet. Je Gate stehen Kommando, Ergebnis, Laufzeit, verfügbare Testzahlen und bei Problemen die konkrete Ursache im Bericht. Ein roter Lauf wird als Befund erfasst.
- Jedes Akzeptanzkriterium (**AC**) und jede Muss-Anforderung erhält einen Codebeleg (`Pfad:Zeile`) und einen Testbeleg (Datei, Testname, relevante Assertion und beobachtetes Ergebnis) oder eine benannte Lücke. Muss-Anforderungen können auf vollständig zugeordnete ACs verweisen. Status je AC ist `met`, `partly met` oder `not met`. `met` setzt voraus, dass Code und beobachtete Tests alle Teile des AC belegen. Bleibt eine zugesagte Assertion wegen eines früheren Testfehlers unerreicht, bleibt dieser Teil offen. Bei rein dokumentarischen ACs ist das Dokument der Quellbeleg, die zugehörige beobachtbare Prüfung der Prüfbeleg.
- Der Verify-Aufruf koordiniert Prüfrunden und schreibt `specs/<slug>.verification.md` zunächst als Arbeitsbericht. Eine nummerierte Fix-Liste hält je Befund AC/Muss-Anforderung oder Gate, Fundstelle, Soll/Ist und reproduzierbaren Red-Test, fehlenden Testfall oder Blocker-Ursache fest. Verify prüft, protokolliert und delegiert. Änderungen an App-Code, Tests oder Projektkonfiguration erfolgen im Code-Schritt.
- `$code specs/<slug>.md` lädt den zugehörigen Bericht automatisch, falls er existiert. Es gleicht offene Punkte mit der freigegebenen Spec und dem aktuellen Stand ab. Bei älteren Berichten prüft es erneut, ob der Befund noch gilt. Bereits erledigte Punkte und Punkte außerhalb der Freigabe gehen in den Status zurück, ohne einen Fix-Commit auszulösen. Im automatisierten Fix-Lauf gilt der aktuelle Arbeitsbericht als erwartete Änderung. Weitere uncommittete Änderungen bleiben geschützt.
- `/code` delegiert unabhängige Fixes mit getrennten Schreibbereichen nach den bestehenden Worktree-Regeln. Gemeinsame Ressourcen wie Port 3110 werden nacheinander verwendet. Ein bestätigter Code- oder Testbefund folgt Red → Green mit sichtbarer Assertion vor dem Fix, grünem gezieltem Test danach und genau einem Commit. Im Fix-Lauf dürfen protokollierte, einem anderen Punkt zugeordnete Gate-Fehler bis zu dessen Fix offen bleiben. Neue Fehler blockieren die Integration. Lokal behebbare Umgebungsblockaden dürfen im Rahmen des Prüflaufs behoben und erneut geprüft werden. Dafür wird ein überprüfbarer Vorher-Nachher-Nachweis erfasst. Ein Commit entsteht dafür, falls der Fix eine versionsverwaltete Änderung erfordert. Fremde Prozesse und Änderungen bleiben unangetastet.
- Nach integrierten Fixes laufen alle vier Gates und der Spec-Abgleich am neuen Stand erneut. Der Ablauf arbeitet weitere behebbare Punkte ab und endet, wenn alles belegt und grün ist oder kein autorisierter Schritt mehr Fortschritt bringt. Wiederholte Befunde ohne Fortschritt und externe Blockaden bleiben offen. Ein Wiederholungslauf folgt einer konkreten Änderung am Code oder an den Prüfbedingungen.
- Der Abschlussbericht erhält `Pass` bei vier grünen Gates, vollständigen Belegen und ohne offene blockierende Befunde, sonst `Issues found`. Er enthält den final geprüften Stand, die finalen Gate- und AC-Ergebnisse sowie je gefundenem Punkt den Verlauf mit Red-/Green-Nachweis, Fix-Commit oder dokumentierter Umgebungsmaßnahme und gegebenenfalls verbleibendem Blocker. Nur der Abschlussbericht wird separat als `docs(spec): add verification report for <slug>` committet.

### Should

- Zusammengehörige Symptome in einem Fix-Punkt bündeln und Änderungen außerhalb der Spec im Bericht benennen.

### Won't (this time)

- Separater Reviewer, manueller Browser-Walk als Verify-Stufe, Hooks, PR-Erstellung und Push.

## Non-goals

Die Umsetzung dieser Spec betrifft den Prüfablauf und die Skills des Habit Trackers. App-Verhalten, Datenmodell und Backup-Kompatibilität richten sich bei einem späteren Fix-Lauf nach der jeweiligen freigegebenen Feature-Spec.

## Tasks

1. [x] Die Testfälle unten als Abnahmeprotokoll vor der Skill-Änderung festhalten. Danach `.agents/skills/verify/SKILL.md` für Prüfrunde, Fix-Liste und Abschlussbericht anlegen und bytegleich nach `.claude/skills/verify/SKILL.md` spiegeln.
2. [ ] Die Today-Regression aus Kategorie-AC5 als Übergabeszenario vorbereiten. Beide `code/SKILL.md`-Dateien bytegleich um automatische Berichtsaufnahme und den Fix-Lauf ergänzen. In beiden Verify-Kopien die Übergabe an Code, Wiederholung und Abbruch festlegen. Den Verify-Skill in `AGENTS.md` indexieren.
3. [ ] Die Abnahmefälle in getrennten Test-Checkouts durchlaufen. Gate-Ergebnisse, Bericht und Commit-Verlauf vergleichen und die Skill-Kopien auf Bytegleichheit prüfen.

## Acceptance criteria

- [ ] AC1 — Ein Verify-Lauf protokolliert Lint, Typecheck, Vitest und Playwright für den lokalen Checkout. Ein blockiertes oder rotes Gate ist sichtbar und die übrigen Gates werden trotzdem ausgeführt.
- [ ] AC2 — Der Bericht ordnet jedem AC und jeder Muss-Anforderung nachvollziehbare Quellen und Testbelege zu. Eine fehlende oder unerreichte Assertion kann kein `met` ergeben.
- [ ] AC3 — Ein Verify-Aufruf verarbeitet den E4-Fehlschlag zum gefilterten Today-Leerzustand bis zur vollständigen Nachprüfung. Der Abschlussbericht enthält den ursprünglichen Befund zu Kategorie-AC5, Red, Green, Fix-Commit und die finalen Ergebnisse. Es gibt genau einen separaten Bericht-Commit.
- [ ] AC4 — `/code` lädt den Bericht automatisch und vergleicht ihn mit dem aktuellen Stand. Unabhängige Fixes können getrennt delegiert werden. Jeder integrierte Code-Fix hat Red, Green und einen Commit. Ein bereits behobener alter Befund löst keinen weiteren Fix aus.
- [ ] AC5 — Codex findet `verify` im Repo. Die jeweiligen Skill-Dateien unter `.agents/skills/` und `.claude/skills/` sind bytegleich, und der Indexlink ist gültig.
- [ ] AC6 — Ein lokal behebbarer Blocker wird nach der Maßnahme erneut geprüft und im Abschlussbericht dokumentiert. Ein verbleibender Blocker ergibt `Issues found` mit Ursache und ausstehendem Gate, auch wenn andere Punkte erfolgreich behoben wurden.

## Verification plan

| AC | How we prove it | Type |
| --- | --- | --- |
| AC1 | Verify mit der Kategorie-Spec ausführen. Vier protokollierte Kommandos und beide Playwright-Projekte prüfen. Im Test-Checkout Lint gezielt fehlschlagen lassen und prüfen, dass die drei anderen Gates laufen. Mit einem bereitgestellten Fremdserver auf 3110 prüfen, dass E2E als blockiert gemeldet wird und der Server weiterläuft. | e2e |
| AC2 | Im Bericht den Ausschluss der globalen Meldung, Reload und Reset für Kategorie-AC5 sowie Altbestand und Backups für Kategorie-AC6 bis zur Assertion nachverfolgen. Ein separater Testlauf mit einem zusätzlichen, unbelegten Probe-AC im Test-Checkout muss die Beleglücke melden. | e2e |
| AC3 | Im Test-Checkout den gefilterten Leerzustand der Today-Ansicht durch den allgemeinen Leerzustand ersetzen. Verify starten und E4-Fehlschlag, Fix, grünen E4 und erneuten Lauf aller Gates verfolgen. Bericht gegen den final geprüften SHA und den Fix-Commit abgleichen. `Pass` mit einer vollständig belegten Probe-Spec und den Bericht als einzigen Pfad im Bericht-Commit prüfen. | e2e |
| AC4 | Den Code-Aufruf mit zwei unabhängig reproduzierbaren offenen Punkten und einem bereits behobenen Punkt aus einem älteren Bericht prüfen. Worktree-Isolation, Red/Green und einen Commit je aktuellem Code-Fix nachweisen. Für den alten Punkt darf kein neuer Commit entstehen. | e2e |
| AC5 | Codex-Skill-Liste auf `verify` prüfen, beide Dateipaare per Hash vergleichen und relative Links im Index auflösen. | e2e |
| AC6 | Einen vom Prüflauf selbst gestarteten Prozess als Port-Blocker auflösen und den E2E-Neulauf prüfen. In einem zweiten Lauf einen reproduzierbaren Vitest-Fehler mit fremdem Port-Blocker kombinieren. Der Vitest-Fix muss im Bericht als behoben stehen, der fremde Prozess weiterlaufen und das blockierte Abschlussgate zu `Issues found` führen. | e2e |

Gates: `npm run lint`, `npm run typecheck`, `npm test`, `PORT=3110 E2E_PORT=3110 npm run test:e2e`.

Für die Abnahme des Skills deckt Playwright den Browserablauf ab. E4 öffnet Today, wählt Health, markiert Run und Stretch als erledigt, prüft den gefilterten Leerzustand, lädt neu und blendet über „Show all categories“ das offene Learning-Habit wieder ein. Die mobile Playwright-Konfiguration führt den Ablauf ebenfalls aus.
