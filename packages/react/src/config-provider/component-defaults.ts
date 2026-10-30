import type { HTMLAttributes } from 'react';
import { createContext, useContext } from 'react';
import type { AlertProps } from '../alert/alert';
import type { AffixProps, AnchorProps } from '../anchor/anchor';
import type { AutoCompleteProps } from '../autocomplete/autocomplete';
import type { AvatarProps } from '../avatar/avatar';
import type { AvatarGroupProps } from '../avatar/group';
import type { BackTopProps } from '../backtop/backtop';
import type { BadgeProps } from '../badge/badge';
import type { BreadcrumbProps } from '../breadcrumb/breadcrumb';
import type { ButtonProps } from '../button/button';
import type { ButtonGroupProps, SplitButtonProps } from '../button/group';
import type { CalendarProps } from '../calendar/calendar';
import type { CardProps } from '../card/card';
import type { CardTitleProps } from '../card/title';
import type { CarouselProps } from '../carousel/carousel';
import type { CascaderProps } from '../cascader/cascader';
import type { CheckboxProps } from '../checkbox/checkbox';
import type { CheckboxGroupProps } from '../checkbox/group';
import type { CollapseProps } from '../collapse/collapse';
import type { ColorPickerProps } from '../colorpicker/colorpicker';
import type { ConfirmOptions } from '../confirm/confirm';
import type { DatePickerProps } from '../datepicker/datepicker';
import type { DateRangePickerProps } from '../daterangepicker/daterangepicker';
import type { DescriptionsProps } from '../descriptions/descriptions';
import type { DividerProps } from '../divider/divider';
import type { DrawerProps } from '../drawer/drawer';
import type { DropdownProps } from '../dropdown/dropdown';
import type { EmptyProps } from '../empty/empty';
import type { ErrorBoundaryProps } from '../errorboundary/errorboundary';
import type { FileListProps } from '../filelist/filelist';
import type { FlexProps } from '../flex/flex';
import type { FloatButtonGroupProps, FloatButtonProps } from '../floatbutton/floatbutton';
import type {
  FormErrorSummaryProps,
  FormFieldProps,
  FormGroupProps,
  FormProps,
} from '../form/form';
import type { FormListProps } from '../form/list';
import type { ColProps, GridProps, RowProps } from '../grid/grid';
import type { ImagePreviewOptions } from '../image/types';
import type { InfiniteScrollProps } from '../infinitescroll/infinitescroll';
import type { InputGroupProps, InputSearchProps } from '../input/group';
import type { InputProps } from '../input/input';
import type { InputMaskProps } from '../inputmask/inputmask';
import type { InputNumberProps } from '../inputnumber/inputnumber';
import type { InputOTPProps } from '../inputotp/inputotp';
import type { LayoutProps, LayoutSiderProps } from '../layout/layout';
import type { LoadingProps } from '../loading/loading';
import type { LoadingBarProps } from '../loadingbar/loadingbar';
import type { MasonryProps } from '../masonry/masonry';
import type { MentionsProps } from '../mentions/mentions';
import type { MenuGroupProps, MenuProps } from '../menu/menu';
import type { MessageOptions, MessageProps } from '../message/message';
import type { ModalProps } from '../modal/modal';
import type { NotificationOptions, NotificationProps } from '../notification/notification';
import type { PaginationProps } from '../pagination/pagination';
import type { PopconfirmProps } from '../popconfirm/popconfirm';
import type { PopoverProps } from '../popover/popover';
import type { ProgressProps } from '../progress/progress';
import type { QRCodeProps } from '../qrcode/qrcode';
import type { RadioGroupProps, RadioProps } from '../radio/radio';
import type { RateProps } from '../rate/rate';
import type { ResultProps } from '../result/result';
import type { ScrollAreaProps } from '../scrollarea/scrollarea';
import type { ScrollbarProps } from '../scrollbar/scrollbar';
import type { SelectProps } from '../select/select';
import type { SkeletonProps } from '../skeleton/skeleton';
import type { SliderProps } from '../slider/slider';
import type { SpaceProps } from '../space/space';
import type { SplitterProps } from '../splitter/splitter';
import type { CountdownProps, StatisticProps } from '../statistic/statistic';
import type { StepsProps } from '../steps/steps';
import type { SwitchProps } from '../switch/switch';
import type { DataTablePresentationProps } from '../tabletanstack/defaults';
import type { TabsProps } from '../tabs/tabs';
import type { CheckableTagProps, TagGroupProps } from '../tag/group';
import type { TagProps } from '../tag/tag';
import type { TextareaProps } from '../textarea/textarea';
import type { TimelineProps } from '../timeline/timeline';
import type { TooltipProps } from '../tooltip/tooltip';
import type { TourProps } from '../tour/tour';
import type { TransferProps } from '../transfer/transfer';
import type { TreeProps } from '../tree/tree';
import type { TreeSelectProps } from '../treeselect/treeselect';
import type {
  LinkProps,
  ParagraphProps,
  TextProps,
  TitleProps,
  TypographyProps,
} from '../typography/typography';
import type { UploadProps } from '../upload/upload';
import type { VirtualListProps } from '../virtuallist/virtuallist';

