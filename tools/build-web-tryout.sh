#!/usr/bin/env bash
# 폰에서 눌러 볼 수 있는 시험판 웹 빌드를 만든다. 결과는 dist/ 이고, dist/index.html 을
# 아티팩트로 올리면 공방장이 폰 브라우저에서 앱을 그대로 써 볼 수 있다.
#
# 왜 `npm run build:web` 을 그대로 쓰지 않나 — 세 가지를 더 해야 하기 때문이다.
#
#   1. 아티팩트 호스트는 이름이 밑줄(_)로 시작하는 최상위 이름을 자기 것으로 예약한다.
#      Expo 가 만드는 `_expo/` 폴더와 `_sitemap.html` 이 그대로는 올라가지 않으므로
#      폴더 이름을 `expo-static/` 으로 바꾸고 그 참조도 함께 고친다.
#
#   2. 한글 글꼴 셋이 26MB 라 폰에서 열면 오래 걸린다. 한글 음절 전체(U+AC00~D7A3)는
#      남기고 한자를 덜어 낸 뒤 woff2 로 다시 담으면 2.7MB 가 된다. 파일 이름은 그대로
#      두어야 한다 — 자바스크립트 번들이 해시가 붙은 그 이름을 가리키기 때문이고,
#      브라우저는 확장자가 아니라 파일 안의 형식을 보므로 `.ttf` 라는 이름에 woff2
#      내용이 들어 있어도 정상으로 읽는다.
#
#   3. 화면마다 HTML 을 만드는 정적 빌드(static) 대신 화면 하나짜리(single) 로 뽑는다.
#      아티팩트에는 주소를 직접 쳐서 들어가는 길이 없고, 앱은 어차피 메모리 상태로
#      화면을 바꾸기 때문이다. 같은 이유로 서비스 워커와 웹앱 선언문은 뺀다.
#
# 쓰는 법:  sh tools/build-web-tryout.sh
set -euo pipefail
cd "$(dirname "$0")/.."

# app.json 의 web.output 을 잠깐 single 로 바꿔 빌드하고, 끝나면 되돌린다.
cp app.json app.json.orig
trap 'mv -f app.json.orig app.json 2>/dev/null || true' EXIT
python3 - <<'PY'
import json
d = json.load(open('app.json'))
d['expo']['web']['output'] = 'single'
json.dump(d, open('app.json', 'w'), ensure_ascii=False, indent=2)
PY

rm -rf dist
npx expo export --platform web

mv -f app.json.orig app.json
trap - EXIT

cd dist
mv _expo expo-static
rm -f sw.js manifest.webmanifest metadata.json
python3 - <<'PY'
import io
p = 'index.html'
s = io.open(p, encoding='utf-8').read()
s = s.replace('/_expo/', '/expo-static/')
meta = (
    '<meta name="apple-mobile-web-app-capable" content="yes" />'
    '<meta name="mobile-web-app-capable" content="yes" />'
    '<meta name="theme-color" content="#EDE7D8" />'
    '<meta name="viewport" content="width=device-width, initial-scale=1, '
    'maximum-scale=1, viewport-fit=cover, shrink-to-fit=no" />'
)
s = s.replace('</head>', meta + '</head>', 1)
io.open(p, 'w', encoding='utf-8').write(s)
PY

python3 -m pip install --quiet fonttools brotli

# 한글 글꼴만 음절 범위로 줄인다 (라틴 글꼴은 이미 작다).
for f in assets/assets/fonts/Noto*.ttf; do
  python3 -m fontTools.subset "$f" --output-file="$f.sub" \
    --unicodes="U+0020-007E,U+00A0-00FF,U+2000-206F,U+20A0-20BF,U+2190-21FF,U+2460-24FF,U+25A0-25FF,U+3000-303F,U+1100-11FF,U+3130-318F,U+A960-A97F,U+AC00-D7A3,U+D7B0-D7FF,U+FF00-FFEF" \
    --layout-features='*' --no-hinting --desubroutinize
  mv "$f.sub" "$f"
done

# 글꼴 전부를 woff2 로 다시 담는다 (파일 이름은 그대로).
for f in assets/assets/fonts/*.ttf; do
  python3 - "$f" <<'PY'
import sys
from fontTools.ttLib import TTFont
p = sys.argv[1]
font = TTFont(p)
font.flavor = 'woff2'
font.save(p + '.w2')
PY
  mv "$f.w2" "$f"
done

echo "완성: $(du -sh . | cut -f1) — dist/index.html 을 아티팩트로 올린다"
