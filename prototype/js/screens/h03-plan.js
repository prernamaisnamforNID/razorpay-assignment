/* H03 chat, continued — H03e "Where to start" (Figma 53:2), H04 Pondicherry (91:2),
   H08a what I know vs missing (53:115), H08b rough draft (53:236). Used by h03-chat-summary.js.
   `c` is the chat's shared toolkit: add, userSays, myraTyping, run, instant, stage,
   setBusy, isBusy, record, ctx, input, log, track, openFamilyEdit, scrollTo. */
import { paths, destination, beachesPage as beachesCopy, itinerary, draft, planCopy, family as fam } from "../../data/journey.js";
import { getState, setPlan } from "../state.js";
import { openSheet } from "../components/sheet.js";
import { beachesPage } from "../components/beaches-page.js";
import { ms, myraText, myraLabel, fadeOut } from "../components/chat.js";
import { myraWorking } from "../components/myra-working.js";
import { pathOptions, infoHint, knownCard, choiceChips, draftLabel, dayCard, stagger } from "../components/itinerary.js";
import { planningStrip, destinationCard, rainNote } from "../components/destination.js";

/* Paths built on another screen. "places" (H04) and "itinerary" (H08) stay in this chat. */
const SCREEN = { travel: "h07a" };

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
    await goTo(id, { afterBubble: true });
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
    goTo(open.go);
  }

  /* Checklist taps. */
  function planStep(id) {
    if (id === "family") return c.openFamilyEdit(null);
    if (id === "stay") return c.ctx.toast(planCopy.stayToast);
    if (id === "places") return choosePath("places", destination.userText, "tapped");
    if (id === "travel") return goTo("travel");
    if (id === "days") {
      if (itineraryShown) return c.scrollTo(".known, .day");
      const opt = paths.options.find((o) => o.id === "itinerary");
      return choosePath(opt.id, opt.title, "tapped");
    }
  }

  return {
    whereToStart, choosePath, choose, explore, planStep, openBeaches,
    get beachesOpen() { return !!beaches; },
    closeBeaches: () => beaches?.close(),
  };
}
