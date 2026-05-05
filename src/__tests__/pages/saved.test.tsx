import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import SavedPage from "@/app/saved/page";
import { ToastProvider } from "@/components/Toast";

const mockProfiles = [
  {
    id: "1",
    name: "Fatima Khan",
    gender: "Female" as const,
    age: 27,
    height: "5'4\"",
    residence: "New York, NY",
    relocate: "Open",
    education: "Master's",
    profession: "Doctor",
    legalStatus: "US Citizen",
    maritalStatus: "Never Married",
    children: "None",
    ethnicity: "Pakistani",
    religiousSect: "Sunni",
    languages: ["English"],
    lookingFor: { ageRange: "", height: "", ethnicity: "", residence: "", legalStatus: "", maritalStatus: "", religiousSect: "" },
    comments: "",
    aboutMe: "",
    contactName: "Parent",
    contactPhone: "+1",
    createdAt: "2026-01-01",
    verified: true,
    phoneVerified: true,
    adminVerified: true,
  },
  {
    id: "2",
    name: "Ahmed Ali",
    gender: "Male" as const,
    age: 32,
    height: "5'10\"",
    residence: "Chicago, IL",
    relocate: "No",
    education: "Bachelor's",
    profession: "Engineer",
    legalStatus: "Green Card",
    maritalStatus: "Divorced",
    children: "1",
    ethnicity: "Arab",
    religiousSect: "Shia",
    languages: ["English"],
    lookingFor: { ageRange: "", height: "", ethnicity: "", residence: "", legalStatus: "", maritalStatus: "", religiousSect: "" },
    comments: "",
    aboutMe: "",
    contactName: "Parent",
    contactPhone: "+2",
    createdAt: "2026-01-02",
    verified: false,
    phoneVerified: false,
    adminVerified: false,
  },
];

const mockFetchProfiles = jest.fn().mockResolvedValue(mockProfiles);
let mockSavedIds: string[] = ["1"];

jest.mock("@/lib/db", () => ({
  fetchProfiles: (...args: unknown[]) => mockFetchProfiles(...args),
}));

jest.mock("@/lib/useSavedProfiles", () => ({
  useSavedProfiles: () => ({
    savedIds: mockSavedIds,
    toggleSave: jest.fn(),
    isSaved: jest.fn((id: string) => mockSavedIds.includes(id)),
  }),
}));

jest.mock("@/lib/useInterests", () => ({
  useInterests: () => ({
    interests: [],
    sendInterest: jest.fn(),
    updateStatus: jest.fn(),
    getInterestStatus: jest.fn().mockReturnValue(null),
    sentInterests: jest.fn().mockReturnValue([]),
    receivedInterests: jest.fn().mockReturnValue([]),
  }),
}));

jest.mock("@/lib/useNotifications", () => ({
  useNotifications: () => ({
    notifications: [],
    unreadCount: 0,
    addNotification: jest.fn(),
    markAllRead: jest.fn(),
    markRead: jest.fn(),
  }),
}));

jest.mock("@/lib/useReports", () => ({
  useReports: () => ({
    reports: [],
    pendingReports: [],
    submitReport: jest.fn(),
    updateReportStatus: jest.fn(),
    hasReported: jest.fn().mockReturnValue(false),
  }),
}));

jest.mock("next/navigation", () => ({
  usePathname: jest.fn().mockReturnValue("/saved"),
  useRouter: jest.fn().mockReturnValue({ push: jest.fn(), back: jest.fn() }),
}));

jest.mock("next/link", () => {
  return function MockLink({ children, href, ...props }: { children: React.ReactNode; href: string; [key: string]: unknown }) {
    return <a href={href} {...props}>{children}</a>;
  };
});

jest.mock("next/image", () => {
  return function MockImage(props: Record<string, unknown>) {
    return <img {...props} />;
  };
});

function renderWithProviders(ui: React.ReactElement) {
  return render(<ToastProvider>{ui}</ToastProvider>);
}

describe("SavedPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFetchProfiles.mockResolvedValue(mockProfiles);
    mockSavedIds = ["1"];
  });

  test("renders page title", async () => {
    renderWithProviders(<SavedPage />);
    expect(screen.getByText("Saved Profiles")).toBeInTheDocument();
  });

  test("displays only saved profiles", async () => {
    renderWithProviders(<SavedPage />);
    await waitFor(() => {
      expect(screen.getByText("Fatima Khan")).toBeInTheDocument();
    });
    expect(screen.queryByText("Ahmed Ali")).not.toBeInTheDocument();
  });

  test("shows saved count", async () => {
    renderWithProviders(<SavedPage />);
    await waitFor(() => {
      expect(screen.getByText("1 profile saved")).toBeInTheDocument();
    });
  });

  test("shows empty state when no saved profiles", async () => {
    mockSavedIds = [];
    renderWithProviders(<SavedPage />);
    await waitFor(() => {
      expect(screen.getByText("No saved profiles yet")).toBeInTheDocument();
    });
    expect(screen.getByText("Browse Profiles")).toBeInTheDocument();
  });

  test("shows error toast on fetch failure", async () => {
    mockFetchProfiles.mockRejectedValue(new Error("Network error"));
    renderWithProviders(<SavedPage />);
    await waitFor(() => {
      expect(
        screen.getByText("Failed to load saved profiles.")
      ).toBeInTheDocument();
    });
  });

  test("shows skeleton while loading", () => {
    mockFetchProfiles.mockReturnValue(new Promise(() => {}));
    renderWithProviders(<SavedPage />);
    const pulseElements = document.querySelectorAll(".animate-pulse");
    expect(pulseElements.length).toBeGreaterThan(0);
  });
});
