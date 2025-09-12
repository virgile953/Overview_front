import { X } from "lucide-react";
import { useEffect } from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export default function Modal({ isOpen, onClose, title, children }: ModalProps) {

  useEffect(() => {
    if (!isOpen) return;
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [onClose, isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-background/30 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="relative bg-background border border-border rounded-lg shadow-lg p-6 w-full
        max-w-lg overflow-auto scrollbar max-h-[80vh]"
        onClick={e => e.stopPropagation()}
      >
        <button
          className="absolute top-2 right-4 text-foreground hover:text-muted-foreground"
          onClick={onClose}
        >
          <X />
        </button>
        <h2 className="text-xl font-bold mb-4">{title}</h2>
        {children}
      </div>
    </div>
  );
}