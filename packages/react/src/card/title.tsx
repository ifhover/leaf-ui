import { forwardRef, type HTMLAttributes } from 'react';
import { useComponentProps } from '../config-provider/component-defaults';
import { classes } from '../shared/classes';

export interface CardTitleProps extends HTMLAttributes<HTMLHeadingElement> {
  /** Matches the title typography of the corresponding Card size. */
  size?: 'sm' | 'md' | 'lg';
  /** Semantic heading level, independent of its visual size. */
  level?: 1 | 2 | 3 | 4 | 5 | 6;
}

/** Internal primitive; Card owns its title size and does not read standalone defaults. */
export const CardTitleControl = forwardRef<HTMLHeadingElement, CardTitleProps>(
  function CardTitleControl({ size = 'md', level = 3, className, ...props }: CardTitleProps, ref) {
    const Heading = `h${level}` as const;
    return (
      <Heading
        {...props}
        ref={ref}
        className={classes('leaf-card-title', `leaf-card-title--${size}`, className)}
      />
    );
  },
);

export const CardTitle = forwardRef<HTMLHeadingElement, CardTitleProps>(
  function CardTitle(rawProps, ref) {
    return <CardTitleControl {...useComponentProps('CardTitle', rawProps)} ref={ref} />;
  },
);
