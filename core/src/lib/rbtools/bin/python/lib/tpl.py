#!/usr/bin/env python3
"""
TPL Library Script taken and modified from "Wii.py" repository by GitHub user "DorkmasterFlek".

DorkmasterFlek's "Wii.py" fork:
https://github.com/DorkmasterFlek/Wii.py

Wii.py Package on PyPi:
https://pypi.org/project/Wii.py/
"""

import struct
import sys
import hashlib
import os
from Crypto.Cipher import AES
from PIL import Image


class StructType(tuple):
    def __getitem__(self, value):
        return [self] * value

    def __call__(self, value, endian="<"):
        if type(value) == type(b""):
            return struct.unpack(
                endian + tuple.__getitem__(self, 0), value[: tuple.__getitem__(self, 1)]
            )[0]
        else:
            return struct.pack(endian + tuple.__getitem__(self, 0), value)


class StructException(Exception):
    pass


class Struct(object):
    _slots = (
        "__attrs__",
        "__baked__",
        "__defs__",
        "__endian__",
        "__next__",
        "__sizes__",
        "__values__",
    )

    int8 = StructType(("b", 1))
    uint8 = StructType(("B", 1))

    int16 = StructType(("h", 2))
    uint16 = StructType(("H", 2))

    int32 = StructType(("l", 4))
    uint32 = StructType(("L", 4))

    int64 = StructType(("q", 8))
    uint64 = StructType(("Q", 8))

    float = StructType(("f", 4))

    def string(cls, len, offset=0, encoding=None, stripNulls=False, value=""):
        return StructType(("string", (len, offset, encoding, stripNulls, value)))

    string = classmethod(string)

    LE = "<"
    BE = ">"
    __endian__ = "<"

    def __init__(self, func=None, unpack=None, **kwargs):
        self.__defs__ = []
        self.__sizes__ = []
        self.__attrs__ = []
        self.__values__ = {}
        self.__next__ = True
        self.__baked__ = False

        if func == None:
            self.__format__()
        else:
            sys.settrace(self.__trace__)
            func()
            for name in func.__code__.co_varnames:
                value = self.__frame__.f_locals[name]
                self.__setattr__(name, value)

        self.__baked__ = True

        if unpack != None:
            if isinstance(unpack, tuple):
                self.unpack(*unpack)
            else:
                self.unpack(unpack)

        if len(kwargs):
            for name in kwargs:
                self.__values__[name] = kwargs[name]

    def __trace__(self, frame, event, arg):
        self.__frame__ = frame
        sys.settrace(None)

    def __setattr__(self, name, value):
        if name in self._slots:
            return object.__setattr__(self, name, value)

        if self.__baked__ == False:
            if not isinstance(value, list):
                value = [value]
                attrname = name
            else:
                attrname = "*" + name

            self.__values__[name] = None

            for sub in value:
                if isinstance(sub, Struct):
                    sub = sub.__class__
                try:
                    if issubclass(sub, Struct):
                        sub = ("struct", sub)
                except TypeError:
                    pass
                type_, size = tuple(sub)
                if type_ == "string":
                    self.__defs__.append(Struct.string)
                    self.__sizes__.append(size)
                    self.__attrs__.append(attrname)
                    self.__next__ = True

                    if attrname[0] != "*":
                        self.__values__[name] = size[3]
                    elif self.__values__[name] == None:
                        self.__values__[name] = [size[3] for val in value]
                elif type_ == "struct":
                    self.__defs__.append(Struct)
                    self.__sizes__.append(size)
                    self.__attrs__.append(attrname)
                    self.__next__ = True

                    if attrname[0] != "*":
                        self.__values__[name] = size()
                    elif self.__values__[name] == None:
                        self.__values__[name] = [size() for val in value]
                else:
                    if self.__next__:
                        self.__defs__.append("")
                        self.__sizes__.append(0)
                        self.__attrs__.append([])
                        self.__next__ = False

                    self.__defs__[-1] += type_
                    self.__sizes__[-1] += size
                    self.__attrs__[-1].append(attrname)

                    if attrname[0] != "*":
                        self.__values__[name] = 0
                    elif self.__values__[name] == None:
                        self.__values__[name] = [0 for val in value]
        else:
            try:
                self.__values__[name] = value
            except KeyError:
                raise AttributeError(name)

    def __getattr__(self, name):
        if self.__baked__ == False:
            return name
        else:
            try:
                return self.__values__[name]
            except KeyError:
                raise AttributeError(name)

    def __len__(self):
        ret = 0
        arraypos, arrayname = None, None

        for i in range(len(self.__defs__)):
            sdef, size, attrs = self.__defs__[i], self.__sizes__[i], self.__attrs__[i]

            if sdef == Struct.string:
                size, offset, encoding, stripNulls, value = size
                if type(size) == type(b""):
                    size = self.__values__[size] + offset
            elif sdef == Struct:
                if attrs[0] == "*":
                    if arrayname != attrs:
                        arrayname = attrs
                        arraypos = 0
                    size = len(self.__values__[attrs[1:]][arraypos])
                size = len(self.__values__[attrs])

            ret += size

        return ret

    def unpack(self, data, pos=0):
        for name in self.__values__:
            if not isinstance(self.__values__[name], Struct):
                self.__values__[name] = None
            elif (
                self.__values__[name].__class__ == list
                and len(self.__values__[name]) != 0
            ):
                if not isinstance(self.__values__[name][0], Struct):
                    self.__values__[name] = None

        arraypos, arrayname = None, None

        for i in range(len(self.__defs__)):
            sdef, size, attrs = self.__defs__[i], self.__sizes__[i], self.__attrs__[i]

            if sdef == Struct.string:
                size, offset, encoding, stripNulls, value = size
                if type(size) == type(b""):
                    size = self.__values__[size] + offset

                temp = data[pos : pos + size]
                if len(temp) != size:
                    raise StructException(
                        "Expected %i byte string, got %i" % (size, len(temp))
                    )

                if encoding != None:
                    temp = temp.decode(encoding)

                if stripNulls:
                    temp = temp.rstrip(b"\0")

                if attrs[0] == "*":
                    name = attrs[1:]
                    if self.__values__[name] == None:
                        self.__values__[name] = []
                    self.__values__[name].append(temp)
                else:
                    self.__values__[attrs] = temp
                pos += size
            elif sdef == Struct:
                if attrs[0] == "*":
                    if arrayname != attrs:
                        arrayname = attrs
                        arraypos = 0
                    name = attrs[1:]
                    self.__values__[attrs][arraypos].unpack(data, pos)
                    pos += len(self.__values__[attrs][arraypos])
                    arraypos += 1
                else:
                    self.__values__[attrs].unpack(data, pos)
                    pos += len(self.__values__[attrs])
            else:
                values = struct.unpack(self.__endian__ + sdef, data[pos : pos + size])
                pos += size
                j = 0
                for name in attrs:
                    if name[0] == "*":
                        name = name[1:]
                        if self.__values__[name] == None:
                            self.__values__[name] = []
                        self.__values__[name].append(values[j])
                    else:
                        self.__values__[name] = values[j]
                    j += 1

        return self

    def pack(self):
        arraypos, arrayname = None, None

        ret = b""
        for i in range(len(self.__defs__)):
            sdef, size, attrs = self.__defs__[i], self.__sizes__[i], self.__attrs__[i]

            if sdef == Struct.string:
                size, offset, encoding, stripNulls, value = size
                if type(size) == type(b""):
                    size = self.__values__[size] + offset

                if attrs[0] == "*":
                    if arrayname != attrs:
                        arraypos = 0
                        arrayname = attrs
                    temp = self.__values__[attrs[1:]][arraypos]
                    arraypos += 1
                else:
                    temp = self.__values__[attrs]

                if encoding != None:
                    temp = temp.encode(encoding)

                temp = temp[:size]
                ret += temp + (b"\0" * (size - len(temp)))
            elif sdef == Struct:
                if attrs[0] == "*":
                    if arrayname != attrs:
                        arraypos = 0
                        arrayname = attrs
                    ret += self.__values__[attrs[1:]][arraypos].pack()
                    arraypos += 1
                else:
                    ret += self.__values__[attrs].pack()
            else:
                values = []
                for name in attrs:
                    if name[0] == "*":
                        if arrayname != name:
                            arraypos = 0
                            arrayname = name
                        values.append(self.__values__[name[1:]][arraypos])
                        arraypos += 1
                    else:
                        values.append(self.__values__[name])

                ret += struct.pack(self.__endian__ + sdef, *values)
        return ret

    def __getitem__(self, value):
        return [("struct", self.__class__)] * value