/** Only props independent of the caller's item type can cross a generic component boundary. */
type GenericComponentName = 'FormList' | 'VirtualList' | 'DataTable';

/** Full public props keep each hook key tied to its component, including Select's union. */
interface ComponentPropsMap {
  Affix: AffixProps;
  Alert: AlertProps;
  Anchor: AnchorProps;
  AutoComplete: AutoCompleteProps;
  Avatar: AvatarProps;
  AvatarGroup: AvatarGroupProps;
  BackTop: BackTopProps;
  Badge: BadgeProps;
  Breadcrumb: BreadcrumbProps;
  Button: ButtonProps;
  ButtonGroup: ButtonGroupProps;
  Calendar: CalendarProps;
  Card: CardProps;
  CardTitle: CardTitleProps;
  Carousel: CarouselProps;
  Cascader: CascaderProps;
  CheckableTag: CheckableTagProps;
  Checkbox: CheckboxProps;
  CheckboxGroup: CheckboxGroupProps;
  Col: ColProps;
  Collapse: CollapseProps;
  ColorPicker: ColorPickerProps;
  Confirm: ConfirmOptions;
  Countdown: CountdownProps;
  DatePicker: DatePickerProps;
  DateRangePicker: DateRangePickerProps;
  Descriptions: DescriptionsProps;
  Divider: DividerProps;
  Drawer: DrawerProps;
  Dropdown: DropdownProps;
  Empty: EmptyProps;
  ErrorBoundary: ErrorBoundaryProps;
  FileList: FileListProps;
  Flex: FlexProps;
  FloatButton: FloatButtonProps;
  FloatButtonGroup: FloatButtonGroupProps;
  Form: FormProps;
  FormErrorSummary: FormErrorSummaryProps;
  FormField: FormFieldProps;
  FormGroup: FormGroupProps;
  Grid: GridProps;
  ImagePreview: ImagePreviewOptions;
  InfiniteScroll: InfiniteScrollProps;
  Input: InputProps;
  InputGroup: InputGroupProps;
  InputMask: InputMaskProps;
  InputNumber: InputNumberProps;
  InputOTP: InputOTPProps;
  InputSearch: InputSearchProps;
  Layout: LayoutProps;
  LayoutContent: HTMLAttributes<HTMLElement>;
  LayoutFooter: HTMLAttributes<HTMLElement>;
  LayoutHeader: HTMLAttributes<HTMLElement>;
  LayoutSider: LayoutSiderProps;
  Link: LinkProps;
  Loading: LoadingProps;
  LoadingBar: LoadingBarProps;
  Masonry: MasonryProps;
  Mentions: MentionsProps;
  Menu: MenuProps;
  MenuGroup: MenuGroupProps;
  Message: MessageProps;
  Modal: ModalProps;
  Notification: NotificationProps;
  Pagination: PaginationProps;
  Paragraph: ParagraphProps;
  Popconfirm: PopconfirmProps;
  Popover: PopoverProps;
  Progress: ProgressProps;
  QRCode: QRCodeProps;
  Radio: RadioProps;
  RadioGroup: RadioGroupProps;
  Rate: RateProps;
  Result: ResultProps;
  Row: RowProps;
  ScrollArea: ScrollAreaProps;
  Scrollbar: ScrollbarProps;
  Select: SelectProps;
  Skeleton: SkeletonProps;
  Slider: SliderProps;
  Space: SpaceProps;
  SplitButton: SplitButtonProps;
  Splitter: SplitterProps;
  Statistic: StatisticProps;
  Steps: StepsProps;
  Switch: SwitchProps;
  Tabs: TabsProps;
  Tag: TagProps;
  TagGroup: TagGroupProps;
  Text: TextProps;
  Textarea: TextareaProps;
  Timeline: TimelineProps;
  Title: TitleProps;
  Tooltip: TooltipProps;
  Tour: TourProps;
  Transfer: TransferProps;
  Tree: TreeProps;
  TreeSelect: TreeSelectProps;
  Typography: TypographyProps;
  Upload: UploadProps;
}

