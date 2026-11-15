/* Case study content that's rendered from data — edit copy here.
   Sticky-note colours live in docs/case-study.css (--s1 … --s6, --s0 for "other"). */

/* Research participants (sticky-board columns). */
export const people = {
  P1: { name: "Mother of two", tint: "#FFE6EA" },
  P2: { name: "Father of a 3-year-old", tint: "#DFF0FF" },
  P3: { name: "Big-family traveller", tint: "#E7F6EC" },
};

/* Insight legend. id 0 = "Other observations". */
export const legend = [
  { id: 1, label: "The routine is the itinerary" },
  { id: 2, label: "Dozens of small checks, per person" },
  { id: 3, label: "Booking is split by trust" },
  { id: 4, label: "Certain bookings, flexible days" },
  { id: 5, label: "Planning is staged and shared" },
  { id: 6, label: "People trust people, not listings" },
  { id: 0, label: "Other observations" },
];

/* Every sticky note: person, insight (0 = other), text. Order = board order. */
export const notes = [
  { person: "P1", insight: 5, text: "Dates come first: school holidays, then the place, then a climate check" },
  { person: "P1", insight: 5, text: "Plans about 3 months out: trains 2 months ahead, then itinerary, then hotels" },
  { person: "P1", insight: 1, text: "Won't book a 5 AM flight — “the kids won't even wake up”" },
  { person: "P1", insight: 2, text: "Elders need pure veg: rice and dal" },
  { person: "P1", insight: 2, text: "King bed, a room to run around, a kids' pool" },
  { person: "P1", insight: 4, text: "Pre-booked a buggy so the elders walk less" },
  { person: "P1", insight: 3, text: "Flights on HDFC SmartBuy, hotels on MMT, cab via agent, cruise on the official site" },
  { person: "P1", insight: 3, text: "Trusts MMT for hotels, not for cabs" },
  { person: "P1", insight: 4, text: "Looks for easy cancellation" },
  { person: "P1", insight: 4, text: "Cab through an agent because plans change on the day" },
  { person: "P1", insight: 5, text: "Girls' trip: 3 friends fixed place and dates, split bookings on WhatsApp" },
  { person: "P1", insight: 6, text: "Picks services based on what friends say" },

  { person: "P2", insight: 1, text: "Left at 3 AM so his daughter slept through the 5-hour journey" },
  { person: "P2", insight: 1, text: "Called the hotel for an 11 AM check-in so she could nap" },
  { person: "P2", insight: 1, text: "Chose the car over flying: door to door, and her motion sickness" },
  { person: "P2", insight: 2, text: "Plain food for her — found khichdi nearby" },
  { person: "P2", insight: 6, text: "Picks hotels on MMT by reviews" },
  { person: "P2", insight: 3, text: "Called the hotel directly for special requests" },
  { person: "P2", insight: 4, text: "Rented a Vespa at the hotel, on the spot" },
  { person: "P2", insight: 5, text: "Planned 2 weeks ahead, Fri–Sun around work" },
  { person: "P2", insight: 0, text: "Used AI for an unfamiliar trip — asked it to plan stops" },
  { person: "P2", insight: 0, text: "Skips AI for places he already knows" },

  { person: "P3", insight: 3, text: "A travel agent plans the itinerary and books cabs" },
  { person: "P3", insight: 3, text: "Finds MMT unreliable at times, so books directly" },
  { person: "P3", insight: 6, text: "Researches places on YouTube" },
  { person: "P3", insight: 6, text: "MMT suggested a Goa activity — YouTube showed it wasn't as described" },
  { person: "P3", insight: 6, text: "Doesn't trust a suggestion until he's seen it himself" },
  { person: "P3", insight: 2, text: "Big group: everyone's needs have to fit one plan" },
];

/* Insights → principles → screens. Row order follows the principles (01–06). */
export const insights = [
  {
    insight: 1,
    title: "The routine is the itinerary",
    evidence: "A dad left at 3 AM so his daughter slept through the journey, then called ahead for an 11 AM check-in so she could nap.",
    need: "“I need my child rested and happy, so the whole family can enjoy the trip.”",
    principle: "Plan around routines",
    line: "Naps, meals and pace set the timings — not the other way round.",
    screen: "assets/screens/h03b-daughter-understood.png",
    alt: "Myra chat: the parent describes their daughter's naps and car sickness, and Myra shows what it understood as removable chips.",
    caption: "H03b · Myra asks about each person",
  },
  {
    insight: 2,
    title: "Dozens of small checks, per person",
    evidence: "Pure veg for the elders, a king bed and a kids' pool, a buggy so no one walks too far — all kept in the parent's head.",
    need: "“I need everyone looked after, without checking every detail myself.”",
    principle: "Ask once, check everything",
    line: "Capture each person's needs once, confirm them, then check every suggestion against them.",
    screen: "assets/screens/h03d-family-summary-thumb.png",
    alt: "Family summary card listing 5 people and 9 things to keep in mind, each editable.",
    caption: "H03d · Family summary",
  },
  {
    insight: 6,
    title: "People trust people, not listings",
    evidence: "MakeMyTrip suggested a Goa activity; YouTube showed it wasn't as described. Hotels are picked by reviews.",
    need: "“I need to know it's real before I bring my family there.”",
    principle: "Show evidence, not a pamphlet",
    line: "Every pick comes with its reasons, what travellers say, and what was left out — and why.",
    screen: "assets/screens/h05-pondicherry-beaches-thumb.png",
    alt: "Pondicherry page, Beaches tab: beach cards with family fit tags and reasons.",
    caption: "H05 · Beaches with fit tags",
  },
  {
    insight: 3,
    title: "Booking is split by trust",
    evidence: "Flights on one app, hotels on another, cabs through an agent, special requests by phone.",
    need: "“I need to stay in control of each booking I make.”",
    principle: "AI does the legwork, the parent decides",
    line: "Compare options side by side with their trade-offs; the parent makes the call.",
    screen: "assets/screens/h07a-travel-modes.png",
    alt: "Myra compares ways to get to Pondicherry for the family, with trade-offs for each.",
    caption: "H07a · Ways to get there",
  },
  {
    insight: 4,
    title: "Certain bookings, flexible days",
    evidence: "Easy cancellation and pre-booked essentials, but the day itself changes — a Vespa rented on the spot.",
    need: "“I need the big things certain, so we can relax about the rest.”",
    principle: "Certain bookings, flexible days",
    line: "Lock in what's hard to change (travel, stay); keep the days as an editable draft.",
    screen: "assets/screens/h08b-rough-draft.png",
    alt: "A rough itinerary draft: three day cards with open slots still to fill.",
    caption: "H08b · Rough draft with open slots",
  },
  {
    insight: 5,
    title: "Planning is staged and shared",
    evidence: "Dates first, then the place, then bookings — over weeks, and often decided with others on WhatsApp.",
    need: "“I need time to decide with my family, without losing my progress.”",
    principle: "Plan in stages, pick up anytime",
    line: "Any starting point, a checklist that tracks progress, and a plan to share and come back to.",
    screen: "assets/screens/h03e-where-to-start.png",
    alt: "Myra offers three places to start, with a plan checklist pinned under the header.",
    caption: "H03e · Where to start + checklist",
  },
];

