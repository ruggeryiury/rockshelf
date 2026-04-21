#!/usr/bin/env python3
import argparse, base64, json
from pydub import AudioSegment
from io import BytesIO
from typing import TypedDict, Optional, List, Literal
from pathlib import Path
from lib.mogg import decrypt_mogg_bytes
from lib.pydub_utils import mogg_import_channel_order_fixer


class DrumsTracksStructure(TypedDict):
    enabled: bool
    channels: int
    drum_layout: Literal[
        "drum_layout_kit", "drum_layout_kit_kick", "drum_layout_kit_kick_snare"
    ]
    array: Optional[List[int]]
    pan: List[int]
    vol: List[int]
    hasSepDrums: bool
    hasSolo: bool
    kickEnabled: bool
    kickChannels: int
    kickPan: List[int]
    kickVol: List[int]
    snareEnabled: bool
    snareChannels: int
    snarePan: List[int]
    snareVol: List[int]
    kitEnabled: bool
    kitChannels: int
    kitPan: List[int]
    kitVol: List[int]


class InstrumentTracksStructure(TypedDict):
    enabled: bool
    channels: int
    array: Optional[List[int]]
    pan: List[int]
    vol: List[int]
    hasSolo: bool


class CrowdTracksStructure(TypedDict):
    enabled: bool
    array: Optional[List[int]]
    vol: Optional[int]


class AudioFileTracksStructureDocument(TypedDict):
    allTracksCount: int
    defaultPans: List[int]
    defaultVols: List[int]
    defaultCores: List[int]
    drum: DrumsTracksStructure
    bass: InstrumentTracksStructure
    guitar: InstrumentTracksStructure
    vocals: InstrumentTracksStructure
    keys: InstrumentTracksStructure
    backing: InstrumentTracksStructure
    crowd: CrowdTracksStructure


