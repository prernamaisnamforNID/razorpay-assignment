/* ==========================================================================
   Journey, scenarios and "Try saying" prompts — ALL editable copy lives here.
   Screens, panels and the tracker read from this file; nothing else holds copy.
   ========================================================================== */

/* One entry per step, in journey order (PROJECT_STRUCTURE.md §5).
   id       — internal key, also the screen module name
   num      — label in the journey tracker
   screen   — screen ID shown on placeholders
   name     — short name for the tracker
   title    — screen title on the placeholder
   shows    — what will appear on this screen (placeholder list)
   actions  — what the parent taps inside the app
   prompts  — "Try saying" prompts for this step (tap = sent to Myra)
   hint     — shown in the prompt panel when there are no prompts
   input    — true if the screen has Myra's text input bar */
export const steps = [
  {
    id: "h01", num: "1", screen: "H01", name: "Home",
    title: "MMT home",
    shows: ["MMT home", "Myra nudge above the nav bar"],
    actions: ["Tap the Myra button in the nav bar"],
    prompts: [],
    hint: "Nothing to say yet. Tap the Myra button in the app to start.",
    input: false,
  },
  {
    id: "h02", num: "2", screen: "H02", name: "Myra home",
    title: "Myra home",
    shows: ["“Hi, Anjali” greeting", "You may try asking: 4 prompt cards", "Ask Myra anything input"],
    actions: ["Tap the first prompt card", "Or send a prompt"],
    prompts: [
      "Weekend in Pondicherry with my husband, our 3-year-old and my parents. Leave Friday, back Sunday night. Around ₹45K.",
      "Help me plan a family weekend that works for my kids and my parents",
    ],
    input: true,
  },
  {
    id: "h03", num: "3", screen: "H03", name: "Who's going",
    title: "Chat · trip summary",
    shows: ["Trip summary carousel: When / Where / Who / Budget", "Question card about your daughter", "Skip for now"],
    actions: ["Confirm the summary", "Swipe / edit the summary cards", "Tap answer chips", "Skip for now"],
    prompts: [],
    // H03 is a staged conversation; prompts change with the stage (state.substep).
    substepPrompts: {
      confirm: [
        { text: "Yes, that's right", action: "confirm" },
        { text: "Change the budget to ₹50K", action: "editBudget" },
      ],
      question: [
        { text: "She naps after lunch and sleeps on long drives. She gets car sick on winding roads.", action: "answer", source: "spoken",
          needs: [{ key: "nap-lunch" }, { key: "sleep-journeys" }, { key: "motion-winding" }] },
        { text: "She's fine, nothing special.", action: "answer", source: "typed", needs: [] },
      ],
      parents: [
        { text: "Both are pure veg. Papa has knee trouble, so no long walks or stairs.", action: "answer", source: "typed",
          needs: [{ key: "veg" }, { key: "short-walks", who: ["papa"] }, { key: "no-stairs", who: ["papa"] }] },
        { text: "They're fine, nothing special.", action: "answer", source: "typed", needs: [] },
      ],
      you: [
        { text: "A quiet evening for the two of us would be nice. Otherwise, keep it relaxed.", action: "answer", source: "typed",
          needs: [{ key: "quiet-evening" }, { key: "relaxed" }] },
        { text: "Nothing for us.", action: "answer", source: "typed", needs: [] },
      ],
      family: [
        { text: "Yes, that covers everyone", action: "confirmFamily" },
        // Only shown while the need exists.
        { text: "Remove 'Early dinners'", action: "removeNeed", need: "early-dinners", requiresNeed: "early-dinners" },
      ],
      paths: [
        { text: "Show me what's in Pondicherry", action: "path", path: "places" },
        { text: "Plan an itinerary for us", action: "path", path: "itinerary" },
        { text: "How should we get there?", action: "path", path: "travel" },
      ],
      itinerary: [
        { text: "Show me a rough draft", action: "choice", choice: "draft" },
        { text: "Let's pick places first", action: "choice", choice: "places" },
      ],
      draft: [
        { text: "Let's pick places", action: "choice", choice: "places" },
        { text: "Keep it for later", action: "choice", choice: "keep" },
      ],
      // After H04, the demo skips ahead: the family has picked three beaches (see substepNotes).
      destination: [
        { text: "We've decided on Rock Beach, Auroville and Serenity.", action: "decide" },
      ],
      // H06a → H07a
      fit: [
        { text: "Show hotels around these beaches", action: "hotels" },
      ],
      // H06e — a stay is over the stay budget
      // After H06e, the demo skips ahead to the final plan (H09) — see substepNotes.
      hotels: [
        { text: "Let's go with Seaside Stay and a cab. Show me the final plan.", action: "finalPlan" },
      ],
      hotelKept: [
        { text: "Let's go with Seaside Stay and a cab. Show me the final plan.", action: "finalPlan" },
      ],
      // H07a — the over-budget edge case
      travel: [
        { text: "Let's fly", action: "fly" },
      ],
      // While the H05 Pondicherry page is open.
      beaches: [
        { text: "Which beach is calmest for a 3-year-old?", action: "toast" },
        { text: "Why did you leave out Paradise Beach?", action: "toast" },
      ],
    },
    // Evaluator notes shown above the prompts (side panel + phone drawer) at a stage.
    substepNotes: {
      destination: "Assumption: the family has already explored the beaches and picked three. In the full flow they'd save them from the Beaches sheet (H05) and discuss with family first.",
      hotels: "Assumption for this demo: the family has chosen Seaside Stay, picked travel by cab and agreed on the activities. In the full flow they'd decide these with Myra step by step.",
      hotelKept: "Assumption for this demo: the family has chosen Seaside Stay, picked travel by cab and agreed on the activities. In the full flow they'd decide these with Myra step by step.",
    },
    input: true,
  },
  // Sub-stages of the H03 chat, shown in the journey tracker.
  // `host` = the screen they live in; `substeps` = state.substep values that mean "here";
  // `branch` = a side path, drawn indented under the step above.
  {
    id: "h03e", num: "3b", screen: "H03e", name: "Where to start", host: "h03", substeps: ["paths"],
    hint: "Pick a path in the app, or try saying one.",
  },
  {
    id: "h08", num: "↳", screen: "H08", name: "Itinerary draft", host: "h03", substeps: ["itinerary", "draft"], branch: true,
  },
  // H04 continues the same chat (after "See what's in Pondicherry").
  {
    id: "h04", num: "4", screen: "H04", name: "Destination", host: "h03", substeps: ["destination"],
    hint: "Pick what to explore first in the app, or try saying it.",
  },
  // H05 is a bottom sheet over the H03 chat (opened from H04).
  {
    id: "h05", num: "5", screen: "H05", name: "Beaches", host: "h03", substeps: ["beaches"],
    hint: "Save beaches with ♥, then close the page to go back to the chat.",
  },
  // H06a continues the same chat once the beaches are decided.
  {
    id: "h06a", num: "6", screen: "H06a", name: "Beach fit", host: "h03", substeps: ["fit"],
    hint: "Tap Open map on the map card to see the beaches full screen.",
  },
  // H06b is its own screen; `chatStage` = the chat stage underneath it, so Back lands there after a jump.
  {
    id: "h06b", num: "6b", screen: "H06b", name: "Map", chatStage: "h06a",
    // Goes back to the chat and on to H07a (getting there).
    prompts: [{ text: "How should we get there?", action: "travel" }],
    input: false,
  },
  // H06e continues the same chat: hotels around the saved beaches, against the stay budget.
  {
    id: "h06e", num: "6c", screen: "H06e", name: "Hotels", host: "h03", substeps: ["hotels", "hotelKept"],
  },
  // H07a continues the same chat: how to get there, against the ₹45K budget.
  {
    id: "h07a", num: "7", screen: "H07a", name: "Travel modes", host: "h03", substeps: ["travel", "overBudget"],
    hint: "Pick an option in the app. The prototype ends here; the rest is in the case study.",
  },
  {
    id: "h07b", num: "7b", screen: "H07b", name: "Train",
    title: "Chat · train option",
    shows: ["Train card", "Side-by-side: train vs drive"],
    actions: ["Tap chips"],
    prompts: [
      "OK, let's drive.",
    ],
    input: true,
  },
  {
    id: "h07c", num: "7c", screen: "H07c", name: "Drive plan",
    title: "Chat · drive plan",
    shows: ["Sleep-timed drive timeline", "Cab card", "Budget bar"],
    actions: ["Lock in cab"],
    prompts: [
      "Can we leave after her nap?",
    ],
    input: true,
  },
  // H09 — the last step, in the same chat: the final plan, then book the hotel and the cab.
  {
    id: "h09", num: "8", screen: "H09", name: "Final plan", host: "h03", substeps: ["final", "booked"],
    hint: "Book the hotel and the cab in the app. Tap a time in a day card to hide or show its reason.",
  },
];

