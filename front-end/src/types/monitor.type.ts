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
  id: string; // frontend id (could map from _id on backend)
  timestamp: string; // ISO string
  status: MonitoringStatus;
  action: MonitoringAction;
  message: string;
  operator?: string; // who performed the action
  service?: string; // the service/component name
}

export interface EventLogListResponse {
  data: EventLog[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
