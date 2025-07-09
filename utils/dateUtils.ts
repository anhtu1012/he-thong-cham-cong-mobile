import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

// Kích hoạt plugin để hỗ trợ múi giờ
dayjs.extend(utc);
dayjs.extend(timezone);

/**
 * Hàm chuyển đổi định dạng ngày từ API về dạng `DD/MM/YYYY`
 * @param dateString
 * @returns
 */
export const formatDate = (dateString?: string): string => {
  if (!dateString) return "";
  return dayjs
    .utc(dateString)
    .tz("Asia/Ho_Chi_Minh")
    .local()
    .format("DD/MM/YYYY");
};

/**
 * Hàm lấy thời gian hiện tại theo múi giờ Việt Nam
 * @returns ISO string with Vietnamese timezone
 */
export const getCurrentDateRes = (): string => {
  // Get current time in Vietnamese timezone
  return dayjs()
    .tz("Asia/Ho_Chi_Minh")
    .local()
    .format("YYYY-MM-DDTHH:mm:ss.SSSZ");
};

/**
 * Hàm chuyển đổi định dạng thời gian từ API về dạng `HH:mm`
 * @param timeString
 * @returns
 */
export const formatTime = (timeString?: string): string => {
  if (!timeString) return "";
  return dayjs.utc(timeString).tz("Asia/Ho_Chi_Minh").local().format("HH:mm");
};
