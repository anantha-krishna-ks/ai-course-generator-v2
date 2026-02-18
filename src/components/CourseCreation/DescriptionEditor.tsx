import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Highlight from '@tiptap/extension-highlight';
import TextAlign from '@tiptap/extension-text-align';
import Placeholder from '@tiptap/extension-placeholder';
import { 
  Bold, 
  Italic, 
  Highlighter, 
  Code, 
  Type, 
  AlignLeft, 
  AlignCenter,
  AlignRight,
  ListOrdered, 
  List,
  Undo,
  ChevronDown
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface DescriptionEditorProps {
  content: string;
  onChange: (content: string) => void;
  onBlur?: () => void;
}

export function DescriptionEditor({ content, onChange, onBlur }: DescriptionEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Highlight.configure({
        multicolor: false,
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Placeholder.configure({
        placeholder: 'Tell your learners what the course will be about...',
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm dark:prose-invert max-w-none min-h-[120px] p-4 focus:outline-none text-lg text-foreground leading-relaxed [&_h2]:text-[1.75rem] [&_h2]:font-semibold',
      },
    },
  });

  if (!editor) {
    return null;
  }

  const getCurrentHeading = () => {
    if (editor.isActive('heading', { level: 1 })) return 'Heading 1';
    if (editor.isActive('heading', { level: 2 })) return 'Heading 2';
    if (editor.isActive('heading', { level: 3 })) return 'Heading 3';
    return 'Normal';
  };

  const ToolbarButton = ({ 
    onClick, 
    isActive, 
    children,
    disabled = false
  }: { 
    onClick: () => void; 
    isActive?: boolean;
    children: React.ReactNode;
    disabled?: boolean;
  }) => (
    <button 
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "p-1.5 rounded transition-colors",
        isActive 
          ? "bg-primary/20 text-primary" 
          : "hover:bg-foreground/10 text-foreground/70",
        disabled && "opacity-40 cursor-not-allowed"
      )}
    >
      {children}
    </button>
  );

  return (
    <div className="space-y-2 animate-fade-in">
      {/* Rich Text Toolbar */}
      <div className="flex items-center gap-1 p-2 border border-foreground/20 rounded-lg bg-background/50 backdrop-blur-sm flex-wrap">
        <ToolbarButton 
          onClick={() => editor.chain().focus().toggleBold().run()}
          isActive={editor.isActive('bold')}
        >
          <Bold className="w-4 h-4" />
        </ToolbarButton>
        
        <ToolbarButton 
          onClick={() => editor.chain().focus().toggleItalic().run()}
          isActive={editor.isActive('italic')}
        >
          <Italic className="w-4 h-4" />
        </ToolbarButton>
        
        <ToolbarButton 
          onClick={() => editor.chain().focus().toggleHighlight().run()}
          isActive={editor.isActive('highlight')}
        >
          <Highlighter className="w-4 h-4" />
        </ToolbarButton>
        
        <ToolbarButton 
          onClick={() => editor.chain().focus().toggleCode().run()}
          isActive={editor.isActive('code')}
        >
          <Code className="w-4 h-4" />
        </ToolbarButton>
        
        <div className="w-px h-5 bg-foreground/20 mx-1" />
        
        {/* Text Align Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button 
              type="button"
              className="p-1.5 hover:bg-foreground/10 rounded transition-colors text-foreground/70"
            >
              {editor.isActive({ textAlign: 'center' }) ? (
                <AlignCenter className="w-4 h-4" />
              ) : editor.isActive({ textAlign: 'right' }) ? (
                <AlignRight className="w-4 h-4" />
              ) : (
                <AlignLeft className="w-4 h-4" />
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="bg-background border min-w-[120px]">
            <DropdownMenuItem 
              onClick={() => editor.chain().focus().setTextAlign('left').run()}
              className={cn(editor.isActive({ textAlign: 'left' }) && "bg-primary/10")}
            >
              <AlignLeft className="w-4 h-4 mr-2" /> Left
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => editor.chain().focus().setTextAlign('center').run()}
              className={cn(editor.isActive({ textAlign: 'center' }) && "bg-primary/10")}
            >
              <AlignCenter className="w-4 h-4 mr-2" /> Center
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => editor.chain().focus().setTextAlign('right').run()}
              className={cn(editor.isActive({ textAlign: 'right' }) && "bg-primary/10")}
            >
              <AlignRight className="w-4 h-4 mr-2" /> Right
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        
        <ToolbarButton 
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          isActive={editor.isActive('bulletList')}
        >
          <List className="w-4 h-4" />
        </ToolbarButton>
        
        <ToolbarButton 
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          isActive={editor.isActive('orderedList')}
        >
          <ListOrdered className="w-4 h-4" />
        </ToolbarButton>
        
        <div className="w-px h-5 bg-foreground/20 mx-1" />
        
        {/* Heading/Normal dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button 
              type="button"
              className="flex items-center gap-1 px-2 py-1 hover:bg-foreground/10 rounded transition-colors text-sm text-foreground/70 min-w-[90px]"
            >
              {getCurrentHeading()}
              <ChevronDown className="w-3 h-3" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="bg-background border min-w-[120px]">
            <DropdownMenuItem 
              onClick={() => editor.chain().focus().setParagraph().run()}
              className={cn(!editor.isActive('heading') && "bg-primary/10")}
            >
              Normal
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
              className={cn(editor.isActive('heading', { level: 1 }) && "bg-primary/10")}
            >
              <span className="text-xl font-bold">Heading 1</span>
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
              className={cn(editor.isActive('heading', { level: 2 }) && "bg-primary/10")}
            >
              <span className="text-lg font-bold">Heading 2</span>
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
              className={cn(editor.isActive('heading', { level: 3 }) && "bg-primary/10")}
            >
              <span className="text-base font-bold">Heading 3</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        
        <ToolbarButton 
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
        >
          <Undo className="w-4 h-4" />
        </ToolbarButton>
      </div>
      
      {/* Editor Content */}
      <div 
        className="border border-foreground/20 rounded-lg bg-background/30"
        onBlur={onBlur}
      >
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
