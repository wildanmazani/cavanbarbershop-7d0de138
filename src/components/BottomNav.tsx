import { Home, Heart, Trophy, User } from "lucide-react";

export type TabKey = "home" | "favourites" | "loyalty" | "profile";

interface BottomNavProps {
  active: TabKey;
  onChange: (tab: TabKey) => void;
}

const tabs: { key: TabKey; label: string; icon: React.ReactNode }[] = [
  { key: "home", label: "Home", icon: <Home className="w-5 h-5" /> },
  { key: "favourites", label: "Favourites", icon: <Heart className="w-5 h-5" /> },
  { key: "loyalty", label: "Rewards", icon: <Trophy className="w-5 h-5" /> },
  { key: "profile", label: "Profile", icon: <User className="w-5 h-5" /> },
];

const BottomNav = ({ active, onChange }: BottomNavProps) => (
  <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border">
    <div className="max-w-md mx-auto flex">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          onClick={() => onChange(tab.key)}
          className={`flex-1 flex flex-col items-center gap-0.5 py-2.5 transition-colors ${
            active === tab.key
              ? "text-primary"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {tab.icon}
          <span className="text-[10px] font-medium">{tab.label}</span>
        </button>
      ))}
    </div>
  </nav>
);

export default BottomNav;