/** Default props for supported components; null clears that component's inherited defaults. */
export interface LeafComponentDefaults {
  Affix?: Partial<Omit<AffixProps, 'key' | 'ref'>> | null;
  Alert?: Partial<Omit<AlertProps, 'key' | 'ref' | 'title'>> | null;
  Anchor?: Partial<Omit<AnchorProps, 'key' | 'ref' | 'items'>> | null;
  AutoComplete?: Partial<Omit<AutoCompleteProps, 'key' | 'ref' | 'options'>> | null;
  Avatar?: Partial<Omit<AvatarProps, 'key' | 'ref'>> | null;
  AvatarGroup?: Partial<Omit<AvatarGroupProps, 'key' | 'ref'>> | null;
  BackTop?: Partial<Omit<BackTopProps, 'key' | 'ref'>> | null;
  Badge?: Partial<Omit<BadgeProps, 'key' | 'ref'>> | null;
  Breadcrumb?: Partial<Omit<BreadcrumbProps, 'key' | 'ref' | 'items'>> | null;
  Button?: Partial<Omit<ButtonProps, 'key' | 'ref'>> | null;
  ButtonGroup?: Partial<Omit<ButtonGroupProps, 'key' | 'ref'>> | null;
  Calendar?: Partial<Omit<CalendarProps, 'key' | 'ref'>> | null;
  Card?: Partial<Omit<CardProps, 'key' | 'ref'>> | null;
  CardTitle?: Partial<Omit<CardTitleProps, 'key' | 'ref'>> | null;
  Carousel?: Partial<Omit<CarouselProps, 'key' | 'ref'>> | null;
  Cascader?: Partial<
    Omit<
      CascaderProps,
      'key' | 'ref' | 'options' | 'multiple' | 'value' | 'defaultValue' | 'onChange'
    >
  > | null;
  CheckableTag?: Partial<Omit<CheckableTagProps, 'key' | 'ref'>> | null;
  Checkbox?: Partial<Omit<CheckboxProps, 'key' | 'ref'>> | null;
  CheckboxGroup?: Partial<Omit<CheckboxGroupProps, 'key' | 'ref' | 'options'>> | null;
  Col?: Partial<Omit<ColProps, 'key' | 'ref'>> | null;
  Collapse?: Partial<Omit<CollapseProps, 'key' | 'ref' | 'items'>> | null;
  ColorPicker?: Partial<Omit<ColorPickerProps, 'key' | 'ref'>> | null;
  Confirm?: Partial<Omit<ConfirmOptions, 'key' | 'ref'>> | null;
  Countdown?: Partial<Omit<CountdownProps, 'key' | 'ref' | 'value'>> | null;
  DataTable?: Partial<Omit<DataTablePresentationProps, 'tableRef'>> | null;
  DatePicker?: Partial<
    Omit<DatePickerProps, 'key' | 'ref' | 'value' | 'defaultValue' | 'onChange'>
  > | null;
  DateRangePicker?: Partial<Omit<DateRangePickerProps, 'key' | 'ref'>> | null;
  Descriptions?: Partial<Omit<DescriptionsProps, 'key' | 'ref' | 'items'>> | null;
  Divider?: Partial<Omit<DividerProps, 'key' | 'ref'>> | null;
  Drawer?: Partial<Omit<DrawerProps, 'key' | 'ref' | 'open'>> | null;
  Dropdown?: Partial<Omit<DropdownProps, 'key' | 'ref' | 'items' | 'children'>> | null;
  Empty?: Partial<Omit<EmptyProps, 'key' | 'ref'>> | null;
  ErrorBoundary?: Partial<Omit<ErrorBoundaryProps, 'key' | 'ref'>> | null;
  FileList?: Partial<Omit<FileListProps, 'key' | 'ref' | 'items'>> | null;
  Flex?: Partial<Omit<FlexProps, 'key' | 'ref'>> | null;
  FloatButton?: Partial<Omit<FloatButtonProps, 'key' | 'ref'>> | null;
  FloatButtonGroup?: Partial<Omit<FloatButtonGroupProps, 'key' | 'ref' | 'actions'>> | null;
  Form?: Partial<Omit<FormProps, 'key' | 'ref'>> | null;
  FormErrorSummary?: Partial<Omit<FormErrorSummaryProps, 'key' | 'ref'>> | null;
  FormField?: Partial<Omit<FormFieldProps, 'key' | 'ref'>> | null;
  FormGroup?: Partial<Omit<FormGroupProps, 'key' | 'ref'>> | null;
  FormList?: Partial<
    Omit<
      FormListProps<unknown>,
      'name' | 'children' | 'value' | 'defaultValue' | 'onChange' | 'itemKey'
    >
  > | null;
  Grid?: Partial<Omit<GridProps, 'key' | 'ref'>> | null;
  ImagePreview?: Omit<ImagePreviewOptions, 'onClose'> | null;
  InfiniteScroll?: Partial<
    Omit<InfiniteScrollProps, 'key' | 'ref' | 'dataLength' | 'hasMore' | 'onLoadMore'>
  > | null;
  Input?: Partial<Omit<InputProps, 'key' | 'ref'>> | null;
  InputGroup?: Partial<Omit<InputGroupProps, 'key' | 'ref'>> | null;
  InputMask?: Partial<Omit<InputMaskProps, 'key' | 'ref' | 'mask'>> | null;
  InputNumber?: Partial<
    Omit<
      InputNumberProps,
      'key' | 'ref' | 'stringMode' | 'value' | 'defaultValue' | 'onChange' | 'min' | 'max' | 'step'
    >
  > | null;
  InputOTP?: Partial<Omit<InputOTPProps, 'key' | 'ref'>> | null;
  InputSearch?: Partial<Omit<InputSearchProps, 'key' | 'ref'>> | null;
  Layout?: Partial<Omit<LayoutProps, 'key' | 'ref'>> | null;
  LayoutContent?: Partial<Omit<HTMLAttributes<HTMLElement>, 'key' | 'ref'>> | null;
  LayoutFooter?: Partial<Omit<HTMLAttributes<HTMLElement>, 'key' | 'ref'>> | null;
  LayoutHeader?: Partial<Omit<HTMLAttributes<HTMLElement>, 'key' | 'ref'>> | null;
  LayoutSider?: Partial<Omit<LayoutSiderProps, 'key' | 'ref'>> | null;
  Link?: Partial<Omit<LinkProps, 'key' | 'ref'>> | null;
  Loading?: Partial<Omit<LoadingProps, 'key' | 'ref'>> | null;
  LoadingBar?: Partial<Omit<LoadingBarProps, 'key' | 'ref' | 'active' | 'progress'>> | null;
  Masonry?: Partial<Omit<MasonryProps, 'key' | 'ref'>> | null;
  Mentions?: Partial<Omit<MentionsProps, 'key' | 'ref' | 'options'>> | null;
  Menu?: Partial<Omit<MenuProps, 'key' | 'ref' | 'items'>> | null;
  MenuGroup?: Partial<Omit<MenuGroupProps, 'key' | 'ref' | 'title'>> | null;
  Message?: Partial<Omit<MessageOptions, 'key' | 'content'>> | null;
  Modal?: Partial<Omit<ModalProps, 'key' | 'ref' | 'open'>> | null;
  Notification?: Partial<Omit<NotificationOptions, 'key' | 'title'>> | null;
  Pagination?: Partial<Omit<PaginationProps, 'key' | 'ref' | 'total'>> | null;
  Paragraph?: Partial<Omit<ParagraphProps, 'key' | 'ref'>> | null;
  Popconfirm?: Partial<Omit<PopconfirmProps, 'key' | 'ref' | 'children' | 'title'>> | null;
  Popover?: Partial<Omit<PopoverProps, 'key' | 'ref' | 'children' | 'content'>> | null;
  Progress?: Partial<Omit<ProgressProps, 'key' | 'ref'>> | null;
  QRCode?: Partial<Omit<QRCodeProps, 'key' | 'ref' | 'value'>> | null;
  Radio?: Partial<Omit<RadioProps, 'key' | 'ref'>> | null;
  RadioGroup?: Partial<Omit<RadioGroupProps, 'key' | 'ref' | 'options'>> | null;
  Rate?: Partial<Omit<RateProps, 'key' | 'ref'>> | null;
  Result?: Partial<Omit<ResultProps, 'key' | 'ref'>> | null;
  Row?: Partial<Omit<RowProps, 'key' | 'ref'>> | null;
  ScrollArea?: Partial<Omit<ScrollAreaProps, 'key' | 'ref'>> | null;
  Scrollbar?: Partial<Omit<ScrollbarProps, 'key' | 'ref'>> | null;
  /** Required data, mode-dependent values and callbacks belong on each Select. */
  Select?: Partial<
    Omit<
      SelectProps,
      'key' | 'ref' | 'options' | 'multiple' | 'value' | 'defaultValue' | 'onChange'
    >
  > | null;
  Skeleton?: Partial<Omit<SkeletonProps, 'key' | 'ref'>> | null;
  Slider?: Partial<
    Omit<SliderProps, 'key' | 'ref' | 'range' | 'value' | 'defaultValue' | 'onChange'>
  > | null;
  Space?: Partial<Omit<SpaceProps, 'key' | 'ref'>> | null;
  SplitButton?: Partial<Omit<SplitButtonProps, 'key' | 'ref' | 'items'>> | null;
  Splitter?: Partial<Omit<SplitterProps, 'key' | 'ref' | 'panels'>> | null;
  Statistic?: Partial<Omit<StatisticProps, 'key' | 'ref' | 'value'>> | null;
  Steps?: Partial<Omit<StepsProps, 'key' | 'ref' | 'items'>> | null;
  Switch?: Partial<Omit<SwitchProps, 'key' | 'ref'>> | null;
  Tabs?: Partial<Omit<TabsProps, 'key' | 'ref' | 'items'>> | null;
  Tag?: Partial<Omit<TagProps, 'key' | 'ref'>> | null;
  TagGroup?: Partial<Omit<TagGroupProps, 'key' | 'ref' | 'options'>> | null;
  Text?: Partial<Omit<TextProps, 'key' | 'ref'>> | null;
  Textarea?: Partial<Omit<TextareaProps, 'key' | 'ref'>> | null;
  Timeline?: Partial<Omit<TimelineProps, 'key' | 'ref' | 'items'>> | null;
  Title?: Partial<Omit<TitleProps, 'key' | 'ref'>> | null;
  Tooltip?: Partial<Omit<TooltipProps, 'key' | 'ref' | 'content' | 'children'>> | null;
  Tour?: Partial<Omit<TourProps, 'key' | 'ref' | 'open' | 'steps'>> | null;
  Transfer?: Partial<Omit<TransferProps, 'key' | 'ref' | 'items'>> | null;
  Tree?: Partial<Omit<TreeProps, 'key' | 'ref' | 'data'>> | null;
  TreeSelect?: Partial<
    Omit<
      TreeSelectProps,
      | 'key'
      | 'ref'
      | 'options'
      | 'multiple'
      | 'treeCheckable'
      | 'value'
      | 'defaultValue'
      | 'onChange'
    >
  > | null;
  Typography?: Partial<Omit<TypographyProps, 'key' | 'ref'>> | null;
  Upload?: Partial<Omit<UploadProps, 'key' | 'ref'>> | null;
  VirtualList?:
    | (Partial<
        Omit<VirtualListProps<unknown>, 'items' | 'itemKey' | 'renderItem' | 'estimateSize'>
      > & { estimateSize?: number })
    | null;
}

