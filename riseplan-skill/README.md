# Word til Rise-plan

ChatGPT-skill som leser Word-kursmateriale og lager en `.riseplan`-fil som nettsiden kan forhåndsvise.

## Last ned og installer i ChatGPT

Last ned [ChatGPT-skill-ZIP v1.0.0](https://github.com/stephanteig/word-to-riseplan/releases/download/v1.0.0/word-to-riseplan-chatgpt-skill-v1.0.0.zip). I ChatGPT åpner du **Skills → Opprett → Last opp fra datamaskinen** og velger ZIP-fila. ChatGPT kontrollerer fila; nedlasting alene installerer ikke skillen. [Siste release](https://github.com/stephanteig/word-to-riseplan/releases/tag/v1.0.0) har også en egen nettside-ZIP og en samlet ZIP.

Når skillen er installert, start **Word til Rise-plan** eller skriv `@Word til Rise-plan`, legg ved Word-dokumentet og be om en `.riseplan`-fil. Skillen henter innholdet fra kilden, beholder formuleringene så langt det lar seg gjøre og finner ikke på manglende faginnhold eller quizfasit.

## Innhold i prosjektet

- `SKILL.md` – arbeidsflyt, kildeintegritet, quizregler og avgrensninger.
- `references/riseplan-format.md` – formatet nettsiden validerer og viser.
- `scripts/validate_riseplan.py` – kontrollerer JSON og nødvendige felter.
- `scripts/build_skill_zip.py` – bygger installerbar ZIP fra kildefilene og eksempeldata.
- `agents/openai.yaml` – ChatGPT/Codex-visningsmetadata.
- `../website/gemba-walk-test.riseplan` – gyldig Gemba-testfil i samlerepoet.

## Validering og pakking

Kjør fra roten av samlerepoet:

```powershell
python riseplan-skill/scripts/validate_riseplan.py website/gemba-walk-test.riseplan
python riseplan-skill/scripts/build_skill_zip.py --example website/gemba-walk-test.riseplan --output riseplan-skill/word-to-riseplan.skill.zip
```

Nettsiden krever `format: "rise-preview-plan"`, `version: "1.0"`, kurs-tittel, minst én navngitt seksjon og minst `items` eller `text` for hver blokk.

## Begrensninger

Nettsiden har ingen egen quizvisning. Quizspørsmål med alternativer vises som tekst; metadata om riktige svar ignoreres visuelt. Skillen bevarer svarene når de er markert i kilden, gjetter ikke ubekreftede svar og forklarer begrensningen i `.riseplan`.

## Installer med ChatGPT

Kopier prompten og lim den inn i ChatGPT. Last først ned ChatGPT-skill-ZIP-en fra release-siden. Hvis ChatGPT ikke finner ZIP-fila i Nedlastinger eller prosjektmappa, spør hvor den ligger.

```text
Hjelp meg å installere Word til Rise-plan-skillen fra den nedlastede skill-ZIP-en. Finn fila i Nedlastinger eller den åpne prosjektmappa; spør meg hvor den ligger hvis du ikke finner den. Følg README-instruksjonene. Hvis du ikke kan installere skillen direkte, forklar trinn for trinn hvordan jeg åpner ChatGPT → Skills → Opprett → Last opp fra datamaskinen og velger ZIP-fila. Ikke si at den installeres automatisk. Forklar deretter hvordan jeg starter skillen, legger ved et Word-dokument og ber om en .riseplan-fil for nettsiden. Forklar at uklar fasit ikke gjettes, og at nettsiden viser quiz som tekst. Ikke slett, flytt eller overskriv noen av filene mine.
```
