import { useCallback, useState } from 'react';
import { useEditor, EditorContent, Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Highlight from '@tiptap/extension-highlight';
import TextAlign from '@tiptap/extension-text-align';
import Placeholder from '@tiptap/extension-placeholder';
import Link from '@tiptap/extension-link';
import Subscript from '@tiptap/extension-subscript';
import Superscript from '@tiptap/extension-superscript';
import Underline from '@tiptap/extension-underline';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Highlighter,
  Palette,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  List,
  ListOrdered,
  Undo,
  Redo,
  Link as LinkIcon,
  Table as TableIcon,
  Quote,
  Subscript as SubscriptIcon,
  Superscript as SuperscriptIcon,
  Type,
  ChevronDown,
  MoreHorizontal,
  Trash2,
  Plus,
  Minus,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { FONT_OPTIONS } from './FontSelectorDropdown';
import { Check as CheckIcon, RotateCw, CaseSensitive } from 'lucide-react';

interface DescriptionEditorProps {
  content: string;
  onChange: (content: string) => void;
  onBlur?: () => void;
  /** Per-block font override id. When undefined, the block inherits the course-level font. */
  blockFont?: string;
  /** Update the per-block font override. Pass undefined to revert to course default. */
  onBlockFontChange?: (fontId: string | undefined) => void;
}

const FONT_SIZES = [
  { label: 'Small', value: '0.875rem' },
  { label: 'Normal', value: '1rem' },
  { label: 'Medium', value: '1.125rem' },
  { label: 'Large', value: '1.375rem' },
  { label: 'X-Large', value: '1.75rem' },
  { label: 'Huge', value: '2.25rem' },
];

const TEXT_COLORS = [
  '#0F172A', '#475569', '#EF4444', '#F97316',
  '#EAB308', '#22C55E', '#06B6D4', '#3B82F6',
  '#8B5CF6', '#EC4899',
];

const HIGHLIGHT_COLORS = [
  '#FEF3C7', '#FECACA', '#FED7AA', '#FDE68A',
  '#D1FAE5', '#A7F3D0', '#BFDBFE', '#DDD6FE',
  '#FBCFE8', '#E5E7EB',
];

// Custom TextStyle that supports fontSize. Color extension extends this same TextStyle to add the `color` attribute.
const CustomTextStyle = TextStyle.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      fontSize: {
        default: null,
        parseHTML: (el) => (el as HTMLElement).style.fontSize || null,
        renderHTML: (attrs) => {
          if (!attrs.fontSize) return {};
          return { style: `font-size: ${attrs.fontSize}` };
        },
      },
    };
  },
  addCommands() {
    return {
      ...this.parent?.(),
      setFontSize:
        (fontSize: string) =>
        ({ chain }) =>
          chain().setMark('textStyle', { fontSize }).run(),
      unsetFontSize:
        () =>
        ({ chain }) =>
          chain().setMark('textStyle', { fontSize: null }).removeEmptyTextStyle().run(),
    };
  },
});

interface TBProps {
  onClick: () => void;
  isActive?: boolean;
  disabled?: boolean;
  label: string;
  children: React.ReactNode;
}

const ToolbarButton = ({ onClick, isActive, disabled, label, children }: TBProps) => (
  <button
    type="button"
    onMouseDown={(event) => {
      event.preventDefault();
      if (!disabled) onClick();
    }}
    onClick={(event) => event.preventDefault()}
    disabled={disabled}
    aria-label={label}
    title={label}
    className={cn(
      'inline-flex items-center justify-center h-8 w-8 rounded-md transition-all shrink-0',
      isActive
        ? 'bg-primary text-primary-foreground shadow-sm'
        : 'text-foreground/70 hover:bg-foreground/10 hover:text-foreground',
      disabled && 'opacity-40 cursor-not-allowed hover:bg-transparent',
    )}
  >
    {children}
  </button>
);

const Divider = () => (
  <span aria-hidden="true" className="h-5 w-px bg-foreground/15 mx-0.5 shrink-0" />
);

