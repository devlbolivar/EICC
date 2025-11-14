// Force dynamic rendering for sign-in page (uses useSearchParams)
export const dynamic = 'force-dynamic';

export default function SignInLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
