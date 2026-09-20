/**
 * Developer Preview — Mock Data
 * Realistic sample data representing actual app output for an Arabic Islamic reel.
 * Used by DevPreviewScreen to display all UI screens without any API calls.
 */

export const DEMO_ARABIC_TRANSCRIPT = `بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ الرَّحْمَٰنِ الرَّحِيمِ مَالِكِ يَوْمِ الدِّينِ إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ

وهذا درس مهم عن الإيمان بالله وتقواه في حياتنا اليومية. يجب علينا أن نتذكر الله في كل لحظة وأن نشكره على نعمه الكثيرة. الصلاة هي عماد الدين وهي أول ما يُحاسب عليه العبد يوم القيامة.

اللَّهُمَّ إِنِّي أَسْأَلُكَ الْهُدَى وَالتُّقَى وَالْعَفَافَ وَالْغِنَى`;

export const DEMO_DUTCH_TRANSLATION = `In naam van Allah, de Barmhartige, de Genadevolle. Alle lof is voor Allah, de Heer van de werelden. De Barmhartige, de Genadevolle. Eigenaar van de Dag des Oordeels. U alleen aanbidden wij en U alleen vragen wij om hulp. Leid ons op het rechte pad. Het pad van degenen aan wie U gunsten hebt verleend, niet van degenen op wie de toorn rust en niet van de dwalenden.

Dit is een belangrijke les over geloof in Allah en vroomheid in ons dagelijks leven. We moeten Allah in elk moment herinneren en Hem bedanken voor Zijn vele zegeningen. Het gebed is de pilaar van de religie en het is het eerste waarover de dienaar op de Dag des Oordeels zal worden ondervraagd.

O Allah, ik vraag U om leiding, vroomheid, kuisheid en tevredenheid.`;

export const DEMO_DUA_RESULTS = `🤲 **Geïdentificeerde Dua's en Smeekbeden**

**Dua 1 — Al-Fatiha (afsluiting)**
Arabisch: اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ
Nederlands: Leid ons op het rechte pad
Tijdstip in video: 0:26

**Dua 2 — Smeekbede voor leiding en vroomheid**
Arabisch: اللَّهُمَّ إِنِّي أَسْأَلُكَ الْهُدَى وَالتُّقَى وَالْعَفَافَ وَالْغِنَى
Nederlands: O Allah, ik vraag U om leiding, vroomheid, kuisheid en tevredenheid
Tijdstip in video: 1:42

**Context**
Deze recitatie bevat de volledige Surah Al-Fatiha gevolgd door een praktische les over het dagelijks naleven van het geloof. De spreker benadrukt het belang van het gebed als directe verbinding met Allah en herinnert de luisteraar aan de waarde van dankbaarheid.`;

export const DEMO_SEGMENTS = [
  {
    id: 1,
    startTime: 0.0,
    endTime: 4.5,
    text: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ",
  },
  {
    id: 2,
    startTime: 4.5,
    endTime: 9.2,
    text: "الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ",
  },
  { id: 3, startTime: 9.2, endTime: 13.8, text: "الرَّحْمَٰنِ الرَّحِيمِ" },
  { id: 4, startTime: 13.8, endTime: 19.1, text: "مَالِكِ يَوْمِ الدِّينِ" },
  {
    id: 5,
    startTime: 19.1,
    endTime: 26.4,
    text: "إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ",
  },
  {
    id: 6,
    startTime: 26.4,
    endTime: 34.7,
    text: "اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ",
  },
  {
    id: 7,
    startTime: 34.7,
    endTime: 52.3,
    text: "صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ",
  },
  {
    id: 8,
    startTime: 52.3,
    endTime: 68.0,
    text: "وهذا درس مهم عن الإيمان بالله وتقواه في حياتنا اليومية",
  },
  {
    id: 9,
    startTime: 68.0,
    endTime: 85.5,
    text: "يجب علينا أن نتذكر الله في كل لحظة وأن نشكره على نعمه الكثيرة",
  },
  {
    id: 10,
    startTime: 85.5,
    endTime: 102.0,
    text: "اللَّهُمَّ إِنِّي أَسْأَلُكَ الْهُدَى وَالتُّقَى وَالْعَفَافَ وَالْغِنَى",
  },
];

export const DEMO_RESULTS = {
  id: "demo_result_001",
  timestamp: new Date().toISOString(),
  model: "supadata",
  arabicTranscript: DEMO_ARABIC_TRANSCRIPT,
  dutchTranslation: DEMO_DUTCH_TRANSLATION,
  duaResults: DEMO_DUA_RESULTS,
  segments: DEMO_SEGMENTS,
};

export const DEMO_RESULTS_NO_DUA = {
  ...DEMO_RESULTS,
  id: "demo_result_002",
  duaResults: "",
};

export const DEMO_VIDEOS = [
  {
    id: "demo_video_001",
    title: "Islamitische les — Al-Fatiha uitleg",
    uri: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    thumbnail: null,
    duration: 102,
    fileSize: 8400000,
    createdAt: Date.now() - 86400000 * 2,
    transcriptionResults: DEMO_RESULTS,
    platform: "instagram",
    originalUrl: "https://www.instagram.com/reel/DemoReel001/",
  },
  {
    id: "demo_video_002",
    title: "Dagelijkse Dua recitatie",
    uri: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    thumbnail: null,
    duration: 65,
    fileSize: 4200000,
    createdAt: Date.now() - 86400000 * 5,
    transcriptionResults: null,
    platform: "tiktok",
    originalUrl: "https://www.tiktok.com/@user/video/DemoVideo002",
  },
  {
    id: "demo_video_003",
    title: "Vrijdagpreek fragment",
    uri: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    thumbnail: null,
    duration: 180,
    fileSize: 15000000,
    createdAt: Date.now() - 86400000 * 7,
    transcriptionResults: DEMO_RESULTS,
    platform: "instagram",
    originalUrl: "https://www.instagram.com/reel/DemoReel003/",
  },
];

export const DEMO_CAPTIONS = [
  { id: "cap_0_demo", text: "In naam van Allah", startTime: 0, endTime: 4500 },
  { id: "cap_1_demo", text: "de Barmhartige", startTime: 4500, endTime: 7000 },
  { id: "cap_2_demo", text: "de Genadevolle", startTime: 7000, endTime: 9200 },
  {
    id: "cap_3_demo",
    text: "Alle lof is voor Allah",
    startTime: 9200,
    endTime: 13800,
  },
  {
    id: "cap_4_demo",
    text: "de Heer van de werelden",
    startTime: 13800,
    endTime: 19100,
  },
  {
    id: "cap_5_demo",
    text: "U alleen aanbidden wij",
    startTime: 19100,
    endTime: 26400,
  },
  {
    id: "cap_6_demo",
    text: "Leid ons op het rechte pad",
    startTime: 26400,
    endTime: 34700,
  },
  {
    id: "cap_7_demo",
    text: "O Allah, leid ons",
    startTime: 34700,
    endTime: 42000,
  },
];

// Public royalty-free test video — Google-hosted, reliable, no CORS issues
export const DEMO_VIDEO_URL = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4";
export const DEMO_VIDEO_NAME = "Demo: Islamitische Reel";
export const DEMO_REEL_URL = "https://www.instagram.com/reel/DemoPreview001/";
