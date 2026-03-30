import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import OnboardingForm from "@/components/OnboardingForm";
import StampCard from "@/components/StampCard";
import BottomNav, { TabKey } from "@/components/BottomNav";
import ProfilePage from "@/components/ProfilePage";
import FavouritesPage from "@/components/FavouritesPage";
import LoyaltyPage from "@/components/LoyaltyPage";
import { toast } from "sonner";

interface Member {
  id: string;
  phone_number: string;
  full_name: string;
  email: string | null;
  college_location: string;
  hair_concerns: string | null;
  stamps_count: number;
  avatar_url: string | null;
  points_balance: number;
  referral_code: string | null;
}

const Index = () => {
  const { user } = useAuth();
  const [member, setMember] = useState<Member | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabKey>("home");

  useEffect(() => {
    if (user) {
      fetchMember();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchMember = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from("members")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (error) {
      toast.error("Failed to load your profile");
      console.error(error);
    } else if (data) {
      setMember(data as Member);
    }
    setLoading(false);
  };

  const handleOnboardingComplete = async (data: {
    phone_number: string;
    full_name: string;
    email: string;
    college_location: string;
    hair_concerns: string;
  }) => {
    if (!user) return;

    // First check if a member with this phone already exists (from pre-auth era)
    const { data: existing } = await supabase
      .from("members")
      .select("*")
      .eq("phone_number", data.phone_number)
      .maybeSingle();

    if (existing) {
      // Claim the existing record by setting user_id
      const { data: updated, error } = await supabase
        .from("members")
        .update({
          user_id: user.id,
          full_name: data.full_name,
          email: data.email || null,
          college_location: data.college_location,
          hair_concerns: data.hair_concerns || null,
        })
        .eq("id", existing.id)
        .select()
        .single();

      if (error) {
        toast.error("Failed to link your account. Please try again.");
        console.error(error);
        return;
      }
      setMember(updated as Member);
      toast.info("Welcome back! Your card has been loaded. 🎉");
      return;
    }

    const { data: inserted, error } = await supabase
      .from("members")
      .insert({
        user_id: user.id,
        phone_number: data.phone_number,
        full_name: data.full_name,
        email: data.email || null,
        college_location: data.college_location,
        hair_concerns: data.hair_concerns || null,
      })
      .select()
      .single();

    if (error) {
      toast.error("Registration failed. Please try again.");
      console.error(error);
      return;
    }

    setMember(inserted as Member);
    toast.success("Welcome to Cavan! 🎉");
  };

  const handleStampAdded = async () => {
    if (!member || !user) return;

    const newStamps = member.stamps_count + 1;
    const newPoints = member.points_balance + 10;

    const { error } = await supabase
      .from("members")
      .update({ stamps_count: newStamps, points_balance: newPoints })
      .eq("id", member.id);

    if (error) {
      toast.error("Failed to add stamp");
      console.error(error);
      return;
    }

    // Also record the visit
    await supabase.from("visits").insert({
      member_id: member.id,
      service: "Haircut",
      points_earned: 10,
    });

    setMember({ ...member, stamps_count: newStamps, points_balance: newPoints });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground font-display">Loading...</div>
      </div>
    );
  }

  if (!member) {
    return <OnboardingForm onComplete={handleOnboardingComplete} />;
  }

  return (
    <div className="min-h-screen bg-background">
      {activeTab === "home" && (
        <StampCard
          memberName={member.full_name}
          stampsCount={member.stamps_count}
          onStampAdded={handleStampAdded}
          onLogout={() => {}} // Logout moved to profile
          avatarUrl={member.avatar_url}
        />
      )}
      {activeTab === "favourites" && <FavouritesPage />}
      {activeTab === "loyalty" && (
        <LoyaltyPage
          member={member}
          onMemberUpdate={(updated) => setMember({ ...member, ...updated })}
        />
      )}
      {activeTab === "profile" && (
        <ProfilePage
          member={member}
          onUpdate={(updated) => setMember(updated)}
        />
      )}
      <BottomNav active={activeTab} onChange={setActiveTab} />
    </div>
  );
};

export default Index;
