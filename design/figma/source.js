/* global figma, leafPalettes, leafDensity */
async function importLeafResources() {
  const fonts = await figma.listAvailableFontsAsync();
  const family = ['Inter', ...new Set(fonts.map((item) => item.fontName.family))].find((name) =>
    ['Regular', 'Medium', 'Bold'].every((style) =>
      fonts.some((item) => item.fontName.family === name && item.fontName.style === style),
    ),
  );
  if (!family) throw new Error('A font family with Regular, Medium and Bold is required.');
  const weights = Object.fromEntries(
    [
      [400, 'Regular'],
      [500, 'Medium'],
      [700, 'Bold'],
    ].map(([weight, style]) => [weight, { family, style }]),
  );
  await Promise.all(Object.values(weights).map((font) => figma.loadFontAsync(font)));
  const colors = figma.variables.createVariableCollection('Leaf / Color');
  colors.renameMode(colors.defaultModeId, 'Light');
  const dark = colors.addMode('Dark');
  const variables = {};
  for (const key of Object.keys(leafPalettes.light)) {
    const variable = figma.variables.createVariable(key, colors, 'COLOR');
    variable.setValueForMode(colors.defaultModeId, leafPalettes.light[key]);
    variable.setValueForMode(dark, leafPalettes.dark[key]);
    variables[key] = variable;
  }
  const pressedBackground = figma.variables.createVariable(
    'button-outline-active-background',
    colors,
    'COLOR',
  );
  for (const [mode, id] of [
    ['light', colors.defaultModeId],
    ['dark', dark],
  ]) {
    const surface = leafPalettes[mode].surface;
    const muted = leafPalettes[mode]['surface-muted'];
    pressedBackground.setValueForMode(id, {
      r: (surface.r + muted.r) / 2,
      g: (surface.g + muted.g) / 2,
      b: (surface.b + muted.b) / 2,
      a: 1,
    });
  }
  variables['button-outline-active-background'] = pressedBackground;
  const textHover = figma.variables.createVariable('button-text-hover-background', colors, 'COLOR');
  for (const [mode, id] of [
    ['light', colors.defaultModeId],
    ['dark', dark],
  ]) {
    const gray = leafPalettes[mode]['option-hover'];
    textHover.setValueForMode(id, { ...gray, a: gray.a * 0.5 });
  }
  variables['button-text-hover-background'] = textHover;
  const density = figma.variables.createVariableCollection('Leaf / Density');
  density.renameMode(density.defaultModeId, 'Comfortable');
  const compact = density.addMode('Compact');
  const dimensions = {};
  for (const key of Object.keys(leafDensity.comfortable)) {
    const variable = figma.variables.createVariable(key, density, 'FLOAT');
    variable.setValueForMode(density.defaultModeId, leafDensity.comfortable[key]);
    variable.setValueForMode(compact, leafDensity.compact[key]);
    dimensions[key] = variable;
  }
  const page = figma.createPage();
  page.name = 'Leaf UI / Components';
  await figma.setCurrentPageAsync(page);
  const paint = (key) =>
    figma.variables.setBoundVariableForPaint(
      { type: 'SOLID', color: { r: 0, g: 0, b: 0 } },
      'color',
      variables[key],
    );
  const label = (name, key = 'text', weight = 500) => {
    const node = figma.createText();
    node.fontName = weights[weight];
    node.fontSize = 14;
    node.characters = name;
    node.fills = [paint(key)];
    return node;
  };
  const buttons = [];
  for (const [index, mode] of ['comfortable', 'compact'].entries()) {
    for (const [row, variant] of ['solid', 'outline', 'text', 'link'].entries()) {
      for (const [col, state] of ['default', 'hover', 'pressed', 'disabled'].entries()) {
        const component = figma.createComponent();
        component.name = `Variant=${variant}, State=${state}, Density=${mode}`;
        component.layoutMode = 'HORIZONTAL';
        component.primaryAxisAlignItems = 'CENTER';
        component.counterAxisAlignItems = 'CENTER';
        component.primaryAxisSizingMode = 'FIXED';
        component.counterAxisSizingMode = 'FIXED';
        component.resize(136, leafDensity[mode]['control-height']);
        component.cornerRadius = 8;
        component.setExplicitVariableModeForCollection(
          density,
          index ? compact : density.defaultModeId,
        );
        component.setBoundVariable('height', dimensions['control-height']);
        const background =
          variant === 'solid'
            ? state === 'pressed'
              ? 'primary-active'
              : 'primary'
            : variant === 'outline'
              ? state === 'pressed'
                ? 'button-outline-active-background'
                : 'surface'
              : variant === 'text' && (state === 'hover' || state === 'pressed')
                ? state === 'hover'
                  ? 'button-text-hover-background'
                  : 'option-hover'
                : null;
        component.fills = background ? [paint(background)] : [];
        if (variant === 'outline') {
          component.strokes = [
            paint(
              state === 'pressed' ? 'border-hover' : state === 'hover' ? 'border-hover' : 'border',
            ),
          ];
          component.strokeWeight = 1;
          component.effects = [
            {
              type: 'DROP_SHADOW',
              color: { r: 0, g: 0, b: 0, a: 0.06 },
              offset: { x: 0, y: 1 },
              radius: 1,
              spread: 0,
              visible: true,
              blendMode: 'NORMAL',
            },
          ];
        }
        component.appendChild(
          label(
            'Button',
            variant === 'solid' ? 'on-primary' : variant === 'link' ? 'primary-ink' : 'text',
          ),
        );
        if (state === 'disabled') component.opacity = 0.45;
        component.x = col * 164;
        component.y = (index * 5 + row) * 68;
        page.appendChild(component);
        buttons.push(component);
      }
    }
  }
  const buttonSet = figma.combineAsVariants(buttons, page);
  buttonSet.name = 'Leaf / Button';
  buttonSet.x = 32;
  buttonSet.y = 80;
  const inputs = [];
  for (const [index, mode] of ['comfortable', 'compact'].entries()) {
    for (const [col, state] of ['default', 'focus', 'error', 'disabled'].entries()) {
      const component = figma.createComponent();
      component.name = `State=${state}, Density=${mode}`;
      component.layoutMode = 'HORIZONTAL';
      component.primaryAxisAlignItems = 'MIN';
      component.counterAxisAlignItems = 'CENTER';
      component.primaryAxisSizingMode = 'FIXED';
      component.counterAxisSizingMode = 'FIXED';
      component.paddingLeft = leafDensity[mode]['density-field-padding'];
      component.resize(240, leafDensity[mode]['control-height']);
      component.cornerRadius = 8;
      component.fills = [paint('surface')];
      component.strokes = [
        paint(state === 'error' ? 'danger' : state === 'focus' ? 'primary' : 'border'),
      ];
      component.appendChild(
        label('Field value', state === 'disabled' ? 'text-muted' : 'text', 400),
      );
      component.setExplicitVariableModeForCollection(
        density,
        index ? compact : density.defaultModeId,
      );
      component.setBoundVariable('height', dimensions['control-height']);
      if (state === 'disabled') component.opacity = 0.55;
      component.x = col * 264;
      component.y = index * 68;
      page.appendChild(component);
      inputs.push(component);
    }
  }
  const inputSet = figma.combineAsVariants(inputs, page);
  inputSet.name = 'Leaf / Input';
  inputSet.x = 32;
  inputSet.y = 720;
  const title = label('Leaf UI · Editable variables and component variants', 'text', 700);
  title.fontSize = 24;
  title.x = 32;
  title.y = 24;
  page.appendChild(title);
  figma.viewport.scrollAndZoomIntoView([buttonSet, inputSet]);
  figma.closePlugin('Leaf variables and editable Button/Input variants created.');
}
importLeafResources().catch((error) => figma.closePlugin(String(error)));
