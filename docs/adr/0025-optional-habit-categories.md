# 25. Optional habit categories

- **Status:** Accepted
- **Date:** 2026-11-19

## Context

The Habits list and the Today queue need optional category filters. Each habit can
use a built-in category or a name entered in the habit form. Existing browser data
and backups must remain readable.

## Decision

- Add an optional `Habit.category` to the existing V2 envelope. Values are a
  built-in key, a custom `{ id, label }`, or `null` for an explicit removal. V1
  migration and existing V2 habits without the field remain unassigned. The
  Dexie schema and `schemaVersion` stay unchanged.
- Custom categories use identifiers generated with `createId('category')`.
  They are derived from all habits, including archived ones. The form reuses
  existing names case-insensitively and trims and bounds new names to 40
  characters. Reserved labels are unavailable as custom names.
- URL filters use built-in keys, `none` for unassigned habits, or custom category
  IDs. Custom labels stay out of URLs. A custom filter link resolves when the
  browser has a habit using that ID, including through an imported backup.
- Full backups keep category values and IDs. For habits-only imports, an omitted
  field preserves the assignment on a matching habit, `null` clears it, and a
  valid value replaces it. The lenient parser omits an invalid assignment.
- Cross-tab merge compares category keys and labels as part of each habit.
  Missing and explicit null both represent an unassigned habit for comparisons.
  Import retains the distinction because it controls whether to clear a value.

## Consequences

- The application needs no category registry or data migration. Categories with
  no remaining habit disappear from the available choices.
- A previous version can open a new backup but its schema may strip category
  fields on the next save. Keep the new backup when moving between versions.
- The existing prompts, demo data and browser-only storage contract are unchanged.

## References

- [Category specification](../../specs/kategorien.md)
- [Versioned Zod schema](0006-zod-validated-versioned-data-schema.md)
- [Migration registry](0022-version-keyed-schema-migration-registry.md)
- [Cross-tab merge](0024-revision-guarded-saves-with-cross-tab-merge.md)