def mogg_track_extractor(
    mogg_file_path: str,
    tracks: AudioFileTracksStructureDocument,
    output_crowd: bool = False,
) -> List[AudioSegment]:
    fin = open(mogg_file_path, "rb")
    oggbytes = BytesIO(decrypt_mogg_bytes(True, False, fin.read()))
    fin.close()

    oggtracks = mogg_import_channel_order_fixer(
        AudioSegment.from_ogg(oggbytes).split_to_mono()
    )

    duration = round(oggtracks[0].duration_seconds * 1000)
    frame_rate = oggtracks[0].frame_rate

    assert (
        len(oggtracks) == tracks["allTracksCount"]
    ), "Provided MOGG file channels count is different than the provided audio channel structure count."

    i = 0
    drum_enabled = tracks["drum"]["enabled"]
    bass_enabled = tracks["bass"]["enabled"]
    guitar_enabled = tracks["guitar"]["enabled"]
    vocals_enabled = tracks["vocals"]["enabled"]
    keys_enabled = tracks["keys"]["enabled"]
    backing_enabled = tracks["backing"]["enabled"]
    crowd_enabled = tracks["crowd"]["enabled"]
    exports: List[AudioSegment] = []

    if drum_enabled:
        drum_channels = tracks["drum"]["channels"]
        if drum_channels == 2:
            drums_left = (
                oggtracks[i]
                .append(AudioSegment.silent(duration, frame_rate=frame_rate))
                .pan(tracks["drum"]["pan"][0])
            )
            drums_right = (
                oggtracks[i + 1]
                .append(AudioSegment.silent(duration, frame_rate=frame_rate))
                .pan(tracks["drum"]["pan"][1])
            )
            drums_audio = (
                AudioSegment.silent(duration, frame_rate=frame_rate)
                .set_channels(2)
                .set_sample_width(2)
                .overlay(drums_left)
                .overlay(drums_right)
            )
            exports.append(drums_audio)
            i += 2
        elif drum_channels == 3:
            kick_audio = (
                AudioSegment.silent(duration, frame_rate=frame_rate)
                .set_channels(1)
                .set_sample_width(2)
                .overlay(oggtracks[i])
            )
            exports.append(kick_audio)
            kit_left = (
                oggtracks[i]
                .append(AudioSegment.silent(duration, frame_rate=frame_rate))
                .pan(tracks["drum"]["pan"][1])
            )
            kit_right = (
                oggtracks[i + 1]
                .append(AudioSegment.silent(duration, frame_rate=frame_rate))
                .pan(tracks["drum"]["pan"][2])
            )
            kit_audio = (
                AudioSegment.silent(duration, frame_rate=frame_rate)
                .set_channels(2)
                .set_sample_width(2)
                .overlay(kit_left)
                .overlay(kit_right)
            )
            exports.append(kit_audio)
            i += 3
        elif drum_channels == 4:
            kick_audio = (
                AudioSegment.silent(duration, frame_rate=frame_rate)
                .set_channels(1)
                .set_sample_width(2)
                .overlay(oggtracks[i])
            )
            exports.append(kick_audio)

            snare_audio = (
                AudioSegment.silent(duration, frame_rate=frame_rate)
                .set_channels(1)
                .set_sample_width(2)
                .overlay(oggtracks[i + 1])
            )
            exports.append(snare_audio)

            kit_left = (
                oggtracks[i + 2]
                .append(AudioSegment.silent(duration, frame_rate=frame_rate))
                .pan(tracks["drum"]["pan"][2])
            )
            kit_right = (
                oggtracks[i + 3]
                .append(AudioSegment.silent(duration, frame_rate=frame_rate))
                .pan(tracks["drum"]["pan"][3])
            )
            kit_audio = (
                AudioSegment.silent(duration, frame_rate=frame_rate)
                .set_channels(2)
                .set_sample_width(2)
                .overlay(kit_left)
                .overlay(kit_right)
            )
            exports.append(kit_audio)
            i += 4
        elif drum_channels == 5:
            kick_audio = (
                AudioSegment.silent(duration, frame_rate=frame_rate)
                .set_channels(1)
                .set_sample_width(2)
                .overlay(oggtracks[i])
            )
            exports.append(kick_audio)

            snare_left = (
                oggtracks[i + 1]
                .append(AudioSegment.silent(duration, frame_rate=frame_rate))
                .pan(tracks["drum"]["pan"][1])
            )
            snare_right = (
                oggtracks[i + 2]
                .append(AudioSegment.silent(duration, frame_rate=frame_rate))
                .pan(tracks["drum"]["pan"][2])
            )
            snare_audio = (
                AudioSegment.silent(duration, frame_rate=frame_rate)
                .set_channels(2)
                .set_sample_width(2)
                .overlay(snare_left)
                .overlay(snare_right)
            )
            exports.append(snare_audio)

            kit_left = (
                oggtracks[i + 3]
                .append(AudioSegment.silent(duration, frame_rate=frame_rate))
                .pan(tracks["drum"]["pan"][3])
            )
            kit_right = (
                oggtracks[i + 4]
                .append(AudioSegment.silent(duration, frame_rate=frame_rate))
                .pan(tracks["drum"]["pan"][4])
            )
            kit_audio = (
                AudioSegment.silent(duration, frame_rate=frame_rate)
                .set_channels(2)
                .set_sample_width(2)
                .overlay(kit_left)
                .overlay(kit_right)
            )
            exports.append(kit_audio)
            i += 5
        elif drum_channels == 6:
            kick_left = (
                oggtracks[i]
                .append(AudioSegment.silent(duration, frame_rate=frame_rate))
                .pan(tracks["drum"]["pan"][0])
            )
            kick_right = (
                oggtracks[i + 1]
                .append(AudioSegment.silent(duration, frame_rate=frame_rate))
                .pan(tracks["drum"]["pan"][1])
            )
            kick_audio = (
                AudioSegment.silent(duration, frame_rate=frame_rate)
                .set_channels(2)
                .set_sample_width(2)
                .overlay(kick_left)
                .overlay(kick_right)
            )
            exports.append(kick_audio)

            snare_left = (
                oggtracks[i + 2]
                .append(AudioSegment.silent(duration, frame_rate=frame_rate))
                .pan(tracks["drum"]["pan"][2])
            )
            snare_right = (
                oggtracks[i + 3]
                .append(AudioSegment.silent(duration, frame_rate=frame_rate))
                .pan(tracks["drum"]["pan"][3])
            )
            snare_audio = (
                AudioSegment.silent(duration, frame_rate=frame_rate)
                .set_channels(2)
                .set_sample_width(2)
                .overlay(snare_left)
                .overlay(snare_right)
            )
            exports.append(snare_audio)

            kit_left = (
                oggtracks[i + 4]
                .append(AudioSegment.silent(duration, frame_rate=frame_rate))
                .pan(tracks["drum"]["pan"][4])
            )
            kit_right = (
                oggtracks[i + 5]
                .append(AudioSegment.silent(duration, frame_rate=frame_rate))
                .pan(tracks["drum"]["pan"][5])
            )
            kit_audio = (
                AudioSegment.silent(duration, frame_rate=frame_rate)
                .set_channels(2)
                .set_sample_width(2)
                .overlay(kit_left)
                .overlay(kit_right)
            )
            exports.append(kit_audio)
            i += 6

    if bass_enabled:
        bass_channels = tracks["bass"]["channels"]
        if bass_channels == 1:
            bass_audio = (
                AudioSegment.silent(duration, frame_rate=frame_rate)
                .set_channels(1)
                .set_sample_width(2)
                .overlay(oggtracks[i])
            )
            exports.append(bass_audio)
            i += 1
        elif bass_channels == 2:
            bass_left = (
                oggtracks[i]
                .append(AudioSegment.silent(duration, frame_rate=frame_rate))
                .pan(tracks["bass"]["pan"][0])
            )
            bass_right = (
                oggtracks[i + 1]
                .append(AudioSegment.silent(duration, frame_rate=frame_rate))
                .pan(tracks["bass"]["pan"][1])
            )
            bass_audio = (
                AudioSegment.silent(duration, frame_rate=frame_rate)
                .set_channels(2)
                .set_sample_width(2)
                .overlay(bass_left)
                .overlay(bass_right)
            )
            exports.append(bass_audio)
            i += 2

    if guitar_enabled:
        guitar_channels = tracks["guitar"]["channels"]
        if guitar_channels == 1:
            guitar_audio = (
                AudioSegment.silent(duration, frame_rate=frame_rate)
                .set_channels(1)
                .set_sample_width(2)
                .overlay(oggtracks[i])
            )
            exports.append(guitar_audio)
            i += 1
        elif guitar_channels == 2:
            guitar_left = (
                oggtracks[i]
                .append(AudioSegment.silent(duration, frame_rate=frame_rate))
                .pan(tracks["guitar"]["pan"][0])
            )
            guitar_right = (
                oggtracks[i + 1]
                .append(AudioSegment.silent(duration, frame_rate=frame_rate))
                .pan(tracks["guitar"]["pan"][1])
            )
            guitar_audio = (
                AudioSegment.silent(duration, frame_rate=frame_rate)
                .set_channels(2)
                .set_sample_width(2)
                .overlay(guitar_left)
                .overlay(guitar_right)
            )
            exports.append(guitar_audio)
            i += 2

    if vocals_enabled:
        vocals_channels = tracks["vocals"]["channels"]
        if vocals_channels == 1:
            vocals_audio = (
                AudioSegment.silent(duration, frame_rate=frame_rate)
                .set_channels(1)
                .set_sample_width(2)
                .overlay(oggtracks[i])
            )
            exports.append(vocals_audio)
            i += 1
        elif vocals_channels == 2:
            vocals_left = (
                oggtracks[i]
                .append(AudioSegment.silent(duration, frame_rate=frame_rate))
                .pan(tracks["vocals"]["pan"][0])
            )
            vocals_right = (
                oggtracks[i + 1]
                .append(AudioSegment.silent(duration, frame_rate=frame_rate))
                .pan(tracks["vocals"]["pan"][1])
            )
            vocals_audio = (
                AudioSegment.silent(duration, frame_rate=frame_rate)
                .set_channels(2)
                .set_sample_width(2)
                .overlay(vocals_left)
                .overlay(vocals_right)
            )
            exports.append(vocals_audio)
            i += 2

    if keys_enabled:
        keys_channels = tracks["keys"]["channels"]
        if keys_channels == 1:
            keys_audio = (
                AudioSegment.silent(duration, frame_rate=frame_rate)
                .set_channels(1)
                .set_sample_width(2)
                .overlay(oggtracks[i])
            )
            exports.append(keys_audio)
            i += 1
        elif keys_channels == 2:
            keys_left = (
                oggtracks[i]
                .append(AudioSegment.silent(duration, frame_rate=frame_rate))
                .pan(tracks["keys"]["pan"][0])
            )
            keys_right = (
                oggtracks[i + 1]
                .append(AudioSegment.silent(duration, frame_rate=frame_rate))
                .pan(tracks["keys"]["pan"][1])
            )
            keys_audio = (
                AudioSegment.silent(duration, frame_rate=frame_rate)
                .set_channels(2)
                .set_sample_width(2)
                .overlay(keys_left)
                .overlay(keys_right)
            )
            exports.append(keys_audio)
            i += 2

    if backing_enabled:
        backing_channels = tracks["backing"]["channels"]
        if backing_channels == 1:
            backing_audio = (
                AudioSegment.silent(duration, frame_rate=frame_rate)
                .set_channels(1)
                .set_sample_width(2)
                .overlay(oggtracks[i])
            )
            exports.append(backing_audio)
            i += 1
        elif backing_channels == 2:
            backing_left = (
                oggtracks[i]
                .append(AudioSegment.silent(duration, frame_rate=frame_rate))
                .pan(tracks["backing"]["pan"][0])
            )
            backing_right = (
                oggtracks[i + 1]
                .append(AudioSegment.silent(duration, frame_rate=frame_rate))
                .pan(tracks["backing"]["pan"][1])
            )
            backing_audio = (
                AudioSegment.silent(duration, frame_rate=frame_rate)
                .set_channels(2)
                .set_sample_width(2)
                .overlay(backing_left)
                .overlay(backing_right)
            )
            exports.append(backing_audio)
            i += 2

    if crowd_enabled:
        crowd_left = (
            oggtracks[i]
            .append(AudioSegment.silent(duration, frame_rate=frame_rate))
            .pan(-1)
        )
        crowd_right = (
            oggtracks[i + 1]
            .append(AudioSegment.silent(duration, frame_rate=frame_rate))
            .pan(1)
        )
        crowd_audio = (
            AudioSegment.silent(duration, frame_rate=frame_rate)
            .set_channels(2)
            .set_sample_width(2)
            .overlay(crowd_left)
            .overlay(crowd_right)
        )
        if output_crowd:
            exports.append(crowd_audio)
        i += 2

    return exports


