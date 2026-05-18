import { useEditor, EditorContent } from "@tiptap/react";
import { BubbleMenu } from "@tiptap/react/menus";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import { Bold, Italic, Underline as UnderlineIcon, Link as LinkIcon, List } from "lucide-react";
import { cn } from "@/lib/utils";
import { sanitizeHtml } from "@/lib/sanitize";
import { useEffect } from "react";

interface MiniRichTextEditorProps {
  content: string;
  onChange: (value: string) => void;
  placeholder?: string;
  maxHeight?: number;
}

/**
 * MiniRichTextEditor — compact Tiptap editor with a floating bubble menu.
 * Used inside tight spaces (popovers) where a full toolbar would not fit.
 * Toolbar appears only on text selection. Content area scrolls internally.
 */
export function MiniRichTextEditor({
  content,
  onChange,
  placeholder = "Write a short description…",
  maxHeight = 160,
}: MiniRichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: false, codeBlock: false, horizontalRule: false }),
      Underline,
      Link.configure({ openOnClick: false, HTMLAttributes: { class: "text-primary underline" } }),
      Placeholder.configure({ placeholder }),
    ],
    content: content || "",
    onUpdate: ({ editor }) => onChange(sanitizeHtml(editor.getHTML())),
    editorProps: {
      attributes: {
        class:
          "prose prose-sm max-w-none focus:outline-none text-sm leading-relaxed px-3 py-2.5 [&_p]:my-1 [&_ul]:my-1 [&_ol]:my-1",
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
    <div className="rounded-lg border border-border/60 bg-background overflow-hidden">
      <BubbleMenu
        editor={editor}
        options={{ placement: "top" }}
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
        <button type="button" aria-label="Bullet list" className={btn(editor.isActive("bulletList"))} onClick={() => editor.chain().focus().toggleBulletList().run()}>
          <List className="w-3.5 h-3.5" aria-hidden="true" focusable="false" />
        </button>
        <button type="button" aria-label="Link" className={btn(editor.isActive("link"))} onClick={promptLink}>
          <LinkIcon className="w-3.5 h-3.5" aria-hidden="true" focusable="false" />
        </button>
      </BubbleMenu>

      <div className="overflow-y-auto" style={{ maxHeight }}>
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
