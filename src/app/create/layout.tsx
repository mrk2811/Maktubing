import AuthGate from "@/components/AuthGate";

export default function CreateLayout({ children }: { children: React.ReactNode }) {
  return <AuthGate>{children}</AuthGate>;
}
