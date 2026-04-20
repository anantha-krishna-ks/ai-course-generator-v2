import { useCallback, useEffect, useMemo, useRef, useState, type MouseEvent, type ReactNode } from 'react';
import { useEditor, EditorContent, type Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import Placeholder from '@tiptap/extension-placeholder';
import Link from '@tiptap/extension-link';
import Subscript from '@tiptap/extension-subscript';
import Superscript from '@tiptap/extension-superscript';
import { TextStyle, FontSize, BackgroundColor } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Bold,
  ChevronDown,
  Highlighter,
  Italic,
  Link as LinkIcon,
  List,
  ListOrdered,
  Minus,
  MoreHorizontal,
  Palette,
  Plus,
  Quote,
  Redo,
  Strikethrough,
  Subscript as SubscriptIcon,
  Superscript as SuperscriptIcon,
  Table as TableIcon,
  Trash2,
  Type,
  Underline as UnderlineIcon,
  Undo,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface DescriptionEditorProps {
  content: string;
  onChange: (content: string) => void;
  onBlur?: () => void;
}

interface SelectionSnapshot {
  from: number;
  to: number;
}

const FONT_SIZES = [
  { label: 'Small', value: '0.875rem' },
  { label: 'Normal', value: '1rem' },
  { label: 'Medium', value: '1.125rem' },
  { label: 'Large', value: '1.375rem' },
  { label: 'X-Large', value: '1.75rem' },
  { label: 'Huge', value: '2.25rem' },
] as const;

const TEXT_COLORS = [
  'hsl(222 47% 11%)',
  'hsl(215 25% 27%)',
  'hsl(0 84% 60%)',
  'hsl(24 95% 53%)',
  'hsl(45 93% 47%)',
  'hsl(142 71% 45%)',
  'hsl(188 94% 43%)',
  'hsl(217 91% 60%)',
  'hsl(262 83% 58%)',
  'hsl(330 81% 60%)',
] as const;

const BACKGROUND_COLORS = [
  'hsl(48 96% 89%)',
  'hsl(0 93% 94%)',
  'hsl(28 100% 90%)',
  'hsl(48 97% 77%)',
  'hsl(151 81% 90%)',
  'hsl(152 76% 80%)',
  'hsl(214 95% 88%)',
  'hsl(252 95% 92%)',
  'hsl(327 73% 90%)',
  'hsl(220 14% 91%)',
] as const;

const preserveToolbarMouseDown = (event: MouseEvent<HTMLElement>) => {
  event.preventDefault();
};

interface ToolbarButtonProps {
  label: string;
  onClick: () => void;
  onMouseDown?: (event: MouseEvent<HTMLElement>) => void;
  isActive?: boolean;
  disabled?: boolean;
  children: ReactNode;
}

function ToolbarButton({
  label,
  onClick,
  onMouseDown,
  isActive,
  disabled,
  children,
}: ToolbarButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onMouseDown={onMouseDown}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-transparent transition-colors',
        isActive
          ? 'bg-primary text-primary-foreground shadow-sm'
          : 'text-muted-foreground hover:bg-muted hover:text-foreground',
        disabled && 'cursor-not-allowed opacity-50 hover:bg-transparent hover:text-muted-foreground',
      )}
    >
      {children}
    </button>
  );
}

function Divider() {
  return <span aria-hidden="true" className="mx-0.5 h-5 w-px shrink-0 bg-border" />;
}

interface ColorPickerProps {
  colors: readonly string[];
  label: string;
  onClear: () => void;
  onPick: (color: string) => void;
  preserveSelection: (event: MouseEvent<HTMLElement>) => void;
}

