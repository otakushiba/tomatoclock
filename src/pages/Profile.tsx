import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Camera, Check, Loader2 } from "lucide-react";
import { useProfile } from "@/hooks/useProfile";
import { useAuth } from "@/contexts/AuthContext";

export default function Profile() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { profile, isLoading, updateProfile, isUpdating } = useProfile();

  const [displayName, setDisplayName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [bio, setBio] = useState("");
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Populate form once profile data loads
  useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name ?? "");
      setAvatarUrl(profile.avatar_url ?? "");
      setBio(profile.bio ?? "");
    }
  }, [profile]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaved(false);

    updateProfile(
      {
        display_name: displayName.trim() || null,
        avatar_url: avatarUrl.trim() || null,
        bio: bio.trim() || null,
      },
      {
        onSuccess: () => {
          setSaved(true);
          setTimeout(() => setSaved(false), 2000);
        },
        onError: (err) => {
          setError(err instanceof Error ? err.message : "Failed to save. Please try again.");
        },
      }
    );
  }

  const avatarSrc = avatarUrl.trim() || null;
  const initials = (displayName || user?.email || "?")[0].toUpperCase();

  return (
    <div
      className="min-h-[100dvh] font-primary text-white flex flex-col"
      style={{ background: "hsl(234 30% 10%)" }}
    >
      {/* Header */}
      <header
        className="glass-sm flex items-center gap-3 px-6 py-3 mx-4 mt-4 md:mx-8"
        style={{ borderRadius: "16px" }}
      >
        <button
          onClick={() => navigate("/")}
          className="p-1.5 rounded-full hover:bg-white/10 transition-colors"
        >
          <ArrowLeft size={20} className="text-white/60" />
        </button>
        <h1 className="text-lg font-extrabold tracking-tight text-white/90">Profile</h1>
      </header>

      {/* Content */}
      <main className="flex-1 flex justify-center px-4 py-8">
        <div className="w-full max-w-md">
          {isLoading ? (
            <div className="flex justify-center pt-20">
              <Loader2 size={32} className="animate-spin text-white/30" />
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
              {/* Avatar */}
              <div className="flex flex-col items-center gap-3">
                <div className="relative">
                  {avatarSrc ? (
                    <img
                      src={avatarSrc}
                      alt="avatar"
                      className="w-24 h-24 rounded-full object-cover"
                      style={{ border: "3px solid hsl(234 30% 30%)" }}
                      onError={(e) => { e.currentTarget.style.display = "none"; }}
                    />
                  ) : (
                    <div
                      className="w-24 h-24 rounded-full flex items-center justify-center text-3xl font-bold"
                      style={{ background: "hsl(234 60% 40%)", border: "3px solid hsl(234 30% 30%)" }}
                    >
                      {initials}
                    </div>
                  )}
                  <div
                    className="absolute bottom-0 right-0 w-7 h-7 rounded-full flex items-center justify-center"
                    style={{ background: "hsl(234 30% 25%)", border: "2px solid hsl(234 30% 15%)" }}
                  >
                    <Camera size={14} className="text-white/60" />
                  </div>
                </div>
                <p className="text-xs text-white/30">{user?.email}</p>
              </div>

              {/* Fields */}
              <div
                className="rounded-2xl p-6 flex flex-col gap-5"
                style={{
                  background: "hsl(234 30% 15% / 0.8)",
                  border: "1px solid hsl(234 30% 30% / 0.4)",
                }}
              >
                {/* Display Name */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-white/50 uppercase tracking-wider">
                    Display Name
                  </label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Your name"
                    maxLength={50}
                    className="w-full rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 outline-none transition-all"
                    style={{
                      background: "hsl(234 30% 10%)",
                      border: "1px solid hsl(234 30% 30% / 0.5)",
                    }}
                    onFocus={(e) => (e.currentTarget.style.borderColor = "hsl(234 60% 60% / 0.8)")}
                    onBlur={(e) => (e.currentTarget.style.borderColor = "hsl(234 30% 30% / 0.5)")}
                  />
                </div>

                {/* Avatar URL */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-white/50 uppercase tracking-wider">
                    Avatar URL
                  </label>
                  <input
                    type="url"
                    value={avatarUrl}
                    onChange={(e) => setAvatarUrl(e.target.value)}
                    placeholder="https://example.com/avatar.jpg"
                    className="w-full rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 outline-none transition-all"
                    style={{
                      background: "hsl(234 30% 10%)",
                      border: "1px solid hsl(234 30% 30% / 0.5)",
                    }}
                    onFocus={(e) => (e.currentTarget.style.borderColor = "hsl(234 60% 60% / 0.8)")}
                    onBlur={(e) => (e.currentTarget.style.borderColor = "hsl(234 30% 30% / 0.5)")}
                  />
                </div>

                {/* Bio */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-white/50 uppercase tracking-wider">
                    Bio
                  </label>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Tell us about yourself…"
                    rows={3}
                    maxLength={200}
                    className="w-full rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 outline-none resize-none transition-all"
                    style={{
                      background: "hsl(234 30% 10%)",
                      border: "1px solid hsl(234 30% 30% / 0.5)",
                    }}
                    onFocus={(e) => (e.currentTarget.style.borderColor = "hsl(234 60% 60% / 0.8)")}
                    onBlur={(e) => (e.currentTarget.style.borderColor = "hsl(234 30% 30% / 0.5)")}
                  />
                  <p className="text-xs text-white/20 text-right">{bio.length}/200</p>
                </div>
              </div>

              {error && (
                <p className="text-sm text-red-400 bg-red-400/10 rounded-lg px-3 py-2">{error}</p>
              )}

              <button
                type="submit"
                disabled={isUpdating}
                className="w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                style={{ background: "hsl(234 60% 55%)", color: "white" }}
                onMouseEnter={(e) => !isUpdating && (e.currentTarget.style.background = "hsl(234 60% 62%)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "hsl(234 60% 55%)")}
              >
                {isUpdating ? (
                  <><Loader2 size={16} className="animate-spin" /> Saving…</>
                ) : saved ? (
                  <><Check size={16} /> Saved!</>
                ) : (
                  "Save Changes"
                )}
              </button>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}
