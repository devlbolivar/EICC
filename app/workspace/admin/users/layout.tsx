// Force dynamic rendering for admin users page (uses useSearchParams)
export const dynamic = 'force-dynamic';

export default function AdminUsersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
