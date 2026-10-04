import { useState } from 'react';
import Lightbox from 'yet-another-react-lightbox';
import Counter from 'yet-another-react-lightbox/plugins/counter';
import Download from 'yet-another-react-lightbox/plugins/download';
import Fullscreen from 'yet-another-react-lightbox/plugins/fullscreen';
import Thumbnails from 'yet-another-react-lightbox/plugins/thumbnails';
import Zoom from 'yet-another-react-lightbox/plugins/zoom';
import { ScopedPortal } from '../shared/scoped-portal';
import { useText } from '../shared/use-text';
import type { ImagePreviewProps } from './image';

export function ImageViewer(props: ImagePreviewProps) {
  return (
    <ScopedPortal>
      <Viewer {...props} />
    </ScopedPortal>
  );
}
function Viewer({
  items,
  open,
  index = 0,
  onClose,
  onIndexChange,
  thumbnails = true,
  downloadable = false,
}: ImagePreviewProps) {
  const [root, setRoot] = useState<HTMLDivElement | null>(null);
  const t = useText();
  return (
    <div ref={setRoot} className="leaf-image-viewer">
      {root && (
        <Lightbox
          open={open && items.length > 0}
          close={onClose}
          slides={items.map((item) => ({ ...item }))}
          index={Math.max(0, Math.min(index, items.length - 1))}
          portal={{ root }}
          plugins={[
            Zoom,
            Counter,
            Fullscreen,
            ...(thumbnails ? [Thumbnails] : []),
            ...(downloadable ? [Download] : []),
          ]}
          on={{
            view: ({ index: next }) => {
              if (next !== index) onIndexChange?.(next);
            },
          }}
          carousel={{ finite: items.length < 2 }}
          zoom={{ maxZoomPixelRatio: 3 }}
          controller={{ closeOnBackdropClick: true }}
          labels={{
            Close: t('关闭', 'Close'),
            Next: t('下一张', 'Next'),
            Previous: t('上一张', 'Previous'),
            'Zoom in': t('放大', 'Zoom in'),
            'Zoom out': t('缩小', 'Zoom out'),
            Download: t('下载', 'Download'),
            'Enter Fullscreen': t('进入全屏', 'Enter Fullscreen'),
            'Exit Fullscreen': t('退出全屏', 'Exit Fullscreen'),
          }}
          styles={{
            root: {
              '--yarl__color_backdrop': 'rgba(0,0,0,.9)',
              '--yarl__container_background_color': 'rgba(0,0,0,.9)',
              '--yarl__thumbnails_thumbnail_border_radius': 'var(--leaf-radius-sm)',
              zIndex: 'var(--leaf-z-index-modal)',
            },
          }}
        />
      )}
    </div>
  );
}