/* H02 · Myra home copy.
   Thumbnails are CSS gradients from Figma. To use a real photo, drop it in
   prototype/assets/photos/ and set `photo` to its path, e.g. "assets/photos/prompt-family.jpg".
   (Left as null so missing files never cause 404s in the console.) */
export const myraHome = {
  name: "Anjali",
  intro: "I'm Myra — your personal travel assistant. Let's plan your next trip together.",
  label: "You may try asking",
  inputPlaceholder: "Ask Myra anything...",
  otherCardToast: "This demo follows the family trip. Try the first suggestion.",
  cards: [
    {
      id: "family", journey: true,
      text: "Help me plan a family weekend that works for my kids and my parents",
      thumb: "linear-gradient(180deg, #F7D9A8 0%, #F3B07A 50%, #9CC7E8 100%)",
      photo: null, // assets/photos/prompt-family.jpg
    },
    {
      id: "beaches",
      text: "Which are the best beaches to visit in India?",
      thumb: "linear-gradient(180deg, #F6D38B 0%, #E9B26B 50%, #8DB9D9 100%)",
      photo: null, // assets/photos/prompt-beaches.jpg
    },
    {
      id: "udaipur",
      text: "Which are the iconic palace hotels to experience in Udaipur?",
      thumb: "linear-gradient(180deg, #E7A44E 0%, #6DA9D8 50%, #C9B89A 100%)",
      photo: null, // assets/photos/prompt-udaipur.jpg
    },
    {
      id: "japan",
      text: "Can you suggest unique and offbeat travel destinations in Japan?",
      thumb: "linear-gradient(180deg, #C2341F 0%, #8B1E12 50%, #2D2A2A 100%)",
      photo: null, // assets/photos/prompt-japan.jpg
    },
  ],
};

/* ==========================================================================
   Timings — every delay in the prototype, in ms. Reduced motion multiplies them.
   ========================================================================== */
export const timing = {
  reducedMotionScale: 0.4,   // all delays × this when prefers-reduced-motion is on
  typePerChar: 25,           // "Try saying" typewriter
  afterUserMessage: 450,     // user bubble → Myra starts working
  workingStep: 700,          // each "Working on your request…" step
  workingCollapse: 320,      // loading card collapse
  beforeReply: 300,          // collapse → Myra's text
  betweenBlocks: 450,        // pause between Myra's blocks
  cardStagger: 60,           // summary cards slide in, this far apart
  typingDots: 900,           // typing dots before a Myra reply
  familyWorking: 1200,       // "Putting everyone together…" loader
  hotelsWorking: 1000,       // "Finding stays near your beaches…" loader (H06e)
  finalStep: 500,            // each step of the H09 loader (3 steps ≈ 1.5s)
  planStagger: 80,           // H09: checklist steps turn done this far apart
  dayStagger: 120,           // H09: day cards fade + rise in this far apart
  envToast: 3000,            // canvas toast (outside the phone) stays this long
  beforeNextScreen: 900,     // family confirmed → H04
  shimmerLoop: 1400,         // shimmer sweep (CSS reads --shimmer-loop)
};

