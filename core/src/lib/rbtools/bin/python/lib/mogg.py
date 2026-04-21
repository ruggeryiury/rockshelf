#!/usr/bin/env python3
"""
MOGG Script taken from "moggulator" repository by GitHub user LocalH, typed by ruggeryiury.

LocalH's "moggulator" repository:
https://github.com/LocalH/moggulator/tree/master

Multitrack OGG Vorbis File
See https://milo.ipg.pw/index.php/MOGG_File_Format
"""

from io import BufferedReader
from typing import Literal
from Crypto.Cipher import AES
import sys

masher = b'\x39\xa2\xbf\x53\x7d\x88\x1d\x03\x35\x38\xa3\x80\x45\x24\xee\xca\x25\x6d\xa5\xc2\x65\xa9\x94\x73\xe5\x74\xeb\x54\xe5\x95\x3f\x1c'
ctrkey_11 = b'\x37\xb2\xe2\xb9\x1c\x74\xfa\x9e\x38\x81\x08\xea\x36\x23\xdb\xe4'
hvkey_12 = b'\x01\x22\x00\x38\xd2\x01\x78\x8b\xdd\xcd\xd0\xf0\xfe\x3e\x24\x7f'
hvkey_14 = b'\x51\x73\xad\xe5\xb3\x99\xb8\x61\x58\x1a\xf9\xb8\x1e\xa7\xbe\xbf'
hvkey_15 = b'\xc6\x22\x94\x30\xd8\x3c\x84\x14\x08\x73\x7c\xf2\x23\xf6\xeb\x5a'
hvkey_16 = b'\x02\x1a\x83\xf3\x97\xe9\xd4\xb8\x06\x74\x14\x6b\x30\x4c\x00\x91'
hvkey_17 = b'\x42\x66\x37\xb3\x68\x05\x9f\x85\x6e\x96\xbd\x1e\xf9\x0e\x7f\xbd'
hvkey_12_r = b'\xf7\xb6\xc2\x22\xb6\x66\x5b\xd5\x6c\xe0\x7d\x6c\x8a\x46\xdb\x18'
hvkey_14_r = b'\x60\xad\x83\x0b\xc2\x2f\x82\xc5\xcb\xbf\xf4\x3d\x60\x52\x7e\x33'
hvkey_15_r = b'\x6c\x68\x55\x98\x5b\x12\x21\x41\xe7\x85\x35\xca\x19\xe1\x9a\xf3'
hvkey_16_r = b'\xa4\x2f\xf3\xe4\xe8\xfb\xa5\x9e\xac\x79\x01\x9e\xd5\x89\x66\xec'
hvkey_17_r = b'\x0b\x9c\x96\xce\xb6\xf0\xbc\xde\x4e\x9c\xd1\xc4\x1d\xeb\x7f\xe6'
hidden_keys = [
    b'\x7f\x95\x5b\x9d\x94\xba\x12\xf1\xd7\x5a\x67\xd9\x16\x45\x28\xdd\x61\x55\x55\xaf\x23\x91\xd6\x0a\x3a\x42\x81\x18\xb4\xf7\xf3\x04',
    b'\x78\x96\x5d\x92\x92\xb0\x47\xac\x8f\x5b\x6d\xdc\x1c\x41\x7e\xda\x6a\x55\x53\xaf\x20\xc8\xdc\x0a\x66\x43\xdd\x1c\xb2\xa5\xa4\x0c',
    b'\x7e\x92\x5c\x93\x90\xed\x4a\xad\x8b\x07\x36\xd3\x10\x41\x78\x8f\x60\x08\x55\xa8\x26\xcf\xd0\x0f\x65\x11\x84\x45\xb1\xa0\xfa\x57',
    b'\x79\x97\x0b\x90\x92\xb0\x44\xad\x8a\x0e\x60\xd9\x14\x11\x7e\x8d\x35\x5d\x5c\xfb\x21\x9c\xd3\x0e\x32\x40\xd1\x48\xb8\xa7\xa1\x0d',
    b'\x28\xc3\x5d\x97\xc1\xec\x42\xf1\xdc\x5d\x37\xda\x14\x47\x79\x8a\x32\x5c\x54\xf2\x72\x9d\xd3\x0d\x67\x4c\xd6\x49\xb4\xa2\xf3\x50',
    b'\x28\x96\x5e\x95\xc5\xe9\x45\xad\x8a\x5d\x64\x8e\x17\x40\x2e\x87\x36\x58\x06\xfd\x75\x90\xd0\x5f\x3a\x40\xd4\x4c\xb0\xf7\xa7\x04',
    b'\x2c\x96\x01\x96\x9b\xbc\x15\xa6\xde\x0e\x65\x8d\x17\x47\x2f\xdd\x63\x54\x55\xaf\x76\xca\x84\x5f\x62\x44\x80\x4a\xb3\xf4\xf4\x0c',
    b'\x7e\xc4\x0e\xc6\x9a\xeb\x43\xa0\xdb\x0a\x64\xdf\x1c\x42\x24\x89\x63\x5c\x55\xf3\x71\x90\xdc\x5d\x60\x40\xd1\x4d\xb2\xa3\xa7\x0d',
    b'\x2c\x9a\x0b\x90\x9a\xbe\x47\xa7\x88\x5a\x6d\xdf\x13\x1d\x2e\x8b\x60\x5e\x55\xf2\x74\x9c\xd7\x0e\x60\x40\x80\x1c\xb7\xa1\xf4\x02',
    b'\x28\x96\x5b\x95\xc1\xe9\x40\xa3\x8f\x0c\x32\xdf\x43\x1d\x24\x8d\x61\x09\x54\xab\x27\x9a\xd3\x58\x60\x16\x84\x4f\xb3\xa4\xf3\x0d',
    b'\x25\x93\x08\xc0\x9a\xbd\x10\xa2\xd6\x09\x60\x8f\x11\x1d\x7a\x8f\x63\x0b\x5d\xf2\x21\xec\xd7\x08\x62\x40\x84\x49\xb0\xad\xf2\x07',
    b'\x29\xc3\x0c\x96\x96\xeb\x10\xa0\xda\x59\x32\xd3\x17\x41\x25\xdc\x63\x08\x04\xae\x77\xcb\x84\x5a\x60\x4d\xdd\x45\xb5\xf4\xa0\x05',
]
hidden_keys_17_1 = [
    b'\x4c\x22\xd9\x28\xa6\x23\x01\x62\x0a\x84\x86\x27\xbb\xcc\x88\x9e\x33\x3a\x6b\x23\x92\x22\xa2\xb4\x81\x64\x4e\x8d\x25\x69\x9f\xdc',
    b'\x64\xf1\x5f\x54\xca\x70\xb8\x8b\xf8\xaa\x2a\xd3\xd9\xec\x3b\x49\xe8\x0a\x3e\xe3\x46\xb1\xbf\x27\x1b\x6c\x76\x11\xc8\x35\x7a\xb4',
    b'\x74\xf7\x42\xa5\xf1\xc7\x56\x2d\x31\xe1\x73\xf9\x96\x93\x89\x85\xa7\xac\x34\x46\x68\xd0\xbd\x6e\x08\xff\x5e\x8a\xae\x93\xa2\xdb',
    b'\xf8\xa3\x21\x5c\xc2\xbf\xc1\xc0\xaf\x79\x1d\x96\x43\x43\xd5\xf9\x8f\xd9\xc8\xc9\xce\x6e\x68\x93\x32\x5c\x80\xfa\x18\xe4\x3a\x06',
    b'\x8d\x99\x57\xb0\x0d\xe0\x26\xdc\xda\xd3\xda\x2b\x03\x74\x35\xc3\xfa\x23\x4e\x96\x62\xea\xf0\xd4\xc6\xc7\x7f\x6e\xba\xa9\x42\x7d',
    b'\xb1\x70\x75\x8c\x92\x76\xb6\x3c\xfb\x72\x78\x7c\x19\x5e\x31\xa5\x0c\x6a\x1e\x24\x79\x51\x85\xa0\x53\xe4\x3e\xc2\x86\x15\x25\xba',
    b'\x19\xb1\xbc\x30\x61\x7e\x84\x06\x34\xb9\x81\xa9\x5d\xd3\x4c\x86\x2b\xb1\xd4\xa9\xf0\x21\xfb\x61\xfe\x8b\x26\x83\x92\x20\xe6\xbc',
    b'\x49\x1a\xbd\xc3\xdb\x75\x30\x22\x84\x11\xc8\x1c\x33\xe8\x4d\x5a\x34\x79\xc3\x9f\xed\x8f\x81\xf6\xb3\xa5\xe8\xe1\x04\xee\x3a\xf0',
    b'\x44\xb1\x0a\x9f\x80\x9a\xb0\x20\x4c\x16\xc7\x9c\xc9\x78\x84\xa9\x92\xc7\xea\x53\x81\x4e\xc3\xcc\x2f\x0b\x0c\x86\xe0\x8d\xa5\x02',
    b'\xdf\x64\x2a\x87\xcb\xa7\x22\xd5\xff\x9c\x8d\x58\xc9\x89\x35\x38\x79\xa4\x09\xc8\x2e\xe8\xb5\x90\x8a\xe9\xd3\xa3\x2d\x49\x71\x9c',
    b'\x04\xec\xc2\x82\x0e\x61\xab\xb3\x4b\x4c\x6c\x10\xe5\xfa\x8f\xc7\xdd\xa5\x45\x16\x5c\x37\xcf\x70\xe9\xfe\x5d\x9b\xe6\xb2\xa5\x85',
    b'\xb3\xcc\x1c\xaa\x9a\x16\x32\xe7\x0c\x41\xc0\xbd\x70\x1e\xbc\x72\x17\xcb\x04\x6b\x14\x00\x13\xb6\x37\x33\xa3\xb7\xd3\xdd\xc9\x1a',
]
hidden_keys_17_4 = [
    b'\x53\xb6\x2e\xf4\xe7\xec\x46\x0a\xd2\xa7\x9a\xb7\x6f\x00\xb6\xe8\x04\x6d\x28\xd0\xf3\xaf\xa6\x5d\xe5\x27\xb9\x06\xb6\x69\xa2\xd6',
    b'\x1b\xf1\x33\x88\xc6\xce\x99\xf8\x72\x3a\x39\x94\xdc\x59\x74\x9c\x41\x91\x65\xc9\x55\xd6\x4c\xa6\x52\x05\xd7\xab\xe9\xda\x3d\x5c',
    b'\xda\x56\x1b\xb6\x2b\xc1\x22\x91\x06\xb2\xa6\x5c\xbc\x4f\x50\x4b\x3d\x6a\x11\xcd\xca\xea\xab\x5b\x69\x8c\xbf\x93\xd3\xf7\x55\xe6',
    b'\x73\x92\xc9\xd9\xe3\x52\x5d\x56\x74\x73\xf8\xaa\xcf\xcb\xef\x5d\xe9\xc8\x97\x96\xdc\x7e\xc7\xf7\xd4\x83\x9b\x9d\x90\x06\xb5\x60',
    b'\x77\x99\xa9\x0f\x83\x9b\x1a\xdd\xbc\x60\x53\xee\xf4\xfa\x77\x96\xd0\x0f\x8f\x4b\xbb\x2e\x83\xf5\x19\x27\xc2\xa8\x10\x40\xf0\xf3',
    b'\xaa\xe1\x9d\xf1\x60\x38\xf9\xe1\x34\x10\xa7\x85\xe3\x9a\x77\xc7\x11\x9c\xeb\x71\x71\xc1\x2b\x0e\x95\x2e\x0c\xa7\x94\x69\x0b\x56',
    b'\x86\x62\xf2\x77\xd0\x33\x90\x58\xf8\x22\xe3\xdd\x48\xb4\x98\xfe\x9e\xdf\x47\x72\xa8\x38\x15\x3d\x8b\x11\xe3\xdd\xff\xf9\x54\x9d',
    b'\xa3\x2e\xe6\x54\x34\x94\x8f\x3d\x6c\x78\xc0\x06\x28\xe9\x84\x5a\x80\xb8\xbe\xbb\x03\xb1\x1b\xb6\xdc\xb6\x4c\xd5\xe2\xbf\x78\x2f',
    b'\x35\x81\x86\xc9\x42\xcb\x1b\x2b\x87\x32\xae\x98\x73\x8e\xce\x02\xa7\x88\x2c\xbe\xfa\x54\x9d\x84\xbe\xc4\x0b\xff\xe6\xd9\x18\x2e',
    b'\xca\x53\xb0\x5f\x14\x3a\x40\xb2\x5f\x8d\x5e\x10\x86\x0d\x63\xbd\xc7\x4b\x71\xd6\xff\xdd\x2d\x1f\xd9\x06\x20\xf6\xf8\x2f\x7d\x56',
    b'\x40\x2f\x93\x66\x9b\xee\x29\x5c\x91\xcf\xa6\xad\x47\x63\x01\x87\x51\x6c\xe8\x29\x55\x68\x5e\x11\xc2\x48\x23\x96\x05\x78\xb3\xa1',
    b'\x8f\xfb\x7e\xad\x69\x6a\x24\xcd\x03\x97\xca\xb8\x48\x39\xf6\xdd\x56\x80\x61\xe7\x66\xee\x5c\x55\xd1\x52\x57\xce\xd2\xc0\xbe\xc1',
]
hidden_keys_17_6 = [
    b'\x35\xb3\xda\x45\x95\xd2\x5c\x4e\x65\x01\x5f\x84\x61\x61\x6a\x08\xb0\x0d\x41\xd3\xa7\xf4\xb8\xa1\x78\x08\xe2\x75\x29\x1e\xfe\x8d',
    b'\x18\x9a\x4c\x81\x2e\x8a\x6d\x40\x17\xec\x55\x1b\x4b\x39\x28\x84\x63\x69\xc3\x6b\x24\x30\x71\x00\xcd\x0e\xdd\xda\xa1\xfa\x1b\xb9',
    b'\x41\xc7\x6e\xe3\x6d\xda\xb1\x96\x7c\x19\x0f\x98\x6e\x12\xb3\x41\x99\x0f\xd5\x4c\x32\x7e\x9f\xba\x0b\x5f\xe7\xa1\x5b\x73\x59\x8b',
    b'\xff\x37\xa5\x37\x8a\xf7\x8d\xa8\xf1\x21\xfe\xfb\xc1\x08\x2f\x30\x84\xc2\x4f\x6c\x00\x32\x9f\xa7\xcb\x7f\xb8\x15\x51\x4f\xd7\xeb',
    b'\x29\x5b\xaa\x6a\x41\xca\xc8\xff\xbf\x9b\x4e\x0f\xcc\x29\xc6\x92\x15\x8e\xec\x97\x60\xc7\xa9\x68\x40\x61\x89\x29\x8e\x5a\x05\x50',
    b'\x4e\x08\x6a\x65\x42\x6e\x89\x63\xf1\xc3\x45\x06\xb0\x52\xe9\xba\x9e\xec\x6f\x9a\x99\x4d\x07\xe7\x8a\x1b\x03\x2f\xd1\x07\xe7\xd4',
    b'\x57\x12\x80\xf2\x74\x43\x60\x68\x17\xac\x2f\xca\x55\x2b\x0d\x36\x16\xb8\xd6\x45\xe3\xd8\x4c\x8f\xd7\x8d\x25\xeb\x4a\x2b\x07\xd5',
    b'\x8c\xdf\xb8\xa6\x1e\x94\x4f\x9a\x10\x80\x67\xe2\x0d\x61\xbb\xa7\x54\x83\xac\x2e\xfa\xda\xee\xd4\xc4\x5a\x77\xce\xae\x03\x17\xb6',
    b'\x44\x34\x3f\xa8\x66\x5d\x85\x17\xc1\xda\x8d\x26\xb3\x33\xba\x87\x57\x10\x6c\xb9\x7e\x43\xcb\x97\xfd\x2e\x48\xdc\x3d\xa4\xbf\x8a',
    b'\xbb\x9a\x0e\x29\x7d\x8d\x17\x46\x08\x61\x8e\x72\xab\xef\x4b\x40\xc4\x93\x24\x03\x21\x54\x02\x97\xb5\x12\xab\x42\x4f\x23\x2a\x6f',
    b'\x7b\xd5\x0c\x35\xe3\x62\xe4\x3b\xee\x23\x30\x9e\x61\x70\xbe\xbf\x8f\xa7\x4b\xed\x97\x3b\xd1\xcb\xdd\xd2\x0b\xe5\xe1\xb9\xe6\x52',
    b'\x69\xa9\x4b\x0f\x1c\x58\xcb\x77\xe2\x12\xea\x94\xdf\x47\x3f\x53\x26\xba\x0e\x6e\x09\xc3\xb2\x22\x68\xdd\x4c\x5c\xfd\x66\x86\x73',
]
hidden_keys_17_8 = [
    b'\x9e\xdf\xa5\xbb\x02\xca\x0c\x2b\x51\x02\x1a\x35\x11\x62\x8a\x0f\x66\x31\x6e\x73\x0a\x68\x5f\x55\xe0\x51\x4f\x73\x50\x53\xb4\x9c',
    b'\x98\x3a\xfa\x87\x4c\x44\x70\xa8\x15\xe4\x5a\x85\x73\xae\x1a\x32\x26\x63\x28\x11\x4d\x80\x73\xab\x3d\x86\x9c\x03\x99\xac\x10\x1a',
    b'\xa4\xb6\xa4\xfc\x5a\xec\x7a\x18\xc0\x2c\x79\x74\xe2\xdb\x35\x14\x02\xfe\x91\x0e\x13\xa9\x44\xdf\x94\x85\x3f\x9a\x41\xcb\x34\x32',
    b'\x7b\x87\xc0\xf6\xae\xf6\x44\x10\xd2\x01\xaf\x18\x67\x98\xc2\x0e\xec\x9a\x41\x42\xea\x90\xef\xde\xd6\xbf\x12\x6c\x8b\x2b\x6e\x13',
    b'\x63\xe9\xb0\x24\xd2\x0f\xc1\x3c\x6f\x60\xec\xd6\xce\x9a\xcc\x7d\x25\x04\x95\x81\x9d\xb9\x9a\xf1\x8b\x82\x1f\xf9\xa3\xa6\x2b\x3a',
    b'\xc1\x5d\xa1\xd2\x49\x92\x02\x8d\x76\x7a\x32\x76\xb7\xfd\x64\xcb\x51\x2d\x51\xc7\xfc\x0e\x2f\xa4\xf8\x1d\xf1\x02\x81\x88\x49\x4f',
    b'\x0a\xfc\xcb\x82\x34\xad\x23\xdb\x13\x1b\x4b\x7a\xa4\xd6\x26\xfa\xdf\x86\x65\x64\xb0\x6f\x95\x84\x92\xd0\x4d\x31\x68\x61\x56\x21',
    b'\xdf\x60\xee\xdb\xc5\x55\x26\xc0\x0e\x3f\xa8\x4b\xd4\xb1\x54\x3f\x60\x93\xbf\xb3\x8a\x46\x79\x34\x36\xa9\x16\x9d\x20\xf7\xd3\x61',
    b'\x92\x63\x1e\x54\xe4\xdf\x9b\x42\x32\xb4\xa8\x3d\x2e\x48\x3a\x96\x89\x0f\xcf\xaa\x22\x09\x1d\xd3\xf9\x28\x25\xce\x67\x57\xd6\xd0',
    b'\xc1\x30\x1d\x91\xa1\xb7\x39\x1e\xe4\xd9\x08\x88\xcd\x19\x88\x09\xfc\xc1\x38\x59\x7c\x4b\xd7\xd9\xf5\x10\xa3\x9c\x1e\x5e\xf1\x30',
    b'\x36\x00\x3f\x13\xa0\x7a\xb6\x02\x86\x4d\xc2\x70\x19\x1f\xd1\xd9\x8e\x0b\x64\x4a\xf2\xc6\xeb\xb5\x1c\x14\x6c\xc0\x54\xd3\x69\x5c',
    b'\x00\xb1\xa8\x7f\xa2\x91\xad\x8e\x08\xf6\xc9\x03\x71\xa9\x74\x64\x66\xde\x4e\x02\x08\x35\x39\x40\x9c\x75\x10\x0d\x9d\x61\x7f\x63',
]
hidden_keys_17_10 = [
    b'\xfe\x0e\x46\xa5\x59\x14\x7c\x30\xb4\x6a\x42\xcb\x75\x71\xbb\xcd\xd8\xc3\x20\xdc\x2e\xf7\x02\x8b\x03\x36\x43\x96\xaf\xde\x2d\x71',
    b'\xaf\xa3\xf3\x3b\xdb\x8f\xe2\xf5\x96\x45\x8a\x37\xed\xb9\xab\x18\x1f\xb2\xdd\x75\xa6\x2a\x66\xe6\xc4\xc1\x44\xf4\x78\x15\x9f\x38',
    b'\xe9\x61\x9c\x1c\x51\x16\x49\x77\xb3\xe3\xc5\xf9\x57\x73\x78\xee\x72\xa5\x11\x24\x0e\xd6\x81\x85\xf1\xb7\xd7\x09\x0a\x95\x04\x82',
    b'\xb5\x82\x8b\xc7\x2b\x0b\xe8\x45\x23\x5a\xe7\xb4\xe4\x32\x59\x82\xb0\x89\x2f\xc8\x0f\x53\xbd\x1c\xda\x9b\x8e\x28\x6f\x0f\x7e\xf0',
    b'\x54\x1d\x9e\xbc\x51\xdf\x27\x95\xa4\x3f\xcc\xcb\xb4\x1c\x3d\x60\x15\xef\x5d\x3e\x46\x3d\x2b\x17\x98\x97\x89\xa0\x7f\xf1\x59\xa3',
    b'\xf2\xe9\xb4\x72\xf2\x65\x22\xa3\x38\x1a\xdd\xe3\x83\xed\x95\xd1\x6e\xcf\xc6\xeb\x87\x63\x4f\x71\x85\xa9\x15\x62\x43\x6c\x18\x98',
    b'\x25\x8b\xfa\xf6\xfc\x92\x38\x9e\xbf\x53\x45\x33\xab\x9c\xcd\x53\x41\x79\xc3\x27\x50\xbc\xd2\x47\x3a\x49\x39\xf9\x87\x54\x8f\xfe',
    b'\x29\x5a\xea\xba\x0a\xef\x1f\xcd\x22\x1e\x48\x3e\x70\xf0\x62\x21\x8c\x83\xf6\x8a\x10\x3b\x55\x6e\xb5\x35\xbb\x70\x4f\xec\xa1\xfb',
    b'\x08\x2c\x3a\xec\x3f\xfa\x71\xb7\x25\x3c\x4b\xfc\xe5\x5c\xaf\x6b\x31\x43\x05\x73\x99\xb3\x56\xf7\xcd\xe5\x44\x81\x81\x97\xba\xd9',
    b'\x03\x4d\xd2\xf2\x44\xb6\x8f\xa2\x94\xfd\x8d\x0b\x22\x97\x91\x50\xb4\xaf\x5a\xd2\x92\x94\x6b\xa3\x55\x56\xa8\xe5\x3f\x5c\xdd\x4f',
    b'\x81\x84\x19\x91\x45\x40\x3f\x9d\x7c\x47\xf4\x5d\x57\x56\x80\x30\xd9\x98\x1c\x65\x5e\x07\xce\x9d\xd1\x20\x62\x9d\x45\x8f\xbb\x0c',
    b'\xb5\xa2\x15\x9d\x15\x86\x9f\x6e\x80\x55\x8c\xe6\x6c\x68\x71\xee\x7e\xed\x19\x9c\xb0\x80\xc5\x5f\xdc\x9f\xd1\x4a\x01\x36\xf4\x39',
]


