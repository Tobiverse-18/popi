import axios from "axios";

const api = axios.create({
  baseURL: "http://127.0.0.1:8000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

/*
|--------------------------------------------------------------------------
| Request Interceptor
|--------------------------------------------------------------------------
*/

api.interceptors.request.use(
  (config) => {
    const accessToken =
      localStorage.getItem("access_token");

    const isAuthRequest =
      config.url === "/users/login/" ||
      config.url === "/users/register/" ||
      config.url === "/users/forgot-password/" ||
      config.url === "/users/reset-password/" ||
      config.url === "/users/token/refresh/";

    if (accessToken && !isAuthRequest) {
      config.headers.Authorization =
        `Bearer ${accessToken}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/*
|--------------------------------------------------------------------------
| Response Interceptor
|--------------------------------------------------------------------------
*/

api.interceptors.response.use(
  (response) => {
    return response;
  },

  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status !== 401 ||
      originalRequest?._retry
    ) {
      return Promise.reject(error);
    }

    const refreshToken =
      localStorage.getItem("refresh_token");

    if (!refreshToken) {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");

      window.location.href = "/login";

      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/api/users/token/refresh/",
        {
          refresh: refreshToken,
        }
      );

      const newAccessToken =
        response.data.access;

      const newRefreshToken =
        response.data.refresh;

      localStorage.setItem(
        "access_token",
        newAccessToken
      );

      if (newRefreshToken) {
        localStorage.setItem(
          "refresh_token",
          newRefreshToken
        );
      }

      originalRequest.headers = {
        ...originalRequest.headers,
        Authorization:
          `Bearer ${newAccessToken}`,
      };

      return api(originalRequest);
    } catch (refreshError) {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");

      window.location.href = "/login";

      return Promise.reject(refreshError);
    }
  }
);

export default api;