/* H03 · Trip summary + first family question — all copy for the staged chat. */
export const h03 = {
  timestamp: null, // null = the real current time; or a fixed string like "12:11 PM"
  working: {
    title: "Working on your request…",
    done: "Done! Here's your trip so far",
    steps: [
      { title: "Reading your message…", desc: "Pulling out dates, places and who's going." },
      { title: "Checking your dates…", desc: "Fri 28 – Sun 30 Nov, leaving Friday early." },
      { title: "Putting your trip together…", desc: "Summarising it so you can check before we plan." },
    ],
  },
  intro: "Got it. Here's what I'm planning with — swipe to check, tap any card to change it.",
  summary: {
    title: "Your trip so far",
    subtitle: "Pondicherry · 3 days · 5 people",
    confirmed: "Confirmed",
    cards: [
      { id: "when", icon: "calendar", label: "WHEN", value: "Fri 28 – Sun 30 Nov", note: "Leave Friday early, back Sunday night" },
      { id: "where", icon: "map-pin", label: "WHERE", value: "Pondicherry", note: "Starting from Bengaluru" },
      { id: "who", icon: "users", label: "WHO'S GOING", value: "5 people", note: "2 adults · 1 child (3 yrs) · 2 grandparents",
        avatars: [
          { letter: "Y", bg: "#DFF0FF" }, { letter: "H", bg: "#E7F6EC" }, { letter: "D", bg: "#FFF0DC" },
          { letter: "M", bg: "#F3E8FF" }, { letter: "P", bg: "#FFE6EA" },
        ] },
      { id: "budget", icon: "wallet", label: "BUDGET", value: "₹45,000", note: "For travel, stay and things to do" },
    ],
  },
  confirm: {
    ask: "Does this look right?",
    yes: "Looks right",
    change: "Change something",
  },
  editSheet: {
    title: "Edit trip details",
    hint: "Editing comes next. For now, check the details and tap Done.",
    done: "Done",
  },
  question: {
    lead: "Now, the people I should plan around. Let's start with your daughter.",
    avatars: [{ letter: "D", bg: "#FFF0DC" }],
    name: "Daughter · 3 yrs",
    progress: "1 of 3 people to plan around",
    text: "Anything I should plan around for her? Tell me more about her schedule — naps, meals, bedtime, and how she does on long journeys.",
    starterLabel: "Say it in your own words, or start with:",
    // chips: see familyGroups[0].chips
    skipNote: "You can add this later too.",
    skip: "Skip for now",
    inputPlaceholder: "Tell Myra about her day…",
  },
};

/* ==========================================================================
   H03 (continued) · the family conversation — stages 5–8.
   COPY RULE: Myra never says "drive" before the travel-mode step.
   Use "journey" / "getting there". The parent's own words may say "drives".
   ========================================================================== */

/* Who's on the trip. "you" is one row for You & your husband. */
export const people = {
  daughter: { name: "Daughter · 3 yrs", avatars: [{ letter: "D", bg: "#FFF0DC" }] },
  mum: { name: "Mum", avatars: [{ letter: "M", bg: "#F3E8FF" }] },
  papa: { name: "Papa", avatars: [{ letter: "P", bg: "#FFE6EA" }] },
  you: { name: "You & husband", avatars: [{ letter: "Y", bg: "#DFF0FF" }, { letter: "H", bg: "#E7F6EC" }] },
};
export const peopleOrder = ["daughter", "mum", "papa", "you"];

/* Every need Myra can note. Pills read `label`; in a group with more than one
   person the understood card adds "(both)" / "(Papa)" automatically.
   `strip` — label on H04's "Planning around" strip; needs without it are left off.
   Needs with the same `join`, for the same person, share one pill: "Short walks, no stairs". */
export const needs = {
  // daughter
  "nap-lunch": { label: "Naps after lunch", group: "daughter" },
  "nap-day": { label: "Naps in the day", group: "daughter" },
  "sleep-journeys": { label: "Sleeps on long journeys", group: "daughter", strip: "Sleeps on long journeys" },
  "motion-winding": { label: "Motion sick on winding roads", group: "daughter", strip: "Gets motion sick" },
  "motion": { label: "Motion sickness", group: "daughter", strip: "Gets motion sick" },
  "picky": { label: "Picky eater", group: "daughter", strip: "Picky eater" },
  // Mum & Papa
  "veg": { label: "Pure veg", group: "parents", strip: "Pure veg" },
  "short-walks": { label: "Short walks", group: "parents", strip: "Short walks", join: "mobility" },
  "no-stairs": { label: "No stairs", group: "parents", strip: "No stairs", join: "mobility" },
  "early-dinners": { label: "Early dinners", group: "parents", strip: "Early dinners" },
  "afternoon-rest": { label: "Afternoon rest", group: "parents", strip: "Afternoon rest" },
  // you two
  "quiet-evening": { label: "One quiet evening", group: "you" },
  "cafe": { label: "A good café", group: "you" },
  "relaxed": { label: "Relaxed pace", group: "you" },
};

/* The three family questions, in order.
   chips: `phrase` builds the sentence (subject + phrases); `need` is what Myra notes.
   replies: the first whose `if` matches a noted need is used; the last is the default. */