def do_crypt(key: bytearray, mogg_data: bytearray, decmogg_data: bytearray, file_nonce: bytearray, ogg_offset: int):
    cipher = AES.new(key, AES.MODE_ECB)
    nonce = bytearray(16)
    nonce[0:16] = file_nonce[0:16]
    block_mask = bytearray(cipher.encrypt(nonce))
    block_offset = 0
    for i in range(ogg_offset, len(mogg_data)):
        if block_offset == 16:
            for j in range(0, 16):
                nonce[j] = (nonce[j]+1) & 0xff
                if not nonce[j] == 0:
                    break
            block_mask = bytearray(cipher.encrypt(nonce))
            block_offset = 0
        decmogg_data[i] = (mogg_data[i] ^ block_mask[block_offset]) & 0xff
        block_offset = block_offset + 1
    return


def gen_key(xbox: bool, hvkey: bytearray, mogg_data: bytearray, version: Literal[10, 11, 12, 13, 14, 15, 16, 17]):
    ps3key = gen_key_inner(False, hvkey, mogg_data, version)
    xboxkey = gen_key_inner(True, hvkey, mogg_data, version)

    if ps3key != xboxkey:
        print("ps3 key does not match xbox key, decryption may fail")

    match xbox:
        case True:
            return xboxkey
        case False:
            return ps3key


