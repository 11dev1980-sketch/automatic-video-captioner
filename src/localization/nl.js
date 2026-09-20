/**
 * Dutch Translations
 * Simple, everyday Dutch language for non-technical users
 * Avoids technical jargon like: transcriptie, extraheren, verwerken, configuratie, etc.
 */

export const strings = {
  // Common strings used across multiple screens
  common: {
    save: 'Opslaan',
    cancel: 'Annuleren',
    done: 'Klaar',
    error: 'Er ging iets mis',
    tryAgain: 'Probeer opnieuw',
    loading: 'Bezig...',
    delete: 'Verwijderen',
    share: 'Delen',
    back: 'Terug',
    close: 'Sluiten',
    ok: 'Oké',
    yes: 'Ja',
    no: 'Nee',
    continue: 'Doorgaan',
    skip: 'Overslaan',
  },

  // Tab labels
  tabs: {
    home: 'Start',
    captionEditor: 'Ondertitels',
    process: 'Verwerken',
    download: 'Downloaden',
    library: 'Mijn video\'s',
    history: 'Eerder verwerkt',
    shortcut: 'Snelkoppeling',
  },

  // Home screen
  home: {
    greeting: 'Hoi {0}! 👋',
    greetingDefault: 'Hoi daar! 👋',
    welcome: 'Welkom',
    enterName: 'Hoe heet jij?',
    changeName: 'Naam wijzigen',
    namePrompt: 'Hoe heet je?',
    namePlaceholder: 'Je naam',
    subtitle: 'Video\'s ondertitelen',
    whatCanYouDo: 'Wat kun je doen?',
    getStarted: 'Ga naar "Ondertitels" om te beginnen',
    
    // Quick Start
    quickStartTitle: 'Snel starten',
    quickStartDescription: 'Plak een video link (Instagram, etc.)',
    quickStartPlaceholder: 'https://www.instagram.com/reel/...',
    quickStartButton: 'Ondertitels maken',
    
    // Recent Videos
    recentTitle: 'Recent ondertiteld',
    viewAll: 'Alles bekijken',
    minutesAgo: '{0}m geleden',
    hoursAgo: '{0}u geleden',
    daysAgo: '{0}d geleden',
    
    // Features
    featureVideoToText: 'Video naar tekst',
    featureVideoToTextDesc: 'Upload een video en krijg automatisch de Arabische tekst',
    featureTranslation: 'Nederlandse vertaling',
    featureTranslationDesc: 'Vertaal de Arabische tekst direct naar het Nederlands',
    featureDuas: 'Dua\'s vinden',
    featureDuasDesc: 'Vind automatisch Dua\'s in de tekst',
  },

  // Process/Upload screen
  upload: {
    title: 'Video omzetten',
    titleReel: 'Video transcriptie',
    description: 'Plak een video link (Instagram, YouTube, TikTok, Facebook) hieronder om de video te vertalen',
    selectVideo: 'Kies een video',
    selectFromGallery: 'Kies uit galerij',
    recordVideo: 'Opnemen',
    pasteUrl: 'Plak video link',
    reelUrl: 'Video URL',
    reelUrlPlaceholder: 'https://www.instagram.com/reel/...',
    processing: 'Video wordt verwerkt...',
    success: 'Klaar!',
    uploadButton: 'Video uploaden',
    nextStep: 'Volgende stap',
    continueToConfig: 'Doorgaan naar verwerken',
    pasteFromClipboard: 'Plakken van klembord',
    detected: 'Gedetecteerd',
    unsupportedUrl: 'Niet ondersteunde URL',
    selectVideo: 'Selecteer videobestand',
    tapToBrowse: 'Tik om door je apparaat te bladeren',
    supportedFormats: 'MP4 • AVI • MOV • MKV • WMV • FLV • WEBM',
    autoStart: 'Auto-start',
    pressContinue: 'Druk op Doorgaan',
    
    // Instructions
    howTo: 'Hoe werkt het?',
    step1: 'Kies een video',
    step2: 'Wacht even',
    step3: 'Bekijk de tekst',
  },

  // Configure screen
  configure: {
    title: 'Instellingen',
    description: 'Kies je verwerkingsopties',
    options: 'Opties',
    enableDuas: 'Dua\'s zoeken',
    enableDuasDesc: 'Identificeer en extraheer islamitische gebeden en smeekbeden uit de inhoud',
    startProcessing: 'Start verwerking',
  },

  // Processing screen
  processing: {
    title: 'Bezig',
    subtitle: 'Je video wordt verwerkt',
    converting: 'Video wordt omgezet...',
    almostDone: 'Bijna klaar...',
    pleaseWait: 'Even geduld...',
    doNotClose: 'Sluit de app niet',
    cancel: 'Annuleren',
    retry: 'Opnieuw proberen',
  },

  // Results screen
  results: {
    title: 'Resultaat',
    arabicText: 'Arabische tekst',
    dutchTranslation: 'Nederlandse vertaling',
    duasFound: 'Gevonden Dua\'s',
    noDuas: 'Geen Dua\'s gevonden',
    copyText: 'Tekst kopiëren',
    shareResults: 'Delen',
    saveResults: 'Opslaan',
    startNew: 'Nieuwe video',
    processAnother: 'Nog een video verwerken',
    copied: 'Gekopieerd',
    copiedDesc: 'Tekst gekopieerd naar klembord',
    saved: 'Opgeslagen',
    savedDesc: 'Resultaten succesvol opgeslagen',
    shared: 'Gedeeld!',
    errorCopy: 'Kon tekst niet kopiëren',
    errorShare: 'Kon resultaten niet delen',
    errorSave: 'Kon resultaten niet opslaan',
  },

  // Instagram downloader
  instagram: {
    title: 'Instagram video downloaden',
    subtitle: 'Download Instagram Reels naar je telefoon',
    pasteUrl: 'Plak hier de link',
    urlPlaceholder: 'https://www.instagram.com/reel/...',
    paste: 'Plakken',
    download: 'Downloaden',
    downloading: 'Video wordt gedownload...',
    success: 'Video opgeslagen!',
    successDesc: 'Je kunt de video nu vinden bij "Mijn video\'s"',
    invalidUrl: 'Deze link werkt niet. Probeer een andere.',
    downloadFailed: 'Downloaden mislukt. Controleer je internetverbinding.',
    
    // Instructions
    howToTitle: 'Hoe gebruik je dit?',
    howToStep1: 'Open Instagram en zoek de Reel',
    howToStep2: 'Tik op de drie puntjes (•••) en kies "Link kopiëren"',
    howToStep3: 'Plak de link hierboven en tik op "Downloaden"',
    
    // Recent downloads
    recentTitle: 'Recent gedownload',
    reelId: 'Reel ID',
  },

  // Library screen
  library: {
    title: 'Mijn video\'s',
    subtitle: '{0} video',
    subtitlePlural: '{0} video\'s',
    empty: 'Nog geen video\'s',
    emptyDesc: 'Importeer video\'s van je apparaat om te beginnen',
    import: 'Video\'s toevoegen',
    importButton: 'Importeren',
    deleteConfirm: 'Video verwijderen?',
    deleteConfirmDesc: 'Deze actie kan niet ongedaan worden gemaakt',
    deleted: 'Video verwijderd uit bibliotheek',
    playVideo: 'Afspelen',
    videoDetails: 'Details',
    processVideo: 'Video omzetten',
    transcribeTranslate: 'Transcriberen & Vertalen',
    videoCompleted: 'Video afgelopen',
    backToLibrary: 'Terug naar bibliotheek',
    playbackError: 'Afspeelfout',
    loadingVideo: 'Video\'s laden...',
    loadingVideos: 'Video\'s laden...',
    importSuccess: '{0} video geïmporteerd',
    importSuccessPlural: '{0} video\'s geïmporteerd',
    importFailed: 'Importeren mislukt',
    importErrors: 'Importeerfouten',
    importErrorsDesc: 'Kon {0} video niet importeren',
    importErrorsDescPlural: 'Kon {0} video\'s niet importeren',
    permissionRequired: 'Toestemming vereist',
    permissionRequiredDesc: 'Geef toegang tot bestanden in je apparaatinstellingen.',
    unsupportedFormat: 'Niet ondersteund formaat',
    unsupportedFormatDesc: 'Selecteer MP4, MOV of M4V videobestanden.',
    deleteFailed: 'Verwijderen mislukt',
    deleteFailedDesc: 'Kon video niet verwijderen. Probeer opnieuw.',
    selected: 'geselecteerd',
    selectAll: 'Alles selecteren',
    deselectAll: 'Alles deselecteren',
  },

  // Video player
  player: {
    title: 'Video afspelen',
    play: 'Afspelen',
    pause: 'Pauzeren',
    loop: 'Herhalen',
    loopOn: 'Herhalen aan',
    loopOff: 'Herhalen uit',
    speed: 'Snelheid',
    volume: 'Volume',
    fullscreen: 'Volledig scherm',
    exitFullscreen: 'Volledig scherm uit',
    processVideo: 'Video omzetten',
  },

  // History screen
  history: {
    title: 'Eerder gedaan',
    subtitle: 'Je opgeslagen transcripties',
    subtitleCount: '{0} resultaat',
    subtitlePlural: '{0} resultaten',
    empty: 'Nog geen geschiedenis',
    emptyDesc: 'Zet video\'s om om je transcripties hier te zien',
    viewResult: 'Bekijken',
    deleteConfirm: 'Resultaat verwijderen?',
    deleteConfirmDesc: 'Deze actie kan niet ongedaan worden gemaakt',
    deleted: 'Resultaat verwijderd',
    date: 'Datum',
    video: 'Video',
    arabicText: 'Arabische tekst',
    translation: 'Vertaling',
    transcriptionResult: 'Transcriptie resultaat',
  },

  // Error messages - friendly and helpful
  errors: {
    generic: 'Er ging iets mis. Probeer het opnieuw.',
    noInternet: 'Geen internetverbinding. Controleer je wifi of mobiele data.',
    videoTooLarge: 'Deze video is te groot. Kies een kortere video.',
    videoTooShort: 'Deze video is te kort. Kies een langere video.',
    uploadFailed: 'Video uploaden mislukt. Probeer het opnieuw.',
    processingFailed: 'Video omzetten mislukt. Probeer het opnieuw.',
    saveFailed: 'Opslaan mislukt. Probeer het opnieuw.',
    loadFailed: 'Laden mislukt. Probeer het opnieuw.',
    deleteFailed: 'Verwijderen mislukt. Probeer het opnieuw.',
    shareFailed: 'Delen mislukt. Probeer het opnieuw.',
    copyFailed: 'Kopiëren mislukt. Probeer het opnieuw.',
    permissionDenied: 'Je moet toestemming geven om dit te kunnen doen.',
    storagePermission: 'Geef toestemming om bestanden op te slaan.',
    cameraPermission: 'Geef toestemming om de camera te gebruiken.',
    microphonePermission: 'Geef toestemming om de microfoon te gebruiken.',
    unsupportedFormat: 'Dit bestandstype wordt niet ondersteund. Kies een MP4, MOV of M4V bestand.',
    fileNotFound: 'Bestand niet gevonden. Probeer een ander bestand.',
    invalidUrl: 'Deze link is niet geldig. Controleer de link en probeer opnieuw.',
    downloadFailed: 'Downloaden mislukt. Controleer je internetverbinding en probeer opnieuw.',
    noVideoSelected: 'Geen video gekozen. Kies eerst een video.',
  },

  // Success messages
  success: {
    saved: 'Opgeslagen!',
    deleted: 'Verwijderd!',
    copied: 'Gekopieerd!',
    shared: 'Gedeeld!',
    uploaded: 'Geüpload!',
    downloaded: 'Gedownload!',
    processed: 'Klaar!',
  },

  // Confirmation messages
  confirm: {
    delete: 'Weet je zeker dat je dit wilt verwijderen?',
    cancel: 'Weet je zeker dat je wilt annuleren?',
    exit: 'Weet je zeker dat je wilt afsluiten?',
  },
};