export const familyGroups = [
  {
    id: "daughter", substep: "question", people: ["daughter"],
    subject: "She", // the question card itself is h03.question (stage 4)
    chips: [
      { label: "Naps in the day", phrase: "naps in the day", need: "nap-day" },
      { label: "Sleeps while travelling", phrase: "sleeps while travelling", need: "sleep-journeys" },
      { label: "Gets motion sick", phrase: "gets motion sick", need: "motion" },
      { label: "Picky eater", phrase: "is a picky eater", need: "picky" },
    ],
    understoodTitle: "Here's what I understood about your daughter",
    replies: [
      { if: ["nap-lunch", "nap-day", "sleep-journeys", "motion-winding", "motion"],
        text: "Thanks. I'll time the journey around her sleep and keep motion sickness in mind when I compare ways to get there. Now, your parents." },
      { text: "Thanks, I'll keep that in mind for every suggestion. Now, your parents." },
    ],
    skipReply: "No problem — I'll plan for a typical 3-year-old. You can tell me more anytime.",
  },
  {
    id: "parents", substep: "parents", people: ["mum", "papa"],
    subject: "They",
    question: {
      avatars: [{ letter: "M", bg: "#F3E8FF" }, { letter: "P", bg: "#FFE6EA" }],
      name: "Mum & Papa · grandparents",
      progress: "2 of 3 to plan around",
      text: "Anything I should plan around for them? Food, walking, stairs, rest — whatever matters to them.",
      starterLabel: "Say it in your own words, or start with:",
      skipNote: "You can add this later too.",
      skip: "Skip for now",
      inputPlaceholder: "Tell Myra about your parents…",
    },
    chips: [
      { label: "Pure veg", phrase: "are pure veg", need: "veg" },
      { label: "Can't walk far", phrase: "can't walk far", need: "short-walks" },
      { label: "Avoid stairs", phrase: "need to avoid stairs", need: "no-stairs" },
      { label: "Early dinners", phrase: "like early dinners", need: "early-dinners" },
      { label: "Afternoon rest", phrase: "need an afternoon rest", need: "afternoon-rest" },
    ],
    understoodTitle: "Here's what I understood about Mum and Papa",
    replies: [
      { if: ["short-walks", "no-stairs"], text: "Got it. I'll keep walks short and look for stays with a lift or ground-floor rooms." },
      { text: "Got it. I'll keep that in mind for every suggestion." },
    ],
    skipReply: "No problem — I'll keep things easy-going for them. You can tell me more anytime.",
  },
  {
    id: "you", substep: "you", people: ["you"],
    subject: "We'd like",
    lead: "Last one: what about you two? You're on this trip too.",
    question: {
      avatars: [{ letter: "Y", bg: "#DFF0FF" }, { letter: "H", bg: "#E7F6EC" }],
      name: "You & your husband",
      progress: "3 of 3 to plan around",
      text: "Anything you'd like from this trip, or anything to avoid?",
      starterLabel: "Say it in your own words, or start with:",
      skipNote: "You can add this later too.",
      skip: "Nothing for us",
      inputPlaceholder: "Anything for you two…",
    },
    chips: [
      { label: "Some time for us", phrase: "some time for us", need: "quiet-evening" },
      { label: "A good café", phrase: "a good café", need: "cafe" },
      { label: "Not too packed", phrase: "a day that's not too packed", need: "relaxed" },
      { label: "Nothing for us", skip: true }, // same as the skip button
    ],
    understoodTitle: "Here's what I understood about you two",
    replies: [],
    skipReply: "Noted — the plan stays about the family.",
  },
];

export const family = {
  sources: { spoken: "Spoken with Speak", typed: "Typed", tapped: "Tapped" },
  send: "Send",
  understoodFooter: "Tap to edit · × to remove",
  nothingNoted: "Nothing noted",
  working: {
    title: "Working on your request…",
    done: "Done!",
    steps: [{ title: "Putting everyone together…", desc: "Lining up everyone's needs side by side." }],
  },
  intro: "That's everyone. Here's who I'm planning around:",
  summary: {
    title: "Planning around your family",
    subtitle: "5 people · {n} things to keep in mind", // {n} = number of needs
    subtitleOne: "5 people · 1 thing to keep in mind",
    lock: "I'll check every suggestion against these. Health details are optional — edit or delete them anytime.",
    confirmed: "Confirmed",
    none: "Nothing specific",
  },
  confirm: {
    ask: "Does this cover everyone?",
    yes: "Looks right",
    change: "Change something",
    next: "Next: Pondicherry, with your family in mind",
  },
  editSheet: { title: "Edit family needs", hint: "Tap × to remove anything that's not right.", done: "Done" },
  inputPlaceholder: "Ask Myra anything...",
};


/* ==========================================================================
   H03e · Where to start + plan checklist, H08a/H08b · itinerary draft.
   COPY RULE still applies: no "drive" in Myra's copy before travel mode.
   ========================================================================== */

/* Plan checklist (pinned under the chat header).
   State: state.plan[id] = "todo" | "active" (in progress) | "draft" | "done". */
export const planSteps = [
  { id: "family", label: "Family", todoIcon: "plan-check" },
  { id: "places", label: "Places", todoIcon: "plan-map-pin", activeIcon: "plan-map-pin-active" },
  { id: "travel", label: "Getting there", todoIcon: "plan-route", activeIcon: "plan-route-active" },
  { id: "stay", label: "Stay", todoIcon: "plan-bed", activeIcon: "plan-bed-active" },
  { id: "days", label: "Days", todoIcon: "plan-calendar", draftIcon: "plan-calendar-draft", draftLabel: "Days · draft" },
];
export const planCopy = {
  stayToast: "Stay comes after places and travel.",
};

/* H03e — the three paths. `go`: "places" → H04 and "itinerary" → H08a, both in this chat; "travel" → H07a. */
export const paths = {
  ask: "Perfect, I've got everyone. Where would you like to start?",
  badge: "Most families start here",
  hint: "Do these in any order. I'll keep track above and suggest what's next.",
  options: [
    { id: "places", icon: "waves-22", title: "See what's in Pondicherry", desc: "Beaches and things to do, checked for your family", featured: true },
    { id: "itinerary", icon: "calendar-22", title: "Plan an itinerary", desc: "A day-by-day draft for Fri to Sun" },
    { id: "travel", icon: "route-22", title: "Check how to get there", desc: "Ways to travel from Bengaluru, compared on time and cost" },
  ],
};

/* H04 — Pondicherry, in the same chat (Figma 91:2). COPY RULE: never "drive" here.
   Tapping H03e card 1 sends `userText`; a typed prompt sends what was typed. */
