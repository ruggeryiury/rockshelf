#!/usr/bin/env python3
import argparse
import subprocess
from os import PathLike
from pydub import AudioSegment
from pathlib import Path
from typing import List, Union


def multitrack_wav_creator(
    input_audio_files: List[Union[str, PathLike[str]]],
    destination_path: Union[str, PathLike[str]],
) -> Path:
    """
    Creates a multitrack WAV file from a bunch of audio files.

    Args:
        input_audio_files (List[Union[str, PathLike[str]]]): A list with audio file paths to be added to the WAV file.
        destination_path (Union[str, PathLike[str]]): The path where the created MOGG file will be written.

    Returns:
        Path: The path where the created WAV file will be written.
    """

    wav_path = Path(destination_path).with_suffix(".wav")

    if wav_path.exists():
        wav_path.unlink()

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
        *audio_channels).export(wav_path, format="wav")

    return wav_path


if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description="Multitrack WAV Creator", epilog="By Ruggery Iury Corrêa."
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
        required=True,
        help="The destination path of the created MOGG file.",
    )

    args = parser.parse_args()

    multitrack_wav_creator(args.input_audio_files, args.destination_path)
