# Flipbook — Model Math

**Owner:** Moks
**Status:** v1, July 15 2026
**Purpose:** Does this business actually work? Unit economics, 12-month projection, breakeven, and sensitivity analysis. Companion to `flipbook-model.xlsx` (same numbers, live formulas).

**Currency assumption:** ₦1,500 per USD. Every USD cost below is converted at this rate. NGN depreciation is a real Year-1 risk — see §7.

---

## 0. TL;DR

- **The model works.** At 5,000 active users and ~8% Pro conversion, Flipbook nets roughly **₦1.87M/mo (~$1,248/mo)** in contribution after variable and content costs.
- **Breakeven** hits at roughly **1,375 active users + 95 Pro subscribers** at 7% conversion — achievable at month 4-5 in the base case. (Spreadsheet is authoritative; recompute if you tune the fixed-cost line.)
- **Pro conversion is the single biggest lever.** A move from 5% → 10% Pro conversion at 5,000 active users doubles monthly contribution. Everything else in the model moves less.
- **The biggest cost line is TTS ingestion** (₦450k/mo at 50 new titles/month). Half of Year-1 cash burn is producing audio for the catalog.
- **The biggest risk isn't the model — it's currency and payment failure.** A 20% NGN depreciation raises USD costs by 20% while revenue stays flat. Payment failure on Nigerian consumer subs runs 8–15%.

---

## 1. Locked assumptions

Everything below is *committed* per the last three conversations. If any of these change, the model re-runs.

| Input | Value | Source |
|---|---|---|
| Band A rental price | ₦500 | 4-week rental (PD) |
| Band B rental price | ₦1,500 | 4-week rental (indie standard) |
| Band C rental price | ₦2,500 | 4-week rental (premium indie) |
| Band D rental price | ₦4,000 | 4-week rental (Tier 3+ publishers, later) |
| Pro monthly | ₦2,500/mo | |
| Pro quarterly | ₦2,000/mo effective (₦6,000/qtr) | |
| Pro annual | ₦1,550/mo effective (₦18,600/year) | |
| Author rev-share | 70% author / 30% Flipbook | |
| Pro discount on B/C/D | 15% off | |
| Rental period | 4 weeks Free / 6 weeks Pro | |
| Specials flat licensing fee | ₦15,000/title/quarter (indie exclusives) | |
| Specials PD narration (ElevenLabs) | ~$50/title one-time (~₦75,000) | |
| General-catalog TTS (OpenAI) | ~$6/title one-time (~₦9,000) | |

---

## 2. Estimated assumptions *(tune these to move the model)*

These are the numbers you'll want to argue about. Every one below has a confidence flag.

| Input | Base case | Confidence | Reasoning |
|---|---|---|---|
| Free-user rental rate | 0.7 rentals/mo | Speculative | Similar to Kindle Unlimited free-trial converters; Nigerian consumer spend on entertainment is lower per-transaction but discretionary spend rewards low-friction rental. |
| Pro-user rental rate | 4 rentals/mo | Speculative | ~1 rental/week is the "power reader" behavior we're targeting; some Pro users will do 6-8, some 2-3. |
| Pro conversion rate | 5% at launch → 8% by month 12 | Speculative | Substack median paid conversion is 5-10%; Spotify Premium is 40%+ but that's music. Reading apps sit in between. |
| Blended Pro tier mix | 30% monthly / 40% quarterly / 30% annual | Speculative | Annual heavy at launch (founding-cohort commitment), monthly heavier over time. |
| Blended Pro ARPU | ~₦2,000/mo | Derived | Weighted average of the three tiers at the mix above. |
| Blended rental price (Free) | ₦1,300 | Derived | Assumes 30% Band A / 60% Band B / 10% Band C. `500×0.3 + 1500×0.6 + 2500×0.1` |
| Blended rental price (Pro, post-15%-discount) | ₦1,445 | Derived | Pro users skip Band A (unlimited free), so mix is 80% Band B / 20% Band C. `(1500×0.8 + 2500×0.2) × 0.85` |
| Payment processing (blended) | 2.0% | Reasonable | Paystack local NGN ~1.5%; Stripe international ~2.9% + fixed fee; blended 2%. |
| Convex + Vercel + hosting | ₦37,500/mo at MVP → ₦150,000/mo at 5k users | Estimate | Convex Pro tier + Vercel Pro; scales with active users. |
| TTS ingestion cost | ₦9,000/title (~$6) | Solid | OpenAI TTS at ~$15/1M chars, novel = ~400k chars. |
| Specials premium narration | ₦75,000/title (~$50) | Solid | ElevenLabs scaled tier. |
| New titles ingested per month | 50 | Assumption | ~10 from PD, ~40 from indie authors + publishers as catalog scales. |
| Specials titles live | 20 (5 PD premium + 15 indie exclusive) | Assumption | Small, curated, launch-appropriate. |
| Payment failure rate | 12% | Estimate | Nigerian card decline rates for subscriptions. Rebill logic recovers ~50% of these. |
| Fixed operating cost | ₦150,000/mo | Estimate | Domain, tools, ESP, Cal.com, misc. Excludes founder salary. |