def align(x, boundary):
    while x % boundary != 0:
        x += 1
    return x


def clamp(var, min, max):
    if var < min:
        var = min
    if var > max:
        var = max
    return var


def abs(var):
    if var < 0:
        var = var + (2 * var)
    return var


def hexdump(s, sep=" "):  # just dumps hex values
    if s and isinstance(s[0], int):
        return sep.join(["%02x" % x for x in s])
    else:
        return sep.join(["%02x" % ord(x) for x in s])


def hexdump2(src, length=16):  # dumps to a "hex editor" style output
    result = []
    for i in range(0, len(src), length):
        s = src[i : i + length]
        if len(s) % 4 == 0:
            mod = 0
        else:
            mod = 1
        hexa = ""
        for j in range((len(s) // 4) + mod):
            if s and isinstance(s[0], int):
                hexa += " ".join(["%02X" % x for x in s[j * 4 : j * 4 + 4]])
            else:
                hexa += " ".join(["%02X" % ord(x) for x in s[j * 4 : j * 4 + 4]])
            if j != ((len(s) // 4) + mod) - 1:
                hexa += "  "
        printable = s.translate(
            "".join([(len(repr(chr(x))) == 3) and chr(x) or "." for x in range(256)])
        )
        result.append("0x%04X   %-*s   %s\n" % (i, (length * 3) + 2, hexa, printable))
    return "".join(result)


class Crypto(object):
    """This is a Cryptographic/hash class used to abstract away things (to make changes easier)"""

    align = 64

    def decryptData(self, key, iv, data, align=True):
        """Decrypts some data (aligns to 64 bytes, if needed)."""
        if (len(data) % self.align) != 0 and align:
            return AES.new(key, AES.MODE_CBC, iv).decrypt(
                data + (b"\x00" * (self.align - (len(data) % self.align)))
            )
        else:
            return AES.new(key, AES.MODE_CBC, iv).decrypt(data)

    decryptData = classmethod(decryptData)

    def encryptData(self, key, iv, data, align=True):
        """Encrypts some data (aligns to 64 bytes, if needed)."""
        if (len(data) % self.align) != 0 and align:
            return AES.new(key, AES.MODE_CBC, iv).encrypt(
                data + (b"\x00" * (self.align - (len(data) % self.align)))
            )
        else:
            return AES.new(key, AES.MODE_CBC, iv).encrypt(data)

    encryptData = classmethod(encryptData)

    def decryptContent(self, titlekey, idx, data):
        """Decrypts a Content."""
        iv = struct.pack(">H", idx) + b"\x00" * 14
        return self.decryptData(titlekey, iv, data)

    decryptContent = classmethod(decryptContent)

    def decryptTitleKey(self, commonkey, tid, enckey):
        """Decrypts a Content."""
        iv = struct.pack(">Q", tid) + b"\x00" * 8
        return self.decryptData(commonkey, iv, enckey, False)

    decryptTitleKey = classmethod(decryptTitleKey)

    def encryptContent(self, titlekey, idx, data):
        """Encrypts a Content."""
        iv = struct.pack(">H", idx) + b"\x00" * 14
        return self.encryptData(titlekey, iv, data)

    encryptContent = classmethod(encryptContent)

    def createSHAHash(self, data):  # tested WORKING (without padding)
        return hashlib.sha1(data).digest()

    createSHAHash = classmethod(createSHAHash)

    def createSHAHashHex(self, data):
        return hashlib.sha1(data).hexdigest()

    createSHAHashHex = classmethod(createSHAHashHex)

    def createMD5HashHex(self, data):
        return hashlib.md5(data).hexdigest()

    createMD5HashHex = classmethod(createMD5HashHex)

    def createMD5Hash(self, data):
        return hashlib.md5(data).digest()

    createMD5Hash = classmethod(createMD5Hash)

    def validateSHAHash(self, data, hash):
        contentHash = hashlib.sha1(data).digest()
        return 1

    validateSHAHash = classmethod(validateSHAHash)


class WiiObject(object):
    def load(cls, data, *args, **kwargs):
        self = cls()
        self._load(data, *args, **kwargs)
        return self

    load = classmethod(load)

    def loadFile(cls, filename, *args, **kwargs):
        return cls.load(open(filename, "rb").read(), *args, **kwargs)

    loadFile = classmethod(loadFile)

    def dump(self, *args, **kwargs):
        return self._dump(*args, **kwargs)

    def dumpFile(self, filename, *args, **kwargs):
        open(filename, "wb").write(self.dump(*args, **kwargs))
        return filename


class WiiArchive(WiiObject):
    def loadDir(cls, dirname):
        self = cls()
        self._loadDir(dirname)
        return self

    loadDir = classmethod(loadDir)

    def dumpDir(self, dirname):
        if not os.path.isdir(dirname):
            os.mkdir(dirname)
        self._dumpDir(dirname)
        return dirname


class WiiHeader(object):
    def __init__(self, data):
        self.data = data

    def addFile(self, filename):
        open(filename, "wb").write(self.add())

    def removeFile(self, filename):
        open(filename, "wb").write(self.remove())

    def loadFile(cls, filename, *args, **kwargs):
        return cls(open(filename, "rb").read(), *args, **kwargs)

    loadFile = classmethod(loadFile)


def flatten(myTuple):
    if len(myTuple) == 4:
        return myTuple[0] << 0 | myTuple[1] << 8 | myTuple[2] << 16 | myTuple[3] << 24
    else:
        return myTuple[0] << 0 | myTuple[1] << 8 | myTuple[2] << 16 | 0xFF << 24


def round_up(x, n):
    left = x % n
    return x + left


def avg(w0, w1, c0, c1):
    a0 = c0 >> 11
    a1 = c1 >> 11
    a = int((w0 * a0 + w1 * a1) / (w0 + w1))
    c = (int(a) << 11) & 0xFFFF

    a0 = (c0 >> 5) & 63
    a1 = (c1 >> 5) & 63
    a = int((w0 * a0 + w1 * a1) / (w0 + w1))
    c = c | ((a << 5) & 0xFFFF)

    a0 = c0 & 31
    a1 = c1 & 31
    a = int((w0 * a0 + w1 * a1) / (w0 + w1))
    c = c | a

    return c


class TPL:
    """This is the class to generate TPL texutres from PNG images, and to convert TPL textures to PNG images. The parameter file specifies the filename of the source, either a PNG image or a TPL image.

    Currently supported are the following formats to convert from TPL (all formats): RGBA8, RGB565, RGB5A3, I4, IA4, I8, IA8, CI4, CI8, CMP, CI14X2.

    Currently supported to convert to TPL: I4, I8, IA4, IA8, RBG565, RBGA8, RGB5A3. Currently not supported are CI4, CI8, CMP, CI14X2.
    """

    class TPLHeader(Struct):
        __endian__ = Struct.BE

        def __format__(self):
            self.magic = Struct.uint32
            self.ntextures = Struct.uint32
            self.header_size = Struct.uint32

    class TPLTexture(Struct):
        __endian__ = Struct.BE

        def __format__(self):
            self.header_offset = Struct.uint32
            self.palette_offset = Struct.uint32

    class TPLTextureHeader(Struct):
        __endian__ = Struct.BE

        def __format__(self):
            self.height = Struct.uint16
            self.width = Struct.uint16
            self.format = Struct.uint32
            self.data_off = Struct.uint32
            self.wrap = Struct.uint32[2]
            self.filter = Struct.uint32[2]
            self.lod_bias = Struct.float
            self.edge_lod = Struct.uint8
            self.min_lod = Struct.uint8
            self.max_lod = Struct.uint8
            self.unpacked = Struct.uint8

    class TPLPaletteHeader(Struct):
        __endian__ = Struct.BE

        def __format__(self):
            self.nitems = Struct.uint16
            self.unpacked = Struct.uint8
            self.pad = Struct.uint8
            self.format = Struct.uint32
            self.offset = Struct.uint32

    def __init__(self, file):
        if not (b"\x00" in file) and os.path.isfile(file):
            self.file = file
            self.data = None
        else:
            self.file = None
            self.data = file

    def toTPL(
        self, outfile, xxx_todo_changeme=(None, None), format="RGBA8"
    ):  # single texture only
        """This converts an image into a TPL. The image is specified as the file parameter to the class initializer, while the output filename is specified here as the parameter outfile. Width and height are optional parameters and specify the size to resize the image to, if needed. Returns the output filename.

        This only can create TPL images with a single texture."""
        (width, height) = xxx_todo_changeme
        head = self.TPLHeader()
        head.magic = 0x0020AF30
        head.ntextures = 1
        head.header_size = 0x0C

        tex = self.TPLTexture()
        tex.header_offset = 0x14
        tex.pallete_offset = 0

        img = Image.open(self.file)
        theWidth, theHeight = img.size
        if (
            width != None
            and height != None
            and (width != theWidth or height != theHeight)
        ):
            img = img.resize((width, height), Image.ANTIALIAS)
        w, h = img.size

        texhead = self.TPLTextureHeader()
        texhead.height = h
        texhead.width = w
        if format == "I4":
            texhead.format = 0
            tpldata = self.toI4((w, h), img)
        elif format == "I8":
            texhead.format = 1
            tpldata = self.toI8((w, h), img)
        elif format == "IA4":
            texhead.format = 2
            tpldata = self.toIA4((w, h), img)
        elif format == "IA8":
            texhead.format = 3
            tpldata = self.toIA8((w, h), img)
        elif format == "RGB565":
            texhead.format = 4
            tpldata = self.toRGB565((w, h), img)
        elif format == "RGB5A3":
            texhead.format = 5
            tpldata = self.toRGB5A3((w, h), img)
        elif format == "RGBA8":
            texhead.format = 6
            tpldata = self.toRGBA8((w, h), img)
        elif format == "CI4":
            texhead.format = 8
            """ ADD toCI4 """
            raise Exception("toCI4 not done")
            # tpldata = self.toCI4((w, h), img)
        elif format == "CI8":
            texhead.format = 9
            """ ADD toCI8 """
            raise Exception("toCI8 not done")
            # tpldata = self.toCI8((w, h), img)
        elif format == "CI14X2":
            texhead.format = 10
            """ ADD toCI14X2 """
            raise Exception("toCI14X2 not done")
            # tpldata = self.toCI14X2((w, h), img)
        elif format == "CMP":
            texhead.format = 14
            """ ADD toCMP """
            raise Exception("toCMP not done")
            # tpldata = self.toCMP((w, h), img)

        texhead.data_off = 0x14 + len(texhead)
        texhead.wrap = [0, 0]
        texhead.filter = [1, 1]
        texhead.lod_bias = 0
        texhead.edge_lod = 0
        texhead.min_lod = 0
        texhead.max_lod = 0
        texhead.unpacked = 0

        f = open(outfile, "wb")
        f.write(head.pack())
        f.write(tex.pack())
        f.write(texhead.pack())
        if format == "I4":
            f.write(
                struct.pack(">" + str(align(w, 8) * align(h, 8) / 2) + "B", *tpldata)
            )
        if format == "I8":
            f.write(
                struct.pack(">" + str(align(w, 8) * align(h, 4) * 1) + "B", *tpldata)
            )
        if format == "IA4":
            f.write(
                struct.pack(">" + str(align(w, 8) * align(h, 4) * 1) + "B", *tpldata)
            )
        if format == "IA8":
            f.write(
                struct.pack(">" + str(align(w, 4) * align(h, 4) * 1) + "H", *tpldata)
            )
        if format == "RGB565":
            f.write(
                struct.pack(">" + str(align(w, 4) * align(h, 4) * 1) + "H", *tpldata)
            )
        if format == "RGB5A3":
            f.write(
                struct.pack(">" + str(align(w, 4) * align(h, 4) * 1) + "H", *tpldata)
            )
        if format == "RGBA8":
            f.write(
                struct.pack(">" + str(align(w, 4) * align(h, 4) * 4) + "B", *tpldata)
            )
        if format == "CI4":
            """ADD toCI4"""
            # f.write(struct.pack(">"+ str(align(w,4) * align(h,4) * 4) + "B", *tpldata))
        if format == "CI8":
            """ADD toCI8"""
            # f.write(struct.pack(">"+ str(align(w,4) * align(h,4) * 4) + "B", *tpldata))
        if format == "CI14X2":
            """ADD toCI14X2"""
            # f.write(struct.pack(">"+ str(align(w,4) * align(h,4) * 4) + "B", *tpldata))
        if format == "CMP":
            """ADD toCMP"""
            # f.write(struct.pack(">"+ str(align(w,4) * align(h,4) * 4) + "B", *tpldata))
        f.close()

        return outfile

    def toI4(self, xxx_todo_changeme1, img):
        (w, h) = xxx_todo_changeme1
        out = [0 for i in range(align(w, 8) * align(h, 8) / 2)]
        outp = 0
        inp = list(img.getdata())
        for y1 in range(0, h, 8):
            for x1 in range(0, w, 8):
                for y in range(y1, y1 + 8, 1):
                    for x in range(x1, x1 + 8, 2):
                        if x >= w or y >= h:
                            newpixel = 0
                        else:
                            rgba = flatten(inp[x + y * w])
                            r = (rgba >> 0) & 0xFF
                            g = (rgba >> 8) & 0xFF
                            b = (rgba >> 16) & 0xFF
                            i1 = ((r + g + b) / 3) & 0xFF
                            rgba = flatten(inp[x + 1 + y * w])
                            r = (rgba >> 0) & 0xFF
                            g = (rgba >> 8) & 0xFF
                            b = (rgba >> 16) & 0xFF
                            i2 = ((r + g + b) / 3) & 0xFF

                            newpixel = ((i1 * 15) / 255) << 4
                            newpixel |= ((i2 * 15) / 255) & 0xF
                        out[outp] = newpixel
                        outp += 1
        return out

    def toI8(self, xxx_todo_changeme2, img):
        (w, h) = xxx_todo_changeme2
        out = [0 for i in range(align(w, 8) * align(h, 4))]
        outp = 0
        inp = list(img.getdata())
        for y1 in range(0, h, 4):
            for x1 in range(0, w, 8):
                for y in range(y1, y1 + 4, 1):
                    for x in range(x1, x1 + 8, 1):
                        if x >= w or y >= h:
                            i1 = 0
                        else:
                            rgba = flatten(inp[x + (y * w)])
                            r = (rgba >> 0) & 0xFF
                            g = (rgba >> 8) & 0xFF
                            b = (rgba >> 16) & 0xFF
                            i1 = ((r + g + b) / 3) & 0xFF
                        out[outp] = i1
                        outp += 1
        return out

    def toIA4(self, xxx_todo_changeme3, img):
        (w, h) = xxx_todo_changeme3
        out = [0 for i in range(align(w, 8) * align(h, 4))]
        outp = 0
        inp = list(img.getdata())
        for y1 in range(0, h, 4):
            for x1 in range(0, w, 8):
                for y in range(y1, y1 + 4, 1):
                    for x in range(x1, x1 + 8, 1):
                        if x >= w or y >= h:
                            newpixel = 0
                        else:
                            rgba = flatten(inp[x + (y * w)])
                            r = (rgba >> 0) & 0xFF
                            g = (rgba >> 8) & 0xFF
                            b = (rgba >> 16) & 0xFF
                            i1 = ((r + g + b) / 3) & 0xFF
                            a1 = (rgba >> 24) & 0xFF

                            newpixel = ((i1 * 15) / 255) & 0xF
                            newpixel = newpixel | (((a1 * 15) / 255) << 4)
                        out[outp] = newpixel
                        outp += 1
        return out

    def toIA8(self, xxx_todo_changeme4, img):
        (w, h) = xxx_todo_changeme4
        out = [0 for i in range(align(w, 4) * align(h, 4))]
        outp = 0
        inp = list(img.getdata())
        for y1 in range(0, h, 4):
            for x1 in range(0, w, 4):
                for y in range(y1, y1 + 4, 1):
                    for x in range(x1, x1 + 4, 1):
                        if x >= w or y >= h:
                            newpixel = 0
                        else:
                            rgba = flatten(inp[x + (y * w)])
                            r = (rgba >> 0) & 0xFF
                            g = (rgba >> 8) & 0xFF
                            b = (rgba >> 16) & 0xFF
                            i1 = ((r + g + b) / 3) & 0xFF
                            a1 = (rgba >> 24) & 0xFF

                            newpixel = i1 << 8
                            newpixel = newpixel | a1
                        out[outp] = newpixel
                        outp += 1
        return out

    def toRGB565(self, xxx_todo_changeme5, img):
        (w, h) = xxx_todo_changeme5
        out = [0 for i in range(align(w, 4) * align(h, 4))]
        outp = 0
        inp = img.getdata()
        for y1 in range(0, h, 4):
            for x1 in range(0, w, 4):
                for y in range(y1, y1 + 4, 1):
                    for x in range(x1, x1 + 4, 1):
                        newpixel = 0
                        if x >= w or y >= h:
                            newpixel = 0
                        else:
                            rgba = flatten(inp[x + y * w])
                            r = (rgba >> 16) & 0xFF
                            g = (rgba >> 8) & 0xFF
                            b = (rgba >> 0) & 0xFF
                            newpixel = (
                                ((b >> 3) << 11) | ((g >> 2) << 5) | ((r >> 3) << 0)
                            )
                        out[outp] = newpixel
                        outp += 1
        return out

    def toRGB5A3(self, xxx_todo_changeme6, img):
        (w, h) = xxx_todo_changeme6
        out = [0 for i in range(align(w, 4) * align(h, 4))]
        outp = 0
        inp = list(img.getdata())
        for y1 in range(0, h, 4):
            for x1 in range(0, w, 4):
                for y in range(y1, y1 + 4, 1):
                    for x in range(x1, x1 + 4, 1):
                        newpixel = 0
                        if x >= w or y >= h:
                            newpixel = 0
                        else:
                            rgba = flatten(inp[x + (y * w)])
                            r = (rgba >> 0) & 0xFF
                            g = (rgba >> 8) & 0xFF
                            b = (rgba >> 16) & 0xFF
                            a = (rgba >> 24) & 0xFF
                            if a <= 0xDA:
                                newpixel &= ~(1 << 15)
                                r = ((r * 15) / 255) & 0xF
                                g = ((g * 15) / 255) & 0xF
                                b = ((b * 15) / 255) & 0xF
                                a = ((a * 7) / 255) & 0x7
                                # newpixel |= r << 12
                                # newpixel |= g << 8
                                # newpixel |= b << 4
                                # newpixel |= a << 0
                                newpixel |= a << 12
                                newpixel |= b << 0
                                newpixel |= g << 4
                                newpixel |= r << 8
                            else:
                                newpixel |= 1 << 15
                                r = ((r * 31) / 255) & 0x1F
                                g = ((g * 31) / 255) & 0x1F
                                b = ((b * 31) / 255) & 0x1F
                                newpixel |= b << 0
                                newpixel |= g << 5
                                newpixel |= r << 10
                        out[outp] = newpixel
                        outp += 1
        return out

    def toRGBA8(self, xxx_todo_changeme7, img):
        (w, h) = xxx_todo_changeme7
        out = [0 for i in range(align(w, 4) * align(h, 4) * 4)]
        inp = list(img.getdata())
        iv = 0
        z = 0
        lr = [0 for i in range(32)]
        lg = [0 for i in range(32)]
        lb = [0 for i in range(32)]
        la = [0 for i in range(32)]
        for y1 in range(0, h, 4):
            for x1 in range(0, w, 4):
                for y in range(y1, y1 + 4, 1):
                    for x in range(x1, x1 + 4, 1):
                        if y >= h or x >= w:
                            lr[z] = 0
                            lg[z] = 0
                            lb[z] = 0
                            la[z] = 0
                        else:
                            rgba = flatten(inp[x + (y * w)])
                        lr[z] = (rgba >> 0) & 0xFF
                        lg[z] = (rgba >> 8) & 0xFF
                        lb[z] = (rgba >> 16) & 0xFF
                        la[z] = (rgba >> 24) & 0xFF
                        z += 1
                if z == 16:
                    for i in range(16):
                        out[iv] = la[i] & 0xFF
                        iv += 1
                        out[iv] = lr[i] & 0xFF
                        iv += 1
                    for i in range(16):
                        out[iv] = lg[i] & 0xFF
                        iv += 1
                        out[iv] = lb[i] & 0xFF
                        iv += 1
                    z = 0
        return out

    def toImage(self):
        if self.file:
            data = open(self.file, "rb").read()
        else:
            data = self.data

        header = self.TPLHeader()
        textures = []
        pos = 0

        header.unpack(data[pos : pos + len(header)])
        pos += len(header)

        palette_offsets = []

        for i in range(header.ntextures):
            tmp = self.TPLTexture()
            tmp.unpack(data[pos : pos + len(tmp)])
            textures.append(tmp)
            pos += len(tmp)
            if tmp.palette_offset > 0:
                palette_offsets.append(tmp.palette_offset)

        if header.ntextures > 1:
            raise ValueError("Only one texture supported. Don't touch me!")

        for i in range(header.ntextures):
            head = textures[i]
            tex = self.TPLTextureHeader()
            tex.unpack(data[head.header_offset : head.header_offset + len(tex)])
            w = tex.width
            h = tex.height

            if tex.format == 0:  # I4, 4-bit
                tpldata = struct.unpack(
                    ">" + str((w * h) / 2) + "B",
                    data[tex.data_off : tex.data_off + ((w * h) / 2)],
                )
                rgbdata = self.I4((w, h), tpldata)

            elif tex.format == 1:  # I8, 8-bit
                tpldata = struct.unpack(
                    ">" + str(w * h) + "B",
                    data[tex.data_off : tex.data_off + (w * h * 1)],
                )
                rgbdata = self.I8((w, h), tpldata)
            elif tex.format == 2:  # IA4, 8-bit
                tpldata = struct.unpack(
                    ">" + str(w * h) + "B",
                    data[tex.data_off : tex.data_off + (w * h * 1)],
                )
                rgbdata = self.IA4((w, h), tpldata)

            elif tex.format == 4:  # RGB565, 16-bit
                tpldata = data[tex.data_off :]
                rgbdata = self.RGB565((w, h), tpldata)
            elif tex.format == 5:  # RGB5A3, 16-bit
                tpldata = data[tex.data_off :]
                rgbdata = self.RGB5A3((w, h), tpldata)
            elif tex.format == 3:  # IA8, 16-bit
                tpldata = data[tex.data_off :]
                rgbdata = self.IA8((w, h), tpldata)

            elif (
                tex.format == 6
            ):  # RGBA8, 32-bit, but for easyness's sake lets do it with 16-bit
                tpldata = data[tex.data_off :]
                rgbdata = self.RGBA8((w, h), tpldata)

            elif tex.format == 8 or tex.format == 9 or tex.format == 10:
                palhead = self.TPLPaletteHeader()
                offs = palette_offsets.pop(0)
                palhead.unpack(data[offs : offs + len(palhead)])

                tpldata = struct.unpack(
                    ">" + str(palhead.nitems) + "H",
                    data[palhead.offset : palhead.offset + (palhead.nitems * 2)],
                )
                palette_data = b""
                if palhead.format == 0:
                    palette_data = self.IA8((palhead.nitems, 1), tpldata)[0]
                elif palhead.format == 1:
                    palette_data = self.RGB565((palhead.nitems, 1), tpldata)[0]
                elif palhead.format == 2:
                    palette_data = self.RGB5A3((palhead.nitems, 1), tpldata)[0]

                paldata = []
                for i in range(0, palhead.nitems * 4, 4):
                    tmp = 0
                    tmp |= palette_data[i + 0] << 24
                    tmp |= palette_data[i + 1] << 16
                    tmp |= palette_data[i + 2] << 8
                    tmp |= palette_data[i + 3] << 0
                    paldata.append(tmp)

                if tex.format == 8:
                    tpldata = struct.unpack(
                        ">" + str((w * h) / 2) + "B",
                        data[tex.data_off : tex.data_off + ((w * h) / 2)],
                    )
                    rgbdata = self.CI4((w, h), tpldata, paldata)
                if tex.format == 9:
                    tpldata = struct.unpack(
                        ">" + str(w * h) + "B",
                        data[tex.data_off : tex.data_off + (w * h * 1)],
                    )
                    rgbdata = self.CI8((w, h), tpldata, paldata)
                if tex.format == 10:
                    tpldata = struct.unpack(
                        ">" + str(w * h) + "H",
                        data[tex.data_off : tex.data_off + (w * h * 2)],
                    )
                    rgbdata = self.CI14X2((w, h), tpldata, paldata)
            elif tex.format == 14:
                tpldata = b"".join([data[tex.data_off :]])

                rgbdata = self.CMP((w, h), tpldata)
            else:
                raise TypeError("Unsupported TPL Format: " + str(tex.format))

        output = Image.frombytes("RGBA", (w, h), rgbdata).convert("RGB")
        return output

    def getSizes(self):
        """This returns a tuple containing the width and height of the TPL image filename in the class initializer. Will only return the size of single textured TPL images."""
        if self.file:
            data = open(self.file, "rb").read()
        else:
            data = self.data

        header = self.TPLHeader()
        textures = []
        pos = 0

        header.unpack(data[pos : pos + len(header)])
        pos += len(header)

        for i in range(header.ntextures):
            tmp = self.TPLTexture()
            tmp.unpack(data[pos : pos + len(tmp)])
            textures.append(tmp)
            pos += len(tmp)

        for i in range(header.ntextures):
            head = textures[i]
            tex = self.TPLTextureHeader()
            tex.unpack(data[head.header_offset : head.header_offset + len(tex)])
            w = tex.width
            h = tex.height
        return (w, h)

    def RGBA8(self, xxx_todo_changeme8, data):
        (x, y) = xxx_todo_changeme8
        out = [0 for i in range(x * y)]
        inp = 0
        for i in range(0, y, 4):
            for j in range(0, x, 4):
                for k in range(2):
                    for l in range(i, i + 4, 1):
                        for m in range(j, j + 4, 1):
                            texel = Struct.uint8(data[inp : inp + 1], endian=">")
                            inp += 1
                            texel2 = Struct.uint8(data[inp : inp + 1], endian=">")
                            inp += 1
                            if (m >= x) or (l >= y):
                                continue
                            if k == 0:  # ARARARAR
                                a = (texel) & 0xFF
                                r = (texel2) & 0xFF
                                out[m + (l * x)] |= (r << 0) | (a << 24)
                            else:  # GBGBGBGB
                                g = (texel) & 0xFF
                                b = (texel2) & 0xFF
                                out[m + (l * x)] |= (g << 8) | (b << 16)
        return b"".join(Struct.uint32(p) for p in out)

    def RGB5A3(self, xxx_todo_changeme9, jar):
        (w, h) = xxx_todo_changeme9
        out = [0 for i in range(w * h)]
        i = 0
        for y in range(0, h, 4):
            for x in range(0, w, 4):
                for y1 in range(y, y + 4):
                    for x1 in range(x, x + 4):
                        pixel = Struct.uint16(jar[i * 2 : i * 2 + 2], endian=">")
                        i += 1

                        if y1 >= h or x1 >= w:
                            continue

                        if pixel & (1 << 15):  # RGB555
                            b = (((pixel >> 10) & 0x1F) * 255) / 31
                            g = (((pixel >> 5) & 0x1F) * 255) / 31
                            r = (((pixel >> 0) & 0x1F) * 255) / 31
                            a = 255
                        else:  # RGB4A3
                            a = (((pixel >> 12) & 0x07) * 255) / 7
                            b = (((pixel >> 8) & 0x0F) * 255) / 15
                            g = (((pixel >> 4) & 0x0F) * 255) / 15
                            r = (((pixel >> 0) & 0x0F) * 255) / 15

                        rgba = (r << 16) | (g << 8) | (b << 0) | (a << 24)
                        out[(y1 * w) + x1] = rgba
        return b"".join(Struct.uint32(p) for p in out)

    def RGB565(self, xxx_todo_changeme10, jar):
        (w, h) = xxx_todo_changeme10
        out = [0 for i in range(w * h)]
        i = 0
        for y in range(0, h, 4):
            for x in range(0, w, 4):
                for y1 in range(y, y + 4):
                    for x1 in range(x, x + 4):
                        pixel = Struct.uint16(jar[i * 2 : i * 2 + 2], endian=">")
                        i += 1

                        if y1 >= h or x1 >= w:
                            continue

                        b = (((pixel >> 11) & 0x1F) << 3) & 0xFF
                        g = (((pixel >> 5) & 0x3F) << 2) & 0xFF
                        r = (((pixel >> 0) & 0x1F) << 3) & 0xFF
                        a = 255

                        rgba = (r << 16) | (g << 8) | (b << 0) | (a << 24)
                        out[y1 * w + x1] = rgba
        return b"".join(Struct.uint32(p) for p in out)

    def I4(self, xxx_todo_changeme11, jar):
        (w, h) = xxx_todo_changeme11
        out = [0 for i in range(w * h)]
        i = 0
        for y in range(0, h, 8):
            for x in range(0, w, 8):
                for y1 in range(y, y + 8):
                    for x1 in range(x, x + 8, 2):
                        pixel = jar[i]

                        if y1 >= h or x1 >= w:
                            continue

                        r = (pixel >> 4) * 255 / 15
                        g = (pixel >> 4) * 255 / 15
                        b = (pixel >> 4) * 255 / 15
                        a = (pixel >> 4) * 255 / 15

                        rgba = (r << 0) | (g << 8) | (b << 16) | (a << 24)
                        out[y1 * w + x1] = rgba

                        pixel = jar[i]
                        i += 1

                        if y1 >= h or x1 >= w:
                            continue

                        r = (pixel & 0x0F) * 255 / 15
                        g = (pixel & 0x0F) * 255 / 15
                        b = (pixel & 0x0F) * 255 / 15
                        a = (pixel & 0x0F) * 255 / 15

                        rgba = (r << 0) | (g << 8) | (b << 16) | (a << 24)
                        out[y1 * w + x1 + 1] = rgba
        return b"".join(Struct.uint32(p) for p in out)

    def IA4(self, xxx_todo_changeme12, jar):
        (w, h) = xxx_todo_changeme12
        out = [0 for i in range(w * h)]
        i = 0
        for y in range(0, h, 4):
            for x in range(0, w, 8):
                for y1 in range(y, y + 4):
                    for x1 in range(x, x + 8):
                        pixel = jar[i]
                        i += 1

                        if y1 >= h or x1 >= w:
                            continue

                        r = ((pixel & 0x0F) * 255 / 15) & 0xFF
                        g = ((pixel & 0x0F) * 255 / 15) & 0xFF
                        b = ((pixel & 0x0F) * 255 / 15) & 0xFF
                        a = (((pixel >> 4) * 255) / 15) & 0xFF

                        rgba = (r << 0) | (g << 8) | (b << 16) | (a << 24)
                        out[y1 * w + x1] = rgba
        return b"".join(Struct.uint32(p) for p in out)

    def I8(self, xxx_todo_changeme13, jar):
        (w, h) = xxx_todo_changeme13
        out = [0 for i in range(w * h)]
        i = 0
        for y in range(0, h, 4):
            for x in range(0, w, 8):
                for y1 in range(y, y + 4):
                    for x1 in range(x, x + 8):
                        pixel = jar[i]
                        i += 1

                        if y1 >= h or x1 >= w:
                            continue

                        r = pixel
                        g = pixel
                        b = pixel
                        a = 255

                        rgba = (r << 0) | (g << 8) | (b << 16) | (a << 24)
                        out[y1 * w + x1] = rgba
        return b"".join(Struct.uint32(p) for p in out)

    def IA8(self, xxx_todo_changeme14, jar):
        (w, h) = xxx_todo_changeme14
        out = [0 for i in range(w * h)]
        i = 0
        for y in range(0, h, 4):
            for x in range(0, w, 4):
                for y1 in range(y, y + 4):
                    for x1 in range(x, x + 4):
                        pixel = Struct.uint16(jar[i * 2 : i * 2 + 2], endian=">")
                        i += 1

                        if y1 >= h or x1 >= w:
                            continue

                        r = pixel >> 8
                        g = pixel >> 8
                        b = pixel >> 8
                        a = pixel & 0xFF

                        rgba = (r << 0) | (g << 8) | (b << 16) | (a << 24)
                        out[y1 * w + x1] = rgba
        return b"".join(Struct.uint32(p) for p in out)

    def CI4(self, xxx_todo_changeme15, jar, pal):
        (w, h) = xxx_todo_changeme15
        out = [0 for i in range(w * h)]
        i = 0
        for y in range(0, h, 8):
            for x in range(0, w, 8):
                for y1 in range(y, y + 8):
                    for x1 in range(x, x + 8, 2):
                        if y1 >= h or x1 >= w:
                            continue
                        pixel = jar[i]

                        r = (pal[pixel] & 0xFF000000) >> 24
                        g = (pal[pixel] & 0x00FF0000) >> 16
                        b = (pal[pixel] & 0x0000FF00) >> 8
                        a = (pal[pixel] & 0x000000FF) >> 0

                        rgba = (r << 0) | (g << 8) | (b << 16) | (a << 24)
                        out[y1 * w + x1] = rgba

                        if y1 >= h or x1 >= w:
                            continue
                        pixel = jar[i]
                        i += 1

                        r = (pal[pixel] & 0xFF000000) >> 24
                        g = (pal[pixel] & 0x00FF0000) >> 16
                        b = (pal[pixel] & 0x0000FF00) >> 8
                        a = (pal[pixel] & 0x000000FF) >> 0

                        rgba = (r << 0) | (g << 8) | (b << 16) | (a << 24)
                        out[y1 * w + x1 + 1] = rgba
        return b"".join(Struct.uint32(p) for p in out)

    def CI8(self, xxx_todo_changeme16, jar, pal):
        (w, h) = xxx_todo_changeme16
        out = [0 for i in range(w * h)]
        i = 0
        for y in range(0, h, 4):
            for x in range(0, w, 8):
                for y1 in range(y, y + 4):
                    for x1 in range(x, x + 8):
                        if y1 >= h or x1 >= w:
                            continue
                        pixel = jar[i]
                        i += 1

                        r = (pal[pixel] & 0xFF000000) >> 24
                        g = (pal[pixel] & 0x00FF0000) >> 16
                        b = (pal[pixel] & 0x0000FF00) >> 8
                        a = (pal[pixel] & 0x000000FF) >> 0

                        rgba = (r << 0) | (g << 8) | (b << 16) | (a << 24)
                        out[y1 * w + x1] = rgba
        return b"".join(Struct.uint32(p) for p in out)

    def CMP(self, xxx_todo_changeme17, data):
        (w, h) = xxx_todo_changeme17
        temp = [0 for i in range(w * h)]
        pix = [0, 0, 0]
        c = [0, 0, 0, 0]
        outp = 0
        for y in range(h):
            for x in range(w):
                ww = round_up(w, 8)

                x0 = x & 0x03
                x1 = (x >> 2) & 0x01
                x2 = x >> 3

                y0 = y & 0x03
                y1 = (y >> 2) & 0x01
                y2 = y >> 3

                off = (8 * x1) + (16 * y1) + (32 * x2) + (4 * ww * y2)

                c[0] = Struct.uint16(data[off + 0 : off + 2], endian=">")
                c[1] = Struct.uint16(data[off + 2 : off + 4], endian=">")
                if c[0] > c[1]:
                    c[2] = avg(2, 1, c[0], c[1])
                    c[3] = avg(1, 2, c[0], c[1])
                else:
                    c[2] = avg(1, 1, c[0], c[1])
                    c[3] = 0

                px = Struct.uint32(data[off + 4 : off + 8], endian=">")
                ix = x0 + (4 * y0)
                raw = c[(px >> (30 - (2 * ix))) & 0x03]

                pix[0] = (raw >> 8) & 0xF8
                pix[1] = (raw >> 3) & 0xF8
                pix[2] = (raw << 3) & 0xF8

                temp[outp] = (
                    (pix[0] << 0) | (pix[1] << 8) | (pix[2] << 16) | (255 << 24)
                )
                outp += 1
        return b"".join(Struct.uint32(p) for p in temp)

    def CI14X2(self, xxx_todo_changeme18, jar, pal):
        (w, h) = xxx_todo_changeme18
        out = [0 for i in range(w * h)]
        i = 0
        for y in range(0, h, 4):
            for x in range(0, w, 4):
                for y1 in range(y, y + 4):
                    for x1 in range(x, x + 4):
                        if y1 >= h or x1 >= w:
                            continue
                        pixel = jar[i]
                        i += 1

                        r = (pal[pixel & 0x3FFF] & 0xFF000000) >> 24
                        g = (pal[pixel & 0x3FFF] & 0x00FF0000) >> 16
                        b = (pal[pixel & 0x3FFF] & 0x0000FF00) >> 8
                        a = (pal[pixel & 0x3FFF] & 0x000000FF) >> 0

                        rgba = (r << 0) | (g << 8) | (b << 16) | (a << 24)
                        out[y1 * w + x1] = rgba
        return b"".join(Struct.uint32(p) for p in out)

    def getFormat(self):
        if self.file:
            data = open(self.file, "rb").read()
        else:
            data = self.data

        header = self.TPLHeader()
        textures = []
        pos = 0

        header.unpack(data[pos : pos + len(header)])
        pos += len(header)

        palette_offsets = []

        for i in range(header.ntextures):
            tmp = self.TPLTexture()
            tmp.unpack(data[pos : pos + len(tmp)])
            textures.append(tmp)
            pos += len(tmp)
            if tmp.palette_offset > 0:
                palette_offsets.append(tmp.palette_offset)

        for i in range(header.ntextures):
            head = textures[i]
            tex = self.TPLTextureHeader()
            tex.unpack(data[head.header_offset : head.header_offset + len(tex)])

            if tex.format == 0:  # I4, 4-bit
                return "I4"
            elif tex.format == 1:  # I8, 8-bit
                return "I8"
            elif tex.format == 2:  # IA4, 8-bit
                return "IA4"
            elif tex.format == 4:  # RGB565, 16-bit
                return "RGB565"
            elif tex.format == 5:  # RGB5A3, 16-bit
                return "RGB5A3"
            elif tex.format == 3:  # IA8, 16-bit
                return "IA8"
            elif tex.format == 6:  # RGBA8, 32-bit
                return "RGBA8"
            elif tex.format == 8:
                return "CI4"
            elif tex.format == 9:
                return "CI8"
            elif tex.format == 10:
                return "CI14X2"
            elif tex.format == 14:
                return "CMP"
            else:
                raise TypeError("Unknown TPL Format: %d" % tex.format)


class PNG_WII:
    def __init__(
        self,
        path: str,
        header=bytes(
            [
                0x00,
                0x20,
                0xAF,
                0x30,
                0x00,
                0x00,
                0x00,
                0x01,
                0x00,
                0x00,
                0x00,
                0x0C,
                0x00,
                0x00,
                0x00,
                0x14,
                0x00,
                0x00,
                0x00,
                0x00,
                0x01,
                0x00,
                0x01,
                0x00,
                0x00,
                0x00,
                0x00,
                0x0E,
                0x00,
                0x00,
                0x00,
                0x40,
                0x00,
                0x00,
                0x00,
                0x00,
                0x00,
                0x00,
                0x00,
                0x00,
                0x00,
                0x00,
                0x00,
                0x01,
                0x00,
                0x00,
                0x00,
                0x01,
                0x00,
                0x00,
                0x00,
                0x00,
                0x00,
                0x00,
                0x00,
                0x00,
                0x00,
                0x00,
                0x00,
                0x00,
                0x00,
                0x00,
                0x00,
                0x00,
            ]
        ),
    ) -> None:
        self.data = open(path, "rb").read()
        self.hmx_header = self.data[0:32]
        self.tpl_header = header
        self.tpl = TPL(bytes(self.tpl_header + self.data[32:]))
