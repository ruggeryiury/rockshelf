#!/usr/bin/env python3
import argparse, json
from mido import MidiFile
from os import PathLike
from typing import TypedDict, Union, List


class MidiFileStat(TypedDict):
    chartset: str
    midiType: int
    ticksPerBeat: int
    tracksCount: int
    tracksName: List[str]


def midi_file_stat(midi_file_path: Union[str, PathLike[str]]) -> MidiFileStat:
    """
    Returns a dict with stats of a MIDI file.

    Args:
        midi_file_path (Union[str, PathLike[str]]): The path to the MIDI file to read.

    Returns:
        MidiFileStat: A dict with stats of the MIDI file.
    """
    try:
        tracks_name: List[str] = []
        midi = MidiFile(midi_file_path)
        for track in midi.tracks[1:]:
            tracks_name.append(track.name)
        return {
            "charset": midi.charset,
            "midiType": midi.type,
            "ticksPerBeat": midi.ticks_per_beat,
            "tracksCount": len(tracks_name),
            "tracksName": tracks_name,
        }

    except Exception as e:
        raise e


if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description="RBTools: MOGG File Stat", epilog="By Ruggery Iury Corrêa."
    )
    parser.add_argument("midi_file_path", help="The path to the MOGG file", type=str)
    parser.add_argument(
        "-p",
        "--print-results",
        help="Prints the results to stdout",
        action=argparse.BooleanOptionalAction,
        default=False,
    )

    arg = parser.parse_args()

    status = midi_file_stat(arg.midi_file_path)
    if arg.print_results:
        print(json.dumps(status, ensure_ascii=False))
