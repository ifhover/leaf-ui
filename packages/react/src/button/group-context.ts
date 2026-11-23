import { createContext, useContext } from 'react';
import type { ControlSize } from '../shared/types';
import type { ButtonVariant } from './button';

export interface ButtonGroupContextValue {
  size?: ControlSize;
  variant?: ButtonVariant;
  disabled?: boolean;
}

export const ButtonGroupContext = createContext<ButtonGroupContextValue | null>(null);

/** 读取所属 ButtonGroup 的共享配置上下文。 */
export function useButtonGroup(): ButtonGroupContextValue | null {
  return useContext(ButtonGroupContext);
}
