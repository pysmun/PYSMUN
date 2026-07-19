export const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export const pakistaniMobileMessage = "Enter the 10-digit mobile number, e.g. 300 1234567";

export const pakistaniNationalMobilePattern = /^3\d{9}$/;

// Collapses anything typed or pasted into the national number after +92:
// "0300..." drops the trunk zero, "+92 300..." / "0092300..." drop the code.
export function parsePakistaniNationalNumber(value: string) {
  let digits = value.replace(/\D/g, "").replace(/^0+/, "");
  if (digits.startsWith("92") && digits.length > 10) digits = digits.slice(2).replace(/^0+/, "");
  return digits.slice(0, 10);
}

export function formatPakistaniNationalNumber(digits: string) {
  return digits.length > 3 ? `${digits.slice(0, 3)} ${digits.slice(3)}` : digits;
}

// Accepts 03XXXXXXXXX, +92 3XX..., 0092 3XX... and 92 3XX... with optional
// spaces, dashes or parentheses; returns the canonical +923XXXXXXXXX form.
export function normalizePakistaniMobile(value: string) {
  const compact = value.replace(/[\s()-]/g, "");
  const match = compact.match(/^(?:\+92|0092|92|0)(3\d{9})$/);
  return match ? `+92${match[1]}` : null;
}
