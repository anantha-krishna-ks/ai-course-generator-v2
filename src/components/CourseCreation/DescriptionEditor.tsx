import { useEffect, useRef, type ComponentType, type MouseEvent, type SVGProps } from 'react';
import { EditorContent, useEditor } from '@tiptap/react';
import { Extension, type ChainedCommands } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import { TextStyle } from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import Highlight from '@tiptap/extension-highlight';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import Subscript from '@tiptap/extension-subscript';
import Superscript from '@tiptap/extension-superscript';
import { Table } from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableHeader from '@tiptap/extension-table-header';
import TableCell from '@tiptap/extension-table-cell';
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Bold,
  Highlighter,
  Italic,
  Link2,
  List,
  ListOrdered,
  MoreHorizontal,
  Quote,
  Redo,
  Strikethrough,
  Subscript as SubscriptIcon,
  Superscript as SuperscriptIcon,
  Table2,
  Type,
  Underline as UnderlineIcon,
  Undo,
} from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

interface DescriptionEditorProps {
  content: string;
  onChange: (content: string) => void;
  onBlur?: () => void;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    fontSize: {
      setFontSize: (fontSize: string) => ReturnType;
      unsetFontSize: () => ReturnType;
    };
  }
}

type TextStylePreset = {
  label: string;
  value: string;
  type: 'paragraph' | 'heading';
  level?: 1 | 2 | 3;
  fontSize?: string;
};

const TEXT_STYLE_PRESETS: TextStylePreset[] = [
  { label: 'Heading 1', value: 'h1', type: 'heading', level: 1 },
  { label: 'Heading 2', value: 'h2', type: 'heading', level: 2 },
  { label: 'Heading 3', value: 'h3', type: 'heading', level: 3 },
  { label: 'Large', value: 'large', type: 'paragraph', fontSize: '20px' },
  { label: 'Normal', value: 'normal', type: 'paragraph', fontSize: '16px' },
  { label: 'Small', value: 'small', type: 'paragraph', fontSize: '13px' },
];

const DEFAULT_PRESET_VALUE = 'normal';
const DEFAULT_TEXT_COLOR = '#111827';
const DEFAULT_HIGHLIGHT_COLOR = '#fef08a';

const FontSize = Extension.create({
  name: 'fontSize',

  addOptions() {
    return {
      types: ['textStyle'],
    };
  },

  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          fontSize: {
            default: null,
            parseHTML: (element) => element.style.fontSize || null,
            renderHTML: (attributes) => {
              if (!attributes.fontSize) {
                return {};
              }

              return {
                style: `font-size: ${attributes.fontSize}`,
              };
            },
          },
        },
      },
    ];
  },

  addCommands() {
    return {
      setFontSize:
        (fontSize) =>
        ({ chain }) =>
          chain().setMark('textStyle', { fontSize }).run(),
      unsetFontSize:
        () =>
        ({ chain }) =>
          chain().setMark('textStyle', { fontSize: null }).removeEmptyTextStyle().run(),
    };
  },
});

const isHexColor = (value?: string | null) => /^#[0-9A-F]{6}$/i.test(value ?? '');

const getSafeColor = (value: string | null | undefined, fallback: string) =>
  isHexColor(value) ? value! : fallback;

interface ToolbarButtonProps {
  active?: boolean;
  ariaLabel: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  onMouseDown: (event: MouseEvent<HTMLElement>) => void;
  onPress: () => void;
}

function ToolbarButton({ active = false, ariaLabel, icon: Icon, onMouseDown, onPress }: ToolbarButtonProps) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      aria-label={ariaLabel}
      aria-pressed={active}
      onMouseDown={onMouseDown}
      onClick={onPress}
      title={ariaLabel}
      className={cn(
        'h-8 w-8 shrink-0 rounded-md p-0 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:ring-2 focus-visible:ring-primary/40',
        active && 'bg-primary/15 text-primary hover:bg-primary/20',
      )}
    >
      <Icon aria-hidden="true" focusable="false" className="h-3.5 w-3.5" />
    </Button>
  );
}

function ToolbarDivider() {
  return <span aria-hidden="true" className="mx-0.5 hidden h-5 w-px shrink-0 bg-border sm:block" />;
}

