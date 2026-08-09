#!/usr/bin/env python3
"""
Process patient photos for the clinic site:
  1) Preserve the complete original photograph and original background
  2) Collapse oversized legacy censor blocks to a thin eye-level stripe
  3) Blur detected eyes when an existing block is not present
  4) Emit centered 4:5 portrait frames so the full face remains visible

Reads labeled files from assets/src/patients/ when present (M1B, M1A, …),
otherwise processes the canonical case-* / eval-* sources.
"""
from __future__ import annotations

import math
from pathlib import Path

import cv2
import numpy as np
from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "assets" / "src"
PATIENTS = SRC / "patients"
LUXE = SRC / "luxe"
LUXE.mkdir(parents=True, exist_ok=True)

OUT_W, OUT_H = 1080, 1350  # 4:5 portrait clinical media box


def luxe_background(w: int, h: int) -> Image.Image:
    """Luxe clinical interior — bone plaster, frosted glass and champagne light."""
    y = np.linspace(0, 1, h, dtype=np.float32)[:, None]
    x = np.linspace(0, 1, w, dtype=np.float32)[None, :]
    rng = np.random.default_rng(11)

    # Upper wall — warm plaster
    r = 236 - 10 * y
    g = 231 - 9 * y
    b = 222 - 8 * y

    # Soft marble veining (very light)
    vein = 0.5 + 0.5 * np.sin((x * 3.2 + y * 7.5) * math.pi + 0.4 * np.sin(x * 9))
    r = r + 6 * (vein - 0.5)
    g = g + 5 * (vein - 0.5)
    b = b + 4 * (vein - 0.5)

    # Smooth frosted-glass lower wall — no vertical pattern that could be
    # mistaken for an oversized privacy blur.
    glass = np.clip((y - 0.56) / 0.16, 0, 1)
    r = r * (1 - 0.3 * glass) + 205 * 0.3 * glass
    g = g * (1 - 0.3 * glass) + 208 * 0.3 * glass
    b = b * (1 - 0.3 * glass) + 210 * 0.3 * glass

    # Champagne cove / reveal at glass transition
    reveal = np.exp(-((y - 0.56) ** 2) / 0.00055)
    r = np.clip(r + 90 * reveal, 0, 255)
    g = np.clip(g + 68 * reveal, 0, 255)
    b = np.clip(b + 28 * reveal, 0, 255)

    # Recessed ceiling wash
    wash = np.exp(-((x - 0.78) ** 2) / 0.28 - ((y - 0.1) ** 2) / 0.16)
    r = np.clip(r + 36 * wash, 0, 255)
    g = np.clip(g + 26 * wash, 0, 255)
    b = np.clip(b + 10 * wash, 0, 255)

    # Left daylight wash
    win = np.exp(-((x - 0.06) ** 2) / 0.05 - ((y - 0.3) ** 2) / 0.4)
    r = np.clip(r + 24 * win, 0, 255)
    g = np.clip(g + 22 * win, 0, 255)
    b = np.clip(b + 18 * win, 0, 255)

    # Floor
    floor = np.clip((y - 0.86) / 0.14, 0, 1)
    r = r * (1 - 0.35 * floor) + 198 * 0.35 * floor
    g = g * (1 - 0.35 * floor) + 192 * 0.35 * floor
    b = b * (1 - 0.35 * floor) + 184 * 0.35 * floor

    cx, cy = x - 0.5, y - 0.42
    vig = 1 - 0.2 * np.clip(cx * cx * 3.0 + cy * cy * 2.4, 0, 1)
    rgb = np.dstack([r * vig, g * vig, b * vig]).astype(np.float32)
    soft = cv2.GaussianBlur(rgb.astype(np.uint8), (0, 0), 2.4)
    noise = rng.integers(-3, 4, size=soft.shape, dtype=np.int16)
    return Image.fromarray(np.clip(soft.astype(np.int16) + noise, 0, 255).astype(np.uint8), "RGB")


