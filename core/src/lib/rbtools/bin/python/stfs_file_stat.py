#!/usr/bin/env python3
import argparse
import json
import os
import sys
from lib.stfs import STFS
from typing import Literal, TypedDict
import base64
import chardet


class STFSFileStatRequired(TypedDict):
    name: str
    desc: str
    files: list[str]
    fileSize: int
    thumbnail: str
    titleThumbnail: str


class STFSFileStatOptional(TypedDict, total=False):
    dta: str
    upgrades: str


class STFSFileStat(STFSFileStatRequired, STFSFileStatOptional):
    pass


def correct_packed_dta_encoding(dta_file_bytes: bytes) -> str:
    all_songs: list[bytes] = []
    song_bytes = b''
    parenthesis_iteration = -1
    is_symbol_or_string: False | Literal["single"] | Literal["double"] | Literal["comment"] = False
    for byte in dta_file_bytes:
        char = chr(byte)
        song_bytes += bytes([byte])
        if is_symbol_or_string == "single" or is_symbol_or_string == "double" or is_symbol_or_string == "comment":
            if is_symbol_or_string == "single" and char == "'":
                is_symbol_or_string = False
                continue
            elif is_symbol_or_string == "double" and char == '"':
                is_symbol_or_string = False
                continue
            elif is_symbol_or_string == "comment" and byte == 0x0a:
                is_symbol_or_string = False
                continue
            else:
                continue
        if char == '"':
            is_symbol_or_string = "double"
            continue
        elif char == "'":
            is_symbol_or_string = "single"
            continue
        elif char == ";":
            is_symbol_or_string = 'comment'
            continue
        if char == "(" and parenthesis_iteration == -1:
            parenthesis_iteration = 0
            continue
        elif char == "(" and parenthesis_iteration > -1:
            parenthesis_iteration += 1
            continue
        elif char == ")" and parenthesis_iteration == 0:
            all_songs.append(song_bytes)
            song_bytes = b''
            parenthesis_iteration = -1
            continue
        elif char == ")" and parenthesis_iteration > 0:
            parenthesis_iteration -= 1
            continue
        else:
            continue

    new_dta_bytes = ""

    for song_bytes_obj in all_songs:
        song_encoding = "utf-8"
        detected_encoding = chardet.detect(song_bytes_obj)["encoding"]
        if detected_encoding.startswith('cp') or detected_encoding == "cp1250":
            song_encoding = "latin-1"
        else:
            song_encoding = detected_encoding

        new_dta_bytes += song_bytes_obj.decode(song_encoding)

    replacements = {
        "’": "'",
        "‘": "'",
        "“": '"',
        "”": '"',
    }

    for k, v in replacements.items():
        new_dta_bytes = new_dta_bytes.replace(k, v)

    return new_dta_bytes


def stfs_file_stat(file_path: str) -> STFSFileStat:
    con = STFS(file_path)
    status: STFSFileStat = {
        "name": str(con.display_name_blob.decode("utf-16be")).replace("\x00", ""),
        "desc": str(con.display_description_blob.decode("utf-16be")).replace(
            "\x00", ""
        ),
        "files": [],
        "dta": "",
        "fileSize": os.path.getsize(file_path),
        "thumbnail": f"data:image/png;base64,{base64.standard_b64encode(con.thumbnail).decode()}",
        "titleThumbnail": f"data:image/png;base64,{base64.standard_b64encode(con.titleimage).decode()}",
        "contentsHash": con.content_id.hex(),
    }

    all_files = con.allfiles.keys()

    for file in all_files:
        if file == "/songs/":
            pass
        else:
            status["files"].append(file)

    dta_file = None
    upg_file = None

    try:
        dta_file = con.allfiles["/songs/songs.dta"]
    except KeyError:
        pass

    try:
        upg_file = con.allfiles["/songs_upgrades/upgrades.dta"]
    except KeyError:
        pass

    try:
        dta_file_contents_decoded = correct_packed_dta_encoding(
            con.read_file(dta_file))
        status["dta"] = dta_file_contents_decoded
    except AttributeError:
        pass

    try:
        upg_file_contents_decoded = correct_packed_dta_encoding(
            con.read_file(upg_file))
        status["upgrades"] = upg_file_contents_decoded
    except AttributeError:
        pass

    return status


if __name__ == "__main__":
    sys.stdout.reconfigure(encoding='utf-8')
    parser = argparse.ArgumentParser(
        description="RBTools: Xbox 360 STFS File Stat",
        epilog="By Ruggery Iury Corrêa, using valmyzk's fork of arkem's py360 library.\nvalmyzk fork: https://github.com/valmyzk/py360\narkem's original package: https://github.com/arkem/py360",
    )
    parser.add_argument(
        "stfs_file_path", help="The STFS file you want to print its contents", type=str
    )
    parser.add_argument(
        "-p",
        "--print-results",
        help="Prints the results to stdout",
        action=argparse.BooleanOptionalAction,
        default=False,
    )
    parser.add_argument(
        "-s",
        "--save-path",
        help="Save the results from stdout to a file",
        type=str
    )

    arg = parser.parse_args()

    status = stfs_file_stat(arg.stfs_file_path)
    if arg.save_path:
        with open(arg.save_path, "w", encoding="utf-8") as f:
            f.write(json.dumps(status))

    if arg.print_results:
        print(json.dumps(status, ensure_ascii=False))
