export interface Dua {
  id: string;
  title: string;
  arabic: string;
  transliteration: string;
  translation: string;
  reference?: string;
}

export interface DuaCategory {
  id: string;
  name: string;
  icon: string;
  description: string;
  duas: Dua[];
}

export const duaCategories: DuaCategory[] = [
  {
    id: 'breaking-fast',
    name: 'Breaking Fast (Iftar)',
    icon: '🍽️',
    description: 'Duas to recite when breaking your fast',
    duas: [
      {
        id: 'iftar-1',
        title: 'Dua for Breaking Fast',
        arabic: 'ذَهَبَ الظَّمَأُ وَابْتَلَّتِ الْعُرُوقُ وَثَبَتَ الْأَجْرُ إِنْ شَاءَ اللَّهُ',
        transliteration: 'Dhahaba al-zama\' wa abtallatil-\'urooq wa thabat al-ajr in sha Allah',
        translation: 'The thirst has gone, the veins are moistened, and the reward is confirmed, if Allah wills.',
        reference: 'Abu Dawud',
      },
      {
        id: 'iftar-2',
        title: 'Dua Before Eating',
        arabic: 'بِسْمِ اللَّهِ وَعَلَى بَرَكَةِ اللَّهِ',
        transliteration: 'Bismillahi wa \'ala barakatillah',
        translation: 'In the name of Allah and with the blessings of Allah.',
        reference: 'Abu Dawud',
      },
    ],
  },
  {
    id: 'morning',
    name: 'Morning Adhkar',
    icon: '🌅',
    description: 'Duas to recite in the morning after Fajr',
    duas: [
      {
        id: 'morning-1',
        title: 'Morning Remembrance',
        arabic: 'أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ وَالْحَمْدُ لِلَّهِ',
        transliteration: 'Asbahna wa asbahal-mulku lillah, wal-hamdu lillah',
        translation: 'We have reached the morning and at this very time the whole kingdom belongs to Allah. All praise is due to Allah.',
        reference: 'Muslim',
      },
      {
        id: 'morning-2',
        title: 'Seeking Protection',
        arabic: 'اللَّهُمَّ بِكَ أَصْبَحْنَا وَبِكَ أَمْسَيْنَا وَبِكَ نَحْيَا وَبِكَ نَمُوتُ وَإِلَيْكَ النُّشُورُ',
        transliteration: 'Allahumma bika asbahna, wa bika amsayna, wa bika nahya, wa bika namootu, wa ilaykan-nushoor',
        translation: 'O Allah, by Your grace we have reached the morning, by Your grace we reach the evening, by Your grace we live, by Your grace we die, and to You is the resurrection.',
        reference: 'Tirmidhi',
      },
      {
        id: 'morning-3',
        title: 'Master of Forgiveness (Sayyidul Istighfar)',
        arabic: 'اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَهَ إِلَّا أَنْتَ خَلَقْتَنِي وَأَنَا عَبْدُكَ وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ وَأَبُوءُ بِذَنْبِي فَاغْفِرْ لِي فَإِنَّهُ لَا يَغْفِرُ الذُّنُوبَ إِلَّا أَنْتَ',
        transliteration: 'Allahumma anta Rabbi la ilaha illa anta, khalaqtani wa ana \'abduka, wa ana \'ala \'ahdika wa wa\'dika mastata\'tu, a\'udhu bika min sharri ma sana\'tu, abu\'u laka bini\'matika \'alayya, wa abu\'u bidhanbi faghfir li fa innahu la yaghfirudh-dhunuba illa anta',
        translation: 'O Allah, You are my Lord, there is no god but You. You created me and I am Your servant, and I abide by Your covenant and promise as best I can. I seek refuge in You from the evil of what I have done. I acknowledge Your favor upon me and I acknowledge my sin, so forgive me, for none forgives sins except You.',
        reference: 'Bukhari',
      },
    ],
  },
  {
    id: 'evening',
    name: 'Evening Adhkar',
    icon: '🌙',
    description: 'Duas to recite in the evening after Asr',
    duas: [
      {
        id: 'evening-1',
        title: 'Evening Remembrance',
        arabic: 'أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ وَالْحَمْدُ لِلَّهِ',
        transliteration: 'Amsayna wa amsal-mulku lillah, wal-hamdu lillah',
        translation: 'We have reached the evening and at this very time the whole kingdom belongs to Allah. All praise is due to Allah.',
        reference: 'Muslim',
      },
      {
        id: 'evening-2',
        title: 'Evening Protection',
        arabic: 'اللَّهُمَّ بِكَ أَمْسَيْنَا وَبِكَ أَصْبَحْنَا وَبِكَ نَحْيَا وَبِكَ نَمُوتُ وَإِلَيْكَ الْمَصِيرُ',
        transliteration: 'Allahumma bika amsayna, wa bika asbahna, wa bika nahya, wa bika namootu, wa ilaykal-maseer',
        translation: 'O Allah, by Your grace we have reached the evening, by Your grace we reach the morning, by Your grace we live, by Your grace we die, and to You is the final return.',
        reference: 'Tirmidhi',
      },
    ],
  },
  {
    id: 'laylatul-qadr',
    name: 'Laylatul Qadr',
    icon: '⭐',
    description: 'Special duas for the Night of Power',
    duas: [
      {
        id: 'qadr-1',
        title: 'Dua for Laylatul Qadr',
        arabic: 'اللَّهُمَّ إِنَّكَ عَفُوٌّ تُحِبُّ الْعَفْوَ فَاعْفُ عَنِّي',
        transliteration: 'Allahumma innaka \'afuwwun tuhibbul-\'afwa fa\'fu \'anni',
        translation: 'O Allah, You are Most Forgiving, and You love forgiveness; so forgive me.',
        reference: 'Tirmidhi - Recommended by Aisha (RA)',
      },
    ],
  },
  {
    id: 'quran',
    name: 'Before Quran',
    icon: '📖',
    description: 'Duas before reciting the Quran',
    duas: [
      {
        id: 'quran-1',
        title: 'Seeking Refuge',
        arabic: 'أَعُوذُ بِاللَّهِ مِنَ الشَّيْطَانِ الرَّجِيمِ',
        transliteration: 'A\'udhu billahi minash-shaytanir-rajeem',
        translation: 'I seek refuge in Allah from the accursed Satan.',
        reference: 'Quran 16:98',
      },
      {
        id: 'quran-2',
        title: 'Basmala',
        arabic: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ',
        transliteration: 'Bismillahir-Rahmanir-Raheem',
        translation: 'In the name of Allah, the Most Gracious, the Most Merciful.',
        reference: 'Quran',
      },
      {
        id: 'quran-3',
        title: 'Dua for Understanding',
        arabic: 'اللَّهُمَّ انْفَعْنِي بِمَا عَلَّمْتَنِي وَعَلِّمْنِي مَا يَنْفَعُنِي وَارْزُقْنِي عِلْمًا يَنْفَعُنِي',
        transliteration: 'Allahumma-nfa\'ni bima \'allamtani, wa \'allimni ma yanfa\'uni, war-zuqni \'ilman yanfa\'uni',
        translation: 'O Allah, benefit me with what You have taught me, teach me what will benefit me, and grant me knowledge that will benefit me.',
        reference: 'Ibn Majah',
      },
    ],
  },
  {
    id: 'forgiveness',
    name: 'Seeking Forgiveness',
    icon: '🤲',
    description: 'Duas for repentance and forgiveness',
    duas: [
      {
        id: 'forgive-1',
        title: 'Istighfar',
        arabic: 'أَسْتَغْفِرُ اللَّهَ الْعَظِيمَ الَّذِي لَا إِلَهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ وَأَتُوبُ إِلَيْهِ',
        transliteration: 'Astaghfirullah al-\'Adheem alladhi la ilaha illa Huwal-Hayyul-Qayyum wa atubu ilayh',
        translation: 'I seek forgiveness from Allah, the Magnificent, whom there is no god but He, the Living, the Sustainer, and I repent to Him.',
        reference: 'Abu Dawud & Tirmidhi',
      },
      {
        id: 'forgive-2',
        title: 'Simple Istighfar',
        arabic: 'رَبِّ اغْفِرْ لِي وَتُبْ عَلَيَّ إِنَّكَ أَنْتَ التَّوَّابُ الرَّحِيمُ',
        transliteration: 'Rabbighfir li wa tub \'alayya innaka antat-Tawwabur-Raheem',
        translation: 'My Lord, forgive me and accept my repentance. You are the Accepter of Repentance, the Most Merciful.',
        reference: 'Abu Dawud',
      },
    ],
  },
  {
    id: 'general',
    name: 'General Duas',
    icon: '💫',
    description: 'Essential daily duas',
    duas: [
      {
        id: 'general-1',
        title: 'Dua for Guidance',
        arabic: 'اللَّهُمَّ اهْدِنِي وَسَدِّدْنِي',
        transliteration: 'Allahumma-hdini wa saddidni',
        translation: 'O Allah, guide me and keep me on the right path.',
        reference: 'Muslim',
      },
      {
        id: 'general-2',
        title: 'Dua for Good in This World and Hereafter',
        arabic: 'رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ',
        transliteration: 'Rabbana atina fid-dunya hasanatan wa fil-akhirati hasanatan wa qina \'adhaban-nar',
        translation: 'Our Lord, give us good in this world and good in the Hereafter, and protect us from the punishment of the Fire.',
        reference: 'Quran 2:201',
      },
      {
        id: 'general-3',
        title: 'Dua for Patience',
        arabic: 'رَبَّنَا أَفْرِغْ عَلَيْنَا صَبْرًا وَتَوَفَّنَا مُسْلِمِينَ',
        transliteration: 'Rabbana afrigh \'alayna sabran wa tawaffana muslimeen',
        translation: 'Our Lord, pour upon us patience and let us die as Muslims.',
        reference: 'Quran 7:126',
      },
    ],
  },
];

// Get a random dua for "Dua of the Day"
export function getDuaOfTheDay(dayNumber: number): Dua {
  const allDuas = duaCategories.flatMap(cat => cat.duas);
  const index = dayNumber % allDuas.length;
  return allDuas[index];
}

// Get duas by category
export function getDuasByCategory(categoryId: string): Dua[] {
  const category = duaCategories.find(cat => cat.id === categoryId);
  return category?.duas ?? [];
}
