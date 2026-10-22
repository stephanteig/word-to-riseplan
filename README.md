# Word-kursmateriale til Rise-forhåndsvisning

Dette repositoryet samler en lokal nettside for kursforhåndsvisning og en ChatGPT-skill som lager datafilene nettsiden leser.

## Nettsiden

`website/` inneholder en responsiv forhåndsviser for `.riseplan`-filer. Brukeren velger en fil fra egen maskin; nettleseren leser JSON lokalt, uten å sende fila til en server. Siden viser kursmetadata, læringsmål, seksjoner og Rise-lignende tekst-, liste-, fane-, trekkspill-, kort- og prosessblokker. Tekst kan kopieres fra hvert felt.

Start lokalt med Node.js:

```powershell
cd website
node server.js
```

Åpne deretter adressen serveren viser, vanligvis `http://localhost:4173`. For å laste testfila automatisk, åpne `http://localhost:4173/?test=1`. Vanlig startside viser opplastingsområdet. Nettsiden har ingen npm-avhengigheter eller egen build-kommando.

## ChatGPT-skill

`riseplan-skill/` inneholder `SKILL.md`, ChatGPT-visningsmetadata, formatreferanse, valideringsskript og ZIP-bygger. Skillen leser vedlagt Word-kursmateriale, bevarer kildens ordlyd, deler det inn i kursdeler og blokker, og lager en `.riseplan` JSON-fil. Den skal ikke finne på faginnhold eller quizsvar. Uklarheter og manglende kildeopplysninger legges i `notes`.

Formatet må bruke `format: "rise-preview-plan"`, `version: "1.0"`, en kurs-tittel, minst én navngitt seksjon og blokker med enten `items`-liste eller `text`-streng. Den faktiske nettsidevalideringen og valgfri JSON-validering finnes i `website/app.js` og `riseplan-skill/scripts/validate_riseplan.py`.

Valider Gemba-testfila fra repositoryets rot:

```powershell
python riseplan-skill/scripts/validate_riseplan.py website/gemba-walk-test.riseplan
```

Testfila ligger bare én gang, under `website/`. Test den i nettleseren via `/?test=1`.

## Slik henger prosjektene sammen

Skillen produserer `.riseplan`-filer etter skjemaet som nettsiden validerer og viser. Fila er en forhåndsvisningsplan, ikke en Articulate Rise-import eller et publisert kurs. Brukeren kan laste resultatet opp på nettsiden og kopiere tekst derfra.

Quizspørsmål bevares i JSON som lesbare spørsmål, svaralternativer og eventuell kildeangitt fasit. Nettsiden har ikke en egen interaktiv quizvisning; quizinnhold vises som tekst, og ukjente quizmetadata ignoreres visuelt. Skillen skal beskrive dette i blokkens `reason` og i `notes`.

## Bygg installerbar skill-ZIP

ZIP-en er generert og er ikke versjonsstyrt. Fra repositoryets rot bygges den slik:

```powershell
python riseplan-skill/scripts/build_skill_zip.py --example website/gemba-walk-test.riseplan --output riseplan-skill/word-to-riseplan.skill.zip
```

ZIP-en inneholder `SKILL.md`, `agents/openai.yaml`, skjemareferansen, valideringsskriptet og testeksempel under `examples/`. Last den opp fra ChatGPTs Skills-side med **Opprett → Last opp fra datamaskinen**. Tilgjengeligheten kan avhenge av konto og arbeidsområde.
