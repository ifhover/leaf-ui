import type { Locator } from '@playwright/test';

async function readColor(
  locator: Locator,
  property: string,
  token?: string,
  pseudo?: string | null,
) {
  return locator.evaluate(
    (node, options) => {
      const style = getComputedStyle(node, options.pseudo);
      const value = style.getPropertyValue(options.token ?? options.property).trim();
      if (!CSS.supports('color', value)) throw new Error(`Unresolved test color: ${value}`);
      const context = document.createElement('canvas').getContext('2d');
      if (!context) throw new Error('Canvas context unavailable');
      context.fillStyle = value;
      context.fillRect(0, 0, 1, 1);
      return { value: context.fillStyle, channels: [...context.getImageData(0, 0, 1, 1).data] };
    },
    { property, token, pseudo },
  );
}

export async function colorChannels(locator: Locator, token?: string) {
  return (await readColor(locator, 'background-color', token)).channels;
}

export async function paintColor(
  locator: Locator,
  property = 'backgroundColor',
  pseudo: string | null = null,
) {
  const cssProperty = property.replace(/[A-Z]/gu, (letter) => `-${letter.toLowerCase()}`);
  return (await readColor(locator, cssProperty, undefined, pseudo)).value;
}
