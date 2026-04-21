#!/usr/bin/env python3
import argparse
import json
import os
from lib.stfs import STFS
from typing import TypedDict
import base64


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


def stfs_file_stat(file_path: str) -> STFSFileStat:
    con = STFS(file_path)
    status = {
        "name": str(con.display_name_blob.decode("utf-16be")).replace("\x00", ""),
        "desc": str(con.display_description_blob.decode("utf-16be")).replace(
            "\x00", ""
        ),
        "files": [],
        "dta": "",
        "fileSize": os.path.getsize(file_path),
        "thumbnail": f"data:image/png;base64,{base64.b64encode(con.thumbnail).decode()}",
        "titleThumbnail": f"data:image/png;base64,{base64.b64encode(con.titleimage).decode()}",
        "contentsHash": con.content_id.hex(),
    }

    all_files = con.allfiles.keys()

    for file in all_files:
        if file == "/songs/":
            pass
        else:
            status["files"].append(file)

    dta_file = None
    dta_file_contents_bytes = None
    upg_file = None
    upg_file_contents_bytes = None

    try:
        dta_file = con.allfiles["/songs/songs.dta"]
    except KeyError:
        pass

    try:
        upg_file = con.allfiles["/songs_upgrades/upgrades.dta"]
    except KeyError:
        pass

    try:
        dta_file_contents_bytes = con.read_file(dta_file)
        status["dta"] = dta_file_contents_bytes.decode("latin-1")
    except AttributeError:
        pass

    try:
        upg_file_contents_bytes = con.read_file(upg_file)
        status["upgrades"] = upg_file_contents_bytes.decode("latin-1")
    except AttributeError:
        pass

    return status


if __name__ == "__main__":
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

    arg = parser.parse_args()

    status = stfs_file_stat(arg.stfs_file_path)
    if arg.print_results:
        print(json.dumps(status, ensure_ascii=False))
