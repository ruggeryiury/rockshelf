#!/usr/bin/env python3
import argparse, json
from pathlib import Path
from pydub.utils import mediainfo
from typing import TypedDict, Union
from os import PathLike


class AudioFileStat(TypedDict):
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


def audio_file_stat(audio_file_path: Union[str, PathLike[str]]) -> AudioFileStat:
    """
    Returns a dict with stats of an audio file.

    Args:
        audio_file_path (Union[str, PathLike[str]]): The path to the audio file to read.

    Returns:
        AudioFileStat: A dict with stats of an audio file.
    """

    audio_file_path = Path(audio_file_path)

    if not audio_file_path.exists():
        raise FileNotFoundError(
            f'Provided audio file path "{str(audio_file_path)}" does not exists.'
        )

    if not audio_file_path.is_file():
        raise TypeError(
            f'Provided path "{str(audio_file_path)}" is not a valid file path.'
        )

    try:
        audio = mediainfo(audio_file_path)
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
        }
    except Exception as e:
        raise e


if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description="RBTools: Audio File Stat", epilog="By Ruggery Iury Corrêa."
    )
    parser.add_argument("audio_file_path", help="The path to the audio file", type=str)
    parser.add_argument(
        "-p",
        "--print-results",
        help="Print the results to stdout",
        action=argparse.BooleanOptionalAction,
        default=False,
    )

    arg = parser.parse_args()

    status = audio_file_stat(arg.audio_file_path)
    if arg.print_results:
        print(json.dumps(status, ensure_ascii=False))
