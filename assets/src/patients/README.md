# Labeled patient drops

Drop raw clinic photos here using the pairing labels, then run:

```bash
python3 scripts/luxe-patients.py
npm run build:images
```

## Labels

| Token | Meaning |
|-------|---------|
| `F` / `M` | Female / Male |
| `1`–`4` | Same-person group |
| `B` / `A` | Before / After |

Examples: `M1B.jpg`, `M1A.jpg`, `F2B.png`, `F2A.png`

These labels are only used to keep the same person’s before/after together.
The processor preserves the full original photo and original background, then
adds only a thin horizontal privacy stripe over visible eyes. Standardized 4:5
outputs are written to `assets/src/luxe/`.
