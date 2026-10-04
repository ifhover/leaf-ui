import { useLocation, useNavigate } from '@rspress/core/runtime';
import { useEffect } from 'react';
import { useDocsLocale } from './i18n';

/** Preserve published installation URLs after merging the guide. */
export function InstallationRedirect() {
  const { english, t, url } = useDocsLocale();
  const { search, hash } = useLocation();
  const navigate = useNavigate();
  const destination = `${english ? '/en' : ''}/guide/getting-started.html${search}${hash}`;

  useEffect(() => {
    navigate(destination, { replace: true });
  }, [destination, navigate]);

  return (
    <p>
      <a href={`${url('/guide/getting-started.html')}${search}${hash}`}>
        {t('查看安装与快速开始指南', 'Read the installation and quick start guide')}
      </a>
    </p>
  );
}
