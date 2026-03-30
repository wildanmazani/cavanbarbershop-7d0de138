import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Mail, Phone } from "lucide-react";
import cavanLogo from "@/assets/cavan-logo.png";

type AuthMode = "login" | "register";
type AuthMethod = "email" | "phone";

const Auth = () => {
  const [mode, setMode] = useState<AuthMode>("login");
  const [method, setMethod] = useState<AuthMethod>("email");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleEmailAuth = async () => {
    if (!email.trim() || !password.trim()) {
      toast.error("Please fill in all fields");
      return;
    }
    setLoading(true);
    if (mode === "register") {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) {
        toast.error(error.message);
      } else {
        toast.success("Check your email to verify your account!");
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        toast.error(error.message);
      }
    }
    setLoading(false);
  };

  const handleSendOtp = async () => {
    if (!phone.trim() || phone.trim().length < 10) {
      toast.error("Enter a valid phone number");
      return;
    }
    setLoading(true);
    const formattedPhone = phone.startsWith("+") ? phone : `+60${phone.replace(/^0/, "")}`;
    const { error } = await supabase.auth.signInWithOtp({ phone: formattedPhone });
    if (error) {
      toast.error(error.message);
    } else {
      setOtpSent(true);
      toast.success("OTP sent to your phone!");
    }
    setLoading(false);
  };

  const handleVerifyOtp = async () => {
    if (otp.length < 6) {
      toast.error("Enter the 6-digit code");
      return;
    }
    setLoading(true);
    const formattedPhone = phone.startsWith("+") ? phone : `+60${phone.replace(/^0/, "")}`;
    const { error } = await supabase.auth.verifyOtp({
      phone: formattedPhone,
      token: otp,
      type: "sms",
    });
    if (error) {
      toast.error(error.message);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-6">
          <img src={cavanLogo} alt="Cavan Barbershop" width={140} height={140} />
        </div>

        <h1 className="text-2xl font-display font-bold text-center text-foreground mb-1">
          {mode === "login" ? "Welcome Back" : "Join Cavan"}
        </h1>
        <p className="text-center text-muted-foreground mb-6 text-sm">
          {mode === "login" ? "Sign in to your loyalty account" : "Create your loyalty account"}
        </p>

        {/* Method Toggle */}
        <div className="flex gap-2 mb-6">
          <Button
            variant={method === "email" ? "default" : "outline"}
            className="flex-1 gap-2"
            onClick={() => { setMethod("email"); setOtpSent(false); }}
          >
            <Mail className="w-4 h-4" /> Email
          </Button>
          <Button
            variant={method === "phone" ? "default" : "outline"}
            className="flex-1 gap-2"
            onClick={() => { setMethod("phone"); setOtpSent(false); }}
          >
            <Phone className="w-4 h-4" /> Phone
          </Button>
        </div>

        <div className="card-luxury rounded-2xl p-6">
          {method === "email" ? (
            <div className="space-y-4">
              <div>
                <Label htmlFor="email" className="text-sm font-medium text-foreground">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1.5 bg-background"
                />
              </div>
              <div>
                <Label htmlFor="password" className="text-sm font-medium text-foreground">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1.5 bg-background"
                />
              </div>
              <Button onClick={handleEmailAuth} className="w-full py-5 font-semibold" disabled={loading}>
                {loading ? "Loading..." : mode === "login" ? "Sign In" : "Create Account"}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <Label htmlFor="phone" className="text-sm font-medium text-foreground">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="012-345-6789"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="mt-1.5 bg-background"
                  disabled={otpSent}
                />
              </div>
              {otpSent && (
                <div>
                  <Label htmlFor="otp" className="text-sm font-medium text-foreground">Verification Code</Label>
                  <Input
                    id="otp"
                    type="tel"
                    placeholder="123456"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="mt-1.5 bg-background"
                    maxLength={6}
                  />
                </div>
              )}
              <Button
                onClick={otpSent ? handleVerifyOtp : handleSendOtp}
                className="w-full py-5 font-semibold"
                disabled={loading}
              >
                {loading ? "Loading..." : otpSent ? "Verify Code" : "Send OTP"}
              </Button>
              {otpSent && (
                <button
                  onClick={() => { setOtpSent(false); setOtp(""); }}
                  className="w-full text-sm text-muted-foreground hover:text-foreground"
                >
                  Change number
                </button>
              )}
            </div>
          )}
        </div>

        <p className="text-center text-sm text-muted-foreground mt-4">
          {mode === "login" ? "Don't have an account? " : "Already have an account? "}
          <button
            onClick={() => setMode(mode === "login" ? "register" : "login")}
            className="text-primary font-semibold hover:underline"
          >
            {mode === "login" ? "Sign Up" : "Sign In"}
          </button>
        </p>
      </div>
    </div>
  );
};

export default Auth;
