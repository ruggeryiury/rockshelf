#!/usr/bin/env python3
import argparse
from io import BytesIO
from os import PathLike
from pathlib import Path
from pydub import AudioSegment
from typing import List, Union
from lib.mogg import decrypt_mogg_bytes
from lib.pydub_utils import mogg_import_channel_order_fixer


def mogg_mono_splitter(mogg_file_path: Union[str, PathLike[str]]) -> List[AudioSegment]:
    """
    Split all the channels from a MOGG file into mono `AudioSegments`, fixing the surround channel order behavior when importing OGG files to Pydub.

    Args:
        mogg_file_path (Union[str, PathLike[str]]): The path to the MOGG file to be splitted.

    Returns:
        List[AudioSegment]: A list with mono `AudioSegments` of the MOGG file.
    """
    fin = open(mogg_file_path, "rb")
    oggbytes = BytesIO(decrypt_mogg_bytes(True, False, fin.read()))
    fin.close()

    oggtracks = mogg_import_channel_order_fixer(
        AudioSegment.from_ogg(oggbytes).split_to_mono()
    )
    return oggtracks


if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description="RBTools: MOGG Mono Splitter", epilog="By Ruggery Iury Corrêa."
    )
    parser.add_argument("mogg_file_path", help="The path to the MOGG file", type=str)
    parser.add_argument(
        "-f",
        "--format",
        help="The audio format of the tracks",
        type=str,
        choices=["wav", "flac", "ogg", "mp3"],
        required=False,
        default="wav",
    )
    parser.add_argument(
        "-o",
        "--output",
        help="The output folder where the tracks will be extracted",
        type=str,
        required=True,
    )

    arg = parser.parse_args()

    oggtracks = mogg_mono_splitter(arg.mogg_file_path)

    for i in range(len(oggtracks)):
        output_path_dir = Path(arg.output)
        if output_path_dir.exists() and not output_path_dir.is_dir():
            raise ValueError(
                f'Provided output path "{str(output_path_dir)}" is not a valid directory path'
            )

        output_path = Path(str(output_path_dir), f"{str(i)}.{arg.format}")
        oggtracks[i].export(output_path, format=arg.format)
