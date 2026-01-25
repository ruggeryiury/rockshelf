import importlib, subprocess, sys


def install_py_package(package_name: str, pip_command: str | None = None) -> bool:
    pip_name = pip_command or package_name
    try:
        print(f'Verifying package "{pip_name}"...')
        importlib.import_module(package_name)
        print(f'Package "{pip_name}" is already installed.\n')
    except ImportError:
        print(f'Package "{pip_name}" not found. Installing...')
        subprocess.check_call([sys.executable, "-m", "pip", "install", pip_name])
        print(f"Package installed successfully.\n")


def install_py_deps():
    input("Rockshelf: Python Dependencies Installer.\n\nPress any key to continue...")
    print("")

    install_py_package("aenum")
    install_py_package("audioop", "audioop-lts")
    install_py_package("cryptography")
    install_py_package("ecdsa")
    install_py_package("mido")
    install_py_package("packaging")
    install_py_package("puremagic")
    install_py_package("fastxor")
    install_py_package("PIL", "Pillow")
    install_py_package("Crypto", "pycryptodome")
    install_py_package("Cryptodome", "pycryptodomex")
    install_py_package("pydub")
    install_py_package("requests")


if __name__ == "__main__":
    install_py_deps()
