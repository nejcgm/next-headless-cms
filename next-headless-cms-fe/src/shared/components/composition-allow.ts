export const LAYOUT_NEST_ALLOW = [
  "flex",
  "grid",
  "text",
  "image",
  "iframe",
  "icon",
  "button",
  "link",
  "accordion",
] as const;

export const GRID_NEST_ALLOW = [
  "flex",
  "text",
  "image",
  "iframe",
  "icon",
  "button",
  "link",
  "accordion",
] as const;

export const GALLERY_NEST_ALLOW = ["image"] as const;

export const LINK_BUTTON_NEST_ALLOW = ["icon", "text"] as const;