if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description="RBTools: MOGG Track Extractor", epilog="By Ruggery Iury Corrêa."
    )
    parser.add_argument("mogg_file_path", help="The path to the MOGG file", type=str)
    parser.add_argument(
        "-t",
        "--tracks",
        help="A parsed song object encoded as Base64",
        type=str,
        required=True,
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
    
    print(tracks)

    output = Path(arg.output)
    if not output.exists():
        output.mkdir(parents=True)
        
    audios = mogg_track_extractor(arg.mogg_file_path, tracks, True)
    print(tracks)
    
    drums_path = Path(arg.output, "drums.wav")
    kick_path = Path(arg.output, "kick.wav")
    snare_path = Path(arg.output, "snare.wav")
    kit_path = Path(arg.output, "kit.wav")
    bass_path = Path(arg.output, "bass.wav")
    guitar_path = Path(arg.output, "guitar.wav")
    vocals_path = Path(arg.output, "vocals.wav")
    keys_path = Path(arg.output, "keys.wav")
    backing_path = Path(arg.output, "backing.wav")
    crowd_path = Path(arg.output, "crowd.wav")

    i = 0
    drum_enabled = tracks["drum"]["enabled"]
    if drum_enabled:
        drum_channels = tracks["drum"]["channels"]
        if drum_channels == 2:
            audios[i].export(drums_path, format="wav")
            i += 1
        elif drum_channels == 3:
            audios[i].export(kick_path, format="wav")
            audios[i + 1].export(kit_path, format="wav")
            i += 2
        elif drum_channels == 4:
            audios[i].export(kick_path, format="wav")
            audios[i + 1].export(snare_path, format="wav")
            audios[i + 2].export(kit_path, format="wav")
            i += 3
        elif drum_channels == 5:
            audios[i].export(kick_path, format="wav")
            audios[i + 1].export(snare_path, format="wav")
            audios[i + 2].export(kit_path, format="wav")
            i += 3
        elif drum_channels == 6:
            audios[i].export(kick_path, format="wav")
            audios[i + 1].export(snare_path, format="wav")
            audios[i + 2].export(kit_path, format="wav")
            i += 3

    bass_enabled = tracks["bass"]["enabled"]
    if bass_enabled:
        audios[i].export(bass_path, format="wav")
        i += 1

    guitar_enabled = tracks["guitar"]["enabled"]
    if guitar_enabled:
        audios[i].export(guitar_path, format="wav")
        i += 1

    vocals_enabled = tracks["vocals"]["enabled"]
    if vocals_enabled:
        audios[i].export(vocals_path, format="wav")
        i += 1

    keys_enabled = tracks["keys"]["enabled"]
    if keys_enabled:
        audios[i].export(keys_path, format="wav")
        i += 1

    backing_enabled = tracks["backing"]["enabled"]
    if backing_enabled:
        audios[i].export(backing_path, format="wav")
        i += 1

    crowd_enabled = tracks["crowd"]["enabled"]
    if crowd_enabled:
        audios[i].export(crowd_path, format="wav")
