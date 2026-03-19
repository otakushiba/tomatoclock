export interface Profile {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  updated_at: string | null;
}

export type ProfileUpdate = Pick<Profile, "display_name" | "avatar_url" | "bio">;
