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
  const groups = [...new Set(components.map((component) => component.category))];
  return (
    <div className="leaf-component-overview">
      {groups.map((group) => (
        <section key={group} className="leaf-component-group">
          <h2>{group}</h2>
          <div className="leaf-component-grid">
            {components
              .filter((component) => component.category === group)
              .map((component) => (
                <a
                  key={component.slug}
                  className="leaf-component-card"
                  href={url(`/components/${component.slug}.html`)}
                >
                  <div className="leaf-component-card__preview">
                    <img
                      data-no-zoom
                      src={withBase(`/components/${component.slug}.svg`)}
                      alt=""
                      width={240}
                      height={128}
                      loading="lazy"
                      decoding="async"
                    />
                  </div>
                  <div className="leaf-component-card__body">
                    <h3>
                      {component.name} {!english && <span>{component.label}</span>}
                      <ArrowUpRight size={15} aria-hidden="true" />
                    </h3>
                    <p>{component.description}</p>
                  </div>
                </a>
              ))}
          </div>
        </section>
      ))}
    </div>
  );
}
