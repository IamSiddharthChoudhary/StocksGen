import type React from "react";
import {
  useState,
  useEffect,
  useRef,
  type SetStateAction,
  type Dispatch,
} from "react";

interface EditableTextProps {
  initialText: string;
  onSave: (text: string) => void;
  className?: string;
  mitigation?: boolean;
  hasChanged: boolean;
  setHasChanged: Dispatch<SetStateAction<boolean>>;
}

export function EditableText({
  initialText,
  hasChanged,
  setHasChanged,
  mitigation = false,
  onSave,
  className = "",
}: EditableTextProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [text, setText] = useState(initialText);
  const textRef = useRef<HTMLDivElement>(null);
  const cursorPositionRef = useRef<number | null>(null);

  useEffect(() => {
    if (isEditing && textRef.current) {
      textRef.current.focus();
      if (cursorPositionRef.current !== null) {
        const range = document.createRange();
        const sel = window.getSelection();
        if (textRef.current.childNodes.length > 0) {
          range.setStart(
            textRef.current.childNodes[0] || textRef.current,
            Math.min(
              cursorPositionRef.current,
              textRef.current.textContent?.length || 0
            )
          );
        } else {
          range.setStart(textRef.current, 0);
        }
        range.collapse(true);
        console.log(range);
        sel?.removeAllRanges();
        sel?.addRange(range);
      }
    }
  }, [isEditing, text]);

  const handleBlur = () => {
    setIsEditing(false);
    if (hasChanged) {
      onSave(text);
      setHasChanged(false);
    }
  };

  const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
    const newText = e.currentTarget.textContent || "";
    if (newText !== initialText) {
      setHasChanged(true);
    } else {
      setHasChanged(false);
    }
    setText(newText);
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      cursorPositionRef.current = range.startOffset;
    }
  };

  const handleSave = () => {
    onSave(text);
  };

  return (
    <div className="relative">
      <div
        ref={textRef}
        className={`${className} ${
          isEditing ? "border border-blue-500 rounded" : ""
        }`}
        contentEditable={isEditing}
        onBlur={handleSave}
        onClick={() => setIsEditing(true)}
        onInput={handleInput}
        suppressContentEditableWarning={true}
      >
        {mitigation && (
          <span className="font-bold text-white">Mitigation: </span>
        )}
        {text}
      </div>
    </div>
  );
}
