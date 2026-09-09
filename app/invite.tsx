/**
 * I 초대 코드 입력 — v5 시안 `docs/design/v5/index.html` 의 `s-invite` 블록을 옮긴 화면.
 *
 * 이 화면이 별도 화면인 것은 결정 1-1 이 정한 것이고, **들어오는 문은 홈 하나뿐이다** —
 * 로그인 화면에도 같은 줄이 있었지만 계정이 필수라 로그인 전 합류가 성립하지 않아 뺐다
 * (`decisions.md` Q-13). M0 에서 로그인 화면의 그 줄을 뺀 것이 이 결정의 앞쪽 절반이고,
 * 홈에 `초대 코드로 들어가기` 를 둔 것이 뒤쪽 절반이다.
 *
 * **코드를 확인해 줄 서버가 아직 없다.** 초대 코드는 서버가 발급하고 확인하므로
 * (`spec/journey-rules.md` §7) 실제 합류는 M3 의 일이다. 그래서 여섯 자리를 넣고 누르면
 * PRD §8 이 정한 문구 그대로 `이 코드의 기도를 찾지 못했습니다.` 가 뜬다 — 지금 이 앱이
 * 어떤 코드도 찾을 수 없는 것이 사실이기 때문이다. 코드가 맞았을 때 뜨는 여정 미리보기
 * 카드는 서버가 붙는 M3 에 함께 선다.
 */
import { useRef, useState } from 'react';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { type2, useThemedStyles, type Theme } from '../src/theme';
import { PrimaryButton, ScreenBody, ScreenHeader } from '../src/ui/Screen';

const CODE_LENGTH = 6;

export default function InviteScreen() {
  const styles = useThemedStyles(inviteStyles);
  const [code, setCode] = useState('');
  const [notFound, setNotFound] = useState(false);
  const input = useRef<TextInput>(null);

  return (
    <ScreenBody testID="invite-screen">
      <ScreenHeader
        label="초대 코드"
        action="닫기"
        onAction={() => router.back()}
        actionTestID="invite-close"
      />

      <Text style={styles.title}>
        받은 여섯 자리를{'\n'}넣어 주세요
      </Text>

      {/* 여섯 칸 위에 보이지 않는 입력칸이 겹쳐 있다. v5 의 방식 그대로이며, 칸을 옮기지
          않는 것이 중요하다 — 포커스를 가진 입력 요소를 옮기면 브라우저가 포커스를 놓는다. */}
      <Pressable style={styles.cells} onPress={() => input.current?.focus()}>
        {Array.from({ length: CODE_LENGTH }, (_, index) => {
          const letter = code[index] ?? '';
          const isCurrent = index === code.length - 1;
          return (
            <View
              key={index}
              style={[
                styles.cell,
                letter ? (isCurrent ? styles.cellCurrent : styles.cellDone) : styles.cellEmpty,
              ]}
            >
              <Text style={letter && isCurrent ? styles.cellTextCurrent : styles.cellText}>
                {letter}
              </Text>
            </View>
          );
        })}
        <TextInput
          ref={input}
          value={code}
          onChangeText={(next) => {
            setCode(next.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, CODE_LENGTH));
            setNotFound(false);
          }}
          maxLength={CODE_LENGTH}
          autoCapitalize="characters"
          autoCorrect={false}
          style={styles.hiddenInput}
          testID="invite-input"
        />
      </Pressable>

      <Text style={styles.hint}>대소문자를 가리지 않습니다. 붙여넣어도 됩니다.</Text>
      {notFound ? (
        <Text style={styles.error} testID="invite-not-found">
          이 코드의 기도를 찾지 못했습니다.
        </Text>
      ) : null}

      <View style={styles.spacer} />

      <PrimaryButton
        label="들어가기"
        onPress={() => setNotFound(code.length === CODE_LENGTH)}
        testID="invite-enter"
      />
    </ScreenBody>
  );
}

const inviteStyles = ({ colors }: Theme) =>
  StyleSheet.create({
    title: { ...type2.inviteTitle, color: colors.ink, marginTop: 36 },
    cells: { flexDirection: 'row', gap: 8, marginTop: 32, position: 'relative' },
    cell: {
      flex: 1,
      height: 76,
      borderWidth: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    cellEmpty: { borderColor: colors.inputBorder },
    cellDone: { borderColor: colors.ink },
    cellCurrent: { borderColor: colors.accent, backgroundColor: colors.accentWash },
    cellText: { ...type2.codeCell, color: colors.ink },
    cellTextCurrent: { ...type2.codeCell, color: colors.accent },
    hiddenInput: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      opacity: 0,
      padding: 0,
      margin: 0,
      fontSize: 16,
      color: colors.ink,
    },
    hint: { ...type2.hint, color: colors.inkMuted, marginTop: 14 },
    error: { ...type2.hint, color: colors.accent, marginTop: 10 },
    spacer: { flex: 1 },
  });
