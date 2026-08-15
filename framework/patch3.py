#!/usr/bin/env python3
import sys

path = r'A:\RecoveredProjects\C_Drive\ag064\nexuslite-src\framework\src\nexuslite.ts'

with open(path, 'rb') as f:
    raw = f.read()

content = raw.decode('utf-8')
# Find the href function line
href_idx = content.find('export function href(url:')
print(f"href at index {href_idx}")
print(f"Bytes around: {content[href_idx-30:href_idx+80]!r}")
# Find the onMulti function line
multi_idx = content.find('export function onMulti')
print(f"onMulti at index {multi_idx}")
print(f"Bytes around: {content[multi_idx-5:multi_idx+90]!r}")
