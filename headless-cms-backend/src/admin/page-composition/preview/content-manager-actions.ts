const PREVIEW_ROOT = ".compose-preview";

// The Entry panel is hidden, so these buttons stay in the DOM and keep the real save/publish path.
export function clickContentManagerAction(label: "Save" | "Publish"): void {
  const button = Array.from(document.querySelectorAll("button")).find((node) => {
    if (node.closest(PREVIEW_ROOT)) return false;
    return node.textContent?.trim() === label;
  });
  button?.click();
}
