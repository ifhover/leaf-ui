import './component-overview.scss';
import { withBase } from '@rspress/core/runtime';
import { ArrowUpRight } from 'lucide-react';
import { componentCatalog } from './component-catalog';
import { useDocsLocale } from './i18n';

export function ComponentOverview() {
  const { english, t, url } = useDocsLocale();
  const components = componentCatalog.map(
    ([name, label, slug, zhCategory, enCategory, zhDesc, enDesc]) => ({
      name,
      label,
      slug,
      category: t(zhCategory, enCategory),
      description: t(zhDesc, enDesc),
    }),
  );
  return (
    <div className="leaf-component-grid">
      {components.map((component) => (
        <a
          key={component.slug}
          className="leaf-component-card"
          href={url(`/components/${component.slug}.html`)}
        >
          <div className="leaf-component-card__preview">
            <img
              src={withBase(`/components/${component.slug}.svg`)}
              alt=""
              width={240}
              height={128}
              loading="lazy"
              decoding="async"
            />
          </div>
          <div className="leaf-component-card__body">
            <span className="leaf-component-card__category">{component.category}</span>
            <h3>
              {component.name} {!english && <span>{component.label}</span>}
              <ArrowUpRight size={15} aria-hidden="true" />
            </h3>
            <p>{component.description}</p>
          </div>
        </a>
      ))}
    </div>
  );
}
