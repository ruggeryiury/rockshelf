from PIL import Image
from pathlib import Path

icon_path = Path('app/resources/rb3file.png').absolute()
dest_path = Path('app/resources/rb3file.ico').absolute()

img = Image.open(icon_path)

icon_sizes = [(16, 16), (32, 32), (48, 48), (64, 64), (128, 128), (256, 256)]
img.save(dest_path, format='ICO', sizes=icon_sizes)
