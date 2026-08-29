export default {
  name: 'jar-doc-table-scroll',
  element: {
    filter: ['table'],
    visit(node, context) {
      context.wrapNode(node, {
        raw: '<div class="doc-table-scroll" tabindex="0" role="region" aria-label="Tabla desplazable"></div>',
      });
    },
  },
};
