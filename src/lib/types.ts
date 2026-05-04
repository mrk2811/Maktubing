export interface Profile {
  id: string;
  name: string;
  gender: "Male" | "Female";
  age: number;
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
  languages: string[];
  lookingFor: LookingFor;
  comments: string;
  aboutMe: string;
  contactName: string;
  contactPhone: string;
  imageUrl?: string;
  createdAt: string;
  verified: boolean;
  phoneVerified: boolean;
  adminVerified: boolean;
}

export interface LookingFor {
  ageRange: string;
  height: string;
  ethnicity: string;
  residence: string;
  legalStatus: string;
  maritalStatus: string;
  religiousSect: string;
}

export interface FilterOptions {
  gender: string;
  ageMin: string;
  ageMax: string;
  ethnicity: string;
  religiousSect: string;
  maritalStatus: string;
  legalStatus: string;
  residence: string;
}
