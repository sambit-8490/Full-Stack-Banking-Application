/**
 * api.js
 *
 * Centralized API service for communicating with Spring Boot backend.
 * Handles JWT authentication, token interceptors, and provides
 * methods for authentication, user operations, transactions,
 * and admin features.
 */

import axios from "axios";
import { isTokenExpired } from "../utils/jwtUtils";

// Base URL is empty — nginx proxies /api/ to backend-service:8080
const API_BASE_URL = "";

/**
 * ApiService Class - Manages all backend API communication
 */
class ApiService {
  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Attach token to every request
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem("jwtToken");
        if (token) {
          if (isTokenExpired(token)) {
            this.clearAuthToken();
            window.location.href = "/login";
            return Promise.reject(new Error("Token expired"));
          }
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Handle 401 Unauthorized globally
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          this.clearAuthToken();
          window.location.href = "/login";
        }
        return Promise.reject(error);
      }
    );
  }

  // -------------------------
  // AUTH TOKEN MANAGEMENT
  // -------------------------
  setAuthToken(token) {
    if (token) {
      this.api.defaults.headers.Authorization = `Bearer ${token}`;
      localStorage.setItem("jwtToken", token);
    } else {
      delete this.api.defaults.headers.Authorization;
      localStorage.removeItem("jwtToken");
    }
  }

  clearAuthToken() {
    delete this.api.defaults.headers.Authorization;
    localStorage.removeItem("jwtToken");
    localStorage.removeItem("userInfo");
  }

  isTokenValid() {
    const token = localStorage.getItem("jwtToken");
    return token && !isTokenExpired(token);
  }

  getToken() {
    return localStorage.getItem("jwtToken");
  }

  // -------------------------
  // GENERIC HTTP METHODS
  // -------------------------
  get(url, config = {}) {
    return this.api.get(this._normalizeUrl(url), config);
  }

  post(url, data, config = {}) {
    return this.api.post(this._normalizeUrl(url), data, config);
  }

  put(url, data, config = {}) {
    return this.api.put(this._normalizeUrl(url), data, config);
  }

  delete(url, config = {}) {
    return this.api.delete(this._normalizeUrl(url), config);
  }

  _normalizeUrl(url) {
    // Ensure all API calls have a leading /api if missing
    if (!url.startsWith("/api")) {
      return `/api${url.startsWith("/") ? "" : "/"}${url}`;
    }
    return url;
  }

  // -------------------------
  // AUTH METHODS
  // -------------------------
  async login(credentials) {
    const response = await this.post("/authenticate", {
      username: credentials.email,
      password: credentials.password,
    });

    if (response.data) {
      this.setAuthToken(response.data);
      return response;
    }

    throw new Error("Authentication failed");
  }

  async register(userData) {
    return this.post("/signup", userData);
  }

  // -------------------------
  // USER ACCOUNT OPERATIONS
  // -------------------------
  getUserBalance() {
    return this.get("/user/balance");
  }

  updateUser(userId, userData) {
    return this.put(`/user/${userId}`, userData);
  }

  changePassword(passwordData) {
    return this.post("/user/change-password", passwordData);
  }

  deleteUser(userId) {
    return this.delete(`/user/${userId}`);
  }

  // -------------------------
  // TRANSACTION OPERATIONS
  // -------------------------
  deposit(amount) {
    return this.post("/transactions/deposit", amount);
  }

  withdraw(amount) {
    return this.post("/transactions/withdraw", amount);
  }

  transfer(transferData) {
    return this.post("/transactions/transfer", transferData);
  }

  getTransactionHistory(page = 0, size = 10) {
    return this.get(`/transactions/history?page=${page}&size=${size}`);
  }

  // -------------------------
  // PUBLIC API
  // -------------------------
  getDashboard() {
    return this.get("/dashboard");
  }

  // -------------------------
  // ADMIN METHODS
  // -------------------------
  getAllUsers(page = 0, size = 10) {
    return this.get(`/admin/users?page=${page}&size=${size}`);
  }

  createUser(userData) {
    return this.post("/admin/users", userData);
  }

  deleteUserAdmin(userId) {
    return this.delete(`/admin/users/${userId}`);
  }
}

// Export one global instance
const api = new ApiService();
export default api;
