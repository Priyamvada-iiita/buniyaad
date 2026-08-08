export const BUYER_TYPES = [
  { value: 'individual', label: 'Individual / Ghar owner', hint: 'Apna ghar banane ke liye material' },
  { value: 'contractor', label: 'Thekedar / Civil contractor', hint: 'Chhote-bade construction projects' },
  { value: 'builder', label: 'Builder / Developer', hint: 'Housing or commercial projects' },
  { value: 'tender', label: 'Tender / Works contractor', hint: 'PWD, Panchayat, or govt/private tender work' },
  { value: 'other', label: 'Others', hint: 'Kuch aur — neeche describe karein' },
] as const;

export const SELLER_TYPES = [
  { value: 'cement_dealer', label: 'Cement dealer / Stockist', hint: 'UltraTech, ACC, Shree, etc.' },
  { value: 'building_shop', label: 'Building material shop', hint: 'Local hardware / kirana + material' },
  { value: 'steel_dealer', label: 'Steel / TMT dealer', hint: 'TMT bars, structural steel' },
  { value: 'sand_supplier', label: 'Sand / Bajri supplier', hint: 'Reti, gitti, murram' },
  { value: 'tiles_dealer', label: 'Tiles & sanitary dealer', hint: 'Tiles, plumbing, fittings' },
  { value: 'distributor', label: 'Wholesaler / Distributor', hint: 'Multiple brands, bulk supply' },
  { value: 'other', label: 'Others', hint: 'Apna business type describe karein' },
] as const;

export type BuyerType = (typeof BUYER_TYPES)[number]['value'];
export type SellerType = (typeof SELLER_TYPES)[number]['value'];

export const BIHAR_DISTRICTS = [
  'Arwal', 'Araria', 'Aurangabad', 'Banka', 'Begusarai', 'Bhagalpur', 'Bhojpur', 'Buxar',
  'Darbhanga', 'East Champaran', 'Gaya', 'Gopalganj', 'Jamui', 'Jehanabad', 'Kaimur',
  'Katihar', 'Khagaria', 'Kishanganj', 'Lakhisarai', 'Madhepura', 'Madhubani', 'Munger',
  'Muzaffarpur', 'Nalanda', 'Nawada', 'Patna', 'Purnia', 'Rohtas', 'Saharsa', 'Samastipur',
  'Saran', 'Sheikhpura', 'Sheohar', 'Sitamarhi', 'Siwan', 'Supaul', 'Vaishali', 'West Champaran',
] as const;

export function buyerTypeLabel(value: string) {
  return BUYER_TYPES.find((t) => t.value === value)?.label ?? value;
}

export function sellerTypeLabel(value: string) {
  return SELLER_TYPES.find((t) => t.value === value)?.label ?? value;
}
