# Unabhängiger Review und Browser-Check in Verify

Issue: none  ·  Status: approved  ·  Approved-by: Philip Rekers, 2026-11-19

## Context

Das Kursteam soll bei jedem Verify-Lauf sehen, wie ein unabhängiger Reviewer den Diff beurteilt und wie sich die Änderung bei der Benutzung anfühlt. Zwei Subagenten prüfen denselben Stand. Der Verify-Koordinator führt die Gates aus, bestätigt Befunde und hält die Belege je Akzeptanzkriterium fest.

## Research

| File | Why it matters |
| --- | --- |
| [Verify-Skill](../.agents/skills/verify/SKILL.md) und [Übungskopie](../.claude/skills/verify/SKILL.md) | Definieren Prüfstand, Port 3110, vier Gates, Fix-Runden und Abschlussbericht. Die Kopien sind bytegleich. |
| [KURS.md](../KURS.md) | Die lokalen Referenzen `upstream/stufe/07-verify-review` und `upstream/stufe/08-verify-browser` zeigen den frischen Read-only-Review und einen Browser-Walk auf Desktop und Handy. Der Browser-Walk wird dort vom Verify-Koordinator ausgeführt. |
| [Spec-Skill](../.agents/skills/spec/SKILL.md), [Kategorien-Spec](kategorien.md) | Der Prüfplan enthält Klickpfade mit Reload. Die Kategorien-Spec enthält sichtbare und interne Teile, etwa bei Backups und Tab-Merge. |
| [Playwright-Konfiguration](../playwright.config.ts), [E2E-Dokumentation](../docs/e2e-testing.md) | Die automatisierte Suite prüft bereits Chromium und Pixel 7 gegen ein lokales Build. Der Klickpfad ergänzt dieses Gate. |
| [Code-Skill](../.agents/skills/code/SKILL.md), [DSGVO-Spec](verify-dsgvo.md) | Code übernimmt offene technische Befunde aus `## Fix list`. Die DSGVO-Prüfung bleibt beratend. |

[ADR-0012](../docs/adr/0012-dual-vitest-projects-for-node-and-nuxt-runtime-tests.md) beschreibt die bestehenden Testebenen. [ADR-0020](../docs/adr/0020-production-smoke-tests-with-build-sha-stamping.md) betrifft deployte Builds. Der Browser-Check dieser Spec läuft lokal. Der Umfang ist eine Änderung am Verify-Ablauf und braucht keinen neuen App-ADR.

Entscheidungen aus der Rückfrage: Sichtbare Teile jedes AC werden im Browser geprüft, interne Teile per Test oder Artefakt belegt. Der Koordinator darf den Browser-Check anhand eines überprüfbaren Klickplans übernehmen. Wenn kein Browser mit sichtbarem Fenster verfügbar ist, prüft Verify eine Headless-Option. Testdaten entstehen über die UI oder durch UI-Import synthetischer Backups.

## Requirements

### Must

