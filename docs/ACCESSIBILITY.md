# Toegankelijkheidsgids - Arabische Video Vertaler

## 🎯 Doel

Deze gids beschrijft de toegankelijkheidsfuncties en -verbeteringen die zijn geïmplementeerd in de Arabische Video Vertaler mobiele app om ervoor te zorgen dat de app bruikbaar is voor gebruikers met verschillende beperkingen.

## ♿ Geïmplementeerde Functies

### Schermlezerondersteuning
- **VoiceOver (iOS)**: Volledig ondersteund
- **TalkBack (Android)**: Volledig ondersteund
- **Selecteren naar spreken**: Beschikbaar voor alle teksten
- **Aangepaste spreeksnelheid**: Gebruikers kunnen de spreeksnelheid aanpassen

### Visuele Aanpassingen
- **Lettergrootte**: Dynamische schaalvergroting (100% - 200%)
- **Hoog contrast**: Modus voor gebruikers met visuele beperkingen
- **Kleurenblind modus**: Ondersteuning voor verschillende soorten kleurenblindheid
- **Verminderde animaties**: Optie om animaties te verminderen

### Navigatie
- **Toegankelijkheidsnavigatie**: Volledige navigatie met screen reader
- **Focusbeheer**: Zichtbare focusindicatoren
- **Swipe-gesten**: Ondersteuning voor swipe-navigatie
- **Toetsenbordnavigatie**: Volledige toetsenbordondersteuning

### Geluid
- **Haptische feedback**: Trillingen voor belangrijke acties
- **Geluidswaarschuwingen**: Auditieve geluidssignalen
- **Visuele geluidsindicatoren**: Flitsende lichten voor geluid

## 🔧 Gebruik

### VoiceOver/TalkBack
1. **Activeer**: Ga naar Instellingen → Toegankelijkheid → VoiceOver/TalkBack
2. **Navigeer**: 
   - Swipe rechts of links om tussen elementen te navigeren
   - Dubbeltik om elementen te selecteren
   - Veeg omhoog/omlaag om te scrollen
   - Swipe met drie vingers om te openen

### Visuele Aanpassingen
1. **Lettergrootte aanpassen**:
   - Instellingen → Toegankelijkheid → Weergavegrootte
   - Kies tussen 100% en 200%

2. **Hoog contrast inschakelen**:
   - Instellingen → Toegankelijkheid → Hoog contrast
   - Verbeterde leesbaarheid in alle schermen

3. **Kleurenblind modus**:
   - Instellingen → Toegankelijkheid → Kleurenblindheid
   - Ondersteunt de meest voorkomende soorten:
     - Protanopie (rood-groen)
     - Deuteranopie (rood-groen)
     - Tritanopie (blauw-geel)

## 📱 Scherm-specifieke Functies

### Startscherm
- **Toegankelijke welkomstboodschap**: "Welkom bij Arabische Video Vertaler"
- **Knoppen**: Alle knoppen hebben toegankelijkheidslabels
- **Formuliervelden**: Gepaste placeholders en labels

### Uploadscherm
- **Bestandskiezer**: Toegankelijke bestandsselectie
- **URL-invoer**: Toegankelijke linkinvoer met validatie
- **Voortgangsindicatoren**: Auditieve voortgangsmeldingen

### Configuratiescherm
- **Modelkeuze**: Toegankelijke selectie van Whisper-modellen
- **Instellingen**: Alle schakelaars zijn toegankelijk
- **Beschrijvingen**: Duidelijke beschrijvingen voor alle opties

### Verwerkingsscherm
- **Voortgangsbalk**: Toegankelijke voortgangsindicatie
- **Statusmeldingen**: Gesproken meldingen voor alle stappen
- **Annuleerknop**: Altijd bereikbaar en toegankelijk

### Resultatenscherm
- **Tekstweergave**: Arabische en Nederlandse tekst met schaalvergroting
- **Kopieerknop**: Toegankelijk kopiëren naar klembord
- **Deelknoppen**: Toegankelijk delen via verschillende methodes
- **Opslaanknop**: Toegankelijk opslaan van resultaten

### Videobibliotheek
- **Videogrid**: Toegankelijke videominiaturen
- **Selectiemodus**: Toegankelijke video-selectie
- **Actieknoppen**: Afspelen, verwijderen, verwerken
- **Zoekfunctie**: Toegankelijk zoeken in video's

### Geschiedenisscherm
- **Resultatenlijst**: Toegankelijke lijst met transcripties
- **Zoekfunctie**: Toegankelijk zoeken in geschiedenis
- **Filteropties**: Toegankelijk filteren op datum/zoekterm

## 🎨 Design voor Toegankelijkheid

### Kleurcontrast
- **Minimum contrast**: 4.5:1 contrastverhouding
- **Tekstgrootte**: Minimaal 14pt op mobiel, 16pt op tablet
- **Focusindicatoren**: 2px rand, zichtbare focusstaat
- **Actieve elementen**: Duidelijke visuele feedback

### Animaties
- **Verminder**: Respecteert "Verminder animaties" instelling
- **Geen flitsen**: Geen flitsende animaties die epilepsie kunnen veroorzaken
- **Duur**: Animaties niet langer dan 300ms

## 🔧 Ontwikkelingsrichtlijnen

### Nieuwe Functies
1. **Test met screen readers**: Regelmatig testen met VoiceOver en TalkBack
2. **Toegankelijkheidsaudit**: Gebruik Accessibility Inspector in Xcode
3. **Contrasttest**: Test met verschillende contrastmodi
4. **Focusbeheer**: Zorg dat de focuslogica correct is

### Code Standaarden
```javascript
// Toegankelijke componenten
const AccessibleButton = ({ title, onPress, ...props }) => (
  <TouchableOpacity
    accessibilityRole="button"
    accessibilityLabel={title}
    accessibilityHint={props.hint}
    onPress={onPress}
    {...props}
  >
    <Text>{title}</Text>
  </TouchableOpacity>
);

// Toegankelijke tekstinvoer
const AccessibleInput = ({ placeholder, ...props }) => (
  <TextInput
    accessibilityLabel={placeholder}
    accessibilityLabelledBy={props.label}
    onChangeText={props.onChangeText}
    {...props}
  />
);
```

### Test Checklist
- [ ] VoiceOver navigatie werkt correct
- [ ] TalkBack navigatie werkt correct
- [ ] Alle interactieve elementen hebben toegankelijkheidslabels
- [ ] Focusvolgorde is logisch
- [ ] Animaties respecteren vermindereninstelling
- [ ] Kleurcontrastmodus werkt correct
- [ ] Tekstvergroting werkt in alle schermen

## 📞 Ondersteuning

### Helpbronnen
- **Apple Accessibility**: https://developer.apple.com/accessibility/
- **Android Accessibility**: https://developer.android.com/guide/topics/ui-accessibility/
- **React Native Accessibility**: https://reactnative.dev/docs/accessibility
- **WCAG Richtlijnen**: https://www.w3.org/WAI/WCAG21/quickref/

### Feedback
Geef feedback over toegankelijkheid via:
- GitHub Issues: Tag met `accessibility`
- Email: accessibility@arabicvideotranslator.app
- In-app feedback: Instellingen → Help → Toegankelijkheid

---

**Laatst bijgewerkt**: 10 April 2025
**Versie**: 1.0.0
