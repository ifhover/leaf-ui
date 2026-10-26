import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { useComponentProps } from '../config-provider/component-defaults';
import { classes } from '../shared/classes';

export interface CardTitleProps extends HTMLAttributes<HTMLHeadingElement> {
  /** Matches the title typography of the corresponding Card size. */
  size?: 'sm' | 'md' | 'lg';
  /** Supporting text beneath the heading. */
  description?: ReactNode;
  /** Trailing heading actions. */
  extra?: ReactNode;
  /** Optional semantic heading level; defaults to the same h3 as the Card title. */
  level?: 1 | 2 | 3 | 4 | 5 | 6;
  /** Attributes for the wrapper that aligns description and trailing content with the heading. */
  containerProps?: Omit<HTMLAttributes<HTMLDivElement>, 'children'>;
}

/** Internal primitive; Card owns its heading level and does not read standalone defaults. */
export const CardTitleControl = forwardRef<HTMLHeadingElement, CardTitleProps>(
  function CardTitleControl(
    {
      size = 'md',
      level = 3,
      description,
      extra,
      containerProps,
      className,
      children,
      ...props
    }: CardTitleProps,
    ref,
  ) {
    const Heading = `h${level}` as const;
    const heading = (
      <Heading
        {...props}
        ref={ref}
        className={classes('leaf-card-title', `leaf-card-title--${size}`, className)}
      >
        {children}
      </Heading>
    );
    if (description == null && extra == null && containerProps == null) return heading;
    return (
      <div
        {...containerProps}
        className={classes('leaf-card-title-group', containerProps?.className)}
      >
        <div className="leaf-card-title-group__heading">
          {heading}
          {description != null && (
            <div className="leaf-card-title-group__description">{description}</div>
          )}
        </div>
        {extra != null && <div className="leaf-card-title-group__extra">{extra}</div>}
      </div>
    );
  },
);

export const CardTitle = forwardRef<HTMLHeadingElement, CardTitleProps>(
  function CardTitle(rawProps, ref) {
    return <CardTitleControl {...useComponentProps('CardTitle', rawProps)} ref={ref} />;
  },
);
