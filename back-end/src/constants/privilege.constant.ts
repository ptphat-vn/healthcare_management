// Privilege constants for RBAC system
export const PRIVILEGES = {
  // Admin privilege - access to everything
  ADMIN: '*',

  // Basic read access
  READ_ONLY: 'read_only',

  // Role management
  VIEW_ROLE: 'view_role',
  CREATE_ROLE: 'create_role',
  UPDATE_ROLE: 'update_role',
  DELETE_ROLE: 'delete_role',

  // Configuration management
  VIEW_CONFIG: 'view_config',
  CREATE_CONFIG: 'create_config',
  MODIFY_CONFIG: 'modify_config',
  DELETE_CONFIG: 'delete_config',

  // User management
  VIEW_USER: 'view_user',
  MODIFY_USER: 'modify_user',
  DELETE_USER: 'delete_user',
  LOCK_UNLOCK_USER: 'lock_unlock_user',

  // Comments
  ADD_COMMENT: 'add_comment',
  MODIFY_COMMENT: 'modify_comment',
  DELETE_COMMENT: 'delete_comment',

  // Test orders
  CREATE_TEST_ORDER: 'create_test_order',
  DELETE_TEST_ORDER: 'delete_test_order',
  REVIEW_TEST_ORDER: 'review_test_order',
  MODIFY_TEST_ORDER: 'modify_test_order',

  // Blood testing
  EXECUTE_BLOOD_TESTING: 'execute_blood_testing',

  // Instruments
  VIEW_INSTRUMENT: 'view_instrument',
  ACTIVATE_INSTRUMENT: 'activate_instrument',
  DEACTIVATE_INSTRUMENT: 'deactivate_instrument',

  // Medical-record
  CREATE_MEDICAL_RECORD: 'create_medical_record',
  DELETE_MEDICAL_RECORD: 'delete_medical_record',
  REVIEW_MEDICAL_RECORD: 'review_medical_record',
  MODIFY_MEDICAL_RECORD: 'modify_medical_record',
  // Event logs
  VIEW_EVENT_LOGS: 'view_event_logs'
} as const

// Role codes
export const ROLES = {
  ADMIN: 'admin',
  LAB_MANAGER: 'lab_manager',
  SERVICE: 'service',
  LAB_USER: 'lab_user',
  PATIENT: 'patient'
} as const

export const isAdmin = (privileges: string[]): boolean => {
  return privileges.includes(PRIVILEGES.ADMIN)
}
export const hasPrivilege = (privileges: string[], privilege: string): boolean => {
  return isAdmin(privileges) || privileges.includes(privilege)
}
export const hasAnyPrivilege = (privileges: string[], requiredPrivileges: string[]): boolean => {
  return isAdmin(privileges) || requiredPrivileges.some((privilege) => privileges.includes(privilege))
}
