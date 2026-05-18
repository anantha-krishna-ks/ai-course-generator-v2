import { useEditor, EditorContent } from "@tiptap/react";
import { BubbleMenu } from "@tiptap/react/menus";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import CharacterCount from "@tiptap/extension-character-count";
import TextAlign from "@tiptap/extension-text-align";
import { Bold, Italic, Underline as UnderlineIcon, Link as LinkIcon, List, ListOrdered, AlignLeft, AlignCenter, AlignRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { sanitizeHtml } from "@/lib/sanitize";
import { useEffect } from "react";

interface MiniRichTextEditorProps {
  content: string;
  onChange: (value: string) => void;
  placeholder?: string;
  maxHeight?: number;
  /** Hard character limit on plain text. Default 300. */
  maxLength?: number;
  /** When true, show destructive border/ring to indicate a validation error. */
  error?: boolean;
}

/**
 * MiniRichTextEditor — compact Tiptap editor with a floating bubble menu.
 * Used inside tight spaces (popovers) where a full toolbar would not fit.
 * Toolbar appears only on text selection. Character counter shown at bottom-right.
 */
export function MiniRichTextEditor({
  content,
  onChange,
  placeholder = "Write a short description…",
  maxHeight = 180,
  maxLength = 300,
  error = false,
}: MiniRichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: false, codeBlock: false, horizontalRule: false }),
      Underline,
      Link.configure({ openOnClick: false, HTMLAttributes: { class: "text-primary underline" } }),
      Placeholder.configure({ placeholder }),
      CharacterCount.configure({ limit: maxLength }),
      TextAlign.configure({ types: ["paragraph"], alignments: ["left", "center", "right"], defaultAlignment: "left" }),
    ],
    content: content || "",
    onUpdate: ({ editor }) => onChange(sanitizeHtml(editor.getHTML())),
    editorProps: {
      attributes: {
        class:
          "prose prose-sm max-w-none focus:outline-none text-sm leading-relaxed px-3.5 py-3 [&_p]:my-1 [&_ul]:my-1 [&_ol]:my-1 [&_p.is-editor-empty:first-child]:before:content-[attr(data-placeholder)] [&_p.is-editor-empty:first-child]:before:text-muted-foreground [&_p.is-editor-empty:first-child]:before:float-left [&_p.is-editor-empty:first-child]:before:pointer-events-none [&_p.is-editor-empty:first-child]:before:h-0",
      },
    },
  });

  useEffect(() => {
    if (!editor) return;
    const current = editor.getHTML();
    if ((content || "") !== current) {
      editor.commands.setContent(content || "", { emitUpdate: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [content, editor]);

  if (!editor) return null;

  const used = editor.storage.characterCount?.characters?.() ?? 0;
  const pct = Math.min(100, (used / maxLength) * 100);
  const nearLimit = used >= maxLength * 0.9;
  const atLimit = used >= maxLength;

  const promptLink = () => {
    const previous = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("Enter URL", previous || "https://");
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  const btn = (active: boolean) =>
    cn(
      "h-7 w-7 inline-flex items-center justify-center rounded-md transition-colors",
      active ? "bg-primary text-primary-foreground" : "text-foreground/80 hover:bg-muted"
    );

  return (
    <div
      className={cn(
        "group rounded-xl border bg-background overflow-hidden transition-all duration-200",
        "border-border/70 shadow-sm hover:border-border hover:shadow-md",
        "focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/15 focus-within:shadow-md"
      )}
    >
      <BubbleMenu
        editor={editor}
        options={{ placement: "top" }}
        data-tiptap-bubble-menu="true"
        onMouseDown={(e) => e.preventDefault()}
        className="flex items-center gap-0.5 rounded-full border border-border/60 bg-popover/95 backdrop-blur-sm px-1 py-1 shadow-lg"
      >
        <button type="button" aria-label="Bold" className={btn(editor.isActive("bold"))} onClick={() => editor.chain().focus().toggleBold().run()}>
          <Bold className="w-3.5 h-3.5" aria-hidden="true" focusable="false" />
        </button>
        <button type="button" aria-label="Italic" className={btn(editor.isActive("italic"))} onClick={() => editor.chain().focus().toggleItalic().run()}>
          <Italic className="w-3.5 h-3.5" aria-hidden="true" focusable="false" />
        </button>
        <button type="button" aria-label="Underline" className={btn(editor.isActive("underline"))} onClick={() => editor.chain().focus().toggleUnderline().run()}>
          <UnderlineIcon className="w-3.5 h-3.5" aria-hidden="true" focusable="false" />
        </button>
        <span className="mx-0.5 h-4 w-px bg-border/70" aria-hidden="true" />
        <button type="button" aria-label="Bullet list" className={btn(editor.isActive("bulletList"))} onClick={() => editor.chain().focus().toggleBulletList().run()}>
          <List className="w-3.5 h-3.5" aria-hidden="true" focusable="false" />
        </button>
        <button type="button" aria-label="Numbered list" className={btn(editor.isActive("orderedList"))} onClick={() => editor.chain().focus().toggleOrderedList().run()}>
          <ListOrdered className="w-3.5 h-3.5" aria-hidden="true" focusable="false" />
        </button>
        <span className="mx-0.5 h-4 w-px bg-border/70" aria-hidden="true" />
        <button type="button" aria-label="Align left" className={btn(editor.isActive({ textAlign: "left" }))} onClick={() => editor.chain().focus().setTextAlign("left").run()}>
          <AlignLeft className="w-3.5 h-3.5" aria-hidden="true" focusable="false" />
        </button>
        <button type="button" aria-label="Align center" className={btn(editor.isActive({ textAlign: "center" }))} onClick={() => editor.chain().focus().setTextAlign("center").run()}>
          <AlignCenter className="w-3.5 h-3.5" aria-hidden="true" focusable="false" />
        </button>
        <button type="button" aria-label="Align right" className={btn(editor.isActive({ textAlign: "right" }))} onClick={() => editor.chain().focus().setTextAlign("right").run()}>
          <AlignRight className="w-3.5 h-3.5" aria-hidden="true" focusable="false" />
        </button>
        <span className="mx-0.5 h-4 w-px bg-border/70" aria-hidden="true" />
        <button type="button" aria-label="Link" className={btn(editor.isActive("link"))} onClick={promptLink}>
          <LinkIcon className="w-3.5 h-3.5" aria-hidden="true" focusable="false" />
        </button>
      </BubbleMenu>

      <div className="overflow-y-auto" style={{ maxHeight }}>
        <EditorContent editor={editor} />
      </div>

      {/* Footer: hint + character counter with progress ring */}
      <div className="flex items-center justify-between gap-2 px-3 py-1.5 border-t border-border/60 bg-muted/30">
        <p className="text-[10.5px] text-muted-foreground leading-none">
          Select text to format
        </p>
        <div className="flex items-center gap-1.5">
          <div
            className="h-1.5 w-16 rounded-full bg-muted overflow-hidden"
            role="progressbar"
            aria-valuenow={used}
            aria-valuemin={0}
            aria-valuemax={maxLength}
            aria-label="Character usage"
          >
            <div
              className={cn(
                "h-full rounded-full transition-all",
                atLimit ? "bg-destructive" : nearLimit ? "bg-amber-500" : "bg-primary"
              )}
              style={{ width: `${pct}%` }}
            />
          </div>
          <span
            className={cn(
              "text-[10.5px] tabular-nums font-medium leading-none",
              atLimit ? "text-destructive" : nearLimit ? "text-amber-600" : "text-muted-foreground"
            )}
          >
            {used}/{maxLength}
          </span>
        </div>
      </div>
    </div>
  );
}
