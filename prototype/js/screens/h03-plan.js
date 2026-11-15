/* H03 chat, continued — H03e "Where to start" (Figma 53:2), H08a what I know vs
   missing (53:115), H08b rough draft (53:236). Used by h03-chat-summary.js.
   `c` is the chat's shared toolkit: add, userSays, myraTyping, run, instant, stage,
   setBusy, isBusy, record, ctx, input, openFamilyEdit. */
import { paths, itinerary, draft, planCopy, family as fam } from "../../data/journey.js";
import { getState, setPlan } from "../state.js";
import { ms, myraText, myraLabel, fadeOut } from "../components/chat.js";
import { myraWorking } from "../components/myra-working.js";
import { pathOptions, infoHint, knownCard, choiceChips, draftLabel, dayCard, stagger } from "../components/itinerary.js";

/* Where each path leads: a screen to push, or a stage in this chat. */
const SCREEN = { places: "h04", travel: "h07a" };

export function planFlow(c) {
  let itineraryShown = false;

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
    goTo(open.go);
  }

  /* Checklist taps. */
  function planStep(id) {
    if (id === "family") return c.openFamilyEdit(null);
    if (id === "stay") return c.ctx.toast(planCopy.stayToast);
    if (id === "places") return goTo("places");
    if (id === "travel") return goTo("travel");
    if (id === "days") {
      if (itineraryShown) return c.scrollTo(".known, .day");
      const opt = paths.options.find((o) => o.id === "itinerary");
      return choosePath(opt.id, opt.title, "tapped");
    }
  }

  return { whereToStart, choosePath, choose, planStep };
}
