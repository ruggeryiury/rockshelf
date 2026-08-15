#!/usr/bin/env python3
import argparse
import json
import struct
import tempfile
from os import PathLike, path
from pathlib import Path
from typing import TypedDict, Union
from pydub.utils import mediainfo
from lib.mogg import decrypt_mogg, mogg_to_ogg


class MOGGStatObject(TypedDict):
    size: int
    version: int
    isEncrypted: bool
    worksInPS3: bool


class MOGGFileStat(TypedDict):
    bitRate: int
    channels: int
    codec: str
    codecDesc: str
    duration: int
    durationSec: float
    ext: str
    extDesc: str
    sampleRate: int
    size: int
    mogg: MOGGStatObject


def mogg_file_stat(mogg_file_path: Union[str, PathLike[str]]) -> MOGGFileStat:
    """
    Returns a dict with stats of a MOGG file.

    Args:
        mogg_file_path (Union[str, PathLike[str]]): The path to the MOGG file to read.

    Returns:
        MOGGFileStat: A dict with stats of the MOGG file.
    """

    temp_dec_mogg = tempfile.NamedTemporaryFile(delete=False, suffix=".mogg")
    ogg_temp = tempfile.NamedTemporaryFile(delete=False, suffix=".ogg")

    fin = open(mogg_file_path, 'rb')
    version_bytes = fin.read(4)
    version = int.from_bytes(version_bytes, 'little')
    fin.seek(0)

    if version != 10:
        decrypt_mogg(False, False, fin, temp_dec_mogg)

    mogg_to_ogg(temp_dec_mogg if version != 10 else fin, ogg_temp)

    try:
        audio = mediainfo(ogg_temp.name)

        return {
            "bitRate": int(audio["bit_rate"]),
            "channels": int(audio["channels"]),
            "codec": audio["codec_name"],
            "codecDesc": audio["codec_long_name"],
            "duration": int(float(audio["duration"]) * 1000),
            "durationSec": float(audio["duration"]),
            "ext": audio["format_name"],
            "extDesc": audio["format_long_name"],
            "sampleRate": int(audio["sample_rate"]),
            "size": int(audio["size"]),
            "mogg": {
                "size": path.getsize(mogg_file_path),
                "version": version,
                "isEncrypted": version != 10,
                "worksInPS3": version == 11,
            },
        }
    except Exception as e:
        raise e
    finally:
        fin.close()
        temp_dec_mogg.close()
        ogg_temp.close()
        Path(temp_dec_mogg.name).unlink(True)
        Path(ogg_temp.name).unlink(True)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description="RBTools: MOGG File Stat", epilog="By Ruggery Iury Corrêa."
    )
    parser.add_argument(
        "mogg_file_path", help="The path to the MOGG file", type=str)
    parser.add_argument(
        "-p",
        "--print-results",
        help="Prints the results to stdout",
        action=argparse.BooleanOptionalAction,
        default=False,
    )

    arg = parser.parse_args()

    status = mogg_file_stat(arg.mogg_file_path)
    if arg.print_results:
        print(json.dumps(status, ensure_ascii=False))
