#!/usr/bin/env bash
# 폰 홈 화면에 설치되는 검수용 웹앱을 만든다. 결과는 dist/ 이고 그대로 GitHub Pages 에 올린다.
#
# 세 단계다.
#   1. tools/build-web-tryout.sh 가 웹 빌드를 만든다 (글꼴을 줄이고 화면 하나짜리로 뽑는다).
#   2. tools/inline-web-tryout.py 가 그것을 파일 한 장으로 접는다 (그림·글꼴·코드를 본문에 심는다).
#   3. 이 스크립트가 설치에 필요한 것 넷을 그 옆에 놓는다 — 웹앱 선언문, 서비스 워커,
#      아이콘 셋, 그리고 검색엔진 차단 파일.
#
# 왜 파일 한 장이어야 하나 — 주소가 어디에 놓이든 깨지지 않기 때문이다. GitHub Pages 는
# 저장소 이름이 붙은 하위 경로(`/My-Rosary-App/`)로 서비스되는데, 보통의 웹 빌드는 자산을
# 절대 주소(`/assets/...`)로 가리켜 그 자리에서 전부 404 가 난다. 본문에 심으면 그 문제가
# 아예 생기지 않는다. 설치에 필요한 넷만 상대 주소(`./`)로 두면 된다.
#
# 쓰는 법:  bash tools/build-review-pages.sh
set -euo pipefail
cd "$(dirname "$0")/.."

bash tools/build-web-tryout.sh
python3 tools/inline-web-tryout.py

cd dist
# 접은 한 장을 들머리로 세우고, 접기 전의 조각들은 버린다.
mv -f standalone.html index.html
rm -rf assets expo-static

cp ../tools/pages/manifest.webmanifest ./manifest.webmanifest
cp ../tools/pages/sw.js ./sw.js
mkdir -p icons && cp ../public/icons/*.png icons/

printf 'User-agent: *\nDisallow: /\n' > robots.txt

# 앱 안에서 주소가 `/My-Rosary-App/home` 처럼 깊어지는데 그 자리에 실제 파일은 없다.
# 그 주소를 새로고침하면 GitHub Pages 가 404.html 을 내주므로, 그 한 장이 앱의
# 들머리로 돌려보내게 한다. 들머리를 통째로 복사하면 10MB 가 두 벌이 되므로 짧게 적는다.
cat > 404.html <<'HTML'
<!doctype html>
<meta charset="utf-8" />
<title>MyRosary</title>
<meta name="robots" content="noindex, nofollow" />
<script>
  // 이 파일이 놓인 자리에서 저장소 이름까지가 앱의 들머리다.
  var seg = location.pathname.split('/').filter(Boolean);
  location.replace('/' + (seg.length ? seg[0] + '/' : ''));
</script>
<p style="font:16px/1.6 system-ui;padding:24px">MyRosary 로 돌아가는 중입니다…</p>
HTML

python3 - <<'PY'
import io
p = 'index.html'
s = io.open(p, encoding='utf-8').read()
head = (
    '<link rel="manifest" href="./manifest.webmanifest" />'
    '<link rel="apple-touch-icon" href="./icons/apple-touch-icon-180.png" />'
    '<meta name="apple-mobile-web-app-status-bar-style" content="default" />'
    '<meta name="apple-mobile-web-app-title" content="MyRosary" />'
    '<meta name="robots" content="noindex, nofollow" />'
    '<link rel="icon" href="./favicon.ico" />'
)
# 앱이 켜지면서 주소를 자기 기준(`/`)으로 바꾸는데, GitHub Pages 는 저장소 이름이 붙은
# 하위 경로로 서비스되므로 그대로 두면 두 가지가 깨진다. 첫째, `./manifest.webmanifest`
# 같은 상대 주소가 하위 경로가 아니라 뿌리를 가리켜 404 가 난다(실측함). 둘째, 설치된
# 웹앱의 담당 범위(scope)를 벗어나 브라우저로 튕겨 나온다. 그래서 두 가지를 못 박는다 —
# 기준 주소를 처음 열린 자리로 고정하고, 앱이 주소를 바꿀 때 그 앞에 하위 경로를 붙인다.
pin = (
    '<script>(function(){'
    "var base=location.pathname.replace(/[^/]*$/,'');"
    "var el=document.createElement('base'); el.href=base;"
    "document.head.insertBefore(el, document.head.firstChild);"
    'function within(u){'
    "  if(typeof u!=='string'||u.charAt(0)!=='/') return u;"
    '  if(u.indexOf(base)===0) return u;'
    "  return base+u.replace(/^\\/+/,'');"
    '}'
    'var ps=history.pushState.bind(history), rs=history.replaceState.bind(history);'
    'history.pushState=function(a,b,u){return ps(a,b,within(u));};'
    'history.replaceState=function(a,b,u){return rs(a,b,within(u));};'
    '})();</script>'
)

# 서비스 워커는 상대 주소로 등록한다 — 하위 경로에서도 자기 자리를 맡게 하려는 것이다.
reg = (
    '<script>'
    "if('serviceWorker' in navigator){"
    "window.addEventListener('load',function(){"
    "navigator.serviceWorker.register('./sw.js').catch(function(){});"
    '});}'
    '</script>'
)
assert '</head>' in s
s = s.replace('</head>', pin + head + reg + '</head>', 1)
io.open(p, 'w', encoding='utf-8').write(s)
print('설치 선언문과 서비스 워커를 들머리에 붙였다')
PY

echo "완성: dist/ ($(du -sh . | cut -f1)) — 파일 $(find . -type f | wc -l) 개"
