import AuthGate from "@/components/AuthGate";

export default function EditProfileLayout({ children }: { children: React.ReactNode }) {
  return <AuthGate>{children}</AuthGate>;
}
