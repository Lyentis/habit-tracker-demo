# AGENTS.md

## Projektkontext

- Lies `README.md` für Einrichtung und Projektstruktur.
- Lies bei Architekturänderungen `docs/architecture.md` und die betroffenen
  Entscheidungen in `docs/adr/`.
- Nutze Node 22 (`.nvmrc`) und npm. Texte der App bleiben auf Englisch.

## Dokumentenindex

- [README](README.md) – Projektübersicht, Einrichtung und Befehle.
- [Dokumentationsübersicht](docs/README.md) – Einstieg in die Projektdokumentation.
- [Architektur](docs/architecture.md) und [ADR-Index](docs/adr/README.md) – Aufbau und Architekturentscheidungen.
- [Glossar](docs/glossary.md) – Fachbegriffe des Habit Trackers.
- [Tests](docs/TESTING.md) und [Playwright](docs/e2e-testing.md) – Testaufbau und Browserprüfungen.
- [Sicherheit](SECURITY.md) und [DSGVO](docs/DSGVO.md) – Sicherheitsmodell und Datenschutzprüfung.
- [DSGVO-Prüfbericht](docs/DSGVO-PRUEFBERICHT.md) – Befunde und offene Betreiberfragen vom 18. November 2026.
- [Kurs](KURS.md) – Übungen, Branches und Arbeitsabläufe.
- [Spezifikation für Habit-Kategorien](specs/kategorien.md) – Entwurf aus der zweiten Kursstufe.
- [Spec-Skill für Codex](.agents/skills/spec/SKILL.md) und [Spec-Workflow](.claude/skills/spec/SKILL.md) – Spezifikationen erarbeiten.
- [DSGVO-Skill](.agents/skills/dsgvo/SKILL.md) – Datenschutzprüfung im Repo durchführen.
- GitHub-Vorlagen für [Pull Requests](.github/PULL_REQUEST_TEMPLATE.md), [Features](.github/ISSUE_TEMPLATE/feature_request.yml) und [Bugs](.github/ISSUE_TEMPLATE/bug_report.md).

Aktualisiere diesen Index in derselben Änderung, wenn ein Repository-Dokument
hinzukommt, umbenannt, verschoben oder entfernt wird. Ergänze für neue Dateien
einen relativen Link und eine kurze Beschreibung. Einzelne ADRs pflegst du im
verlinkten ADR-Index. Prüfe vor Abschluss, dass die betroffenen Links auflösbar sind.

## Architektur

- Erhalte die Anwendung als clientseitige Nuxt-4-PWA (`ssr: false`).
  Die App-Daten bleiben im Browser.
- Halte den Anwendungszustand in Pinia und speichere ihn über den bestehenden
  `PersistenceAdapter`. Hinter dem Adapter liegt standardmäßig Dexie/IndexedDB.
- Lies den passenden ADR vor Änderungen an Persistenz, Datenmodell, Auth,
  Tab-Synchronisierung oder zentralen Abhängigkeiten. Erfasse strukturelle
  Änderungen in einem neuen ADR.
- Lies für UI-Funktionen den Zustand aus den Stores. Lege reine Berechnungen
  in `app/utils/domain/` ab und rendere das Ergebnis in Vue-Komponenten.
- Nutze `useHabitActions()` für Änderungen, die mehrere Habit-bezogene Stores
  betreffen, und `useClock()` für das reaktive lokale Datum.
- Änderungen am persistierten Datenmodell in `app/types/app-data.ts` oder am
  Zod-Schema brauchen einen neuen ADR. Stelle sicher, dass sich bestehende
  Daten und JSON-Backups weiterhin laden lassen.

## Änderungen prüfen

- Führe vor Implementierungscommits `npm run lint`, `npm run typecheck`,
  `npm test` und `npm run test:e2e` aus. Erhalte die Aussagekraft bestehender
  Tests, wenn du Fehler in den Prüfungen behebst.
- Nutze für reine Logik das Vitest-Projekt `unit` und für Komponenten mit
  Nuxt-Laufzeit das Projekt `nuxt`. Details stehen in `docs/TESTING.md`.
- Verwende für den Dev-Server und Playwright Port 3110. Setze `PORT=3110`
  und für E2E zusätzlich `E2E_PORT=3110`. Nutze für E2E-Testdaten die
  Builder aus `e2e/support/data.ts`. Details stehen in `docs/e2e-testing.md`.
- Berichte, welche Prüfungen gelaufen sind und welche fehlgeschlagen
  oder offen geblieben sind.
