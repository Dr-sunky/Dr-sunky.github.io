/*
 * Casual-copy deterrence for article and page content.
 * Code, form controls, and elements marked with .allow-copy remain selectable.
 */

(() => {
  'use strict';

  const protectedContent = '.md-text.content';
  const copyAllowed = 'pre, code, input, textarea, [contenteditable="true"], .allow-copy';
  const protectedMedia = `${protectedContent} img, ${protectedContent} video`;

  const elementFor = node => {
    if (!node) return null;
    return node.nodeType === Node.ELEMENT_NODE ? node : node.parentElement;
  };

  document.addEventListener('copy', event => {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed || selection.rangeCount === 0) return;

    const commonNode = selection.getRangeAt(0).commonAncestorContainer;
    const selectedElement = elementFor(commonNode);
    if (!selectedElement?.closest(protectedContent)) return;
    if (selectedElement.closest(copyAllowed)) return;

    event.preventDefault();
    event.clipboardData?.clearData();
  });

  document.addEventListener('cut', event => {
    const target = elementFor(event.target);
    if (target?.closest(protectedContent) && !target.closest(copyAllowed)) {
      event.preventDefault();
    }
  });

  document.addEventListener('contextmenu', event => {
    const target = elementFor(event.target);
    if (target?.closest(protectedMedia)) event.preventDefault();
  });

  document.addEventListener('dragstart', event => {
    const target = elementFor(event.target);
    if (target?.closest(protectedMedia)) event.preventDefault();
  });
})();