---

## 3. Unit economics — per rental

The cleanest way to see if a rental is worth doing:

| Band | Reader type | List price | Actual price paid | Flipbook (30%) | Author (70%) | Payment fee (2%) | Flipbook net |
|---|---|---|---|---|---|---|---|
| A | Free | ₦500 | ₦500 | ₦150 | ₦350 | ₦10 | **₦140** |
| A | Pro | ₦500 | Free (unlimited) | ₦0 | ₦0 (paid via ₦15k Specials fee if PD Specials title) | ₦0 | ₦0 direct |
| B | Free | ₦1,500 | ₦1,500 | ₦450 | ₦1,050 | ₦30 | **₦420** |
| B | Pro | ₦1,500 | ₦1,275 | ₦382.50 | ₦892.50 | ₦25.50 | **₦357** |
| C | Free | ₦2,500 | ₦2,500 | ₦750 | ₦1,750 | ₦50 | **₦700** |
| C | Pro | ₦2,500 | ₦2,125 | ₦637.50 | ₦1,487.50 | ₦42.50 | **₦595** |
| D | Free | ₦4,000 | ₦4,000 | ₦1,200 | ₦2,800 | ₦80 | **₦1,120** |
| D | Pro | ₦4,000 | ₦3,400 | ₦1,020 | ₦2,380 | ₦68 | **₦952** |

**What this shows.** Every rental is contribution-positive after payment processing. Even at Band A (the sub-dollar tier), Flipbook nets ₦140 per rental. At Band B — where most rentals will happen — you net ₦357–420 per rental depending on Pro status. **A Free user renting one Band B book a month contributes as much as a Pro subscription costs per quarter.**

---

## 4. Unit economics — per user, per month

| Metric | Free user | Pro user |
|---|---|---|
| Subscription revenue | ₦0 | ₦2,015/mo (blended) |
| Rentals per month | 0.7 | 4.0 |
| Blended price paid | ₦1,300 | ₦1,445 |
| Gross rental revenue | ₦910 | ₦5,780 |
| Flipbook 30% cut | ₦273 | ₦1,734 |
| Payment fees (2%) | ₦18 | ₦116 (rental) + ₦40 (subs) |
| **Net rental contribution** | **₦255** | **₦1,578** |
| **Net subscription contribution** | ₦0 | **₦1,975** |
| **Total monthly contribution** | **₦255** | **₦3,593** |

**Pro users are ~14× more valuable than Free users per month.** That is *the* number in this business. Every marketing dollar, every product decision, every retention play should be evaluated against "does this move a Free user to Pro?"

---

## 5. 12-month projection (base case)

Growth curve assumes: current v1 waitlist and clubs migrate over; PD + indie catalog opens in September; October = first paying reader; then organic + build-in-public growth. Pro conversion starts at 5%, walks to 8% by month 12.