def gen_key_inner(xbox: bool, hvkey, mogg_data, version: Literal[10, 11, 12, 13, 14, 15, 16, 17]):
    key_mask = bytearray(16)
    bad_mask_1 = bytearray(
        b'\xc3\xc3\xc3\xc3\x00\x01\x02\x03\x04\x05\x06\x07\x08\x09\x0a\x0b')  # only if v13
    bad_mask_2 = bytearray(
        b'\x6c\x6c\x65\x63\x74\x69\x76\x65\x2d\x74\x6f\x6f\x6c\x73\x2d\x62')  # only if v12
    hmx_header_size = int.from_bytes(mogg_data[16:20], "little")
    if xbox:
        key_mask[0:16] = mogg_data[20+hmx_header_size *
                                   8+16+32:20+hmx_header_size*8+16+48]
    else:
        key_mask[0:16] = mogg_data[20+hmx_header_size *
                                   8+16+16:20+hmx_header_size*8+16+32]
    if not xbox and version == 13 and key_mask == bad_mask_1:
        print("found a bad C3 PS3 key mask, correcting")
        key_mask = bytearray(
            b'\xa5\xce\xfd\x06\x11\x93\x23\x21\xf8\x87\x85\xea\x95\xe4\x94\xd4')
    if not xbox and version == 12 and key_mask == bad_mask_2:
        print("found a bad C3 PS3 key mask, correcting")
        key_mask = bytearray(
            b'\xf1\xb4\xb8\xb0\x48\xaf\xcb\x9b\x4b\x53\xe0\x56\x64\x57\x68\x39')
    if xbox:
        mask_cipher = AES.new(hvkey, AES.MODE_ECB)
        key_mask = mask_cipher.decrypt(key_mask)
    magic_a = int.from_bytes(
        mogg_data[20+hmx_header_size*8+16:20+hmx_header_size*8+16+4], "little")
    magic_b = int.from_bytes(
        mogg_data[20+hmx_header_size*8+16+8:20+hmx_header_size*8+16+12], "little")
    # magic_hash_a = lcg(lcg(magic_a ^ 0x5c5c5c5c)) & 0xffffffffffffffff
    # magic_hash_b = lcg(magic_b ^ 0x36363636) & 0xffffffffffffffff
    hdr_offset = 20+hmx_header_size*8+16+48
    if version == 17:
        use_new_hidden_keys = int.from_bytes(
            mogg_data[hdr_offset:hdr_offset+8], "little")
        hdr_offset = hdr_offset + 8
        match use_new_hidden_keys:
            case 1:
                v17_game = "Rock Band 4"
            case 4:
                v17_game = "DropMix"
            case 6:
                v17_game = "Dance Central VR"
            case 8:
                v17_game = "Audica"
            case 10:
                v17_game = "FUSER"
            case _:
                print(
                    "Unknown game! Please notify LocalH and send him the song package.")
                sys.exit(2)
    key_index = int.from_bytes(
        mogg_data[hdr_offset:hdr_offset+8], "little") % 6
    if xbox:
        key_index = key_index + 6
    match version:
        case 12 | 13 | 14 | 15 | 16:
            selected_key = bytearray(hidden_keys[key_index])
        case 17:
            match use_new_hidden_keys:
                case 1:
                    selected_key = bytearray(hidden_keys_17_1[key_index])
                case 4:
                    selected_key = bytearray(hidden_keys_17_4[key_index])
                case 6:
                    selected_key = bytearray(hidden_keys_17_6[key_index])
                case 8:
                    selected_key = bytearray(hidden_keys_17_8[key_index])
                case 10:
                    selected_key = bytearray(hidden_keys_17_10[key_index])
    revealed_key = reveal_key(selected_key, masher)
    bytes_from_hex_string = hex_string_to_bytes(revealed_key)
    grind_array_result = grind_array(
        magic_a, magic_b, bytes_from_hex_string, version)
    actual_key = bytearray(16)
    for i in range(0, 16):
        actual_key[i] = grind_array_result[i] ^ key_mask[i]
    return actual_key


