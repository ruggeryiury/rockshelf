import argparse
import json
from os import PathLike
from typing import TypedDict, Union
from mido import MidiFile


class DrumsStat(TypedDict):
    enabled: bool
    hasSolo: bool
    mixEvent: str
    channels: int


class InstrumentStat(TypedDict):
    enabled: bool
    hasSolo: bool
    hasPRO: bool


class VocalsStat(TypedDict):
    enabled: bool
    hasSolo: bool
    vocalParts: int


class SongChartStat(TypedDict):
    chartset: str
    midiType: int
    ticksPerBeat: int
    tracksCount: int
    tracks: list[str]
    drums: DrumsStat
    bass: InstrumentStat
    guitar: InstrumentStat
    vocals: VocalsStat
    keys: InstrumentStat


def song_chart_stat(midi_file_path: Union[str, PathLike[str]]) -> SongChartStat:
    mid = MidiFile(midi_file_path)

    values: SongChartStat = {
        "charset": mid.charset,
        "midiType": mid.type,
        "ticksPerBeat": mid.ticks_per_beat,
        "tracksCount": 0,
        "tracks": [],
        "drums": {
            "enabled": False,
            "hasSolo": False,
            "mixEvent": '',
            "channels": 0
        },
        "bass": {
            "enabled": False,
            "hasSolo": False,
            "hasPRO": False
        },
        "guitar": {
            "enabled": False,
            "hasSolo": False,
            "hasPRO": False
        },
        "vocals": {
            "enabled": False,
            "hasSolo": False,
            "vocalParts": 0,
        },
        "keys": {
            "enabled": False,
            "hasSolo": False,
            "hasPRO": False
        }
    }

    for i, track in enumerate(mid.tracks):
        if track.name != "TEMPO TRACK":
            values["tracks"].append(track.name)

        if track.name == "PART DRUMS":
            values["drums"]["enabled"] = True

            for msg in track:
                if msg.type == 'text':
                    text: str = msg.text
                    if text.startswith('[mix 3'):
                        mix_event = text[len('[mix 3 '):len('[mix 3 ') + 6]
                        channels = 0
                        values['drums']['mixEvent'] = mix_event
                        if mix_event == 'drums0':
                            channels = 2
                        elif mix_event == 'drums1':
                            channels = 4
                        elif mix_event == 'drums2':
                            channels = 5
                        elif mix_event == 'drums3':
                            channels = 6
                        elif mix_event == 'drums4':
                            channels = 3
                        else:
                            raise SyntaxError(
                                f"Unsupported drum mix event {mix_event}")

                        values["drums"]['channels'] = channels

                elif msg.type == 'note_on' and msg.velocity > 0 and msg.note == 103:
                    values['drums']['hasSolo'] = True

        elif track.name == "PART BASS":
            values["bass"]["enabled"] = True

            for msg in track:
                if msg.type == 'note_on' and msg.velocity > 0 and msg.note == 103:
                    values['bass']['hasSolo'] = True

        elif track.name == "PART GUITAR":
            values["guitar"]["enabled"] = True

            for msg in track:
                if msg.type == 'note_on' and msg.velocity > 0 and msg.note == 103:
                    values['guitar']['hasSolo'] = True

        elif track.name == "PART KEYS":
            values["keys"]["enabled"] = True

            for msg in track:
                if msg.type == 'note_on' and msg.velocity > 0 and msg.note == 103:
                    values['keys']['hasSolo'] = True

        elif track.name == "PART VOCALS":
            values["vocals"]["enabled"] = True
            if values['vocals']['vocalParts'] < 1:
                values["vocals"]["vocalParts"] = 1

            # One displayed percussion note might set the vocal solo flag true.
            for msg in track:
                if msg.type == 'note_on' and msg.velocity > 0 and msg.note == 96:
                    values['vocals']['hasSolo'] = True

        elif track.name == "HARM2" and values['vocals']['vocalParts'] < 2:
            values["vocals"]["vocalParts"] = 2

        elif track.name == "HARM3" and values['vocals']['vocalParts'] < 3:
            values["vocals"]["vocalParts"] = 3

        elif track.name == "PART REAL_GUITAR":
            values["guitar"]["hasPRO"] = True

        elif track.name == "PART REAL_BASS":
            values["bass"]["hasPRO"] = True

        elif track.name == "PART REAL_KEYS_X":
            values["keys"]["hasPRO"] = True

    values['tracks'] = list(filter(lambda x: (x == "PART DRUMS") | (x == 'PART BASS') | (x == 'PART GUITAR') | (x == 'PART VOCALS') | (x == 'PART KEYS') | (x == 'PART REAL_BASS') | (x == 'PART REAL_BASS_22') | (x == 'PART REAL_GUITAR') | (x == 'PART REAL_GUITAR_22') | (x == 'HARM1') | (
        x == 'HARM2') | (x == 'HARM3') | (x == 'PART REAL_KEYS_X') | (x == 'PART REAL_KEYS_H') | (x == 'PART REAL_KEYS_M') | (x == 'PART REAL_KEYS_E') | (x == 'PART KEYS_ANIM_LH') | (x == 'PART KEYS_ANIM_RH') | (x == 'EVENTS') | (x == 'VENUE') | (x == 'BEAT'), values['tracks']))

    values['tracksCount'] = len(values["tracks"])

    return values


if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description="RBTools: Song Chart Stat", epilog="By Ruggery Iury Corrêa."
    )
    parser.add_argument(
        "midi_file_path", help="The path to the MIDI file", type=str)
    parser.add_argument(
        "-p",
        "--print-results",
        help="Prints the results to stdout",
        action=argparse.BooleanOptionalAction,
        default=False,
    )

    arg = parser.parse_args()

    status = song_chart_stat(arg.midi_file_path)
    if arg.print_results:
        print(json.dumps(status, ensure_ascii=False))
