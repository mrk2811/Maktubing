"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { useToast } from "@/components/Toast";
import { useUserProfile } from "@/lib/useUserProfile";
import { Profile } from "@/lib/types";
import { uploadProfileImage, deleteProfileImage } from "@/lib/db";
import ImageUpload from "@/components/ImageUpload";

interface FormData {
  name: string;
  gender: string;
  age: string;
  height: string;
  residence: string;
  relocate: string;
  education: string;
  profession: string;
  legalStatus: string;
  maritalStatus: string;
  children: string;
  ethnicity: string;
  religiousSect: string;
  languages: string;
  lookingForAge: string;
  lookingForHeight: string;
  lookingForEthnicity: string;
  lookingForResidence: string;
  lookingForLegalStatus: string;
  lookingForMaritalStatus: string;
  lookingForReligiousSect: string;
  comments: string;
  aboutMe: string;
  contactName: string;
  contactPhone: string;
}

function InputField({
  label,
  name,
  value,
  onChange,
  placeholder,
  required,
  type = "text",
}: {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  required?: boolean;
  type?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={name}
        className="text-sm font-medium text-maktub-text-secondary"
      >
        {label}
        {required && <span className="text-red-400 ml-1">*</span>}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className="bg-maktub-input text-maktub-text rounded-lg px-4 py-3 border border-maktub-border focus:border-maktub-green focus:outline-none placeholder:text-maktub-text-secondary/50 text-sm"
      />
    </div>
  );
}