def reveal_key(key: bytearray, masher: bytearray):
    for x in range(0, 14):
        key = supershuffle(key)
        # key = quickshuffle(key)
    key = mash(key, masher)
    return key


def quickshuffle(key: bytearray):
    key[19], key[2] = key[2], key[19]  # shuffle1
    key[22], key[1] = key[1], key[22]
    key[23], key[6] = key[6], key[23]
    key[26], key[5] = key[5], key[26]
    key[27], key[10] = key[10], key[27]
    key[30], key[9] = key[9], key[30]
    key[31], key[14] = key[14], key[31]
    key[2], key[13] = key[13], key[2]
    key[3], key[18] = key[18], key[3]
    key[6], key[17] = key[17], key[6]
    key[7], key[22] = key[22], key[7]
    key[10], key[21] = key[21], key[10]
    key[11], key[26] = key[26], key[11]
    key[14], key[25] = key[25], key[14]
    key[15], key[30] = key[30], key[15]
    key[18], key[29] = key[29], key[18]

    key[29], key[2] = key[2], key[29]  # shuffle2
    key[28], key[3] = key[3], key[28]
    key[25], key[6] = key[6], key[25]
    key[24], key[7] = key[7], key[24]
    key[21], key[10] = key[10], key[21]
    key[20], key[11] = key[11], key[20]
    key[17], key[14] = key[14], key[17]
    key[16], key[15] = key[15], key[16]
    key[13], key[18] = key[18], key[13]
    key[12], key[19] = key[19], key[12]
    key[9], key[22] = key[22], key[9]
    key[8], key[23] = key[23], key[8]
    key[5], key[26] = key[26], key[5]
    key[4], key[27] = key[27], key[4]
    key[1], key[30] = key[30], key[1]
    key[0], key[31] = key[31], key[0]

    key[16], key[2] = key[2], key[16]  # shuffle3
    key[28], key[3] = key[3], key[28]
    key[12], key[6] = key[6], key[12]
    key[24], key[7] = key[7], key[24]
    key[8], key[10] = key[10], key[8]
    key[20], key[11] = key[11], key[20]
    key[4], key[14] = key[14], key[4]
    key[16], key[15] = key[15], key[16]
    key[0], key[18] = key[18], key[0]
    key[12], key[19] = key[19], key[12]
    key[28], key[22] = key[22], key[28]
    key[8], key[23] = key[23], key[8]
    key[24], key[26] = key[26], key[24]
    key[4], key[27] = key[27], key[4]
    key[20], key[30] = key[30], key[20]
    key[0], key[31] = key[31], key[0]

    key[29], key[2] = key[2], key[29]  # shuffle4
    key[15], key[3] = key[3], key[15]
    key[25], key[6] = key[6], key[25]
    key[11], key[7] = key[7], key[11]
    key[21], key[10] = key[10], key[21]
    key[7], key[11] = key[11], key[7]
    key[17], key[14] = key[14], key[17]
    key[3], key[15] = key[15], key[3]
    key[13], key[18] = key[18], key[13]
    key[31], key[19] = key[19], key[31]
    key[9], key[22] = key[22], key[9]
    key[27], key[23] = key[23], key[27]
    key[5], key[26] = key[26], key[5]
    key[23], key[27] = key[27], key[23]
    key[1], key[30] = key[30], key[1]
    key[19], key[31] = key[31], key[19]

    key[29], key[21] = key[21], key[29]  # shuffle5
    key[28], key[3] = key[3], key[28]
    key[25], key[25] = key[25], key[25]  # lol wut
    key[24], key[7] = key[7], key[24]
    key[21], key[29] = key[29], key[21]
    key[20], key[11] = key[11], key[20]
    key[17], key[1] = key[1], key[17]
    key[16], key[15] = key[15], key[16]
    key[13], key[5] = key[5], key[13]
    key[12], key[19] = key[19], key[12]
    key[9], key[9] = key[9], key[9]  # lol wut again
    key[8], key[23] = key[23], key[8]
    key[5], key[13] = key[13], key[5]
    key[4], key[27] = key[27], key[4]
    key[1], key[17] = key[17], key[1]
    key[0], key[31] = key[31], key[0]

    key[29], key[2] = key[2], key[29]  # shuffle6
    key[28], key[22] = key[22], key[28]
    key[25], key[6] = key[6], key[25]
    key[24], key[26] = key[26], key[24]
    key[21], key[10] = key[10], key[21]
    key[20], key[30] = key[30], key[20]
    key[17], key[14] = key[14], key[17]
    key[16], key[2] = key[2], key[16]
    key[13], key[18] = key[18], key[13]
    key[12], key[6] = key[6], key[12]
    key[9], key[22] = key[22], key[9]
    key[8], key[10] = key[10], key[8]
    key[5], key[26] = key[26], key[5]
    key[4], key[14] = key[14], key[4]
    key[1], key[30] = key[30], key[1]
    key[0], key[18] = key[18], key[0]

    return key


