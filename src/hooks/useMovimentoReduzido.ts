import { useEffect, useState } from 'react';
import { AccessibilityInfo } from 'react-native';

import { useAppOpcional } from '@/state/AppState';

/** true quando o celular pede "reduzir movimento" ou a família desligou as animações no Perfil. Toda animação deve respeitar. */
export function useMovimentoReduzido() {
  const [reduzido, setReduzido] = useState(false);
  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setReduzido).catch(() => {});
    const sub = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduzido);
    return () => sub.remove();
  }, []);
  const app = useAppOpcional();
  return reduzido || app?.ajustes.animacoes === false;
}
