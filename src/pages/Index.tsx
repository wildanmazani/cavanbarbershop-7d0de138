import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import OnboardingForm from "@/components/OnboardingForm";
import StampCard from "@/components/StampCard";
import { toast } from "sonner";

interface Member {
  id: string;
  phone_number: string;
  full_name: string;
  email: string | null;
  college_location: string;
  hair_concerns: string | null;
  stamps_count: number;
}

const Index = () => {
  const [member, setMember] = useState<Member | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if a member session exists in localStorage (just the phone for lookup)
    const phone = localStorage.getItem("cavan_phone");
    if (phone) {
      fetchMember(phone);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchMember = async (phone: string) => {
    const { data, error } = await supabase
      .from("members")
      .select("*")
      .eq("phone_number", phone)
      .maybeSingle();

    if (error) {
      toast.error("Failed to load your card");
      console.error(error);
    } else if (data) {
      setMember(data);
    } else {
      localStorage.removeItem("cavan_phone");
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
    const { data: inserted, error } = await supabase
      .from("members")
      .insert({
        phone_number: data.phone_number,
        full_name: data.full_name,
        email: data.email || null,
        college_location: data.college_location,
        hair_concerns: data.hair_concerns || null,
      })
      .select()
      .single();

    if (error) {
      if (error.code === "23505") {
        // Duplicate phone — fetch existing member
        await fetchMember(data.phone_number);
        localStorage.setItem("cavan_phone", data.phone_number);
        toast.info("Welcome back! Your card has been loaded.");
      } else {
        toast.error("Registration failed. Please try again.");
        console.error(error);
      }
      return;
    }

    localStorage.setItem("cavan_phone", data.phone_number);
    setMember(inserted);
    toast.success("Welcome to Cavan! 🎉");
  };

  const handleStampAdded = async () => {
    if (!member) return;

    const newCount = member.stamps_count + 1;
    const { error } = await supabase
      .from("members")
      .update({ stamps_count: newCount })
      .eq("id", member.id);

    if (error) {
      toast.error("Failed to add stamp");
      console.error(error);
      return;
    }

    setMember({ ...member, stamps_count: newCount });
  };

  const handleLogout = () => {
    localStorage.removeItem("cavan_phone");
    setMember(null);
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
    <StampCard
      memberName={member.full_name}
      stampsCount={member.stamps_count}
      onStampAdded={handleStampAdded}
      onLogout={handleLogout}
    />
  );
};

export default Index;
