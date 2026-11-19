# DSGVO-Hinweise im Verify-Bericht

Issue: none  ·  Status: approved  ·  Approved-by: Philip Rekers, 2026-11-19

## Context

Bei der Verifikation einer Änderung sollen Datenschutzbefunde sichtbar werden, damit das Team die Maßnahmen gezielt bewerten kann. Verify nutzt dazu den vorhandenen DSGVO-Skill und protokolliert dessen Hinweise im selben Abschlussbericht.

## Research

| File | Why it matters |
| --- | --- |
| [Verify-Skill](../.agents/skills/verify/SKILL.md) | Prüft Gates und Akzeptanzkriterien, führt die Fix-Liste und schreibt den Abschlussbericht. |
| [Code-Skill](../.agents/skills/code/SKILL.md) | Liest Verify-Berichte automatisch und übernimmt fachlich bestätigte Punkte aus der Fix-Liste. |
| [DSGVO-Skill](../.agents/skills/dsgvo/SKILL.md), [Prüfleitfaden](../docs/DSGVO.md), [Sicherheitsmodell](../SECURITY.md) | Vorgehen für technische Datenschutzbefunde, Beleggrenzen und offene Betreiberfragen. |

Die Prüfung ist ein Berichtsschritt. Die bestehenden Gate-, Verdict- und ADR-Regeln gelten für die technische Verifikation.

## Requirements

### Must

- Verify führt den DSGVO-Skill einmal pro Abschlussbericht am letzten geprüften Stand aus, auch wenn technische Gates offen sind. Der Prüfumfang ist der Spec-Diff mit den davon betroffenen Datenflüssen. Browserprüfungen laufen bei verfügbarer lokaler Vorschau mit synthetischen Daten.
- Der Abschnitt `## DSGVO` enthält den Prüfumfang, die tatsächlich ausgeführten Schritte, offene Nachweise und je Befund `WARN`, einen Beleg oder die belegte Prüflücke, die Auswirkung und einen konkreten Fix-Vorschlag. Ist die Prüfung nur teilweise möglich, stehen der Grund und die belegte Reichweite im Abschnitt. Bei abgeschlossener Prüfung ohne Befund vermerkt der Abschnitt das für den geprüften Umfang.
- DSGVO-Hinweise, fehlende Nachweise und ein ausgefallener Datenschutzaudit sind für das technische Gesamturteil unverbindlich. Verify übergibt ausschließlich technische Prüfbefunde aus der `Fix list` an Code. Code übernimmt auch beim späteren automatischen Einlesen des Berichts ausschließlich offene Punkte aus der `Fix list`. Ein separat belegter technischer Fehler bleibt über den bestehenden Ablauf verfolgbar.

### Should

- Der Abschnitt hält offene Betreiberfragen getrennt von belegten technischen Befunden fest.

### Won't (this time)

- Eigenes CI-Gate oder automatische Umsetzung der DSGVO-Fix-Vorschläge.

## Non-goals

Der Bericht erteilt keine Datenschutzfreigabe. Diese Änderung betrifft die Skills und den Verify-Bericht.

## Tasks

1. Die Prüfvarianten unten in einem isolierten Projektstand vorbereiten. Danach beide `verify/SKILL.md`-Kopien um DSGVO-Prüfung und Berichtsfeld ergänzen.
2. In beiden `code/SKILL.md`-Kopien die automatische Berichtsübernahme auf die technische Fix-Liste begrenzen. Skill-Kopien bytegleich halten und alle Prüfvarianten in einem isolierten Lauf nachweisen.

## Acceptance criteria

- [ ] AC1 — Der Abschlussbericht enthält den tatsächlichen Prüfumfang und je DSGVO-Befund `WARN`, Beleg, Auswirkung und Fix-Vorschlag.
- [ ] AC2 — Bei grünen Gates bleibt das Gesamturteil `Pass`, auch wenn ein Datenschutzbefund offen ist oder ein Teil der Prüfung ausfällt. Der Datenschutzbefund erzeugt keinen Fix-Auftrag, keine Änderung und keinen Fix-Commit.
- [ ] AC3 — Ein technischer Fehler bleibt trotz gleichzeitigem DSGVO-Hinweis in der technischen Fix-Liste und folgt den bestehenden Regeln. Die Skill-Kopien sind bytegleich.

## Verification plan

| AC | How we prove it | Type |
| --- | --- | --- |
| AC1 | Im isolierten Verify-Lauf einen belegbaren Datenschutzbefund vorbereiten und den separaten Abschnitt samt Quelle und Fix-Vorschlag prüfen. Den unbeeinträchtigten Fall ohne Befund ebenfalls beobachten. | e2e |
| AC2 | Grüne technische Gates mit Datenschutzbefund sowie mit nicht ausführbarer Browser-Datenschutzprobe simulieren. Urteil, Aufrufe, Status und Commit-Diff prüfen. Den Bericht erneut an Code geben und die Fix-Auswahl kontrollieren. | e2e |
| AC3 | Einen technischen Red-Test und einen Datenschutzbefund im selben Lauf erzeugen. Nur der technische Punkt gelangt in die Fix-Liste und zum Fix. Beide Skill-Dateipaare per Hash vergleichen. | e2e |

Gates: `npm run lint`, `npm run typecheck`, `npm test`, `PORT=3110 E2E_PORT=3110 npm run test:e2e`.
