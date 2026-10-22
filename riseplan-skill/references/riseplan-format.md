# Rise-planformat for forhåndsvisningsnettsiden

Dette følger skjemaet og valideringen implementert i `website/app.js` i samlerepoet. Test- og eksempeldata ligger i `website/gemba-walk-test.riseplan`. Den byggede skill-ZIP-en legger eksemplet under `examples/`.

## Påkrevde felt og regler

- Roten er et JSON-objekt.
- `format` må være nøyaktig `rise-preview-plan`.
- `version` må være nøyaktig strengen `1.0`.
- `course` må være et objekt og `course.title` en ikke-tom tekststreng.
- `sections` må være en ikke-tom liste. Hver seksjon må være et objekt med en ikke-tom `title`-streng og en `blocks`-liste (listen kan være tom).
- Hver blokk må være et objekt med enten `items` som liste eller `text` som tekststreng. Forhåndsviseren validerer ikke `id`, `type`, `riseBlock`, `title`, `reason` eller innholdstypen inni `items` utover objekt eller streng.
- `language`, `course.subtitle`, `course.program`, `course.prerequisite`, `course.description`, `course.learningObjectives`, `notes` og blokkfelter som `closingText` er valgfrie.
- Ukjente felter avvises ikke. Forhåndsviseren ignorerer ukjente felter i visningen.

## Anbefalt struktur

```json
{
  "format": "rise-preview-plan",
  "version": "1.0",
  "language": "nb-NO",
  "course": {
    "title": "Kursnavn",
    "subtitle": "Undertittel fra kilden",
    "program": "Program fra kilden",
    "prerequisite": "Forkunnskapskrav fra kilden",
    "description": "Kursbeskrivelse fra kilden",
    "learningObjectives": ["Læringsmål fra kilden"]
  },
  "sections": [
    {
      "id": "del-1",
      "title": "Kursdel",
      "blocks": [
        {
          "id": "innledning",
          "type": "text",
          "riseBlock": "text",
          "title": "Blokktittel",
          "text": "Kildetekst",
          "reason": "Kort begrunnelse for blokkforslaget."
        }
      ]
    }
  ],
  "notes": ["Mangler eller tydelig forbehold fra kilden."]
}
```

Bruk bare metadata som kilden gir grunnlag for. `id` skal være unik i fila og bestå av enkle bokstaver/tall/bindestrek. `reason` er assistentens korte forklaring av visningsvalget, ikke faginnhold.

## Blokker som forhåndsviseren støtter direkte

`type` eller `riseBlock` gjenkjennes for: `text`/`paragraph` → tekst, `bulleted-list`/`list` → punktliste, `tabs` → faner, `accordion` → trekkspill, `cards` → kort, `process`/`steps` → stegvis prosess. Bruk `{ "title": "...", "text": "..." }` for navngitte elementer i `items`, eller tekststrenger for enkle lister. Faner, trekkspill, kort og steg viser og kopierer elementtekst; tittel + tekst kopieres med linjeskift mellom.

## Quiz som ikke har egen visningskomponent

For quizspørsmål bruk `type` og `riseBlock` lik `quiz`, men gjenta alt synlig innhold i `text` i denne rekkefølgen: spørsmål, alternativer én per linje, kildeangitt fasit/status. Legg alternativene også i `items` som `{ "title": "A", "text": "Svaralternativ" }`. Ekstra felter kan bevare semantikk:

```json
{
  "id": "sporsmal-1",
  "type": "quiz",
  "riseBlock": "quiz",
  "title": "Spørsmål 1",
  "text": "Spørsmålstekst\nA. Alternativ\nB. Alternativ\nRiktig svar (markert i kilden): B",
  "items": [
    { "title": "A", "text": "Alternativ" },
    { "title": "B", "text": "Alternativ" }
  ],
  "answerStatus": "confirmed",
  "correctAnswers": ["B"],
  "multipleAnswers": false,
  "reason": "Kilden inneholder et quizspørsmål. Forhåndsviseren viser teksten, ikke en interaktiv quiz."
}
```

For ubekreftet fasit bruk `answerStatus: "unconfirmed"`, utelat `correctAnswers`, og skriv tydelig status i `text` og `notes`. Bruk `multipleAnswers: true` bare når kilden uttrykkelig oppgir flere riktige svar.
