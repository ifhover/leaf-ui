/** Shared single-line control sizes: 26px / 32px / 38px by default. */
export type ControlSize = 'sm' | 'md' | 'lg';
export type ControlStatus = 'error' | 'warning';
/** 单个区域的内边距值：数字（按 px）、CSS 长度值或 `'none'`。 */
export type PaddingValue = number | string | 'none';
/** 按 header / body / footer 分区配置容器内边距。 */
export interface SectionPadding {
  header?: PaddingValue;
  body?: PaddingValue;
  footer?: PaddingValue;
}
/** 支持统一数值/字符串，或按分区覆盖内边距。 */
export type ContainerPadding = PaddingValue | SectionPadding;