def find_black_bar(gray: np.ndarray) -> tuple[int, int] | None:
    """Return (y0, y1) of a solid black privacy bar, or None."""
    h, w = gray.shape
    row_dark = (gray < 28).mean(axis=1)
    # Contiguous runs of mostly-black rows; top-down shots often place the eye
    # bar low in frame, so inspect through 90% of the image.
    mask = row_dark > 0.55
    mask[int(h * 0.9) :] = False
    best = None
    i = 0
    while i < h:
        if not mask[i]:
            i += 1
            continue
        j = i
        while j < h and mask[j]:
            j += 1
        if j - i >= max(18, int(h * 0.035)):
            # Privacy bars may sit low in top-down clinical photographs.
            mid = (i + j) / 2 / h
            if 0.12 <= mid <= 0.86:
                best = (i, j)
                break
        i = j
    return best


def soften_privacy_bar(bgr: np.ndarray) -> np.ndarray:
    """Turn a solid black censor bar into a soft clinical privacy blur."""
    out = bgr.copy()
    gray = cv2.cvtColor(out, cv2.COLOR_BGR2GRAY)
    bar = find_black_bar(gray)
    if not bar:
        return out
    y0, y1 = bar
    pad = max(8, (y1 - y0) // 3)
    y0p, y1p = max(0, y0 - pad), min(out.shape[0], y1 + pad)
    # Inpaint the black core first
    core = np.zeros(gray.shape, np.uint8)
    core[y0:y1, :] = 255
    # Only inpaint where it's actually near-black
    core = cv2.bitwise_and(core, (gray < 40).astype(np.uint8) * 255)
    if core.any():
        out = cv2.inpaint(out, core, 7, cv2.INPAINT_TELEA)
    # Heavy gaussian privacy blur across the eye band
    band = out[y0p:y1p].copy()
    k = max(31, (y1p - y0p) // 2 * 2 + 1)
    k = min(k | 1, 99)
    blurred = cv2.GaussianBlur(band, (k, k), 0)
    blurred = cv2.GaussianBlur(blurred, (k, k), 0)
    # Feather edges
    hband = y1p - y0p
    alpha = np.ones((hband, 1, 1), np.float32)
    feather = max(6, hband // 5)
    for i in range(feather):
        a = (i + 1) / (feather + 1)
        alpha[i, 0, 0] = a
        alpha[-(i + 1), 0, 0] = a
    blend = (
        blurred.astype(np.float32) * alpha + out[y0p:y1p].astype(np.float32) * (1 - alpha)
    ).astype(np.uint8)
    out[y0p:y1p] = blend
    return out


def _blur_rect(out: np.ndarray, x0: int, y0: int, x1: int, y1: int) -> None:
    roi = out[y0:y1, x0:x1]
    if roi.size == 0:
        return
    k = max(21, (min(roi.shape[:2]) // 2) | 1)
    k = min(k, 91)
    out[y0:y1, x0:x1] = cv2.GaussianBlur(cv2.GaussianBlur(roi, (k, k), 0), (k, k), 0)


def replace_black_bar(
    bgr: np.ndarray, bar: tuple[int, int]
) -> tuple[np.ndarray, tuple[int, int]]:
    """Collapse an oversized legacy censor bar to a true eye-height band.

    Pixels hidden by the source's large black rectangle do not exist and cannot
    honestly be recovered. Removing that dead band and joining forehead to the
    visible lower face preserves the real photograph; a narrow stripe marks the
    privacy seam without inventing eyes.
    """
    y0, y1 = bar
    h, w = bgr.shape[:2]
    stripe_h = max(30, int(h * 0.045))
    upper = bgr[max(0, y0 - 4) : y0].mean(axis=0)
    lower = bgr[y1 : min(h, y1 + 4)].mean(axis=0)
    bridge = np.empty((stripe_h, w, 3), np.uint8)
    for i in range(stripe_h):
        t = (i + 1) / (stripe_h + 1)
        bridge[i] = upper * (1 - t) + lower * t
    bridge = cv2.GaussianBlur(bridge, (81, 21), 0)
    out = np.concatenate([bgr[:y0], bridge, bgr[y1:]], axis=0)
    return out, (y0, y0 + stripe_h)


def _privacy_stripe(out: np.ndarray, center_y: int) -> np.ndarray:
    """Apply one precise horizontal frosted stripe over the eye line."""
    result = out.copy()
    h, w = result.shape[:2]
    stripe_h = max(22, int(h * 0.045))
    y0 = max(0, center_y - stripe_h // 2)
    y1 = min(h, y0 + stripe_h)
    roi = result[y0:y1]
    if roi.size == 0:
        return result
    k = max(25, (stripe_h // 2) * 2 + 1)
    blurred = cv2.GaussianBlur(roi, (k, k), 0)
    # Navy tint keeps the privacy treatment deliberate and consistent.
    tint = np.empty_like(blurred)
    tint[:] = (24, 18, 12)  # BGR equivalent of midnight navy
    result[y0:y1] = cv2.addWeighted(blurred, 0.58, tint, 0.42, 0)
    return result


def blur_eyes_haar(bgr: np.ndarray) -> np.ndarray:
    """Detect eyes and cover them with one narrow horizontal privacy stripe."""
    out = bgr.copy()
    h, w = out.shape[:2]
    cascade_path = Path(cv2.data.haarcascades) / "haarcascade_eye.xml"
    face_path = Path(cv2.data.haarcascades) / "haarcascade_frontalface_default.xml"
    gray = cv2.cvtColor(out, cv2.COLOR_BGR2GRAY)
    eyes = []
    if cascade_path.exists() and face_path.exists():
        faces = cv2.CascadeClassifier(str(face_path)).detectMultiScale(
            gray, 1.1, 4, minSize=(80, 80)
        )
        eye_clf = cv2.CascadeClassifier(str(cascade_path))
        for fx, fy, fw, fh in faces:
            roi = gray[fy : fy + int(fh * 0.55), fx : fx + fw]
            for ex, ey, ew, eh in eye_clf.detectMultiScale(roi, 1.05, 5, minSize=(18, 18)):
                eyes.append((fx + ex, fy + ey, ew, eh))
    if not eyes and cascade_path.exists():
        eye_clf = cv2.CascadeClassifier(str(cascade_path))
        for ex, ey, ew, eh in eye_clf.detectMultiScale(gray, 1.08, 6, minSize=(20, 20)):
            if 0.15 * h < ey < 0.65 * h:
                eyes.append((ex, ey, ew, eh))
    if eyes:
        centers = [ey + eh // 2 for _, ey, _, eh in eyes]
        return _privacy_stripe(out, int(np.median(centers)))
    # No fallback stripe: scalp-only views contain no identifiable eyes and
    # must not receive a decorative band across the hair.
    return out


def trim_alpha(
    subject: Image.Image, pad: float = 0.04, bridge_subject: bool = False
) -> tuple[Image.Image, tuple[int, int, int, int]]:
    """Keep the largest opaque island, crop bounds, feather the matte."""
    arr = np.asarray(subject).copy()
    alpha = arr[..., 3]
    # Drop disconnected furniture / junk left by rembg
    mask = (alpha > 24).astype(np.uint8)
    n, labels, stats, _ = cv2.connectedComponentsWithStats(mask, connectivity=8)
    if n > 1:
        areas = stats[1:, cv2.CC_STAT_AREA]
        largest = int(areas.max())
        keep_labels = [
            i
            for i in range(1, n)
            if stats[i, cv2.CC_STAT_AREA] >= largest * (0.05 if bridge_subject else 0.5)
        ]
        keep_mask = np.isin(labels, keep_labels).astype(np.uint8)
        if bridge_subject and len(keep_labels) > 1:
            # Legacy censor bars can split a face/head from beard and torso in
            # rembg's matte. Reconnect only the major centered subject islands.
            points = np.column_stack(np.where(keep_mask > 0)[::-1]).astype(np.int32)
            hull = cv2.convexHull(points)
            connected = np.zeros_like(keep_mask)
            cv2.fillConvexPoly(connected, hull, 1)
            keep_mask = connected
            arr[..., 3] = np.maximum(arr[..., 3], keep_mask * 255)
        arr[keep_mask == 0, 3] = 0
        alpha = arr[..., 3]
    ys, xs = np.where(alpha > 24)
    if len(xs) == 0:
        return subject, (0, 0, subject.width, subject.height)
    x0, x1 = xs.min(), xs.max()
    y0, y1 = ys.min(), ys.max()
    pw, ph = int((x1 - x0) * pad), int((y1 - y0) * pad)
    x0, y0 = max(0, x0 - pw), max(0, y0 - ph)
    x1, y1 = min(arr.shape[1] - 1, x1 + pw), min(arr.shape[0] - 1, y1 + ph)
    crop = arr[y0 : y1 + 1, x0 : x1 + 1].copy()
    a = crop[..., 3].astype(np.float32)
    a = cv2.GaussianBlur(a, (0, 0), 1.2)
    crop[..., 3] = np.clip(a, 0, 255).astype(np.uint8)
    return Image.fromarray(crop, "RGBA"), (int(x0), int(y0), int(x1 + 1), int(y1 + 1))


def subject_rgba(
    bgr: np.ndarray, bridge_subject: bool = False
) -> tuple[Image.Image, tuple[int, int, int, int]]:
    rgb = cv2.cvtColor(bgr, cv2.COLOR_BGR2RGB)
    if bridge_subject:
        # Portrait fallback: legacy black censor bars can split rembg's mask
        # between hair and beard. GrabCut keeps the complete head and face.
        mask = np.zeros(bgr.shape[:2], np.uint8)
        bg_model = np.zeros((1, 65), np.float64)
        fg_model = np.zeros((1, 65), np.float64)
        h, w = bgr.shape[:2]
        rect = (int(w * 0.06), int(h * 0.01), int(w * 0.88), int(h * 0.98))
        cv2.grabCut(bgr, mask, rect, bg_model, fg_model, 7, cv2.GC_INIT_WITH_RECT)
        alpha = np.where((mask == cv2.GC_FGD) | (mask == cv2.GC_PR_FGD), 255, 0).astype(
            np.uint8
        )
        alpha = cv2.morphologyEx(alpha, cv2.MORPH_CLOSE, np.ones((13, 13), np.uint8))
        alpha = cv2.GaussianBlur(alpha, (0, 0), 1.8)
        cut = Image.fromarray(np.dstack([rgb, alpha]), "RGBA")
    else:
        cut = remove(Image.fromarray(rgb)).convert("RGBA")
    return trim_alpha(cut, bridge_subject=bridge_subject)


def composite_clinical(subject: Image.Image, focus: str = "scalp") -> Image.Image:
    """Place subject on luxe bg, centered — full subject visible, shared 16:9 plate."""
    bg = luxe_background(OUT_W, OUT_H).convert("RGBA")
    sw, sh = subject.size
    # Fit inside the plate so hairlines/results aren't cropped away and the
    # clinical backdrop remains visible around the subject.
    fill = 0.9 if focus == "scalp" else 0.82
    scale = min(OUT_W / sw, OUT_H / sh) * fill
    nw, nh = max(1, int(sw * scale)), max(1, int(sh * scale))
    sub = subject.resize((nw, nh), Image.Resampling.LANCZOS)
    sx = (OUT_W - nw) // 2
    sy = (OUT_H - nh) // 2
    # Optical center slightly high (hairline / crown)
    sy = max(0, sy - int(OUT_H * (0.03 if focus == "scalp" else 0.02)))

    garr = np.zeros((OUT_H, OUT_W, 4), np.uint8)
    cy, cx = min(OUT_H - 1, sy + int(nh * 0.85)), OUT_W // 2
    yy, xx = np.ogrid[:OUT_H, :OUT_W]
    rad = math.hypot(nw * 0.48, nh * 0.2)
    dist = np.sqrt((xx - cx) ** 2 + ((yy - cy) * 1.55) ** 2)
    alpha = np.clip(42 * (1 - dist / (rad + 1e-6)), 0, 42).astype(np.uint8)
    garr[..., 0], garr[..., 1], garr[..., 2], garr[..., 3] = 201, 169, 97, alpha
    bg = Image.alpha_composite(bg, Image.fromarray(garr, "RGBA"))
    bg.paste(sub, (sx, sy), sub)
    return bg.convert("RGB")


def privacy_on_rgba(rgba: Image.Image, stripe_y: int | None) -> Image.Image:
    """Apply a narrow eye stripe on the cutout while preserving the full face."""
    arr = np.asarray(rgba).copy()
    bgr = cv2.cvtColor(arr[..., :3], cv2.COLOR_RGB2BGR)
    if stripe_y is not None:
        bgr = _privacy_stripe(bgr, stripe_y)
    else:
        bgr = blur_eyes_haar(bgr)
    rgb = cv2.cvtColor(bgr, cv2.COLOR_BGR2RGB)
    arr[..., :3] = rgb
    return Image.fromarray(arr, "RGBA")


def process_file(path: Path, out_name: str, focus: str = "scalp") -> Path:
    print(f"  processing {path.name} → {out_name}")
    bgr = cv2.imread(str(path), cv2.IMREAD_COLOR)
    if bgr is None:
        raise RuntimeError(f"cannot read {path}")
    h, w = bgr.shape[:2]
    # Never crop before privacy processing: preserve the full face and the
    # clinic/environment exactly as photographed.
    max_side = 1600
    if max(h, w) > max_side:
        s = max_side / max(h, w)
        bgr = cv2.resize(bgr, (int(w * s), int(h * s)), interpolation=cv2.INTER_AREA)
        h, w = bgr.shape[:2]
    gray = cv2.cvtColor(bgr, cv2.COLOR_BGR2GRAY)
    bar = find_black_bar(gray)
    if bar:
        bgr, bar = replace_black_bar(bgr, bar)
    bar_center = (bar[0] + bar[1]) // 2 if bar else None
    if bar_center is not None:
        bgr = _privacy_stripe(bgr, bar_center)
    else:
        bgr = blur_eyes_haar(bgr)

    # Cover-crop only at the final 4:5 boundary. Source photos are already
    # portrait-oriented, so this trims side margins while retaining full faces.
    rgb = cv2.cvtColor(bgr, cv2.COLOR_BGR2RGB)
    final = ImageOps.fit(
        Image.fromarray(rgb),
        (OUT_W, OUT_H),
        method=Image.Resampling.LANCZOS,
        centering=(0.5, 0.5),
    )
    out = LUXE / f"{out_name}.png"
    final.save(out, optimize=True)
    print(f"    wrote {out.relative_to(ROOT)} ({OUT_W}x{OUT_H})")
    return out


# Canonical pairs already on the site (M1, M2, F1)
CANONICAL = [
    ("case-01-antes", "scalp"),
    ("case-01-depois", "portrait"),
    ("case-02-antes", "scalp"),
    ("case-02-depois", "portrait"),
    ("case-03-antes", "scalp"),
    ("case-03-depois", "scalp"),
    ("eval-vertice", "scalp"),
    ("result-frontal", "scalp"),
    ("eval-feminina", "scalp"),
]

# Optional labeled drops: assets/src/patients/M1B.jpg, M1A.jpg, F2B.jpg…
LABEL_MAP = {
    "M1B": ("case-01-antes", "scalp"),
    "M1A": ("case-01-depois", "portrait"),
    "M2B": ("case-02-antes", "scalp"),
    "M2A": ("case-02-depois", "portrait"),
    "F1B": ("case-03-antes", "scalp"),
    "F1A": ("case-03-depois", "scalp"),
    "M3B": ("case-04-antes", "scalp"),
    "M3A": ("case-04-depois", "portrait"),
    "M4B": ("case-05-antes", "scalp"),
    "M4A": ("case-05-depois", "portrait"),
    "F2B": ("case-06-antes", "scalp"),
    "F2A": ("case-06-depois", "scalp"),
    "F3B": ("case-07-antes", "scalp"),
    "F3A": ("case-07-depois", "scalp"),
    "F4B": ("case-08-antes", "scalp"),
    "F4A": ("case-08-depois", "scalp"),
}


def resolve_src(stem: str) -> Path | None:
    for p in SRC.iterdir():
        if p.is_file() and p.stem == stem:
            return p
    return None


def main() -> None:
    print("Luxe clinical patient processing")
    # Prefer labeled patient drops when present
    labeled = {}
    if PATIENTS.is_dir():
        for p in PATIENTS.iterdir():
            if not p.is_file():
                continue
            key = p.stem.upper().replace("-", "").replace("_", "")
            if key in LABEL_MAP:
                labeled[key] = p
                print(f"  labeled input {key}: {p.name}")

    done = set()
    for key, path in labeled.items():
        out_name, focus = LABEL_MAP[key]
        process_file(path, out_name, focus=focus)
        done.add(out_name)

    for stem, focus in CANONICAL:
        if stem in done:
            continue
        path = resolve_src(stem)
        if not path:
            print(f"  skip missing {stem}")
            continue
        process_file(path, stem, focus=focus)

    print("done")


if __name__ == "__main__":
    main()
