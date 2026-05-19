import { HabitDefinition } from '@/types/habit';

export const HABIT_DEFINITIONS: HabitDefinition[] = [
  // ── Prayer habits (managed by the system Prayer category) ────────────────
  {
    id: 'prayer_fajr',
    label: 'Fajr Prayer',
    labelId: 'Sholat Subuh',
    description: 'Perform Fajr prayer on time',
    category: 'prayer',
    icon: '🕌',
    xp: 25,
    isMorningLock: true,
  },
  {
    id: 'prayer_dhuhr',
    label: 'Dhuhr Prayer',
    labelId: 'Sholat Dzuhur',
    description: 'Perform Dhuhr prayer on time',
    category: 'prayer',
    icon: '🕌',
    xp: 25,
  },
  {
    id: 'prayer_asr',
    label: 'Asr Prayer',
    labelId: 'Sholat Ashar',
    description: 'Perform Asr prayer on time',
    category: 'prayer',
    icon: '🕌',
    xp: 25,
  },
  {
    id: 'prayer_maghrib',
    label: 'Maghrib Prayer',
    labelId: 'Sholat Maghrib',
    description: 'Perform Maghrib prayer on time',
    category: 'prayer',
    icon: '🕌',
    xp: 25,
  },
  {
    id: 'prayer_isya',
    label: 'Isya Prayer',
    labelId: 'Sholat Isya',
    description: "Perform Isya prayer — don't delay",
    category: 'prayer',
    icon: '🕌',
    xp: 25,
  },
  {
    id: 'prayer_tahajjud',
    label: 'Tahajjud Prayer',
    labelId: 'Sholat Tahajjud',
    description: 'Perform Tahajjud prayer at the last third of the night',
    category: 'prayer',
    icon: '🌌',
    xp: 30,
    isHidden: true,
  },
  {
    id: 'prayer_dhuha',
    label: 'Dhuha Prayer',
    labelId: 'Sholat Dhuha',
    description: 'Perform Dhuha prayer in the morning',
    category: 'prayer',
    icon: '☀️',
    xp: 20,
    isHidden: true,
  },
  // ── Health habits (managed by the system Health category) ─────────────────
  {
    id: 'meals_4',
    label: '4 Nutritious Meals',
    labelId: 'Makan Lengkap 4 Porsi',
    description: 'Nutritious meals (3x meals + 1x healthy snack)',
    category: 'health',
    icon: '🍽️',
    xp: 20,
    isHidden: true,
  },
  {
    id: 'water_8',
    label: 'Drink 8 Glasses',
    labelId: 'Minum 8 Gelas',
    description: 'Stay hydrated throughout the day',
    category: 'health',
    icon: '💧',
    xp: 20,
    isHidden: true,
  },
];

// Morning lock habits — must complete before dashboard unlocks
export const MORNING_LOCK_HABITS = HABIT_DEFINITIONS
  .filter((h) => h.isMorningLock)
  .map((h) => h.id);

// Habits that count for daily completion percentage
export const DAILY_CORE_HABITS = HABIT_DEFINITIONS.map((h) => h.id);
