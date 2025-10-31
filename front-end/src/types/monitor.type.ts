export type MonitoringStatus = "success" | "warning" | "error" | "info";

export type MonitoringAction =
  | "USER_CREATED"
  | "USER_UPDATED"
  | "USER_DELETED"
  | "LOGIN_FAILED"
  | "SYSTEM_ERROR"
  | "PASSWORD_RESET"
  | string;

export interface EventLog {
  id: string;
  timestamp: string;
  status: MonitoringStatus;
  action: MonitoringAction;
  message: string;
  operator?: Operator;
  service?: string;
}
export interface Operator {
  id: string;
  name: string;
  role: string;
}
export interface EventLogListResponse {
  eventLogs: EventLog[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
