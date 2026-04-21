#!/usr/bin/env python3
import argparse, base64
from io import BytesIO
from lib.tpl import PNG_WII


def texwii_to_base64_buffer(src_path: str, header: bytes) -> str:
    with BytesIO() as output:
        image = PNG_WII(src_path, header).tpl.toImage()
        image.save(output, format="WEBP", quality=100)
        webp_data = output.getvalue()
        return base64.b64encode(webp_data).decode("utf-8")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description="RBTools: WEBP DataURL Creator (for PNG_WII files)",
        epilog="By Ruggery Iury Corrêa.",
    )
    parser.add_argument(
        "src_path", help="The source file path to be converted", type=str
    )
    parser.add_argument(
        "-tpl",
        "--tpl_header",
        help="The TPL header used on the file.",
        type=str,
        required=False,
    )
    parser.add_argument(
        "-p",
        "--print-results",
        help="Prints the results to stdout",
        action=argparse.BooleanOptionalAction,
        default=False,
    )

    arg = parser.parse_args()

    data_url = texwii_to_base64_buffer(arg.src_path, base64.b64decode(arg.tpl_header))
    if arg.print_results:
        print(data_url)
