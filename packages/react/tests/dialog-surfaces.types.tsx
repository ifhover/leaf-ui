import { Drawer, type LeafComponentDefaults, Modal } from '../src';

export function dialogSurfaceTypeContracts() {
  const modal = <Modal open />;
  const drawer = <Drawer open />;
  // @ts-expect-error Dialogs no longer expose a card appearance.
  const cardModal = <Modal open variant="card" />;
  // @ts-expect-error The sole dialog surface no longer needs a variant prop.
  const plainModal = <Modal open variant="plain" />;
  // @ts-expect-error Drawers no longer expose a card appearance.
  const cardDrawer = <Drawer open variant="card" />;
  // @ts-expect-error The sole drawer surface no longer needs a variant prop.
  const plainDrawer = <Drawer open variant="plain" />;
  // @ts-expect-error Regional defaults use the same public Modal API.
  const modalDefaults: LeafComponentDefaults = { Modal: { variant: 'card' } };
  // @ts-expect-error Regional defaults use the same public Drawer API.
  const drawerDefaults: LeafComponentDefaults = { Drawer: { variant: 'card' } };
  return {
    modal,
    drawer,
    cardModal,
    plainModal,
    cardDrawer,
    plainDrawer,
    modalDefaults,
    drawerDefaults,
  };
}
