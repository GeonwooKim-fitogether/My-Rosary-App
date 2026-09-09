// Expo 기본 프리셋. Metro(앱 번들러)와 Jest(테스트)가 같은 규칙으로 TypeScript 와
// JSON import 를 다루게 하려고 둔다 — 둘이 갈리면 테스트는 통과하는데 앱 번들이
// 깨지는 형태의 사고가 난다.
module.exports = function (api) {
  api.cache(true);
  return { presets: ['babel-preset-expo'] };
};
