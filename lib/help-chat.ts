export type HelpMessage = {
  role: 'user' | 'assistant';
  content: string;
};

export type HelpFaq = {
  keywords: string[];
  question: string;
  answer: string;
};

export const HELP_FAQS: HelpFaq[] = [
  {
    keywords: ['order', 'checkout', 'cart', 'buy', 'kharid', 'place order'],
    question: 'How do I place an order?',
    answer:
      'Browse /catalog without login, add items to cart, then sign in at checkout. Enter your delivery address, pick online pay or COD (if the seller offers it), and confirm. Track orders at /buyer/orders.',
  },
  {
    keywords: ['cod', 'cash on delivery', 'cash', 'delivery payment'],
    question: 'What is COD?',
    answer:
      'COD (Cash on Delivery) means you pay when the material arrives. Not every seller offers COD — look for the COD badge on their shop page. Online payment uses Razorpay (UPI/card).',
  },
  {
    keywords: ['seller', 'sell', 'dukan', 'dealer', 'list product', 'shop'],
    question: 'How do I become a seller?',
    answer:
      'Sign up at /signup?role=seller, complete your shop profile at /seller/profile (photos, map, payments), then add products at /seller/dashboard. Buyers will find you on /sellers.',
  },
  {
    keywords: ['rfq', 'requirement', 'quote', 'bulk', 'tender'],
    question: 'What is Post Requirement / RFQ?',
    answer:
      'Buyers post a custom material need at /buyer/rfq (quantity, specs, pincode). Sellers submit price quotes at /seller/rfqs. This is separate from catalog checkout — good for bulk or custom orders.',
  },
  {
    keywords: ['payment', 'razorpay', 'upi', 'card', 'pay', 'online pay'],
    question: 'How does online payment work?',
    answer:
      'At checkout, choose online pay. Razorpay opens for UPI/card. After success, your order status becomes paid. If payment fails or you close the window, the order stays pending_payment until paid.',
  },
  {
    keywords: ['track', 'status', 'dispatch', 'delivered', 'order status'],
    question: 'How do I track my order?',
    answer:
      'Go to /buyer/orders. Status flows: paid → confirmed → dispatched → delivered. COD orders start at confirmed. You can message the seller from the order card after it is placed.',
  },
  {
    keywords: ['rating', 'rate', 'review', 'certified'],
    question: 'How do shop ratings work?',
    answer:
      'After delivery, rate the seller from /buyer/orders. Only buyers who actually ordered from that shop can leave a certified review. Public shop pages show certified buyer ratings.',
  },
  {
    keywords: ['chat', 'message', 'contact seller', 'call', 'phone'],
    question: 'How do I contact a seller?',
    answer:
      'On a seller shop page, tap their phone number to call. After placing an order, use order chat on /buyer/orders or /seller/orders to text about that specific order.',
  },
  {
    keywords: ['login', 'signup', 'account', 'register', 'password'],
    question: 'Do I need an account to browse?',
    answer:
      'No — catalog and seller directory are free to browse. You need an account to checkout, post RFQs, or sell. One email can have both buyer and seller profiles.',
  },
  {
    keywords: ['role', 'switch', 'buyer and seller', 'both'],
    question: 'I have buyer and seller accounts — how do I switch?',
    answer:
      'Use “Switch to buyer/seller” in the top menu, or visit /choose-role. Only one mode is active at a time — sellers cannot add to cart while in seller mode.',
  },
  {
    keywords: ['pincode', 'delivery', 'bihar', 'area', 'location', 'district'],
    question: 'Do you deliver across Bihar?',
    answer:
      'Sellers set delivery coverage once in Shop Studio → Storefront: All Bihar, their district, local city, or selected districts. Buyers filter catalog by district. Shop pincode is just the shop address — not per product.',
  },
  {
    keywords: ['payout', 'settlement', 'bank account', 'upi id', 'receive payment', 'payment account'],
    question: 'How do sellers receive online payments?',
    answer:
      'Sellers add UPI ID and/or bank account in Shop Studio → Payments. This is required before online pay is enabled. Money is collected via Razorpay; settlement uses these details (full auto-split via Razorpay Route when enabled on production).',
  },
  {
    keywords: ['verified', 'aadhaar', 'trust', 'fake'],
    question: 'What does Verified mean?',
    answer:
      'Verified sellers are reviewed by Buniyaad admin. Some shops also show Aadhaar verified or certificate on file. Certified ratings come from real buyers who completed orders.',
  },
];

export const FAQ_QUICK_PICKS = HELP_FAQS.slice(0, 6).map((f) => f.question);

const SYSTEM_PROMPT = `You are Buniyaad Help, a friendly assistant for Buniyaad — a Bihar building-material marketplace (cement, TMT, sand, etc.).
Answer briefly in plain English. Mix simple Hindi/Hinglish only if the user writes in Hindi.
Topics: browsing catalog, cart, checkout, COD vs online pay, buyer/seller signup, shop profile, RFQs/quotes, order tracking, ratings, order chat.
Do not invent prices, inventory, or policies. If unsure, say to contact the seller or Buniyaad support.
Keep answers under 120 words.`;

export function findFaqAnswer(message: string, minScore = 4): HelpFaq | null {
  const lower = message.toLowerCase().trim();
  if (!lower) return null;

  let best: { faq: HelpFaq; score: number } | null = null;
  for (const faq of HELP_FAQS) {
    let score = 0;
    for (const kw of faq.keywords) {
      if (lower.includes(kw.toLowerCase())) score += kw.length;
    }
    if (faq.question.toLowerCase().includes(lower) || lower.includes(faq.question.toLowerCase().slice(0, 12))) {
      score += 20;
    }
    if (score > 0 && (!best || score > best.score)) best = { faq, score };
  }
  if (!best || best.score < minScore) return null;
  return best.faq;
}

export function getHelpSystemPrompt() {
  return SYSTEM_PROMPT;
}

export const FAQ_FALLBACK_REPLY =
  'Main Buniyaad help hoon. Orders, payments, seller setup, ya RFQ ke baare mein poochho — ya neeche se ek sawal chuno.';

export const LLM_DOWN_REPLY =
  '🤖 Sorry — our robot is feeling sick today. The AI brain (LLM) is down right now, so I can only answer common Buniyaad questions.\n\nNeeche se ek topic chuno, ya orders / payments / sellers ke baare mein seedha poochho.';
