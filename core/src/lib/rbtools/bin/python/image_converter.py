#!/usr/bin/env python3
import argparse
from os import PathLike
from pathlib import Path
from PIL import Image
from typing import Literal, Union


def image_converter(
    src_path: Union[str, PathLike[str]],
    dest_path: Union[str, PathLike[str]],
    width: int = 256,
    height: int = 256,
    interpolation: Literal[
        "NEAREST", "BOX", "BILINEAR", "HAMMING", "BICUBIC", "LANCZOS"
    ] = "LANCZOS",
    quality: int = 100,
) -> Path:
    """
    Process/converts an image file.

    Args:
        src_path (Union[str, PathLike[str]]): The source file path to be converted.
        dest_path (Union[str, PathLike[str]]): The destination file path of the converted file.
        format (str): The image format where the processed "buffer" will be encoded.
        width (int): The output width of the image "buffer". Default is `256`.
        height (int): The output height of the image "buffer". Default is `256`.
        interpolation (Literal["NEAREST", "BOX", "BILINEAR", "HAMMING", "BICUBIC", "LANCZOS"]): The interpolation method that will be used if the image should be resized. Default is `"LANCZOS"`.
        quality (int): The output quality of the image "buffer", used with lossy image formats. Default is `100` (highest quality possible).

    Returns:
        Path: The destination file path of the converted file.
    """

    src_path = Path(src_path)
    dest_path = Path(dest_path)

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

            if img.width == width and img.height == height:
                img.save(dest_path, quality=quality)
            else:
                x, y = img.size
                size = max(width, x, y)
                new_im = Image.new("RGB", (size, size), 0)
                new_im.paste(img, (int((size - x) / 2), int((size - y) / 2)))
                new_im.thumbnail(
                    (width, height), resample=Image.Resampling[interpolation]
                )
                new_im.save(dest_path, quality=quality)

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
        "-x",
        "--width",
        help="The width of the image.",
        type=int,
        default=256,
        required=False,
    )
    parser.add_argument(
        "-y",
        "--height",
        help="The height of the image.",
        type=int,
        default=256,
        required=False,
    )
    parser.add_argument(
        "-i",
        "--interpolation",
        help="The interpolation method used when resizing the image.",
        default="BILINEAR",
        type=str,
        required=False,
    )
    parser.add_argument(
        "-q",
        "--quality",
        help="The quality value of the output image. Only used on lossy format, such as JPEG and WEBP.",
        default=100,
        type=int,
        required=False,
    )

    arg = parser.parse_args()

    status = image_converter(
        arg.src_path,
        arg.dest_path,
        arg.width,
        arg.height,
        arg.interpolation,
        arg.quality,
    )
