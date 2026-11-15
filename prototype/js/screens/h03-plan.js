/* H03 chat, continued — H03e "Where to start" (Figma 53:2), H04 Pondicherry (91:2),
   H05 sheet (32:128), H06a beach fit (33:2), H07a getting there (96:2),
   H08a what I know vs missing (53:115), H08b rough draft (53:236). Used by h03-chat-summary.js.
   `c` is the chat's shared toolkit: add, userSays, myraTyping, run, instant, stage,
   setBusy, isBusy, record, ctx, input, log, track, openFamilyEdit, scrollTo. */
import { paths, destination, beachesPage as beachesCopy, beachFit, hotels, travel, finalPlan as finalCopy, planSteps, itinerary, draft, planCopy, family as fam } from "../../data/journey.js";
import { checkedStrip, modeCard, leftOutRow } from "../components/travel.js";
import { hotelCard } from "../components/hotels.js";
import { finalDay, readyCard, bookingSheet } from "../components/final-plan.js";
import { html, esc } from "../dom.js";
import { envToast, pulseRestart } from "../env-toast.js";
import { reduceMotion } from "../components/chat.js";
import { getState, setState, setPlan, markVisited } from "../state.js";
import { systemNote, fitMeter, mapCard, savedList, myraTip } from "../components/beach-fit.js";
import { openSheet } from "../components/sheet.js";
import { beachesPage } from "../components/beaches-page.js";
import { ms, myraText, myraLabel, fadeOut } from "../components/chat.js";
import { myraWorking } from "../components/myra-working.js";
import { pathOptions, infoHint, knownCard, choiceChips, draftLabel, dayCard, stagger } from "../components/itinerary.js";
import { planningStrip, destinationCard, rainNote } from "../components/destination.js";

/* Built on another screen: the full map (H06b). Everything else stays in this chat. */
const SCREEN = { map: "h06b" };