function ColorPicker({ colors, label, onClear, onPick, preserveSelection }: ColorPickerProps) {
  return (
    <div className="w-[188px] p-2">
      <div className="mb-2 px-1 text-xs font-medium text-muted-foreground">{label}</div>
      <div className="grid grid-cols-5 gap-1.5">
        {colors.map((color) => (
          <button
            key={color}
            type="button"
            aria-label={`${label} ${color}`}
            title={color}
            onMouseDown={preserveSelection}
            onClick={() => onPick(color)}
            className="h-7 w-7 rounded-md border border-border transition-transform hover:scale-105"
            style={{ backgroundColor: color }}
          />
        ))}
      </div>
      <button
        type="button"
        onMouseDown={preserveSelection}
        onClick={onClear}
        className="mt-2 w-full rounded-md px-2 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      >
        Clear
      </button>
    </div>
  );
}

interface LinkPopoverProps {
  editor: Editor;
  onRememberSelection: () => void;
  runLinkCommand: (url: string) => void;
}

function LinkPopover({ editor, onRememberSelection, runLinkCommand }: LinkPopoverProps) {
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState('');

  return (
    <Popover
      open={open}
      onOpenChange={(nextOpen) => {
        if (nextOpen) {
          onRememberSelection();
          setUrl(editor.getAttributes('link').href || '');
        }
        setOpen(nextOpen);
      }}
    >
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label="Insert link"
          title="Insert link"
          onMouseDown={(event) => {
            preserveToolbarMouseDown(event);
            onRememberSelection();
          }}
          className={cn(
            'inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md transition-colors',
            editor.isActive('link')
              ? 'bg-primary text-primary-foreground shadow-sm'
              : 'text-muted-foreground hover:bg-muted hover:text-foreground',
          )}
        >
          <LinkIcon className="h-4 w-4" aria-hidden="true" focusable="false" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-[280px] p-2">
        <div className="flex gap-2">
          <Input
            aria-label="Link URL"
            autoFocus
            value={url}
            onChange={(event) => setUrl(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault();
                runLinkCommand(url);
                setOpen(false);
                setUrl('');
              }
            }}
            placeholder="https://example.com"
            className="h-8"
          />
          <Button
            type="button"
            size="sm"
            className="h-8"
            onClick={() => {
              runLinkCommand(url);
              setOpen(false);
              setUrl('');
            }}
          >
            Apply
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

export function DescriptionEditor({ content, onChange, onBlur }: DescriptionEditorProps) {
  const selectionRef = useRef<SelectionSnapshot | null>(null);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({ link: false }),
      Underline,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Placeholder.configure({
        placeholder: 'Tell your learners what the course will be about...',
      }),
      Link.configure({
        openOnClick: false,
        autolink: true,
        HTMLAttributes: {
          class: 'text-primary underline underline-offset-2',
        },
      }),
      TextStyle,
      FontSize,
      BackgroundColor,
      Color,
      Subscript,
      Superscript,
      Table.configure({
        resizable: true,
        HTMLAttributes: {
          class: 'w-full border-collapse table-fixed',
        },
      }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    content,
    onUpdate: ({ editor: instance }) => {
      onChange(instance.getHTML());
    },
    onSelectionUpdate: ({ editor: instance }) => {
      const { from, to } = instance.state.selection;
      selectionRef.current = { from, to };
    },
    editorProps: {
      attributes: {
        class:
          'prose prose-sm max-w-none min-h-[160px] p-4 text-foreground focus:outline-none [overflow-wrap:anywhere] [&_blockquote]:border-l-4 [&_blockquote]:border-border [&_blockquote]:pl-4 [&_blockquote]:text-muted-foreground [&_h2]:text-2xl [&_h2]:font-semibold [&_ol]:pl-5 [&_table]:my-4 [&_td]:border [&_td]:border-border [&_td]:p-2 [&_th]:border [&_th]:border-border [&_th]:bg-muted [&_th]:p-2 [&_ul]:pl-5',
      },
    },
  });

  useEffect(() => {
    if (!editor) return;

    const incoming = content || '<p></p>';
    const current = editor.getHTML();

    if (incoming !== current) {
      editor.commands.setContent(incoming, false);
    }
  }, [content, editor]);

  const rememberSelection = useCallback(() => {
    if (!editor) return;
    const { from, to } = editor.state.selection;
    selectionRef.current = { from, to };
  }, [editor]);

  const preserveSelection = useCallback(
    (event: MouseEvent<HTMLElement>) => {
      preserveToolbarMouseDown(event);
      rememberSelection();
    },
    [rememberSelection],
  );

  const chain = useCallback(() => {
    if (!editor) return null;
    const next = editor.chain().focus();
    const selection = selectionRef.current;

    if (selection) {
      next.setTextSelection(selection);
    }

    return next;
  }, [editor]);

  const applyTextColor = useCallback(
    (color: string) => {
      chain()?.setColor(color).run();
    },
    [chain],
  );

  const clearTextColor = useCallback(() => {
    chain()?.unsetColor().run();
  }, [chain]);

  const applyBackgroundColor = useCallback(
    (color: string) => {
      chain()?.setBackgroundColor(color).run();
    },
    [chain],
  );

  const clearBackgroundColor = useCallback(() => {
    chain()?.unsetBackgroundColor().run();
  }, [chain]);

  const applyLink = useCallback(
    (url: string) => {
      const next = chain();
      if (!next) return;

      if (!url.trim()) {
        next.extendMarkRange('link').unsetLink().run();
        return;
      }

      const href = /^https?:\/\//i.test(url) ? url : `https://${url}`;
      next.extendMarkRange('link').setLink({ href }).run();
    },
    [chain],
  );

  const currentSize = useMemo(() => {
    if (!editor) return 'Size';

    return (
      FONT_SIZES.find((size) => editor.getAttributes('textStyle').fontSize === size.value)?.label ||
      'Size'
    );
  }, [editor, editor?.state]);

  if (!editor) return null;

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-1 rounded-xl border border-border bg-background p-2 shadow-sm">
        <ToolbarButton
          label="Bold"
          onMouseDown={preserveSelection}
          onClick={() => chain()?.toggleBold().run()}
          isActive={editor.isActive('bold')}
        >
          <Bold className="h-4 w-4" aria-hidden="true" focusable="false" />
        </ToolbarButton>

        <ToolbarButton
          label="Italic"
          onMouseDown={preserveSelection}
          onClick={() => chain()?.toggleItalic().run()}
          isActive={editor.isActive('italic')}
        >
          <Italic className="h-4 w-4" aria-hidden="true" focusable="false" />
        </ToolbarButton>

        <ToolbarButton
          label="Underline"
          onMouseDown={preserveSelection}
          onClick={() => chain()?.toggleUnderline().run()}
          isActive={editor.isActive('underline')}
        >
          <UnderlineIcon className="h-4 w-4" aria-hidden="true" focusable="false" />
        </ToolbarButton>

        <ToolbarButton
          label="Strikethrough"
          onMouseDown={preserveSelection}
          onClick={() => chain()?.toggleStrike().run()}
          isActive={editor.isActive('strike')}
        >
          <Strikethrough className="h-4 w-4" aria-hidden="true" focusable="false" />
        </ToolbarButton>

        <Divider />

        <Popover>
          <PopoverTrigger asChild>
            <button
              type="button"
              aria-label="Text color"
              title="Text color"
              onMouseDown={preserveSelection}
              className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <Palette className="h-4 w-4" aria-hidden="true" focusable="false" />
            </button>
          </PopoverTrigger>
          <PopoverContent align="start" className="w-auto p-0">
            <ColorPicker
              colors={TEXT_COLORS}
              label="Text color"
              onPick={applyTextColor}
              onClear={clearTextColor}
              preserveSelection={preserveSelection}
            />
          </PopoverContent>
        </Popover>

        <Popover>
          <PopoverTrigger asChild>
            <button
              type="button"
              aria-label="Background color"
              title="Background color"
              onMouseDown={preserveSelection}
              className={cn(
                'inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md transition-colors',
                editor.isActive('textStyle', { backgroundColor: editor.getAttributes('textStyle').backgroundColor })
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground',
              )}
            >
              <Highlighter className="h-4 w-4" aria-hidden="true" focusable="false" />
            </button>
          </PopoverTrigger>
          <PopoverContent align="start" className="w-auto p-0">
            <ColorPicker
              colors={BACKGROUND_COLORS}
              label="Background color"
              onPick={applyBackgroundColor}
              onClear={clearBackgroundColor}
              preserveSelection={preserveSelection}
            />
          </PopoverContent>
        </Popover>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              aria-label="Font size"
              title="Font size"
              onMouseDown={preserveSelection}
              className="inline-flex h-8 shrink-0 items-center gap-1 rounded-md px-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <Type className="h-3.5 w-3.5" aria-hidden="true" focusable="false" />
              <span className="max-w-[64px] truncate">{currentSize}</span>
              <ChevronDown className="h-3 w-3" aria-hidden="true" focusable="false" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            {FONT_SIZES.map((size) => (
              <DropdownMenuItem
                key={size.value}
                onMouseDown={preserveSelection}
                onClick={() => chain()?.setFontSize(size.value).run()}
                style={{ fontSize: size.value }}
              >
                {size.label}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem onMouseDown={preserveSelection} onClick={() => chain()?.unsetFontSize().run()}>
              Reset
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              aria-label="Text alignment"
              title="Text alignment"
              onMouseDown={preserveSelection}
              className="inline-flex h-8 shrink-0 items-center gap-1 rounded-md px-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              {editor.isActive({ textAlign: 'center' }) ? (
                <AlignCenter className="h-4 w-4" aria-hidden="true" focusable="false" />
              ) : editor.isActive({ textAlign: 'right' }) ? (
                <AlignRight className="h-4 w-4" aria-hidden="true" focusable="false" />
              ) : editor.isActive({ textAlign: 'justify' }) ? (
                <AlignJustify className="h-4 w-4" aria-hidden="true" focusable="false" />
              ) : (
                <AlignLeft className="h-4 w-4" aria-hidden="true" focusable="false" />
              )}
              <ChevronDown className="h-3 w-3" aria-hidden="true" focusable="false" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuItem onMouseDown={preserveSelection} onClick={() => chain()?.setTextAlign('left').run()}>
              <AlignLeft className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" /> Left
            </DropdownMenuItem>
            <DropdownMenuItem onMouseDown={preserveSelection} onClick={() => chain()?.setTextAlign('center').run()}>
              <AlignCenter className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" /> Center
            </DropdownMenuItem>
            <DropdownMenuItem onMouseDown={preserveSelection} onClick={() => chain()?.setTextAlign('right').run()}>
              <AlignRight className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" /> Right
            </DropdownMenuItem>
            <DropdownMenuItem onMouseDown={preserveSelection} onClick={() => chain()?.setTextAlign('justify').run()}>
              <AlignJustify className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" /> Justify
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Divider />

        <ToolbarButton
          label="Bullet list"
          onMouseDown={preserveSelection}
          onClick={() => chain()?.toggleBulletList().run()}
          isActive={editor.isActive('bulletList')}
        >
          <List className="h-4 w-4" aria-hidden="true" focusable="false" />
        </ToolbarButton>

        <ToolbarButton
          label="Numbered list"
          onMouseDown={preserveSelection}
          onClick={() => chain()?.toggleOrderedList().run()}
          isActive={editor.isActive('orderedList')}
        >
          <ListOrdered className="h-4 w-4" aria-hidden="true" focusable="false" />
        </ToolbarButton>

        <LinkPopover editor={editor} onRememberSelection={rememberSelection} runLinkCommand={applyLink} />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              aria-label="Table actions"
              title="Table actions"
              onMouseDown={preserveSelection}
              className={cn(
                'inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md transition-colors',
                editor.isActive('table')
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground',
              )}
            >
              <TableIcon className="h-4 w-4" aria-hidden="true" focusable="false" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuItem
              onMouseDown={preserveSelection}
              onClick={() => chain()?.insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
            >
              <Plus className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" /> Insert table
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuLabel>Table</DropdownMenuLabel>
            <DropdownMenuItem
              disabled={!editor.isActive('table')}
              onMouseDown={preserveSelection}
              onClick={() => chain()?.addRowAfter().run()}
            >
              <Plus className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" /> Add row
            </DropdownMenuItem>
            <DropdownMenuItem
              disabled={!editor.isActive('table')}
              onMouseDown={preserveSelection}
              onClick={() => chain()?.addColumnAfter().run()}
            >
              <Plus className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" /> Add column
            </DropdownMenuItem>
            <DropdownMenuItem
              disabled={!editor.isActive('table')}
              onMouseDown={preserveSelection}
              onClick={() => chain()?.deleteRow().run()}
            >
              <Minus className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" /> Delete row
            </DropdownMenuItem>
            <DropdownMenuItem
              disabled={!editor.isActive('table')}
              onMouseDown={preserveSelection}
              onClick={() => chain()?.deleteColumn().run()}
            >
              <Minus className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" /> Delete column
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              disabled={!editor.isActive('table')}
              onMouseDown={preserveSelection}
              onClick={() => chain()?.deleteTable().run()}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" /> Delete table
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="hidden items-center gap-1 md:flex">
          <ToolbarButton
            label="Quote"
            onMouseDown={preserveSelection}
            onClick={() => chain()?.toggleBlockquote().run()}
            isActive={editor.isActive('blockquote')}
          >
            <Quote className="h-4 w-4" aria-hidden="true" focusable="false" />
          </ToolbarButton>

          <ToolbarButton
            label="Subscript"
            onMouseDown={preserveSelection}
            onClick={() => chain()?.toggleSubscript().run()}
            isActive={editor.isActive('subscript')}
          >
            <SubscriptIcon className="h-4 w-4" aria-hidden="true" focusable="false" />
          </ToolbarButton>

          <ToolbarButton
            label="Superscript"
            onMouseDown={preserveSelection}
            onClick={() => chain()?.toggleSuperscript().run()}
            isActive={editor.isActive('superscript')}
          >
            <SuperscriptIcon className="h-4 w-4" aria-hidden="true" focusable="false" />
          </ToolbarButton>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              aria-label="More formatting options"
              title="More formatting options"
              onMouseDown={preserveSelection}
              className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground md:hidden"
            >
              <MoreHorizontal className="h-4 w-4" aria-hidden="true" focusable="false" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onMouseDown={preserveSelection} onClick={() => chain()?.toggleBlockquote().run()}>
              <Quote className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" /> Quote
            </DropdownMenuItem>
            <DropdownMenuItem onMouseDown={preserveSelection} onClick={() => chain()?.toggleSubscript().run()}>
              <SubscriptIcon className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" /> Subscript
            </DropdownMenuItem>
            <DropdownMenuItem onMouseDown={preserveSelection} onClick={() => chain()?.toggleSuperscript().run()}>
              <SuperscriptIcon className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" /> Superscript
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="min-w-0 flex-1" />

        <Divider />

        <ToolbarButton
          label="Undo"
          onMouseDown={preserveSelection}
          onClick={() => chain()?.undo().run()}
          disabled={!editor.can().undo()}
        >
          <Undo className="h-4 w-4" aria-hidden="true" focusable="false" />
        </ToolbarButton>

        <ToolbarButton
          label="Redo"
          onMouseDown={preserveSelection}
          onClick={() => chain()?.redo().run()}
          disabled={!editor.can().redo()}
        >
          <Redo className="h-4 w-4" aria-hidden="true" focusable="false" />
        </ToolbarButton>
      </div>

      <div
        className="rounded-xl border border-border bg-background transition-colors focus-within:border-primary"
        onBlur={onBlur}
      >
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