/* Three directions. A step with `ai: true` is the one Myra does. */
export const directions = [
  {
    id: "A",
    title: "Step by step",
    steps: [{ text: "People" }, { text: "Places" }, { text: "Stay" }, { text: "Travel" }, { text: "Days" }, { text: "Book" }],
    plus: "Each step visibly shapes the next.",
    minus: "About 7 turns before a plan appears.",
  },
  {
    id: "B",
    chosen: true,
    title: "Explore, then Myra joins it up",
    steps: [
      { text: "People" },
      { text: "Explore & shortlist" },
      { text: "Myra proposes stay + travel, with reasons", ai: true },
      { text: "Days" },
      { text: "Book" },
    ],
    plus: "The parent explores freely; the AI connects stay, travel and timing — beyond search and filter.",
    minus: "More to review at once, so reasons and easy swaps are essential.",
  },
  {
    id: "C",
    title: "Ask only when it matters",
    steps: [{ text: "Context" }, { text: "Places" }, { text: "Questions as they come up" }, { text: "Stay → Travel → Days" }],
    plus: "Never feels like a form.",
    minus: "Needs can be missed if the parent never taps the place that triggers the question.",
  },
];

/* How direction B evolved — before → after. */
export const evolution = [
  {
    title: "Plan step by step, not all at once",
    why: "The first lo-fi asked for everything on one card, then checked it all in one go. Parents decide one thing at a time — so Myra now confirms the trip, then asks about each person.",
    before: { src: "assets/lofi/v1-family-card.png", caption: "V1 · Everything on one card", alt: "Lo-fi: one 'Your family' card asking for every detail at once." },
    after: { src: "assets/screens/h03b-daughter-understood-evo.png", caption: "Hi-fi · One person at a time", alt: "Hi-fi: Myra asks about the daughter, then the grandparents, one at a time." },
  },
  {
    title: "A conversation, not a form",
    why: "Needs as chips felt like filling a form, and options aren't the same for every family. Now the parent says it in their own words or by voice, and Myra shows what it understood.",
    before: { src: "assets/lofi/v2-needs-chips.png", caption: "V2 · Needs as chips", alt: "Lo-fi: a panel of preset chips for the daughter's needs." },
    after: { src: "assets/lofi/v3-tell-myra.png", caption: "V3 · Tell Myra in your words", alt: "Lo-fi: the parent tells Myra about the family in their own words." },
  },
  {
    title: "Show places, not paragraphs",
    why: "Text-heavy results didn't help a parent picture a beach. Results became visual cards with distance, what's nearby, reviews and family fit tags.",
    before: { src: "assets/lofi/v1-plan-panel.png", caption: "V1 · Text plan panel", alt: "Lo-fi: a plan panel made of text paragraphs." },
    after: { src: "assets/lofi/v2-beach-cards.png", caption: "V2 · Visual beach cards", alt: "Lo-fi: beaches shown as visual cards with distance and fit tags." },
  },
  {
    title: "Planning happens over days",
    why: "No one books a family trip in one sitting. The plan is saved, shared on WhatsApp for the family to discuss, and picked up 2–3 days later.",
    before: { src: "assets/lofi/v1-review-book.png", caption: "V1 · Review & book in one go", alt: "Lo-fi: a single review-and-book step at the end of the chat." },
    after: { src: "assets/lofi/v2-shortlist.png", caption: "V2 · Save, note, share", alt: "Lo-fi: a shortlist panel to save, add notes and share." },
  },
  {
    title: "Let the parent choose where to start",
    why: "Parents don't all start in the same place. After the family summary, Myra offers three paths, and a checklist keeps track of what's done.",
    before: { src: "assets/lofi/v2-myra-proposal.png", caption: "V2 · Myra sets the order", alt: "Lo-fi: Myra proposes stay and travel in a fixed order." },
    after: { src: "assets/screens/h03e-where-to-start-evo.png", caption: "Hi-fi · Three paths + checklist", alt: "Hi-fi: three paths to start from, with a plan checklist." },
  },
];
