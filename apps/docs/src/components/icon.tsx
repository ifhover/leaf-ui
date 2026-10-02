import {
  ArrowRight,
  Check,
  ChevronDown,
  CodeXml,
  Copy,
  Download,
  Heart,
  Leaf,
  type LucideProps,
  Moon,
  Plus,
  SlidersHorizontal,
  Sparkles,
  Sun,
  WrapText,
} from 'lucide-react';

// A small naming adapter for the documentation UI; every glyph comes from Lucide.
const icons = {
  arrow: ArrowRight,
  check: Check,
  chevron: ChevronDown,
  code: CodeXml,
  copy: Copy,
  download: Download,
  heart: Heart,
  leaf: Leaf,
  moon: Moon,
  plus: Plus,
  sliders: SlidersHorizontal,
  sparkles: Sparkles,
  sun: Sun,
  wrap: WrapText,
} as const;

export function Icon({ name, ...props }: LucideProps & { name: keyof typeof icons }) {
  const Component = icons[name];
  return <Component width={20} height={20} strokeWidth={1.7} aria-hidden="true" {...props} />;
}
