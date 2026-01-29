import { apiGet, AuthError } from "@/shared/api";
import { getAuthToken } from "@/shared/authStorage";

describe("api helpers", () => {
  beforeEach(() => {
    global.fetch = jest.fn();
  });

  it("returns null when localStorage is unavailable", () => {
    const originalLocalStorage = window.localStorage;
    Object.defineProperty(window, "localStorage", { value: undefined, configurable: true });

    expect(getAuthToken()).toBeNull();

    Object.defineProperty(window, "localStorage", {
      value: originalLocalStorage,
      configurable: true,
    });
  });

  it("throws AuthError on 401", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 401,
      text: async () => "unauthorized",
    });

    await expect(apiGet("/test")).rejects.toBeInstanceOf(AuthError);
  });
});
