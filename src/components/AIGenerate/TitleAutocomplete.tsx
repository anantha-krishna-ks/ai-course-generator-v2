import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { getLanguage } from "@/services/courseLanguageStore";
import { TitleLanguageAffix } from "@/components/CourseCreation/TitleLanguageAffix";
import { ContentDepthAffix } from "@/components/AIGenerate/ContentDepthAffix";
import type { ContentDepth } from "@/components/Dashboard/AIOptionsPanel";


interface TitleAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  id?: string;
  placeholder?: string;
  /** Course language embedded into the title field. */
  language?: string;
  onLanguageChange?: (code: string) => void;
  languageLocked?: boolean;
  /** Content depth embedded into the title field, next to the language pill. */
  contentDepth?: ContentDepth;
  onContentDepthChange?: (v: ContentDepth) => void;
  contentDepthInvalid?: boolean;
}


// Mock AI suggestions based on input keywords
function generateSuggestions(input: string): string[] {
  const words = input.trim().toLowerCase().split(/\s+/);
  if (words.length < 2) return [];

  const suggestionMap: Record<string, string[]> = {
    "machine learning": [
      "Introduction to Machine Learning for Beginners",
      "Machine Learning Fundamentals & Applications",
      "Machine Learning in Practice: From Theory to Deployment",
      "Applied Machine Learning for Business Professionals",
    ],
    "project management": [
      "Project Management Essentials for Teams",
      "Agile Project Management Masterclass",
      "Project Management: Planning to Execution",
      "Strategic Project Management for Leaders",
    ],
    "data science": [
      "Data Science Foundations with Python",
      "Data Science for Decision Makers",
      "Introduction to Data Science & Analytics",
      "Practical Data Science in the Real World",
    ],
    "leadership skills": [
      "Leadership Skills for New Managers",
      "Developing Leadership Skills in the Workplace",
      "Leadership Skills: Inspire and Motivate Teams",
      "Effective Leadership Skills for Modern Organizations",
    ],
    "team building": [
      "Team Building Strategies for High Performance",
      "Effective Team Building in Remote Environments",
      "Team Building: Communication & Collaboration",
      "Team Building Workshop for Managers",
    ],
    "cyber security": [
      "Cyber Security Awareness Training",
      "Introduction to Cyber Security Best Practices",
      "Cyber Security Fundamentals for Organizations",
      "Advanced Cyber Security Threat Prevention",
    ],
    "customer service": [
      "Customer Service Excellence Training",
      "Mastering Customer Service Communication",
      "Customer Service Skills for Frontline Teams",
      "Building a Customer Service Culture",
    ],
  };

  // Find matching suggestions
  const inputLower = input.toLowerCase();
  for (const [key, suggestions] of Object.entries(suggestionMap)) {
    if (inputLower.includes(key) || key.includes(inputLower)) {
      return suggestions;
    }
  }

  // Generic fallback suggestions based on the typed words
  const capitalized = words.map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
  return [
    `${capitalized}: A Comprehensive Guide`,
    `Introduction to ${capitalized}`,
    `${capitalized} Fundamentals for Professionals`,
    `Mastering ${capitalized} in the Workplace`,
  ];
}

export function TitleAutocomplete({ value, onChange, id, placeholder, language, onLanguageChange, languageLocked }: TitleAutocompleteProps) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [focused, setFocused] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  const fetchSuggestions = useCallback((text: string) => {
    if (text.trim().length < 2) {
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }

    setIsGenerating(true);
    // Simulate AI delay
    debounceRef.current = setTimeout(() => {
      const results = generateSuggestions(text);
      setSuggestions(results);
      setShowDropdown(results.length > 0);
      setActiveIndex(-1);
      setIsGenerating(false);
    }, 400);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    fetchSuggestions(newValue);
  };

  const selectSuggestion = (suggestion: string) => {
    onChange(suggestion);
    setShowDropdown(false);
    setSuggestions([]);
    setActiveIndex(-1);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showDropdown || suggestions.length === 0) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setActiveIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : 0));
        break;
      case "ArrowUp":
        e.preventDefault();
        setActiveIndex((prev) => (prev > 0 ? prev - 1 : suggestions.length - 1));
        break;
      case "Enter":
        if (activeIndex >= 0) {
          e.preventDefault();
          selectSuggestion(suggestions[activeIndex]);
        }
        break;
      case "Escape":
        setShowDropdown(false);
        setActiveIndex(-1);
        break;
    }
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  return (
    <div ref={containerRef} className="relative">
      <div
        className={cn(
          "relative flex items-end gap-2 border-b-2 pb-2 sm:pb-2.5 transition-colors",
          focused ? "border-primary" : "border-border",
        )}
      >
        <input
          ref={inputRef}
          id={id}
          type="text"
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            setFocused(true);
            if (suggestions.length > 0) setShowDropdown(true);
          }}
          onBlur={() => setFocused(false)}
          dir={language ? getLanguage(language).dir : undefined}
          placeholder={placeholder}
          className="flex-1 min-w-0 text-lg sm:text-xl md:text-2xl font-bold bg-transparent border-0 outline-none transition-colors placeholder:text-muted-foreground/40 placeholder:font-normal text-foreground"
          autoComplete="off"
          role="combobox"
          aria-expanded={showDropdown}
          aria-autocomplete="list"
          aria-controls="title-suggestions"
          aria-activedescendant={activeIndex >= 0 ? `suggestion-${activeIndex}` : undefined}
        />
        <AnimatePresence>
          {isGenerating && (
            <motion.span
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="mb-1 shrink-0"
            >
              <Sparkles className="w-4 h-4 text-primary animate-pulse" aria-hidden="true" focusable="false" />
            </motion.span>
          )}
        </AnimatePresence>
        {onContentDepthChange && (
          <ContentDepthAffix
            value={contentDepth}
            onChange={onContentDepthChange}
            invalid={contentDepthInvalid}
            className="mb-0.5"
          />
        )}
        {language && onLanguageChange && (
          <TitleLanguageAffix
            value={language}
            onChange={onLanguageChange}
            locked={languageLocked}
            className="mb-0.5"
          />
        )}
      </div>


      <AnimatePresence>
        {showDropdown && suggestions.length > 0 && (
          <motion.ul
            id="title-suggestions"
            role="listbox"
            aria-label="AI title suggestions"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
            className="absolute z-50 left-0 right-0 mt-2 bg-card border border-border rounded-xl shadow-[0_8px_30px_-12px_hsl(var(--foreground)/0.15)] overflow-hidden"
          >
            <li className="flex items-center gap-1.5 px-3.5 py-2 border-b border-border/60">
              <Sparkles className="w-3 h-3 text-primary" aria-hidden="true" focusable="false" />
              <span className="text-[11px] font-semibold text-field-label uppercase tracking-wider">AI Suggestions</span>
            </li>
            {suggestions.map((suggestion, index) => (
              <li
                key={index}
                id={`suggestion-${index}`}
                role="option"
                aria-selected={activeIndex === index}
                onClick={() => selectSuggestion(suggestion)}
                onMouseEnter={() => setActiveIndex(index)}
                className={cn(
                  "px-3.5 py-2.5 text-sm cursor-pointer transition-colors",
                  activeIndex === index
                    ? "bg-primary/8 text-foreground"
                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                )}
              >
                {suggestion}
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}
