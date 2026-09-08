/**
 * 낮 벌과 밤 벌을 갈아 끼우는 자리 (06-design-system §2-2 · `decisions.md` Q-14).
 *
 * 화면은 색을 직접 쓰지 않고 `useThemedStyles` 로 받는다. 그래야 설정에서 `낮과 밤` 을
 * 바꾸는 순간 화면 전체가 함께 바뀐다. 토큰을 이름으로만 쓰게 해 둔 M0 의 결정이 여기서
 * 값을 한다 — 화면 코드는 한 줄도 색을 알지 못한다.
 *
 * 어느 벌로 그릴지는 두 가지가 정한다. 설정이 `낮`·`밤` 이면 그대로 따르고, `기기 설정
 * 따름`이면 기기의 밝기 설정을 본다. 기기가 아무 말이 없으면(웹 기본) 낮 벌이다.
 */
import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import { useAppState } from '../state/useAppState';
import {
  cellFillFor,
  colorsFor,
  seasonColorsFor,
  type CellFill,
  type ColorTokens,
  type SeasonColors,
  type ThemeMode,
} from './tokens';

export interface Theme {
  mode: ThemeMode;
  colors: ColorTokens;
  /** 전례색 슬롯 (FR-25). */
  season: SeasonColors;
  /** 리본·격자 한 칸의 색. */
  cell: CellFill;
}

function themeFor(mode: ThemeMode): Theme {
  return { mode, colors: colorsFor(mode), season: seasonColorsFor(mode), cell: cellFillFor(mode) };
}

const DAY_THEME = themeFor('day');
const NIGHT_THEME = themeFor('night');

const ThemeContext = createContext<Theme>(DAY_THEME);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const { settings } = useAppState();
  const systemScheme = useColorScheme();
  const mode: ThemeMode =
    settings.theme === 'system' ? (systemScheme === 'dark' ? 'night' : 'day') : settings.theme;
  const theme = mode === 'night' ? NIGHT_THEME : DAY_THEME;
  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>;
}

export function useTheme(): Theme {
  return useContext(ThemeContext);
}

/**
 * 벌에 맞춰 만들어진 스타일 한 벌.
 *
 * `factory` 는 모듈 맨 아래에 상수로 두어야 한다 — 화면 안에서 새로 만들면 그릴 때마다
 * 스타일이 다시 만들어진다.
 */
export function useThemedStyles<T>(factory: (theme: Theme) => T): T {
  const theme = useTheme();
  return useMemo(() => factory(theme), [factory, theme]);
}