export const ComponentDefaultsContext = createContext<LeafComponentDefaults>({});

/** Supplement missing props without copying unless a defined default is used. */
export function mergeComponentProps<Props extends object>(
  defaults: Partial<Props> | null | undefined,
  props: Props,
): Props {
  if (!defaults) return props;
  let resolved = props;
  for (const key of Object.keys(defaults) as (keyof Props)[]) {
    const value = defaults[key];
    if (value !== undefined && props[key] === undefined) {
      if (resolved === props) resolved = { ...props };
      resolved[key] = value as Props[typeof key];
    }
  }
  return resolved;
}

/** Merge scopes by component and prop; nested prop values are replaced as a whole. */
export function mergeComponentDefaults(
  parent: LeafComponentDefaults,
  overrides: LeafComponentDefaults | undefined,
): LeafComponentDefaults {
  if (!overrides) return parent;
  let merged = parent;
  for (const name of Object.keys(overrides) as (keyof LeafComponentDefaults)[]) {
    const incoming = overrides[name];
    if (incoming === undefined) continue;
    const inherited = parent[name] ?? undefined;
    if (incoming === null) {
      if (inherited == null) continue;
      if (merged === parent) merged = { ...parent };
      delete merged[name];
      continue;
    }
    let entry = inherited;
    for (const key of Object.keys(incoming)) {
      const value = (incoming as Record<string, unknown>)[key];
      if (
        value === undefined ||
        value === (inherited as Record<string, unknown> | undefined)?.[key]
      )
        continue;
      if (entry === inherited) entry = { ...inherited };
      (entry as Record<string, unknown>)[key] = value;
    }
    if (entry !== inherited) {
      if (merged === parent) merged = { ...parent };
      // Each entry remains the same component's props; only the dynamic key loses that relation.
      (merged as Record<string, object | undefined>)[name] = entry;
    }
  }
  return merged;
}

export function useComponentProps<Name extends keyof ComponentPropsMap>(
  name: Name,
  props: ComponentPropsMap[Name],
): ComponentPropsMap[Name] {
  const defaults = useContext(ComponentDefaultsContext)[name];
  return mergeComponentProps(
    defaults as Partial<ComponentPropsMap[Name]> | null | undefined,
    props,
  );
}

/** Generic owners merge this type-independent projection into their own complete props. */
export function useGenericComponentDefaults<Name extends GenericComponentName>(name: Name) {
  return useContext(ComponentDefaultsContext)[name];
}

/** Read defaults for an API request without invoking hooks from the request callback. */
export function useComponentDefaults<Name extends keyof LeafComponentDefaults>(name: Name) {
  return useContext(ComponentDefaultsContext)[name];
}
