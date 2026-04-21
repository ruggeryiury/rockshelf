#!/usr/bin/env python3
import argparse
import os
from pathlib import Path
from lib.stfs import STFS
import shutil


def stfs_extract(stfs_file_path: str, dest_path: str) -> str:
    dest = Path(dest_path)

    if dest.exists() and dest.is_dir():
        shutil.rmtree(dest)  # Remove entire directory and contents

    # Recreate it empty
    dest.mkdir(parents=True, exist_ok=True)

    con = STFS(stfs_file_path)

    # Create directories
    for filename in con.allfiles:
        if con.allfiles[filename].isdirectory:
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
        if not con.allfiles[filename].isdirectory:
            file_bytes = con.read_file(con.allfiles[filename])
            new_file_path = f"{dest}/{filename}"
            open(new_file_path, "wb").write(file_bytes)


def stfs_extract_on_root(
    stfs_file_path: str, dest_path: str
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
        if not con.allfiles[filename].isdirectory:
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

    arg = parser.parse_args()

    if arg.extract_on_root:
        stfs_extract_on_root(arg.stfs_file_path, arg.dest_path)
    else:
        stfs_extract(arg.stfs_file_path, arg.dest_path)
