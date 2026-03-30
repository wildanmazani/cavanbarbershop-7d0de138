import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import cavanLogo from "@/assets/cavan-logo.png";

interface MemberData {
  phone_number: string;
  full_name: string;
  email: string;
  college_location: string;
  hair_concerns: string;
}

interface OnboardingFormProps {
  onComplete: (data: MemberData) => void;
}

const OnboardingForm = ({ onComplete }: OnboardingFormProps) => {
  const [step, setStep] = useState(0);
  const [data, setData] = useState<MemberData>({
    phone_number: "",
    full_name: "",
    email: "",
    college_location: "",
    hair_concerns: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const update = (field: keyof MemberData, value: string) => {
    setData((d) => ({ ...d, [field]: value }));
    setErrors((e) => ({ ...e, [field]: "" }));
  };

  const validateStep = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (step === 0) {
      if (!data.phone_number.trim() || data.phone_number.trim().length < 10)
        newErrors.phone_number = "Enter a valid phone number";
      if (!data.full_name.trim()) newErrors.full_name = "Name is required";
    }
    if (step === 1) {
      if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email))
        newErrors.email = "Enter a valid email";
      if (!data.college_location.trim())
        newErrors.college_location = "Location is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const next = () => {
    if (!validateStep()) return;
    if (step < 2) setStep(step + 1);
    else onComplete(data);
  };

  const steps = ["Personal Info", "Details", "Hair Profile"];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <img src={cavanLogo} alt="Cavan Barbershop" width={140} height={140} />
        </div>

        <h1 className="text-2xl font-display font-bold text-center text-foreground mb-1">
          Welcome to Cavan
        </h1>
        <p className="text-center text-muted-foreground mb-6 text-sm">
          Join our loyalty program & earn rewards
        </p>

        {/* Progress */}
        <div className="flex items-center gap-2 mb-8 px-4">
          {steps.map((s, i) => (
            <div key={s} className="flex-1 flex flex-col items-center gap-1">
              <div
                className={`h-1.5 w-full rounded-full transition-colors ${
                  i <= step ? "bg-primary" : "bg-muted"
                }`}
              />
              <span
                className={`text-[10px] font-medium ${
                  i <= step ? "text-primary" : "text-muted-foreground"
                }`}
              >
                {s}
              </span>
            </div>
          ))}
        </div>

        {/* Card */}
        <div className="card-luxury rounded-2xl p-6">
          {step === 0 && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="full_name" className="text-sm font-medium text-foreground">
                  Full Name
                </Label>
                <Input
                  id="full_name"
                  placeholder="John Doe"
                  value={data.full_name}
                  onChange={(e) => update("full_name", e.target.value)}
                  className="mt-1.5 bg-background"
                />
                {errors.full_name && (
                  <p className="text-destructive text-xs mt-1">{errors.full_name}</p>
                )}
              </div>
              <div>
                <Label htmlFor="phone" className="text-sm font-medium text-foreground">
                  Phone Number
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="012-345-6789"
                  value={data.phone_number}
                  onChange={(e) => update("phone_number", e.target.value)}
                  className="mt-1.5 bg-background"
                />
                {errors.phone_number && (
                  <p className="text-destructive text-xs mt-1">{errors.phone_number}</p>
                )}
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="email" className="text-sm font-medium text-foreground">
                  Email <span className="text-muted-foreground">(optional)</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="john@email.com"
                  value={data.email}
                  onChange={(e) => update("email", e.target.value)}
                  className="mt-1.5 bg-background"
                />
                {errors.email && (
                  <p className="text-destructive text-xs mt-1">{errors.email}</p>
                )}
              </div>
              <div>
                <Label htmlFor="location" className="text-sm font-medium text-foreground">
                  College / Location
                </Label>
                <Input
                  id="location"
                  placeholder="e.g. INTI Penang"
                  value={data.college_location}
                  onChange={(e) => update("college_location", e.target.value)}
                  className="mt-1.5 bg-background"
                />
                {errors.college_location && (
                  <p className="text-destructive text-xs mt-1">{errors.college_location}</p>
                )}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="concerns" className="text-sm font-medium text-foreground">
                  Hair Concerns / Preferences
                </Label>
                <Textarea
                  id="concerns"
                  placeholder="e.g. Dry scalp, thinning hair, preferred style..."
                  value={data.hair_concerns}
                  onChange={(e) => update("hair_concerns", e.target.value)}
                  className="mt-1.5 bg-background min-h-[100px] resize-none"
                />
              </div>
            </div>
          )}

          <div className="flex gap-3 mt-6">
            {step > 0 && (
              <Button
                variant="outline"
                onClick={() => setStep(step - 1)}
                className="flex-1"
              >
                Back
              </Button>
            )}
            <Button onClick={next} className="flex-1">
              {step === 2 ? "Join Now" : "Continue"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingForm;
