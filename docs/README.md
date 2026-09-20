# Arabische Video Vertaler - Mobiele App

Een React Native app voor het transcriberen en vertalen van Arabische video's naar het Nederlands, met geïntegreerde Dua-extractie functionaliteit.

## 🚀 Functies

### 📹 Video Verwerking
- **Instagram Reel Ondersteuning**: Plak Instagram Reel links voor directe verwerking
- **Video Import**: Importeer video's van apparaat (MP4, MOV, M4V, AVI, MKV)
- **Video Bibliotheek**: Beheer en bekijk geïmporteerde video's
- **Batch Verwerking**: Verwerk meerdere video's tegelijk
- **Veilige Bestandsvalidatie**: Bescherming tegen kwaadaardige bestandsnamen en formaten

### 🌍 Taalondersteuning
- **Arabisch naar Nederlands**: Automatische vertaling van Arabische tekst
- **Dua Extractie**: Identificeer en extraheer islamitische gebeden en smeekbeden
- **Meertalige Interface**: Volledig gelokaliseerd naar het Nederlands

### 📊 Resultaatbeheer
- **Geschiedenis**: Bewaar en bekijk eerdere transcripties
- **Export**: Kopieer en deel resultaten
- **Zoeken**: Vind specifieke transcripties
- **Metadata**: Tijdstempels, duur, bestandsgrootte

### 🔧 Configuratie
- **API Integratie**: Supadata (transcriptie) + Google AI Studio (vertaling)
- **Whisper Modelen**: Kies tussen Tiny, Base, Small, Medium, Large
- **Dua Instellingen**: Schakel Dua-extractie in/uit
- **Gebruikersprofielen**: Persoonlijke instellingen en naam
- **Opslag**: Lokale persistentie van voorkeuren

## 🛠️ Technologie Stack

- **Framework**: React Native met Expo
- **Programmeertaal**: JavaScript/TypeScript
- **Styling**: StyleSheet met Liquid Glass Design
- **Opslag**: AsyncStorage voor lokale gegevens
- **Video**: Expo-AV voor videoverwerking
- **Bestandssysteem**: Expo File System
- **Netwerk**: Axios voor API calls

## 🏗️ Project Structuur

```
src/
├── components/          # Herbruikbare UI componenten
│   ├── common/         # Algemene componenten (Button, PageHeader, etc.)
│   ├── upload/          # Upload gerelateerde componenten
│   ├── processing/      # Verwerking status componenten
│   ├── download/        # Download gerelateerde componenten
│   └── library/         # Bibliotheek componenten
├── screens/             # App schermen
│   ├── HomeScreen.js
│   ├── UploadScreen.js
│   ├── ConfigureScreen.js
│   ├── ProcessingScreen.js
│   ├── ResultsScreen.js
│   ├── VideoLibraryScreen.js
│   ├── HistoryScreen.js
│   └── TranscriptionResultsScreen.js
├── services/            # Business logica en API integratie
│   ├── videoPickerService.js
│   ├── videoLibraryService.js
│   ├── transcriptionService.js
│   ├── supadataService.js    # Supadata API integratie
│   ├── geminiService.js      # Google AI Studio integratie
│   └── userSettingsService.js
├── utils/               # Hulp functies
│   ├── storage.js
│   ├── validators.js
│   ├── videoUtils.js
│   ├── videoSecurity.js
│   └── errorMapping.js
├── navigation/          # Navigatie configuratie
│   ├── TabNavigator.js
│   └── LibraryStackNavigator.js
├── localization/        # Vertalingen
│   └── nl.js
└── styles/             # Stijlen en thema's
    ├── colors.js
    ├── typography.js
    ├── layout.js
    └── globalStyles.js
```

## 🚀 Installatie

### Vereisten
- Node.js 16+ 
- npm of yarn
- Expo CLI
- React Native development omgeving

### Stappen
1. **Clone de repository**
   ```bash
   git clone https://github.com/username/arabic-video-translator-mobile.git
   cd arabic-video-translator-mobile
   ```

2. **Installeer dependencies**
   ```bash
   npm install
   # of
   yarn install
   ```

