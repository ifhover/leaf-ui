import type { SVGProps } from 'react';

const paths = {
  chevron: 'm6 9 6 6 6-6',
  wrap: 'M4 6h16M4 11h12a4 4 0 0 1 0 8h-4m3-3-3 3 3 3M4 16h3',
  leaf: 'M20 4c-8-1-15 2-15 9a7 7 0 0 0 7 7c7 0 10-7 8-16ZM4 21l11-11',
  arrow: 'M4 12h16m-6-6 6 6-6 6',
  check: 'm5 12 4 4L19 6',
  code: 'm8 6-6 6 6 6m8-12 6 6-6 6m-3-15-2 18',
  sliders: 'M4 6h16M4 12h16M4 18h16M8 3v6m8 0v6m-5 0v6',
  copy: 'M9 8h10a1 1 0 0 1 1 1v11H9V8ZM15 8V4H4v11h5',
  sun: 'M12 3v2m0 14v2M3 12h2m14 0h2M5 5l2 2m10 10 2 2M5 19l2-2M17 7l2-2M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z',
  moon: 'M20 14A8 8 0 0 1 10 4 8 8 0 1 0 20 14Z',
  plus: 'M12 5v14M5 12h14',
  download: 'M12 3v12m-5-5 5 5 5-5M5 17v4h14v-4',
  sparkles: 'm12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5L12 3Z',
  heart: 'M20 5c-2-2-6-1-8 2-2-3-6-4-8-2-4 4 0 9 8 15 8-6 12-11 8-15Z',
} as const;

export function Icon({ name, ...props }: SVGProps<SVGSVGElement> & { name: keyof typeof paths }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d={paths[name]} />
    </svg>
  );
}