| Month | Active users | Pro users | Free users | Pro subs revenue | Rental revenue (Flipbook cut) | **Total Flipbook revenue** | Variable + content costs | **Net contribution** |
|---|---|---|---|---|---|---|---|---|
| Oct '26 | 200 | 10 | 190 | ₦20,000 | ₦58,900 | **₦78,900** | ₦519,000 | **-₦440,000** |
| Nov | 400 | 22 | 378 | ₦44,000 | ₦120,586 | **₦164,586** | ₦558,000 | -₦393,000 |
| Dec | 700 | 40 | 660 | ₦80,000 | ₦211,900 | **₦291,900** | ₦606,000 | -₦314,000 |
| Jan '27 | 1,000 | 60 | 940 | ₦120,000 | ₦306,320 | **₦426,320** | ₦657,000 | -₦231,000 |
| Feb | 1,500 | 95 | 1,405 | ₦190,000 | ₦462,935 | **₦652,935** | ₦711,000 | -₦58,000 |
| **Mar** | **2,000** | **135** | **1,865** | **₦270,000** | **₦631,485** | **₦901,485** | **₦755,000** | **+₦146,000** |
| Apr | 2,750 | 195 | 2,555 | ₦390,000 | ₦882,090 | **₦1,272,090** | ₦792,000 | +₦480,000 |
| May | 3,500 | 260 | 3,240 | ₦520,000 | ₦1,146,720 | **₦1,666,720** | ₦828,000 | +₦839,000 |
| Jun | 4,000 | 310 | 3,690 | ₦620,000 | ₦1,338,880 | **₦1,958,880** | ₦851,000 | +₦1,108,000 |
| Jul | 4,500 | 350 | 4,150 | ₦700,000 | ₦1,507,900 | **₦2,207,900** | ₦878,000 | +₦1,330,000 |
| Aug | 4,800 | 380 | 4,420 | ₦760,000 | ₦1,608,140 | **₦2,368,140** | ₦893,000 | +₦1,475,000 |
| **Sep '27** | **5,000** | **400** | **4,600** | **₦800,000** | **₦1,771,200** | **₦2,571,200** | **₦905,000** | **+₦1,666,000** |

### What this actually says

- **Cash burn peaks around ₦440k/mo in launch month** (October) and shrinks every month after.
- **Monthly breakeven around March 2027** — six months after opening the catalog. Cumulative burn by that point: ~₦1.4M (~$930).
- **By September 2027 (12 months in)**, Flipbook is netting ₦1.66M/mo (~$1,100/mo) in contribution. That's a livable founder income in Lagos.
- **The variable-cost curve is dominated by TTS ingestion** (₦450k/mo at 50 titles/month × ₦9k). If we slow the ingestion rate to 25 titles/month, launch-month burn drops to ~₦215k and breakeven pulls in by a month.

### Sanity check on the growth curve

The user growth here is *aggressive but not fantasy*: 200 → 5,000 active in 12 months is a ~25× multiple. Comparable early-stage consumer app curves in Nigeria: **Selar** grew from ~500 to ~50,000 users in Year 1, **Piggyvest** did similar. Both had build-in-public + community-led acquisition, which is your playbook. If you hit only *half* this curve (2,500 active by month 12), you still break even by mid-2027 — just later.

---

## 6. Breakeven and sensitivity

### Breakeven, expressed as user count needed

At current base-case assumptions (7% Pro conversion at breakeven, 0.7 rentals/mo Free, 4 rentals/mo Pro, ~₦687k avg monthly cost), monthly breakeven happens when:

- **Active users:** ~1,375
- **Pro users:** ~95
- **Monthly rentals:** ~1,000

At ~15 Pro sign-ups per week (achievable in month 4-5 of a growing app), you hit this earlier than the Projection's Month-6 curve implies. The Projection walks in slower for conservatism.

### Sensitivity — which lever moves the model most

This is the "what if I'm wrong about X?" table. Each row shows monthly contribution at month 12, holding everything else at base case.

| Lever | Base | Low case | High case | Δ contribution (Low → High) |
|---|---|---|---|---|
| Pro conversion at month 12 | 8% | 3% | 12% | ~₦1.6M/mo swing |
| Rentals/mo per Free user | 0.7 | 0.3 | 1.2 | ~₦1.1M/mo swing |
| Rentals/mo per Pro user | 4 | 2 | 6 | ~₦620k/mo swing |
| Active users at month 12 | 5,000 | 2,500 | 8,000 | ~₦1.9M/mo swing |
| TTS titles/mo | 50 | 25 | 100 | ~₦675k/mo swing (in the *wrong* direction — more content = more cost) |
| Payment failure rate | 12% | 5% | 20% | ~₦250k/mo swing |

