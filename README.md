# Word-kursmateriale til Rise-forhåndsvisning

Repoet samler en lokal nettside for kursforhåndsvisning og en ChatGPT-skill som lager `.riseplan`-filene nettsiden leser.

## Last ned siste versjon

[Åpne GitHub Release v1.0.0](https://github.com/stephanteig/word-to-riseplan/releases/tag/v1.0.0).

- [Nettside-ZIP](https://github.com/stephanteig/word-to-riseplan/releases/download/v1.0.0/word-to-riseplan-website-v1.0.0.zip) – velg denne for å sette opp og starte forhåndsviseren lokalt.
- [ChatGPT-skill-ZIP](https://github.com/stephanteig/word-to-riseplan/releases/download/v1.0.0/word-to-riseplan-chatgpt-skill-v1.0.0.zip) – velg denne for å laste opp skillen via ChatGPTs Skills-side.
- [Samlet ZIP](https://github.com/stephanteig/word-to-riseplan/releases/download/v1.0.0/word-to-riseplan-complete-v1.0.0.zip) – inneholder nettsiden og skillens kildefiler og dokumentasjon i én mappe. Skillen må fortsatt lastes opp separat i ChatGPT.

## Nettsiden

`website/` inneholder en responsiv forhåndsviser for `.riseplan` JSON-filer. Nettleseren leser opplastede filer lokalt og sender dem ikke til en server. Siden viser kursmetadata, læringsmål, seksjoner og Rise-lignende tekst-, punktliste-, fane-, trekkspill-, kort- og prosessblokker. Tekst kan kopieres fra hvert felt.

Nettsiden krever Node.js. Pakk ut nettside-ZIP-en, åpne en terminal i den utpakkede `website`-mappa, kjør:

```powershell
node server.js
```

Åpne adressen som serveren viser, vanligvis `http://localhost:4173`. For å laste Gemba-testfila automatisk, åpne `http://localhost:4173/?test=1`. Siden har ingen npm-avhengigheter eller egen build-kommando.

## ChatGPT-skillen

`riseplan-skill/` inneholder `SKILL.md`, ChatGPT-visningsmetadata, formatreferanse, valideringsskript og ZIP-bygger. Skillen leser vedlagt Word-kursmateriale, bevarer kildens ordlyd, deler innholdet i kursdeler og foreslår blokker. Den skal ikke finne på faginnhold eller quizsvar. Mangler og tvetydigheter legges i `notes`.

For å installere: last ned ChatGPT-skill-ZIP-en, gå til **ChatGPT → Skills → Opprett → Last opp fra datamaskinen**, og velg fila. Opplastingen installerer skillen etter ChatGPTs kontroll; den installeres ikke automatisk ved nedlasting. Etterpå start skillen eller bruk `@Word til Rise-plan`, legg ved et Word-dokument og be om en `.riseplan`-fil.

## Format, test og begrensninger

Nettsiden forventer `format: "rise-preview-plan"`, `version: "1.0"`, en kurs-tittel, minst én navngitt seksjon og blokker med enten `items`-liste eller `text`-streng. Gemba-testfila ligger under `website/gemba-walk-test.riseplan`.

Valider testfila fra repo-roten:

```powershell
python riseplan-skill/scripts/validate_riseplan.py website/gemba-walk-test.riseplan
```

Quizspørsmål og svaralternativer bevares i `.riseplan`, men nettsiden har ingen egen interaktiv quizvisning. Quizinnhold vises som tekst, og quizmetadata utover tekst ignoreres visuelt. Skillen skal markere dette i blokkens `reason` og i `notes`.

## Bygg skill-ZIP på nytt

Fra repo-roten bygges den installerbare ZIP-en fra kildefilene og den ene Gemba-testfila slik:

```powershell
python riseplan-skill/scripts/build_skill_zip.py --example website/gemba-walk-test.riseplan --output riseplan-skill/word-to-riseplan.skill.zip
```

## Installer med ChatGPT

Kopier prompten under og lim den inn i ChatGPT. Last ned ønsket ZIP fra release-siden først. Hvis ChatGPT ikke finner fila i prosjektmappa eller Nedlastinger, skal den spørre hvor fila ligger. ChatGPT skal følge README i pakken.

```text
Hjelp meg å sette opp dette prosjektet fra ZIP-fila jeg lastet ned fra GitHub Releases. Finn ZIP-fila i Nedlastinger eller den åpne prosjektmappa, og spør meg hvor den ligger hvis du ikke finner den. Pakk den ut til en ny mappe med et navn som ikke finnes fra før. Les og følg prosjektets README-instruksjoner. Hvis ZIP-en inneholder nettsiden, forklar enkelt at Node.js trengs, start nettsiden lokalt, og hjelp meg med vanlige oppstartsfeil som opptatt port eller manglende Node.js. Hvis jeg vil sette opp ChatGPT-skillen, vis meg hvordan jeg laster skill-ZIP-en opp via ChatGPT → Skills → Opprett → Last opp fra datamaskinen, og forklar hvordan jeg bruker den med et Word-dokument. Ikke slett, flytt eller overskriv noen av filene mine. Ikke publiser eller deploy nettsiden.
```
