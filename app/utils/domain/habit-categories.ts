import {
  BUILT_IN_HABIT_CATEGORIES,
  FIELD_LIMITS,
  type BuiltInHabitCategory,
  type CustomHabitCategory,
  type Habit,
  type HabitCategory,
} from '~/types/app-data'
import { createId } from '~/utils/domain/id'

export const HABIT_CATEGORY_LABELS = {
  health: 'Health',
  learning: 'Learning',
  work: 'Work',
  other: 'Other',
} satisfies Record<BuiltInHabitCategory, string>

export const UNCATEGORIZED_FILTER = 'none'
export const UNCATEGORIZED_LABEL = 'No category'
export const ALL_CATEGORIES_LABEL = 'All categories'
export const CUSTOM_HABIT_CATEGORY_ID_PATTERN = /^category_[a-zA-Z0-9_-]+$/

function categoryLabelKey(label: string): string {
  return label.trim().toLowerCase()
}

function builtInByLabel(key: string): BuiltInHabitCategory | undefined {
  return BUILT_IN_HABIT_CATEGORIES.find(category => categoryLabelKey(HABIT_CATEGORY_LABELS[category]) === key)
}

export function isCustomHabitCategoryLabel(label: string): boolean {
  const key = categoryLabelKey(label)
  return key.length > 0 && label.trim().length <= FIELD_LIMITS.categoryLabel
    && key !== categoryLabelKey(UNCATEGORIZED_LABEL)
    && key !== categoryLabelKey(ALL_CATEGORIES_LABEL)
    && !builtInByLabel(key)
}

export function habitCategoryKey(category: HabitCategory | null | undefined): string {
  return typeof category === 'object' && category !== null ? category.id : category ?? UNCATEGORIZED_FILTER
}

export function habitCategoryLabel(category: HabitCategory | null | undefined): string {
  if (typeof category === 'string') {
    return HABIT_CATEGORY_LABELS[category]
  }
  return category?.label ?? UNCATEGORIZED_LABEL
}

export function customHabitCategories(habits: readonly Habit[]): CustomHabitCategory[] {
  const byId = new Map<string, CustomHabitCategory>()
  for (const { category } of habits) {
    if (category && typeof category === 'object' && !byId.has(category.id)) {
      byId.set(category.id, category)
    }
  }
  return [...byId.values()]
}

export function resolveHabitCategoryLabel(label: string, habits: readonly Habit[]): HabitCategory | null | undefined {
  const key = categoryLabelKey(label)
  if (key === categoryLabelKey(UNCATEGORIZED_LABEL)) {
    return null
  }
  const builtIn = builtInByLabel(key)
  if (builtIn) {
    return builtIn
  }
  if (!isCustomHabitCategoryLabel(label)) {
    return undefined
  }
  const existing = customHabitCategories(habits).find(category => categoryLabelKey(category.label) === key)
  return existing ?? { id: createId('category'), label: label.trim() }
}

export function habitCategoriesEqual(left: Habit['category'], right: Habit['category']): boolean {
  return habitCategoryKey(left) === habitCategoryKey(right) && habitCategoryLabel(left) === habitCategoryLabel(right)
}
