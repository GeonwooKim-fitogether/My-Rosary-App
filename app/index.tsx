/**
 * L 로그인 — v5 시안 `docs/design/v5/index.html` 의 `s-login` 블록을 옮긴 화면.
 *
 * 값은 그 블록에서 그대로 가져왔고 색과 서체는 `src/theme` 의 토큰 이름으로 쓴다.
 * 한 곳만 v5 와 다르다. 세 번째 줄 `초대 코드로 들어가기`(v5 의 `go-invite1`)를 넣지
 * 않았다 — 결정 1-1 이 "계정이 필수라 로그인 전 합류는 성립하지 않으므로 로그인 화면의
 * 진입점은 뺀다"고 정했고, 그 충돌을 `decisions.md` Q-13 이 결정 1-1 의 손을 들어
 * 판정했기 때문이다. 그 줄이 차지하던 80px 만큼은 빈 자리로 남겨 아래 각주의 위치를
 * v5 와 같게 두었다.
 *
 * **단추는 아직 아무 일도 하지 않는다.** 실제 인증은 Supabase 를 붙이는 M3 의 일이다.
 * 눌리는데 아무 일도 일어나지 않는 단추가, 눌리면 거짓 화면으로 넘어가는 단추보다 정직하다.
 */
import { Image } from 'expo-image';
import { StyleSheet, Text, View } from 'react-native';
import { artSession, SLOT_GEOMETRY } from '../src/art';
import { colors, metrics, type } from '../src/theme';

export default function LoginScreen() {
  // 이번 세션의 로그인 띠에 걸 성화. 초점 좌표는 v5 가 렌더해 보고 정한 값이다.
  const plate = artSession.forKey('screen:login', ['login']);

  return (
    <View style={styles.screen}>
      {plate ? (
        <Image
          source={plate.source}
          style={styles.art}
          contentFit="cover"
          // CSS 의 background-position 과 같은 뜻이다.
          contentPosition={{ left: plate.focus.login.x, top: plate.focus.login.y }}
          accessible={false}
        />
      ) : (
        <View style={styles.art} />
      )}

      <View style={styles.body}>
        <Text style={styles.label}>54일 기도</Text>
        <Text style={styles.title}>묵주</Text>
        <Text style={styles.intro}>
          하나의 지향을 쉰네 날 동안 바칩니다.{'\n'}오늘 어디까지 바쳤는지는 앱이 기억합니다.
        </Text>

        <View style={styles.spacer} />

        <View style={styles.primaryButton}>
          <Text style={styles.primaryButtonText}>Google로 계속하기</Text>
        </View>
        <View style={styles.secondaryButton}>
          <Text style={styles.secondaryButtonText}>Apple로 계속하기</Text>
        </View>

        {/* v5 의 `초대 코드로 들어가기` 줄이 있던 자리 (결정 1-1 · Q-13 으로 뺐다). */}
        <View style={styles.removedRowGap} />

        <Text style={styles.footnote}>
          계속하면 이용약관과 개인정보 처리방침에 동의합니다.{'\n'}바람 문구는 서버에서
          암호화해 보관합니다.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    flexDirection: 'column',
    paddingBottom: 26,
    backgroundColor: colors.background,
  },
  art: {
    height: SLOT_GEOMETRY.login.height, // 340
    flexGrow: 0,
    flexShrink: 0,
    backgroundColor: colors.rule,
  },
  body: {
    paddingTop: 34,
    paddingHorizontal: metrics.screenPadding, // 24
    flexDirection: 'column',
    flex: 1,
  },
  label: { ...type.label, color: colors.inkMuted },
  title: { ...type.title, color: colors.ink, marginTop: 16 },
  intro: { ...type.body, color: colors.ink, marginTop: 16 },
  spacer: { flex: 1 },
  primaryButton: {
    height: metrics.touchTargetHeight, // 80
    backgroundColor: colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: metrics.radius,
  },
  primaryButtonText: { ...type.button, color: colors.inverse },
  secondaryButton: {
    height: metrics.touchTargetHeight,
    borderWidth: 1,
    borderColor: colors.buttonBorder,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    borderRadius: metrics.radius,
  },
  secondaryButtonText: { ...type.button, color: colors.ink },
  removedRowGap: { height: metrics.touchTargetHeight },
  footnote: { ...type.footnote, color: colors.inkMuted, textAlign: 'center' },
});
