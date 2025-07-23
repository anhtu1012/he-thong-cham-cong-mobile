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
export const formatDate = (
  dateString: string,
  format: "DD/MM" | "DD/MM/YYYY" | "full" = "DD/MM"
): string => {
  try {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();

    switch (format) {
      case "DD/MM":
        return `${day}/${month}`;
      case "DD/MM/YYYY":
        return `${day}/${month}/${year}`;
      case "full":
        const dayNames = [
          "Chủ nhật",
          "Thứ 2",
          "Thứ 3",
          "Thứ 4",
          "Thứ 5",
          "Thứ 6",
          "Thứ 7",
        ];
        const dayName = dayNames[date.getDay()];
        return `${dayName}, ${day}/${month}/${year}`;
      default:
        return `${day}/${month}`;
    }
  } catch (error) {
    return "";
  }
};

/**
 * Hàm lấy thời gian hiện tại theo múi giờ Việt Nam
 * @returns ISO string with Vietnamese timezone
 */
export const getCurrentDateRes = (): string => {
  return dayjs().format("YYYY-MM-DDTHH:mm:ss");
};

/**
 * Hàm chuyển đổi định dạng thời gian từ API về dạng `HH:mm`
 * @param timeString
 * @returns
 */
export const formatTime = (timeString: string | null): string => {
  if (!timeString) return "--:--";

  try {
    // Use dayjs with UTC to preserve original time from database
    const utcTime = dayjs.utc(timeString);
    return utcTime.format("HH:mm");
  } catch (error) {
    return "--:--";
  }
};

export const calculateWorkingHours = (
  checkIn: string,
  checkOut: string,
  breakTime: number = 0
): number => {
  try {
    const checkInTime = new Date(checkIn);
    const checkOutTime = new Date(checkOut);

    const diffMs = checkOutTime.getTime() - checkInTime.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);

    return Math.max(0, diffHours - breakTime / 60);
  } catch (error) {
    return 0;
  }
};

export const calculateLateMinutes = (
  checkIn: string,
  shiftStart: string
): number => {
  try {
    const checkInTime = parseTimeString(checkIn);
    const shiftStartTime = parseTimeString(shiftStart);

    return Math.max(0, checkInTime - shiftStartTime);
  } catch (error) {
    return 0;
  }
};

export const calculateEarlyMinutes = (
  checkOut: string,
  shiftEnd: string
): number => {
  try {
    const checkOutTime = parseTimeString(checkOut);
    const shiftEndTime = parseTimeString(shiftEnd);

    return Math.max(0, shiftEndTime - checkOutTime);
  } catch (error) {
    return 0;
  }
};

const parseTimeString = (timeString: string): number => {
  let timeOnly = timeString;

  if (timeString.includes("T")) {
    const date = new Date(timeString);
    const hours = date.getHours();
    const minutes = date.getMinutes();
    return hours * 60 + minutes;
  }

  const [hours, minutes] = timeOnly.split(":").map(Number);
  return hours * 60 + minutes;
};

export const getWeekRange = (date: Date): { start: Date; end: Date } => {
  const start = new Date(date);
  const day = start.getDay();
  const diff = start.getDate() - day + (day === 0 ? -6 : 1);
  start.setDate(diff);
  start.setHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  end.setHours(23, 59, 59, 999);

  return { start, end };
};

export const getMonthRange = (date: Date): { start: Date; end: Date } => {
  const start = new Date(date.getFullYear(), date.getMonth(), 1, 0, 0, 0, 0);
  const end = new Date(
    date.getFullYear(),
    date.getMonth() + 1,
    0,
    23,
    59,
    59,
    999
  );

  return { start, end };
};

export const isToday = (dateString: string): boolean => {
  try {
    const date = new Date(dateString);
    const today = new Date();

    return date.toDateString() === today.toDateString();
  } catch (error) {
    return false;
  }
};

export const isWeekend = (dateString: string): boolean => {
  try {
    const date = new Date(dateString);
    const day = date.getDay();
    return day === 0 || day === 6;
  } catch (error) {
    return false;
  }
};

export const formatDuration = (minutes: number): string => {
  if (minutes < 60) {
    return `${minutes}p`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (remainingMinutes === 0) {
    return `${hours}h`;
  }

  return `${hours}h ${remainingMinutes}p`;
};
