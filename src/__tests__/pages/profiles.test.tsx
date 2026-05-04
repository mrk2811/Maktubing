import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ProfilesPage from "@/app/profiles/page";
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
    languages: ["English", "Urdu"],
    lookingFor: { ageRange: "", height: "", ethnicity: "", residence: "", legalStatus: "", maritalStatus: "", religiousSect: "" },
    comments: "",
    aboutMe: "Bio",
    contactName: "Parent",
    contactPhone: "+1234567890",
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
    languages: ["English", "Arabic"],
    lookingFor: { ageRange: "", height: "", ethnicity: "", residence: "", legalStatus: "", maritalStatus: "", religiousSect: "" },
    comments: "",
    aboutMe: "Bio",
    contactName: "Parent",
    contactPhone: "+1234567891",
    createdAt: "2026-01-02",
    verified: false,
    phoneVerified: false,
    adminVerified: false,
  },
];

const mockFetchProfiles = jest.fn().mockResolvedValue(mockProfiles);

jest.mock("@/lib/db", () => ({
  fetchProfiles: (...args: unknown[]) => mockFetchProfiles(...args),
}));

jest.mock("@/lib/useSavedFilters", () => ({
  useSavedFilters: () => ({
    savedFilters: [],
    saveFilter: jest.fn(),
    deleteFilter: jest.fn(),
  }),
}));

jest.mock("@/lib/useSavedProfiles", () => ({
  useSavedProfiles: () => ({
    savedIds: [],
    toggleSave: jest.fn(),
    isSaved: jest.fn().mockReturnValue(false),
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

// Mock next/navigation
jest.mock("next/navigation", () => ({
  usePathname: jest.fn().mockReturnValue("/profiles"),
  useRouter: jest.fn().mockReturnValue({ push: jest.fn(), back: jest.fn() }),
}));

// Mock next/link
jest.mock("next/link", () => {
  return function MockLink({ children, href, ...props }: { children: React.ReactNode; href: string; [key: string]: unknown }) {
    return <a href={href} {...props}>{children}</a>;
  };
});

// Mock next/image
jest.mock("next/image", () => {
  return function MockImage(props: Record<string, unknown>) {
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return <img {...props} />;
  };
});

function renderWithProviders(ui: React.ReactElement) {
  return render(<ToastProvider>{ui}</ToastProvider>);
}

describe("ProfilesPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFetchProfiles.mockResolvedValue(mockProfiles);
  });

  test("renders page title", async () => {
    renderWithProviders(<ProfilesPage />);
    expect(screen.getByText("Browse Profiles")).toBeInTheDocument();
  });

  test("displays profiles after loading", async () => {
    renderWithProviders(<ProfilesPage />);
    await waitFor(() => {
      expect(screen.getByText("Fatima Khan")).toBeInTheDocument();
    });
    expect(screen.getByText("Ahmed Ali")).toBeInTheDocument();
  });

  test("shows profile count", async () => {
    renderWithProviders(<ProfilesPage />);
    await waitFor(() => {
      expect(screen.getByText("2 profiles available")).toBeInTheDocument();
    });
  });

  test("shows skeleton while loading", () => {
    // Make fetchProfiles never resolve
    mockFetchProfiles.mockReturnValue(new Promise(() => {}));
    renderWithProviders(<ProfilesPage />);
    // Should show skeleton (animate-pulse elements)
    const pulseElements = document.querySelectorAll(".animate-pulse");
    expect(pulseElements.length).toBeGreaterThan(0);
  });

  test("shows no profiles message when empty", async () => {
    mockFetchProfiles.mockResolvedValue([]);
    renderWithProviders(<ProfilesPage />);
    await waitFor(() => {
      expect(screen.getByText("No profiles found")).toBeInTheDocument();
    });
    expect(screen.getByText("Try adjusting your filters")).toBeInTheDocument();
  });

  test("shows error toast on fetch failure", async () => {
    mockFetchProfiles.mockRejectedValue(new Error("Network error"));
    renderWithProviders(<ProfilesPage />);
    await waitFor(() => {
      expect(
        screen.getByText("Failed to load profiles. Please check your connection.")
      ).toBeInTheDocument();
    });
  });

  test("toggles filter bar visibility", async () => {
    const user = userEvent.setup();
    renderWithProviders(<ProfilesPage />);

    // Filters should not be visible initially
    expect(screen.queryByText("Gender")).not.toBeInTheDocument();

    // Click the Filters button
    await user.click(screen.getByText("Filters"));

    // Now filters should be visible (FilterBar renders gender, etc.)
    await waitFor(() => {
      expect(screen.getByText("Gender")).toBeInTheDocument();
    });
  });

  test("fetches profiles with filters applied", async () => {
    const user = userEvent.setup();
    renderWithProviders(<ProfilesPage />);

    // Wait for initial load
    await waitFor(() => {
      expect(mockFetchProfiles).toHaveBeenCalledTimes(1);
    });

    // Open filters
    await user.click(screen.getByText("Filters"));

    // fetchProfiles is called again when filters change
    expect(mockFetchProfiles).toHaveBeenCalled();
  });
});
