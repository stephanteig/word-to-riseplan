# Rise-kursforhåndsvisning

En enkel nettside som leser `.riseplan`-filer som JSON direkte i nettleseren. Opplastet fil sendes ikke til en server. Innholdet vises som kursseksjoner og Rise-lignende blokker med egne tekstkopieringsknapper.

## Åpne nettsiden

1. Installer Node.js hvis det ikke allerede finnes på maskinen.
2. Åpne PowerShell i denne prosjektmappen.
3. Kjør `node server.js`.
4. Åpne adressen som vises, normalt `http://localhost:4173`.

Du kan også åpne `index.html` direkte i en moderne nettleser. En lokal webserver gir best støtte for alle nettleserfunksjoner.

## Bruke nettsiden

- Slipp en `.riseplan`-fil på opplastingsfeltet, eller trykk der for å velge en fil.
- Filen leses lokalt i nettleseren. Støttet format er `rise-preview-plan`, versjon `1.0`.
- Kursoversikten viser tittel, undertittel, program, forkunnskapskrav, beskrivelse og læringsmål når de finnes.
- Bruk kursdelene i kontrollpanelet til å hoppe i innholdet.
- Endre foreslått blokk i nedtrekksmenyen. Det endrer bare forhåndsvisningen, ikke kildefilen.
- Bruk «Kopier tekst» på felt, faner, trekkspillinnhold, kort og steg. Punktlister har en knapp for alle punktene.

## Testdata

`gemba-walk-test.riseplan` er testfila som fulgte prosjektoppgaven. Med serveren startet kan `http://localhost:4173/?test=1` brukes til å laste testfila automatisk i nettleseren. Uten `?test=1` åpnes vanlig opplastingsvisning.

## Filer

- `index.html` – nettsidens innhold og struktur.
- `styles.css` – utforming for mobil og datamaskin.
- `app.js` – opplasting, validering, kursvisning og kopiering.
- `server.js` – liten lokal server uten eksterne avhengigheter.
- `gemba-walk-test.riseplan` – eksempel- og testdata.
