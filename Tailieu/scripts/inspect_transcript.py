import json

with open('d:/Detai12_QLCH/Tailieu/scripts/transcript_doc06_matches.json', 'r', encoding='utf-8') as f:
    items = json.load(f)

lines = []
for it in items:
    lno = it['line_no']
    tc = it.get('tool_calls')
    if tc:
        for c in tc:
            fn = c.get('function', {})
            name = fn.get('name')
            args = fn.get('arguments', {})
            cmd = args.get('CommandLine') or args.get('AbsolutePath')
            lines.append(f'Line {lno}: {name} -> {cmd}')
    elif it.get('content'):
        lines.append(f'Line {lno} [CONTENT]: {it["content"][:200]}...')

with open('d:/Detai12_QLCH/Tailieu/scripts/transcript_commands.txt', 'w', encoding='utf-8') as f:
    f.write('\n'.join(lines))

print('Wrote transcript_commands.txt')
