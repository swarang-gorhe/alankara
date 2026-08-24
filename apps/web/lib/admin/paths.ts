export function consoleBase(pathname: string): "/admin" | "/atelier" {
  return pathname.startsWith("/atelier") ? "/atelier" : "/admin";
}

export function isConsoleLogin(pathname: string): boolean {
  return pathname === "/admin/login" || pathname === "/atelier/login";
}

export function toAdminPath(pathname: string): string {
  if (pathname.startsWith("/atelier")) {
    return pathname.replace(/^\/atelier/, "/admin") || "/admin";
  }
  return pathname;
}
