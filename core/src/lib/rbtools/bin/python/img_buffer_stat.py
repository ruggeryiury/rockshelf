#!/usr/bin/env python3
import sys, json, base64, puremagic
from io import BytesIO
from PIL import Image
from typing import TypedDict


class ImgFileStat(TypedDict):
    dimensions: int
    ext: str
    extDesc: str
    imageMode: str
    height: int
    mimeType: str
    size: int
    width: int


def img_buffer_stat(img_base64: str) -> ImgFileStat:
    """
    Returns a dict with stats of an image file "buffer".

    Args:
        img_base64 (str): An image "buffer" encoded as Base64 string.

    Returns:
        ImgFileStat: A dict with stats of the image file "buffer".
    """
    image_data = BytesIO(base64.b64decode(img_base64))
    try:
        magic = puremagic.magic_string(image_data.read(64))[0]
        with Image.open(image_data) as image:
            return {
                "dimensions": image.size,
                "ext": magic.extension,
                "extDesc": magic.name,
                "imageMode": image.mode,
                "height": image.height,
                "mimeType": magic.mime_type,
                "size": len(image_data.getvalue()),
                "width": image.width,
            }
    except Exception as e:
        raise e


if __name__ == "__main__":
    stdin = sys.stdin.read()
    arg = json.loads(stdin)
    img_stat = img_buffer_stat(
        arg["imgBase64"],
    )
    if arg["printResults"]:
        print(json.dumps(img_stat, ensure_ascii=False))
