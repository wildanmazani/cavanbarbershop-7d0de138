import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Trophy, Clock, Users, Copy, Gift } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { format } from "date-fns";

interface Member {
  id: string;
  points_balance: number;
  referral_code: string | null;
  stamps_count: number;
}

interface Visit {
  id: string;
  service: string;
  notes: string | null;
  points_earned: number;
  visited_at: string;
}

interface Referral {
  id: string;
  referred_email: string;
  status: string;
  bonus_points: number;
  created_at: string;
}

interface LoyaltyPageProps {
  member: Member;
  onMemberUpdate: (member: Member) => void;
}

const LoyaltyPage = ({ member, onMemberUpdate }: LoyaltyPageProps) => {
  const { user } = useAuth();
  const [visits, setVisits] = useState<Visit[]>([]);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [referEmail, setReferEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"points" | "history" | "referrals">("points");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const [visitsRes, referralsRes] = await Promise.all([
      supabase
        .from("visits")
        .select("*")
        .eq("member_id", member.id)
        .order("visited_at", { ascending: false }),
      supabase
        .from("referrals")
        .select("*")
        .order("created_at", { ascending: false }),
    ]);

    if (visitsRes.data) setVisits(visitsRes.data);
    if (referralsRes.data) setReferrals(referralsRes.data);
    setLoading(false);
  };

  const handleCopyCode = () => {
    if (member.referral_code) {
      navigator.clipboard.writeText(member.referral_code);
      toast.success("Referral code copied!");
    }
  };

  const handleSendReferral = async () => {
    if (!referEmail.trim() || !user) {
      toast.error("Enter an email address");
      return;
    }

    const { error } = await supabase.from("referrals").insert({
      referrer_id: user.id,
      referred_email: referEmail.trim(),
    });

    if (error) {
      toast.error("Failed to send referral");
    } else {
      toast.success("Referral sent!");
      setReferEmail("");
      fetchData();
    }
  };

  const pointsTiers = [
    { points: 100, reward: "Free Hair Wash", icon: <Gift className="w-4 h-4" /> },
    { points: 250, reward: "20% Off Any Service", icon: <Trophy className="w-4 h-4" /> },
    { points: 500, reward: "Free Haircut", icon: <Trophy className="w-4 h-4" /> },
    { points: 1000, reward: "VIP Package", icon: <Trophy className="w-4 h-4" /> },
  ];

  const nextTier = pointsTiers.find((t) => t.points > member.points_balance) || pointsTiers[pointsTiers.length - 1];
  const progress = Math.min((member.points_balance / nextTier.points) * 100, 100);

  return (
    <div className="px-4 py-6 max-w-md mx-auto pb-24">
      <h1 className="font-display font-bold text-xl text-foreground mb-1">Loyalty Rewards</h1>
      <p className="text-sm text-muted-foreground mb-6">Earn points & unlock perks</p>

      {/* Points Overview */}
      <div className="card-luxury rounded-2xl p-5 mb-6 text-center">
        <p className="text-4xl font-display font-bold text-primary">{member.points_balance}</p>
        <p className="text-sm text-muted-foreground mt-1">Total Points</p>
        <div className="mt-4">
          <div className="flex justify-between text-xs text-muted-foreground mb-1">
            <span>{member.points_balance} pts</span>
            <span>{nextTier.points} pts</span>
          </div>
          <div className="h-2 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            {nextTier.points - member.points_balance} points to <span className="text-primary font-semibold">{nextTier.reward}</span>
          </p>
        </div>
      </div>

      {/* Sub-tabs */}
      <div className="flex gap-1 mb-4 bg-muted rounded-xl p-1">
        {(["points", "history", "referrals"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-2 rounded-lg text-xs font-medium transition-colors ${
              tab === t ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"
            }`}
          >
            {t === "points" ? "Rewards" : t === "history" ? "History" : "Referrals"}
          </button>
        ))}
      </div>

      {tab === "points" && (
        <div className="card-luxury rounded-2xl p-4 space-y-3">
          <h3 className="font-display font-semibold text-sm text-foreground mb-2">Points Rewards</h3>
          {pointsTiers.map((tier) => (
            <div key={tier.points} className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 text-primary">
                {tier.icon}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">{tier.reward}</p>
                <p className="text-[11px] text-muted-foreground">{tier.points} points</p>
              </div>
              {member.points_balance >= tier.points && (
                <span className="text-[10px] font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                  Available
                </span>
              )}
            </div>
          ))}
          <p className="text-[11px] text-muted-foreground pt-2">
            Earn 10 pts per visit • 25 pts per referral
          </p>
        </div>
      )}

      {tab === "history" && (
        <div className="card-luxury rounded-2xl p-4">
          <h3 className="font-display font-semibold text-sm text-foreground mb-3">Visit History</h3>
          {visits.length === 0 ? (
            <div className="text-center py-6">
              <Clock className="w-10 h-10 text-muted-foreground/30 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No visits recorded yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {visits.map((visit) => (
                <div key={visit.id} className="flex items-center gap-3 py-2 border-b border-border last:border-0">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <Clock className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">{visit.service}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {format(new Date(visit.visited_at), "MMM d, yyyy")}
                    </p>
                  </div>
                  <span className="text-xs font-semibold text-primary">+{visit.points_earned} pts</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === "referrals" && (
        <div className="space-y-4">
          {/* Referral Code */}
          <div className="card-luxury rounded-2xl p-4">
            <h3 className="font-display font-semibold text-sm text-foreground mb-2">Your Referral Code</h3>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-background rounded-lg px-3 py-2 text-center">
                <span className="font-display font-bold text-lg text-primary tracking-widest">
                  {member.referral_code}
                </span>
              </div>
              <Button size="sm" variant="outline" onClick={handleCopyCode} className="gap-1">
                <Copy className="w-3.5 h-3.5" /> Copy
              </Button>
            </div>
            <p className="text-[11px] text-muted-foreground mt-2">
              Share your code — you both earn 50 points!
            </p>
          </div>

          {/* Invite by Email */}
          <div className="card-luxury rounded-2xl p-4">
            <h3 className="font-display font-semibold text-sm text-foreground mb-2">Invite a Friend</h3>
            <div className="flex gap-2">
              <Input
                placeholder="friend@email.com"
                value={referEmail}
                onChange={(e) => setReferEmail(e.target.value)}
                className="bg-background"
              />
              <Button onClick={handleSendReferral} size="sm">
                Send
              </Button>
            </div>
          </div>

          {/* Referral History */}
          {referrals.length > 0 && (
            <div className="card-luxury rounded-2xl p-4">
              <h3 className="font-display font-semibold text-sm text-foreground mb-3">Referral History</h3>
              <div className="space-y-2">
                {referrals.map((ref) => (
                  <div key={ref.id} className="flex items-center gap-3 py-2 border-b border-border last:border-0">
                    <Users className="w-4 h-4 text-primary shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm text-foreground">{ref.referred_email}</p>
                      <p className="text-[11px] text-muted-foreground capitalize">{ref.status}</p>
                    </div>
                    <span className="text-xs font-semibold text-primary">+{ref.bonus_points} pts</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default LoyaltyPage;
