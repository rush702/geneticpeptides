# PepAssure Vendor Affiliate Program — Outreach Email Templates

---

## EMAIL 1 — Cold Outreach (First Contact)

**Subject:** PepAssure ranking + 15% affiliate partnership — [Vendor Name]

Hi [First Name],

I'm Joshua, founder of PepAssure (pepassure.com) — an independent AI-powered ranking platform for peptide research vendors.

[Vendor Name] currently ranks **#[X] out of [N] vendors** on our platform, scored daily across purity, COA quality, Reddit sentiment, pricing transparency, and customer service.

We're launching our affiliate partner program and want to invite you in.

**Here's how it works:**

Every time a buyer clicks through from your PepAssure listing and completes a purchase on your site, PepAssure earns **15% of that gross order value**. You pay nothing upfront — commissions are invoiced monthly and only due when sales actually happen.

In return, affiliate partners receive:
- ✅ **Verified Partner badge** on your listing (boosts trust signals significantly)
- ✅ Priority placement consideration in our weekly email digest (12,000+ subscribers)
- ✅ "Claim Listing" access to respond to reviews and update your profile
- ✅ Access to your click and referral analytics dashboard

**Setup takes less than 5 minutes:**

Add this one line to your order confirmation page (after a completed purchase):

```html
<img src="https://pepassure.com/postback?vendor=[your-vendor-id]&order_value={ORDER_TOTAL}" width="1" height="1" style="display:none" />
```

Replace `{ORDER_TOTAL}` with your order total variable — that's all we need. We handle the rest.

Would you be open to a quick call this week, or happy to get started via email?

Best,
Joshua
Founder, PepAssure
pepassure.com | joshua@pepassure.com

---

## EMAIL 2 — Follow-Up (7 Days Later)

**Subject:** Re: PepAssure affiliate program — quick follow-up

Hi [First Name],

Following up on my note from last week about the PepAssure affiliate program.

Quick context: PepAssure currently drives **[X] outbound clicks to [Vendor Name] per month** from buyers actively searching for peptide vendors. These are high-intent visitors — people already on a ranking platform, comparing vendors, ready to buy.

The affiliate program just formalizes that relationship with a 15% commission on completed purchases. No upfront cost, no locked-in contracts, cancel anytime.

If the timing isn't right, no worries — your listing stays up regardless. But if you're interested in the verified partner benefits and the additional exposure, happy to walk you through setup.

Reply here or book 15 minutes: [Calendly link]

Thanks,
Joshua

---

## EMAIL 3 — Partner Already Signed Up (Onboarding Confirmation)

**Subject:** You're live on the PepAssure Affiliate Program 🎉

Hi [First Name],

You're in! Here's your setup checklist:

**1. Add the postback pixel to your order confirmation page:**

```html
<img
  src="https://pepassure.com/postback?vendor=[VENDOR_ID]&order_value={ORDER_TOTAL}&order_id={ORDER_ID}"
  width="1" height="1" style="display:none"
/>
```

Replace:
- `[VENDOR_ID]` → `[their actual vendor ID, e.g. ascension]`
- `{ORDER_TOTAL}` → your platform's order total variable
- `{ORDER_ID}` → your order ID variable (for deduplication)

**2. Your Verified Partner badge is now live** on your PepAssure listing.

**3. Commission schedule:**
- Tracking window: 30 days from click
- Invoice date: 1st of each month for prior month's conversions
- Payment terms: Net 15 via ACH, wire, or Stripe invoice
- Minimum payout: $50 (rolls over if under threshold)

**4. Your affiliate dashboard:**
pepassure.com/partners/[VENDOR_ID] (login with your email)

Commission rate: **15% of gross order value** (before shipping, after refunds)

Questions? Reply directly to this email.

Welcome to the program,
Joshua
PepAssure Partner Team

---

## PROGRAM TERMS SUMMARY (attach as PDF or link)

| Term | Detail |
|------|--------|
| Commission | 15% of gross order value |
| Cookie window | 30 days from click |
| Attribution | Last-click |
| Payment | Monthly, Net 15 |
| Minimum payout | $50 |
| Contract | Month-to-month, cancel anytime |
| Refunds | Commissions reversed on refunded orders |
| Prohibited | Coupon/cashback sites, self-referral, bid on "pepassure" brand terms |

---

## VENDOR TRACKING IDs (reference list)

| Vendor | ID to use in postback |
|--------|-----------------------|
| Ascension Peptides | `ascension` |
| Limitless Life Nootropics | `limitless` |
| Peptide Partners | `peptide_partners` |
| Soma Chems | `soma` |
| Core Peptides | `core_peptides` |
| BPC Labs Australia | `bpc_labs_au` |
| Swiss Chems | `swiss_chems` |
| Pure Rawz | `pure_rawz` |
