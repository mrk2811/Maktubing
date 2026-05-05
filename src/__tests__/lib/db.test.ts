/* eslint-disable @typescript-eslint/no-require-imports */
import { createMockQueryBuilder, supabase } from "../../__mocks__/supabase";

jest.mock("@/lib/supabase", () => require("../../__mocks__/supabase"));
jest.mock("@/lib/auth", () => require("../../__mocks__/auth"));

import {
  fetchProfiles,
  fetchProfile,
  createProfile,
  updateProfile,
  fetchInterests,
  sendInterest,
  updateInterestStatus,
  fetchNotifications,
  addNotification,
  markNotificationsRead,
  submitReport,
  fetchReports,
  updateReportStatus,
  fetchSavedProfileIds,
  toggleSavedProfile,
  fetchSavedFilters,
  saveSavedFilter,
  deleteSavedFilter,
} from "@/lib/db";

const mockProfile = {
  id: "1",
  name: "Test User",
  gender: "Male" as const,
  age: 30,
  height: "5'10\"",
  residence: "New York, NY",
  relocate: "Open to relocation",
  education: "Master's",
  profession: "Engineer",
  legal_status: "US Citizen",
  marital_status: "Never Married",
  children: "None",
  ethnicity: "South Asian",
  religious_sect: "Sunni",
  languages: ["English", "Urdu"],
  looking_for: {
    ageRange: "25-35",
    height: "5'2\"-5'8\"",
    ethnicity: "South Asian",
    residence: "",
    legalStatus: "",
    maritalStatus: "",
    religiousSect: "",
  },
  comments: "",
  about_me: "Test bio",
  contact_name: "Parent",
  contact_phone: "+1234567890",
  phone_verified: true,
  admin_verified: false,
  image_url: null,
  created_at: "2026-01-01T00:00:00Z",
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe("db.ts - Profiles", () => {
  test("fetchProfiles returns mapped profiles", async () => {
    const builder = createMockQueryBuilder([mockProfile]);
    (supabase.from as jest.Mock).mockReturnValue(builder);

    const profiles = await fetchProfiles();
    expect(supabase.from).toHaveBeenCalledWith("profiles");
    expect(profiles).toHaveLength(1);
    expect(profiles[0].name).toBe("Test User");
    expect(profiles[0].legalStatus).toBe("US Citizen");
    expect(profiles[0].maritalStatus).toBe("Never Married");
  });

  test("fetchProfiles applies filters", async () => {
    const builder = createMockQueryBuilder([]);
    (supabase.from as jest.Mock).mockReturnValue(builder);

    await fetchProfiles({
      gender: "Female",
      ageMin: "25",
      ageMax: "35",
      ethnicity: "South Asian",
      religiousSect: "Sunni",
      maritalStatus: "Never Married",
      legalStatus: "US Citizen",
      residence: "New York",
    });

    expect(builder.eq).toHaveBeenCalledWith("gender", "Female");
    expect(builder.gte).toHaveBeenCalledWith("age", 25);
    expect(builder.lte).toHaveBeenCalledWith("age", 35);
    expect(builder.ilike).toHaveBeenCalledWith("ethnicity", "%South Asian%");
    expect(builder.eq).toHaveBeenCalledWith("religious_sect", "Sunni");
    expect(builder.eq).toHaveBeenCalledWith("marital_status", "Never Married");
    expect(builder.ilike).toHaveBeenCalledWith("legal_status", "%US Citizen%");
    expect(builder.ilike).toHaveBeenCalledWith("residence", "%New York%");
  });

  test("fetchProfiles skips empty filters", async () => {
    const builder = createMockQueryBuilder([]);
    (supabase.from as jest.Mock).mockReturnValue(builder);

    await fetchProfiles({
      gender: "",
      ageMin: "",
      ageMax: "",
      ethnicity: "",
      religiousSect: "",
      maritalStatus: "",
      legalStatus: "",
      residence: "",
    });

    expect(builder.eq).not.toHaveBeenCalled();
    expect(builder.gte).not.toHaveBeenCalled();
    expect(builder.lte).not.toHaveBeenCalled();
    expect(builder.ilike).not.toHaveBeenCalled();
  });

  test("fetchProfiles throws on error", async () => {
    const builder = createMockQueryBuilder([]);
    builder.order.mockReturnValue({
      ...builder,
      then: undefined,
      data: null,
      error: { message: "Network error", code: "500" },
    } as unknown as ReturnType<typeof createMockQueryBuilder>);
    (supabase.from as jest.Mock).mockReturnValue(builder);

    await expect(fetchProfiles()).rejects.toBeDefined();
  });

  test("fetchProfile returns a single profile", async () => {
    const builder = createMockQueryBuilder(mockProfile);
    (supabase.from as jest.Mock).mockReturnValue(builder);
    builder.single.mockResolvedValue({ data: mockProfile, error: null });

    const profile = await fetchProfile("1");
    expect(profile).not.toBeNull();
    expect(profile!.id).toBe("1");
    expect(profile!.name).toBe("Test User");
  });

  test("fetchProfile returns null on error", async () => {
    const builder = createMockQueryBuilder(null);
    (supabase.from as jest.Mock).mockReturnValue(builder);
    builder.single.mockResolvedValue({
      data: null,
      error: { message: "Not found", code: "PGRST116" },
    });

    const profile = await fetchProfile("nonexistent");
    expect(profile).toBeNull();
  });

  test("createProfile inserts and returns mapped profile", async () => {
    const builder = createMockQueryBuilder(mockProfile);
    (supabase.from as jest.Mock).mockReturnValue(builder);
    builder.single.mockResolvedValue({ data: mockProfile, error: null });

    const input = {
      id: "1",
      name: "Test User",
      gender: "Male" as const,
      age: 30,
      height: "5'10\"",
      residence: "New York, NY",
      relocate: "Open to relocation",
      education: "Master's",
      profession: "Engineer",
      legalStatus: "US Citizen",
      maritalStatus: "Never Married",
      children: "None",
      ethnicity: "South Asian",
      religiousSect: "Sunni",
      languages: ["English", "Urdu"],
      lookingFor: {
        ageRange: "25-35",
        height: "5'2\"-5'8\"",
        ethnicity: "South Asian",
        residence: "",
        legalStatus: "",
        maritalStatus: "",
        religiousSect: "",
      },
      comments: "",
      aboutMe: "Test bio",
      contactName: "Parent",
      contactPhone: "+1234567890",
      createdAt: "2026-01-01T00:00:00Z",
      verified: false,
      phoneVerified: true,
      adminVerified: false,
    };

    const result = await createProfile(input);
    expect(supabase.from).toHaveBeenCalledWith("profiles");
    expect(builder.insert).toHaveBeenCalled();
    expect(result.name).toBe("Test User");
  });

  test("updateProfile updates and returns mapped profile", async () => {
    const builder = createMockQueryBuilder(mockProfile);
    (supabase.from as jest.Mock).mockReturnValue(builder);
    builder.single.mockResolvedValue({ data: mockProfile, error: null });

    const input = {
      id: "1",
      name: "Test User",
      gender: "Male" as const,
      age: 30,
      height: "5'10\"",
      residence: "New York, NY",
      relocate: "Open to relocation",
      education: "Master's",
      profession: "Engineer",
      legalStatus: "US Citizen",
      maritalStatus: "Never Married",
      children: "None",
      ethnicity: "South Asian",
      religiousSect: "Sunni",
      languages: ["English", "Urdu"],
      lookingFor: {
        ageRange: "25-35",
        height: "",
        ethnicity: "",
        residence: "",
        legalStatus: "",
        maritalStatus: "",
        religiousSect: "",
      },
      comments: "",
      aboutMe: "Test bio",
      contactName: "Parent",
      contactPhone: "+1234567890",
      createdAt: "2026-01-01T00:00:00Z",
      verified: false,
      phoneVerified: true,
      adminVerified: false,
    };

    const result = await updateProfile(input);
    expect(builder.update).toHaveBeenCalled();
    expect(builder.eq).toHaveBeenCalledWith("id", "1");
    expect(result.name).toBe("Test User");
  });
});

describe("db.ts - Interests", () => {
  test("fetchInterests returns interest list", async () => {
    const mockInterests = [
      {
        id: "i1",
        from_profile_id: "user-1",
        to_profile_id: "user-2",
        status: "pending",
        created_at: "2026-01-01T00:00:00Z",
      },
    ];
    const builder = createMockQueryBuilder(mockInterests);
    (supabase.from as jest.Mock).mockReturnValue(builder);

    const result = await fetchInterests();
    expect(supabase.from).toHaveBeenCalledWith("interests");
    expect(result).toHaveLength(1);
    expect(result[0].from_profile_id).toBe("user-1");
  });

  test("sendInterest inserts a pending interest", async () => {
    const builder = createMockQueryBuilder(null);
    (supabase.from as jest.Mock).mockReturnValue(builder);
    // Simulate no error
    builder.insert.mockReturnValue({
      ...builder,
      then: undefined,
      data: null,
      error: null,
    } as unknown as ReturnType<typeof createMockQueryBuilder>);

    await sendInterest("user-1", "user-2");
    expect(supabase.from).toHaveBeenCalledWith("interests");
    expect(builder.insert).toHaveBeenCalledWith({
      from_profile_id: "user-1",
      to_profile_id: "user-2",
      status: "pending",
    });
  });

  test("updateInterestStatus updates the status", async () => {
    const builder = createMockQueryBuilder(null);
    (supabase.from as jest.Mock).mockReturnValue(builder);

    await updateInterestStatus("user-1", "user-2", "accepted");
    expect(builder.update).toHaveBeenCalledWith({ status: "accepted" });
    expect(builder.eq).toHaveBeenCalledWith("from_profile_id", "user-1");
    expect(builder.eq).toHaveBeenCalledWith("to_profile_id", "user-2");
  });
});

describe("db.ts - Notifications", () => {
  test("fetchNotifications queries by profile ID", async () => {
    const mockNotifications = [
      {
        id: "n1",
        type: "interest_received",
        from_profile_id: "user-1",
        to_profile_id: "user-2",
        read: false,
        created_at: "2026-01-01T00:00:00Z",
      },
    ];
    const builder = createMockQueryBuilder(mockNotifications);
    (supabase.from as jest.Mock).mockReturnValue(builder);

    const result = await fetchNotifications("user-2");
    expect(supabase.from).toHaveBeenCalledWith("notifications");
    expect(builder.eq).toHaveBeenCalledWith("to_profile_id", "user-2");
    expect(result).toHaveLength(1);
  });

  test("addNotification inserts a notification", async () => {
    const builder = createMockQueryBuilder(null);
    (supabase.from as jest.Mock).mockReturnValue(builder);

    await addNotification({
      type: "interest_received",
      from_profile_id: "user-1",
      to_profile_id: "user-2",
    });
    expect(supabase.from).toHaveBeenCalledWith("notifications");
    expect(builder.insert).toHaveBeenCalledWith({
      type: "interest_received",
      from_profile_id: "user-1",
      to_profile_id: "user-2",
    });
  });

  test("markNotificationsRead updates unread notifications", async () => {
    const builder = createMockQueryBuilder(null);
    (supabase.from as jest.Mock).mockReturnValue(builder);

    await markNotificationsRead("user-2");
    expect(builder.update).toHaveBeenCalledWith({ read: true });
    expect(builder.eq).toHaveBeenCalledWith("to_profile_id", "user-2");
    expect(builder.eq).toHaveBeenCalledWith("read", false);
  });
});

describe("db.ts - Reports", () => {
  test("submitReport checks for existing report then inserts", async () => {
    // First call: check existing (none found)
    const checkBuilder = createMockQueryBuilder(null);
    checkBuilder.single.mockResolvedValue({ data: null, error: { message: "Not found", code: "PGRST116" } });

    // Second call: insert
    const insertBuilder = createMockQueryBuilder(null);

    (supabase.from as jest.Mock)
      .mockReturnValueOnce(checkBuilder)
      .mockReturnValueOnce(insertBuilder);

    const result = await submitReport({
      profile_id: "p1",
      reporter_id: "r1",
      reason: "spam",
      details: "test",
    });

    expect(result).toBe(true);
    expect(supabase.from).toHaveBeenCalledWith("reports");
  });

  test("submitReport returns false if already reported", async () => {
    const builder = createMockQueryBuilder(null);
    builder.single.mockResolvedValue({ data: { id: "existing" }, error: null });
    (supabase.from as jest.Mock).mockReturnValue(builder);

    const result = await submitReport({
      profile_id: "p1",
      reporter_id: "r1",
      reason: "spam",
      details: "test",
    });
    expect(result).toBe(false);
  });

  test("fetchReports returns all reports", async () => {
    const mockReports = [
      { id: "r1", profile_id: "p1", reporter_id: "u1", reason: "spam", details: "", status: "pending", created_at: "2026-01-01" },
    ];
    const builder = createMockQueryBuilder(mockReports);
    (supabase.from as jest.Mock).mockReturnValue(builder);

    const result = await fetchReports();
    expect(result).toHaveLength(1);
  });

  test("updateReportStatus updates report", async () => {
    const builder = createMockQueryBuilder(null);
    (supabase.from as jest.Mock).mockReturnValue(builder);

    await updateReportStatus("r1", "dismissed");
    expect(builder.update).toHaveBeenCalledWith({ status: "dismissed" });
    expect(builder.eq).toHaveBeenCalledWith("id", "r1");
  });
});

describe("db.ts - Saved Profiles", () => {
  test("fetchSavedProfileIds returns profile IDs", async () => {
    const builder = createMockQueryBuilder([
      { profile_id: "p1" },
      { profile_id: "p2" },
    ]);
    (supabase.from as jest.Mock).mockReturnValue(builder);

    const result = await fetchSavedProfileIds();
    expect(result).toEqual(["p1", "p2"]);
    expect(builder.eq).toHaveBeenCalledWith("user_id", "test-user-id");
  });

  test("toggleSavedProfile removes if exists", async () => {
    const builder = createMockQueryBuilder(null);
    builder.single.mockResolvedValue({ data: { id: "saved-1" }, error: null });
    const deleteBuilder = createMockQueryBuilder(null);

    (supabase.from as jest.Mock)
      .mockReturnValueOnce(builder)
      .mockReturnValueOnce(deleteBuilder);

    const result = await toggleSavedProfile("p1");
    expect(result).toBe(false);
  });

  test("toggleSavedProfile inserts if not exists", async () => {
    const builder = createMockQueryBuilder(null);
    builder.single.mockResolvedValue({ data: null, error: { message: "Not found", code: "PGRST116" } });
    const insertBuilder = createMockQueryBuilder(null);

    (supabase.from as jest.Mock)
      .mockReturnValueOnce(builder)
      .mockReturnValueOnce(insertBuilder);

    const result = await toggleSavedProfile("p1");
    expect(result).toBe(true);
  });
});

describe("db.ts - Saved Filters", () => {
  test("fetchSavedFilters returns filters for user", async () => {
    const mockFilters = [
      { id: "sf1", user_id: "test-user-id", name: "NYC Search", filters: {}, created_at: "2026-01-01" },
    ];
    const builder = createMockQueryBuilder(mockFilters);
    (supabase.from as jest.Mock).mockReturnValue(builder);

    const result = await fetchSavedFilters();
    expect(result).toHaveLength(1);
    expect(builder.eq).toHaveBeenCalledWith("user_id", "test-user-id");
  });

  test("saveSavedFilter inserts a new filter", async () => {
    const builder = createMockQueryBuilder(null);
    (supabase.from as jest.Mock).mockReturnValue(builder);

    const filters = {
      gender: "Female",
      ageMin: "25",
      ageMax: "35",
      ethnicity: "",
      religiousSect: "",
      maritalStatus: "",
      legalStatus: "",
      residence: "",
    };

    await saveSavedFilter("My Search", filters);
    expect(supabase.from).toHaveBeenCalledWith("saved_filters");
    expect(builder.insert).toHaveBeenCalledWith({
      user_id: "test-user-id",
      name: "My Search",
      filters,
    });
  });

  test("deleteSavedFilter deletes by ID", async () => {
    const builder = createMockQueryBuilder(null);
    (supabase.from as jest.Mock).mockReturnValue(builder);

    await deleteSavedFilter("sf1");
    expect(supabase.from).toHaveBeenCalledWith("saved_filters");
    expect(builder.eq).toHaveBeenCalledWith("id", "sf1");
  });
});
