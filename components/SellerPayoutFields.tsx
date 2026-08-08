'use client';

import { hasPayoutDetails, maskAccountNumber, type PayoutDetails } from '@/lib/payout';

export default function SellerPayoutFields({
  payout,
  onChange,
}: {
  payout: PayoutDetails;
  onChange: (next: PayoutDetails) => void;
}) {
  const ready = hasPayoutDetails(payout);

  return (
    <div className="space-y-4 pt-2 border-t border-concrete-200">
      <div>
        <h3 className="font-semibold text-sm">Settlement account</h3>
        <p className="text-xs text-graphite-600 mt-1 leading-relaxed">
          Online payments are collected via Razorpay. Add your UPI ID and/or bank account so Buniyaad can
          auto-settle to you (Razorpay Route linking — full automation when enabled on production).
          Required before turning on online payments.
        </p>
        {ready ? (
          <p className="text-xs text-signal-green font-medium mt-2">✓ Payout details saved — ready for settlement</p>
        ) : (
          <p className="text-xs text-amber-800 font-medium mt-2">Add UPI or bank details to enable online pay</p>
        )}
      </div>

      <div>
        <label className="text-xs font-semibold text-graphite-600">UPI ID (recommended)</label>
        <input
          className="input-field mt-1"
          placeholder="yourshop@paytm / @ybl / @oksbi"
          value={payout.upi_id || ''}
          onChange={(e) => onChange({ ...payout, upi_id: e.target.value })}
        />
      </div>

      <p className="text-xs text-graphite-500 text-center">— or bank account —</p>

      <div className="grid sm:grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-semibold text-graphite-600">Account holder name</label>
          <input
            className="input-field mt-1"
            placeholder="As per bank passbook"
            value={payout.account_name || ''}
            onChange={(e) => onChange({ ...payout, account_name: e.target.value })}
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-graphite-600">Bank name</label>
          <input
            className="input-field mt-1"
            placeholder="e.g. SBI, HDFC"
            value={payout.bank_name || ''}
            onChange={(e) => onChange({ ...payout, bank_name: e.target.value })}
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-graphite-600">Account number</label>
          <input
            className="input-field mt-1"
            placeholder="9–18 digits"
            inputMode="numeric"
            value={payout.account_number || ''}
            onChange={(e) => onChange({ ...payout, account_number: e.target.value.replace(/\D/g, '') })}
          />
          {payout.account_number ? (
            <p className="text-[10px] text-graphite-500 mt-1">Saved as {maskAccountNumber(payout.account_number)}</p>
          ) : null}
        </div>
        <div>
          <label className="text-xs font-semibold text-graphite-600">IFSC code</label>
          <input
            className="input-field mt-1 uppercase"
            placeholder="SBIN0001234"
            value={payout.ifsc || ''}
            onChange={(e) => onChange({ ...payout, ifsc: e.target.value.toUpperCase() })}
          />
        </div>
      </div>
    </div>
  );
}
