import { useState } from "react";
import { Megaphone, X } from "lucide-react";

interface PromoFloatingProps {
  title: string;
  description: string;
  highlight?: string;
}

const PromoFloating = ({ title, description, highlight }: PromoFloatingProps) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed right-4 bottom-24 z-50 flex flex-col items-end gap-2">
      {/* Expanded promo card */}
      <div
        className={`promo-glow rounded-2xl p-4 w-72 bg-card border border-[hsl(var(--gold))]/30 shadow-xl origin-bottom-right transition-all duration-300 ease-out ${
          open
            ? "opacity-100 scale-100 translate-y-0 pointer-events-auto"
            : "opacity-0 scale-90 translate-y-2 pointer-events-none"
        }`}
      >
        <button
          onClick={() => setOpen(false)}
          className="absolute top-2 right-2 w-6 h-6 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="w-3.5 h-3.5" />
        </button>
        <div className="flex items-start gap-3 pr-4">
          <div className="w-10 h-10 rounded-full bg-[hsl(var(--gold))]/10 flex items-center justify-center shrink-0">
            <Megaphone className="w-5 h-5 text-[hsl(var(--gold))]" />
          </div>
          <div className="flex-1">
            <p className="font-display font-semibold text-foreground text-sm">{title}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
            {highlight && (
              <span className="inline-block mt-2 text-xs font-bold text-[hsl(var(--gold))] bg-[hsl(var(--gold))]/10 px-3 py-1 rounded-full">
                {highlight}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Floating icon button */}
      <button
        onClick={() => setOpen(!open)}
        className={`promo-fab w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 ${
          open
            ? "bg-muted text-muted-foreground rotate-0"
            : "bg-[hsl(var(--gold))] text-primary-foreground promo-fab-glow rotate-0"
        }`}
      >
        {open ? (
          <X className="w-5 h-5" />
        ) : (
          <Megaphone className="w-5 h-5 animate-fade-in" />
        )}
      </button>
    </div>
  );
};

export default PromoFloating;