def supershuffle(key: bytearray):
    key = shuffle1(key)
    key = shuffle2(key)
    key = shuffle3(key)
    key = shuffle4(key)
    key = shuffle5(key)
    key = shuffle6(key)
    return key


def shuffle1(key: bytearray):
    for i in range(0, 8):
        o = roll(i << 2)
        key[o], key[(i*4)+2] = key[(i*4)+2], key[o]
        o = roll((i*4)+3)
        key[o], key[(i*4)+1] = key[(i*4)+1], key[o]
    return key


def shuffle2(key: bytearray):
    for i in range(0, 8):
        key[((7-i)*4)+1], key[(i*4)+2] = key[(i*4)+2], key[((7-i)*4)+1]
        key[(7-i)*4], key[(i*4)+3] = key[(i*4)+3], key[(7-i)*4]
    return key


def shuffle3(key: bytearray):
    for i in range(0, 8):
        o = roll(((7-i)*4)+1)
        key[o], key[(i*4)+2] = key[(i*4)+2], key[o]
        key[(7-i)*4], key[(i*4)+3] = key[(i*4)+3], key[(7-i)*4]
    return key


def shuffle4(key: bytearray):
    for i in range(0, 8):
        key[((7-i)*4)+1], key[(i*4)+2] = key[(i*4)+2], key[((7-i)*4)+1]
        o = roll((7-i)*4)
        key[o], key[(i*4)+3] = key[(i*4)+3], key[o]
    return key


