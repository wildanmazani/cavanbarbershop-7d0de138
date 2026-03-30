import { useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Camera, LogOut, Save } from "lucide-react";
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

interface ProfilePageProps {
  member: Member;
  onUpdate: (member: Member) => void;
}

const ProfilePage = ({ member, onUpdate }: ProfilePageProps) => {
  const { signOut } = useAuth();
  const fileRef = useRef<HTMLInputElement>(null);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(member.full_name);
  const [email, setEmail] = useState(member.email || "");
  const [hairConcerns, setHairConcerns] = useState(member.hair_concerns || "");
  const [uploading, setUploading] = useState(false);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `${member.id}/${Date.now()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(path, file, { upsert: true });

    if (uploadError) {
      toast.error("Failed to upload photo");
      setUploading(false);
      return;
    }

    const { data: { publicUrl } } = supabase.storage.from("avatars").getPublicUrl(path);

    const { error } = await supabase
      .from("members")
      .update({ avatar_url: publicUrl })
      .eq("id", member.id);

    if (error) {
      toast.error("Failed to save avatar");
    } else {
      onUpdate({ ...member, avatar_url: publicUrl });
      toast.success("Profile photo updated!");
    }
    setUploading(false);
  };

  const handleSave = async () => {
    const { error } = await supabase
      .from("members")
      .update({
        full_name: name,
        email: email || null,
        hair_concerns: hairConcerns || null,
      })
      .eq("id", member.id);

    if (error) {
      toast.error("Failed to save");
    } else {
      onUpdate({ ...member, full_name: name, email: email || null, hair_concerns: hairConcerns || null });
      setEditing(false);
      toast.success("Profile updated!");
    }
  };

  const initials = member.full_name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="px-4 py-6 max-w-md mx-auto pb-24">
      {/* Avatar */}
      <div className="flex flex-col items-center mb-6">
        <div className="relative">
          <Avatar className="w-24 h-24 border-4 border-primary/20">
            <AvatarImage src={member.avatar_url || undefined} />
            <AvatarFallback className="text-2xl font-display bg-primary/10 text-primary">
              {initials}
            </AvatarFallback>
          </Avatar>
          <button
            onClick={() => fileRef.current?.click()}
            className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg"
            disabled={uploading}
          >
            <Camera className="w-4 h-4" />
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleAvatarUpload}
          />
        </div>
        <h2 className="font-display font-bold text-xl text-foreground mt-3">{member.full_name}</h2>
        <p className="text-sm text-muted-foreground">{member.phone_number}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="card-luxury rounded-xl p-3 text-center">
          <p className="text-xl font-display font-bold text-primary">{member.stamps_count}</p>
          <p className="text-[10px] text-muted-foreground">Total Visits</p>
        </div>
        <div className="card-luxury rounded-xl p-3 text-center">
          <p className="text-xl font-display font-bold text-primary">{member.points_balance}</p>
          <p className="text-[10px] text-muted-foreground">Points</p>
        </div>
        <div className="card-luxury rounded-xl p-3 text-center">
          <p className="text-xs font-display font-bold text-primary">{member.referral_code}</p>
          <p className="text-[10px] text-muted-foreground">Referral Code</p>
        </div>
      </div>

      {/* Details */}
      <div className="card-luxury rounded-2xl p-5 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display font-semibold text-foreground">Profile Details</h3>
          {!editing && (
            <Button variant="ghost" size="sm" onClick={() => setEditing(true)} className="text-primary text-xs">
              Edit
            </Button>
          )}
        </div>

        <div className="space-y-3">
          <div>
            <Label className="text-xs text-muted-foreground">Full Name</Label>
            {editing ? (
              <Input value={name} onChange={(e) => setName(e.target.value)} className="mt-1 bg-background" />
            ) : (
              <p className="text-sm text-foreground">{member.full_name}</p>
            )}
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Email</Label>
            {editing ? (
              <Input value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 bg-background" />
            ) : (
              <p className="text-sm text-foreground">{member.email || "Not set"}</p>
            )}
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Location</Label>
            <p className="text-sm text-foreground">{member.college_location}</p>
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Hair Concerns</Label>
            {editing ? (
              <Input value={hairConcerns} onChange={(e) => setHairConcerns(e.target.value)} className="mt-1 bg-background" />
            ) : (
              <p className="text-sm text-foreground">{member.hair_concerns || "None"}</p>
            )}
          </div>
        </div>

        {editing && (
          <div className="flex gap-2 mt-4">
            <Button variant="outline" className="flex-1" onClick={() => setEditing(false)}>Cancel</Button>
            <Button className="flex-1 gap-2" onClick={handleSave}>
              <Save className="w-4 h-4" /> Save
            </Button>
          </div>
        )}
      </div>

      {/* Logout */}
      <Button variant="outline" className="w-full gap-2 text-destructive border-destructive/30" onClick={signOut}>
        <LogOut className="w-4 h-4" /> Sign Out
      </Button>
    </div>
  );
};

export default ProfilePage;
