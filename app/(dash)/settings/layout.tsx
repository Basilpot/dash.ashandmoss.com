import { SettingsShell } from "@repo/ui";

/**
 * The tab bar and page title live in this layout rather than inside each
 * settings page.
 *
 * They were rendered by the API keys page alone, so the tabs appeared on that
 * one route and disappeared the moment you navigated to any other settings page.
 * A layout wraps every child, so the chrome is present on all seven sections and
 * survives navigation between them.
 */
export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SettingsShell>{children}</SettingsShell>;
}