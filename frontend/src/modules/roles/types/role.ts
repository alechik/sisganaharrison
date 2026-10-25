export interface Role {
  id: number;
  name: string;
  guard_name?: string;
  permissions?: string[];
  created_at?: string | null;
  updated_at?: string | null;
}

export interface RoleUpdateRequest {
  permissions: string[];
}
