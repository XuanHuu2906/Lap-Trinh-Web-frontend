import { requestApi } from "./api";

type UserRole = "candidate" | "recruiter" | "admin";

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: number;
    email: string;
    role: UserRole;
    profile?: unknown;
  };
}

export async function loginApi(email: string, password: string) {
  const response = await requestApi<LoginResponse>({
    method: "POST",
    url: "/auth/login",
    data: { email, password },
  });

  localStorage.setItem("accessToken", response.data.accessToken);
  localStorage.setItem("refreshToken", response.data.refreshToken);
  localStorage.setItem("currentUser", JSON.stringify(response.data.user));

  return response.data;
}

export function logoutLocal() {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("currentUser");
}
