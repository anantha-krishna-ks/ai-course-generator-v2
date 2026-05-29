// Cross-component event bus for navigating to a specific review-commented
// block from anywhere in the editor (chips, summary popovers, etc).
export const COMMENT_NAV_EVENT = "review-comments:navigate";

export interface CommentNavDetail {
  blockId: string;
}

export function dispatchCommentNavigate(blockId: string) {
  window.dispatchEvent(
    new CustomEvent<CommentNavDetail>(COMMENT_NAV_EVENT, { detail: { blockId } }),
  );
}

/**
 * Scrolls the element matching [data-comment-anchor="<blockId>"] into view
 * and briefly highlights it. Returns true if found, false otherwise.
 */
export function scrollToCommentAnchor(blockId: string, root: ParentNode = document): boolean {
  const el = root.querySelector(
    `[data-comment-anchor="${CSS.escape(blockId)}"]`,
  ) as HTMLElement | null;
  if (!el) return false;
  el.scrollIntoView({ behavior: "smooth", block: "center" });
  el.classList.add("comment-anchor-flash");
  window.setTimeout(() => el.classList.remove("comment-anchor-flash"), 1800);
  return true;
}
