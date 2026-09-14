import React, { useRef, useState } from "react";
import { Camera, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Image } from "@/components/ui/image";

// حد أقصى لحجم الملف الأصلي قبل الـ base64 (اللي بيزود الحجم ~33%).
// نفس الحد متطابق مع MAX_AVATAR_DATA_URI_LENGTH في auth_routes.py بالباك اند.
const MAX_FILE_BYTES = 2 * 1024 * 1024; // 2MB

/**
 * صورة بروفايل دائرية قابلة للتغيير: بتظهر أيقونة كاميرا لما تعمل hover
 * عليها (أو focus بالكيبورد)، وبتفتح file picker من الجهاز. القراءة والتحويل
 * لـ base64 بتحصل هنا؛ الرفع الفعلي (onUpload) مسؤولية الصفحة اللي بتستخدمه.
 *
 * مستخدَم في بروفايل الأب دلوقتي، ومصمم عشان يتستخدم في بروفايل الطفل
 * وأي مكان تاني محتاج نفس الصورة (زي الداشبورد) من غير تكرار كود.
 */
export function AvatarUpload({
  src,
  alt,
  onUpload,
  size = "w-20 h-20",
  className,
  disabled = false,
}) {
  const inputRef = useRef(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // يسمح تختار نفس الملف تاني لو رفضته
    if (!file || disabled) return;

    setError("");

    if (!file.type.startsWith("image/")) {
      setError("Please choose an image file.");
      return;
    }
    if (file.size > MAX_FILE_BYTES) {
      setError("Image is too large (max 2MB).");
      return;
    }

    const dataUrl = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(new Error("read-failed"));
      reader.readAsDataURL(file);
    }).catch(() => null);

    if (!dataUrl) {
      setError("Couldn't read that image, try again.");
      return;
    }

    try {
      setSaving(true);
      await onUpload?.(dataUrl);
    } catch (err) {
      setError(err?.message || "Couldn't save your photo, try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={cn("relative inline-block group", size, className)}>
      <div className="w-full h-full rounded-full overflow-hidden">
        <Image src={src} alt={alt} className="w-full h-full object-cover" fittingType="fill" />
      </div>

      <button
        type="button"
        onClick={() => !disabled && inputRef.current?.click()}
        disabled={disabled || saving}
        aria-label="Change photo"
        className={cn(
          "absolute inset-0 rounded-full flex items-center justify-center",
          "bg-black/0 group-hover:bg-black/40 focus-visible:bg-black/40",
          "opacity-0 group-hover:opacity-100 focus-visible:opacity-100",
          "transition-all outline-none",
          disabled ? "cursor-default" : "cursor-pointer"
        )}
      >
        {saving ? (
          <Loader2 className="w-6 h-6 text-white animate-spin" />
        ) : (
          <Camera className="w-6 h-6 text-white" />
        )}
      </button>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFile}
        disabled={disabled}
      />

      {error && (
        <div className="absolute top-full mt-1.5 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] font-semibold text-red-400 bg-black/70 px-2 py-0.5 rounded-full z-10">
          {error}
        </div>
      )}
    </div>
  );
}