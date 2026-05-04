type QueryResponse<T = Record<string, unknown>> = {
  data: T | null;
  error: null | { message: string; code: string };
};

type SingleResponse<T = Record<string, unknown>> = QueryResponse<T>;

interface MockQueryBuilder {
  select: jest.Mock<MockQueryBuilder, [string?]>;
  insert: jest.Mock<MockQueryBuilder, [unknown]>;
  update: jest.Mock<MockQueryBuilder, [unknown]>;
  delete: jest.Mock<MockQueryBuilder, []>;
  upsert: jest.Mock<MockQueryBuilder, [unknown]>;
  eq: jest.Mock<MockQueryBuilder, [string, unknown]>;
  gte: jest.Mock<MockQueryBuilder, [string, unknown]>;
  lte: jest.Mock<MockQueryBuilder, [string, unknown]>;
  ilike: jest.Mock<MockQueryBuilder, [string, string]>;
  order: jest.Mock<MockQueryBuilder, [string, { ascending: boolean }?]>;
  single: jest.Mock<Promise<SingleResponse>, []>;
  then: jest.Mock;
}

function createMockQueryBuilder(resolvedData: unknown = []): MockQueryBuilder {
  const builder: MockQueryBuilder = {
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    upsert: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    gte: jest.fn().mockReturnThis(),
    lte: jest.fn().mockReturnThis(),
    ilike: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    single: jest.fn().mockResolvedValue({ data: resolvedData, error: null }),
    then: jest.fn((cb: (val: QueryResponse) => void) => {
      return Promise.resolve({ data: resolvedData, error: null }).then(cb);
    }),
  } as unknown as MockQueryBuilder;

  // Make chainable methods return the builder
  builder.select.mockReturnValue(builder);
  builder.insert.mockReturnValue(builder);
  builder.update.mockReturnValue(builder);
  builder.delete.mockReturnValue(builder);
  builder.upsert.mockReturnValue(builder);
  builder.eq.mockReturnValue(builder);
  builder.gte.mockReturnValue(builder);
  builder.lte.mockReturnValue(builder);
  builder.ilike.mockReturnValue(builder);
  builder.order.mockReturnValue(builder);

  return builder;
}

const mockFrom = jest.fn((_table: string) => createMockQueryBuilder());

export const supabase = {
  from: mockFrom,
  auth: {
    getSession: jest.fn().mockResolvedValue({ data: { session: null } }),
    signInAnonymously: jest.fn().mockResolvedValue({
      data: { user: { id: "test-user-id" } },
      error: null,
    }),
    updateUser: jest.fn().mockResolvedValue({ data: {}, error: null }),
    signOut: jest.fn().mockResolvedValue({ error: null }),
    onAuthStateChange: jest.fn().mockReturnValue({
      data: { subscription: { unsubscribe: jest.fn() } },
    }),
  },
  storage: {
    from: jest.fn().mockReturnValue({
      upload: jest.fn().mockResolvedValue({ data: { path: "test.jpg" }, error: null }),
      getPublicUrl: jest.fn().mockReturnValue({ data: { publicUrl: "https://example.com/test.jpg" } }),
    }),
  },
};

export { createMockQueryBuilder, mockFrom };
export type { MockQueryBuilder };
