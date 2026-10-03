import { writeFile } from 'node:fs/promises';
import { CalendarDays, Check, ChevronDown, ChevronRight, Clock3, Search } from 'lucide-react';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

const colors = { green: '#20834a', border: '#dce5de', text: '#203329', muted: '#6c7c71' };
const rect = (x, y, width, height, fill = '#fff', stroke = colors.border, radius = 6) =>
  `<rect x="${x}" y="${y}" width="${width}" height="${height}" rx="${radius}" fill="${fill}" stroke="${stroke}"/>`;
const text = (x, y, value, color = colors.text, fontSize = 10) =>
  `<text x="${x}" y="${y}" fill="${color}" font-size="${fontSize}" font-family="system-ui,sans-serif">${value}</text>`;
const icon = (Component, x, y, color = colors.muted, size = 13) =>
  `<g transform="translate(${x} ${y})">${renderToStaticMarkup(createElement(Component, { color, size, strokeWidth: 1.8 }))}</g>`;
const image = (title, content) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="240" height="128" viewBox="0 0 240 128" fill="none"><title>${title}</title>${content}</svg>\n`;
const field = (label, Icon = ChevronDown) =>
  rect(25, 8, 190, 26, '#fff', colors.green) +
  text(36, 25, label) +
  icon(Icon, 193, 14, colors.green);

const select =
  field('Design studio') +
  rect(25, 39, 190, 80) +
  rect(30, 44, 180, 23, '#eaf4ed', 'none', 4) +
  text(38, 60, 'Design studio', colors.green) +
  icon(Check, 190, 49, colors.green) +
  text(38, 83, 'Product team') +
  text(38, 106, 'Engineering');

let date =
  field('2026-10-15', CalendarDays) +
  rect(25, 39, 190, 80) +
  text(87, 55, 'October 2026', colors.text, 9) +
  text(40, 69, 'M     T     W     T     F     S     S', colors.muted, 8);
for (let row = 0; row < 2; row += 1) {
  for (let col = 0; col < 7; col += 1) {
    const value = 12 + row * 7 + col;
    const x = 35 + col * 25;
    const y = 75 + row * 20;
    if (value === 15) date += rect(x - 1, y - 1, 22, 19, colors.green, 'none', 4);
    date += text(x + 4, y + 12, value, value === 15 ? '#fff' : colors.text, 9);
  }
}

const time =
  field('14:30', Clock3) +
  rect(49, 39, 142, 80) +
  text(80, 53, 'HH', colors.muted, 8) +
  text(145, 53, 'mm', colors.muted, 8) +
  rect(55, 70, 57, 22, '#eaf4ed', 'none', 4) +
  rect(128, 70, 57, 22, '#eaf4ed', 'none', 4) +
  text(78, 67, '13') +
  text(78, 85, '14', colors.green) +
  text(150, 67, '15') +
  text(150, 85, '30', colors.green) +
  text(58, 110, 'Now', colors.green, 8) +
  rect(143, 99, 36, 15, colors.green, 'none', 3) +
  text(154, 110, 'OK', '#fff', 8);

const autocomplete =
  field('Leaf', Search) +
  rect(25, 39, 190, 80) +
  rect(30, 44, 180, 23, '#eaf4ed', 'none', 4) +
  text(38, 60, 'Leaf Garden', colors.green) +
  text(38, 83, 'Leaf Studio') +
  text(38, 106, 'Leaf Notes');

const cascader =
  field('Design / Interface') +
  rect(17, 39, 206, 80) +
  '<path d="M119 43V115" stroke="#dce5de"/>' +
  rect(23, 45, 89, 24, '#eaf4ed', 'none', 4) +
  rect(125, 45, 92, 24, '#eaf4ed', 'none', 4) +
  text(30, 61, 'Design', colors.green) +
  icon(ChevronRight, 94, 51, colors.green, 11) +
  text(30, 85, 'Engineering') +
  icon(ChevronRight, 94, 75, colors.muted, 11) +
  text(133, 61, 'Interface', colors.green) +
  icon(Check, 199, 51, colors.green, 11) +
  text(133, 85, 'Brand') +
  text(30, 109, 'Archived', colors.muted);

for (const [name, content] of [
  ['select', select],
  ['date-picker', date],
  ['time-picker', time],
  ['auto-complete', autocomplete],
  ['cascader', cascader],
]) {
  await writeFile(
    new URL(`../docs/public/components/${name}.svg`, import.meta.url),
    image(`${name} component preview`, content),
  );
}
