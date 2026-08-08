-- ============================================================
-- Demo sellers + products (optional — run after reset_and_install.sql)
--
-- Safe to re-run: uses ON CONFLICT, no TRUNCATE/DELETE
-- Login: *@buniyaad.demo  /  password: Demo@1234
-- ============================================================

-- Demo auth users (skip if already exist)
insert into auth.users (
  id, instance_id, aud, role, email, encrypted_password,
  email_confirmed_at, created_at, updated_at,
  raw_app_meta_data, raw_user_meta_data, confirmation_token
) values
  ('a1000001-0000-4000-8000-000000000001', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
   'shivam-cement@buniyaad.demo', crypt('Demo@1234', gen_salt('bf')), now(), now(), now(),
   '{"provider":"email","providers":["email"]}', '{}', ''),
  ('a1000002-0000-4000-8000-000000000002', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
   'gaya-steel@buniyaad.demo', crypt('Demo@1234', gen_salt('bf')), now(), now(), now(),
   '{"provider":"email","providers":["email"]}', '{}', ''),
  ('a1000003-0000-4000-8000-000000000003', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
   'munger-mart@buniyaad.demo', crypt('Demo@1234', gen_salt('bf')), now(), now(), now(),
   '{"provider":"email","providers":["email"]}', '{}', ''),
  ('a1000004-0000-4000-8000-000000000004', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
   'vaishali-sand@buniyaad.demo', crypt('Demo@1234', gen_salt('bf')), now(), now(), now(),
   '{"provider":"email","providers":["email"]}', '{}', ''),
  ('a1000005-0000-4000-8000-000000000005', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
   'muzaffarpur-tiles@buniyaad.demo', crypt('Demo@1234', gen_salt('bf')), now(), now(), now(),
   '{"provider":"email","providers":["email"]}', '{}', ''),
  ('a1000006-0000-4000-8000-000000000006', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
   'bhagalpur-hardware@buniyaad.demo', crypt('Demo@1234', gen_salt('bf')), now(), now(), now(),
   '{"provider":"email","providers":["email"]}', '{}', '')
on conflict (id) do update set
  email = excluded.email,
  encrypted_password = excluded.encrypted_password,
  email_confirmed_at = excluded.email_confirmed_at,
  updated_at = now();

-- Demo identities (only if missing)
insert into auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
select
  gen_random_uuid(),
  u.id,
  u.id::text,
  jsonb_build_object('sub', u.id::text, 'email', u.email, 'email_verified', true, 'phone_verified', false),
  'email',
  now(),
  now(),
  now()
from auth.users u
where u.email like '%@buniyaad.demo'
  and not exists (
    select 1 from auth.identities i
    where i.user_id = u.id and i.provider = 'email'
  );

-- Demo seller profiles (user_id = id for demo sellers)
insert into profiles (id, user_id, role, account_type, contact_name, business_name, phone, district, city, pincode, address, verified, profile_complete) values
  ('a1000001-0000-4000-8000-000000000001', 'a1000001-0000-4000-8000-000000000001', 'seller', 'cement_dealer', 'Rajesh Kumar', 'Shivam Cement House [DEMO]', '9876543210', 'Patna', 'Kankarbagh', '800020', 'Main Road, Kankarbagh, Patna', true, true),
  ('a1000002-0000-4000-8000-000000000002', 'a1000002-0000-4000-8000-000000000002', 'seller', 'steel_dealer', 'Amit Singh', 'Gaya TMT & Steel Traders [DEMO]', '9876543211', 'Gaya', 'Bodhgaya Road', '823001', 'NH-83, Gaya', true, true),
  ('a1000003-0000-4000-8000-000000000003', 'a1000003-0000-4000-8000-000000000003', 'seller', 'building_shop', 'Suresh Yadav', 'Munger Building Material Mart [DEMO]', '9876543212', 'Munger', 'Jamalpur', '811201', 'Jamalpur Chowk, Munger', true, true),
  ('a1000004-0000-4000-8000-000000000004', 'a1000004-0000-4000-8000-000000000004', 'seller', 'sand_supplier', 'Vikash Prasad', 'Vaishali Sand & Bajri Suppliers [DEMO]', '9876543213', 'Vaishali', 'Hajipur', '844101', 'Sarai, Hajipur', true, true),
  ('a1000005-0000-4000-8000-000000000005', 'a1000005-0000-4000-8000-000000000005', 'seller', 'tiles_dealer', 'Neha Sharma', 'Muzaffarpur Tiles Gallery [DEMO]', '9876543214', 'Muzaffarpur', 'Motijheel', '842001', 'Motijheel Road', true, true),
  ('a1000006-0000-4000-8000-000000000006', 'a1000006-0000-4000-8000-000000000006', 'seller', 'building_shop', 'Ravi Kant', 'Bhagalpur Hardware Hub [DEMO]', '9876543215', 'Bhagalpur', 'Adampur', '812001', 'Adampur, Bhagalpur', true, true)
on conflict (id) do update set
  business_name = excluded.business_name,
  verified = excluded.verified,
  profile_complete = excluded.profile_complete;

