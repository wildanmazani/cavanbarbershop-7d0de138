import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";

interface Favourite {
  id: string;
  image_url: string;
  title: string | null;
  notes: string | null;
  created_at: string;
}

const FavouritesPage = () => {
  const { user } = useAuth();
  const [favourites, setFavourites] = useState<Favourite[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [title, setTitle] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchFavourites();
  }, []);

  const fetchFavourites = async () => {
    const { data, error } = await supabase
      .from("favourite_haircuts")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
    } else {
      setFavourites(data || []);
    }
    setLoading(false);
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `${user.id}/${Date.now()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("haircuts")
      .upload(path, file);

    if (uploadError) {
      toast.error("Failed to upload image");
      setUploading(false);
      return;
    }

    const { data: { publicUrl } } = supabase.storage.from("haircuts").getPublicUrl(path);

    const { data, error } = await supabase
      .from("favourite_haircuts")
      .insert({
        user_id: user.id,
        image_url: publicUrl,
        title: title.trim() || null,
      })
      .select()
      .single();

    if (error) {
      toast.error("Failed to save favourite");
    } else {
      setFavourites([data, ...favourites]);
      setTitle("");
      toast.success("Haircut saved to favourites! ✂️");
    }
    setUploading(false);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase
      .from("favourite_haircuts")
      .delete()
      .eq("id", id);

    if (error) {
      toast.error("Failed to remove");
    } else {
      setFavourites(favourites.filter((f) => f.id !== id));
      toast.success("Removed from favourites");
    }
  };

  return (
    <div className="px-4 py-6 max-w-md mx-auto pb-24">
      <h1 className="font-display font-bold text-xl text-foreground mb-1">My Favourite Cuts</h1>
      <p className="text-sm text-muted-foreground mb-6">Save haircut styles you love</p>

      {/* Upload Section */}
      <div className="card-luxury rounded-2xl p-4 mb-6">
        <Input
          placeholder="Style name (optional)"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="bg-background mb-3"
        />
        <Button
          onClick={() => fileRef.current?.click()}
          className="w-full gap-2"
          disabled={uploading}
        >
          <Plus className="w-4 h-4" />
          {uploading ? "Uploading..." : "Add Photo"}
        </Button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleUpload}
        />
      </div>

      {/* Gallery */}
      {loading ? (
        <div className="text-center text-muted-foreground py-8">Loading...</div>
      ) : favourites.length === 0 ? (
        <div className="text-center py-12">
          <ImageIcon className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground text-sm">No favourites yet</p>
          <p className="text-muted-foreground text-xs mt-1">Upload photos of haircuts you like</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {favourites.map((fav) => (
            <div key={fav.id} className="card-luxury rounded-xl overflow-hidden group relative">
              <img
                src={fav.image_url}
                alt={fav.title || "Haircut"}
                className="w-full aspect-square object-cover"
              />
              {fav.title && (
                <div className="p-2">
                  <p className="text-xs font-medium text-foreground truncate">{fav.title}</p>
                </div>
              )}
              <button
                onClick={() => handleDelete(fav.id)}
                className="absolute top-2 right-2 w-7 h-7 rounded-full bg-destructive/80 text-destructive-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FavouritesPage;
