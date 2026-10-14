import { useEffect, useState } from 'react';
import { AccessibilityInfo } from 'react-native';

/** true quando o celular está com "reduzir movimento" ligado. Toda animação deve respeitar. */
export function useMovimentoReduzido() {
  const [reduzido, setReduzido] = useState(false);
  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setReduzido).catch(() => {});
    const sub = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduzido);
    return () => sub.remove();
  }, []);
  return reduzido;
}
