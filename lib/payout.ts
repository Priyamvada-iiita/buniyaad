export type PayoutDetails = {
  upi_id?: string | null;
  account_name?: string | null;
  bank_name?: string | null;
  account_number?: string | null;
  ifsc?: string | null;
  razorpay_linked_account_id?: string | null;
};

const UPI_RE = /^[a-zA-Z0-9._-]{2,256}@[a-zA-Z][a-zA-Z0-9.-]{2,64}$/;
const IFSC_RE = /^[A-Z]{4}0[A-Z0-9]{6}$/;

export function normalizeUpiId(value: string) {
  return value.trim().toLowerCase();
}

export function normalizeIfsc(value: string) {
  return value.trim().toUpperCase();
}

export function isValidUpiId(value: string) {
  return UPI_RE.test(normalizeUpiId(value));
}

export function isValidIfsc(value: string) {
  return IFSC_RE.test(normalizeIfsc(value));
}

export function isValidAccountNumber(value: string) {
  const digits = value.replace(/\s/g, '');
  return /^\d{9,18}$/.test(digits);
}

export function hasPayoutDetails(payout: PayoutDetails | null | undefined) {
  if (!payout) return false;
  const upi = payout.upi_id?.trim();
  if (upi && isValidUpiId(upi)) return true;
  const name = payout.account_name?.trim();
  const num = payout.account_number?.replace(/\s/g, '');
  const ifsc = payout.ifsc?.trim();
  return Boolean(name && num && ifsc && isValidAccountNumber(num) && isValidIfsc(ifsc));
}

export function validatePayoutForm(payout: PayoutDetails): string | null {
  const upi = payout.upi_id?.trim() || '';
  const name = payout.account_name?.trim() || '';
  const bank = payout.bank_name?.trim() || '';
  const num = payout.account_number?.replace(/\s/g, '') || '';
  const ifsc = payout.ifsc?.trim() || '';

  const anyBank = name || bank || num || ifsc;
  const anyFilled = upi || anyBank;

  if (!anyFilled) {
    return 'Add your UPI ID or bank account so online payments can reach you.';
  }

  if (upi && !isValidUpiId(upi)) {
    return 'UPI ID looks invalid (example: yourshop@paytm).';
  }

  if (anyBank) {
    if (!name) return 'Enter account holder name for bank transfer.';
    if (!num || !isValidAccountNumber(num)) return 'Enter a valid bank account number (9–18 digits).';
    if (!ifsc || !isValidIfsc(ifsc)) return 'Enter a valid IFSC code (example: SBIN0001234).';
  }

  if (!upi && !anyBank) {
    return 'Add UPI or complete bank details.';
  }

  if (!upi && anyBank && !hasPayoutDetails(payout)) {
    return 'Complete all bank fields or add a UPI ID instead.';
  }

  return null;
}

export function maskAccountNumber(value: string | null | undefined) {
  if (!value) return '';
  const digits = value.replace(/\s/g, '');
  if (digits.length <= 4) return digits;
  return `•••• ${digits.slice(-4)}`;
}
