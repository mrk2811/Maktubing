"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { useUserProfile } from "@/lib/useUserProfile";
import { Profile } from "@/lib/types";
import { uploadProfileImage } from "@/lib/db";
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

const initialFormData: FormData = {
  name: "",
  gender: "",
  age: "",
  height: "",
  residence: "",
  relocate: "",
  education: "",
  profession: "",
  legalStatus: "",
  maritalStatus: "",
  children: "",
  ethnicity: "",
  religiousSect: "",
  languages: "",
  lookingForAge: "",
  lookingForHeight: "",
  lookingForEthnicity: "",
  lookingForResidence: "",
  lookingForLegalStatus: "",
  lookingForMaritalStatus: "",
  lookingForReligiousSect: "",
  comments: "",
  aboutMe: "",
  contactName: "",
  contactPhone: "",
};

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

export default function CreateProfilePage() {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [submitted, setSubmitted] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const { saveProfile } = useUserProfile();

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const profile: Profile = {
      id: "current-user",
      name: formData.name,
      gender: formData.gender as "Male" | "Female",
      age: parseInt(formData.age) || 0,
      height: formData.height,
      residence: formData.residence,
      relocate: formData.relocate,
      education: formData.education,
      profession: formData.profession,
      legalStatus: formData.legalStatus,
      maritalStatus: formData.maritalStatus,
      children: formData.children,
      ethnicity: formData.ethnicity,
      religiousSect: formData.religiousSect,
      languages: formData.languages.split(",").map((l) => l.trim()).filter(Boolean),
      lookingFor: {
        ageRange: formData.lookingForAge,
        height: formData.lookingForHeight,
        ethnicity: formData.lookingForEthnicity,
        residence: formData.lookingForResidence,
        legalStatus: formData.lookingForLegalStatus,
        maritalStatus: formData.lookingForMaritalStatus,
        religiousSect: formData.lookingForReligiousSect,
      },
      comments: formData.comments,
      aboutMe: formData.aboutMe,
      contactName: formData.contactName,
      contactPhone: formData.contactPhone,
      createdAt: new Date().toISOString(),
      verified: false,
      phoneVerified: false,
      adminVerified: false,
    };
    await saveProfile(profile);
    if (imageFile) {
      const deviceId = (await import("@/lib/db")).getDeviceId();
      const profileId = `user-${deviceId}`;
      const imageUrl = await uploadProfileImage(profileId, imageFile);
      await saveProfile({ ...profile, imageUrl });
    }
    setSubmitted(true);
    setTimeout(() => {
      router.push("/profiles");
    }, 2000);
  };

  if (submitted) {
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
              Profile Live!
            </h2>
            <p className="text-maktub-text-secondary">
              Your profile is now live and visible to others.
              <br />
              Verify your phone to earn a trust badge.
              <br />
              Redirecting to profiles...
            </p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col bg-maktub-darker">
      <Navbar />
      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-maktub-text">
            Post a Profile
          </h1>
          <p className="text-sm text-maktub-text-secondary mt-1">
            Fill in the biodata form below. Fields marked with * are required.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="bg-maktub-panel rounded-2xl border border-maktub-border p-6">
            {/* Profile Photo */}
            <SectionHeader title="Profile Photo" />
            <ImageUpload
              onImageSelected={(file) => setImageFile(file)}
              onImageRemoved={() => setImageFile(null)}
            />

            {/* Personal Information */}
            <SectionHeader title="Personal Information" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InputField
                label="Name / Initials"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="e.g. MSP or Muhammad S."
                required
              />
              <SelectField
                label="Gender"
                name="gender"
                value={formData.gender}
                onChange={handleInputChange}
                required
                options={[
                  { value: "Male", label: "Male" },
                  { value: "Female", label: "Female" },
                ]}
              />
              <InputField
                label="Age"
                name="age"
                value={formData.age}
                onChange={handleInputChange}
                placeholder="e.g. 29"
                required
                type="number"
              />
              <InputField
                label="Height"
                name="height"
                value={formData.height}
                onChange={handleInputChange}
                placeholder="e.g. 5'4"
                required
              />
              <InputField
                label="Residence"
                name="residence"
                value={formData.residence}
                onChange={handleInputChange}
                placeholder="e.g. New York, NY"
                required
              />
              <InputField
                label="Open to Relocate"
                name="relocate"
                value={formData.relocate}
                onChange={handleInputChange}
                placeholder="e.g. Open - prefer Chicago or NY"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 mt-4">
              <InputField
                label="Education"
                name="education"
                value={formData.education}
                onChange={handleInputChange}
                placeholder="e.g. Masters in Supply Chain from UIC"
                required
              />
              <InputField
                label="Profession"
                name="profession"
                value={formData.profession}
                onChange={handleInputChange}
                placeholder="e.g. Logistics Coordinator"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
              <SelectField
                label="Legal Status"
                name="legalStatus"
                value={formData.legalStatus}
                onChange={handleInputChange}
                required
                options={[
                  { value: "US Citizen", label: "US Citizen" },
                  { value: "Green Card holder", label: "Green Card holder" },
                  { value: "Pending green card", label: "Pending green card" },
                  { value: "Work Visa (H1B)", label: "Work Visa (H1B)" },
                  { value: "Student Visa", label: "Student Visa" },
                  { value: "Other", label: "Other" },
                ]}
              />
              <SelectField
                label="Marital Status"
                name="maritalStatus"
                value={formData.maritalStatus}
                onChange={handleInputChange}
                required
                options={[
                  { value: "Single", label: "Single" },
                  { value: "Divorced", label: "Divorced" },
                  { value: "Widowed", label: "Widowed" },
                ]}
              />
              <InputField
                label="Children"
                name="children"
                value={formData.children}
                onChange={handleInputChange}
                placeholder="e.g. None"
              />
              <InputField
                label="Ethnicity"
                name="ethnicity"
                value={formData.ethnicity}
                onChange={handleInputChange}
                placeholder="e.g. Punjabi, Pakistani"
                required
              />
              <SelectField
                label="Religious Sect"
                name="religiousSect"
                value={formData.religiousSect}
                onChange={handleInputChange}
                required
                options={[
                  { value: "Sunni", label: "Sunni" },
                  { value: "Shia", label: "Shia" },
                  { value: "Other", label: "Other" },
                ]}
              />
              <InputField
                label="Languages"
                name="languages"
                value={formData.languages}
                onChange={handleInputChange}
                placeholder="e.g. Urdu, English"
                required
              />
            </div>

            {/* About Me */}
            <SectionHeader title="About Me" />
            <TextArea
              label="Tell us about yourself"
              name="aboutMe"
              value={formData.aboutMe}
              onChange={handleInputChange}
              placeholder="Share a bit about your personality, hobbies, and values..."
              rows={4}
            />

            {/* Looking For */}
            <SectionHeader title="What I'm Looking For" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InputField
                label="Age Range"
                name="lookingForAge"
                value={formData.lookingForAge}
                onChange={handleInputChange}
                placeholder="e.g. Around 29 or 25-30"
              />
              <InputField
                label="Height"
                name="lookingForHeight"
                value={formData.lookingForHeight}
                onChange={handleInputChange}
                placeholder="e.g. Around 5'4"
              />
              <InputField
                label="Ethnicity"
                name="lookingForEthnicity"
                value={formData.lookingForEthnicity}
                onChange={handleInputChange}
                placeholder="e.g. Pakistani / Indian"
              />
              <InputField
                label="Residence"
                name="lookingForResidence"
                value={formData.lookingForResidence}
                onChange={handleInputChange}
                placeholder="e.g. Anywhere or US based"
              />
              <InputField
                label="Legal Status"
                name="lookingForLegalStatus"
                value={formData.lookingForLegalStatus}
                onChange={handleInputChange}
                placeholder="e.g. US Citizen or legal resident"
              />
              <InputField
                label="Marital Status"
                name="lookingForMaritalStatus"
                value={formData.lookingForMaritalStatus}
                onChange={handleInputChange}
                placeholder="e.g. Single / Divorced / Widowed"
              />
              <InputField
                label="Religious Sect"
                name="lookingForReligiousSect"
                value={formData.lookingForReligiousSect}
                onChange={handleInputChange}
                placeholder="e.g. Sunni"
              />
            </div>

            {/* Comments */}
            <SectionHeader title="Comments" />
            <TextArea
              label="What are you looking for in a partner?"
              name="comments"
              value={formData.comments}
              onChange={handleInputChange}
              placeholder="Describe the qualities and values you're looking for in a spouse..."
              rows={4}
            />

            {/* Contact Information */}
            <SectionHeader title="Contact Information" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InputField
                label="Contact Person"
                name="contactName"
                value={formData.contactName}
                onChange={handleInputChange}
                placeholder="e.g. Father, Mother, Cousin Sister"
                required
              />
              <InputField
                label="Phone Number"
                name="contactPhone"
                value={formData.contactPhone}
                onChange={handleInputChange}
                placeholder="e.g. 347-341-0176"
                required
                type="tel"
              />
            </div>

            {/* Submit */}
            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <button
                type="submit"
                className="flex-1 h-14 rounded-full bg-maktub-green text-white text-lg font-semibold transition-colors hover:bg-maktub-green-dark shadow-lg"
              >
                Submit Profile
              </button>
              <button
                type="button"
                onClick={() => setFormData(initialFormData)}
                className="sm:w-40 h-14 rounded-full border border-maktub-border text-maktub-text-secondary font-medium transition-colors hover:border-maktub-text-secondary"
              >
                Clear Form
              </button>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}
