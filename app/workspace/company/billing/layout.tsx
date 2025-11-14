// Force dynamic rendering for billing pages (uses useSearchParams)
export const dynamic = 'force-dynamic';

export default function BillingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
