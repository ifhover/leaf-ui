import { writeFile } from 'node:fs/promises';

const r = (x, y, w, h, fill = '#fff', stroke = '#e5e5e8', radius = 6) =>
  '<rect x="' +
  x +
  '" y="' +
  y +
  '" width="' +
  w +
  '" height="' +
  h +
  '" rx="' +
  radius +
  '" fill="' +
  fill +
  '" stroke="' +
  stroke +
  '"/>';
const t = (x, y, label, size = 11, color = '#202024') =>
  '<text x="' +
  x +
  '" y="' +
  y +
  '" font-size="' +
  size +
  '" fill="' +
  color +
  '" font-family="system-ui,sans-serif">' +
  label +
  '</text>';
const line = (x, y, w) => r(x, y, w, 5, '#e2ebe5', 'none', 2);
const panel = (label) =>
  r(58, 23, 184, 112) +
  t(72, 45, label) +
  line(72, 58, 138) +
  line(72, 74, 110) +
  r(144, 100, 80, 23, '#20834a', 'none') +
  t(158, 116, 'Continue', 10, 'white');
const images = {
  layout:
    r(25, 18, 250, 120) +
    r(25, 18, 250, 24, '#eff7f1') +
    r(25, 42, 58, 96, '#e4f1e8') +
    r(93, 52, 172, 60, '#f4f7f5') +
    t(38, 35, 'Leaf') +
    t(109, 85, 'Content'),
  grid: [0, 1, 2]
    .map((col) => [0, 1].map((row) => r(27 + col * 84, 28 + row * 54, 76, 44, '#eaf4ed')).join(''))
    .join(''),
  space: [0, 1, 2]
    .map(
      (i) =>
        r(30 + i * 85, 57, 70, 34, i === 0 ? '#20834a' : '#eaf4ed') +
        t(40 + i * 85, 79, ['Save', 'Draft', 'Cancel'][i], 11, i === 0 ? 'white' : '#20834a'),
    )
    .join(''),
  'scroll-area':
    panel('Scrollable content') +
    r(235, 49, 3, 65, '#e9efeb', 'none') +
    r(235, 52, 3, 23, '#8aa693', 'none'),
  masonry: [0, 1, 2]
    .map((col) =>
      [0, 1]
        .map((row) =>
          r(
            30 + col * 82,
            22 + row * (col === 1 ? 69 : 53),
            74,
            row === 0 ? (col === 1 ? 60 : 44) : col === 1 ? 39 : 55,
            '#eaf4ed',
          ),
        )
        .join(''),
    )
    .join(''),
  segmented:
    r(38, 55, 224, 40, '#f0f4f1', 'none', 10) +
    r(112, 59, 73, 32) +
    t(56, 80, 'Daily') +
    t(128, 80, 'Weekly') +
    t(198, 80, 'Monthly'),
  menu:
    r(50, 20, 200, 120) +
    r(62, 48, 176, 26, '#eaf4ed', 'none') +
    t(76, 38, 'Workspace') +
    t(76, 66, 'Dashboard', 11, '#20834a') +
    t(76, 94, 'Projects') +
    t(76, 122, 'Settings'),
  'back-top':
    line(30, 35, 230) +
    line(30, 55, 190) +
    line(30, 75, 230) +
    line(30, 95, 200) +
    r(226, 106, 34, 34, '#20834a', 'none') +
    t(237, 131, '↑', 23, 'white'),
  descriptions:
    r(25, 25, 250, 108) +
    t(42, 49, 'Project details', 13) +
    t(42, 76, 'Name', 10, '#718078') +
    t(145, 76, 'Leaf UI') +
    t(42, 103, 'Status', 10, '#718078') +
    t(145, 103, 'Published', 11, '#20834a'),
  image:
    r(40, 24, 220, 104, '#d9eddf', 'none') +
    '<path d="M40 128L110 56L165 111L210 71L260 128Z" fill="#81b58f"/><circle cx="210" cy="48" r="13" fill="#fff3b9"/>' +
    r(235, 107, 22, 18, '#fff', 'none') +
    t(240, 121, '+', 14),
  'qr-code':
    r(94, 22, 112, 112) +
    [0, 1, 2]
      .map(
        (i) =>
          r(i === 1 ? 168 : 108, i === 2 ? 96 : 36, 25, 25, '#202024', 'none', 0) +
          r(i === 1 ? 173 : 113, i === 2 ? 101 : 41, 15, 15, '#fff', 'none', 0) +
          r(i === 1 ? 177 : 117, i === 2 ? 105 : 45, 7, 7, '#202024', 'none', 0),
      )
      .join('') +
    [0, 1, 2, 3, 4]
      .map((i) => r(141 + (i % 3) * 8, 71 + Math.floor(i / 3) * 8, 6, 6, '#202024', 'none', 0))
      .join(''),
  timeline:
    r(60, 32, 2, 90, '#e5e5e8', 'none') +
    [0, 1, 2]
      .map(
        (i) =>
          '<circle cx="61" cy="' +
          (35 + i * 40) +
          '" r="5" fill="#20834a"/>' +
          t(83, 39 + i * 40, ['Created', 'Reviewed', 'Published'][i]) +
          line(83, 47 + i * 40, 120),
      )
      .join(''),
  'virtual-list':
    r(48, 17, 204, 124) +
    [0, 1, 2, 3]
      .map(
        (i) =>
          r(61, 29 + i * 25, 174, 20, i === 2 ? '#eaf4ed' : '#fff') +
          t(70, 43 + i * 25, `Row ${470 + i}`, 10),
      )
      .join(''),
  transfer:
    [37, 171]
      .map(
        (x) =>
          r(x, 26, 92, 102) +
          line(x + 10, 40, 60) +
          [0, 1, 2]
            .map(
              (i) =>
                r(x + 10, 57 + i * 23, 12, 12, i === 0 ? '#20834a' : '#fff') +
                line(x + 31, 61 + i * 23, 45),
            )
            .join(''),
      )
      .join('') +
    t(142, 74, '→', 17) +
    t(142, 98, '←', 17),
  'input-otp': [0, 1, 2, 3, 4, 5]
    .map(
      (i) =>
        r(32 + i * 40, 53, 32, 40, i === 3 ? '#eaf4ed' : '#fff', i === 3 ? '#20834a' : '#e5e5e8') +
        t(43 + i * 40, 80, i < 3 ? String(i + 2) : ' ', 18),
    )
    .join(''),
  'time-range-picker':
    r(35, 57, 230, 36) + t(50, 80, '09:00') + t(142, 80, '~') + t(189, 80, '18:00'),
  'input-mask':
    r(30, 55, 240, 38) +
    t(45, 80, '+86 138 0013 8000', 16) +
    t(46, 116, 'Phone number', 10, '#718078'),
  notification:
    r(65, 30, 207, 98) +
    r(79, 46, 20, 20, '#eaf4ed', 'none') +
    t(85, 61, '✓', 13, '#20834a') +
    t(112, 61, 'Upload complete', 12) +
    line(112, 77, 135) +
    line(112, 90, 112) +
    t(112, 112, 'View file', 10, '#20834a'),
  popconfirm: panel('Remove this item?'),
  'error-boundary': panel('Unable to display content'),
  'loading-bar':
    r(28, 25, 244, 3, '#e9efeb', 'none') +
    r(28, 25, 169, 3, '#20834a', 'none') +
    line(40, 58, 100) +
    line(40, 79, 215) +
    line(40, 100, 190),
  'infinite-scroll':
    r(50, 20, 200, 112) +
    [0, 1, 2].map((i) => line(67, 38 + i * 23, 155)).join('') +
    t(113, 116, 'Loading…', 11, '#20834a'),
  sortable: [0, 1, 2]
    .map(
      (i) =>
        r(56 + (i === 1 ? 8 : 0), 22 + i * 39, 186, 31, i === 1 ? '#eaf4ed' : '#fff') +
        t(70 + (i === 1 ? 8 : 0), 43 + i * 39, '⠿', 18, '#718078') +
        t(92, 43 + i * 39, ['Design', 'Build', 'Ship'][i]),
    )
    .join(''),
  upload:
    r(38, 26, 224, 106, '#f4f7f5') +
    '<path d="M112 82V97H188V82M150 45V82M139 56L150 45L161 56" stroke="#20834a" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>' +
    t(108, 117, 'Upload files', 11),
  'file-list':
    r(48, 16, 204, 126, '#f4f7f5') +
    r(81, 23, 138, 112) +
    t(101, 48, 'Project report', 11) +
    line(101, 61, 93) +
    line(101, 77, 98) +
    line(101, 93, 85) +
    t(129, 125, '1 / 4', 9, '#718078'),
  'image-cropper':
    r(43, 24, 214, 112, '#d9eddf', 'none') +
    '<path d="M43 136L112 61L173 117L222 63L257 136Z" fill="#81b58f"/>' +
    r(84, 36, 132, 86, 'none', '#fff', 0) +
    '<path d="M128 36V122M172 36V122M84 65H216M84 94H216" stroke="#fff" stroke-opacity=".5"/>',
  'signature-pad':
    r(32, 30, 236, 94) +
    '<path d="M sixty" fill="none"/>'.replace(
      ' sixty',
      '60 99C88 32 74 107 105 72S96 117 132 93S131 116 170 93S196 107 230 78',
    ) +
    t(52, 141, 'Signature', 10, '#718078'),
  'org-chart':
    r(110, 19, 80, 30, '#eaf4ed') +
    t(132, 39, 'Team') +
    '<path d="M150 49V73M sixty" fill="none" stroke="#b9cebf"/>'.replace(
      ' sixty',
      '70 73H230M70 73V92M150 73V92M230 73V92',
    ) +
    [40, 120, 200]
      .map((x, i) => r(x, 92, 60, 32) + t(x + 11, 112, ['Design', 'Build', 'Sales'][i], 10))
      .join(''),
};
for (const [name, content] of Object.entries(images)) {
  const svg =
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 156" fill="none" role="img" aria-label="' +
    name +
    '">' +
    content +
    '</svg>\n';
  await writeFile(new URL(`../docs/public/components/${name}.svg`, import.meta.url), svg);
}
