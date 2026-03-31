import { Megaphone } from "lucide-react";

interface PromoBannerProps {
  title: string;
  description: string;
  highlight?: string;
}

const PromoBanner = ({ title, description, highlight }: PromoBannerProps) => {
  return (
    <div className="card-luxury rounded-2xl p-4 mb-6 border border-primary/20 bg-primary/5">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
          <Megaphone className="w-5 h-5 text-primary" />
        </div>
        <div className="flex-1">
          <p className="font-display font-semibold text-foreground text-sm">{title}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
          {highlight && (
            <span className="inline-block mt-2 text-xs font-bold text-primary bg-primary/10 px-3 py-1 rounded-full">
              {highlight}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default PromoBanner;
