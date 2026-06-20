import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { get, post } from "../services/api-client";
import type { UserRole } from "../types/user.type";
import type {
  RegisterCandidateRequest,
  RegisterRecruiterRequest,
  LoginResponse,
} from "../types/auth.type";

export interface User {
  id: number;
  email: string;
  fullName: string;
  role: UserRole;
}

interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  login: (email: string, password?: string) => Promise<any>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  loginWithGoogle: (supabaseAccessToken: string) => Promise<any>;
  completeOnboarding: (
    role: "candidate" | "recruiter",
    fullName: string,
    companyName?: string | null,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ) => Promise<any>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  registerCandidate: (data: RegisterCandidateRequest) => Promise<any>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  registerRecruiter: (data: RegisterRecruiterRequest) => Promise<any>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  verifyEmail: (token: string) => Promise<any>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  resendVerification: (email: string) => Promise<any>;
  logout: () => Promise<void>;
  refreshAccessToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType | null>(null);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mapBackendUser = (backendUser: any): User | null => {
  if (!backendUser) return null;

  let fullName = "";
  if (backendUser.fullName) {
    fullName = backendUser.fullName;
  } else if (backendUser.profile) {
    fullName =
      backendUser.profile.fullName ||
      backendUser.profile.companyName ||
      backendUser.profile.contactName ||
      "";
  } else if (backendUser.candidateProfile) {
    fullName = backendUser.candidateProfile.fullName || "";
  } else if (backendUser.recruiterProfile) {
    fullName =
      backendUser.recruiterProfile.companyName ||
      backendUser.recruiterProfile.contactName ||
      "";
  }

  return {
    id: backendUser.id,
    email: backendUser.email,
    fullName: fullName || backendUser.email,
    role: backendUser.role,
  };
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const initializeAuth = async () => {
      const storedAccessToken = localStorage.getItem("accessToken");
      const storedRefreshToken = localStorage.getItem("refreshToken");

      if (!storedAccessToken || !storedRefreshToken) {
        setIsLoading(false);
        return;
      }

      try {
        setAccessToken(storedAccessToken);
        setRefreshToken(storedRefreshToken);

        // Gọi /auth/me với skipRedirect để tự xử lý refresh nếu token hết hạn
        const response = await get<ApiResponse>("/auth/me", {
          _skipRedirect: true,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any);
        if (response.success && response.data) {
          const mappedUser = mapBackendUser(response.data);
          setUser(mappedUser);
          setIsAuthenticated(true);
        } else {
          throw new Error("Lấy thông tin người dùng thất bại");
        }
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (error) {
        // Access token hết hạn, cố gắng refresh token thầm lặng
        try {
          const res = await post<
            ApiResponse<{ accessToken: string; refreshToken: string }>
          >("/auth/refresh-token", { refreshToken: storedRefreshToken }, {
            _skipRedirect: true,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
          } as any);

          if (res.success && res.data) {
            const {
              accessToken: newAccessToken,
              refreshToken: newRefreshToken,
            } = res.data;

            localStorage.setItem("accessToken", newAccessToken);
            localStorage.setItem("refreshToken", newRefreshToken);

            setAccessToken(newAccessToken);
            setRefreshToken(newRefreshToken);

            // Thử lại lấy thông tin người dùng với access token mới
            const meRes = await get<ApiResponse>("/auth/me");
            if (meRes.success && meRes.data) {
              const mappedUser = mapBackendUser(meRes.data);
              setUser(mappedUser);
              setIsAuthenticated(true);
            }
          }
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (refreshError) {
          // Refresh thất bại, tiến hành xóa sạch credentials
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          setAccessToken(null);
          setRefreshToken(null);
          setUser(null);
          setIsAuthenticated(false);
        }
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = useCallback(async (email: string, password?: string) => {
    try {
      const res = await post<ApiResponse<LoginResponse>>("/auth/login", {
        email,
        password,
      });
      if (res.success && res.data) {
        const {
          accessToken: newAccessToken,
          refreshToken: newRefreshToken,
          user: backendUser,
        } = res.data;

        localStorage.setItem("accessToken", newAccessToken);
        localStorage.setItem("refreshToken", newRefreshToken);

        setAccessToken(newAccessToken);
        setRefreshToken(newRefreshToken);

        const mappedUser = mapBackendUser(backendUser);
        setUser(mappedUser);
        setIsAuthenticated(true);
        return res;
      }
      throw new Error(res.message || "Đăng nhập thất bại");
    } catch (error) {
      throw error;
    }
  }, []);

  const loginWithGoogle = useCallback(async (supabaseAccessToken: string) => {
    try {
      const res = await post<ApiResponse<LoginResponse>>("/auth/google-login", {
        supabaseAccessToken,
      });
      if (res.success && res.data) {
        const {
          accessToken: newAccessToken,
          refreshToken: newRefreshToken,
          user: backendUser,
        } = res.data;

        localStorage.setItem("accessToken", newAccessToken);
        localStorage.setItem("refreshToken", newRefreshToken);

        setAccessToken(newAccessToken);
        setRefreshToken(newRefreshToken);

        const mappedUser = mapBackendUser(backendUser);
        setUser(mappedUser);
        setIsAuthenticated(true);
        return res;
      }
      throw new Error(res.message || "Đăng nhập Google thất bại");
    } catch (error) {
      throw error;
    }
  }, []);

  const completeOnboarding = useCallback(async (
    role: "candidate" | "recruiter",
    fullName: string,
    companyName?: string | null,
  ) => {
    try {
      const currentRefreshToken =
        localStorage.getItem("refreshToken") || refreshToken;
      if (!currentRefreshToken) {
        throw new Error(
          "Không tìm thấy phiên làm việc tạm thời. Vui lòng đăng nhập lại.",
        );
      }

      const res = await post<ApiResponse<LoginResponse>>(
        "/auth/complete-onboarding",
        {
          role,
          fullName,
          companyName,
          refreshToken: currentRefreshToken,
        },
      );

      if (res.success && res.data) {
        const {
          accessToken: newAccessToken,
          refreshToken: newRefreshToken,
          user: backendUser,
        } = res.data;

        localStorage.setItem("accessToken", newAccessToken);
        localStorage.setItem("refreshToken", newRefreshToken);

        setAccessToken(newAccessToken);
        setRefreshToken(newRefreshToken);

        const mappedUser = mapBackendUser(backendUser);
        setUser(mappedUser);
        setIsAuthenticated(true);
        return res;
      }
      throw new Error(res.message || "Thiết lập hồ sơ thất bại");
    } catch (error) {
      throw error;
    }
  }, [refreshToken]);

  const registerCandidate = useCallback(async (data: RegisterCandidateRequest) => {
    return post<ApiResponse>("/auth/register-candidate", data);
  }, []);

  const registerRecruiter = useCallback(async (data: RegisterRecruiterRequest) => {
    return post<ApiResponse>("/auth/register-recruiter", data);
  }, []);

  const verifyEmail = useCallback(async (token: string) => {
    return post<ApiResponse<{ alreadyVerified: boolean; role: string }>>(
      "/auth/verify-email",
      { token },
      { _skipRedirect: true } as Parameters<typeof post>[2],
    );
  }, []);

  const resendVerification = useCallback(async (email: string) => {
    return post<ApiResponse>(
      "/auth/resend-verification",
      { email },
      { _skipRedirect: true } as Parameters<typeof post>[2],
    );
  }, []);

  const logout = useCallback(async () => {
    try {
      const storedRefreshToken =
        localStorage.getItem("refreshToken") || refreshToken;
      if (storedRefreshToken) {
        await post<ApiResponse>("/auth/logout", {
          refreshToken: storedRefreshToken,
        });
      }
    } catch (error) {
      console.error("Lỗi khi gọi logout ở phía server:", error);
    } finally {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");

      setAccessToken(null);
      setRefreshToken(null);
      setUser(null);
      setIsAuthenticated(false);
    }
  }, [refreshToken]);

  const refreshAccessToken = useCallback(async (): Promise<string | null> => {
    try {
      const storedRefreshToken =
        localStorage.getItem("refreshToken") || refreshToken;
      if (!storedRefreshToken) {
        throw new Error("Không tìm thấy refresh token");
      }

      const res = await post<
        ApiResponse<{ accessToken: string; refreshToken: string }>
      >("/auth/refresh-token", { refreshToken: storedRefreshToken }, {
        _skipRedirect: true,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any);

      if (res.success && res.data) {
        const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
          res.data;

        localStorage.setItem("accessToken", newAccessToken);
        localStorage.setItem("refreshToken", newRefreshToken);

        setAccessToken(newAccessToken);
        setRefreshToken(newRefreshToken);

        return newAccessToken;
      }
      return null;
    } catch (error) {
      console.error("Gọi refresh token thất bại:", error);
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      setAccessToken(null);
      setRefreshToken(null);
      setUser(null);
      setIsAuthenticated(false);
      return null;
    }
  }, [refreshToken]);

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        refreshToken,
        isAuthenticated,
        isLoading,
        login,
        loginWithGoogle,
        completeOnboarding,
        registerCandidate,
        registerRecruiter,
        verifyEmail,
        resendVerification,
        logout,
        refreshAccessToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
