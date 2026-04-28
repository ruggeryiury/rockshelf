import argparse
import json
import base64
from pathlib import Path
from mogg_track_extractor import AudioFileTracksStructureDocument, mogg_track_extractor

if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description="RBTools: MOGG Song Audio Extractor for Single Track Song", epilog="By Ruggery Iury Corrêa."
    )
    parser.add_argument(
        "mogg_file_path", help="The path to the MOGG file", type=str)
    parser.add_argument(
        "dest_path", help="The path to the extract song audio file", type=str)
    parser.add_argument(
        "-t",
        "--tracks",
        help="A parsed song object encoded as Base64",
        type=str,
        required=True,
    )

    arg = parser.parse_args()

    tracks: AudioFileTracksStructureDocument = json.loads(
        base64.b64decode(arg.tracks))

    output = Path(arg.dest_path).with_suffix('.wav')

    audios = mogg_track_extractor(arg.mogg_file_path, tracks, False)
    backing_channel_begin_index = 0
    backing_channels = tracks["backing"]['channels']

    if tracks["drum"]["enabled"]:
        drum_channels = tracks["drum"]["channels"]
        if drum_channels == 2:
            backing_channel_begin_index += 1
        elif drum_channels == 3:
            backing_channel_begin_index += 2
        elif drum_channels == 4 or drum_channels == 5 or drum_channels == 6:
            backing_channel_begin_index += 3

    if tracks["bass"]['enabled']:
        backing_channel_begin_index += 1

    if tracks["guitar"]['enabled']:
        backing_channel_begin_index += 1

    if tracks["vocals"]['enabled']:
        backing_channel_begin_index += 1

    if tracks["keys"]['enabled']:
        backing_channel_begin_index += 1

    backing_enabled = tracks["backing"]["enabled"]
    if backing_enabled:
        audios[backing_channel_begin_index].export(output, format="wav")
