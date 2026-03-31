import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import OnboardingForm from "@/components/OnboardingForm";
import StampCard from "@/components/StampCard";
import BottomNav, { TabKey } from "@/components/BottomNav";
import ProfilePage from "@/components/ProfilePage";
import FavouritesPage from "@/components/FavouritesPage";
import LoyaltyPage from "@/components/LoyaltyPage";
import PromoFloating from "@/components/PromoFloating";
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

  const handleReferral = async (referralCode: string, newMemberId: string) => {
    if (!referralCode || !user) return;

    // Find the referrer by their referral_code
    const { data: referrer } = await supabase
      .from("members")
      .select("id, user_id, points_balance")
      .eq("referral_code", referralCode)
      .maybeSingle();

    if (!referrer || !referrer.user_id) return;

    // Don't allow self-referral
    if (referrer.user_id === user.id) return;

    // Create the referral record
    await supabase.from("referrals").insert({
      referrer_id: referrer.user_id,
      referred_id: user.id,
      referred_email: user.email || user.phone || "",
      status: "completed",
      bonus_points: 50,
    });

    // Award points to referrer
    await supabase
      .from("members")
      .update({ points_balance: referrer.points_balance + 50 })
      .eq("id", referrer.id);

    // Award points to new member
    await supabase
      .from("members")
      .update({ points_balance: 50 })
      .eq("id", newMemberId);

    toast.success("Referral bonus applied! +50 points 🎉");
  };

  const handleOnboardingComplete = async (data: {
    phone_number: string;
    full_name: string;
    email: string;
    college_location: string;
    hair_concerns: string;
    referral_code_input: string;
  }) => {
    if (!user) return;

    // First check if a member with this phone already exists (from pre-auth era)
    const { data: existing } = await supabase
      .from("members")
      .select("*")
      .eq("phone_number", data.phone_number)
      .maybeSingle();

    if (existing) {
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
      if (data.referral_code_input) {
        await handleReferral(data.referral_code_input, existing.id);
      }
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

    if (data.referral_code_input) {
      await handleReferral(data.referral_code_input, inserted.id);
      // Refresh member to get updated points
      const { data: refreshed } = await supabase
        .from("members")
        .select("*")
        .eq("id", inserted.id)
        .single();
      if (refreshed) setMember(refreshed as Member);
    }

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
          onLogout={() => {}}
          avatarUrl={member.avatar_url}
        />
      )}
      <PromoFloating
        title="🎉 New Member Promo!"
        description="Sign up as a Cavan member and enjoy RM5 OFF any service on your first visit!"
        highlight="RM5 OFF — Any Service"
      />
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
