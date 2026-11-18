# AGENTS.md

## Projektkontext

- Lies `README.md` für Einrichtung und Projektstruktur.
- Lies bei Architekturänderungen `docs/architecture.md` und die betroffenen
  Entscheidungen in `docs/adr/`.
- Nutze Node 22 und npm.

## Dokumentenindex

- [README](README.md) – Projektübersicht, Einrichtung und Befehle.
- [Dokumentationsübersicht](docs/README.md) – Einstieg in die Projektdokumentation.
- [Architektur](docs/architecture.md) und [ADR-Index](docs/adr/README.md) – Aufbau und Architekturentscheidungen.
- [Glossar](docs/glossary.md) – Fachbegriffe des Habit Trackers.
- [Tests](docs/TESTING.md) und [Playwright](docs/e2e-testing.md) – Testaufbau und Browserprüfungen.
- [Sicherheit](SECURITY.md) und [DSGVO](docs/DSGVO.md) – Sicherheitsmodell und Datenschutzprüfung.
- [DSGVO-Prüfbericht](docs/DSGVO-PRUEFBERICHT.md) – Befunde und offene Betreiberfragen vom 18. November 2026.
- [Kurs](KURS.md) – Übungen, Branches und Arbeitsabläufe.
- [Spec-Skill für Codex](.agents/skills/spec/SKILL.md) und [Spec-Workflow](.claude/skills/spec/SKILL.md) – Spezifikationen erarbeiten.
- [DSGVO-Skill](.agents/skills/dsgvo/SKILL.md) – Datenschutzprüfung im Repo durchführen.
- GitHub-Vorlagen für [Pull Requests](.github/PULL_REQUEST_TEMPLATE.md), [Features](.github/ISSUE_TEMPLATE/feature_request.md) und [Bugs](.github/ISSUE_TEMPLATE/bug_report.md).

Aktualisiere diesen Index in derselben Änderung, wenn ein Repository-Dokument
hinzukommt, umbenannt, verschoben oder entfernt wird. Ergänze für neue Dateien
einen relativen Link und eine kurze Beschreibung. Einzelne ADRs pflegst du im
verlinkten ADR-Index. Prüfe vor Abschluss, dass die betroffenen Links auflösbar sind.

## Architektur

- Erhalte die Anwendung als clientseitige Nuxt-4-PWA (`ssr: false`).
  Die App-Daten bleiben im Browser.
- Halte den Anwendungszustand in Pinia und speichere ihn über den bestehenden
  `PersistenceAdapter`. Hinter dem Adapter liegt standardmäßig Dexie/IndexedDB.
- Nutze `useHabitActions()` für Änderungen, die mehrere Habit-bezogene Stores
  betreffen, und `useClock()` für das reaktive lokale Datum.
- Prüfe bei Änderungen am gespeicherten Datenformat das Zod-Schema,
  die Migration bestehender Daten und den JSON-Import und -Export.

## Änderungen prüfen

- Führe für Codeänderungen `npm run lint`, `npm run typecheck` und `npm test` aus.
- Nutze für reine Logik das Vitest-Projekt `unit` und für Komponenten mit
  Nuxt-Laufzeit das Projekt `nuxt`. Details stehen in `docs/TESTING.md`.
- Prüfe geänderte Browserabläufe mit Playwright. Verwende bei Kursläufen
  Port 3110 mit `E2E_PORT=3110` und `PORT=3110`. Siehe `docs/e2e-testing.md`
  und `KURS.md`.
- Berichte, welche Prüfungen gelaufen sind und welche fehlgeschlagen
  oder offen geblieben sind.
