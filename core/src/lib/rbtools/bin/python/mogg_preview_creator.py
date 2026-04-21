#!/usr/bin/env python3
# -*- coding: utf-8; tab-width: 4; indent-tabs-mode: nil; py-indent-offset: 4 -*-
import argparse, json, base64
from pydub import AudioSegment
from typing import List
from mogg_track_extractor import AudioFileTracksStructureDocument, mogg_track_extractor


def mogg_preview_creator(
    oggtracks: List[AudioSegment],
    tracks: AudioFileTracksStructureDocument,
    preview_start: int,
    preview_duration=30000,
    fade_duration=3000,
) -> AudioSegment:
    """
    Args:
        oggtracks (List[AudioSegment]): A list of splitted tracks from an MOGG file.
        tracks (AudioFileTracksStructureDocument): A dict with values related to the track structure of the MOGG file.
        preview_start (int): The starting point of the preview in milliseconds. Default is `0`.
        preview_duration (int): The duration of the preview in milliseconds.
        fade_duration (int): The duration of the fade-in and fade-out of the preview.

    Returns:
        AudioSegment: An `AudioSegment` of the generated preview.
    """
    duration = round(oggtracks[0].duration_seconds * 1000)
    frame_rate = oggtracks[0].frame_rate

    preview = (
        AudioSegment.silent(duration, frame_rate).set_channels(2).set_sample_width(2)
    )

    for i in range(len(oggtracks)):
        vol = tracks["defaultVols"][i]
        preview = preview.overlay(oggtracks[i] + vol)
        i += 1

    preview = (
        preview[preview_start : preview_start + preview_duration]
        .fade_in(fade_duration)
        .fade_out(fade_duration)
    )

    return preview


if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description="RBTools: MOGG Preview Creator", epilog="By Ruggery Iury Corrêa."
    )
    parser.add_argument("mogg_file_path", help="The path to the MOGG file", type=str)
    parser.add_argument(
        "-t",
        "--tracks",
        help="A dict with the audio track data of the MOGG file encoded as Base64",
        type=str,
        required=True,
    )
    parser.add_argument(
        "-ps",
        "--preview-start",
        help="The start of the preview in milliseconds",
        type=int,
        required=True,
    )
    parser.add_argument(
        "-pd",
        "--preview-duration",
        help="The duration of the preview in milliseconds",
        type=int,
        default=30000,
        required=False,
    )
    parser.add_argument(
        "-fd",
        "--fade-duration",
        help="The duration of the fade-in and fade-out in milliseconds",
        type=int,
        default=3000,
        required=False,
    )
    parser.add_argument(
        "-f",
        "--format",
        help="The audio format of the preview",
        type=str,
        choices=["wav", "flac", "ogg", "mp3"],
        required=False,
        default="wav",
    )
    parser.add_argument(
        "-c",
        "--crowd",
        help="Mix the crowd track into the preview",
        action=argparse.BooleanOptionalAction,
        default=False,
    )
    parser.add_argument(
        "-o",
        "--output",
        help="The output folder where the tracks will be extracted",
        type=str,
        required=True,
    )

    arg = parser.parse_args()

    tracks: AudioFileTracksStructureDocument = json.loads(base64.b64decode(arg.tracks))
    oggtracks = mogg_track_extractor(arg.mogg_file_path, tracks, arg.crowd)
    preview = mogg_preview_creator(
        oggtracks, tracks, arg.preview_start, arg.preview_duration, arg.fade_duration
    )
    preview.export(arg.output, format=arg.format)
