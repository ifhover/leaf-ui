import { useEffect, useRef, useState } from 'react';
import { deepActiveElement } from '../shared/dom';
import { useClient } from '../shared/use-client';
import type { ImageViewerProps } from './types';
import { ImageViewer } from './viewer';

interface ImagePreviewControlProps extends ImageViewerProps {
  returnFocus?: HTMLElement | null;
}
export function ImagePreviewControl({ returnFocus, ...props }: ImagePreviewControlProps) {
  const client = useClient();
  const [visited, setVisited] = useState(props.open);
  const wasOpen = useRef(false);
  const opener = useRef<HTMLElement | null>(null);
  const requestedOpener = useRef(returnFocus);
  requestedOpener.current = returnFocus;
  // Safari may omit focus-event relatedTarget; snapshot before the dialog takes focus.
  if (props.open && !wasOpen.current && typeof document !== 'undefined') {
    const active = deepActiveElement();
    opener.current =
      returnFocus === undefined ? (active instanceof HTMLElement ? active : null) : returnFocus;
  }
  wasOpen.current = props.open;
  useEffect(() => {
    if (!props.open) return;
    const target = opener.current;
    return () => {
      const restore = requestedOpener.current === undefined ? target : requestedOpener.current;
      if (restore?.isConnected) restore.focus({ preventScroll: true });
      // React's parent cleanup runs before the dialog releases its focus trap.
      queueMicrotask(() => {
        if (restore?.isConnected && deepActiveElement() === document.body)
          restore.focus({ preventScroll: true });
      });
    };
  }, [props.open]);
  useEffect(() => {
    if (props.open) setVisited(true);
  }, [props.open]);
  if (!client || (!props.open && !visited)) return null;
  return (
    <ImageViewer
      {...props}
      onHidden={() => {
        const restore =
          requestedOpener.current === undefined ? opener.current : requestedOpener.current;
        if (restore?.isConnected) restore.focus({ preventScroll: true });
        props.onHidden?.();
      }}
    />
  );
}
