"""Regenerate the small, code-drawn integration icon (optional Pillow dependency)."""
from pathlib import Path
from PIL import Image, ImageDraw

root = Path(__file__).resolve().parents[1]
scale = 4
image = Image.new("RGBA", (256 * scale, 256 * scale))
draw = ImageDraw.Draw(image)
def box(coords):
    return tuple(int(n * scale) for n in coords)

draw.rounded_rectangle(box((8, 8, 248, 248)), radius=56 * scale, fill="#292b40")
draw.rounded_rectangle(box((159, 93, 216, 160)), radius=23 * scale, outline="#c4aff5", width=12 * scale)
draw.rounded_rectangle(box((57, 90, 180, 190)), radius=29 * scale, fill="#d9dffd")
draw.rectangle(box((57, 90, 180, 132)), fill="#d9dffd")
draw.rounded_rectangle(box((46, 202, 199, 212)), radius=5 * scale, fill="#a0a9cc")
for x in (86, 119, 151):
    draw.line([box((x, 67)), box((x-5, 52)), box((x+2, 36))], fill="#c4aff5", width=7 * scale, joint="curve")
path = root / "custom_components/coffee_tracker/brand"
path.mkdir(parents=True, exist_ok=True)
for name, size in (("icon.png", 256), ("icon@2x.png", 512)):
    image.resize((size, size), Image.Resampling.LANCZOS).save(path / name)
