import { VerifyEmail } from "./verify-email";

export default async function VerifyPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token = "" } = await searchParams;
  return <main className="flex min-h-screen items-center justify-center p-6"><VerifyEmail token={token} /></main>;
}