export const destination = {
  userText: "Show me what's in Pondicherry",
  intro: "Here's Pondicherry, checked for your family of 5.",
  strip: { title: "Planning around", edit: "Edit", none: "Nothing specific yet" },
  card: {
    photo: "assets/photos/pondicherry.jpg",
    photoAlt: "Pondicherry from above: colourful houses along the rocky seafront promenade, with the pier behind.",
    name: "Pondicherry",
    tagline: "Bewitching French City",
    knownFor: "Known for",
    tags: [
      { icon: "waves-13-blue", label: "Calm beaches" },
      { icon: "landmark-13-blue", label: "French Quarter" },
      { icon: "coffee-13-blue", label: "Cafés" },
    ],
    save: "Save Pondicherry",
    explore: "Explore Pondicherry",
    exploreToast: "Next: Pondicherry page",
  },
  rain: "Late Nov can be rainy in Pondicherry, so I'll keep an indoor backup for each day.",
  ask: "What would you like to explore first?",
  chips: [
    { id: "beaches", label: "Explore beaches", icon: "waves-16-white", primary: true },
    { id: "todo", label: "Things to do", icon: "landmark-16" },
    { id: "stay", label: "Areas to stay", icon: "map-pin-16" },
  ],
  chipToast: "Coming next",
};

/* H05 — Pondicherry page, Beaches tab, as a bottom sheet over the chat (Figma 32:128).
   Beach ids match state.savedBeaches and the scenario presets.
   `crop` places the photo inside its 234 × 116 box like Figma: % of the box. */
export const beachesPage = {
  photo: "assets/photos/pondicherry.jpg",
  photoAlt: "Pondicherry's seafront from above, with the pier.",
  name: "Pondicherry",
  tagline: "Bewitching French City",
  checked: "Checked for your family of 5",
  close: "Close Pondicherry page",
  tabs: [
    { id: "overview", label: "Overview" },
    { id: "beaches", label: "Beaches" },
    { id: "todo", label: "Things to do" },
    { id: "stay", label: "Areas to stay" },
  ],
  activeTab: "beaches",
  title: "Beaches that fit your family",
  sub: "Checked against her motion sickness, Papa's knees and pure-veg food nearby",
  beaches: [
    {
      id: "promenade", name: "Rock Beach", rating: "4.4",
      photo: "assets/photos/rock-beach.jpg", crop: { left: 0, top: -90.5, width: 105.1, height: 250 },
      photoAlt: "Rock Beach: a rocky shore beside a long, flat seafront promenade.",
      fits: [
        { ok: true, text: "Flat promenade, easy for Papa" },
        { ok: true, text: "Pure-veg cafés nearby" },
        { ok: false, text: "Rocky shore, no wading" },
      ],
    },
    {
      id: "auroville", name: "Auroville Beach", rating: "4.2",
      photo: "assets/photos/auroville-beach.jpg", crop: { left: -6, top: -12.1, width: 106, height: 142.2 },
      photoAlt: "Auroville Beach: a wide strip of soft sand and waves.",
      fits: [
        { ok: true, text: "Soft sand for her to play" },
        { ok: true, text: "Short walk from parking" },
        { ok: false, text: "Waves can be strong" },
      ],
    },
    {
      // No photo in Figma yet — the card shows the sky-to-sand gradient.
      id: "serenity", name: "Serenity Beach", rating: "4.3",
      distance: "15 min away", // Figma says "15 min drive" — no "drive" before travel mode is chosen
      fits: [
        { ok: true, text: "Quiet in the mornings" },
        { ok: false, text: "Sandy path to the water" },
      ],
    },
  ],
  save: "Save {name}",
  details: "See details",
  seeAll: { title: "See all beaches", sub: "7 more, incl. left out" },
  leftOut: {
    title: "Left out: Paradise Beach",
    reason: "Reached only by boat, which may upset her motion sickness.",
    action: "Show anyway",
    toast: "Paradise Beach stays off the list for now",
  },
  context: "· Looking at beaches in Pondicherry",
  chips: ["Compare these beaches", "Best time with a toddler", "Show on map"],
  ask: "Ask anything about this place",
  toast: "Coming next", // other tabs, See all, See details, chips
};

/* H06a — the beaches are decided; do they fit? (Figma 33:2). Same chat.
   `saved` = beach ids (beachesPage.beaches) in pin order 1, 2, 3.
   Map pins: x/y in px on the 358 × 210 inline map (pin's top-left, like Figma). */
export const beachFit = {
  saved: ["promenade", "auroville", "serenity"],
  note: "You saved 3 beaches",
  intro: "You saved 3 beaches. With her nap and Papa's pace, there are about 4 beach windows this trip, so all 3 fit with one to spare.",
  meter: {
    title: "Beach windows this trip",
    used: "3 of 4 used",
    slots: ["Fri eve", "Sat am", "Sat eve", "Sun am"],
    filled: 3,
    note: "Mornings and evenings only. Midday is her nap and too hot for Papa.",
  },
  map: {
    title: "Your saved beaches",
    sub: "3 saved · 1 left out",
    open: "Open map",
    alt: "Map of Pondicherry's coast: Auroville (2) and Serenity (3) north of town, Rock Beach (1) by White Town, and Paradise Beach (left out) to the south.",
    labels: [
      { text: "White Town", x: 85.92, y: 111.3, tone: "town" },
      { text: "ECR", x: 187.76, y: 14.7, tone: "road" },
      { text: "Bay of Bengal", x: 263.76, y: 94.5, tone: "sea" },
    ],
    pins: [
      { n: 2, x: 201.8, y: -1.8 },
      { n: 3, x: 212.54, y: 38.1 },
      { n: 1, x: 223.28, y: 94.8 },
    ],
    leftOut: { x: 237.6, y: 153.6 },
  },
  tip: "Auroville and Serenity are both north of town. Staying near White Town keeps every beach under 30 min away. I'll use this when we pick a stay.",
  ask: "Want to share these with the family before deciding?",
  chips: [
    { id: "share", label: "Share on WhatsApp", icon: "message-circle-16-white", primary: true },
    { id: "explore", label: "Keep exploring", icon: "waves-16" },
    { id: "hotels", label: "Show hotels around these beaches" }, // → H06e
  ],
  chipToast: "Coming next",
};

/* H06b v2 — full-screen map: saved beaches → hotels around them (Figma 94:2).
   Pins and labels in px on the 390 × 844 map. */
