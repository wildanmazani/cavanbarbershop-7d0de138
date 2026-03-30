import { useState, useEffect } from "react";
import OnboardingForm from "@/components/OnboardingForm";
import StampCard from "@/components/StampCard";

interface Member {
  phone_number: string;
  full_name: string;
  email: string;
  college_location: string;
  hair_concerns: string;
  stamps_count: number;
}

const Index = () => {
  const [member, setMember] = useState<Member | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("cavan_member");
    if (saved) {
      try {
        setMember(JSON.parse(saved));
      } catch {
        localStorage.removeItem("cavan_member");
      }
    }
  }, []);

  const saveMember = (m: Member) => {
    setMember(m);
    localStorage.setItem("cavan_member", JSON.stringify(m));
  };

  const handleOnboardingComplete = (data: Omit<Member, "stamps_count">) => {
    saveMember({ ...data, stamps_count: 0 });
  };

  const handleStampAdded = () => {
    if (!member) return;
    saveMember({ ...member, stamps_count: member.stamps_count + 1 });
  };

  const handleLogout = () => {
    localStorage.removeItem("cavan_member");
    setMember(null);
  };

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
