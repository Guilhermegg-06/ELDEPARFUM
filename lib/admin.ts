import { supabaseBrowser } from './supabaseClient';

export function getAllowedAdminEmails(): string[] {
  const raw = process.env.ADMIN_EMAILS || '';
  return raw.split(',').map((s) => s.trim()).filter(Boolean);
}

export async function isAdmin(): Promise<boolean> {
  const {
    data: { session },
  } = await supabaseBrowser.auth.getSession();
  if (!session?.user?.email) return false;
  const allowed = getAllowedAdminEmails();
  return allowed.includes(session.user.email);
}

export async function signOut() {
  await supabaseBrowser.auth.signOut();
}