- Verify beauftragt je Prüfrunde einen unabhängigen Reviewer und im Regelfall einen eigenen Browser-Agenten für denselben Prüfstand. Der Reviewer erhält einen frischen Kontext ohne Chatverlauf und die Spec, den Checkout, Branch, SHA, Vergleichsbasis und den zugehörigen Working-Tree-Stand. Der Auftrag enthält die Prüfkriterien, ohne Vorbefunde oder Lösungshinweise weiterzugeben. Der Reviewer arbeitet read-only, führt keine Gates aus und meldet belegte Befunde mit `Datei:Zeile`, Schweregrad, betroffenem AC oder Must und Auswirkung. Er prüft auch Testabdeckung, relevante ADRs und Änderungen außerhalb des freigegebenen Umfangs.
- Der Browser-Agent erhält Spec, Prüfstand und die lokale App-URL. Er führt den Klickpfad für jedes AC mit sichtbarem Verhalten in einem echten Browser über die normale App-Oberfläche aus. Für jeden Pfad klickt er bei **1280 × 800** und **390 × 844** durch den Ablauf, beobachtet das Ergebnis, lädt im relevanten Zustand neu und prüft, was laut Spec erhalten bleiben oder zurückgesetzt werden soll. Er verwendet pro Breite einen frischen Browserkontext mit synthetischen Daten und durchläuft die sichtbare Anmeldung, soweit der Pfad sie voraussetzt. Bei gemischten ACs prüft er jeden sichtbaren Teil. Pro rein internem AC dokumentiert er den Grund für `nicht anwendbar`; Verify belegt die Anforderung mit dem zugehörigen Test oder Artefakt. Leere Zustände, aktive Filter, alte Daten oder Backups sind Teil des Klickpfads, sofern die Spec sie fordert.
- Fehlt der Browser-Agent oder kann er den Browser nicht bedienen, darf der Koordinator den Browser-Check übernehmen. Der Klickplan wird vor der Ausführung aus der Spec festgehalten. Er nennt je anwendbarem AC Ausgangszustand, UI-Aktionen, erwartetes Ergebnis und Reload-Prüfung für beide Breiten. Der Koordinator folgt diesem Plan und dokumentiert die tatsächlich ausgeführten Schritte und beobachteten Ergebnisse. Steht kein Browser mit sichtbarem Fenster zur Verfügung, versucht Verify denselben Ablauf in echtem Headless-Chromium mit der vorhandenen Playwright-Laufzeit. Der Headless-Ablauf bedient die sichtbare UI mit Klicks und Eingaben und verwendet dieselben Reload-Prüfungen und Belege.
- Der Koordinator stellt eine lokale Vorschau des geprüften Checkouts bereit. Er serialisiert auf Port 3110 das E2E-Gate und den Browser-Check, prüft die Zuordnung zum Checkout und beendet danach seine eigenen Prozesse. Kann auch der Fallback einen Pfad nicht ausführen, dokumentiert er die versuchten Optionen, betroffenen ACs und den konkreten Blocker. Ein erfolgreicher E2E-Lauf bleibt ein eigener Gate-Beleg.
- Der Bericht enthält `## Review findings` und `## Browser walk`. Der Browser-Beleg nennt pro AC und Breite die ausführende Rolle, den Browser-Modus, den Klickplan, die ausgeführten Schritte, das beobachtete Ergebnis vor und nach Reload sowie den Status. Der Koordinator bestätigt Befunde anhand des geprüften Stands, führt reproduzierbare technische Fehler in `## Fix list` und erfasst fehlende Prüfbelege in `## Open checks`. Nach jedem Fix, der den Prüfstand ändert, laufen alle Gates, der unabhängige Review und der Browser-Check erneut. `Pass` setzt zusätzlich zu den bestehenden Regeln einen abgeschlossenen unabhängigen Review ohne offene blockierende Befunde und bestandene anwendbare Browserpfade voraus. Ein vollständig belegter Fallback zählt als bestandener Browser-Check.

### Should

- Review und Browser-Check dürfen zeitlich überlappen, sobald die lokale Vorschau bereit ist. Bei Abweichungen hält der Browser-Agent eine konkrete Browser-Beobachtung fest, etwa sichtbaren Text, URL, Konsolenfehler oder Screenshot.

### Won't (this time)

- Neue Browser-Abhängigkeiten, CI-Jobs oder ein eigenes Review-Kommando.

## Non-goals

Die Umsetzung betrifft die beiden Verify-Skill-Kopien und deren Berichtsvertrag. App-Funktionen, Datenmodell, Schema-Version, Migrationen, Backup-Format, Tab-Sync und automatisierte Tests liegen außerhalb des Änderungsumfangs.

## Tasks

1. [x] Die Szenarien für AC1–AC4 in isolierten lokalen Prüfständen vorbereiten und am bisherigen Ablauf die fehlenden Nachweise erfassen. Danach `.agents/skills/verify/SKILL.md` um Agentenaufträge, Vorschau, Berichtsfelder und Regeln für Urteil und Wiederholungsrunden ergänzen.
2. Nach `.claude/skills/verify/SKILL.md` spiegeln. Beide Skill-Dateien per Hash vergleichen und die Szenarien mit den angebotenen Subagenten und einem echten Browser durchlaufen.

