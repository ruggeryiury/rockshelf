import importlib, subprocess, sys

def install_py_package(package_name: str, pip_command: str | None = None):
    pip_name = pip_command or package_name
    try:
        print(f'Verificando instalação do pacote "{pip_name}"...')
        importlib.import_module(package_name)
        print(f'Pacote "{pip_name}" já está instalado.\n')
    except ImportError:
        print(f'Pacote "{pip_name}" não encontrado. Instalando...')
        subprocess.check_call([sys.executable, "-m", "pip", "install", pip_name])
        print(f'Pacote instalado com sucesso.\n')

def install_py_deps():
    input(
        "Rockshelf: Instalador de Dependências do Python.\n\nPressione qualquer tecla para continuar..."
    )
    print("")

    install_py_package('aenum')
    install_py_package('audioop', 'audioop-lts')
    install_py_package('cryptography')
    install_py_package('ecdsa')
    install_py_package('mido')
    install_py_package('packaging')
    install_py_package('puremagic')
    install_py_package('fastxor')
    install_py_package('PIL', 'Pillow')
    install_py_package('Crypto', 'pycryptodome')
    install_py_package('Cryptodome', 'pycryptodomex')
    install_py_package('pydub')
    install_py_package('requests')

if __name__ == "__main__":
    install_py_deps()
