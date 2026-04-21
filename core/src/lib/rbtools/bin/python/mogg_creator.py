#!/usr/bin/env python3
import argparse, subprocess
from os import PathLike
from pydub import AudioSegment
from pathlib import Path
from typing import List, Union
from lib.pydub_utils import ogg_channel_order_fixer


def mogg_creator(
    input_audio_files: List[Union[str, PathLike[str]]],
    destination_path: Union[str, PathLike[str]],
    encrypt=False,
) -> Path:
    """
    Creates a MOGG file from a bunch of audio files.

    Args:
        input_audio_files (List[Union[str, PathLike[str]]]): A list with audio file paths to be added to the MOGG file.
        destination_path (Union[str, PathLike[str]]): The path where the created MOGG file will be written.
        encrypt (bool): Encrypts the created MOGG file using 0B encryption. Default is `False`.

    Returns:
        Path: The path where the created MOGG file will be written.
    """

    destination_path = Path(destination_path).with_suffix(".ogg")
    destination_path_mogg = Path(destination_path).with_suffix(".mogg")

    if destination_path.exists():
        destination_path.unlink()

    if destination_path_mogg.exists():
        destination_path_mogg.unlink()

    audio_channels: List[AudioSegment] = []

    # Load each audio file and separate channels to mono
    for file in input_audio_files:
        try:
            audio = AudioSegment.from_file(file)
            channels = audio.split_to_mono()
            audio_channels.extend(channels)
        except Exception as e:
            raise e

    AudioSegment.from_mono_audiosegments(
        *ogg_channel_order_fixer(audio_channels)
    ).export(destination_path, format="ogg", parameters=["-q", "3"])

    makemogg_exe_path = Path(__file__).resolve().parents[1] / "makemogg.exe"

    encryption_flag = ""
    if encrypt:
        encryption_flag = "-em"
    else:
        encryption_flag = "-m"

    subprocess.run(
        [
            str(makemogg_exe_path),
            str(destination_path),
            encryption_flag,
            str(destination_path_mogg),
        ],
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
        creationflags=subprocess.CREATE_NO_WINDOW,
    )

    if destination_path.exists():
        destination_path.unlink()

    return destination_path_mogg


if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description="RBTools: MOGG Creator", epilog="By Ruggery Iury Corrêa."
    )
    parser.add_argument(
        "input_audio_files",
        nargs="+",
        type=str,
        help="The audio files to be joined into one MOGG file.",
    )
    parser.add_argument(
        "-d",
        "--destination-path",
        default="./output.mogg",
        help="The destination path of the created MOGG file.",
    )
    parser.add_argument(
        "-e",
        "--encrypt",
        help="Encrypts the MOGG file using 0B encryption. The encryption works on all systems.",
        action=argparse.BooleanOptionalAction,
        default=False,
    )

    args = parser.parse_args()

    mogg_creator(args.input_audio_files, args.destination_path, args.encrypt)
