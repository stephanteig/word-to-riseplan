#!/usr/bin/env python3
"""Package the standalone skill and a supplied .riseplan example as a ZIP."""
import argparse
from pathlib import Path
from zipfile import ZIP_DEFLATED, ZipFile


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--example", required=True, type=Path, help="Valid .riseplan example to bundle")
    parser.add_argument("--output", required=True, type=Path, help="Output ZIP path")
    args = parser.parse_args()
    skill_root = Path(__file__).resolve().parents[1]
    example = args.example.resolve()
    output = args.output.resolve()
    if not example.is_file() or example.suffix.lower() != ".riseplan":
        parser.error("--example must point to an existing .riseplan file")

    files = [
        (skill_root / "SKILL.md", "SKILL.md"),
        (skill_root / "agents" / "openai.yaml", "agents/openai.yaml"),
        (skill_root / "references" / "riseplan-format.md", "references/riseplan-format.md"),
        (skill_root / "scripts" / "validate_riseplan.py", "scripts/validate_riseplan.py"),
        (example, "examples/" + example.name),
    ]
    missing = [str(source) for source, _ in files if not source.is_file()]
    if missing:
        parser.error("required package source is missing: " + ", ".join(missing))
    output.parent.mkdir(parents=True, exist_ok=True)
    with ZipFile(output, "w", ZIP_DEFLATED) as archive:
        for source, name in files:
            archive.write(source, name)
    print(f"Created {output} ({len(files)} files)")


if __name__ == "__main__":
    main()
