#!/usr/bin/env python3
"""Validate the structural requirements enforced by the Rise preview website."""
import json
import sys
from pathlib import Path


def fail(message: str) -> None:
    print(f"FEIL: {message}", file=sys.stderr)
    raise SystemExit(1)


def main() -> None:
    if len(sys.argv) != 2:
        fail("Bruk: python scripts/validate_riseplan.py <fil.riseplan>")
    path = Path(sys.argv[1])
    try:
        data = json.loads(path.read_text(encoding="utf-8-sig"))
    except FileNotFoundError:
        fail(f"Fant ikke fila: {path}")
    except (UnicodeError, json.JSONDecodeError) as error:
        fail(f"Fila er ikke gyldig UTF-8 JSON: {error}")

    if not isinstance(data, dict):
        fail("Roten må være et JSON-objekt.")
    if data.get("format") != "rise-preview-plan":
        fail('format må være "rise-preview-plan".')
    if data.get("version") != "1.0":
        fail('version må være strengen "1.0".')
    course = data.get("course")
    if not isinstance(course, dict):
        fail('course må være et JSON-objekt.')
    if not isinstance(course.get("title"), str) or not course["title"].strip():
        fail("course.title må være en ikke-tom tekststreng.")
    sections = data.get("sections")
    if not isinstance(sections, list) or not sections:
        fail("sections må være en ikke-tom liste.")

    block_count = 0
    for si, section in enumerate(sections, 1):
        if not isinstance(section, dict) or not isinstance(section.get("title"), str) or not section["title"].strip():
            fail(f"Kursdel {si} må være et objekt med en ikke-tom title.")
        blocks = section.get("blocks")
        if not isinstance(blocks, list):
            fail(f'Kursdelen "{section["title"]}" må ha blocks som liste.')
        for bi, block in enumerate(blocks, 1):
            if not isinstance(block, dict):
                fail(f"Blokk {bi} i kursdel {si} må være et objekt.")
            if not isinstance(block.get("items"), list) and not isinstance(block.get("text"), str):
                fail(f"Blokk {bi} i kursdel {si} må ha items som liste eller text som streng.")
            items = block.get("items")
            if isinstance(items, list):
                for ii, item in enumerate(items, 1):
                    if not isinstance(item, (str, dict)):
                        fail(f"Element {ii} i items for blokk {bi} må være streng eller objekt.")
            block_count += 1

    if path.suffix.lower() != ".riseplan":
        print("ADVARSEL: Filendelsen er ikke .riseplan.", file=sys.stderr)
    print(f"OK: {course['title']} — {len(sections)} kursdeler, {block_count} blokker.")


if __name__ == "__main__":
    main()
