# Word til Rise-plan

ChatGPT-skill som leser vedlagt Word-kursmateriale og lager en `.riseplan`-fil for nettsiden `riseplan-forhandsvisning`.

## Installer i ChatGPT

1. Åpne **Skills** i ChatGPT-sidepanelet.
2. Velg **Opprett** → **Last opp fra datamaskinen**.
3. Velg `word-to-riseplan.skill.zip` fra denne mappa.
4. Etter installasjon: start skillen eller be ChatGPT bruke **Word til Rise-plan**, og legg ved Word-dokumentet.

Tilgjengelighet for Skills kan avhenge av ChatGPT-plan og arbeidsområdeinnstillinger.

## Lokal Codex-installasjon (valgfritt)

Kopier mappa `riseplan-skill` til `~/.agents/skills/word-to-riseplan/` eller lagre `SKILL.md` og ressursmappene under `.agents/skills/word-to-riseplan/` i et prosjekt. Codex kan oppdage lokale skill-endringer automatisk; start Codex på nytt hvis skillen ikke vises.

## Innhold

- `SKILL.md` – arbeidsflyt, kildeintegritet, quizregler og avgrensninger.
- `references/riseplan-format.md` – skjema og faktisk forhåndsvisningsatferd.
- `examples/gemba-walk-test.riseplan` – gyldig eksempel fra nettsideprosjektet.
- `scripts/validate_riseplan.py` – kontrollerer JSON og obligatoriske strukturkrav.
- `agents/openai.yaml` – valgfri visningsmetadata for ChatGPT/Codex.

## Lokal validering

```powershell
python riseplan-skill/scripts/validate_riseplan.py website/gemba-walk-test.riseplan
```

Forventet resultat: `OK: Gemba Walk — 4 kursdeler, 12 blokker.`

## Bygg ZIP på nytt

Fra roten av samlerepoet kjører du:

```powershell
python riseplan-skill/scripts/build_skill_zip.py --example website/gemba-walk-test.riseplan --output riseplan-skill/word-to-riseplan.skill.zip
```

Skillen lager bare `.riseplan`-filer. Den oppretter eller publiserer ikke Articulate Rise-kurs, og den endrer ikke nettsiden.
