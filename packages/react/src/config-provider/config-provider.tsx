import { createContext, type HTMLAttributes, useContext, useMemo } from 'react';
import type { LeafThemeStyle } from '../theme';

export type LeafLocale = 'zh-CN' | 'en-US';
export interface LeafTheme {
  primaryColor?: string;
  borderRadius?: number | string;
}
export interface ConfigProviderProps extends HTMLAttributes<HTMLDivElement> {
  locale?: LeafLocale;
  theme?: LeafTheme;
}

const zh = {
  select: '请选择',
  empty: '暂无选项',
  noMatches: '没有匹配建议，可继续输入',
  clearSelection: '清除选择',
  date: '请选择日期',
  time: '请选择时间',
  dateTime: '请选择日期和时间',
  range: '请选择日期区间',
  clearDate: '清除日期',
  clearTime: '清除时间',
  clearRange: '清除区间',
  clearCascader: '清除级联选择',
  chooseDate: '选择日期',
  chooseTime: '选择时间',
  previousMonth: '上个月',
  nextMonth: '下个月',
  previousYear: '上一年',
  nextYear: '下一年',
  previousYears: '上一组年份',
  nextYears: '下一组年份',
  hours: '小时',
  minutes: '分钟',
  seconds: '秒',
  period: '时段',
  am: '上午',
  pm: '下午',
  weekdays: ['一', '二', '三', '四', '五', '六', '日'],
  confirm: '确定',
  cancel: '取消',
  close: '关闭',
  start: '开始',
  end: '结束',
  required: '请填写此项',
  invalid: '请检查此项内容',
  useTime: '使用',
  year: '年',
  month: '月',
  week: '周',
  dateMode: '日期',
  loading: '处理中',
  today: '今天',
  now: '当前时间',
  selectTime: '选择时间',
  selectDate: '选择日期',
  remove: '移除',
  search: '搜索选项',
};
const en: typeof zh = {
  select: 'Please select',
  empty: 'No options',
  noMatches: 'No suggestions',
  clearSelection: 'Clear selection',
  date: 'Select a date',
  time: 'Select a time',
  dateTime: 'Select date and time',
  range: 'Select a date range',
  clearDate: 'Clear date',
  clearTime: 'Clear time',
  clearRange: 'Clear range',
  clearCascader: 'Clear selection',
  chooseDate: 'Choose a date',
  chooseTime: 'Choose a time',
  previousMonth: 'Previous month',
  nextMonth: 'Next month',
  previousYear: 'Previous year',
  nextYear: 'Next year',
  previousYears: 'Previous years',
  nextYears: 'Next years',
  hours: 'Hours',
  minutes: 'Minutes',
  seconds: 'Seconds',
  period: 'Period',
  am: 'AM',
  pm: 'PM',
  weekdays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  confirm: 'OK',
  cancel: 'Cancel',
  close: 'Close',
  start: 'Start',
  end: 'End',
  required: 'Please fill out this field',
  invalid: 'Please check this field',
  useTime: 'Use',
  year: 'Year',
  month: 'Month',
  week: 'Week',
  dateMode: 'Date',
  loading: 'Loading',
  today: 'Today',
  now: 'Now',
  selectTime: 'Choose time',
  selectDate: 'Choose date',
  remove: 'Remove',
  search: 'Search options',
};
const defaultConfig = { locale: 'zh-CN' as LeafLocale, theme: {} as LeafTheme, messages: zh };
const ConfigContext = createContext(defaultConfig);
export function useLeafConfig() {
  return useContext(ConfigContext);
}

/** Nested scopes inherit unspecified theme and language settings. */
export function ConfigProvider({ locale, theme, style, children, ...props }: ConfigProviderProps) {
  const parent = useLeafConfig();
  const merged = useMemo(() => {
    const language = locale ?? parent.locale;
    return {
      locale: language,
      theme: { ...parent.theme, ...theme },
      messages: language === 'en-US' ? en : zh,
    };
  }, [parent, locale, theme]);
  const variables: LeafThemeStyle = {
    ...(theme?.primaryColor ? { '--leaf-color-primary': theme.primaryColor } : {}),
    ...(theme?.borderRadius !== undefined
      ? {
          '--leaf-radius':
            typeof theme.borderRadius === 'number' ? `${theme.borderRadius}px` : theme.borderRadius,
          '--leaf-radius-sm': 'calc(var(--leaf-radius) * 0.6)',
          '--leaf-radius-lg': 'calc(var(--leaf-radius) * 1.6)',
        }
      : {}),
    ...style,
  };
  return (
    <ConfigContext.Provider value={merged}>
      <div {...props} lang={merged.locale} style={variables}>
        {children}
      </div>
    </ConfigContext.Provider>
  );
}
