import type { Announcements, UniqueIdentifier } from '@dnd-kit/core';
import { useFormattedText } from './use-formatted-text';
import { useText } from './use-text';

export function useDragAnnouncements(label: (id: UniqueIdentifier) => string, tree = false) {
  const t = useText();
  const format = useFormattedText();
  const announcements: Announcements = {
    onDragStart: ({ active }) => format('drag.pickedUp', { label: label(active.id) }),
    onDragOver: ({ over }) =>
      over ? format('drag.moved', { label: label(over.id) }) : t('drag.outside'),
    onDragEnd: ({ active, over }) =>
      over ? format('drag.dropped', { label: label(active.id) }) : t('drag.cancelled'),
    onDragCancel: () => t('drag.cancelled'),
  };
  return {
    screenReaderInstructions: {
      draggable: t(tree ? 'tree.reorderInstructions' : 'drag.instructions'),
    },
    announcements,
  };
}
