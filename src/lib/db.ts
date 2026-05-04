import { supabase } from "@/lib/supabase";
import { Profile, FilterOptions } from "@/lib/types";
import { getUserId } from "@/lib/auth";

export { getUserId };

/** @deprecated Use getUserId() from auth.ts instead */
export function getDeviceId(): string {
  return getUserId();
}

interface DbProfile {
  id: string;
  name: string;
  gender: "Male" | "Female";
  age: number;
  height: string;
  residence: string;
  relocate: string;
  education: string;
  profession: string;
  legal_status: string;
  marital_status: string;
  children: string;
  ethnicity: string;
  religious_sect: string;
  languages: string[];
  looking_for: {
    ageRange: string;
    height: string;
    ethnicity: string;
    residence: string;
    legalStatus: string;
    maritalStatus: string;
    religiousSect: string;
  };
  comments: string;
  about_me: string;
  contact_name: string;
  contact_phone: string;
  phone_verified: boolean;
  admin_verified: boolean;
  image_url: string | null;
  created_at: string;
}

function toProfile(row: DbProfile): Profile {
  return {
    id: row.id,
    name: row.name,
    gender: row.gender,
    age: row.age,
    height: row.height,
    residence: row.residence,
    relocate: row.relocate,
    education: row.education,
    profession: row.profession,
    legalStatus: row.legal_status,
    maritalStatus: row.marital_status,
    children: row.children,
    ethnicity: row.ethnicity,
    religiousSect: row.religious_sect,
    languages: row.languages || [],
    lookingFor: row.looking_for || {
      ageRange: "",
      height: "",
      ethnicity: "",
      residence: "",
      legalStatus: "",
      maritalStatus: "",
      religiousSect: "",
    },
    comments: row.comments,
    aboutMe: row.about_me,
    contactName: row.contact_name,
    contactPhone: row.contact_phone,
    imageUrl: row.image_url || undefined,
    createdAt: row.created_at,
    verified: row.phone_verified && row.admin_verified,
    phoneVerified: row.phone_verified,
    adminVerified: row.admin_verified,
  };
}

function toDbProfile(profile: Profile): Omit<DbProfile, "created_at"> & { created_at?: string } {
  return {
    id: profile.id,
    name: profile.name,
    gender: profile.gender,
    age: profile.age,
    height: profile.height,
    residence: profile.residence,
    relocate: profile.relocate,
    education: profile.education,
    profession: profile.profession,
    legal_status: profile.legalStatus,
    marital_status: profile.maritalStatus,
    children: profile.children,
    ethnicity: profile.ethnicity,
    religious_sect: profile.religiousSect,
    languages: profile.languages,
    looking_for: profile.lookingFor,
    comments: profile.comments,
    about_me: profile.aboutMe,
    contact_name: profile.contactName,
    contact_phone: profile.contactPhone,
    phone_verified: profile.phoneVerified,
    admin_verified: profile.adminVerified,
    image_url: profile.imageUrl || null,
  };
}

// ---- PROFILES ----

export async function fetchProfiles(filters?: FilterOptions): Promise<Profile[]> {
  let query = supabase.from("profiles").select("*");

  if (filters) {
    if (filters.gender) query = query.eq("gender", filters.gender);
    if (filters.ageMin) query = query.gte("age", parseInt(filters.ageMin));
    if (filters.ageMax) query = query.lte("age", parseInt(filters.ageMax));
    if (filters.ethnicity) query = query.ilike("ethnicity", `%${filters.ethnicity}%`);
    if (filters.religiousSect) query = query.eq("religious_sect", filters.religiousSect);
    if (filters.maritalStatus) query = query.eq("marital_status", filters.maritalStatus);
    if (filters.legalStatus) query = query.ilike("legal_status", `%${filters.legalStatus}%`);
    if (filters.residence) query = query.ilike("residence", `%${filters.residence}%`);
  }

  query = query.order("created_at", { ascending: false });

  const { data, error } = await query;
  if (error) throw error;
  return (data as DbProfile[]).map(toProfile);
}

export async function fetchProfile(id: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", id)
    .single();
  if (error) return null;
  return toProfile(data as DbProfile);
}

export async function createProfile(profile: Profile): Promise<Profile> {
  const dbProfile = toDbProfile(profile);
  const { data, error } = await supabase
    .from("profiles")
    .insert(dbProfile)
    .select()
    .single();
  if (error) throw error;
  return toProfile(data as DbProfile);
}

export async function updateProfile(profile: Profile): Promise<Profile> {
  const dbProfile = toDbProfile(profile);
  const { data, error } = await supabase
    .from("profiles")
    .update(dbProfile)
    .eq("id", profile.id)
    .select()
    .single();
  if (error) throw error;
  return toProfile(data as DbProfile);
}

// ---- INTERESTS ----

export interface DbInterest {
  id: string;
  from_profile_id: string;
  to_profile_id: string;
  status: "pending" | "accepted" | "declined";
  created_at: string;
}

export async function fetchInterests(): Promise<DbInterest[]> {
  const { data, error } = await supabase
    .from("interests")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data as DbInterest[];
}

export async function sendInterest(fromProfileId: string, toProfileId: string): Promise<void> {
  const { error } = await supabase
    .from("interests")
    .insert({
      from_profile_id: fromProfileId,
      to_profile_id: toProfileId,
      status: "pending",
    });
  if (error && error.code !== "23505") throw error; // ignore duplicate
}

