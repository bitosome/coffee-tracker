"""Verify the release contains one complete HACS integration and its matching card."""
import json
import os
import re
from pathlib import Path

root = Path(__file__).resolve().parents[1]
component = root / "custom_components/coffee_tracker"
read_json = lambda path: json.loads(path.read_text())
package = read_json(root / "package.json")
manifest = read_json(component / "manifest.json")
lock = read_json(root / "package-lock.json")
version = package["version"]
assert manifest["version"] == version, "Manifest/package version mismatch"
assert re.search(r'VERSION = "([^"]+)"', (component / "const.py").read_text()).group(1) == version
assert lock["version"] == version, "Lock/package version mismatch"
assert lock["packages"][""]["version"] == version
assert manifest["domain"] == "coffee_tracker"
assert manifest["config_flow"] is True
assert manifest["codeowners"] == ["@bitosome"]
assert [p.name for p in component.parent.iterdir() if p.is_dir() and not p.name.startswith("_")] == ["coffee_tracker"]
bundle = component / "www/coffee-tracker-card.js"
assert bundle.stat().st_size > 1000, "Bundled card is absent or empty"
assert "coffee-tracker-card" in bundle.read_text()
assert (component / "brand/icon.png").is_file()
assert (component / "translations/en.json").is_file()
assert (component / "services.yaml").is_file()
assert (root / "LICENSE").is_file()
assert (root / "src/shared/PROVENANCE.md").is_file()
hacs = read_json(root / "hacs.json")
assert not hacs.get("content_in_root")
assert not hacs.get("zip_release"), "Use the standard HACS integration repository layout"
if os.environ.get("GITHUB_REF_TYPE") == "tag":
    assert os.environ["GITHUB_REF_NAME"] == f"v{version}"
print(f"Coffee Tracker {version}: integration and bundled card package OK")