function ColorSwatchPicker({
  colors,
  onPick,
  onClear,
  label,
}: {
  colors: string[];
  onPick: (c: string) => void;
  onClear: () => void;
  label: string;
}) {
  return (
    <div className="p-2 w-[180px]">
      <div className="text-xs font-medium text-muted-foreground mb-2 px-1">{label}</div>
      <div className="grid grid-cols-5 gap-1.5">
        {colors.map((c) => (
          <button
            key={c}
            type="button"
            onMouseDown={(event) => {
              event.preventDefault();
              event.stopPropagation();
              onPick(c);
            }}
            onClick={(event) => event.preventDefault()}
            aria-label={`Color ${c}`}
            className="h-6 w-6 rounded-md border border-foreground/10 hover:scale-110 transition-transform"
            style={{ backgroundColor: c }}
          />
        ))}
      </div>
      <button
        type="button"
        onMouseDown={(event) => {
          event.preventDefault();
          event.stopPropagation();
          onClear();
        }}
        onClick={(event) => event.preventDefault()}
        className="mt-2 w-full text-xs text-muted-foreground hover:text-foreground py-1 rounded hover:bg-foreground/5"
      >
        Clear
      </button>
    </div>
  );
}

function LinkPopover({ editor }: { editor: Editor }) {
  const [url, setUrl] = useState('');
  const [open, setOpen] = useState(false);

  const apply = () => {
    if (!url) {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
    } else {
      const href = url.match(/^https?:\/\//) ? url : `https://${url}`;
      editor.chain().focus().extendMarkRange('link').setLink({ href }).run();
    }
    setOpen(false);
    setUrl('');
  };

  return (
    <Popover
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (v) setUrl(editor.getAttributes('link').href || '');
      }}
    >
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label="Insert link"
          title="Link"
          className={cn(
            'inline-flex items-center justify-center h-8 w-8 rounded-md transition-all shrink-0',
            editor.isActive('link')
              ? 'bg-primary text-primary-foreground shadow-sm'
              : 'text-foreground/70 hover:bg-foreground/10 hover:text-foreground',
          )}
        >
          <LinkIcon className="w-4 h-4" aria-hidden="true" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-[280px] p-2 bg-background">
        <div className="flex gap-1.5">
          <Input
            autoFocus
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com"
            onKeyDown={(e) => e.key === 'Enter' && apply()}
            className="h-8 text-sm"
          />
          <Button size="sm" onClick={apply} className="h-8">
            Apply
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

function TableMenu({ editor }: { editor: Editor }) {
  const inTable = editor.isActive('table');
  const [open, setOpen] = useState(false);
  const [hover, setHover] = useState<{ r: number; c: number }>({ r: 0, c: 0 });
  const MAX = 8;

  const insert = (rows: number, cols: number) => {
    const inserted = editor.chain().focus().insertTable({ rows, cols, withHeaderRow: true }).run();

    if (!inserted) {
      requestAnimationFrame(() => {
        editor.chain().focus().insertTable({ rows, cols, withHeaderRow: true }).run();
      });
    }

    setOpen(false);
    setHover({ r: 0, c: 0 });
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label="Insert table"
          title="Insert table"
          className={cn(
            'inline-flex items-center justify-center h-8 w-8 rounded-md transition-all shrink-0',
            inTable
              ? 'bg-primary text-primary-foreground shadow-sm'
              : 'text-foreground/70 hover:bg-foreground/10 hover:text-foreground',
          )}
        >
          <TableIcon className="w-4 h-4" aria-hidden="true" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="p-3 w-auto bg-background"
        onOpenAutoFocus={(event) => event.preventDefault()}
      >
        <div
          className="grid gap-1"
          style={{ gridTemplateColumns: `repeat(${MAX}, 1.25rem)` }}
          onMouseLeave={() => setHover({ r: 0, c: 0 })}
        >
          {Array.from({ length: MAX * MAX }).map((_, i) => {
            const r = Math.floor(i / MAX) + 1;
            const c = (i % MAX) + 1;
            const active = r <= hover.r && c <= hover.c;
            return (
              <button
                key={i}
                type="button"
                aria-label={`Insert ${r}×${c} table`}
                onMouseEnter={() => setHover({ r, c })}
                onMouseDown={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  insert(r, c);
                }}
                onClick={(event) => event.preventDefault()}
                className={cn(
                  'h-5 w-5 rounded-[3px] border transition-colors',
                  active
                    ? 'bg-primary/80 border-primary'
                    : 'bg-background border-foreground/20 hover:border-foreground/40',
                )}
              />
            );
          })}
        </div>
        <div className="mt-2 text-xs text-center text-muted-foreground tabular-nums">
          {hover.r > 0 ? `Insert a ${hover.r}×${hover.c} table` : 'Pick table size'}
        </div>
        {inTable && (
          <>
            <div className="h-px bg-foreground/10 my-2" />
            <div className="grid grid-cols-2 gap-1">
              <Button size="sm" variant="ghost" className="h-7 text-xs justify-start" onClick={() => editor.chain().focus().addRowAfter().run()}>
                <Plus className="w-3 h-3 mr-1" aria-hidden="true" /> Row
              </Button>
              <Button size="sm" variant="ghost" className="h-7 text-xs justify-start" onClick={() => editor.chain().focus().addColumnAfter().run()}>
                <Plus className="w-3 h-3 mr-1" aria-hidden="true" /> Column
              </Button>
              <Button size="sm" variant="ghost" className="h-7 text-xs justify-start" onClick={() => editor.chain().focus().deleteRow().run()}>
                <Minus className="w-3 h-3 mr-1" aria-hidden="true" /> Row
              </Button>
              <Button size="sm" variant="ghost" className="h-7 text-xs justify-start" onClick={() => editor.chain().focus().deleteColumn().run()}>
                <Minus className="w-3 h-3 mr-1" aria-hidden="true" /> Column
              </Button>
              <Button size="sm" variant="ghost" className="h-7 text-xs justify-start col-span-2 text-destructive hover:text-destructive" onClick={() => editor.chain().focus().deleteTable().run()}>
                <Trash2 className="w-3 h-3 mr-1" aria-hidden="true" /> Delete table
              </Button>
            </div>
          </>
        )}
      </PopoverContent>
    </Popover>
  );
}

