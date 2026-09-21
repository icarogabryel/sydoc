interface MarkdownItRenderer {
  render(...args: unknown[]): string;
}

interface MarkdownItInstance {
  renderer: MarkdownItRenderer;
}

function isMarkdownItInstance(
  value: unknown,
): value is MarkdownItInstance {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const renderer = (value as MarkdownItInstance).renderer;

  return typeof renderer?.render === 'function';
}

export function configureMarkdownIt(
  markdownIt: unknown,
  isSydocProjectActive: (documentUri: unknown) => boolean,
  getNavigationHtml: (documentUri: unknown) => string,
): unknown {
  if (!isMarkdownItInstance(markdownIt)) {
    return markdownIt;
  }

  const renderMarkdown = markdownIt.renderer.render.bind(
    markdownIt.renderer,
  );

  markdownIt.renderer.render = (...args: unknown[]): string => {
    const markdownHtml = renderMarkdown(...args);
    const renderEnvironment = args[2];
    const documentUri = renderEnvironment
      && typeof renderEnvironment === 'object'
      ? (renderEnvironment as { currentDocument?: unknown })
        .currentDocument
      : undefined;

    if (!isSydocProjectActive(documentUri)) {
      return markdownHtml;
    }

    return [
      '<div class="sydoc-preview">',
      '<aside class="sydoc-preview__navigation" aria-label="Documentation">',
      getNavigationHtml(documentUri),
      '</aside>',
      '<main class="sydoc-preview__content">',
      markdownHtml,
      '</main>',
      '<aside class="sydoc-preview__outline" aria-label="On This Page"></aside>',
      '</div>',
    ].join('');
  };

  return markdownIt;
}
