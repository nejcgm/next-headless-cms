const FORM_COLUMN = /span\s+9/;

// Content Manager owns this 9/3 grid. Widen the form only while the page composition surface is mounted.
export function widenPageEditColumn(marker: HTMLElement): () => void {
  let node = marker.parentElement;
  let formColumn: HTMLElement | null = null;
  while (node) {
    if (FORM_COLUMN.test(getComputedStyle(node).gridColumn)) {
      formColumn = node;
      break;
    }
    node = node.parentElement;
  }
  if (!formColumn) return () => undefined;
  const column = formColumn;

  const panels =
    column.nextElementSibling instanceof HTMLElement
      ? column.nextElementSibling
      : null;
  const previousColumn = column.style.gridColumn;
  column.style.gridColumn = "span 12";
  if (panels) panels.setAttribute("hidden", "");

  return () => {
    column.style.gridColumn = previousColumn;
    panels?.removeAttribute("hidden");
  };
}
