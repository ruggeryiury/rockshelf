#!/usr/bin/env python3
import argparse
from os import PathLike
from pathlib import Path
from typing import Union
from lib.mogg import decrypt_mogg


def mogg_decrypt(
    enc_path: Union[str, PathLike[str]], dec_path: Union[str, PathLike[str]]
) -> Path:
    """
    Decrypts a MOGG file.

    Args:
        enc_path (Union[str, PathLike[str]]): The path to the encrypted MOGG file.
        dec_path (Union[str, PathLike[str]]): The path where the decrypted MOGG file will be written.

    Returns:
        Path: The path to the decrypted MOGG file.
    """

    enc_path = Path(enc_path)
    dec_path = Path(dec_path)

    if not enc_path.exists():
        raise FileNotFoundError(
            f'Provided MOGG file path "{str(enc_path)}" does not exists.'
        )
        
    if not enc_path.is_file():
        raise TypeError(
            f'Provided path "{str(enc_path)}" is not a valid file path.'
        )

    enc_in = open(enc_path, "rb")
    dec_out = open(dec_path, "wb")

    decrypt_mogg(True, False, enc_in, dec_out)

    return dec_path


if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description="RBTools: MOGG Decryptor",
        epilog="By Ruggery Iury Corrêa, using LocalH's moggulator library.\nhttps://github.com/LocalH/moggulator/tree/master",
    )
    parser.add_argument("enc_path", help="The encrypted MOGG file path.", type=str)
    parser.add_argument("dec_path", help="The decrypted MOGG file path.", type=str)

    arg = parser.parse_args()

    mogg_decrypt(arg.enc_path, arg.dec_path)
