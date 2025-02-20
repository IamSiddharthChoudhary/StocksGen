import { createSupabaseClient } from "@/lib/supaBaseClient";
import { X } from "lucide-react";
import type React from "react";
import {
  useState,
  useEffect,
  useRef,
  type SetStateAction,
  type Dispatch,
} from "react";

interface EditableTextProps {
  id?: string;
  initialText: string;
  onSave: (text: string, image?: File) => void;
  className?: string;
  mitigation?: boolean;
  hasChanged: boolean;
  count?: number;
  setCount?: Dispatch<SetStateAction<number>>;
  setHasChanged: Dispatch<SetStateAction<boolean>>;
}

export function EditableText({
  id,
  initialText,
  hasChanged,
  setHasChanged,
  mitigation = false,
  count,
  setCount,
  onSave,
  className = "",
}: EditableTextProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [text, setText] = useState(initialText);
  const [pastedImage, setPastedImage] = useState<File | null>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const cursorPositionRef = useRef<number | null>(null);
  const [dbImage, setDbImage] = useState("");
  const [hasImage, seHasImage] = useState(false);
  const client = createSupabaseClient();

  useEffect(() => {
    const func = async () => {
      const { data, error } = await client
        .from("images")
        .select("img")
        .eq("ticker", id)
        .single();
      if (data) {
        setDbImage(data.img);
        seHasImage(true);
      }
    };
    func();
  }, []);

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

  const handlePaste = async (e: React.ClipboardEvent<HTMLDivElement>) => {
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf("image") !== -1) {
        e.preventDefault();
        const file = items[i].getAsFile();
        if (file) {
          setPastedImage(file);
          setHasChanged(true);
          await uploadImage(file);
        }
        break;
      }
    }
    seHasImage(false);
  };

  const uploadImage = async (file: File) => {
    const encodedImage = await getEncodedImage(file);
    const { data, error } = await client
      .from("images")
      .upsert([{ ticker: id, img: encodedImage }])
      .single();
    console.log(data, error);
  };

  async function getEncodedImage(imageFile: File) {
    const base64Image = await fileToBase64(imageFile);

    const data = { imageUrl: base64Image };
    const res = await fetch("/api/extractImage", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    const image = (await res.json()).base64Image;
    return image;
  }

  function fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        resolve(reader.result as string);
      };
      reader.onerror = (error) => reject(error);
    });
  }

  const handleSave = () => {
    onSave(text, pastedImage || undefined);
  };

  const handleCut = async () => {
    const { data, error } = await client
      .from("images")
      .delete()
      .eq("ticker", id)
      .single();
    console.log(data, error);

    if (pastedImage) setPastedImage(null);
    else if (hasImage) seHasImage(false);
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
        onPaste={handlePaste}
        suppressContentEditableWarning={true}
      >
        {mitigation && (
          <span className="font-bold text-white">Mitigation: </span>
        )}
        {text}
      </div>
      {hasImage && (
        <div className="mt-2">
          <button
            className="absolute right-0 bg-slate-900 rounded-full p-1 bg-opacity-50 m-1"
            onClick={handleCut}
          >
            <X />
          </button>
          <img
            src={dbImage || "/placeholder.svg"}
            alt="Database image"
            className="w-full max-w-[681px] h-auto aspect-[681/416] object-cover mx-auto rounded-lg shadow-lg"
          />
        </div>
      )}
      {pastedImage && (
        <div className="mt-2">
          <button
            className="absolute right-0 bg-slate-900 rounded-full p-1 bg-opacity-50 m-1"
            onClick={handleCut}
          >
            <X />
          </button>
          <img
            src={URL.createObjectURL(pastedImage) || "/placeholder.svg"}
            alt="Pasted image"
            className="w-full max-w-[681px] h-auto aspect-[681/416] object-cover mx-auto rounded-lg shadow-lg"
          />
        </div>
      )}
    </div>
  );
}