3. **Configureer omgevingsvariabelen**
   Kopieer `.env.example` naar `.env.local` en configureer:
   ```env
   SUPADATA_API_KEY=jouw_sk_api_key_hier
   GOOGLE_AI_API_KEY=jouw_google_ai_studio_key_hier
   ```

4. **Start de development server**
   ```bash
   npm start
   # of
   expo start
   ```

5. **Run op apparaat/emulator**
   ```bash
   npm run android    # Android
   npm run ios       # iOS
   expo run:android     # Via Expo
   expo run:ios        # Via Expo
   ```

## 🔧 API Configuratie

### Supadata (Transcriptie)
- **Doel**: Arabische audio transcriberen met tijdstempels
- **Kosten**: Gratis tier beschikbaar
- **Belangrijk**: Geen vertaling (gratis houden)
- **Key**: Haal van [Supadata Dashboard](https://supadata.ai/dashboard)

### Google AI Studio (Vertaling + Dua Extractie)
- **Doel**: Arabisch naar Nederlands vertalen + Dua's extraheren
- **Model**: Gemini Pro
- **Kosten**: Gratis tier beschikbaar
- **Key**: Haal van [Google AI Studio](https://aistudio.google.com)

## 📱 Gebruik

### Basis Workflow
1. **Start**: Open de app en tik op "Verwerken"
2. **Kies Bron**: 
   - Plak Instagram Reel link, OF
   - Importeer video van apparaat
3. **Configureer**: Kies API provider en Dua opties
4. **Verwerk**: Wacht tot verwerking voltooid is
5. **Resultaten**: Bekijk Arabische tekst, Nederlandse vertaling, en Dua's

### Video Bibliotheek
1. **Importeer**: Tik op "Video's toevoegen" in bibliotheek tab
2. **Beheer**: Selecteer, verwijder, of verwerk video's
3. **Bekijk**: Tik om video af te spelen in ingebouwde speler

### Geschiedenis
- **Automatisch opgeslagen**: Alle transcripties worden lokaal bewaard
- **Doorzoekbaar**: Vind resultaten op basis van datum of inhoud
- **Exporteer**: Kopieer tekst of deel resultaten

## 🔒 Beveiliging

### Bestandsvalidatie
- **Grootte Limiet**: Max 500MB per bestand
- **Formaat Validatie**: Alleen MP4, MOV, M4V, AVI, MKV toegestaan
- **Naam Sanitization**: Verwijder gevaarlijke karakters en pad traversal
- **URI Validatie**: Controleer op onveilige protocols

### API Beveiliging
- **Server-side Keys**: API sleutels worden server-side beheerd
- **Environment Variables**: Geen hardcoded keys in client code
- **Rate Limiting**: Bescherming tegen misbruik

## 🧪 Testen

### Unit Tests
```bash
# Run alle tests
npm test

# Run specifieke test
npm test -- --testNamePattern="videoSecurity"
```

### Test Coverage
- **Video Security**: Bestandsvalidatie en sanitization
- **Video Picker**: Bestandsselectie en metadata extractie
- **Video Library**: Opslag en beheer functionaliteit
- **Components**: UI componenten en interactie
- **Services**: Business logica en API integratie

## � Deployment

### Vercel (Aanbevolen)
1. Push naar GitHub
2. Import project in Vercel
3. Voeg omgevingsvariabelen toe:
   - `SUPADATA_API_KEY`
   - `GOOGLE_AI_API_KEY`
4. Deploy

### Expo Application Services
1. Configureer `app.json`
2. Build voor iOS/Android
3. Submit naar app stores

## 📝 Documentatie

Bekijk de `docs/` map voor gedetailleerde documentatie:
- API configuratie gidsen
- UI component documentatie
- Test instructies
- Deployment handleidingen

## 🐛 Troubleshooting

- **"API key niet geconfigureerd"**: Voeg keys toe aan `.env.local`
- **Transcriptie faalt**: Controleer Supadata API key en quota
- **Vertaling faalt**: Controleer Google AI Studio API key en quota
- **Video import faalt**: Controleer bestandsformaat en grootte

## 🤝 Bijdragen

Bijdragen zijn welkom! Volg deze stappen:
1. Fork de repository
2. Maak een feature branch
3. Commit je changes
4. Push naar de branch
5. Open een Pull Request

## 📄 Licentie

0BSD - Zie LICENSE.md voor details
