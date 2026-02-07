import { GoalTemplate, TemplateCategory } from '@/types';

export const goalTemplates: GoalTemplate[] = [
  // Quran
  {
    id: 'quran-complete',
    title: 'Complete the Quran',
    description: 'Read the entire Quran over the course of Ramadan, about 20 pages per day.',
    goal_type: 'divisible',
    default_amount: 20,
    unit: 'pages',
    category: 'quran',
    prompt: 'Every page brings you closer to Allah. You can do this, one page at a time!',
  },
  {
    id: 'quran-juz-daily',
    title: 'Read 1 Juz per day',
    description: 'Complete one Juz each day to finish the Quran in 30 days.',
    goal_type: 'daily',
    default_amount: 1,
    unit: 'juz',
    category: 'quran',
    prompt: 'A Juz a day keeps the heart illuminated. Start with Bismillah and let the words flow.',
  },
  {
    id: 'quran-memorize',
    title: 'Memorize new verses',
    description: 'Commit new ayahs to memory during this blessed month.',
    goal_type: 'divisible',
    default_amount: 5,
    unit: 'ayahs',
    category: 'quran',
    prompt: 'The one who memorizes the Quran carries a light within. Every ayah you learn is a treasure forever.',
  },

  // Prayer
  {
    id: 'prayer-tarawih',
    title: 'Pray Tarawih',
    description: 'Attend Tarawih prayers every night of Ramadan.',
    goal_type: 'daily',
    default_amount: 1,
    unit: 'prayer',
    category: 'prayer',
    prompt: 'Standing in Tarawih is standing before your Lord. Each night is a gift — make the most of it.',
  },
  {
    id: 'prayer-tahajjud',
    title: 'Pray Tahajjud',
    description: 'Wake for the night prayer several times a week.',
    goal_type: 'weekly',
    default_amount: 3,
    unit: 'prayer',
    category: 'prayer',
    prompt: 'The last third of the night is when Allah descends. Rise, and let your prayers be answered.',
  },
  {
    id: 'prayer-daily-dua',
    title: 'Daily Dua',
    description: 'Set aside time each day for heartfelt supplication.',
    goal_type: 'daily',
    default_amount: 1,
    unit: 'session',
    category: 'prayer',
    prompt: 'Dua is the weapon of the believer. Pour your heart out — He is always listening.',
  },

  // Charity
  {
    id: 'charity-daily-sadaqah',
    title: 'Daily Sadaqah',
    description: 'Give something in charity every single day, no matter how small.',
    goal_type: 'daily',
    default_amount: 1,
    unit: 'donation',
    category: 'charity',
    prompt: 'Even a smile is charity. Every act of giving purifies the heart and multiplies your blessings.',
  },
  {
    id: 'charity-zakat',
    title: 'Pay Zakat',
    description: 'Fulfill your Zakat obligation during Ramadan.',
    goal_type: 'one_time',
    default_amount: 1,
    unit: 'task',
    category: 'charity',
    prompt: 'Zakat purifies your wealth and uplifts the ummah. Fulfill this pillar with a grateful heart.',
  },

  // Dhikr
  {
    id: 'dhikr-morning-evening',
    title: 'Morning & Evening Adhkar',
    description: 'Recite the morning and evening remembrances daily.',
    goal_type: 'daily',
    default_amount: 2,
    unit: 'sessions',
    category: 'dhikr',
    prompt: 'Remembrance of Allah brings peace to the heart. Start and end your day wrapped in His protection.',
  },
  {
    id: 'dhikr-istighfar',
    title: 'Daily Istighfar',
    description: 'Seek forgiveness 100 times each day.',
    goal_type: 'daily',
    default_amount: 100,
    unit: 'times',
    category: 'dhikr',
    prompt: 'The Prophet (peace be upon him) sought forgiveness over 70 times a day. Let istighfar cleanse your soul.',
  },

  // Fasting
  {
    id: 'fasting-all-30',
    title: 'Fast all 30 days',
    description: 'Complete the full month of fasting with intention and devotion.',
    goal_type: 'daily',
    default_amount: 1,
    unit: 'fast',
    category: 'fasting',
    prompt: 'Fasting is a shield and a door to Jannah. Every moment of hunger draws you closer to your Lord.',
  },
];

export const categoryInfo: Record<TemplateCategory, { label: string; icon: string; description: string }> = {
  quran: {
    label: 'Quran',
    icon: '\u{1F4D6}',
    description: 'Reading, memorizing, and reflecting on the Quran.',
  },
  prayer: {
    label: 'Prayer',
    icon: '\u{1F932}',
    description: 'Tarawih, Tahajjud, and daily supplications.',
  },
  charity: {
    label: 'Charity',
    icon: '\u{1F49B}',
    description: 'Sadaqah, Zakat, and acts of generosity.',
  },
  dhikr: {
    label: 'Dhikr',
    icon: '\u{1F4FF}',
    description: 'Remembrance of Allah and daily adhkar.',
  },
  fasting: {
    label: 'Fasting',
    icon: '\u{1F319}',
    description: 'Tracking your daily fasts throughout Ramadan.',
  },
  custom: {
    label: 'Custom',
    icon: '\u{2728}',
    description: 'Create your own personal goal for Ramadan.',
  },
};