export function DescriptionEditor({ content, onChange, onBlur }: DescriptionEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ link: false }),
      Highlight.configure({ multicolor: true }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Placeholder.configure({
        placeholder: 'Tell your learners what the course will be about...',
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { class: 'text-primary underline underline-offset-2' },
      }),
      Subscript,
      Superscript,
      Underline,
      CustomTextStyle,
      Color.configure({ types: ['textStyle'] }),
      Table.configure({ resizable: true, HTMLAttributes: { class: 'tt-table' } }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    content,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: {
        class:
          'prose prose-sm dark:prose-invert max-w-none min-h-[140px] p-4 focus:outline-none text-base text-foreground leading-relaxed [&_h2]:!text-[1.5rem] [&_h2]:!font-semibold [&_table]:border-collapse [&_td]:border [&_td]:border-foreground/20 [&_td]:p-2 [&_th]:border [&_th]:border-foreground/20 [&_th]:p-2 [&_th]:bg-muted',
      },
    },
  });

  const setColor = useCallback(
    (c: string) => editor?.chain().focus().setColor(c).run(),
    [editor],
  );
  const clearColor = useCallback(() => editor?.chain().focus().unsetColor().run(), [editor]);
  const setHighlight = useCallback(
    (c: string) => editor?.chain().focus().setHighlight({ color: c }).run(),
    [editor],
  );
  const clearHighlight = useCallback(
    () => editor?.chain().focus().unsetHighlight().run(),
    [editor],
  );

  if (!editor) return null;

  const currentSize =
    FONT_SIZES.find((s) => editor.getAttributes('textStyle').fontSize === s.value)?.label ||
    'Size';

  const currentAlignIcon = editor.isActive({ textAlign: 'center' }) ? (
    <AlignCenter className="w-4 h-4" aria-hidden="true" />
  ) : editor.isActive({ textAlign: 'right' }) ? (
    <AlignRight className="w-4 h-4" aria-hidden="true" />
  ) : editor.isActive({ textAlign: 'justify' }) ? (
    <AlignJustify className="w-4 h-4" aria-hidden="true" />
  ) : (
    <AlignLeft className="w-4 h-4" aria-hidden="true" />
  );

  return (
    <div className="space-y-2 animate-fade-in w-full">
      {/* Modern compact toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 p-1.5 border border-foreground/15 rounded-xl bg-background/80 backdrop-blur-md shadow-sm w-full">
        {/* Paragraph style dropdown */}
        <StyleDropdown editor={editor} />

        <Divider />

        {/* Core formatting (always visible) */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          isActive={editor.isActive('bold')}
          label="Bold"
        >
          <Bold className="w-4 h-4" aria-hidden="true" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          isActive={editor.isActive('italic')}
          label="Italic"
        >
          <Italic className="w-4 h-4" aria-hidden="true" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          isActive={editor.isActive('underline')}
          label="Underline"
        >
          <UnderlineIcon className="w-4 h-4" aria-hidden="true" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleStrike().run()}
          isActive={editor.isActive('strike')}
          label="Strikethrough"
        >
          <Strikethrough className="w-4 h-4" aria-hidden="true" />
        </ToolbarButton>

        <Divider />

        {/* Color & highlight */}
        <Popover>
          <PopoverTrigger asChild>
            <button
              type="button"
              aria-label="Text color"
              title="Text color"
              className="inline-flex items-center justify-center h-8 w-8 rounded-md text-foreground/70 hover:bg-foreground/10 hover:text-foreground transition-all shrink-0"
            >
              <Palette className="w-4 h-4" aria-hidden="true" />
            </button>
          </PopoverTrigger>
          <PopoverContent
            align="start"
            className="p-0 w-auto bg-background"
            onOpenAutoFocus={(event) => event.preventDefault()}
          >
            <ColorSwatchPicker
              colors={TEXT_COLORS}
              onPick={setColor}
              onClear={clearColor}
              label="Text color"
            />
          </PopoverContent>
        </Popover>

        <Popover>
          <PopoverTrigger asChild>
            <button
              type="button"
              aria-label="Highlight color"
              title="Highlight"
              className={cn(
                'inline-flex items-center justify-center h-8 w-8 rounded-md transition-all shrink-0',
                editor.isActive('highlight')
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-foreground/70 hover:bg-foreground/10 hover:text-foreground',
              )}
            >
              <Highlighter className="w-4 h-4" aria-hidden="true" />
            </button>
          </PopoverTrigger>
          <PopoverContent
            align="start"
            className="p-0 w-auto bg-background"
            onOpenAutoFocus={(event) => event.preventDefault()}
          >
            <ColorSwatchPicker
              colors={HIGHLIGHT_COLORS}
              onPick={setHighlight}
              onClear={clearHighlight}
              label="Highlight"
            />
          </PopoverContent>
        </Popover>

        <Divider />

        {/* Font size */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              onMouseDown={(event) => event.preventDefault()}
              aria-label="Font size"
              title="Font size"
              className="inline-flex items-center gap-1 h-8 px-2 rounded-md text-foreground/70 hover:bg-foreground/10 hover:text-foreground transition-all shrink-0 text-xs font-medium"
            >
              <Type className="w-3.5 h-3.5" aria-hidden="true" />
              <span className="hidden sm:inline max-w-[60px] truncate">{currentSize}</span>
              <ChevronDown className="w-3 h-3" aria-hidden="true" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="start"
            className="bg-background"
            onCloseAutoFocus={(event) => event.preventDefault()}
          >
            {FONT_SIZES.map((s) => (
              <DropdownMenuItem
                key={s.value}
                onSelect={(event) => {
                  event.preventDefault();
                   editor.chain().focus().setFontSize(s.value).run();
                }}
                style={{ fontSize: s.value }}
              >
                {s.label}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onSelect={(event) => {
                event.preventDefault();
                editor.chain().focus().unsetFontSize().run();
              }}
            >
              Reset
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Divider />

        {/* Alignment */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              onMouseDown={(event) => event.preventDefault()}
              aria-label="Text alignment"
              title="Alignment"
              className="inline-flex items-center gap-1 h-8 px-1.5 rounded-md text-foreground/70 hover:bg-foreground/10 hover:text-foreground transition-all shrink-0"
            >
              {currentAlignIcon}
              <ChevronDown className="w-3 h-3" aria-hidden="true" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="start"
            className="bg-background"
            onCloseAutoFocus={(event) => event.preventDefault()}
          >
            <DropdownMenuItem onSelect={(e) => { e.preventDefault(); editor.chain().focus().setTextAlign('left').run(); }}>
              <AlignLeft className="w-4 h-4 mr-2" aria-hidden="true" /> Left
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={(e) => { e.preventDefault(); editor.chain().focus().setTextAlign('center').run(); }}>
              <AlignCenter className="w-4 h-4 mr-2" aria-hidden="true" /> Center
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={(e) => { e.preventDefault(); editor.chain().focus().setTextAlign('right').run(); }}>
              <AlignRight className="w-4 h-4 mr-2" aria-hidden="true" /> Right
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={(e) => { e.preventDefault(); editor.chain().focus().setTextAlign('justify').run(); }}>
              <AlignJustify className="w-4 h-4 mr-2" aria-hidden="true" /> Justify
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Lists - hide on very small screens, available in More */}
        <div className="hidden sm:flex items-center gap-0.5">
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            isActive={editor.isActive('bulletList')}
            label="Bullet list"
          >
            <List className="w-4 h-4" aria-hidden="true" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            isActive={editor.isActive('orderedList')}
            label="Numbered list"
          >
            <ListOrdered className="w-4 h-4" aria-hidden="true" />
          </ToolbarButton>
        </div>

        <div className="hidden md:flex items-center gap-0.5">
          <Divider />
          <LinkPopover editor={editor} />
          <TableMenu editor={editor} />
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            isActive={editor.isActive('blockquote')}
            label="Quote"
          >
            <Quote className="w-4 h-4" aria-hidden="true" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleSubscript().run()}
            isActive={editor.isActive('subscript')}
            label="Subscript"
          >
            <SubscriptIcon className="w-4 h-4" aria-hidden="true" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleSuperscript().run()}
            isActive={editor.isActive('superscript')}
            label="Superscript"
          >
            <SuperscriptIcon className="w-4 h-4" aria-hidden="true" />
          </ToolbarButton>
        </div>

        {/* Mobile "More" menu - houses what's hidden */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              aria-label="More formatting options"
              title="More"
              className="md:hidden inline-flex items-center justify-center h-8 w-8 rounded-md text-foreground/70 hover:bg-foreground/10 hover:text-foreground transition-all shrink-0"
            >
              <MoreHorizontal className="w-4 h-4" aria-hidden="true" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="bg-background w-48"
            onCloseAutoFocus={(event) => event.preventDefault()}
          >
            <DropdownMenuItem
              onSelect={(e) => { e.preventDefault(); editor.chain().focus().toggleBulletList().run(); }}
              className="sm:hidden"
            >
              <List className="w-4 h-4 mr-2" aria-hidden="true" /> Bullet list
            </DropdownMenuItem>
            <DropdownMenuItem
              onSelect={(e) => { e.preventDefault(); editor.chain().focus().toggleOrderedList().run(); }}
              className="sm:hidden"
            >
              <ListOrdered className="w-4 h-4 mr-2" aria-hidden="true" /> Numbered list
            </DropdownMenuItem>
            <DropdownMenuItem
              onSelect={(e) => {
                e.preventDefault();
                const url = window.prompt('Enter URL');
                if (url) {
                  const href = url.match(/^https?:\/\//) ? url : `https://${url}`;
                  editor.chain().focus().extendMarkRange('link').setLink({ href }).run();
                }
              }}
            >
              <LinkIcon className="w-4 h-4 mr-2" aria-hidden="true" /> Insert link
            </DropdownMenuItem>
            <DropdownMenuItem
              onSelect={(e) => { e.preventDefault(); editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run(); }}
            >
              <TableIcon className="w-4 h-4 mr-2" aria-hidden="true" /> Insert table
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={(e) => { e.preventDefault(); editor.chain().focus().toggleBlockquote().run(); }}>
              <Quote className="w-4 h-4 mr-2" aria-hidden="true" /> Quote
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={(e) => { e.preventDefault(); editor.chain().focus().toggleSubscript().run(); }}>
              <SubscriptIcon className="w-4 h-4 mr-2" aria-hidden="true" /> Subscript
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={(e) => { e.preventDefault(); editor.chain().focus().toggleSuperscript().run(); }}>
              <SuperscriptIcon className="w-4 h-4 mr-2" aria-hidden="true" /> Superscript
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Spacer pushes undo/redo to the right on wider screens */}
        <div className="flex-1 min-w-0" />

        <Divider />

        <ToolbarButton
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          label="Undo"
        >
          <Undo className="w-4 h-4" aria-hidden="true" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          label="Redo"
        >
          <Redo className="w-4 h-4" aria-hidden="true" />
        </ToolbarButton>
      </div>

      {/* Editor */}
      <div
        className="border border-foreground/15 rounded-xl bg-background/40 transition-colors focus-within:border-primary/40 focus-within:bg-background/70 w-full [&_.ProseMirror]:min-h-[220px] [&_.ProseMirror]:w-full"
        onBlur={onBlur}
      >
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}

type StyleId = 'paragraph' | 'h1' | 'h2' | 'h3' | 'h4' | 'quote';

const STYLE_OPTIONS: {
  id: StyleId;
  label: string;
  preview: string;
  className: string;
}[] = [
  { id: 'paragraph', label: 'Normal', preview: 'Normal', className: 'text-sm text-foreground' },
  { id: 'h1', label: 'Heading 1', preview: 'Heading 1', className: 'text-2xl font-bold text-foreground' },
  { id: 'h2', label: 'Heading 2', preview: 'Heading 2', className: 'text-xl font-bold text-foreground' },
  { id: 'h3', label: 'Heading 3', preview: 'Heading 3', className: 'text-base font-semibold text-foreground' },
  { id: 'h4', label: 'Heading 4', preview: 'Heading 4', className: 'text-sm font-semibold text-foreground' },
  { id: 'quote', label: 'Quote', preview: 'Quote', className: 'text-sm italic text-muted-foreground' },
];

function StyleDropdown({ editor }: { editor: Editor }) {
  const getCurrent = (): StyleId => {
    if (editor.isActive('heading', { level: 1 })) return 'h1';
    if (editor.isActive('heading', { level: 2 })) return 'h2';
    if (editor.isActive('heading', { level: 3 })) return 'h3';
    if (editor.isActive('heading', { level: 4 })) return 'h4';
    if (editor.isActive('blockquote')) return 'quote';
    return 'paragraph';
  };

  const current = getCurrent();
  const currentLabel = STYLE_OPTIONS.find((s) => s.id === current)?.label ?? 'Normal';

  const apply = (id: StyleId) => {
    const chain = editor.chain().focus();
    if (id === 'paragraph') chain.setParagraph().run();
    else if (id === 'quote') chain.setParagraph().toggleBlockquote().run();
    else {
      const level = Number(id.replace('h', '')) as 1 | 2 | 3 | 4;
      chain.setHeading({ level }).run();
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label="Paragraph style"
          title="Paragraph style"
          className="inline-flex items-center gap-1 h-8 px-2 rounded-md text-foreground/80 hover:bg-foreground/10 hover:text-foreground transition-all shrink-0 text-sm font-medium min-w-[88px]"
        >
          <span className="truncate">{currentLabel}</span>
          <ChevronDown className="w-3.5 h-3.5 opacity-70" aria-hidden="true" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56 p-1.5 bg-background">
        {STYLE_OPTIONS.map((opt) => {
          const isActive = current === opt.id;
          return (
            <DropdownMenuItem
              key={opt.id}
              onSelect={(e) => {
                e.preventDefault();
                apply(opt.id);
              }}
              className={cn(
                'rounded-md px-2.5 py-2 cursor-pointer focus:bg-primary/10',
                isActive && 'bg-primary/10 ring-1 ring-primary/30',
              )}
            >
              <span className={cn('block leading-tight', opt.className)}>{opt.preview}</span>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
