'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import BilingualLabel from '@/components/BilingualLabel';
import {
  BUYER_TYPES,
  SELLER_TYPES,
  BIHAR_DISTRICTS,
  type BuyerType,
  type SellerType,
} from '@/lib/profile-types';
import {
  destinationForRole,
  getProfileIdForRole,
  isEmailAlreadyRegistered,
} from '@/lib/profiles';
import { safeNextPath } from '@/lib/redirect';
import { setActiveRole } from '@/lib/session-role';

type FormState = {
  email: string;
  password: string;
  account_type: BuyerType | SellerType | '';
  account_type_description: string;
  contact_name: string;
  business_name: string;
  phone: string;
  district: string;
  city: string;
  pincode: string;
  address: string;
  gstin: string;
};

const initialForm: FormState = {
  email: '',
  password: '',
  account_type: '',
  account_type_description: '',
  contact_name: '',
  business_name: '',
  phone: '',
  district: '',
  city: '',
  pincode: '',
  address: '',
  gstin: '',
};

function SignupForm() {
  const router = useRouter();
  const params = useSearchParams();
  const supabase = createClient();

  const [role, setRole] = useState<'buyer' | 'seller'>(
    (params.get('role') as 'buyer' | 'seller') || 'buyer'
  );
  const [form, setForm] = useState<FormState>(initialForm);
  const [skipDetails, setSkipDetails] = useState(false);
  const [skipOtherDescription, setSkipOtherDescription] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const nextPath = safeNextPath(params.get('next'));

  const buyerType = role === 'buyer' ? (form.account_type as BuyerType) : null;
  const sellerType = role === 'seller' ? (form.account_type as SellerType) : null;
  const types = role === 'buyer' ? BUYER_TYPES : SELLER_TYPES;
  const isOther = form.account_type === 'other';

  const switchRole = (next: 'buyer' | 'seller') => {
    setRole(next);
    setForm({ ...initialForm, account_type: '' });
    setSkipDetails(false);
    setSkipOtherDescription(false);
    setError('');
  };

  const displayName = () => {
    if (form.business_name.trim()) return form.business_name.trim();
    if (form.contact_name.trim()) return form.contact_name.trim();
    if (isOther && form.account_type_description.trim()) {
      return form.account_type_description.trim().slice(0, 60);
    }
    return role === 'seller' ? 'New Seller' : 'New Buyer';
  };

  const isProfileComplete = () =>
    Boolean(
      form.phone.trim() &&
        form.district &&
        form.pincode.trim().length === 6 &&
        (role === 'buyer' || form.address.trim())
    );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!form.account_type) {
      setError('Please select your type.');
      setLoading(false);
      return;
    }

    if (!skipDetails) {
      if (role === 'buyer' && buyerType === 'individual' && !form.contact_name.trim()) {
        setError('Please enter your full name.');
        setLoading(false);
        return;
      }
      if ((role !== 'buyer' || buyerType !== 'individual') && !isOther && !form.business_name.trim()) {
        setError(role === 'seller' ? 'Please enter your shop/dealer name.' : 'Please enter your firm/company name.');
        setLoading(false);
        return;
      }
    }

    if (!form.email.trim() || form.password.length < 6) {
      setError('Email and password (min 6 chars) are required.');
      setLoading(false);
      return;
    }

    const { data, error: signUpError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
    });

    let userId: string | null = data.user?.id ?? null;

    if (signUpError) {
      if (!isEmailAlreadyRegistered(signUpError.message)) {
        setError(signUpError.message);
        setLoading(false);
        return;
      }

      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: form.email,
        password: form.password,
      });

      if (signInError || !signInData.user) {
        setError(
          'This email already has an account. Use the same password to add a ' +
            (role === 'seller' ? 'seller' : 'buyer') +
            ' profile, or log in.'
        );
        setLoading(false);
        return;
      }

      userId = signInData.user.id;
    } else if (!userId) {
      setError('Signup failed');
      setLoading(false);
      return;
    }

    const existingProfileId = await getProfileIdForRole(supabase, userId, role);
    if (existingProfileId) {
      setError(
        `You already have a ${role} account with this email. ` +
          `Please log in and go to ${destinationForRole(role)}.`
      );
      setLoading(false);
      return;
    }

    const { error: profileError } = await supabase.from('profiles').insert({
      user_id: userId,
      role,
      account_type: form.account_type,
      account_type_description:
        isOther && form.account_type_description.trim()
          ? form.account_type_description.trim()
          : null,
      contact_name: form.contact_name.trim() || null,
      business_name: displayName(),
      phone: form.phone.trim() || null,
      district: form.district || null,
      city: form.city.trim() || null,
      pincode: form.pincode.trim() || null,
      address: form.address.trim() || null,
      gstin: form.gstin.trim() || null,
      profile_complete: isProfileComplete(),
    });

    if (profileError) {
      setError(profileError.message);
      setLoading(false);
      return;
    }

    setActiveRole(role);
    router.replace(nextPath || destinationForRole(role));
  };

  const set = (key: keyof FormState, value: string) => setForm({ ...form, [key]: value });

  return (
    <>
      <Navbar />
      <main className="flex-1 max-w-lg mx-auto px-4 py-10 md:py-14 w-full">
        <h1 className="page-title mb-1">CREATE ACCOUNT</h1>
        <p className="text-graphite-600 text-sm mb-6">
          {role === 'buyer'
            ? 'Contractors, builders, tender holders, ya ghar banane wale — sab ke liye.'
            : 'Cement dealers, hardware shops, steel & sand suppliers — list your stock.'}
          <span className="block mt-2 text-xs text-steel-600">
            Same email se buyer aur seller alag-alag register kar sakte hain — password same rahega.
          </span>
        </p>

        <div className="grid grid-cols-2 gap-3 mb-6">
          <button
            type="button"
            onClick={() => switchRole('buyer')}
            className={role === 'buyer' ? 'role-toggle-active' : 'role-toggle-inactive'}
          >
            <BilingualLabel
              primary="Buyer"
              secondary="Material kharidna hai"
              primaryClassName="font-semibold text-sm"
              secondaryClassName={`text-xs ${role === 'buyer' ? 'text-concrete-100' : 'text-graphite-600'}`}
            />
          </button>
            <button
              type="button"
            onClick={() => switchRole('seller')}
            className={role === 'seller' ? 'role-toggle-active' : 'role-toggle-inactive'}
          >
            <BilingualLabel
              primary="Seller"
              secondary="Material bechna hai"
              primaryClassName="font-semibold text-sm"
              secondaryClassName={`text-xs ${role === 'seller' ? 'text-concrete-100' : 'text-graphite-600'}`}
            />
            </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase text-graphite-600 mb-2">
              {role === 'buyer' ? 'Aap kaun hain?' : 'Aap kis type ke seller hain?'}
            </label>
            <div className="grid gap-2">
              {types.map((t) => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => {
                    set('account_type', t.value);
                    if (t.value !== 'other') setSkipOtherDescription(false);
                  }}
                  className={`text-left p-3 rounded-md border text-sm ${
                    form.account_type === t.value
                      ? 'border-rebar-600 bg-rebar-50'
                      : 'border-concrete-300 hover:border-graphite-400'
                  }`}
                >
                  <span className="font-semibold block">{t.label}</span>
                  <span className="text-graphite-600 text-xs">
                    {t.hint}
                    {t.value === 'other' ? ' · Skip / baad mein bhar sakte hain' : ''}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {form.account_type && (
            <>
              {isOther && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <p className="text-xs font-semibold uppercase text-graphite-600">
                      Apna business / requirement (optional)
                    </p>
                    {!skipOtherDescription ? (
                      <button
                        type="button"
                        onClick={() => setSkipOtherDescription(true)}
                        className="skip-link inline-flex items-center gap-0.5"
                      >
                        <BilingualLabel
                          primary="Skip"
                          secondary="Baad mein bharenge"
                          primaryClassName="font-semibold text-xs text-steel-600"
                          secondaryClassName="font-normal text-xs text-steel-600"
                        />
                        <span>→</span>
                      </button>
                    ) : null}
                  </div>
                  {!skipOtherDescription ? (
                    <textarea
                      rows={3}
                      placeholder={
                        role === 'seller'
                          ? 'Apna business describe karein (e.g. PVC pipe wholesaler, Patna) — optional'
                          : 'Aap kya material chahte hain / kaun hain (e.g. Interior designer) — optional'
                      }
                      className="input-field resize-none"
                      value={form.account_type_description}
                      onChange={(e) => set('account_type_description', e.target.value)}
                    />
                  ) : (
                    <div className="card p-3 bg-concrete-50 text-xs text-graphite-600 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <p>Business description baad mein bhi daal sakte hain — koi problem nahi.</p>
                      <button
                        type="button"
                        onClick={() => setSkipOtherDescription(false)}
                        className="text-rebar-600 font-semibold hover:underline shrink-0"
                      >
                        <BilingualLabel
                          primary="Fill now"
                          secondary="Abhi likhenge"
                          primaryClassName="font-semibold text-xs text-rebar-600"
                          secondaryClassName="font-normal text-xs text-rebar-600/80"
                        />
                      </button>
                    </div>
                  )}
                </div>
              )}

              <div className="border-t border-concrete-200 pt-4 space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase text-graphite-600">Login details</p>
                  <span className="text-xs text-rebar-600 font-medium">Required</span>
                </div>
                <input
                  required
                  type="email"
                  placeholder="Email"
                  className="input-field"
                  value={form.email}
                  onChange={(e) => set('email', e.target.value)}
                />
                <input
                  required
                  type="password"
                  placeholder="Password (kam se kam 6 characters)"
                  className="input-field"
                  minLength={6}
                  value={form.password}
                  onChange={(e) => set('password', e.target.value)}
                />
              </div>

              {!skipDetails ? (
                <>
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <p className="text-xs font-semibold uppercase text-graphite-600">Profile details</p>
                    <button type="button" onClick={() => setSkipDetails(true)} className="skip-link inline-flex items-center gap-0.5">
                      <BilingualLabel
                        primary="Skip"
                        secondary="Baad mein bharenge"
                        primaryClassName="font-semibold text-xs text-steel-600"
                        secondaryClassName="font-normal text-xs text-steel-600"
                      />
                      <span>→</span>
                    </button>
                  </div>

                  {role === 'buyer' && buyerType === 'individual' ? (
                    <input
                      placeholder="Pura naam (Full name)"
                      className="input-field"
                      value={form.contact_name}
                      onChange={(e) => set('contact_name', e.target.value)}
                    />
                  ) : (
                    <>
                      <input
                        placeholder={
                          role === 'seller'
                            ? 'Dukan / dealer ka naam (Shop name)'
                            : buyerType === 'contractor'
                            ? 'Thekedar / firm ka naam'
                            : buyerType === 'tender'
                            ? 'Firm / contractor ka naam'
                            : isOther
                            ? 'Business / firm name (optional)'
                            : 'Company / builder ka naam'
                        }
                        className="input-field"
                        value={form.business_name}
                        onChange={(e) => set('business_name', e.target.value)}
                      />
                      <input
                        placeholder="Contact person ka naam (optional)"
                        className="input-field"
                        value={form.contact_name}
                        onChange={(e) => set('contact_name', e.target.value)}
                      />
                    </>
                  )}

                  <input
                    type="tel"
                    inputMode="numeric"
                    maxLength={10}
                    placeholder="Mobile (optional — WhatsApp wala)"
                    className="input-field"
                    value={form.phone}
                    onChange={(e) => set('phone', e.target.value.replace(/\D/g, '').slice(0, 10))}
                  />

                  <div className="grid grid-cols-2 gap-3">
                    <select
                      className="input-field"
                      value={form.district}
                      onChange={(e) => set('district', e.target.value)}
                    >
                      <option value="">District (optional)</option>
                      {BIHAR_DISTRICTS.map((d) => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                    <input
                      placeholder="Pincode (optional)"
                      className="input-field"
                      maxLength={6}
                      inputMode="numeric"
                      value={form.pincode}
                      onChange={(e) => set('pincode', e.target.value.replace(/\D/g, '').slice(0, 6))}
                    />
                  </div>

                  <input
                    placeholder="City / block / area (optional)"
                    className="input-field"
                    value={form.city}
                    onChange={(e) => set('city', e.target.value)}
                  />

                  <input
                    placeholder={
                      role === 'seller' ? 'Shop address (optional)' : 'Site / delivery address (optional)'
                    }
                    className="input-field"
                    value={form.address}
                    onChange={(e) => set('address', e.target.value)}
                  />

                  {(role === 'seller' || buyerType === 'contractor' || buyerType === 'builder' || buyerType === 'tender') && (
                    <input
                      placeholder="GST number (optional)"
                      className="input-field"
                      maxLength={15}
                      value={form.gstin}
                      onChange={(e) => set('gstin', e.target.value.toUpperCase())}
                    />
                  )}
                </>
              ) : (
                <div className="card p-4 bg-concrete-50 text-sm text-graphite-600 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <p>Profile details skipped. Baad mein profile update kar sakte hain.</p>
                  <button
                    type="button"
                    onClick={() => setSkipDetails(false)}
                    className="text-rebar-600 font-semibold hover:underline shrink-0"
                  >
                    <BilingualLabel
                      primary="Fill now"
                      secondary="Abhi bharenge"
                      primaryClassName="font-semibold text-sm text-rebar-600"
                      secondaryClassName="font-normal text-sm text-rebar-600/80"
                    />
                  </button>
                </div>
              )}
            </>
          )}

          {error && <p className="text-signal-red text-sm">{error}</p>}

          <button type="submit" disabled={loading || !form.account_type} className="btn-primary w-full">
            {loading ? 'Account ban raha hai…' : 'Account banayein'}
          </button>

          <p className="text-center text-xs text-graphite-600">
            Already have an account?{' '}
            <Link href="/login" className="font-semibold text-rebar-600">Log in</Link>
          </p>
        </form>
      </main>
      <Footer />
    </>
  );
}

export default function SignupPage() {
  return (
    <Suspense>
      <SignupForm />
    </Suspense>
  );
}
