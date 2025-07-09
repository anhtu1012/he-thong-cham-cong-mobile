import axios from "axios";
import api from "../config/axios";
import { LoginFormValues } from "../models/login";
import { checkInValues, checkOutValues } from "../models/timekeeping";

export const loginUser = (values: LoginFormValues) => {
  return api.post("/auth/login", values);
};

export const logout = () => {
  return api.post("/auth/logout");
};

export const registerFace = (values: FormData) => {
  return api.post("/upload/direct-upload", values, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

export const getUserFaceImg = (path: string) => {
  return api.get(`/upload/download?path=${path}`, {
    responseType: "arraybuffer",
  });
};

export const compareFace = (values: FormData) => {
  return axios.post(
    `${process.env.EXPO_PUBLIC_API_PYTHON_URL}/verify`,
    values,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
};

export const getTimeSchedule = (
  fromDate: Date,
  toDate: Date,
  userCode: string
) => {
  return api.get("/business/lich-lam", {
    params: {
      fromDate,
      toDate,
      userCode,
    },
  });
};

export const timeKeepingCheckIn = (
  workingScheduleId: string,
  values: checkInValues
) => {
  return api.put(`/business/cham-cong/${workingScheduleId}`, values);
};

export const timeKeepingCheckOut = (
  timeKeepingId: string,
  values: checkOutValues
) => {
  return api.put(`/time-keeping/${timeKeepingId}`, values);
};

export const getForms = () => {
  return api.get("/form");
};
