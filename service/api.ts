import api from "../config/axios";
import { LoginFormValues } from "../models/login";

export const loginUser = (values: LoginFormValues) => {
  return api.post("/v1/auth/login", values);
};

export const logout = () => {
  return api.post("/v1/auth/logout");
};

export const registerFace = (values: FormData) => {
  console.log(values);

  return api.post("/v1/upload/direct-upload", values);
};
