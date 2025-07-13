import api from "../config/axios";

export const getBangLuong = (userCode: string, month?: string) => {
  let url = `/business/bang-luong?userCode=${userCode}`;
  if (month) {
    url += `&month=${month}`;
  }
  return api.get(url);
};