export async function updateInterestStatus(
  fromProfileId: string,
  toProfileId: string,
  status: "accepted" | "declined"
): Promise<void> {
  const { error } = await supabase
    .from("interests")
    .update({ status })
    .eq("from_profile_id", fromProfileId)
    .eq("to_profile_id", toProfileId);
  if (error) throw error;
}

// ---- NOTIFICATIONS ----

export interface DbNotification {
  id: string;
  type: "interest_received" | "interest_accepted" | "interest_declined";
  from_profile_id: string;
  to_profile_id: string;
  read: boolean;
  created_at: string;
}

export async function fetchNotifications(profileId: string): Promise<DbNotification[]> {
  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("to_profile_id", profileId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data as DbNotification[];
}

export async function addNotification(notification: {
  type: DbNotification["type"];
  from_profile_id: string;
  to_profile_id: string;
}): Promise<void> {
  const { error } = await supabase.from("notifications").insert(notification);
  if (error) throw error;
}

export async function markNotificationsRead(profileId: string): Promise<void> {
  const { error } = await supabase
    .from("notifications")
    .update({ read: true })
    .eq("to_profile_id", profileId)
    .eq("read", false);
  if (error) throw error;
}

// ---- REPORTS ----

export async function submitReport(report: {
  profile_id: string;
  reporter_id: string;
  reason: string;
  details: string;
}): Promise<boolean> {
  const { data: existing } = await supabase
    .from("reports")
    .select("id")
    .eq("profile_id", report.profile_id)
    .eq("reporter_id", report.reporter_id)
    .eq("status", "pending")
    .single();

  if (existing) return false;

  const { error } = await supabase.from("reports").insert({
    ...report,
    status: "pending",
  });
  if (error) throw error;
  return true;
}

export async function fetchReports(): Promise<Array<{
  id: string;
  profile_id: string;
  reporter_id: string;
  reason: string;
  details: string;
  status: string;
  created_at: string;
}>> {
  const { data, error } = await supabase
    .from("reports")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

export async function updateReportStatus(reportId: string, status: "dismissed" | "removed"): Promise<void> {
  const { error } = await supabase
    .from("reports")
    .update({ status })
    .eq("id", reportId);
  if (error) throw error;
}

// ---- SAVED PROFILES ----

export async function fetchSavedProfileIds(): Promise<string[]> {
  const userId = getUserId();
  const { data, error } = await supabase
    .from("saved_profiles")
    .select("profile_id")
    .eq("user_id", userId);
  if (error) throw error;
  return (data || []).map((r) => r.profile_id);
}

export async function toggleSavedProfile(profileId: string): Promise<boolean> {
  const userId = getUserId();
  const { data: existing } = await supabase
    .from("saved_profiles")
    .select("id")
    .eq("user_id", userId)
    .eq("profile_id", profileId)
    .single();

  if (existing) {
    await supabase.from("saved_profiles").delete().eq("id", existing.id);
    return false;
  } else {
    await supabase.from("saved_profiles").insert({ user_id: userId, profile_id: profileId });
    return true;
  }
}

// ---- SAVED FILTERS ----

export interface DbSavedFilter {
  id: string;
  user_id: string;
  name: string;
  filters: FilterOptions;
  created_at: string;
}

export async function fetchSavedFilters(): Promise<DbSavedFilter[]> {
  const userId = getUserId();
  const { data, error } = await supabase
    .from("saved_filters")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data as DbSavedFilter[];
}

export async function saveSavedFilter(name: string, filters: FilterOptions): Promise<void> {
  const userId = getUserId();
  const { error } = await supabase.from("saved_filters").insert({
    user_id: userId,
    name,
    filters,
  });
  if (error) throw error;
}

export async function deleteSavedFilter(id: string): Promise<void> {
  const { error } = await supabase.from("saved_filters").delete().eq("id", id);
  if (error) throw error;
}

// ---- ADMIN ----

export async function setAdminVerified(profileId: string, verified: boolean): Promise<void> {
  const { error } = await supabase
    .from("profiles")
    .update({ admin_verified: verified })
    .eq("id", profileId);
  if (error) throw error;
}

// ---- PROFILE IMAGES ----

export async function uploadProfileImage(
  profileId: string,
  file: File
): Promise<string> {
  const ext = file.name.split(".").pop() || "jpg";
  const path = `${profileId}.${ext}`;

  const { error: removeError } = await supabase.storage
    .from("profile-images")
    .remove([path]);
  if (removeError) {
    // ignore remove errors — file may not exist yet
  }

  const { error } = await supabase.storage
    .from("profile-images")
    .upload(path, file, { upsert: true });
  if (error) throw error;

  const { data } = supabase.storage
    .from("profile-images")
    .getPublicUrl(path);

  const imageUrl = data.publicUrl;

  await supabase
    .from("profiles")
    .update({ image_url: imageUrl })
    .eq("id", profileId);

  return imageUrl;
}

export async function deleteProfileImage(profileId: string): Promise<void> {
  const { data: profile } = await supabase
    .from("profiles")
    .select("image_url")
    .eq("id", profileId)
    .single();

  if (profile?.image_url) {
    const url = profile.image_url as string;
    const parts = url.split("/profile-images/");
    if (parts[1]) {
      await supabase.storage.from("profile-images").remove([parts[1]]);
    }
  }

  await supabase
    .from("profiles")
    .update({ image_url: null })
    .eq("id", profileId);
}

