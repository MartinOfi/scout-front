/**
 * Represents a navigation item in the sidebar menu.
 */
export interface SidebarItem {
  readonly icon: string;
  readonly label: string;
  readonly route: string;
}

/**
 * Represents the authenticated user's information displayed in the sidebar footer.
 */
export interface UserInfo {
  readonly name: string;
  readonly email: string;
  readonly avatarUrl?: string;
}
