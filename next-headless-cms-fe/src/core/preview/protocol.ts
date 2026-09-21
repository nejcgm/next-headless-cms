export type ComposePreviewMessage = {
  type: "cms-compose-preview";
  blocks: unknown[];
  secret: string;
};

export function readComposePreviewMessage(
  data: unknown
): ComposePreviewMessage | null {
  if (data == null || typeof data !== "object") return null;
  const record = data as { type?: unknown; blocks?: unknown; secret?: unknown };
  if (record.type !== "cms-compose-preview") return null;
  if (!Array.isArray(record.blocks)) return null;
  if (typeof record.secret !== "string" || !record.secret) return null;
  return {
    type: "cms-compose-preview",
    blocks: record.blocks,
    secret: record.secret,
  };
}
