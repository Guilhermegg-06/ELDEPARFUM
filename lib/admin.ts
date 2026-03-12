import { supabaseBrowser } from './supabaseClient';

export function getAllowedAdminEmails(): string[] {
  const raw = process.env.NEXT_PUBLIC_ADMIN_EMAILS || process.env.ADMIN_EMAILS || '';
  return raw
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

export async function isAdmin(): Promise<boolean> {
  if (!supabaseBrowser) return false;
  const {
    data: { session },
  } = await supabaseBrowser.auth.getSession();
  if (!session?.user?.email) return false;
  const allowed = getAllowedAdminEmails();
  return allowed.includes(session.user.email.toLowerCase());
}

export async function signOut() {
  if (!supabaseBrowser) return;
  await supabaseBrowser.auth.signOut();
}
