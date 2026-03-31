import { useState } from "react";
import { Check, Crown, Scissors, Sparkles, Gift } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import PinModal from "@/components/PinModal";


interface StampCardProps {
  memberName: string;
  stampsCount: number;
  onStampAdded: () => void;
  onLogout?: () => void;
  avatarUrl?: string | null;
}

const MILESTONES: Record<number, { label: string; icon: React.ReactNode; color: string }> = {
  3: { label: "10% Off", icon: <Sparkles className="w-3.5 h-3.5" />, color: "text-primary" },
  6: { label: "20% Off", icon: <Crown className="w-3.5 h-3.5" />, color: "text-primary" },
  9: { label: "30%", icon: <Scissors className="w-3.5 h-3.5" />, color: "text-primary" },
  12: { label: "50%", icon: <Gift className="w-3.5 h-3.5" />, color: "text-primary" },
};

const StampCard = ({ memberName, stampsCount, onStampAdded, avatarUrl }: StampCardProps) => {
  const [showPin, setShowPin] = useState(false);
  const displayStamps = stampsCount % 12;

  const nextMilestone = [3, 6, 9, 12].find((m) => m > displayStamps) ?? 12;
  const stampsToNext = nextMilestone - displayStamps;

  return (
    <div className="min-h-screen flex flex-col px-4 pt-6 pb-32 max-w-md mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Avatar className="w-11 h-11 border-2 border-primary/20">
          <AvatarImage src={avatarUrl || undefined} />
          <AvatarFallback className="font-display bg-primary/10 text-primary text-sm">
            {memberName.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)}
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="text-xs text-muted-foreground">Welcome back,</p>
          <p className="font-display font-semibold text-foreground text-lg leading-tight">
            {memberName}
          </p>
        </div>
      </div>

      {/* Next Reward Banner */}
      <div className="card-luxury next-reward-glow rounded-2xl p-4 mb-6 flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
          {MILESTONES[nextMilestone]?.icon}
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Next Reward</p>
          <p className="font-display font-semibold text-foreground">
            {MILESTONES[nextMilestone]?.label}
          </p>
          <p className="text-xs text-muted-foreground">
            {stampsToNext} stamp{stampsToNext !== 1 ? "s" : ""} away
          </p>
        </div>
      </div>

      {/* Stamp Grid */}
      <div className="card-luxury rounded-2xl p-5 mb-6">
        <h2 className="font-display font-semibold text-foreground text-center mb-4">
          Your Stamp Card
        </h2>
        <div className="grid grid-cols-4 gap-3">
          {Array.from({ length: 12 }, (_, i) => {
            const num = i + 1;
            const isChecked = num <= displayStamps;
            const milestone = MILESTONES[num];

            return (
              <div key={num} className="flex flex-col items-center gap-1">
                <div
                  className={`w-14 h-14 sm:w-16 sm:h-16 rounded-xl flex items-center justify-center transition-all ${
                    isChecked
                      ? "stamp-checked"
                      : milestone
                      ? "stamp-empty stamp-milestone"
                      : "stamp-empty"
                  }`}
                >
                  {isChecked ? (
                    <Check className="w-6 h-6 text-primary-foreground" />
                  ) : milestone ? (
                    <span className="text-primary">{milestone.icon}</span>
                  ) : (
                    <span className="text-muted-foreground/50 font-body text-sm">{num}</span>
                  )}
                </div>
                {milestone && (
                  <span
                    className={`text-[9px] font-semibold leading-tight text-center ${
                      isChecked ? "text-primary" : "text-muted-foreground"
                    }`}
                  >
                    {milestone.label}
                  </span>
                )}
              </div>
            );
          })}
        </div>

        <p className="text-center text-xs text-muted-foreground mt-4">
          Total visits: {stampsCount}
        </p>
      </div>

      {/* Rewards Legend */}
      <div className="card-luxury rounded-2xl p-4 mb-6">
        <h3 className="font-display font-semibold text-sm text-foreground mb-3">Reward Milestones</h3>
        <div className="space-y-2.5">
          {Object.entries(MILESTONES).map(([stamp, info]) => (
            <div key={stamp} className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                {info.icon}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">{info.label}</p>
                <p className="text-[11px] text-muted-foreground">
                  At {stamp}
                  {stamp === "3" ? "rd" : stamp === "12" ? "th" : "th"} stamp
                </p>
              </div>
              {Number(stamp) <= displayStamps && (
                <span className="text-[10px] font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                  Claimed
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Add Stamp Button */}
      <Button
        onClick={() => setShowPin(true)}
        className="w-full py-6 text-base font-semibold rounded-xl mt-auto mb-10"
      >
        Add Stamp
      </Button>

      <PinModal
        open={showPin}
        onClose={() => setShowPin(false)}
        onSuccess={onStampAdded}
      />
    </div>
  );
};

export default StampCard;
