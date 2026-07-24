/**
 * Calculate days remaining until a renewal date using IST (Asia/Kolkata) timezone.
 * Matches the backend's getDaysLeft() logic so UI and emails always agree.
 */
export const getDaysLeft = (renewalDate) => {
  if (!renewalDate) return null;
  const parsed = new Date(renewalDate);
  if (isNaN(parsed.getTime())) return null;

  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  const todayStr = formatter.format(new Date());
  const renewalStr = formatter.format(parsed);

  const todayMs = Date.parse(`${todayStr}T00:00:00Z`);
  const renewalMs = Date.parse(`${renewalStr}T00:00:00Z`);

  return Math.round((renewalMs - todayMs) / (1000 * 60 * 60 * 24));
};
