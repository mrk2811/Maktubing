export const getUserId = jest.fn().mockReturnValue("test-user-id");
export const initAuth = jest.fn().mockResolvedValue("test-user-id");
export const linkFirebaseAuth = jest.fn().mockResolvedValue(undefined);
export const signOut = jest.fn().mockResolvedValue(undefined);
export const onAuthStateChanged = jest.fn().mockReturnValue(jest.fn());
