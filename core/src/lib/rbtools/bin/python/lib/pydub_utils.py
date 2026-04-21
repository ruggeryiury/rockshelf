#!/usr/bin/env python3
from pydub import AudioSegment
from typing import List


def ogg_channel_order_fixer(audio_channels: List[AudioSegment]) -> List[AudioSegment]:
    """
    Fixes OGG file channels order.

    Due to surrond files processing, some OGG files may import and export OGG files with incorrect channels order. Only multitrack OGG files with 3, 5, 6, 7, or 8 channels are affected by this.

    Args:
        audio_channels (List[AudioSegment]): A list with splitted AudioSeguments from an OGG file.

    Returns:
        List[AudioSegment]: A list with splitted AudioSegments with the correct order.
    """
    channels_count = len(audio_channels)

    if channels_count == 3:
        return AudioSegment.from_mono_audiosegments(
            *[audio_channels[0], audio_channels[2], audio_channels[1]]
        ).split_to_mono()

    elif channels_count == 5:
        return AudioSegment.from_mono_audiosegments(
            *[
                audio_channels[0],
                audio_channels[2],
                audio_channels[1],
                audio_channels[3],
                audio_channels[4],
            ]
        ).split_to_mono()

    elif channels_count == 6:
        return AudioSegment.from_mono_audiosegments(
            *[
                audio_channels[0],
                audio_channels[2],
                audio_channels[1],
                audio_channels[4],
                audio_channels[5],
                audio_channels[3],
            ]
        ).split_to_mono()

    elif channels_count == 7:
        return AudioSegment.from_mono_audiosegments(
            *[
                audio_channels[0],
                audio_channels[2],
                audio_channels[1],
                audio_channels[6],
                audio_channels[5],
                audio_channels[3],
                audio_channels[4],
            ]
        ).split_to_mono()

    elif channels_count == 8:
        return AudioSegment.from_mono_audiosegments(
            *[
                audio_channels[0],
                audio_channels[2],
                audio_channels[1],
                audio_channels[7],
                audio_channels[5],
                audio_channels[6],
                audio_channels[3],
                audio_channels[4],
            ]
        ).split_to_mono()
    else:
        return audio_channels


def mogg_import_channel_order_fixer(
    audio_channels: List[AudioSegment],
) -> List[AudioSegment]:
    """
    Fixes MOGG file channels order when importing to pydub.

    Due to surrond files processing, some OGG files may import and export OGG files with incorrect channels order. Only multitrack OGG files with 3, 5, 6, 7, or 8 channels are affected by this.

    Args:
        audio_channels (List[AudioSegment]): A list with splitted AudioSeguments from a MOGG file.

    Returns:
        List[AudioSegment]: A list with splitted AudioSegments with the correct order.
    """
    channels_count = len(audio_channels)

    if channels_count == 3:
        return AudioSegment.from_mono_audiosegments(
            *[audio_channels[0], audio_channels[2], audio_channels[1]]
        ).split_to_mono()

    elif channels_count == 5:
        return AudioSegment.from_mono_audiosegments(
            *[
                audio_channels[0],
                audio_channels[2],
                audio_channels[1],
                audio_channels[3],
                audio_channels[4],
            ]
        ).split_to_mono()

    elif channels_count == 6:
        return AudioSegment.from_mono_audiosegments(
            *[
                audio_channels[0],
                audio_channels[2],
                audio_channels[1],
                audio_channels[5],
                audio_channels[3],
                audio_channels[4],
            ]
        ).split_to_mono()

    elif channels_count == 7:
        return AudioSegment.from_mono_audiosegments(
            *[
                audio_channels[0],
                audio_channels[2],
                audio_channels[1],
                audio_channels[5],
                audio_channels[6],
                audio_channels[4],
                audio_channels[3],
            ]
        ).split_to_mono()

    elif channels_count == 8:
        return AudioSegment.from_mono_audiosegments(
            *[
                audio_channels[0],
                audio_channels[2],
                audio_channels[1],
                audio_channels[6],
                audio_channels[7],
                audio_channels[4],
                audio_channels[5],
                audio_channels[3],
            ]
        ).split_to_mono()
    else:
        return audio_channels