def shuffle5(key: bytearray):
    for i in range(0, 8):
        o = roll((i*4)+2)
        key[((7-i)*4)+1], key[o] = key[o], key[((7-i)*4)+1]
        key[(7-i)*4], key[(i*4)+3] = key[(i*4)+3], key[(7-i)*4]
    return key


def shuffle6(key: bytearray):
    for i in range(0, 8):
        key[((7-i)*4)+1], key[(i*4)+2] = key[(i*4)+2], key[((7-i)*4)+1]
        o = roll((i*4)+3)
        key[(7-i)*4], key[o] = key[o], key[(7-i)*4]
    return key


def mash(key: bytearray, masher: bytearray):
    for i in range(0, 32):
        key[i] = key[i] ^ masher[i]
    return key


def roll(x: int):
    return ((x + 0x13) % 0x20)


def ascii_digit_to_hex(h: int):
    if h < 0x61 or 0x66 < h:
        if h < 0x41 or 0x46 < h:
            h = h - 0x30
            if h < 0:
                h = h + 0x100
            return h
        else:
            h = h - 0x37
            if h < 0:
                h = h + 0x100
            return h
    else:
        h = h - 0x57
        if h < 0:
            h = h + 0x100
        return h


def hex_string_to_bytes(s: bytearray):
    arr = bytearray(16)
    for i in range(0, 16):
        lo = ascii_digit_to_hex(s[i*2+1])
        hi = ascii_digit_to_hex(s[i*2])
        arr[i] = (lo + hi * 16) & 0xff
    return arr


def lcg(x: int):
    return ((x * 0x19660d) + 0x3c6ef35f) & 0xffffffff


def grind_array(magic_a: int, magic_b: int, key: bytearray, version: Literal[10, 11, 12, 13, 14, 15, 16, 17]):
    array = bytearray(64)
    array1 = bytearray(64)
    num1 = magic_a
    num2 = magic_b
    array2 = bytearray(256)

    for i in range(0, 256):
        array2[i] = (magic_a & 0xff) >> 3
        magic_a = lcg(magic_a)
    if magic_b == 0:
        magic_b = 0x303f
    for i in range(0, 32):
        while True:
            magic_b = lcg(magic_b)
            num = magic_b >> 2 & 0x1f
            if array[num] == 0:
                break
        array1[i] = num & 0xff
        array[num] = 1
    array3 = array2
    array4 = bytearray(256)
    magic_a = num2
    for i in range(0, 256):
        array4[i] = (magic_a & 0xff) >> 2 & 0x3f
        magic_a = lcg(magic_a)
    if version > 13:
        for i in range(32, 64):
            while True:
                num1 = lcg(num1)
                num = (num1 >> 2 & 0x1f) + 0x20
                if array[num] == 0:
                    break
            array1[i] = num & 0xff
            array[num] = 1
        array3 = array4
    for j in range(0, 16):
        num3 = key[j]
        for k in range(0, 16, 2):
            num3 = o_funcs(num3, key[k+1], array1[array3[key[k]]])
        key[j] = num3 & 0xff
    return key


def rotl(x: int, n: int):
    return ((x << (n & 31) | x >> (8 - n & 31)) & 255)


def rotr(x: int, n: int):
    return ((x >> (n & 31) | x << (8 - n & 31)) & 255)


def onot(x: int):
    if x == 0:
        return 1
    else:
        return 0


def bit_not(num):
    return num ^ ((1 << num.bit_length()) - 1)