export const beachMap = {
  title: "Beaches in Pondicherry",
  back: "Back to chat",
  layers: "Map layers",
  alt: "Full map of Pondicherry's coast with your three saved beaches numbered 1 to 3 and Paradise Beach greyed out.",
  filters: [
    { id: "saved", label: "Saved (3)", icon: "heart-16", active: true },
    { id: "fits", label: "All good fits" },
    { id: "left", label: "Left out (1)" },
  ],
  labels: [
    { text: "White Town", x: 93.6, y: 447.32, tone: "town", size: 13 },
    { text: "ECR", x: 210.8, y: 59.08, tone: "road", size: 12 },
    { text: "Bay of Bengal", x: 298.8, y: 379.8, tone: "sea", size: 12 },
    { text: "Auroville", x: 46.8, y: 101.28, tone: "town", size: 12 },
  ],
  // tag = the white name label to the left of each pin
  pins: [
    { n: 2, name: "Auroville Beach", x: 217, y: 193.08, tagX: 107 },
    { n: 3, name: "Serenity Beach", x: 228.7, y: 282.38, tagX: 121.7 },
    { n: 1, name: "Rock Beach", x: 240.4, y: 409.28, tagX: 153.4 },
  ],
  leftOut: { name: "Paradise Beach", x: 256, y: 540.88, tagX: 145 },
  legend: { saved: "Saved", left: "Left out" },
  fit: "3 of 4 windows used",
  card: {
    text: "Your 3 beaches are along the coast, 5–25 min apart. Staying near White Town keeps every one under 30 min away.",
    checks: ["Lift or ground floor", "Pure-veg nearby", "Within ₹31K left"],
    primary: "Show hotels around these beaches",
    near: ["Near Rock Beach", "Near Serenity"],
  },
  hotelsToast: "Next: stays near your beaches",
  toast: "Coming next", // filters, layers
};

/* H06e — hotels around your beaches: distance + budget (Figma 98:2). Same chat.
   `near` = minutes to each saved beach, numbered like the H06a map pins
   (Figma's frame numbers Serenity 2 / Auroville 3; the map has them the other way round). */
export const hotels = {
  userText: "Show hotels around these beaches",
  working: {
    title: "Working on your request…",
    done: "Done!",
    steps: [{ title: "Finding stays near your beaches…", desc: "Checking distance, lifts and pure-veg food for all 5 of you." }],
  },
  intro: "Here are 2 stays near White Town, with how far each is from your beaches. One is over your ₹16K stay budget, so I'm flagging it before you choose.",
  nearLabel: "Distance to your beaches",
  nights: "for 2 nights",
  stays: [
    {
      id: "seaside", name: "Seaside Stay", price: "₹13,800",
      near: [{ n: 1, text: "Rock Beach · 5 min walk" }, { n: 2, text: "Auroville · 25 min" }, { n: 3, text: "Serenity · 15 min" }],
      fits: ["Within budget", "Lift", "Pure-veg nearby"],
    },
    {
      id: "grand", name: "Promenade Grand", price: "₹18,400", over: "₹2,400 over your ₹16K stay budget",
      near: [{ n: 1, text: "Rock Beach · 2 min walk" }, { n: 2, text: "Auroville · 28 min" }, { n: 3, text: "Serenity · 18 min" }],
      fits: ["Kids' pool", "Lift"],
    },
  ],
  ask: "Want a cheaper one with a kids' pool, or keep the Promenade Grand?",
  chips: [{ id: "cheaper", label: "Find a cheaper one", primary: true }, { id: "keep", label: "Keep it anyway" }],
  cheaperToast: "Showing stays under ₹16K",
  kept: "Okay — nothing is booked until you confirm.",
};

/* H09 — the final plan, then book the hotel and the cab (Figma 100:2). Same chat.
   COPY RULE: the travel mode is "cab", never "drive".
   Each day row: time, what happens, and why (the reason line; tap a row to hide/show it). */
export const finalPlan = {
  skipToast: "Skipping ahead: hotel, travel and activities assumed decided.",
  working: {
    title: "Working on your request…",
    done: "Done!",
    steps: [
      { title: "Fitting days around her nap", desc: "Mornings and evenings out, midday rest." },
      { title: "Checking Papa's pace", desc: "Short walks, flat paths, no stairs." },
      { title: "Adding up the costs", desc: "Stay and cab against your ₹45K." },
    ],
  },
  intro: "Here's your weekend, planned around her nap, Papa's pace and your ₹45K. Everything is checked against your family.",
  days: [
    {
      title: "Fri 28 Nov", tag: "Arrive",
      rows: [
        { time: "5:00 AM", text: "Leave Bengaluru by cab", why: "She sleeps through the first stretch" },
        { time: "~11:30 AM", text: "Check in · Seaside Stay", why: "Early check-in requested" },
        { time: "1–3 PM", text: "Rest · her nap" },
        { time: "5:00 PM", text: "Rock Beach · 5 min walk", why: "Flat promenade for Papa" },
      ],
    },
    {
      title: "Sat 29 Nov", tag: "Beaches",
      rows: [
        { time: "7:30 AM", text: "Serenity Beach · 15 min", why: "Quiet in the mornings" },
        { time: "1–3 PM", text: "Lunch, rest · her nap", why: "Pure-veg café nearby" },
        { time: "5:00 PM", text: "Auroville Beach · 25 min", why: "Soft sand for her to play" },
        { time: "8:00 PM", text: "Quiet evening for you two", why: "Grandparents stay in with her" },
      ],
    },
    {
      title: "Sun 30 Nov", tag: "Head home",
      rows: [
        { time: "9:00 AM", text: "French Quarter, short stroll", why: "Benches along the way" },
        { time: "4:00 PM", text: "Head home by cab", why: "She naps after the first hour" },
      ],
    },
  ],
  book: {
    title: "Ready to book",
    total: "₹27,800 of ₹45K",
    spent: 27.8, budget: 45, // bar width = spent / budget
    items: [
      {
        id: "hotel", emoji: "🏨", name: "Seaside Stay · 2 nights", price: "₹13,800",
        note: "Free cancellation till 25 Nov · lift · ground floor requested",
        button: "Book hotel", booked: "✓ Booked", toast: "Hotel booked",
        sheet: {
          title: "Book Seaside Stay",
          dates: "Fri 28 – Sun 30 Nov · 2 nights · 5 guests",
          includes: ["Ground-floor family room, lift in the building", "Early check-in requested for her nap", "Breakfast included · pure-veg options", "Free cancellation till 25 Nov"],
        },
      },
      {
        id: "cab", emoji: "🚗", name: "SUV cab · return", price: "₹14,000 est.",
        note: "5 AM pickup Fri · 4 PM Sun · child seat",
        button: "Book cab", booked: "✓ Booked", toast: "Cab booked",
        sheet: {
          title: "Book SUV cab",
          dates: "Fri 28 Nov, 5:00 AM pickup · Sun 30 Nov, 4:00 PM return",
          includes: ["7-seater SUV, room for luggage and Papa's legs", "Child seat fitted", "Stops whenever she needs a break", "Tolls and parking included"],
        },
      },
    ],
    payThere: "Pay there: beaches, meals and the French Quarter walk — nothing to book.",
  },
  sheetConfirm: "Confirm booking",
  sheetLater: "Not yet",
  sheetPriceLabel: "Total",
  nothingBooked: "Nothing is booked until you tap. You can still change any part of the plan.",
  quickLabel: "Quick:",
  quick: [
    { id: "share", label: "Share plan" },
    { id: "edit", label: "Edit a day" },
    { id: "swap", label: "Swap hotel" },
  ],
  quickToast: "Coming next",
  allBooked: "All set! Your weekend in Pondicherry is booked. I'll remind you the night before to pack for her nap in the cab.",
  endToast: "End of prototype — thanks for trying it!",
};

