import { useEffect, useMemo, useState } from 'react';
import SunEditor from 'suneditor-react';
import 'suneditor/css/editor';
import { useIsMobile } from '@/hooks/use-mobile';

interface DescriptionEditorProps {
  content: string;
  onChange: (content: string) => void;
  onBlur?: () => void;
}

const TEXT_COLORS = [
  '#111827',
  '#374151',
  '#dc2626',
  '#ea580c',
  '#ca8a04',
  '#16a34a',
  '#0891b2',
  '#2563eb',
  '#7c3aed',
  '#db2777',
];

const BACKGROUND_COLORS = [
  '#fef3c7',
  '#fee2e2',
  '#ffedd5',
  '#fde68a',
  '#dcfce7',
  '#bbf7d0',
  '#dbeafe',
  '#ede9fe',
  '#fce7f3',
  '#e5e7eb',
];

export function DescriptionEditor({ content, onChange, onBlur }: DescriptionEditorProps) {
  const isMobile = useIsMobile();
  const [value, setValue] = useState(content || '<p></p>');

  useEffect(() => {
    const nextValue = content || '<p></p>';
    if (nextValue !== value) {
      setValue(nextValue);
    }
  }, [content, value]);

  const setOptions = useMemo(
    () => ({
      mode: 'classic' as const,
      height: 'auto',
      minHeight: '180px',
      maxHeight: '480px',
      defaultTag: 'p',
      buttonList: isMobile
        ? [
            ['undo', 'redo'],
            ['bold', 'italic', 'underline', 'strike'],
            ['fontSize', 'fontColor', 'backgroundColor'],
            ['align', 'list'],
            ['link', 'table', 'blockquote'],
            ['subscript', 'superscript'],
          ]
        : [
            ['undo', 'redo'],
            ['bold', 'italic', 'underline', 'strike'],
            ['fontSize'],
            ['fontColor', 'backgroundColor'],
            ['align'],
            ['list'],
            ['link', 'table', 'blockquote'],
            ['subscript', 'superscript'],
          ],
      colorList: TEXT_COLORS,
      paragraphStyles: {
        spaced: 'Spaced paragraph',
      },
      formats: ['p', 'blockquote'],
      plugins: undefined,
      resizingBar: false,
      fontSizeUnit: 'px',
      fontSize: [12, 14, 16, 18, 22, 28, 36],
      placeholder: 'Tell your learners what the course will be about...',
      attributesWhitelist: {
        all: 'style|class|colspan|rowspan|target|href|rel',
      },
      callBackSave: undefined,
      stickyToolbar: '-1',
      imageUploadUrl: undefined,
      videoUploadUrl: undefined,
      backgroundColor: {
        items: BACKGROUND_COLORS,
      },
    }),
    [isMobile],
  );

  return (
    <div className="description-editor-shell rounded-xl border border-border bg-background shadow-sm">
      <SunEditor
        setContents={value}
        onChange={(nextContent) => {
          setValue(nextContent);
          onChange(nextContent);
        }}
        onBlur={() => onBlur?.()}
        setDefaultStyle="font-family: inherit; font-size: 16px; color: hsl(var(--foreground));"
        setOptions={setOptions}
      />
    </div>
  );
}