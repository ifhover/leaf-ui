const isElement = (node, name) => node.type === 'element' && node.tagName === name;
const textContent = (node) =>
  node.type === 'text' ? node.value : (node.children ?? []).map(textContent).join('');

/** Keep linked type expressions in one code box without changing Markdown or API data. */
export function rehypeApiTypes() {
  return (tree) => {
    const visit = (node) => {
      if (isElement(node, 'table')) {
        const rows = node.children
          .flatMap((child) =>
            isElement(child, 'thead') || isElement(child, 'tbody') ? child.children : [child],
          )
          .filter((child) => isElement(child, 'tr'));
        const headers = rows[0]?.children.filter((child) => isElement(child, 'th')) ?? [];
        const column = headers.findIndex((header) =>
          /^(?:Type|类型)$/u.test(textContent(header).trim()),
        );
        if (column !== -1) {
          if (/^(?:Description|说明)$/u.test(textContent(headers.at(-1)).trim())) {
            node.properties = {
              ...node.properties,
              className: [
                ...new Set([].concat(node.properties?.className ?? [], 'leaf-api-table')),
              ],
            };
          }
          for (const row of rows.slice(1)) {
            const cell = row.children.filter((child) => isElement(child, 'td'))[column];
            if (!cell?.children.some((child) => isElement(child, 'code') || isElement(child, 'a')))
              continue;
            const inline = (child) =>
              child.type === 'text' ||
              isElement(child, 'code') ||
              (isElement(child, 'a') &&
                child.children.every((part) => part.type === 'text' || isElement(part, 'code')));
            if (!cell.children.every(inline)) continue;
            const children = cell.children.flatMap((child) => {
              if (isElement(child, 'code')) return child.children;
              if (isElement(child, 'a'))
                return [
                  {
                    ...child,
                    children: child.children.flatMap((part) =>
                      isElement(part, 'code') ? part.children : [part],
                    ),
                  },
                ];
              return [child];
            });
            cell.children = [
              {
                type: 'element',
                tagName: 'code',
                properties: { className: ['leaf-api-type'] },
                children,
              },
            ];
          }
        }
      }
      for (const child of node.children ?? []) visit(child);
    };
    visit(tree);
  };
}
