(() => {
  const initializationKey = 'sydocPreviewInitialized';

  if (document.documentElement.dataset[initializationKey] === 'true') {
    return;
  }

  document.documentElement.dataset[initializationKey] = 'true';

  const layoutSelector = '.sydoc-preview';
  const headingSelector = 'h1, h2, h3, h4, h5, h6';

  function createTitle(text) {
    const title = document.createElement('h2');
    title.className = 'sydoc-preview__title';
    title.textContent = text;
    return title;
  }

  function createOutlineItem(heading) {
    const item = document.createElement('li');
    const link = document.createElement('a');

    link.className = 'sydoc-preview__outline-link';
    link.href = `#${heading.id}`;
    link.textContent = heading.textContent;

    item.append(link);
    return item;
  }

  function createOutlineTree(headings) {
    const root = document.createElement('ul');
    root.className = 'sydoc-preview__outline-list';
    const lists = [{ level: 0, element: root, item: null }];

    for (const heading of headings) {
      const level = Number(heading.tagName.slice(1));

      while (lists.length > 1 && lists[lists.length - 1].level >= level) {
        lists.pop();
      }

      if (level > lists[lists.length - 1].level) {
        const parent = lists[lists.length - 1];

        if (parent.item) {
          const nestedList = document.createElement('ul');
          parent.item.append(nestedList);
          lists.push({ level, element: nestedList, item: null });
        } else {
          lists.push({ level, element: parent.element, item: null });
        }
      }

      const currentList = lists[lists.length - 1].element;
      const item = createOutlineItem(heading);
      currentList.append(item);
      lists[lists.length - 1].item = item;
    }

    return root;
  }

  function setHeadingIds(headings) {
    const usedIds = new Set();

    for (const heading of headings) {
      if (heading.id) {
        usedIds.add(heading.id);
      }
    }

    for (const heading of headings) {
      if (heading.id) {
        continue;
      }

      const baseId = heading.textContent
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '') || 'section';
      let id = baseId;
      let suffix = 2;

      while (usedIds.has(id)) {
        id = `${baseId}-${suffix}`;
        suffix += 1;
      }

      heading.id = id;
      usedIds.add(id);
    }
  }

  function renderOutline(layout) {
    const content = layout.querySelector('.sydoc-preview__content');
    const outline = layout.querySelector('.sydoc-preview__outline');

    if (!content || !outline) {
      return;
    }

    const headings = Array.from(content.querySelectorAll(headingSelector));

    setHeadingIds(headings);

    const title = outline.querySelector('.sydoc-preview__title');
    if (!title) {
      outline.append(createTitle('On This Page'));
    }

    if (headings.length === 0) {
      outline.querySelector('.sydoc-preview__outline-list')?.remove();
      return;
    }

    let list = outline.querySelector('.sydoc-preview__outline-list');
    if (!list) {
      list = document.createElement('ul');
      list.className = 'sydoc-preview__outline-list';
      outline.append(list);
    }

    const existingItems = Array.from(list.querySelectorAll('a'));
    const outlineChanged = existingItems.length !== headings.length
      || existingItems.some((item, index) => (
        item.getAttribute('href') !== `#${headings[index].id}`
        || item.textContent !== headings[index].textContent
      ));

    if (!outlineChanged) {
      return;
    }

    list.replaceWith(createOutlineTree(headings));
  }

  function renderLayouts() {
    document.querySelectorAll(layoutSelector).forEach(renderOutline);
  }

  renderLayouts();

  const observer = new MutationObserver(renderLayouts);
  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });
})();