/* H07a v2 — getting there, against the budget (Figma 96:2). Same chat.
   COPY RULE: Myra never says "drive" before the parent picks a mode — except as the option name.
   Budget bars: travel segment width = cost / budget. */
export const travel = {
  userText: "How should we get there?",
  intro: "Lovely. Before stays and days, let's settle how you'll get there. I compared the options from Bengaluru for all 5 of you.",
  checked: {
    title: "Checked against",
    pills: [
      { letter: "D", bg: "#FFF0DC", label: "Sleeps on long journeys" },
      { letter: "D", bg: "#FFF0DC", label: "Motion sick" },
      { letter: "P", bg: "#FFE6EA", label: "No stairs, short walks" },
      { letter: "₹", bg: "#DFF0FF", label: "₹45K total" },
    ],
  },
  budget: 45, // ₹K
  modes: [
    {
      id: "drive", best: "Best fit for your family", icon: "car-20-blue",
      title: "Drive", sub: "Cab or your own car · door to door",
      metrics: [{ label: "Door to door", value: "~6 hrs" }, { label: "Return, for 5", value: "~₹14K est." }],
      cost: 14, travelLabel: "Travel ₹14K", leftLabel: "₹31K left for stay & days", tone: "ok",
      fits: [
        { ok: true, text: "Leave at 5 AM so she sleeps through it" },
        { ok: true, text: "Stop whenever she needs a break" },
        { ok: true, text: "No stairs, picked up at your door" },
        { ok: false, text: "A long sit for Papa, so I'll plan a break" },
      ],
      actions: [{ id: "chooseDrive", label: "Choose drive", primary: true }, { id: "journey", label: "See journey" }],
    },
    {
      id: "fly", icon: "plane-20-blue",
      title: "Fly to Pondicherry", sub: "Bengaluru → Pondicherry Airport · 1h 25m flight",
      metrics: [{ label: "Door to door", value: "~4 hrs" }, { label: "Return, for 5", value: "₹43K+" }],
      cost: 43, travelLabel: "Travel ₹43K", leftLabel: "Only ₹2K left for stay & days", tone: "over",
      fits: [
        { ok: true, text: "Shortest time on the road" },
        { bad: true, text: "Uses almost all of your ₹45K" },
        { ok: false, text: "Airport walking, so ask for wheelchair help for Papa" },
      ],
      actions: [{ id: "compare", label: "Compare with drive" }],
    },
  ],
  leftOut: {
    title: "Left out: Bus",
    reason: "About 7 hrs on winding roads, likely to upset her motion sickness, and steep steps to board for Papa.",
    action: "Show anyway",
  },
  tip: "You can ask about any way of getting there, anytime. Tap a mode below or just ask.",
  // "Ask about" chips above the input. `fly: true` = the over-budget edge case.
  askLabel: "Ask about:",
  ask: [
    { id: "car", label: "Car", icon: "car-13-indigo" },
    { id: "flight", label: "Flight", icon: "plane-13-indigo", fly: true },
    { id: "train", label: "Train", icon: "train-13-indigo" },
    { id: "bus", label: "Bus", icon: "bus-13-indigo" },
  ],
  inputPlaceholder: "Ask about getting there…",
  // Over budget: the parent picks Fly.
  flyText: "Let's fly",
  overBudget: "Flying leaves only ₹2K for the stay and days — not enough for 2 nights. Drive instead, or raise the budget?",
  overChips: [{ id: "goDrive", label: "Go with drive", primary: true }, { id: "raise", label: "Raise budget" }],
  endToast: "End of prototype — the rest is in the case study",
  toast: "Coming next", // See journey, Compare, Show anyway, other Ask-about chips
};

/* H08a — what Myra knows vs what's missing. `plan` items move to "known" once that plan step is done. */
export const itinerary = {
  intro: "I can draft one now, but it'll be rough. I don't know your places or how you're getting there yet, and those shape each day.",
  knownLabel: "WHAT I KNOW",
  missingLabel: "STILL MISSING",
  items: [
    { known: "Fri 28 – Sun 30 Nov, from Bengaluru" },
    { known: "Who's going and what each person needs" },
    { known: "₹45K for the whole trip" },
    { plan: "places", icon: "missing-map-pin", missing: "Which places you want to see", known: "The places you picked" },
    { plan: "travel", icon: "missing-route", missing: "How you're getting there", known: "How you're getting there" },
    { plan: "stay", icon: "missing-bed", missing: "Where you're staying", known: "Where you're staying" },
  ],
  ask: "Want a rough draft now, or pick a few places first? Places usually make the days much better.",
  chips: [
    { id: "draft", label: "Show rough draft", icon: "calendar-16-white", primary: true },
    { id: "places", label: "Pick places first", icon: "waves-16" },
  ],
};