## Acceptance criteria

- [ ] AC1 — Zwei getrennte Agentenaufträge beziehen sich auf denselben Prüfstand. Der Review startet ohne Chatverlauf, bearbeitet den Diff read-only und meldet einen vorbereiteten Befund mit Schweregrad, Datei und Zeile.
- [ ] AC2 — Der Browser-Agent oder der Koordinator im Fallback liefert für jedes sichtbare AC einen ausgeführten Klickpfad samt Reload und Beleg für Desktop und Handybreite. Fällt der Browser mit sichtbarem Fenster aus, durchläuft der Headless-Fallback denselben Klickplan. Der Bericht weist Rolle und Browser-Modus aus. Ein gemischtes AC weist seinen Browser- und Testbeleg aus. Ein rein internes AC nennt den alternativen Beleg und den Grund für `nicht anwendbar`.
- [ ] AC3 — Ein reproduzierbarer Fehler aus dem Review oder dem Browser gelangt nach Bestätigung in die technische Fix-Liste. Nach dem Fix sind Review und Browser-Belege dem neuen Stand zugeordnet. Ein fehlender Pflichtbeleg oder ein offener blockierender Befund ergibt auch bei grünen Gates `Issues found`. Ein vollständig belegter Lauf kann auch mit Browser-Fallback `Pass` ergeben.
- [ ] AC4 — Der Browser-Check und das E2E-Gate verwenden Port 3110 nacheinander. Ein fremder Listener läuft weiter, der blockierte Browser-Check ist im Bericht begründet und die Skill-Kopien sind bytegleich.

## Verification plan

| AC | How we prove it | Type (unit / e2e / browser) |
| --- | --- | --- |
| AC1 | In einem isolierten Prüfstand mit bekanntem Fehler die beiden Aufträge, den Kontextmodus und den Review-Befund prüfen. Git-Status und Diff vor und nach dem Read-only-Review vergleichen. | e2e |
| AC2 | Mit einer Probe-Spec sichtbare, gemischte und rein interne ACs prüfen. Den Browser-Walk unten regulär mit Browser-Agent ausführen. Danach den Browser-Agenten ausfallen lassen und die Übernahme durch den Koordinator prüfen. Einen Browser ohne sichtbares Fenster per Headless-Chromium bedienen und Klickplan, Belege und beide Viewportgrößen mit der Browser-Sitzung abgleichen. | browser / e2e |
| AC3 | Die Today-Leerzustandsregression in einem isolierten Kategorien-Checkout reproduzieren und den bestehenden Code-Fix-Ablauf prüfen. Den reparierten Stand erneut prüfen. Bei grünen Gates einen erfolgreichen Fallback, einen Ausfall beider Browser-Optionen und einen fehlenden unabhängigen Review vergleichen. | browser / e2e |
| AC4 | Portbelegung zwischen E2E und Vorschau beobachten. In einem zweiten Lauf Port 3110 vorab fremd belegen und den Listener danach prüfen. SHA-256 beider Skill-Dateien vergleichen. | e2e |

Gates: `npm run lint`, `npm run typecheck`, `npm test`, `PORT=3110 E2E_PORT=3110 npm run test:e2e`.

Browser walk für AC2 und AC3: Im isolierten Kategorien-Checkout bei jeder Breite einen eigenen Kontext öffnen. Auf `/login` **Continue with demo login** wählen. Unter **Settings → Backup and restore → Import JSON** das synthetische Backup mit drei heute fälligen Habits importieren (`Run` und `Stretch` in Health, `Read` in Learning). **Today → Health → Open** öffnen und `Run` sowie `Stretch` als erledigt markieren. `2 of 2 reviewed`, `No open habits in Health` und den Hinweis auf ein offenes Habit in einer anderen Kategorie beobachten. Seite neu laden, Filter und Leerzustand erneut prüfen und **Show all categories** klicken. `Read` muss in **Open** erscheinen. Der mobile Durchlauf verwendet die mobile Navigation. Die Stände `e32a7be` (Regression) und `5a72c38` (Fix) im lokalen Referenzbranch `test/verify-e4-forward` liefern den Vergleich.
