#!/usr/bin/env python3
import argparse
import os
from pathlib import Path
from lib.stfs import STFS
import shutil


def stfs_extract_selected_songs(stfs_file_path: str, dest_path: str, songs: list[str]) -> str:
    dest = Path(dest_path)

    if dest.exists() and dest.is_dir():
        shutil.rmtree(dest)  # Remove entire directory and contents

    # Recreate it empty
    dest.mkdir(parents=True, exist_ok=True)

    con = STFS(stfs_file_path)

    # Create directories
    for filename in con.allfiles:
        if any(song in filename for song in songs) and con.allfiles[filename].isdirectory:
            dirpath = filename[1:]
            dircomponents = dirpath.split("/")
            for i in range(len(dircomponents)):
                dir_path = "/".join(dircomponents[: i + 1])
                new_folder_path = f"{dest}/{dir_path}"
                try:
                    os.mkdir(new_folder_path)
                except OSError:
                    pass

    # Writing files
    for filename in con.allfiles:
        if filename == "/songs/":
            continue
        elif filename == "/songs/songs.dta":
            file_bytes = con.read_file(con.allfiles[filename])
            dta_path = f"{dest}/{filename}"
            open(dta_path, "wb").write(file_bytes)
        if not con.allfiles[filename].isdirectory and any(song in filename for song in songs):
            file_bytes = con.read_file(con.allfiles[filename])
            new_file_path = f"{dest}/{filename}"
            open(new_file_path, "wb").write(file_bytes)


def stfs_extract_selected_songs_on_root(
    stfs_file_path: str, dest_path: str, songs: list[str]
) -> str:
    dest = Path(dest_path)

    if dest.exists() and dest.is_dir():
        shutil.rmtree(dest)  # Remove entire directory and contents

    # Recreate it empty
    dest.mkdir(parents=True, exist_ok=True)

    con = STFS(stfs_file_path)

    # Writing files
    for filename in con.allfiles:
        if filename == "/songs/":
            continue
        elif filename == "/songs/songs.dta":
            file_bytes = con.read_file(con.allfiles[filename])
            dta_path = f"{dest}/{Path(filename).name}"
            open(dta_path, "wb").write(file_bytes)
        if not con.allfiles[filename].isdirectory and any(song in filename for song in songs):
            file_bytes = con.read_file(con.allfiles[filename])
            new_file_path = f"{dest}/{Path(filename).name}"
            open(new_file_path, "wb").write(file_bytes)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description="RBTools: Xbox 360 STFS File Extractor",
        epilog="By Ruggery Iury Corrêa, using valmyzk's fork of arkem's py360 library.\nvalmyzk fork: https://github.com/valmyzk/py360\narkem's original package: https://github.com/arkem/py360",
    )
    parser.add_argument(
        "stfs_file_path",
        help="The STFS file you want to extract its contents",
        type=str,
    )
    parser.add_argument(
        "dest_path",
        help="The folder path where you want the files to be extracted to",
        type=str,
    )
    parser.add_argument(
        "--extract-on-root",
        help="Extract all files on the root rather than recreate the entire STFS file system recursively",
        action=argparse.BooleanOptionalAction,
        default=False,
    )
    parser.add_argument(
        "--songs",
        help="An array of song names to be extracted. If not provided, all songs will be extracted normally. Example usage: --songs 7748lennastheme 7748royalpalace",
        nargs="+",
        type=str
    )

    arg = parser.parse_args()

    if (len(arg.songs) == 0):
        raise ValueError(
            "At least one song must be specified for extraction when using the --songs option.")

    if arg.extract_on_root:
        stfs_extract_selected_songs_on_root(
            arg.stfs_file_path, arg.dest_path, arg.songs)
    else:
        stfs_extract_selected_songs(
            arg.stfs_file_path, arg.dest_path, arg.songs)