/* H08b — the rough draft. Slot `open.go`: "travel" → H07a, "places" → H04 in this chat, "stay" → toast. */
export const draft = {
  working: {
    title: "Working on your request…",
    done: "Done!",
    steps: [{ title: "Sketching your days…", desc: "Fitting the days around her nap and Papa's pace." }],
  },
  intro: "Here's a rough shape for your weekend, built around her nap and Papa's pace. Dashed slots need your choices.",
  label: "Rough draft · not saved",
  days: [
    {
      title: "Fri 28 Nov", tag: "Arrive",
      slots: [
        { icon: "slot-sun", time: "Early", text: "Leave Bengaluru", open: { label: "How you're getting there", go: "travel" } },
        { icon: "slot-bed", time: "Late morning", text: "Check in, settle", open: { label: "Choose a stay", go: "stay" } },
        { icon: "slot-moon", time: "Afternoon", text: "Rest · her nap" },
        { icon: "slot-waves", time: "Evening", text: "Beach time", open: { label: "Pick a beach", go: "places" } },
      ],
    },
    {
      title: "Sat 29 Nov", tag: "Full day",
      slots: [
        { icon: "slot-waves", time: "Morning", text: "Beach, before it gets hot", open: { label: "Pick a beach", go: "places" } },
        { icon: "slot-moon", time: "Afternoon", text: "Lunch, rest · her nap" },
        { icon: "slot-coffee", time: "Evening", text: "Short, easy walk + early dinner" },
        { icon: "slot-moon", time: "Night", text: "Quiet evening for you two" },
      ],
    },
    {
      title: "Sun 30 Nov", tag: "Head home",
      slots: [
        { icon: "slot-coffee", time: "Morning", text: "Slow breakfast, one last outing", open: { label: "Pick a place", go: "places" } },
        { icon: "slot-route", time: "Afternoon", text: "Head home after lunch", open: { label: "How you're getting there", go: "travel" } },
      ],
    },
  ],
  ask: "The biggest gap is places. Want to start there?",
  chips: [
    { id: "places", label: "Pick places", icon: "waves-16-white", primary: true },
    { id: "travel", label: "How to get there", icon: "route-16" },
    { id: "keep", label: "Keep draft for later" },
  ],
  kept: "Saved as a draft. It'll fill in as you go.",
};

/* Shown in the prompt panel while Myra is working. */
export const busyHint = "Myra is working…";

/* What happens after the last step. */
export const ending = {
  toast: "Cab locked in. Next: where to stay",
  panelText: "Journey complete. Restart to try it again, or pick a scenario.",
};

/* Scenarios. `start` is the step the switcher jumps to.
   `notes`   — per-step banner shown on placeholders for this scenario
   `prompts` — per-step prompt overrides for this scenario
   `preset`  — state values loaded when the scenario starts */
export const scenarios = [
  {
    id: "happy", name: "Happy path",
    desc: "The full journey, from MMT home to a booked cab.",
    start: "h01",
    preset: { savedBeaches: [], travelMode: null },
  },
  {
    id: "overBudget", name: "Over budget",
    desc: "A stay is ₹2,400 over the ₹16K stay budget. Myra flags it before you choose.",
    start: "h06e", // the chat is rebuilt with the family and the 3 saved beaches, then H06e
    preset: { savedBeaches: ["promenade", "auroville", "serenity"], travelMode: null },
  },
  {
    id: "tooMany", name: "Too many beaches",
    desc: "5 beaches saved. The meter shows +1 over what fits.",
    start: "h06a",
    preset: { savedBeaches: ["promenade", "serenity", "auroville", "paradise", "rock"], travelMode: null },
    notes: { h06a: "5 saved → meter shows +1 in orange → Pair two / Keep best 4." },
    prompts: { h06a: ["Which two can we pair?", "Keep the best 4."] },
  },
  {
    id: "nothingSaved", name: "Nothing saved",
    desc: "No beaches saved yet. Empty state with a map of all beaches.",
    start: "h06a",
    preset: { savedBeaches: [], travelMode: null },
    notes: { h06a: "Empty state (H06c): map of all beaches + Skip for now." },
    prompts: { h06a: ["Just pick the best ones for us.", "Skip beaches for now."] },
  },
  {
    id: "pricesFailed", name: "Prices didn't load",
    desc: "The cab card fails to load prices. Retry or continue.",
    start: "h07c",
    preset: { savedBeaches: ["promenade", "serenity", "auroville"], travelMode: "drive" },
    notes: { h07c: "Cab card shows an error → Retry · Continue without." },
    prompts: { h07c: ["Try again.", "Continue without the cab for now."] },
  },
];

/* Helpers so other modules never index the arrays by hand. */
export const stepById = (id) => steps.find((s) => s.id === id);
export const stepIndex = (id) => steps.findIndex((s) => s.id === id);
export const scenarioById = (id) => scenarios.find((s) => s.id === id) || scenarios[0];

/* Prompts for a step (and its current sub-stage, if the step has stages).
   Each prompt is a string or { text, action }; this always returns objects. */
export function promptsFor(stepId, scenarioId, substep = null, state = null) {
  const step = stepById(stepId);
  const list = scenarioById(scenarioId).prompts?.[stepId]
    || (substep && step?.substepPrompts?.[substep])
    || step?.prompts || [];
  return list
    .map((p) => (typeof p === "string" ? { text: p } : p))
    .filter((p) => !p.requiresNeed || state?.needs?.some((n) => n.key === p.requiresNeed));
}

/* Evaluator note above the prompts at a chat stage, or null. */
export function promptNoteFor(stepId, substep) {
  return (substep && stepById(stepId)?.substepNotes?.[substep]) || null;
}

export function noteFor(stepId, scenarioId) {
  return scenarioById(scenarioId).notes?.[stepId] || null;
}
