import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AuthProvider, useAuth } from "@/shared/auth";

const pushMock = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
}));

function AuthConsumer() {
  const { user, token, login, logout, isLoading } = useAuth();

  return (
    <div>
      <span data-testid="loading">{isLoading ? "loading" : "ready"}</span>
      <span data-testid="email">{user?.email ?? "none"}</span>
      <span data-testid="token">{token ?? "none"}</span>
      <button onClick={() => login("a@b.com", "password123")}>login</button>
      <button onClick={() => logout()}>logout</button>
    </div>
  );
}

describe("AuthProvider", () => {
  beforeEach(() => {
    localStorage.clear();
    pushMock.mockReset();
    global.fetch = jest.fn();
  });

  it("loads stored auth from localStorage on mount", async () => {
    localStorage.setItem("auth_token", "token-1");
    localStorage.setItem("auth_user", JSON.stringify({ id: "u1", email: "test@example.com" }));

    render(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("loading")).toHaveTextContent("ready");
    });

    expect(screen.getByTestId("email")).toHaveTextContent("test@example.com");
    expect(screen.getByTestId("token")).toHaveTextContent("token-1");
  });

  it("login stores token/user and navigates", async () => {
    const user = userEvent.setup();
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({
        token: "token-2",
        user: { id: "u2", email: "user@example.com" },
      }),
    });

    render(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>
    );

    await user.click(screen.getByText("login"));

    await waitFor(() => {
      expect(localStorage.getItem("auth_token")).toBe("token-2");
      expect(localStorage.getItem("auth_user")).toContain("user@example.com");
    });

    expect(pushMock).toHaveBeenCalledWith("/chat");
  });

  it("logout clears storage and navigates", async () => {
    const user = userEvent.setup();
    localStorage.setItem("auth_token", "token-3");
    localStorage.setItem("auth_user", JSON.stringify({ id: "u3", email: "logout@example.com" }));

    render(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>
    );

    await user.click(screen.getByText("logout"));

    expect(localStorage.getItem("auth_token")).toBeNull();
    expect(localStorage.getItem("auth_user")).toBeNull();
    expect(pushMock).toHaveBeenCalledWith("/");
  });
});
