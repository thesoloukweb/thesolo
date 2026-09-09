/**
 * What the two forms accept.
 *
 * Both the reservation form and the contact form had their own copy of these
 * rules, and both copies were wrong in the same way, which is what happens to
 * duplicated logic. There is one copy now.
 */

/**
 * People write a phone number however they like: with spaces, with hyphens,
 * with the area code in brackets, as +44, as 0044. Strip the punctuation and
 * fold the international prefixes onto the national 0, so that every way of
 * writing the same British number arrives at the same string.
 */
export function normalisePhone(value: string): string {
  const digits = String(value ?? '').trim().replace(/[\s()\-.‐-―]/g, '');
  if (/^\+44\d/.test(digits)) return '0' + digits.slice(3);
  if (/^0044\d/.test(digits)) return '0' + digits.slice(4);
  // A bare 44 prefix, but only when what follows is long enough to be a
  // national number — otherwise 44xxxx could be somebody's local number.
  if (/^44[1-9]\d{8,9}$/.test(digits)) return '0' + digits.slice(2);
  return digits;
}

/**
 * A UK number, or an international one written in the way that lets someone
 * actually dial it back. The restaurant is in Bethnal Green but it takes
 * bookings from visitors, and rejecting their number loses the booking.
 */
export function isValidPhone(value: string): boolean {
  const n = normalisePhone(value);
  if (/^0[1-9]\d{8,9}$/.test(n)) return true;   // UK: 10 or 11 digits
  if (/^\+[1-9]\d{7,14}$/.test(n)) return true; // elsewhere: E.164
  return false;
}

export const PHONE_HINT =
  'Please enter a valid phone number — a UK number like 07911 123456 or 020 8014 2656, or an international number starting with +.';

/**
 * Names, as people actually have them. The previous rule was letters and
 * spaces in the ASCII range, which turned away Öztürk, Şahin, O'Brien,
 * Anne-Marie and José — a meaningful share of this restaurant's customers.
 * Letters from any alphabet, plus the marks that appear inside real names.
 */
const NAME = /^[\p{L}\p{M}][\p{L}\p{M}'’\-. ]{1,79}$/u;

export function isValidName(value: string): boolean {
  return NAME.test(String(value ?? '').trim());
}

export const NAME_HINT = 'Please enter your name as it should appear on the booking.';

export function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(value ?? '').trim());
}

export const EMAIL_HINT = 'Please enter a valid email address (e.g., name@gmail.com).';
