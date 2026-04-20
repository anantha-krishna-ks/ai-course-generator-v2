import { DescriptionEditor } from './CourseCreation/DescriptionEditor';

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
}

/**
 * RichTextEditor — unified rich text editor.
 * Delegates to DescriptionEditor which provides the full feature set:
 * Bold, Italic, Underline, Strikethrough, Text/Background color, Alignment,
 * Bullet/Numbered lists, Undo/Redo, Font size, Link, Table (grid picker),
 * Quote, Subscript, Superscript — fully responsive toolbar.
 */
export const RichTextEditor = ({ content, onChange }: RichTextEditorProps) => {
  return <DescriptionEditor content={content} onChange={onChange} />;
};
