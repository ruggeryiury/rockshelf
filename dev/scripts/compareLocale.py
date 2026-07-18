from pathlib import Path
import os
import re

ENGLISH_REF_LOCALE_PATH = 'app/src/renderer/src/app/locale/en-US.ts'
TARGET_LOCALE_PATH = 'app/src/renderer/src/app/locale/pt-BR.ts'


def extract_keys(file: Path) -> set[str]:
    text = file.read_text(encoding="utf-8")

    # Matches:
    # about:
    # 'en-US':
    # "en-US":
    pattern = re.compile(
        r"^\s*(?:'([^']+)'|\"([^\"]+)\"|([A-Za-z_$][A-Za-z0-9_$-]*))\s*:",
        re.MULTILINE,
    )

    keys = set()

    for match in pattern.finditer(text):
        key = next(group for group in match.groups() if group is not None)
        keys.add(key)

    return keys


if __name__ == "__main__":
    en_locale_path = Path(
        os.getcwd(), '../../', ENGLISH_REF_LOCALE_PATH).resolve()
    target_locale_path = Path(
        os.getcwd(), '../../', TARGET_LOCALE_PATH).resolve()

    en_keys = extract_keys(en_locale_path)
    target_keys = extract_keys(target_locale_path)

    missing = sorted(en_keys - target_keys)

    if missing:
        print(f"Missing {len(missing)} key(s):\n")
        for key in missing:
            print(f"  {key}")
    else:
        print("No missing keys.")

    input('Press any key to close...')
