#!/usr/bin/env python3
"""
Automatically installs required Python packages if they are missing.

Packages:
- audioop-lts
- chardet
- cryptography
- mido
- puremagic
- pillow
- pycryptodome
- pydub
"""

from __future__ import annotations

import importlib
import subprocess
import sys
from typing import Dict

# Mapping:
# pip package name -> import name
PACKAGES: Dict[str, str] = {
    "audioop-lts": "audioop",
    "chardet": "chardet",
    "cryptography": "cryptography",
    "mido": "mido",
    "puremagic": "puremagic",
    "pillow": "PIL",
    "pycryptodome": "Crypto",
    "pydub": "pydub",
}


def is_installed(import_name: str) -> bool:
    """
    Checks if a module can be imported.

    Args:
        import_name: Module name used in imports.

    Returns:
        True if installed, otherwise False.
    """

    try:
        importlib.import_module(import_name)
        return True
    except ImportError:
        return False


def install_package(package_name: str) -> bool:
    """
    Installs a package using pip.

    Args:
        package_name: Name of the package on PyPI.

    Returns:
        True if installation succeeded, otherwise False.
    """

    print(f"Installing '{package_name}'...")

    try:
        subprocess.check_call(
            [sys.executable, "-m", "pip", "install", package_name]
        )

        print(f"Successfully installed '{package_name}'")
        return True

    except subprocess.CalledProcessError:
        print(f"Failed to install '{package_name}'")
        return False


def main() -> None:
    """
    Main execution function.
    """

    print("Checking required Python packages...\n")

    installed = []
    failed = []

    for package_name, import_name in PACKAGES.items():
        if is_installed(import_name):
            print(f"[OK] {package_name}")
            installed.append(package_name)
        else:
            print(f"[MISSING] {package_name}")

            if install_package(package_name):
                installed.append(package_name)
            else:
                failed.append(package_name)

        print()

    print("=" * 50)
    print("Finished.\n")

    if installed:
        print("Installed/Available packages:")
        for package in installed:
            print(f" - {package}")

    if failed:
        print("\nFailed packages:")
        for package in failed:
            print(f" - {package}")

        sys.exit(1)

    print("\nAll required packages are installed.")


if __name__ == "__main__":
    main()