def o_funcs(a1: int, a2: int, op: int):
    match op:
        case 0:   # original 32 O funcs from v12
            ret = a2 + rotr(a1, onot(a2))
        case 1:
            ret = a2 + rotr(a1, 3)
        case 2:
            ret = a2 + rotl(a1, 1)
        case 3:
            ret = a2 ^ (a1 >> (a2 & 7 & 31) | (a1 << (-a2 & 7 & 31)))
        case 4:
            ret = a2 ^ rotl(a1, 4)
        case 5:
            ret = a2 + (a2 ^ rotr(a1, 3))
        case 6:
            ret = a2 + rotl(a1, 2)
        case 7:
            ret = a2 + onot(a1)
        case 8:
            ret = a2 ^ rotr(a1, onot(a2))
        case 9:
            ret = a2 ^ (a2 + rotl(a1, 3))
        case 10:
            ret = a2 + rotl(a1, 3)
        case 11:
            ret = a2 + rotl(a1, 4)
        case 12:
            ret = a1 ^ a2
        case 13:
            ret = a2 ^ onot(a1)
        case 14:
            ret = a2 ^ (a2 + rotr(a1, 3))
        case 15:
            ret = a2 ^ rotl(a1, 3)
        case 16:
            ret = a2 ^ rotl(a1, 2)
        case 17:
            ret = a2 + (a2 ^ rotl(a1, 3))
        case 18:
            ret = a2 + (a1 ^ a2)
        case 19:
            ret = a1 + a2
        case 20:
            ret = a2 ^ rotr(a1, 3)
        case 21:
            ret = a2 ^ (a1 + a2)
        case 22:
            ret = rotr(a1, onot(a2))
        case 23:
            ret = a2 + rotr(a1, 1)
        case 24:
            ret = a1 >> (a2 & 7 & 31) | a1 << (-a2 & 7 & 31)
        case 25:
            if a1 == 0:
                if a2 == 0:
                    ret = 128
                else:
                    ret = 1
            else:
                ret = 0
        case 26:
            ret = a2 + rotr(a1, 2)
        case 27:
            ret = a2 ^ rotr(a1, 1)
        case 28:
            ret = o_funcs((~a1) & 0xff, a2, 24)
        case 29:
            ret = a2 ^ rotr(a1, 2)
        case 30:
            ret = a2 + (a1 >> (a2 & 7 & 31) | (a1 << (-a2 & 7 & 31)))
        case 31:
            ret = a2 ^ rotl(a1, 1)

        case 32:  # additional 32 O funcs added in v14, much nastier looking
            ret = ((a1 << 0x08 | 0xaa | a1 ^ 0xff) >> 4) ^ a2
        case 33:
            ret = (a1 ^ 0xff | a1 << 8) >> 3 ^ a2
        case 34:
            ret = (a1 << 8 ^ 0xff00 | a1) >> 2 ^ a2
        case 35:
            ret = (a1 ^ 0x5c | a1 << 8) >> 5 ^ a2
        case 36:
            ret = (a1 << 8 | 0x65 | a1 ^ 0x3c) >> 2 ^ a2
        case 37:
            ret = (a1 ^ 0x36 | a1 << 8) >> 2 ^ a2
        case 38:
            ret = (a1 ^ 0x36 | a1 << 8) >> 4 ^ a2
        case 39:
            ret = (a1 ^ 0x5c | a1 << 8 | 0x36) >> 1 ^ a2
        case 40:
            ret = (a1 ^ 0xff | a1 << 8) >> 5 ^ a2
        case 41:
            ret = (~a1 << 8 | a1) >> 6 ^ a2
        case 42:
            ret = (a1 ^ 0x5c | a1 << 8) >> 3 ^ a2
        case 43:
            ret = (a1 ^ 0x3c | 0x65 | a1 << 8) >> 5 ^ a2
        case 44:
            ret = (a1 ^ 0x36 | a1 << 8) >> 1 ^ a2
        case 45:
            ret = (a1 ^ 0x65 | a1 << 8 | 0x3c) >> 6 ^ a2
        case 46:
            ret = (a1 ^ 0x5c | a1 << 8) >> 2 ^ a2
        case 47:
            ret = (a2 ^ 0xaa | a2 << 8 | 0xff) >> 3 ^ a1
        case 48:
            ret = (a1 ^ 0x63 | a1 << 8 | 0x5c) >> 6 ^ a2
        case 49:
            ret = (a1 ^ 0x5c | a1 << 8 | 0x36) >> 7 ^ a2
        case 50:
            ret = (a1 ^ 0x5c | a1 << 8) >> 6 ^ a2
        case 51:
            ret = (a1 << 8 ^ 0xff00 | a1) >> 3 ^ a2
        case 52:
            ret = (a1 ^ 0xff | a1 << 8) >> 6 ^ a2
        case 53:
            ret = (a1 << 8 ^ 0xff00 | a1) >> 5 ^ a2
        case 54:
            ret = (a1 ^ 0x3c | 0x65 | a1 << 8) >> 4 ^ a2
        case 55:
            ret = (a1 ^ 0x63 | a1 << 8 | 0x5c) >> 3 ^ a2
        case 56:
            ret = (a1 ^ 0x63 | a1 << 8 | 0x5c) >> 5 ^ a2
        case 57:
            ret = (a1 ^ 0xaf | a1 << 8 | 0xfa) >> 5 ^ a2
        case 58:
            ret = (a1 ^ 0x5c | a1 << 8 | 0x36) >> 5 ^ a2
        case 59:
            ret = (a1 ^ 0x5c | a1 << 8 | 0x36) >> 3 ^ a2
        case 60:
            ret = (a1 ^ 0x36 | a1 << 8) >> 3 ^ a2
        case 61:
            ret = (a1 ^ 0x63 | a1 << 8 | 0x5c) >> 4 ^ a2
        case 62:
            ret = (a1 ^ 0xff | a1 << 8 | 0xaf) >> 6 ^ a2
        case 63:
            ret = (a1 ^ 0xff | a1 << 8) >> 2 ^ a2
    return (ret & 0xff)


def hmxa_to_ogg(decmogg_data: bytearray, ogg_offset: int, hmx_header_size: int):
    magic_a = int.from_bytes(
        decmogg_data[20+hmx_header_size*8+16:20+hmx_header_size*8+20], "little")
    magic_b = int.from_bytes(
        decmogg_data[20+hmx_header_size*8+16+8:20+hmx_header_size*8+16+12], "little")
    magic_hash_a = lcg(lcg(magic_a ^ 0x5c5c5c5c)) & 0xffffffff
    magic_hash_b = lcg(magic_b ^ 0x36363636) & 0xffffffff
    magic_hash_a_bytes = bytearray(magic_hash_a.to_bytes(4, "big"))
    magic_hash_b_bytes = bytearray(magic_hash_b.to_bytes(4, "big"))
    mogg_hash_a = decmogg_data[ogg_offset+12:ogg_offset+16]
    mogg_hash_b = decmogg_data[ogg_offset+20:ogg_offset+24]
    mogg_unhash_a = bytearray(4)
    mogg_unhash_b = bytearray(4)
    for i in range(0, 4):
        mogg_unhash_a[i] = mogg_hash_a[i] ^ magic_hash_a_bytes[i]
        mogg_unhash_b[i] = mogg_hash_b[i] ^ magic_hash_b_bytes[i]
    decmogg_data[ogg_offset+12:ogg_offset+16] = mogg_unhash_a[0:4]
    decmogg_data[ogg_offset+20:ogg_offset+24] = mogg_unhash_b[0:4]
    decmogg_data[ogg_offset:ogg_offset+4] = bytearray(b'\x4f\x67\x67\x53')
    return


def ogg_to_hmxa(encmogg_data: bytearray, ogg_offset: int, hmx_header_size: int):
    magic_a = int.from_bytes(
        encmogg_data[20+hmx_header_size*8+16:20+hmx_header_size*8+20], "little")
    magic_b = int.from_bytes(
        encmogg_data[20+hmx_header_size*8+16+8:20+hmx_header_size*8+16+12], "little")
    magic_hash_a = lcg(lcg(magic_a ^ 0x5c5c5c5c)) & 0xffffffff
    magic_hash_b = lcg(magic_b ^ 0x36363636) & 0xffffffff
    magic_hash_a_bytes = bytearray(magic_hash_a.to_bytes(4, "big"))
    magic_hash_b_bytes = bytearray(magic_hash_b.to_bytes(4, "big"))
    mogg_hash_a = encmogg_data[ogg_offset+12:ogg_offset+16]
    mogg_hash_b = encmogg_data[ogg_offset+20:ogg_offset+24]
    mogg_unhash_a = bytearray(4)
    mogg_unhash_b = bytearray(4)
    for i in range(0, 4):
        mogg_unhash_a[i] = mogg_hash_a[i] ^ magic_hash_a_bytes[i]
        mogg_unhash_b[i] = mogg_hash_b[i] ^ magic_hash_b_bytes[i]
    encmogg_data[ogg_offset+12:ogg_offset+16] = mogg_unhash_a[0:4]
    encmogg_data[ogg_offset+20:ogg_offset+24] = mogg_unhash_b[0:4]
    encmogg_data[ogg_offset:ogg_offset+4] = bytearray(b'\x48\x4D\x58\x41')
    return