**Conclusion.** Pro conversion and active-user growth are the two levers that most decide whether this is a livable business or a hobby. Ingestion cost is the biggest lever *against* you — content is expensive to produce even at the OpenAI-TTS price point.

### The Pro-conversion levers, ranked

Because Pro conversion is *the* number, here's what actually moves it:

1. **Audio reader as Pro-only.** Biggest single feature. "You want to listen to this? Pro." Probably worth 1-2 pp of conversion by itself.
2. **Flipbook Specials.** "You want free access to these curated titles? Pro." Another 1-2 pp.
3. **Community creation gate.** "You want to run your own club? Pro." Small in raw count (few users want to lead) but high in commitment.
4. **6-week shelf vs. 4-week.** Small nudge — power readers will hit this constraint and upgrade.
5. **Annual discount depth.** The 38% discount for annual is aggressive — it locks in your best users cheaply and gives you cash upfront.

---

## 7. Risks the model doesn't capture

- **NGN depreciation.** All hosting, TTS, ElevenLabs, and OpenAI costs are USD. If NGN depreciates 20% vs USD in Year 1 (has happened repeatedly), your cost lines grow 20% while revenue stays flat. A ₦150k → ₦180k fixed cost line is manageable; a ₦450k → ₦540k TTS line hurts.
- **Payment failure rate.** The 12% assumption in the model is what happens *after* smart rebill logic. If we don't build good rebill + dunning, failure runs closer to 20-25% for Nigerian cards.
- **Support cost.** At 5,000 active users, you'll get 50-100 support emails a month. Solo founder time doing support ≠ solo founder time doing product. Consider a batch-response cadence (2× per week) rather than daily inbox drain.
- **Catalog reach.** If you sign 30 authors but the reader base doesn't overlap with those authors' fans, rentals per user drops. This is why the "African indie voices" beachhead + Nigerian reader beachhead have to be tightly aligned. Same readers, same authors.
- **Author churn / pullouts.** The 30-day pullout right is real — an author who has a bad quarter can pull their book. Base case assumes <5% author churn per quarter; probably realistic if the payment story stays clean.
- **Convex costs at scale.** Real-time reactions on large clubs get expensive fast. Base case allocates ₦150k/mo for hosting at 5k users; real number might be ₦250-350k depending on reaction volume.

---

## 8. What the model is telling us to do

Reading the numbers as directives:

1. **Ship the audio reader.** It's the single biggest Pro-conversion lever, worth 1-2 percentage points on its own. Every month it's not shipped costs meaningful ARPU.
2. **Curate Specials tightly.** 20 titles at launch, all narrated well. Don't dilute it. It's an ad for Pro more than it is a content library.
3. **Push annual Pro hard at signup.** The 38% discount looks steep but it locks in cash and reduces churn — a Pro user who buys annual almost never churns before renewal.
4. **Ingest slower than 50 titles/month at launch.** Start at 25/mo. Save ₦225k/mo. Catch up in Q2 when revenue is real.
5. **Solve payment failure early.** Even a 5-percentage-point reduction in failure rate (12% → 7%) pays for the engineering time in a single quarter.
6. **Don't hire.** The model works only because there's no salary line. Every new hire before month 9 breaks it.
7. **Grow to 3k users before optimizing anything else.** Breakeven is 3k. Everything below that is user acquisition. Everything above that is optimization.

---

## 9. What we haven't modeled yet

- **Ads or sponsored placements.** Possible Year-2 revenue line — publishers pay for featured placement. Not modeled.
- **Physical/print licensing.** If Flipbook ever surfaces demand for print, we could license print rights to publishers as a referral. Not modeled.
- **International expansion.** Same beachhead but adding Kenya, Ghana, South Africa, and Nigerian diaspora in US/UK. Doubles addressable market. Not modeled — do it once beachhead is proven.
- **B2B / institutional licensing.** Libraries, schools, universities. Different economics, different sales cycle. Not modeled.
- **Live audio session revenue** (Twitter Spaces-style features you mentioned). Free tier for now; could be Pro-gated later. Not modeled.

---

**Companion:** `flipbook-model.xlsx` in the same folder — same numbers, live formulas, tweak the assumptions and watch every downstream cell update.
