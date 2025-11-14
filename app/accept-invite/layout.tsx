// Force dynamic rendering for accept-invite page (uses useSearchParams)
export const dynamic = 'force-dynamic';

export default function AcceptInviteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