export function planFlow(c) {
  let itineraryShown = false;
  let destinationShown = false;

  /* Leave the chat for a path built on another screen (not while replaying). */
  async function goTo(target, { afterBubble = false } = {}) {
    if (c.instant) return;
    if (afterBubble) await c.run.wait(ms("beforeNextScreen"));
    if (c.run.alive && getState().step === "h03") c.ctx.go(SCREEN[target]);
  }

  /* H03e — after the family is confirmed. */
  async function whereToStart() {
    setPlan("family", "done");
    await c.myraTyping();
    c.add(myraText(paths.ask));
    await c.run.wait(ms("betweenBlocks"));
    const cards = c.add(pathOptions(paths, { onPick: (o) => choosePath(o.id, o.title, "tapped") }), "none");
    if (!c.instant) cards.stagger(ms("cardStagger"));
    await c.run.wait(ms("betweenBlocks"));
    c.add(infoHint(paths.hint));
    c.input.setPlaceholder(fam.inputPlaceholder);
    c.stage({ substep: "paths" });
    c.setBusy(false);
  }

  /* A path card, a checklist step or a prompt. */
  async function choosePath(id, text, source) {
    if (c.isBusy()) return;
    if (id === "places") {
      if (destinationShown) return c.scrollTo(".around");
      // Tapping the card sends Figma's phrasing; a typed prompt sends what was typed.
      const said = source === "tapped" ? destination.userText : text;
      c.record({ type: "path", id, text: said, source });
      c.setBusy(true);
      await c.userSays(said, source);
      return showDestination();
    }
    if (id === "travel") return startTravel(text, source);
    c.record({ type: "path", id, text, source });
    if (id === "itinerary") {
      await c.userSays(text, source);
      return showItinerary();
    }
    c.setBusy(true);
    await c.userSays(text, source);
    await goTo(id, { afterBubble: true });
    c.setBusy(false);
  }

  /* H04 — Pondicherry, checked for the family. Places is now in progress. */
  async function showDestination() {
    c.setBusy(true);
    destinationShown = true;
    setPlan("places", "active");
    await c.myraTyping();
    c.add(myraText(destination.intro));
    await c.run.wait(ms("betweenBlocks"));
    c.track(c.add(planningStrip(destination.strip, { onEdit: () => c.openFamilyEdit(null) })));
    await c.run.wait(ms("betweenBlocks"));
    c.add(destinationCard(destination.card, { onExplore: openBeaches }));
    await c.run.wait(ms("betweenBlocks"));
    c.add(rainNote(destination.rain));
    await c.run.wait(ms("betweenBlocks"));
    c.add(myraText(destination.ask));
    c.add(choiceChips(destination.chips, { onChoose: (chip) => explore(chip.id) }));
    c.stage({ substep: "destination" });
    c.setBusy(false);
  }

  /* H04 next steps: beaches opens H05; things to do and areas to stay come next. */
  function explore(id) {
    if (id === "beaches") return openBeaches();
    c.ctx.toast(destination.chipToast);
  }

  /* H06a — the family has decided on three beaches (the demo's skip-ahead prompt).
     Saves them, ticks Places, then shows whether they fit. */
  let fitShown = false;
  async function decideBeaches(text, source) {
    if (c.isBusy() || fitShown) return;
    fitShown = true;
    c.record({ type: "decide", text, source });
    c.setBusy(true);
    await c.userSays(text, source);
    setState({ savedBeaches: [...beachFit.saved] });
    setPlan("places", "done");
    c.add(systemNote(beachFit.note), "none");

    await c.myraTyping();
    c.add(myraText(beachFit.intro));
    await c.run.wait(ms("betweenBlocks"));
    const meter = c.add(fitMeter(beachFit.meter));
    if (!c.instant) meter.fill();
    await c.run.wait(ms("betweenBlocks"));
    c.add(mapCard(beachFit.map, { onOpen: () => goTo("map") }));
    const names = beachFit.saved.map((id) => beachesCopy.beaches.find((b) => b.id === id).name);
    c.add(savedList(names));
    await c.run.wait(ms("betweenBlocks"));
    c.add(myraTip(beachFit.tip));
    await c.run.wait(ms("betweenBlocks"));
    c.add(myraText(beachFit.ask));
    c.add(choiceChips(beachFit.chips, {
      onChoose: (chip) => (chip.id === "hotels" ? showHotels(chip.label, "tapped") : c.ctx.toast(beachFit.chipToast)),
    }));
    c.stage({ substep: "fit" });
    markVisited("h06a");
    c.setBusy(false);
  }

  /* H06e — hotels around the saved beaches, checked against the ₹16K stay budget.
     From the H06a chip or prompt, or the map's "Show hotels around these beaches". */
  let hotelsShown = false, hotelKept = false;
  async function showHotels(text, source) {
    if (c.isBusy()) return;
    if (hotelsShown) return c.scrollTo(".hotel");
    hotelsShown = true;
    c.record({ type: "hotels", text, source });
    c.setBusy(true);
    await c.userSays(text, source);
    if (getState().savedBeaches.length) setPlan("places", "done");
    setPlan("stay", "active");

    c.add(myraLabel());
    const working = c.add(myraWorking(hotels.working));
    working.showStep(0, true);
    await c.run.wait(ms("hotelsWorking"));
    await working.finish(ms("workingCollapse"), c.instant);
    await c.run.wait(ms("beforeReply"));

    c.add(myraText(hotels.intro));
    for (const s of hotels.stays) {
      await c.run.wait(ms("betweenBlocks"));
      c.add(hotelCard(s, hotels));
    }
    await c.run.wait(ms("betweenBlocks"));
    c.add(myraText(hotels.ask));
    c.add(choiceChips(hotels.chips, { onChoose: (chip) => hotelChoice(chip.id, chip.label, "tapped") }));
    c.stage({ substep: "hotels" });
    markVisited("h06e");
    c.setBusy(false);
  }

  /* "Find a cheaper one" → toast. "Keep it anyway" → Myra confirms nothing is booked. */
  async function hotelChoice(id, text, source) {
    if (id === "cheaper") return c.ctx.toast(hotels.cheaperToast);
    if (c.isBusy() || hotelKept || !hotelsShown) return;
    hotelKept = true;
    c.record({ type: "keepHotel", text, source });
    c.setBusy(true);
    const row = [...c.log.querySelectorAll(".chat-actions")].at(-1);
    if (row) await fadeOut(row, c.instant);
    await c.userSays(text, source);
    await c.myraTyping();
    c.add(myraText(hotels.kept));
    c.stage({ substep: "hotelKept" });
    c.setBusy(false);
  }

  /* The skip-ahead note on the canvas, shown the moment the H09 prompt is tapped. */
  function announceFinalPlan() {
    envToast(finalCopy.skipToast);
  }

  /* H09 — the final plan (the demo's skip-ahead prompt after H06e), then booking.
     Every checklist step turns done, a loader ticks through, then three day cards
     and "Ready to book". */
  let finalShown = false, ready = null, booking = null;
  async function showFinalPlan(text, source) {
    if (c.isBusy() || finalShown) return;
    finalShown = true;
    c.record({ type: "finalPlan", text, source });
    c.setBusy(true);
    await c.userSays(text, source);
    setState({ travelMode: "cab" });

    // The checklist turns done one step after another (80ms apart, each pops).
    const paced = !c.instant && !reduceMotion.matches;
    for (const s of planSteps) {
      if (getState().plan[s.id] === "done") continue;
      setPlan(s.id, "done");
      if (paced) await c.run.wait(ms("planStagger"));
    }

    c.add(myraLabel());
    const working = c.add(myraWorking(finalCopy.working));
    for (let i = 0; i < finalCopy.working.steps.length; i++) {
      working.showStep(i, c.instant);
      await c.run.wait(ms("finalStep"));
    }
    await working.finish(ms("workingCollapse"), c.instant);
    await c.run.wait(ms("beforeReply"));

    c.add(myraText(finalCopy.intro));
    const days = finalCopy.days.map((d) => c.add(finalDay(d), "none"));
    if (!c.instant) stagger(days, ms("dayStagger"));
    await c.run.wait(ms("betweenBlocks"));
    ready = c.add(readyCard(finalCopy.book, { onBook: openBooking }));
    if (!c.instant) ready.grow();
    c.add(html(`<p class="final-note">${esc(finalCopy.nothingBooked)}</p>`));
    c.input.setAskAbout(finalCopy.quickLabel, finalCopy.quick, () => c.ctx.toast(finalCopy.quickToast));
    c.input.setPlaceholder(fam.inputPlaceholder);
    c.stage({ substep: "final" });
    markVisited("h09");
    c.setBusy(false);
  }

  /* "Book hotel" / "Book cab" → a sheet to confirm. */
  function openBooking(id) {
    if (c.isBusy() || booking || getState().booked[id]) return;
    const item = finalCopy.book.items.find((i) => i.id === id);
    const body = bookingSheet(item, finalCopy, {
      onConfirm: () => { booking?.close(); confirmBooking(id); },
      onLater: () => booking?.close(),
    });
    booking = openSheet({ title: item.sheet.title, body, onClose: () => { booking = null; } });
  }

  async function confirmBooking(id) {
    if (!ready || (!c.instant && getState().booked[id])) return;
    const item = finalCopy.book.items.find((i) => i.id === id);
    c.record({ type: "book", id });
    setState({ booked: { ...getState().booked, [id]: true } });
    ready.setBooked(id);
    if (!c.instant) c.ctx.toast(item.toast);
    const b = getState().booked;
    if (!(b.hotel && b.cab)) return;

    // Both booked: Myra wraps up, and the prototype ends.
    c.setBusy(true);
    await c.run.wait(ms("betweenBlocks"));
    await c.myraTyping();
    c.add(myraText(finalCopy.allBooked));
    c.stage({ substep: "booked" });
    c.setBusy(false);
    if (!c.instant) {
      envToast(finalCopy.endToast, 5000);
      pulseRestart();
    }
  }

  /* H07a — getting there, against the budget. From the map's "Show hotels…", the
     "How should we get there?" prompt, the H03e card, H08 chips/slots or the checklist. */
  let travelShown = false, flown = false;
  async function startTravel(text, source) {
    if (c.isBusy()) return;
    if (travelShown) return c.scrollTo(".mode");
    c.record({ type: "travel", text, source });
    c.setBusy(true);
    await c.userSays(text, source);
    return showTravel();
  }

  async function showTravel() {
    c.setBusy(true);
    travelShown = true;
    if (getState().savedBeaches.length) setPlan("places", "done");
    setPlan("travel", "active");
    await c.myraTyping();
    c.add(myraText(travel.intro));
    await c.run.wait(ms("betweenBlocks"));
    c.add(checkedStrip(travel.checked));
    for (const m of travel.modes) {
      await c.run.wait(ms("betweenBlocks"));
      const card = c.add(modeCard(m, travel.budget, { onAction: modeAction }));
      if (!c.instant) card.grow();
    }
    await c.run.wait(ms("betweenBlocks"));
    c.add(leftOutRow(travel.leftOut, { onShow: () => c.ctx.toast(travel.toast) }));
    c.add(myraTip(travel.tip));
    c.input.setAskAbout(travel.askLabel, travel.ask, (item) => (item.fly ? fly(travel.flyText, "tapped") : c.ctx.toast(travel.toast)));
    c.input.setPlaceholder(travel.inputPlaceholder);
    c.stage({ substep: "travel" });
    markVisited("h07a");
    c.setBusy(false);
  }

  function modeAction(id) {
    if (id === "chooseDrive") return c.ctx.toast(travel.endToast);
    c.ctx.toast(travel.toast);
  }

  /* Over budget: the parent picks Fly. */
  async function fly(text, source) {
    if (c.isBusy() || flown || !travelShown) return;
    flown = true;
    c.record({ type: "fly", text, source });
    c.setBusy(true);
    await c.userSays(text, source);
    await c.myraTyping();
    c.add(myraText(travel.overBudget));
    c.add(choiceChips(travel.overChips, { onChoose: () => c.ctx.toast(travel.endToast) }));
    c.stage({ substep: "overBudget" });
    c.setBusy(false);
  }

  /* H05 — the Pondicherry page as a sheet over the dimmed chat, on the Beaches tab.
     Closing it (✕, drag down, tap the dim area, Esc) returns to the chat. */
  let beaches = null;
  function openBeaches() {
    if (beaches || c.isBusy()) return;
    const body = beachesPage(beachesCopy, { onToast: (t) => c.ctx.toast(t), onClose: () => beaches?.close() });
    beaches = openSheet({
      title: `${beachesCopy.name} · Beaches`,
      body,
      variant: "page",
      dragFrom: ".bp__hero",
      onClose: () => { beaches = null; c.stage({ substep: "destination" }); },
    });
    c.stage({ substep: "beaches" });
  }

  /* H08a — what I know vs what's missing. */
  async function showItinerary() {
    c.setBusy(true);
    itineraryShown = true;
    await c.myraTyping();
    c.add(myraText(itinerary.intro));
    await c.run.wait(ms("betweenBlocks"));
    c.add(knownCard(itinerary));
    await c.run.wait(ms("betweenBlocks"));
    c.add(myraText(itinerary.ask));
    c.add(choiceChips(itinerary.chips, { onChoose: (chip) => choose(chip.id, chip.label, "tapped") }));
    c.stage({ substep: "itinerary" });
    c.setBusy(false);
  }

  /* A choice chip in H08a / H08b (or its prompt). */
  async function choose(id, text, source, chipRow = null) {
    if (c.isBusy()) return;
    c.record({ type: "choice", id, text, source });
    c.setBusy(true);
    const row = chipRow || [...c.log.querySelectorAll(".chat-actions")].at(-1);
    if (row) await fadeOut(row, c.instant);
    await c.userSays(text, source);
    if (id === "draft") return showDraft();
    if (id === "places") {
      if (!destinationShown) return showDestination();
      c.setBusy(false);
      return c.scrollTo(".around");
    }
    if (id === "keep") {
      await c.myraTyping();
      c.add(myraText(draft.kept));
      return c.setBusy(false);
    }
    if (id === "travel") {
      if (!travelShown) return showTravel();
      c.setBusy(false);
      return c.scrollTo(".mode");
    }
    c.setBusy(false);
  }

  /* H08b — the rough draft. */
  async function showDraft() {
    c.add(myraLabel());
    const working = c.add(myraWorking(draft.working));
    working.showStep(0, true);
    await c.run.wait(ms("familyWorking"));
    await working.finish(ms("workingCollapse"), c.instant);
    await c.run.wait(ms("beforeReply"));

    c.add(myraText(draft.intro));
    c.add(draftLabel(draft.label));
    await c.run.wait(ms("betweenBlocks"));
    const days = draft.days.map((d) => c.add(dayCard(d, { onSlot: openSlot }), "none"));
    if (!c.instant) stagger(days, ms("cardStagger") * 2);
    setPlan("days", "draft");
    await c.run.wait(ms("betweenBlocks"));
    c.add(myraText(draft.ask));
    c.add(choiceChips(draft.chips, { onChoose: (chip) => choose(chip.id, chip.label, "tapped") }));
    c.stage({ substep: "draft" });
    c.setBusy(false);
  }

  function openSlot(open) {
    if (open.go === "stay") return c.ctx.toast(planCopy.stayToast);
    if (open.go === "places") return choosePath("places", destination.userText, "tapped");
    if (open.go === "travel") return startTravel(travel.userText, "tapped");
  }

  /* Checklist taps. */
  function planStep(id) {
    if (id === "family") return c.openFamilyEdit(null);
    if (id === "stay") return hotelsShown ? c.scrollTo(".hotel") : c.ctx.toast(planCopy.stayToast);
    if (id === "places") return choosePath("places", destination.userText, "tapped");
    if (id === "travel") return startTravel(travel.userText, "tapped");
    if (id === "days") {
      if (itineraryShown) return c.scrollTo(".known, .day");
      const opt = paths.options.find((o) => o.id === "itinerary");
      return choosePath(opt.id, opt.title, "tapped");
    }
  }

  return {
    whereToStart, choosePath, choose, explore, planStep, openBeaches, decideBeaches,
    showHotels, hotelChoice, announceFinalPlan, showFinalPlan, confirmBooking, startTravel, fly,
    closeBooking: () => booking?.close(),
    get beachesOpen() { return !!beaches; },
    closeBeaches: () => beaches?.close(),
  };
}
