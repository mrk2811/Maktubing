"use client";

import { useState, useEffect, useCallback } from "react";
import { Profile } from "@/lib/types";
import { supabase } from "@/lib/supabase";
import { getDeviceId } from "@/lib/db";

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
  looking_for: Profile["lookingFor"];
  comments: string;
  about_me: string;
  contact_name: string;
  contact_phone: string;
  phone_verified: boolean;
  admin_verified: boolean;
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
    createdAt: row.created_at,
    verified: row.phone_verified && row.admin_verified,
    phoneVerified: row.phone_verified,
    adminVerified: row.admin_verified,
  };
}

export function useUserProfile() {
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    const deviceId = getDeviceId();
    const profileId = `user-${deviceId}`;
    supabase
      .from("profiles")
      .select("*")
      .eq("id", profileId)
      .single()
      .then(({ data }) => {
        if (data) setProfile(toProfile(data as DbProfile));
      });
  }, []);

  const saveProfile = useCallback(async (data: Profile) => {
    const deviceId = getDeviceId();
    const profileId = `user-${deviceId}`;
    const dbData = {
      id: profileId,
      name: data.name,
      gender: data.gender,
      age: data.age,
      height: data.height,
      residence: data.residence,
      relocate: data.relocate,
      education: data.education,
      profession: data.profession,
      legal_status: data.legalStatus,
      marital_status: data.maritalStatus,
      children: data.children,
      ethnicity: data.ethnicity,
      religious_sect: data.religiousSect,
      languages: data.languages,
      looking_for: data.lookingFor,
      comments: data.comments,
      about_me: data.aboutMe,
      contact_name: data.contactName,
      contact_phone: data.contactPhone,
      phone_verified: data.phoneVerified,
      admin_verified: data.adminVerified,
    };
    const { data: result } = await supabase
      .from("profiles")
      .upsert(dbData)
      .select()
      .single();
    if (result) setProfile(toProfile(result as DbProfile));
  }, []);

  const clearProfile = useCallback(async () => {
    const deviceId = getDeviceId();
    const profileId = `user-${deviceId}`;
    await supabase.from("profiles").delete().eq("id", profileId);
    setProfile(null);
  }, []);

  return { profile, saveProfile, clearProfile };
}
