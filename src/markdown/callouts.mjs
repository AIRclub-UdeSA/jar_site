const CALLOUTS = {
  NOTE: { className: 'doc-callout--note', label: 'Nota' },
  CHECK: { className: 'doc-callout--check', label: 'Comprobá esto' },
  WARNING: { className: 'doc-callout--warning', label: 'Atención' },
  QUESTION: { className: 'doc-callout--question', label: 'Para pensar' },
};

const MARKER = /^\[!(NOTE|CHECK|WARNING|QUESTION)\]\s*/;

export default {
  name: 'jar-doc-callouts',
  blockquote(node, context) {
    const paragraph = node.children.find((child) => child.type === 'paragraph');
    const firstText = paragraph?.children.find((child) => child.type === 'text');
    const match = firstText?.value.match(MARKER);
    if (!firstText || !match) return;

    const callout = CALLOUTS[match[1]];
    context.setProperty(firstText, 'value', firstText.value.replace(MARKER, ''));
    context.setProperty(node, 'data', {
      ...node.data,
      hProperties: {
        ...node.data?.hProperties,
        className: ['doc-callout', callout.className],
        dataCalloutLabel: callout.label,
      },
    });
  },
};
