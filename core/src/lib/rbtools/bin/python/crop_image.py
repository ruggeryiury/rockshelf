#!/usr/bin/env python3
import argparse
from os import PathLike
from pathlib import Path
from PIL import Image
from typing import Literal, Union


def crop_image(
    src_path: Union[str, PathLike[str]],
    dest_path: Union[str, PathLike[str]],
    crop_x: float,
    crop_y: float,
    crop_width: float,
    crop_height: float,
    out_width: int = 256,
    out_height: int = 256,
    mode: Literal["stretch", "contain"] = "stretch",
    quality: int = 100
) -> Path:
    """
    Crops and re-encodes and image file, preserving its dimensions.

    Args:
        src_path (Union[str, PathLike[str]]): The source file path to be converted.
        dest_path (Union[str, PathLike[str]]): The destination file path of the converted file.
        crop_x (float): The starting point of the horizontal cut (in pixels).
        crop_y (float): The starting point of the vertical cut (in pixels).
        crop_width (float): The size of the horizontal cut (in pixels).
        crop_height (float): The size of the vertical cut (in pixels).
        out_width (int): The destination file width.
        out_height (int): The destination file height.
        mode (Literal["stretch", "contain"]): Determines how the image is fitted into the target dimensions.
        quality (int): The quality value of the destination image.

    Returns:
        Path: The destination file path of the cropped file.
    """

    src_path = Path(src_path)
    dest_path = Path(dest_path)

    if out_width < 1:
        out_width = 256

    if out_height < 1:
        out_height = 256

    if quality < 1 or quality > 100:
        quality = 100

    if not src_path.exists():
        raise FileNotFoundError(
            f'Provided image path "{str(src_path)}" does not exists.'
        )

    if not src_path.is_file():
        raise TypeError(
            f'Provided path "{str(src_path)}" is not a valid file path.')

    try:
        with Image.open(src_path) as img:
            if img.mode != "RGB":
                img = img.convert("RGB")

            if crop_x == 0 and crop_y == 0 and crop_width == img.width and crop_height == img.height:
                pass
            else:
                crop_box = (crop_x, crop_y, crop_x +
                            crop_width, crop_y + crop_height)

                img = img.crop(crop_box)

            if mode == "stretch":
                # Force exact size (distorts aspect ratio)
                img = img.resize((out_width, out_height),
                                 Image.Resampling.LANCZOS)

            elif mode == "contain":
                # Preserve aspect ratio, fit inside box
                img.thumbnail((out_width, out_height),
                              Image.Resampling.LANCZOS)

                # Create background and center image
                background = Image.new(
                    "RGB", (out_width, out_height), (0, 0, 0))

                x = (out_width - img.width) // 2
                y = (out_height - img.height) // 2

                background.paste(img, (x, y))
                img = background

            else:
                raise ValueError("mode must be 'stretch' or 'contain'")

            img.save(dest_path, quality=quality)

    except Exception as e:
        raise e

    return dest_path


if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description="RBTools: Image Converter", epilog="By Ruggery Iury Corrêa."
    )
    parser.add_argument(
        "src_path", help="The source file path to be converted.", type=str
    )
    parser.add_argument(
        "dest_path", help="The destination file path of the converted file.", type=str
    )
    parser.add_argument(
        "-cx",
        "--crop_x",
        help="The starting point of the horizontal cut (in pixels).",
        type=float,
    )
    parser.add_argument(
        "-cw",
        "--crop_width",
        help="The size of the horizontal cut (in pixels).",
        type=float,
    )
    parser.add_argument(
        "-cy",
        "--crop_y",
        help="The starting point of the vertical cut (in pixels).",
        type=float,
    )
    parser.add_argument(
        "-ch",
        "--crop_height",
        help="The size of the vertical cut (in pixels).",
        type=float,
    )
    parser.add_argument(
        "-ow",
        "--out_width",
        help="The destination file width.",
        type=int,
        required=False,
        default=256
    )
    parser.add_argument(
        "-oh",
        "--out_height",
        help="The destination file height.",
        type=int,
        required=False,
        default=256
    )
    parser.add_argument(
        "-m",
        "--mode",
        help="Determines how the image is fitted into the target dimensions.",
        type=str,
        required=False,
        default="contain"
    )
    parser.add_argument(
        "-q",
        "--quality",
        help="The quality value of the destination image.",
        type=int,
        required=False,
        default=100
    )

    arg = parser.parse_args()

    status = crop_image(
        arg.src_path,
        arg.dest_path,
        arg.crop_x,
        arg.crop_y,
        arg.crop_width,
        arg.crop_height,
        arg.out_width,
        arg.out_height,
        arg.mode,
        arg.quality
    )
