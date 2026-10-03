import { writeFile } from 'node:fs/promises';
import { CalendarDays, Check, CircleAlert, CircleX, Info, Palette, X } from 'lucide-react';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

const rect = (x, y, w, h, fill = '#fff', stroke = '#dce5de', r = 6) =>
  `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${fill}" stroke="${stroke}"/>`;
const text = (x, y, value, color = '#203329', size = 10) =>
  `<text x="${x}" y="${y}" fill="${color}" font-size="${size}" font-family="system-ui,sans-serif">${value}</text>`;
const icon = (component, x, y, color = '#20834a') =>
  `<g transform="translate(${x} ${y})">${renderToStaticMarkup(createElement(component, { size: 14, color, strokeWidth: 1.8 }))}</g>`;
const button = (x, y, label, fill = '#20834a') =>
  rect(x, y, 52, 22, fill, 'none', 5) + text(x + 10, y + 15, label, '#fff', 9);
const dialog = (title, body, confirm = false) =>
  rect(20, 9, 200, 110, '#00000040', 'none', 9) +
  rect(36, 18, 168, 92) +
  text(confirm ? 69 : 48, 36, title, '#203329', 11) +
  icon(X, 182, 24, '#6c7c71') +
  text(confirm ? 69 : 48, 58, body) +
  (confirm ? icon(CircleX, 48, 24, '#c83c3c') : '') +
  rect(82, 78, 52, 22) +
  text(91, 93, 'Cancel', '#6c7c71', 9) +
  button(140, 78, confirm ? 'Delete' : 'Save', confirm ? '#c83c3c' : '#20834a');
const images = {
  form:
    text(24, 37, 'Name') +
    rect(84, 20, 132, 24) +
    text(94, 36, 'Leaf Garden') +
    text(24, 71, 'Email') +
    rect(84, 54, 132, 24) +
    text(94, 70, 'hello@leaf.design', '#6c7c71', 9) +
    button(84, 90, 'Save'),
  'config-provider':
    rect(14, 20, 100, 87, '#f4effb', '#d9cdee', 8) +
    rect(126, 20, 100, 87, '#eaf5f5', '#bfdfe1', 15) +
    icon(Palette, 27, 33, '#7654c6') +
    text(48, 44, 'English') +
    button(37, 66, 'Save', '#7654c6') +
    icon(Palette, 140, 33, '#087f8c') +
    text(160, 44, 'Chinese') +
    button(151, 66, 'Save', '#087f8c'),
  modal: dialog('Project settings', 'Name: Leaf Garden'),
  confirm: dialog('Delete project?', 'This cannot be undone.', true),
  dropdown:
    rect(59, 7, 122, 25) +
    text(72, 24, 'More actions') +
    rect(59, 38, 122, 82) +
    rect(64, 43, 112, 22, '#eaf4ed', 'none', 4) +
    text(75, 58, 'Edit', '#20834a') +
    text(75, 81, 'Copy') +
    `<path d="M66 91h108" stroke="#dce5de"/>` +
    text(75, 108, 'Delete', '#c83c3c'),
  alert:
    rect(18, 30, 204, 68, '#eaf4ed', '#b9d8c3') +
    icon(Check, 30, 45) +
    text(53, 57, 'Project saved', '#20834a', 11) +
    text(53, 77, 'Your changes are ready.', '#6c7c71', 9),
  message:
    rect(41, 29, 158, 30) +
    icon(Info, 53, 37, '#1677ff') +
    text(76, 49, 'A new notification') +
    rect(31, 70, 178, 30) +
    icon(CircleAlert, 43, 78, '#a9670e') +
    text(65, 90, 'Check your settings'),
  'date-time-picker':
    rect(20, 13, 200, 26) +
    icon(CalendarDays, 30, 19) +
    text(52, 30, '2026-10-03 14:30:00') +
    rect(20, 45, 200, 73) +
    text(35, 60, 'October 2026') +
    text(156, 60, '14:30:00', '#20834a', 9) +
    text(34, 83, '12    13    14    15    16    17') +
    text(35, 106, 'Today', '#20834a', 9) +
    button(158, 90, 'OK'),
  'date-range-picker':
    rect(15, 13, 210, 26) +
    icon(CalendarDays, 25, 19) +
    text(46, 30, '2026-10-03  —  2026-10-15') +
    rect(15, 45, 210, 73) +
    '<path d="M120 45v73" stroke="#dce5de"/>' +
    text(32, 61, 'October 2026', '#203329', 9) +
    text(134, 61, 'November 2026', '#203329', 9) +
    rect(24, 74, 87, 18, '#eaf4ed', 'none', 2) +
    rect(128, 74, 87, 18, '#eaf4ed', 'none', 2) +
    rect(24, 74, 18, 18, '#20834a', 'none', 3) +
    rect(197, 74, 18, 18, '#20834a', 'none', 3) +
    text(28, 87, '28', '#fff', 8) +
    text(46, 87, '29   30   31', '#203329', 8) +
    text(136, 87, '1     2     3', '#203329', 8) +
    text(203, 87, '4', '#fff', 8) +
    text(25, 106, '24   25   26   27', '#6c7c71', 8) +
    text(129, 106, '5     6     7     8', '#6c7c71', 8),
};
for (const [slug, content] of Object.entries(images))
  await writeFile(
    new URL(`../docs/public/components/${slug}.svg`, import.meta.url),
    `<svg xmlns="http://www.w3.org/2000/svg" width="240" height="128" viewBox="0 0 240 128" fill="none"><title>${slug}</title>${content}</svg>\n`,
  );
