"""Apply the reviewed V3.1 text delta after checking every preimage and result.
One-use delivery helper. The publishing workflow removes this and the archive.
No network access, dependency installation, or code execution from the archive.
"""
from pathlib import Path, PurePosixPath
import hashlib, json, lzma

ROOT = Path(__file__).resolve().parents[1]
ARCHIVE_SHA = '5251305f576573ad0cff878826d812b9abcee533ed249f180c060875eab8bd15'
archive = b''.join((ROOT / f'tools/v31-delta.{i}').read_bytes() for i in range(4))
if hashlib.sha256(archive).hexdigest() != ARCHIVE_SHA:
    raise SystemExit('Source archive checksum mismatch')
decoder = lzma.LZMADecompressor(memlimit=128 * 1024 * 1024)
raw = decoder.decompress(archive, max_length=2 * 1024 * 1024)
if not decoder.eof or decoder.unused_data:
    raise SystemExit('Source archive is truncated, oversized, or contains extra streams')
payload = json.loads(raw)
if payload['base'] != '518e4cc7486b0a317656b0d7fd6dcb1c90ef75df':
    raise SystemExit('Unexpected source baseline')
planned = []
seen = set()
for entry in payload['files']:
    name = entry['path']
    path = PurePosixPath(name)
    if path.is_absolute() or '..' in path.parts or name in seen:
        raise SystemExit(f'Invalid source path: {name}')
    if not (name.startswith(('src/', 'tests/', 'docs/')) or name in {'README.md', 'package.json', 'tools/build.mjs'}):
        raise SystemExit(f'Outside reviewed source boundary: {name}')
    seen.add(name)
    target = ROOT.joinpath(*path.parts)
    if not target.resolve().is_relative_to(ROOT) or any(p.is_symlink() for p in [target, *target.parents]):
        raise SystemExit(f'Symlink or escaped path: {name}')
    old = target.read_text(encoding='utf-8') if target.exists() else ''
    if entry['before'] is None:
        if target.exists():
            raise SystemExit(f'New source already exists, refusing overwrite: {name}')
    elif not target.is_file() or hashlib.sha256(old.encode()).hexdigest() != entry['before']:
        raise SystemExit(f'Source changed since review, refusing overwrite: {name}')
    prior = 0
    for start, end, text in entry['edits']:
        if not (isinstance(start, int) and isinstance(end, int) and isinstance(text, str) and prior <= start <= end <= len(old)):
            raise SystemExit(f'Invalid edit range: {name}')
        prior = end
    new = old
    for start, end, text in reversed(entry['edits']):
        new = new[:start] + text + new[end:]
    if hashlib.sha256(new.encode()).hexdigest() != entry['after']:
        raise SystemExit(f'Reconstructed source checksum mismatch: {name}')
    planned.append((target, new))
# Validate the complete batch before changing any file.
for target, text in planned:
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text(text, encoding='utf-8')
print(f'Applied {len(planned)} independently verified readable source files')
print('Expected built HTML:', payload['expected_html'])