function SelectField({
  label,
  name,
  value,
  onChange,
  options,
  required,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: { value: string; label: string }[];
  required?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={name}
        className="text-sm font-medium text-maktub-text-secondary"
      >
        {label}
        {required && <span className="text-red-400 ml-1">*</span>}
      </label>
      <select
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        className="bg-maktub-input text-maktub-text rounded-lg px-4 py-3 border border-maktub-border focus:border-maktub-green focus:outline-none text-sm appearance-none cursor-pointer"
      >
        <option value="">Select...</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function TextArea({
  label,
  name,
  value,
  onChange,
  placeholder,
  rows = 3,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  rows?: number;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={name}
        className="text-sm font-medium text-maktub-text-secondary"
      >
        {label}
      </label>
      <textarea
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
        className="bg-maktub-input text-maktub-text rounded-lg px-4 py-3 border border-maktub-border focus:border-maktub-green focus:outline-none placeholder:text-maktub-text-secondary/50 text-sm resize-none"
      />
    </div>
  );
}

function SectionHeader({ title }: { title: string }) {
  return (
    <h3 className="text-xs font-semibold uppercase tracking-wider text-maktub-green mb-4 mt-8 first:mt-0">
      {title}
    </h3>
  );
}

function profileToFormData(profile: Profile): FormData {
  return {
    name: profile.name,
    gender: profile.gender,
    age: String(profile.age),
    height: profile.height,
    residence: profile.residence,
    relocate: profile.relocate,
    education: profile.education,
    profession: profile.profession,
    legalStatus: profile.legalStatus,
    maritalStatus: profile.maritalStatus,
    children: profile.children,
    ethnicity: profile.ethnicity,
    religiousSect: profile.religiousSect,
    languages: profile.languages.join(", "),
    lookingForAge: profile.lookingFor.ageRange,
    lookingForHeight: profile.lookingFor.height,
    lookingForEthnicity: profile.lookingFor.ethnicity,
    lookingForResidence: profile.lookingFor.residence,
    lookingForLegalStatus: profile.lookingFor.legalStatus,
    lookingForMaritalStatus: profile.lookingFor.maritalStatus,
    lookingForReligiousSect: profile.lookingFor.religiousSect,
    comments: profile.comments,
    aboutMe: profile.aboutMe,
    contactName: profile.contactName,
    contactPhone: profile.contactPhone,
  };
}

export default function EditProfilePage() {
  const router = useRouter();
  const { profile, saveProfile } = useUserProfile();
  const [saved, setSaved] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [removeImage, setRemoveImage] = useState(false);
  const { showToast } = useToast();

  const formDataFromProfile = useMemo(
    () => (profile ? profileToFormData(profile) : null),
    [profile]
  );

  const [formData, setFormData] = useState<FormData | null>(null);

  const activeFormData = formData ?? formDataFromProfile;

  if (!profile) {
    return (
      <div className="flex flex-1 flex-col bg-maktub-darker">
        <Navbar />
        <main className="flex-1 flex items-center justify-center px-4">
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-maktub-input flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-maktub-text-secondary"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-maktub-text mb-2">
              No Profile Yet
            </h2>
            <p className="text-maktub-text-secondary mb-4">
              Create a profile first before editing.
            </p>
            <Link
              href="/create"
              className="inline-block bg-maktub-green text-white font-medium px-6 py-3 rounded-lg hover:bg-maktub-green/90 transition-colors"
            >
              Post a Profile
            </Link>
          </div>
        </main>
      </div>
    );
  }

  if (!activeFormData) return null;

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...(activeFormData), [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = activeFormData;
    const updatedProfile: Profile = {
      ...profile,
      name: data.name,
      gender: data.gender as "Male" | "Female",
      age: parseInt(data.age) || 0,
      height: data.height,
      residence: data.residence,
      relocate: data.relocate,
      education: data.education,
      profession: data.profession,
      legalStatus: data.legalStatus,
      maritalStatus: data.maritalStatus,
      children: data.children,
      ethnicity: data.ethnicity,
      religiousSect: data.religiousSect,
      languages: data.languages.split(",").map((l) => l.trim()).filter(Boolean),
      lookingFor: {
        ageRange: data.lookingForAge,
        height: data.lookingForHeight,
        ethnicity: data.lookingForEthnicity,
        residence: data.lookingForResidence,
        legalStatus: data.lookingForLegalStatus,
        maritalStatus: data.lookingForMaritalStatus,
        religiousSect: data.lookingForReligiousSect,
      },
      comments: data.comments,
      aboutMe: data.aboutMe,
      contactName: data.contactName,
      contactPhone: data.contactPhone,
    };
    if (removeImage && profile.imageUrl) {
      await deleteProfileImage(profile.id);
      updatedProfile.imageUrl = undefined;
    }
    try {
      await saveProfile(updatedProfile);
      if (imageFile) {
        const imageUrl = await uploadProfileImage(profile.id, imageFile);
        await saveProfile({ ...updatedProfile, imageUrl });
      }
      setSaved(true);
      setTimeout(() => {
        router.push("/more");
      }, 1500);
    } catch {
      showToast("Failed to save changes. Please try again.");
    }
  };

  if (saved) {
    return (
      <div className="flex flex-1 flex-col bg-maktub-darker">
        <Navbar />
        <main className="flex-1 flex items-center justify-center px-4">
          <div className="text-center">
            <div className="w-20 h-20 rounded-full bg-maktub-green/20 flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-10 h-10 text-maktub-green"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-maktub-text mb-2">
              Profile Updated!
            </h2>
            <p className="text-maktub-text-secondary">
              Your changes have been saved.
            </p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col bg-maktub-darker">
      <Navbar />
      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-6">
        <div className="mb-6">
          <Link
            href="/more"
            className="inline-flex items-center gap-2 text-sm text-maktub-text-secondary hover:text-maktub-text mb-4 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </Link>
          <h1 className="text-2xl font-bold text-maktub-text">Edit Profile</h1>
          <p className="text-sm text-maktub-text-secondary mt-1">
            Update your biodata information
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-maktub-panel rounded-2xl border border-maktub-border p-6"
        >
          <SectionHeader title="Profile Photo" />
          <ImageUpload
            currentImageUrl={profile.imageUrl}
            onImageSelected={(file) => {
              setImageFile(file);
              setRemoveImage(false);
            }}
            onImageRemoved={() => {
              setImageFile(null);
              setRemoveImage(true);
            }}
          />

          <SectionHeader title="Personal Information" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InputField
              label="Full Name"
              name="name"
              value={activeFormData.name}
              onChange={handleInputChange}
              placeholder="e.g. Muhammad Ali"
              required
            />
            <SelectField
              label="Gender"
              name="gender"
              value={activeFormData.gender}
              onChange={handleInputChange}
              options={[
                { value: "Male", label: "Male" },
                { value: "Female", label: "Female" },
              ]}
              required
            />
            <InputField
              label="Age"
              name="age"
              value={activeFormData.age}
              onChange={handleInputChange}
              placeholder="e.g. 28"
              type="number"
              required
            />
            <InputField
              label="Height"
              name="height"
              value={activeFormData.height}
              onChange={handleInputChange}
              placeholder={'e.g. 5\'10"'}
              required
            />
            <InputField
              label="Residence"
              name="residence"
              value={activeFormData.residence}
              onChange={handleInputChange}
              placeholder="e.g. New York, USA"
              required
            />
            <InputField
              label="Open to Relocate"
              name="relocate"
              value={activeFormData.relocate}
              onChange={handleInputChange}
              placeholder="e.g. Yes / No / Depends"
            />
            <InputField
              label="Education"
              name="education"
              value={activeFormData.education}
              onChange={handleInputChange}
              placeholder="e.g. Bachelor's in Computer Science"
              required
            />
            <InputField
              label="Profession"
              name="profession"
              value={activeFormData.profession}
              onChange={handleInputChange}
              placeholder="e.g. Software Engineer"
              required
            />
            <SelectField
              label="Legal Status"
              name="legalStatus"
              value={activeFormData.legalStatus}
              onChange={handleInputChange}
              options={[
                { value: "Citizen", label: "Citizen" },
                { value: "Permanent Resident", label: "Permanent Resident" },
                { value: "Work Visa", label: "Work Visa" },
                { value: "Student Visa", label: "Student Visa" },
                { value: "Other", label: "Other" },
              ]}
              required
            />
            <SelectField
              label="Marital Status"
              name="maritalStatus"
              value={activeFormData.maritalStatus}
              onChange={handleInputChange}
              options={[
                { value: "Never Married", label: "Never Married" },
                { value: "Divorced", label: "Divorced" },
                { value: "Widowed", label: "Widowed" },
              ]}
              required
            />
            <InputField
              label="Children"
              name="children"
              value={activeFormData.children}
              onChange={handleInputChange}
              placeholder="e.g. None / 1 / 2"
            />
            <InputField
              label="Ethnicity"
              name="ethnicity"
              value={activeFormData.ethnicity}
              onChange={handleInputChange}
              placeholder="e.g. Pakistani, Arab, etc."
              required
            />
            <SelectField
              label="Religious Sect"
              name="religiousSect"
              value={activeFormData.religiousSect}
              onChange={handleInputChange}
              options={[
                { value: "Sunni", label: "Sunni" },
                { value: "Shia", label: "Shia" },
                { value: "Other", label: "Other" },
              ]}
              required
            />
            <InputField
              label="Languages"
              name="languages"
              value={activeFormData.languages}
              onChange={handleInputChange}
              placeholder="e.g. English, Urdu, Arabic"
            />
          </div>

          <SectionHeader title="Looking For" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InputField
              label="Age Range"
              name="lookingForAge"
              value={activeFormData.lookingForAge}
              onChange={handleInputChange}
              placeholder="e.g. 24-30"
            />
            <InputField
              label="Height"
              name="lookingForHeight"
              value={activeFormData.lookingForHeight}
              onChange={handleInputChange}
              placeholder={'e.g. 5\'2" - 5\'6"'}
            />
            <InputField
              label="Ethnicity"
              name="lookingForEthnicity"
              value={activeFormData.lookingForEthnicity}
              onChange={handleInputChange}
              placeholder="e.g. Any / Pakistani"
            />
            <InputField
              label="Residence"
              name="lookingForResidence"
              value={activeFormData.lookingForResidence}
              onChange={handleInputChange}
              placeholder="e.g. USA / Canada"
            />
            <InputField
              label="Legal Status"
              name="lookingForLegalStatus"
              value={activeFormData.lookingForLegalStatus}
              onChange={handleInputChange}
              placeholder="e.g. Any / Citizen"
            />
            <InputField
              label="Marital Status"
              name="lookingForMaritalStatus"
              value={activeFormData.lookingForMaritalStatus}
              onChange={handleInputChange}
              placeholder="e.g. Never Married"
            />
            <InputField
              label="Religious Sect"
              name="lookingForReligiousSect"
              value={activeFormData.lookingForReligiousSect}
              onChange={handleInputChange}
              placeholder="e.g. Sunni / Any"
            />
          </div>

          <SectionHeader title="About" />
          <div className="space-y-4">
            <TextArea
              label="About Me"
              name="aboutMe"
              value={activeFormData.aboutMe}
              onChange={handleInputChange}
              placeholder="Tell others about yourself, your interests, values..."
              rows={4}
            />
            <TextArea
              label="Additional Comments"
              name="comments"
              value={activeFormData.comments}
              onChange={handleInputChange}
              placeholder="Any additional requirements or preferences..."
              rows={3}
            />
          </div>

          <SectionHeader title="Contact Information" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InputField
              label="Contact Person"
              name="contactName"
              value={activeFormData.contactName}
              onChange={handleInputChange}
              placeholder="e.g. Father / Mother / Self"
              required
            />
            <InputField
              label="Phone Number"
              name="contactPhone"
              value={activeFormData.contactPhone}
              onChange={handleInputChange}
              placeholder="e.g. +1 347-341-0176"
              required
            />
          </div>

          <div className="mt-8 flex gap-3">
            <button
              type="submit"
              className="flex-1 bg-maktub-green text-white font-medium py-3 rounded-lg hover:bg-maktub-green/90 transition-colors"
            >
              Save Changes
            </button>
            <Link
              href="/more"
              className="px-6 py-3 text-sm font-medium text-maktub-text-secondary hover:text-maktub-text transition-colors border border-maktub-border rounded-lg flex items-center"
            >
              Cancel
            </Link>
          </div>
        </form>
      </main>
    </div>
  );
}