def decrypt_mogg(xbox: bool, red: bool, fin: BufferedReader, fout: BufferedReader):
    failed = False
    mogg_data = fin.read()
    decmogg_data = bytearray(mogg_data)

    version = mogg_data[0]
    ogg_offset = int.from_bytes(mogg_data[4:8], "little")
    hmx_header_size = int.from_bytes(mogg_data[16:20], "little")

    if version == 10:
        print("version 10 mogg, nothing to do")
        fout.close()
        return True

    if version != 11:
        if red:
            print("using red keys")
        else:
            print("using green keys")

    match version:
        case 11:
            key = bytearray(ctrkey_11)
        case 12 | 13:
            if red:
                hvkey = hvkey_12_r
            else:
                hvkey = hvkey_12
            key = gen_key(xbox, hvkey, mogg_data, version)
        case 14:
            if red:
                hvkey = hvkey_14_r
            else:
                hvkey = hvkey_14
            key = gen_key(xbox, hvkey, mogg_data, 14)
        case 15:
            if red:
                hvkey = hvkey_15_r
            else:
                hvkey = hvkey_15
            key = gen_key(xbox, hvkey, mogg_data, 15)
        case 16:
            if red:
                hvkey = hvkey_16_r
            else:
                hvkey = hvkey_16
            key = gen_key(xbox, hvkey, mogg_data, 16)
        case 17:
            if red:
                hvkey = hvkey_17_r
            else:
                hvkey = hvkey_17
            key = gen_key(xbox, hvkey, mogg_data, 17)
        case _:
            print(
                "Unknown encryption version! Please notify LocalH and send him the song package.")
            sys.exit(2)

    # copy header to output buffer
    decmogg_data[0:ogg_offset] = mogg_data[0:ogg_offset]

    if version == 13 and decmogg_data[20+hmx_header_size*8+16+16:20+hmx_header_size*8+16+32] == bytearray(b'\xc3\xc3\xc3\xc3\x00\x01\x02\x03\x04\x05\x06\x07\x08\x09\x0a\x0b'):
        decmogg_data[20+hmx_header_size*8+16+16:20+hmx_header_size*8+16+32] = bytearray(
            b'\xa5\xce\xfd\x06\x11\x93\x23\x21\xf8\x87\x85\xea\x95\xe4\x94\xd4')

    if version == 12 and decmogg_data[20+hmx_header_size*8+16+16:20+hmx_header_size*8+16+32] == bytearray(b'\x6c\x6c\x65\x63\x74\x69\x76\x65\x2d\x74\x6f\x6f\x6c\x73\x2d\x62'):
        decmogg_data[20+hmx_header_size*8+16+16:20+hmx_header_size*8+16+32] = bytearray(
            b'\xf1\xb4\xb8\xb0\x48\xaf\xcb\x9b\x4b\x53\xe0\x56\x64\x57\x68\x39')

    nonce_offset = 20 + hmx_header_size * 8
    nonce = bytearray(mogg_data[nonce_offset:nonce_offset+16])

    do_crypt(key, mogg_data, decmogg_data, nonce, ogg_offset)

    if decmogg_data[ogg_offset:ogg_offset+4] == bytearray(b'\x48\x4d\x58\x41'):
        hmxa_to_ogg(decmogg_data, ogg_offset, hmx_header_size)
    elif version != 11:
        print(
            "decrypted data did not start with HMXA (484D5841), should be OggS (4F676753)")

    if not decmogg_data[ogg_offset:ogg_offset+4] == bytearray(b'\x4f\x67\x67\x53'):
        print("OggS header not present")
        fout.close()
        failed = True
    else:
        decmogg_data[0] = 10
        print("decryption successful, wrote version 10 to mogg header")

    if not failed:
        fout.write(decmogg_data)

    fout.close()
    return failed


def reencrypt_mogg(xbox: bool, red: bool, enc_ver: Literal[10, 11, 12, 13, 14, 15, 16, 17], fin: BufferedReader, fout: BufferedReader):
    failed = False
    mogg_data = bytearray(fin.read())
    encmogg_data = mogg_data

    ogg_offset = int.from_bytes(mogg_data[4:8], "little")
    hmx_header_size = int.from_bytes(mogg_data[16:20], "little")

    if red:
        print("using red keys to encrypt")
    else:
        print("using green keys to encrypt")

    match enc_ver:
        case 11:
            key = bytearray(ctrkey_11)
        case 12 | 13:
            if red:
                hvkey = hvkey_12_r
            else:
                hvkey = hvkey_12
            key = gen_key(xbox, hvkey, mogg_data, enc_ver)
        case 14:
            if red:
                hvkey = hvkey_14_r
            else:
                hvkey = hvkey_14
            key = gen_key(xbox, hvkey, mogg_data, 14, )
        case 15:
            if red:
                hvkey = hvkey_15_r
            else:
                hvkey = hvkey_15
            key = gen_key(xbox, hvkey, mogg_data, 15, )
        case 16:
            if red:
                hvkey = hvkey_16_r
            else:
                hvkey = hvkey_16
            key = gen_key(xbox, hvkey, mogg_data, 16, )
        case 17:
            if red:
                hvkey = hvkey_17_r
            else:
                hvkey = hvkey_17
            key = gen_key(xbox, hvkey, mogg_data, 17, )
        case _:
            print(
                "Unknown encryption version! Please notify LocalH and send him the song package.")
            sys.exit(2)

    # copy header to output buffer
    encmogg_data[0:ogg_offset] = mogg_data[0:ogg_offset]

    if enc_ver == 13 and encmogg_data[20+hmx_header_size*8+16+16:20+hmx_header_size*8+16+32] == bytearray(b'\xc3\xc3\xc3\xc3\x00\x01\x02\x03\x04\x05\x06\x07\x08\x09\x0a\x0b'):
        encmogg_data[20+hmx_header_size*8+16+16:20+hmx_header_size*8+16+32] = bytearray(
            b'\xa5\xce\xfd\x06\x11\x93\x23\x21\xf8\x87\x85\xea\x95\xe4\x94\xd4')

    nonce_offset = 20 + hmx_header_size * 8
    print(nonce_offset)
    nonce = bytearray(mogg_data[nonce_offset:nonce_offset+16])
    print(nonce.hex())

    if enc_ver > 11:
        if mogg_data[ogg_offset:ogg_offset+4] == bytearray(b'\x4f\x67\x67\x53'):
            ogg_to_hmxa(mogg_data, ogg_offset, hmx_header_size)
        else:
            print("decrypted data did not start with OggS (4F676753)")

        if not mogg_data[ogg_offset:ogg_offset+4] == bytearray(b'\x48\x4D\x58\x41'):
            print("HMXA header not present")
            fout.close()
            failed = True

    if not failed:

        do_crypt(key, mogg_data, encmogg_data, nonce, ogg_offset)

        encmogg_data[0] = enc_ver
        print(f'encryption successful, wrote version {enc_ver} to mogg header')

        if not failed:
            fout.write(encmogg_data)

    fout.close()
    return failed
