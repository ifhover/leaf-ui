import { ComponentDefaultsContext } from '../config-provider/component-defaults';
import { ConfigContext } from '../config-provider/context';
import { leafDensityVariables } from '../density';
import { leafThemeVariables } from '../theme';
import { ImagePreviewControl } from './image';
import type { ImagePreviewRequest } from './provider';

interface PreviewRendererProps {
  request: ImagePreviewRequest;
  onClose: () => void;
  onIndexChange: (index: number) => void;
}

export default function PreviewRenderer({ request, onClose, onIndexChange }: PreviewRendererProps) {
  return (
    <ConfigContext.Provider value={request.config}>
      <ComponentDefaultsContext.Provider value={request.components}>
        <div
          style={{
            ...leafDensityVariables(request.config.density),
            ...leafThemeVariables(request.config.theme),
            display: 'contents',
          }}
          lang={request.config.locale}
          data-leaf-density={request.config.density}
          data-leaf-theme={request.config.theme.appearance}
          dir={request.config.direction}
        >
          <ImagePreviewControl
            {...request.options}
            session={request.id}
            items={request.items}
            open={request.open}
            index={request.index}
            returnFocus={request.returnFocus}
            onClose={onClose}
            onIndexChange={onIndexChange}
          />
        </div>
      </ComponentDefaultsContext.Provider>
    </ConfigContext.Provider>
  );
}