export function DescriptionEditor({ content, onChange, onBlur }: DescriptionEditorProps) {
  const isMobile = useIsMobile();
  const selectionRef = useRef<{ from: number; to: number } | null>(null);

  const editor = useEditor({
    extensions: [
      StarterKit,
      TextStyle,
      FontSize,
      Underline,
      Color,
      Highlight.configure({ multicolor: true }),
      Link.configure({
        openOnClick: false,
        autolink: true,
        defaultProtocol: 'https',
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
        alignments: ['left', 'center', 'right', 'justify'],
      }),
      Placeholder.configure({
        placeholder: 'Tell your learners what the course will be about...',
      }),
      Subscript,
      Superscript,
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    content: content || '<p></p>',
    immediatelyRender: false,
    onCreate: ({ editor }) => {
      const { from, to } = editor.state.selection;
      selectionRef.current = { from, to };
    },
    onSelectionUpdate: ({ editor }) => {
      const { from, to } = editor.state.selection;
      selectionRef.current = { from, to };
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    onBlur: ({ editor }) => {
      const { from, to } = editor.state.selection;
      selectionRef.current = { from, to };
      onBlur?.();
    },
    editorProps: {
      attributes: {
        class:
          'prose prose-sm dark:prose-invert max-w-none min-h-[220px] p-4 focus:outline-none ' +
          '[overflow-wrap:anywhere] break-words [&_*]:[overflow-wrap:anywhere] [&_*]:break-words ' +
          '[&_blockquote]:border-l-4 [&_blockquote]:border-primary/40 [&_blockquote]:bg-muted/40 [&_blockquote]:pl-4 [&_blockquote]:py-2 [&_blockquote]:my-3 [&_blockquote]:italic [&_blockquote]:text-foreground ' +
          '[&_.tableWrapper]:overflow-x-auto [&_.tableWrapper]:my-3 ' +
          '[&_table]:border-collapse [&_table]:w-full [&_table]:table-fixed ' +
          '[&_th]:border [&_th]:border-border [&_th]:bg-muted [&_th]:p-2 [&_th]:text-left [&_th]:font-semibold ' +
          '[&_td]:border [&_td]:border-border [&_td]:p-2 [&_td]:align-top ' +
          '[&_.selectedCell]:bg-primary/10',
      },
    },
  });

  useEffect(() => {
    if (!editor) {
      return;
    }

    const nextContent = content || '<p></p>';

    if (editor.getHTML() !== nextContent) {
      editor.commands.setContent(nextContent, { emitUpdate: false });
    }
  }, [content, editor]);

  const rememberSelection = () => {
    if (!editor) {
      return;
    }

    const { from, to } = editor.state.selection;
    selectionRef.current = { from, to };
  };

  const preventToolbarMouseDown = (event: React.MouseEvent<HTMLElement>) => {
    event.preventDefault();
    rememberSelection();
  };

  const runCommand = (apply: (chain: ChainedCommands) => ChainedCommands) => {
    if (!editor) {
      return;
    }

    let chain = editor.chain().focus();

    if (selectionRef.current) {
      chain = chain.setTextSelection(selectionRef.current);
    }

    apply(chain).run();
    rememberSelection();
  };

  const setLink = () => {
    if (!editor) {
      return;
    }

    const currentHref = editor.getAttributes('link').href ?? '';
    const nextHref = window.prompt('Enter link URL', currentHref);

    if (nextHref === null) {
      return;
    }

    if (!nextHref.trim()) {
      runCommand((chain) => chain.extendMarkRange('link').unsetLink());
      return;
    }

    runCommand((chain) =>
      chain.extendMarkRange('link').setLink({
        href: nextHref,
        target: '_blank',
        rel: 'noopener noreferrer',
      }),
    );
  };

  if (!editor) {
    return <div className="description-editor-shell rounded-xl border border-border bg-background p-4 text-sm text-muted-foreground">Loading editor...</div>;
  }

  const currentFontSize = editor.getAttributes('textStyle').fontSize as string | undefined;
  const activePresetValue = (() => {
    if (editor.isActive('heading', { level: 1 })) return 'h1';
    if (editor.isActive('heading', { level: 2 })) return 'h2';
    if (editor.isActive('heading', { level: 3 })) return 'h3';
    const sizeMatch = TEXT_STYLE_PRESETS.find(
      (preset) => preset.type === 'paragraph' && preset.fontSize === currentFontSize,
    );
    return sizeMatch ? sizeMatch.value : DEFAULT_PRESET_VALUE;
  })();
  const textColorValue = getSafeColor(editor.getAttributes('textStyle').color as string | undefined, DEFAULT_TEXT_COLOR);
  const highlightValue = getSafeColor(editor.getAttributes('highlight').color as string | undefined, DEFAULT_HIGHLIGHT_COLOR);

  const applyTextStylePreset = (value: string) => {
    const preset = TEXT_STYLE_PRESETS.find((item) => item.value === value);
    if (!preset) return;

    runCommand((chain) => {
      if (preset.type === 'heading' && preset.level) {
        return chain.unsetFontSize().setHeading({ level: preset.level });
      }
      const next = chain.setParagraph();
      return preset.fontSize ? next.setFontSize(preset.fontSize) : next.unsetFontSize();
    });
  };

  const primaryControls = (
    <>
      <ToolbarButton ariaLabel="Bold" active={editor.isActive('bold')} icon={Bold} onMouseDown={preventToolbarMouseDown} onPress={() => runCommand((chain) => chain.toggleBold())} />
      <ToolbarButton ariaLabel="Italic" active={editor.isActive('italic')} icon={Italic} onMouseDown={preventToolbarMouseDown} onPress={() => runCommand((chain) => chain.toggleItalic())} />
      <ToolbarButton ariaLabel="Underline" active={editor.isActive('underline')} icon={UnderlineIcon} onMouseDown={preventToolbarMouseDown} onPress={() => runCommand((chain) => chain.toggleUnderline())} />
      <ToolbarButton ariaLabel="Strike through" active={editor.isActive('strike')} icon={Strikethrough} onMouseDown={preventToolbarMouseDown} onPress={() => runCommand((chain) => chain.toggleStrike())} />
      <ToolbarButton ariaLabel="Bulleted list" active={editor.isActive('bulletList')} icon={List} onMouseDown={preventToolbarMouseDown} onPress={() => runCommand((chain) => chain.toggleBulletList())} />
      <ToolbarButton ariaLabel="Numbered list" active={editor.isActive('orderedList')} icon={ListOrdered} onMouseDown={preventToolbarMouseDown} onPress={() => runCommand((chain) => chain.toggleOrderedList())} />
      <ToolbarButton ariaLabel="Undo" icon={Undo} onMouseDown={preventToolbarMouseDown} onPress={() => runCommand((chain) => chain.undo())} />
      <ToolbarButton ariaLabel="Redo" icon={Redo} onMouseDown={preventToolbarMouseDown} onPress={() => runCommand((chain) => chain.redo())} />
    </>
  );

  const secondaryControls = (
    <>
      <label className="flex min-w-0 items-center gap-2 rounded-md border border-border bg-background px-2 py-1 text-xs text-foreground" onMouseDown={preventToolbarMouseDown}>
        <Type aria-hidden="true" focusable="false" className="h-4 w-4 shrink-0" />
        <span className="sr-only">Text style</span>
        <select
          aria-label="Text style"
          className="min-w-[6.5rem] bg-transparent text-xs outline-none"
          value={activePresetValue}
          onMouseDown={preventToolbarMouseDown}
          onChange={(event) => applyTextStylePreset(event.target.value)}
        >
          {TEXT_STYLE_PRESETS.map((preset) => (
            <option key={preset.value} value={preset.value}>
              {preset.label}
            </option>
          ))}
        </select>
      </label>

      <div className="flex items-center gap-1 rounded-md border border-border bg-background p-1">
        <ToolbarButton ariaLabel="Align left" active={editor.isActive({ textAlign: 'left' })} icon={AlignLeft} onMouseDown={preventToolbarMouseDown} onPress={() => runCommand((chain) => chain.setTextAlign('left'))} />
        <ToolbarButton ariaLabel="Align center" active={editor.isActive({ textAlign: 'center' })} icon={AlignCenter} onMouseDown={preventToolbarMouseDown} onPress={() => runCommand((chain) => chain.setTextAlign('center'))} />
        <ToolbarButton ariaLabel="Align right" active={editor.isActive({ textAlign: 'right' })} icon={AlignRight} onMouseDown={preventToolbarMouseDown} onPress={() => runCommand((chain) => chain.setTextAlign('right'))} />
        <ToolbarButton ariaLabel="Justify text" active={editor.isActive({ textAlign: 'justify' })} icon={AlignJustify} onMouseDown={preventToolbarMouseDown} onPress={() => runCommand((chain) => chain.setTextAlign('justify'))} />
      </div>

      <label className="relative flex h-8 items-center gap-2 rounded-md border border-border bg-background px-2 text-xs text-foreground" onMouseDown={preventToolbarMouseDown}>
        <Type aria-hidden="true" focusable="false" className="h-4 w-4" />
        <span className="hidden sm:inline">Text</span>
        <input
          type="color"
          aria-label="Text color"
          value={textColorValue}
          onMouseDown={preventToolbarMouseDown}
          onChange={(event) => runCommand((chain) => chain.setColor(event.target.value))}
          className="absolute inset-0 cursor-pointer opacity-0"
        />
      </label>

      <label className="relative flex h-8 items-center gap-2 rounded-md border border-border bg-background px-2 text-xs text-foreground" onMouseDown={preventToolbarMouseDown}>
        <Highlighter aria-hidden="true" focusable="false" className="h-4 w-4" />
        <span className="hidden sm:inline">Highlight</span>
        <input
          type="color"
          aria-label="Background color"
          value={highlightValue}
          onMouseDown={preventToolbarMouseDown}
          onChange={(event) => runCommand((chain) => chain.setHighlight({ color: event.target.value }))}
          className="absolute inset-0 cursor-pointer opacity-0"
        />
      </label>

      <ToolbarButton ariaLabel="Insert or edit link" active={editor.isActive('link')} icon={Link2} onMouseDown={preventToolbarMouseDown} onPress={setLink} />
      <ToolbarButton ariaLabel="Block quote" active={editor.isActive('blockquote')} icon={Quote} onMouseDown={preventToolbarMouseDown} onPress={() => runCommand((chain) => chain.toggleBlockquote())} />
      <ToolbarButton ariaLabel="Subscript" active={editor.isActive('subscript')} icon={SubscriptIcon} onMouseDown={preventToolbarMouseDown} onPress={() => runCommand((chain) => chain.toggleSubscript())} />
      <ToolbarButton ariaLabel="Superscript" active={editor.isActive('superscript')} icon={SuperscriptIcon} onMouseDown={preventToolbarMouseDown} onPress={() => runCommand((chain) => chain.toggleSuperscript())} />
      <ToolbarButton ariaLabel="Insert table" active={editor.isActive('table')} icon={Table2} onMouseDown={preventToolbarMouseDown} onPress={() => runCommand((chain) => chain.insertTable({ rows: 3, cols: 3, withHeaderRow: true }))} />
      {editor.isActive('table') && (
        <>
          <Button type="button" variant="outline" size="sm" onMouseDown={preventToolbarMouseDown} onClick={() => runCommand((chain) => chain.addRowAfter())} className="h-8 text-xs">
            Row +
          </Button>
          <Button type="button" variant="outline" size="sm" onMouseDown={preventToolbarMouseDown} onClick={() => runCommand((chain) => chain.addColumnAfter())} className="h-8 text-xs">
            Col +
          </Button>
          <Button type="button" variant="outline" size="sm" onMouseDown={preventToolbarMouseDown} onClick={() => runCommand((chain) => chain.deleteTable())} className="h-8 text-xs">
            Delete table
          </Button>
        </>
      )}
    </>
  );

  return (
    <div className="description-editor-shell overflow-hidden rounded-xl border border-border bg-background shadow-sm">
      <div className="flex flex-wrap items-center gap-2 border-b border-border bg-muted/30 p-2">
        {primaryControls}
        {isMobile ? (
          <Popover>
            <PopoverTrigger asChild>
              <Button type="button" variant="outline" size="sm" aria-label="More formatting options" onMouseDown={preventToolbarMouseDown} className="ml-auto h-8 px-2">
                <MoreHorizontal aria-hidden="true" focusable="false" className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-[min(20rem,calc(100vw-2rem))]">
              <div className="flex flex-wrap items-center gap-2">{secondaryControls}</div>
            </PopoverContent>
          </Popover>
        ) : (
          secondaryControls
        )}
      </div>

      <EditorContent editor={editor} />
    </div>
  );
}