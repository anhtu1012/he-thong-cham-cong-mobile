import api from "../config/axios";
import { LoginFormValues } from "../models/login";

export const loginUser = (values: LoginFormValues) => {
  return api.post("/auth/login", values);
};

export const logout = () => {
  return api.post("/auth/logout");
};

export const registerFace = (values: FormData) => {
  return api.post("/upload/direct-upload", values);
};

export const getForms = () => {
  return api.get("/form");
};
