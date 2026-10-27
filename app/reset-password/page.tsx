import { ResetPasswordForm } from "./reset-password-form";

export const metadata = { title: "Ash & Moss" };

export default async function ResetPasswordPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token = "" } = await searchParams;
  return <main className="flex min-h-svh items-center justify-center p-6"><ResetPasswordForm token={token} /></main>;
}
