'use client';

import { useSyncExternalStore } from 'react';

const subscribe = () => () => {};
const isApple = () => /Mac|iPhone|iPad/.test(navigator.userAgent);

/** The command key's label. The static page assumes Ctrl until the browser says otherwise. */
export function useModifierKey(): '⌘' | 'Ctrl' {
  return useSyncExternalStore(subscribe, isApple, () => false) ? '⌘' : 'Ctrl';
}
