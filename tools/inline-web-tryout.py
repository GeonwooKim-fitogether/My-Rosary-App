#!/usr/bin/env python3
"""dist/ 를 파일 하나짜리 index.html 로 접는다.

왜 접나 — 아티팩트 호스트에 파일을 여럿 올렸을 때 그림·글꼴·자바스크립트를 가리키는
주소(`/assets/...`)가 실제로 어디에 놓이는지 이 컨테이너에서는 확인할 길이 없었고,
실제로 열었을 때 흰 화면만 나왔다. 바깥 요청이 하나도 없으면 그 문제 자체가 사라지므로,
그림과 글꼴을 파일 안에 데이터로 심고 자바스크립트도 본문에 넣어 한 장으로 만든다.

쓰는 법:  python3 tools/inline-web-tryout.py     (dist/ 를 읽어 dist/standalone.html 을 만든다)
"""
import base64
import io
import os
import re
import sys

DIST = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'dist')
DIST = os.path.normpath(DIST)

MIME = {
    '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png',
    '.ico': 'image/x-icon', '.ttf': 'font/woff2', '.woff2': 'font/woff2',
}


def recompress_jpegs(quality=82):
    """폰 화면 크기에 맞춰 그림을 다시 저장한다. 원본이 736px 폭이라 크기는 그대로 둔다."""
    try:
        from PIL import Image
    except ImportError:
        print('Pillow 가 없어 그림 재압축은 건너뛴다')
        return
    saved = 0
    for root, _dirs, files in os.walk(os.path.join(DIST, 'assets')):
        for f in files:
            if not f.lower().endswith(('.jpg', '.jpeg')):
                continue
            p = os.path.join(root, f)
            before = os.path.getsize(p)
            im = Image.open(p).convert('RGB')
            buf = io.BytesIO()
            im.save(buf, 'JPEG', quality=quality, optimize=True, progressive=True)
            if buf.tell() < before:
                with open(p, 'wb') as fh:
                    fh.write(buf.getvalue())
                saved += before - buf.tell()
    print('그림 재압축으로 줄인 양: %.1fMB' % (saved / 1024 / 1024))


def data_uri(rel_path):
    """`/assets/x/y.jpg` 같은 절대 주소를 그 파일의 data: 주소로 바꾼다."""
    local = os.path.join(DIST, rel_path.lstrip('/'))
    if not os.path.isfile(local):
        return None
    ext = os.path.splitext(local)[1].lower()
    mime = MIME.get(ext, 'application/octet-stream')
    with open(local, 'rb') as fh:
        b64 = base64.b64encode(fh.read()).decode('ascii')
    return 'data:%s;base64,%s' % (mime, b64)


def main():
    recompress_jpegs()

    # 번들 찾기
    bundle = None
    for root, _dirs, files in os.walk(os.path.join(DIST, 'expo-static')):
        for f in files:
            if f.endswith('.js'):
                bundle = os.path.join(root, f)
    if not bundle:
        sys.exit('번들을 찾지 못했다 — 먼저 sh tools/build-web-tryout.sh 를 돌린다')

    js = io.open(bundle, encoding='utf-8').read()

    # 번들 안의 자산 주소를 전부 data: 로 바꾼다.
    refs = sorted(set(re.findall(r'"(/assets/[^"]+)"', js)))
    missing = []
    for ref in refs:
        uri = data_uri(ref)
        if uri is None:
            missing.append(ref)
            continue
        js = js.replace('"%s"' % ref, '"%s"' % uri)
    print('번들이 가리키던 자산 %d 개 중 %d 개를 파일 안으로 넣었다' % (len(refs), len(refs) - len(missing)))
    for m in missing:
        print('  못 찾음:', m)

    html = io.open(os.path.join(DIST, 'index.html'), encoding='utf-8').read()

    # 아이콘 링크는 지우고(바깥 요청이 남으면 안 된다), 스크립트 태그를 본문으로 바꾼다.
    html = re.sub(r'<link rel="icon"[^>]*/?>', '', html)
    inline = '<script>\n' + js.replace('</script>', '<\\/script>') + '\n</script>'
    # 치환문에 역슬래시가 많아 re 가 이스케이프로 읽지 않도록 함수로 넘긴다.
    html = re.sub(r'<script src="[^"]*"[^>]*></script>', lambda _m: inline, html, count=1)

    out = os.path.join(DIST, 'standalone.html')
    io.open(out, 'w', encoding='utf-8').write(html)
    size = os.path.getsize(out)
    print('완성: %s (%.1fMB)' % (out, size / 1024 / 1024))
    if size > 15.5 * 1024 * 1024:
        print('주의: 아티팩트 한 장의 상한(16MB)에 가깝다 — 그림 화질을 더 낮춰야 한다')


if __name__ == '__main__':
    main()
