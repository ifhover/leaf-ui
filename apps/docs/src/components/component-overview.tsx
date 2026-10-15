import './component-overview.scss';
import { ArrowUpRight } from 'lucide-react';
import { useState } from 'react';
import { componentCatalog } from './component-catalog';
import { ComponentFilter, matchesComponentQuery } from './component-filter';
import { componentThumbnails } from './component-thumbnails';
import { useDocsTheme } from './docs-theme';
import { useDocsLocale } from './i18n';

export function ComponentOverview() {
  const { english, t, url } = useDocsLocale();
  const { color } = useDocsTheme();
  const [query, setQuery] = useState('');
  const components = componentCatalog
    .filter(([name, label, slug]) => matchesComponentQuery(query, `${name} ${label} ${slug}`))
    .map(([name, label, slug, zhCategory, enCategory, zhDesc, enDesc]) => ({
      name,
      label,
      slug,
      category: t(zhCategory, enCategory),
      description: t(zhDesc, enDesc),
    }));
  const groups = [...new Set(components.map((component) => component.category))];
  return (
    <div className="leaf-component-overview">
      <ComponentFilter
        value={query}
        onChange={setQuery}
        label={t('过滤所有组件', 'Filter all components')}
      />
      {components.length === 0 && (
        <p className="leaf-component-overview__empty" role="status">
          {t('没有匹配的组件，试试其他关键词。', 'No matching components. Try another keyword.')}
        </p>
      )}
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
                  <div
                    className="leaf-component-card__preview"
                    aria-hidden="true"
                    // biome-ignore lint/security/noDangerouslySetInnerHtml: Only repository-owned static SVG markup is inlined.
                    dangerouslySetInnerHTML={{
                      __html: (componentThumbnails[component.slug] ?? '').replace(
                        '>#20834A<',
                        `>${color.toUpperCase()}<`,
                      ),
                    }}
                  />
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