-- Demo products — category_id by slug
insert into products (id, seller_id, category_id, name, description, unit, price, stock, pincode, active) values
  ('b1000001-0000-4000-8000-000000000001', 'a1000001-0000-4000-8000-000000000001', (select id from categories where slug = 'cement-ppc'), 'UltraTech PPC Cement 50kg', 'Premium PPC, ISI marked', 'bag', 385.00, 500, '800020', true),
  ('b1000002-0000-4000-8000-000000000002', 'a1000001-0000-4000-8000-000000000001', (select id from categories where slug = 'cement-ppc'), 'ACC Gold PPC Cement 50kg', 'All-weather PPC cement', 'bag', 372.00, 320, '800020', true),
  ('b1000003-0000-4000-8000-000000000003', 'a1000001-0000-4000-8000-000000000001', (select id from categories where slug = 'cement-opc'), 'Shree Cement OPC 53 Grade', 'High strength OPC 53', 'bag', 410.00, 180, '800020', true),
  ('b1000004-0000-4000-8000-000000000004', 'a1000002-0000-4000-8000-000000000002', (select id from categories where slug = 'tmt-8-12'), 'TATA Tiscon TMT 12mm', 'Fe 550D, per rod', 'piece', 685.00, 200, '823001', true),
  ('b1000005-0000-4000-8000-000000000005', 'a1000002-0000-4000-8000-000000000002', (select id from categories where slug = 'tmt-16-25'), 'SAIL TMT Bar 16mm', 'ISI marked TMT', 'piece', 1180.00, 150, '823001', true),
  ('b1000006-0000-4000-8000-000000000006', 'a1000002-0000-4000-8000-000000000002', (select id from categories where slug = 'tmt-16-25'), 'Jindal Panther TMT 20mm', 'Earthquake resistant', 'piece', 1850.00, 90, '823001', true),
  ('b1000007-0000-4000-8000-000000000007', 'a1000003-0000-4000-8000-000000000003', (select id from categories where slug = 'red-brick'), 'First Class Red Brick', 'Standard 9x4x3 inch', 'piece', 9.50, 10000, '811201', true),
  ('b1000008-0000-4000-8000-000000000008', 'a1000003-0000-4000-8000-000000000003', (select id from categories where slug = 'fly-ash-brick'), 'Fly Ash Brick 4 inch', 'Eco-friendly, light weight', 'piece', 6.80, 8000, '811201', true),
  ('b1000009-0000-4000-8000-000000000009', 'a1000003-0000-4000-8000-000000000003', (select id from categories where slug = 'interior-paint'), 'Asian Paints Apex Ultima 20L', 'Exterior emulsion', 'piece', 4850.00, 25, '811201', true),
  ('b1000010-0000-4000-8000-000000000010', 'a1000004-0000-4000-8000-000000000004', (select id from categories where slug = 'river-sand'), 'River Sand (Reti)', 'Fine quality river sand', 'cubic_ft', 55.00, 200, '844101', true),
  ('b1000011-0000-4000-8000-000000000011', 'a1000004-0000-4000-8000-000000000004', (select id from categories where slug = 'm-sand'), 'M-Sand (Manufactured)', 'Washed M-sand', 'cubic_ft', 42.00, 300, '844101', true),
  ('b1000012-0000-4000-8000-000000000012', 'a1000004-0000-4000-8000-000000000004', (select id from categories where slug = 'bajri-gitti'), '20mm Bajri / Gitti', 'Coarse aggregate', 'cubic_ft', 48.00, 250, '844101', true),
  ('b1000013-0000-4000-8000-000000000013', 'a1000005-0000-4000-8000-000000000005', (select id from categories where slug = 'floor-tiles'), 'Kajaria Floor Tile 2x2 ft', 'Glazed vitrified', 'sq_ft', 42.00, 1200, '842001', true),
  ('b1000014-0000-4000-8000-000000000014', 'a1000005-0000-4000-8000-000000000005', (select id from categories where slug = 'vitrified'), 'Somany PGVT Tile 600x600', 'Premium vitrified', 'sq_ft', 58.00, 800, '842001', true),
  ('b1000015-0000-4000-8000-000000000015', 'a1000005-0000-4000-8000-000000000005', (select id from categories where slug = 'cpvc-upvc'), 'Supreme CPVC Pipe 1 inch', 'Hot & cold water pipe', 'piece', 285.00, 400, '842001', true),
  ('b1000016-0000-4000-8000-000000000016', 'a1000006-0000-4000-8000-000000000006', (select id from categories where slug = 'wires-cables'), 'Polycab House Wire 1.5 sq mm', 'FR PVC insulated, 90m coil', 'piece', 1650.00, 60, '812001', true),
  ('b1000017-0000-4000-8000-000000000017', 'a1000006-0000-4000-8000-000000000006', (select id from categories where slug = 'hand-tools'), 'Mason Tool Kit (5 pcs)', 'Trowel, plumb, line', 'piece', 450.00, 35, '812001', true),
  ('b1000018-0000-4000-8000-000000000018', 'a1000006-0000-4000-8000-000000000006', (select id from categories where slug = 'ply-laminate'), 'CenturyPly Sainik 19mm', 'BWP grade plywood', 'sq_ft', 95.00, 200, '812001', true),
  ('b1000019-0000-4000-8000-000000000019', 'a1000006-0000-4000-8000-000000000006', (select id from categories where slug = 'gi-sheets'), 'TATA BlueScope Colour Sheet', '0.45mm profile sheet', 'sq_ft', 78.00, 500, '812001', true)
on conflict (id) do update set
  name = excluded.name,
  price = excluded.price,
  stock = excluded.stock,
  active = excluded.active,
  category_id = excluded.category_id;
