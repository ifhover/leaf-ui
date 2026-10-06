/* global figma, leafPalettes, leafDensity */
async function importLeafResources() {
  const fonts = await figma.listAvailableFontsAsync();
  const font =
    fonts.find((item) => item.fontName.family === 'Inter' && item.fontName.style === 'Medium')
      ?.fontName ?? fonts.find((item) => item.fontName.style === 'Regular')?.fontName;
  if (!font) throw new Error('No usable font is available.');
  await figma.loadFontAsync(font);
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
  const label = (name, key = 'text') => {
    const node = figma.createText();
    node.fontName = font;
    node.fontSize = 14;
    node.characters = name;
    node.fills = [paint(key)];
    return node;
  };
  const buttons = [];
  for (const [index, mode] of ['comfortable', 'compact'].entries()) {
    for (const [row, variant] of ['solid', 'soft', 'outline', 'ghost'].entries()) {
      for (const [col, state] of ['default', 'hover', 'pressed', 'disabled'].entries()) {
        const component = figma.createComponent();
        component.name = `Variant=${variant}, State=${state}, Density=${mode}`;
        component.layoutMode = 'HORIZONTAL';
        component.primaryAxisAlignItems = 'CENTER';
        component.counterAxisAlignItems = 'CENTER';
        component.primaryAxisSizingMode = 'FIXED';
        component.counterAxisSizingMode = 'FIXED';
        component.resize(136, leafDensity[mode]['control-height']);
        component.cornerRadius = 10;
        component.setExplicitVariableModeForCollection(
          density,
          index ? compact : density.defaultModeId,
        );
        component.setBoundVariable('height', dimensions['control-height']);
        const background =
          variant === 'solid'
            ? ['hover', 'pressed'].includes(state)
              ? 'primary-white-97-5'
              : 'primary'
            : variant === 'soft'
              ? `primary-alpha-${state === 'hover' ? 18 : state === 'pressed' ? 25 : 11}`
              : variant === 'outline'
                ? `surface-muted-border-${['hover', 'pressed'].includes(state) ? 75 : 65}`
                : state === 'hover'
                  ? 'surface-muted'
                  : state === 'pressed'
                    ? 'border'
                    : null;
        component.fills = background ? [paint(background)] : [];
        component.appendChild(
          label(
            'Button',
            variant === 'solid' ? 'on-primary' : variant === 'soft' ? 'primary' : 'text',
          ),
        );
        if (state === 'disabled') component.opacity = 0.45;
        component.x = col * 164;
        component.y = (index * 4 + row) * 68;
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
      component.cornerRadius = 10;
      component.fills = [paint('surface')];
      component.strokes = [
        paint(state === 'error' ? 'danger' : state === 'focus' ? 'primary' : 'border'),
      ];
      component.appendChild(label('Field value', state === 'disabled' ? 'text-muted' : 'text'));
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
  const title = label('Leaf UI · Editable variables and component variants');
  title.fontSize = 24;
  title.x = 32;
  title.y = 24;
  page.appendChild(title);
  figma.viewport.scrollAndZoomIntoView([buttonSet, inputSet]);
  figma.closePlugin('Leaf variables and editable Button/Input variants created.');
}
importLeafResources().catch((error) => figma.closePlugin(String(error)));
