# Rise-kursforhåndsvisning

En responsiv nettside som leser `.riseplan` JSON-filer lokalt i nettleseren og viser dem som kurs med kopierbare tekstfelt. Opplastede filer sendes ikke til en server.

## Last ned

[Nettside-ZIP v1.0.0](https://github.com/stephanteig/word-to-riseplan/releases/download/v1.0.0/word-to-riseplan-website-v1.0.0.zip) inneholder bare nettsideprosjektet. [Siste release](https://github.com/stephanteig/word-to-riseplan/releases/tag/v1.0.0) har også skill-ZIP og samlet ZIP.

## Start lokalt

1. Installer Node.js hvis det ikke finnes på maskinen.
2. Pakk ut nettside-ZIP-en til en ny mappe.
3. Åpne PowerShell eller en terminal i mappa som inneholder `server.js`.
4. Kjør `node server.js`.
5. Åpne adressen som vises, vanligvis `http://localhost:4173`.

Nettsiden har ingen npm-avhengigheter eller egen build-kommando. Du kan også åpne `index.html` direkte i en nettleser, men en lokal server gir best støtte. Bruk `http://localhost:4173/?test=1` for automatisk Gemba-eksempelvisning.

## Bruk

- Slipp `.riseplan`-fila på opplastingsfeltet eller trykk for å velge den.
- Støttet format er `rise-preview-plan`, versjon `1.0`.
- Naviger mellom kursdelene med oversikten i kontrollpanelet.
- Endre foreslått blokk i menyen. Det påvirker bare visningen.
- Kopier tekst fra felt, faner, trekkspillinnhold, kort og steg. Punktlister har en knapp for alle punktene.

## Begrensninger

Quizspørsmål vises som tekst, ikke som en interaktiv quiz. Innholdet og kildeangitte svar er bevart i `.riseplan`, men ukjente quizfelter brukes ikke i visningen.

## Installer med ChatGPT

Kopier prompten og lim den inn i ChatGPT etter at du har lastet ned nettside-ZIP-en. Hvis fila ikke finnes i prosjektmappa eller Nedlastinger, spør ChatGPT hvor den ligger.

```text
Hjelp meg å sette opp og starte Rise-kursforhåndsvisningen. Finn den nedlastede nettside-ZIP-en i Nedlastinger eller den åpne prosjektmappa; spør meg hvor den ligger hvis du ikke finner den. Pakk den ut til en ny mappe som ikke finnes fra før, les README.md i den utpakkede mappa og følg instruksjonene der. Forklar enkelt at Node.js trengs, start serveren lokalt, vis adressen jeg skal åpne, og hjelp med vanlige oppstartsfeil som Node.js som mangler eller en opptatt port. Ikke slett, flytt eller overskriv noen av filene mine. Ikke publiser eller deploy nettsiden.
```
