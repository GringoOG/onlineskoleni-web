export const DEMO_USER_EMAIL = "testik@demo.onlineskoleni.eu";

export function isDemoUserEmail(email: string): boolean {
  return email.trim().toLowerCase() === DEMO_USER_EMAIL;
}
