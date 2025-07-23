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

export const createForm = async (formData: {
  reason: string;
  status: string;
  file: string;
  startTime: string;
  endTime: string;
  formId: string;
}) => {
  try {
    const response = await api.post("/form-description", formData);
    return response;
  } catch (error) {
    console.error("Error creating form:", error);
    throw error;
  }
};

export const getFormDescriptions = async (params: {
  quickSearch?: string;
  fromDate?: string;
  toDate?: string;
  formId?: string;
}) => {
  try {
    const response = await api.get("/form-description/filter", { params });
    return response;
  } catch (error) {
    console.error("Error fetching form descriptions:", error);
    throw error;
  }
};

export const getAddress = async (payload: {
  longitude: string;
  latitude: string;
}) => {
  return axios.get(
    `${process.env.EXPO_PUBLIC_GOONG_URL}/Geocode?latlng=${payload.latitude},${payload.longitude}&api_key=${process.env.EXPO_PUBLIC_GOONG_KEY}`
  );
};

export const getBranchDetail = async (branchCode: string) => {
  return api.get("/branch", {
    params: {
      quickSearch: branchCode,
    },
  });
};

export const getUserContract = async (userCode: string) => {
  return api.get(`/business/by-user-code/${userCode}`);
};

export const cancelForm = async (formDescriptionId: string) => {
  try {
    const response = await api.put(`/form-description/${formDescriptionId}`, {
      status: "CANCELED",
    });
    return response;
  } catch (error) {
    console.error("Error canceling form:", error);
    throw error;
  }
};
