export interface checkInValues {
  userCode: string;
  checkInTime: string;
}

export interface checkOutValues {
  workingScheduleCode: string;
  checkOutTime: string;
}

// Enhanced WorkingSchedule interface with all possible properties
export interface WorkingSchedule {
  id: string;
  createdAt: string;
  updatedAt: string;
  timeKeepingId: string | null;
  code: string;
  userCode: string;
  userContractCode: string;
  status: "NOTSTARTED" | "ACTIVE" | "END" | "NOTWORK";
  date: string;
  fullName: string;
  shiftCode: string;
  shiftName: string;
  branchName: string;
  branchCode: string;
  addressLine: string;
  startShiftTime: string;
  endShiftTime: string;
  workingHours: number;
  checkInTime: string | null;
  checkOutTime: string | null;
  statusTimeKeeping: "STARTED" | "LATE" | "END" | "NOCHECKOUT" | null;
  workingHourReal?: string;
  positionName: string;
  managerFullName: string;
  // Additional detailed properties
  departmentName?: string;
  departmentCode?: string;
  overtime?: number;
  overtimeApproved?: boolean;
  lateMinutes?: number;
  earlyLeaveMinutes?: number;
  breakTime?: number;
  actualWorkingHours?: number;
  isHoliday?: boolean;
  holidayType?: "NATIONAL" | "COMPANY" | "PERSONAL";
  workLocation?: "OFFICE" | "REMOTE" | "CLIENT_SITE";
  gpsLocation?: {
    latitude: number;
    longitude: number;
    accuracy: number;
  };
  checkInPhoto?: string;
  checkOutPhoto?: string;
  notes?: string;
  approvalStatus?: "PENDING" | "APPROVED" | "REJECTED";
  approvedBy?: string;
  approvedAt?: string;
  rejectionReason?: string;
}

// Time tracking statistics
export interface TimeTrackingStats {
  totalWorkDays: number;
  actualWorkDays: number;
  absentDays: number;
  lateDays: number;
  earlyLeaveDays: number;
  overtimeDays: number;
  totalWorkingHours: number;
  totalOvertimeHours: number;
  averageWorkingHours: number;
  attendanceRate: number;
  punctualityRate: number;
}

// Monthly summary
export interface MonthlySummary {
  month: string;
  year: number;
  stats: TimeTrackingStats;
  salaryInfo?: {
    baseSalary: number;
    overtimePay: number;
    deductions: number;
    netSalary: number;
  };
}

// Weekly summary
export interface WeeklySummary {
  weekStart: string;
  weekEnd: string;
  weekNumber: number;
  workDays: WorkingSchedule[];
  totalHours: number;
  overtimeHours: number;
  lateCount: number;
  absentCount: number;
}

// Shift information for multiple shifts per day
export interface ShiftInfo {
  code: string;
  name: string;
  startTime: string;
  endTime: string;
  breakDuration: number;
  minimumWorkingHours: number;
  overtimeThreshold: number;
  isFlexible: boolean;
  allowedLateness: number; // in minutes
  description?: string;
}

// Working shift data for a specific day
export interface WorkingShift {
  shiftCode: string;
  shiftName: string;
  startShiftTime: string;
  endShiftTime: string;
  workingHours: number;
  checkInTime: string | null;
  checkOutTime: string | null;
  status: "NOTSTARTED" | "ACTIVE" | "END" | "NOTWORK";
  statusTimeKeeping: "STARTED" | "LATE" | "END" | "NOCHECKOUT" | null;
  workingHourReal?: string;
  lateMinutes?: number;
  earlyLeaveMinutes?: number;
}

// Day status for calendar view with multiple shifts
export interface DayStatus {
  day: number;
  status:
    | "NOTSTARTED"
    | "ACTIVE"
    | "END"
    | "NOTWORK"
    | "weekend"
    | "normal"
    | "FORGET";
  statusTimeKeeping?: "STARTED" | "LATE" | "END" | "NOCHECKOUT";
  value: string | number;
  date?: string;
  // Single shift data (for backward compatibility)
  checkInTime?: string;
  checkOutTime?: string;
  workingHourReal?: string;
  workingHours?: number;
  startShiftTime?: string;
  endShiftTime?: string;
  isToday?: boolean;
  isFuture?: boolean;
  isPast?: boolean;
  schedule?: WorkingSchedule;
  // Multiple shifts data
  shifts?: WorkingShift[];
  totalWorkingHours?: number;
  totalShifts?: number;
}

// Check-in/out request interfaces
export interface CheckInRequest {
  userCode: string;
  checkInTime: string;
  location?: {
    latitude: number;
    longitude: number;
    accuracy: number;
  };
  photo?: string;
  notes?: string;
  deviceInfo?: {
    deviceId: string;
    platform: string;
    appVersion: string;
  };
}

export interface CheckOutRequest {
  workingScheduleCode: string;
  checkOutTime: string;
  location?: {
    latitude: number;
    longitude: number;
    accuracy: number;
  };
  photo?: string;
  notes?: string;
  actualWorkSummary?: string;
}

// Response interfaces
export interface TimeScheduleResponse {
  success: boolean;
  data: WorkingSchedule[];
  message?: string;
  totalCount?: number;
  pageSize?: number;
  currentPage?: number;
}

export interface CheckInResponse {
  success: boolean;
  data: {
    timeKeepingId: string;
    checkInTime: string;
    status: string;
  };
  message: string;
}

export interface CheckOutResponse {
  success: boolean;
  data: {
    timeKeepingId: string;
    checkOutTime: string;
    workingHours: number;
    overtimeHours?: number;
    status: string;
  };
  message: string;
}

// User profile interface
export interface UserProfile {
  id: string;
  code: string;
  userName: string;
  fullName: string;
  email?: string;
  phone?: string;
  avatar?: string;
  position?: string;
  department?: string;
  branch?: string;
  manager?: string;
  joinDate?: string;
  contractType?: "FULL_TIME" | "PART_TIME" | "CONTRACT" | "INTERN";
  employeeStatus?: "ACTIVE" | "INACTIVE" | "TERMINATED";
  workingHoursPerDay?: number;
  workingDaysPerWeek?: number;
  timezone?: string;
  isManager?: boolean;
  permissions?: string[];
}

// Location information
export interface LocationInfo {
  name: string;
  address: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  radius: number; // allowed check-in radius in meters
  timezone: string;
  isActive: boolean;
}

// Attendance settings
export interface AttendanceSettings {
  allowGPSChecking: boolean;
  requirePhoto: boolean;
  allowRemoteWork: boolean;
  maxLateness: number; // in minutes
  overtimeRequiresApproval: boolean;
  autoCheckOut: boolean;
  autoCheckOutTime: string;
  gracePeriod: number; // in minutes
  workingLocations: LocationInfo[];
}
