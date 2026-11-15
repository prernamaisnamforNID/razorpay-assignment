/* H03 · Trip summary + family conversation — one chat thread.
   Figma: 25:2 / 28:2 (trip summary, daughter question), 48:2 (daughter understood →
   grandparents), 48:89 (grandparents understood → you two), 48:177 (family summary).
     1 user message → 2 Myra working → 3 trip summary, waits for "Looks right"
     4 daughter question → 5 parents question → 6 you-two question
     7 family summary, waits → 8 confirmed → H03e where to start (+ plan checklist)
     → H04 Pondicherry or H08a/H08b itinerary in this chat, or H07a (see h03-plan.js)
   Copy + timings: data/journey.js (h03, familyGroups, family, destination, timing). */
import { html, esc, sprite, SHEET_MYRA } from "../dom.js";
import { h03 as copy, myraHome, family as fam, familyGroups, promptsFor, paths, destination, beachesPage as beachesCopy, hotels, travel } from "../../data/journey.js";
import { getState, setState, subscribe } from "../state.js";
import { planChecklist } from "../components/plan-checklist.js";
import { planFlow } from "./h03-plan.js";
import { addNeeds, removeNeed, people, peopleOrder, personPills } from "../family.js";
import { myraInput } from "../components/myra-input.js";
import { myraWorking } from "../components/myra-working.js";
import { tripSummary } from "../components/trip-summary.js";
import { questionCard, avatarStack } from "../components/question-card.js";
import { understoodCard, removePill } from "../components/understood-card.js";
import { familySummary } from "../components/family-summary.js";
import { openSheet } from "../components/sheet.js";
import {
  ms, createRun, clock, append, fadeOut, scrollToEnd,
  myraLabel, myraText, userBubble, timestamp, typingDots,
} from "../components/chat.js";

const ID = "h03";

/* What the parent has done so far, so Back from H04 rebuilds the chat instantly. */
let reached = { message: null, actions: [] };

function template() {
  return `
  <section class="chat-screen" aria-label="Chat with Myra">
    <header class="chat-head">
      <button class="myra-circle myra-circle--chat tap" type="button" data-back aria-label="Back">
        <img class="icon" src="assets/icons/chevron-left.svg" width="22" height="22" alt="" draggable="false">
      </button>
      ${sprite("Myra wordmark", 62, 27, 712, 3636.36, -300, -336.36, "", SHEET_MYRA)}
      <button class="myra-circle myra-circle--chat tap" type="button" aria-label="More options">
        <img class="icon" src="assets/icons/ellipsis.svg" width="22" height="22" alt="" draggable="false">
      </button>
    </header>
    <div class="screen__scroll chat-scroll">
      <div class="chat-log" aria-live="polite"></div>
    </div>
  </section>`;
}

export default {
  theme: "light",
  statusIcons: true,

  render(ctx) {
    const el = html(template());
    const log = el.querySelector(".chat-log");
    const input = myraInput({ placeholder: myraHome.inputPlaceholder, onTap: ctx.inputTap, variant: "chat" });
    el.append(input);

    const message = getState().firstMessage || myraHome.cards[0].text;
    const jump = getState().jumpTo;   // tracker jump into the middle of this chat
    let replay = ctx.transition === "pop" && reached.message === message;
    let seed = false;
    if (jump) {
      setState({ jumpTo: null });
      replay = seed = true;
      reached = { message, actions: seedActions(jump) };
    }
    if (!replay) reached = { message, actions: [] };
    if (!replay || seed) {
      setState({
        needs: [],
        plan: { family: "todo", places: "todo", travel: "todo", stay: "todo", days: "todo" },
        booked: { hotel: false, cab: false },
      });
    }

    const run = createRun({ instant: replay });
    el.run = run;
    // Something another screen asked the chat to do next (e.g. the map → getting there).
    const next = getState().chatNext;
    if (next) setState({ chatNext: null });

    el.convo = conversation({
      log, input, ctx, run, message, seed,
      replayActions: replay ? [...reached.actions] : [],
      openBeaches: jump === "h05", // tracker jump to H05: open the page once the chat is rebuilt
      next,
    });

    const checklist = planChecklist({ onStep: (id) => el.convo.planStep(id) });
    el.querySelector(".chat-head").after(checklist);
    el.checklist = checklist;

    el.querySelector("[data-back]").addEventListener("click", ctx.back);
    el.convo.start();
    return el;
  },

  destroy(el) {
    el.run.stop();
    el.convo.cleanup();
    el.checklist.destroy();
  },

  onPrompt(text, { el }) {
    el.convo.prompt(text);
  },
};

/* ---------------------------------------------------------------------- */

/* The default answers used when the tracker jumps straight to a later stage. */
function seedActions(target) {
  const p = (sub) => promptsFor(ID, "happy", sub)[0];
  const actions = [
    { type: "confirmTrip", text: copy.confirm.yes, source: "tapped" },
    ...["question", "parents", "you"].map((sub, i) => ({ type: "answer", i, text: p(sub).text, source: p(sub).source, needs: p(sub).needs })),
    { type: "confirmFamily", text: fam.confirm.yes, source: "tapped" },
  ];
  if (target === "h08") {
    const opt = paths.options.find((o) => o.id === "itinerary");
    actions.push({ type: "path", id: opt.id, text: opt.title, source: "tapped" });
  }
  if (["h04", "h05", "h06a", "h06e", "h07a", "h09"].includes(target)) {
    actions.push({ type: "path", id: "places", text: destination.userText, source: "tapped" });
  }
  if (["h06a", "h06e", "h07a", "h09"].includes(target)) {
    const decide = promptsFor(ID, "happy", "destination").find((x) => x.action === "decide");
    actions.push({ type: "decide", text: decide.text, source: "typed" });
  }
  if (target === "h06e" || target === "h09") {
    actions.push({ type: "hotels", text: hotels.userText, source: "tapped" });
  }
  if (target === "h09") {
    const final = promptsFor(ID, "happy", "hotels").find((x) => x.action === "finalPlan");
    actions.push({ type: "finalPlan", text: final.text, source: "tapped" });
  }
  if (target === "h07a") {
    actions.push({ type: "travel", text: travel.userText, source: "typed" });
  }
  return actions;
}

function conversation({ log, input, ctx, run, message, seed, replayActions, openBeaches, next }) {
  let instant = run.instant; // true while replaying; the chat goes live after
  const time = () => clock(copy.timestamp);
  const stamp = (source) => (source ? `${fam.sources[source]} · ${time()}` : time());

  let tripCard = null, tripConfirm = null, tripConfirmed = false;
  let groupIndex = -1, question = null;      // current family question
  let famCard = null, famConfirm = null, famConfirmed = false;
  let sheet = null, busy = false;
  const live = [];                           // cards that re-render when needs change

  const stage = (patch) => { if (getState().step === ID && run.alive) setState(patch); };
  const setBusy = (on) => { busy = on; stage({ busy: on }); };
  const add = (node, anim) => append(log, node, { anim, instant });
  const record = (action) => { if (!instant) reached.actions.push(action); };

  let lastNeeds = getState().needs;
  const unsubscribe = subscribe((s) => {
    if (s.needs === lastNeeds) return;
    lastNeeds = s.needs;
    live.forEach((c) => c.refresh());
  });

  async function userSays(text, source) {
    add(userBubble(text), "user");
    add(timestamp(stamp(source), "right"), "none");
  }

  async function myraTyping() {
    add(myraLabel());
    if (instant) return;
    const dots = add(typingDots());
    await run.wait(ms("typingDots"));
    dots.remove();
  }

  /* ---------- Stages 1–3: trip summary ---------- */
  async function start() {
    await userSays(message);
    stage({ substep: "confirm" });
    setBusy(true);
    await run.wait(ms("afterUserMessage"));

    add(myraLabel());
    const working = add(myraWorking(copy.working));
    for (let i = 0; i < copy.working.steps.length; i++) {
      working.showStep(i, instant);
      await run.wait(ms("workingStep"));
    }
    await working.finish(ms("workingCollapse"), instant);
    await run.wait(ms("beforeReply"));

    add(myraText(copy.intro));
    await run.wait(ms("betweenBlocks"));
    tripCard = add(tripSummary(copy.summary, { onEdit: (id) => openTripEdit(id) }));
    if (!instant) tripCard.stagger(ms("cardStagger"));
    await run.wait(ms("betweenBlocks"));
    tripConfirm = add(confirmBlock(copy.confirm, () => confirmTrip(copy.confirm.yes, "tapped"), () => openTripEdit(null)));
    setBusy(false);

    for (const a of replayActions) await replayAction(a);
    instant = run.instant = false;
    if (openBeaches) plan.openBeaches();
    if (next?.type === "travel") plan.startTravel(next.text, next.source);
    if (next?.type === "hotels") plan.showHotels(next.text, next.source);
  }

  function confirmBlock(c, onYes, onChange, nextHint) {
    const block = html(`
      <div class="chat-confirm">
        <p class="chat-text">${esc(c.ask)}</p>
        <div class="chat-actions">
          <button class="chip chip--primary tap" type="button" data-yes>${esc(c.yes)}</button>
          <button class="chip tap" type="button" data-change>${esc(c.change)}</button>
        </div>
        ${nextHint ? `<p class="chat-next"><img class="icon" src="assets/brand/myra-sparkle-12.svg" width="12" height="12" alt="">${esc(nextHint)}</p>` : ""}
      </div>`);
    block.querySelector("[data-yes]").addEventListener("click", onYes);
    block.querySelector("[data-change]").addEventListener("click", onChange);
    return block;
  }

  /* ---------- Stage 4: trip confirmed → daughter question ---------- */
  async function confirmTrip(text, source) {
    if (tripConfirmed || busy) return;
    tripConfirmed = true;
    record({ type: "confirmTrip", text, source });
    setBusy(true);

    await fadeOut(tripConfirm.querySelector(".chat-actions"), instant);
    await userSays(text, source);
    tripCard.setConfirmed(instant);

    await myraTyping();
    add(myraText(copy.question.lead));
    await run.wait(ms("betweenBlocks"));
    askGroup(0, copy.question);
    setBusy(false);
  }

  function askGroup(i, q) {
    const group = familyGroups[i];
    groupIndex = i;
    question = add(questionCard(q, {
      chips: group.chips,
      sendLabel: fam.send,
      onSend: (chips) => answer(i, { text: sentence(group, chips), source: "tapped", needs: chips.map((c) => ({ key: c.need })) }),
      onSkip: (label) => answer(i, { text: label, source: "tapped", needs: [] }),
    }));
    input.setPlaceholder(q.inputPlaceholder);
    stage({ substep: group.substep });
  }

  /* ---------- Stages 5–7: an answer to a family question ---------- */
  async function answer(i, { text, source, needs }) {
    if (busy || i !== groupIndex) return;
    const group = familyGroups[i];
    record({ type: "answer", i, text, source, needs });
    setBusy(true);
    question.disable();
    input.setPlaceholder(fam.inputPlaceholder);

    await userSays(text, source);
    if (!instant || seed) addNeeds(group.id, needs);

    await myraTyping();
    if (needs.length) {
      const avatars = group.people.flatMap((p) => people[p].avatars);
      const card = add(understoodCard(
        { groupId: group.id, avatars, title: group.understoodTitle, footer: fam.understoodFooter, empty: fam.nothingNoted },
        { onEdit: (person) => openFamilyEdit(person) },
      ));
      live.push(card);
      await run.wait(ms("betweenBlocks"));
      const reply = group.replies.find((r) => !r.if || r.if.some((k) => needs.some((n) => n.key === k)));
      if (reply) add(myraText(reply.text));
    } else {
      add(myraText(group.skipReply));
    }

    const next = familyGroups[i + 1];
    if (next) {
      await run.wait(ms("betweenBlocks"));
      if (next.lead) { add(myraText(next.lead)); await run.wait(ms("betweenBlocks")); }
      askGroup(i + 1, next.question);
      setBusy(false);
    } else {
      await showFamily();
    }
  }

  /* ---------- Stage 7: family summary, then wait ---------- */
  async function showFamily() {
    stage({ substep: "family" });
    await run.wait(ms("betweenBlocks"));
    const working = add(myraWorking(fam.working));
    working.showStep(0, true);
    await run.wait(ms("familyWorking"));
    await working.finish(ms("workingCollapse"), instant);
    await run.wait(ms("beforeReply"));

    add(myraText(fam.intro));
    await run.wait(ms("betweenBlocks"));
    famCard = add(familySummary(fam.summary, { onEdit: (person) => openFamilyEdit(person) }));
    live.push(famCard);
    await run.wait(ms("betweenBlocks"));
    famConfirm = add(confirmBlock(fam.confirm, () => confirmFamily(fam.confirm.yes, "tapped"), () => openFamilyEdit(null), fam.confirm.next));
    input.setPlaceholder(fam.inputPlaceholder);
    setBusy(false);
  }

  /* ---------- Stage 8: confirmed → H04 ---------- */
  async function confirmFamily(text, source) {
    if (famConfirmed || busy || !famConfirm) return;
    famConfirmed = true;
    record({ type: "confirmFamily", text, source });
    setBusy(true);

    await fadeOut(famConfirm.querySelector(".chat-actions"), instant);
    famConfirm.append(famConfirm.querySelector(".chat-next")); // the hint stays as the hand-off label
    await userSays(text, source);
    famCard.setConfirmed(instant);
    await plan.whereToStart();
  }

  async function replayAction(a) {
    if (a.type === "confirmTrip") return confirmTrip(a.text, a.source);
    if (a.type === "answer") return answer(a.i, a);
    if (a.type === "confirmFamily") return confirmFamily(a.text, a.source);
    if (a.type === "path") return plan.choosePath(a.id, a.text, a.source);
    if (a.type === "choice") return plan.choose(a.id, a.text, a.source);
    if (a.type === "decide") return plan.decideBeaches(a.text, a.source);
    if (a.type === "hotels") return plan.showHotels(a.text, a.source);
    if (a.type === "keepHotel") return plan.hotelChoice("keep", a.text, a.source);
    if (a.type === "finalPlan") return plan.showFinalPlan(a.text, a.source);
    if (a.type === "book") return plan.confirmBooking(a.id);
    if (a.type === "travel") return plan.startTravel(a.text, a.source);
    if (a.type === "fly") return plan.fly(a.text, a.source);
  }

  /* ---------- Edit sheets ---------- */
  function openTripEdit(focusId, { reask = false } = {}) {
    if (sheet || busy) return;
    const s = copy.editSheet;
    const body = html(`
      <div class="edit">
        <ul class="edit__list">
          ${copy.summary.cards.map((c) => `
            <li class="edit__row${c.id === focusId ? " is-focused" : ""}">
              <span class="ts-card__icon"><img class="icon" src="assets/icons/${c.icon}.svg" width="18" height="18" alt=""></span>
              <span class="edit__text">
                <span class="edit__label">${esc(c.label)}</span>
                <span class="edit__value">${esc(c.value)}</span>
                <span class="edit__note">${esc(c.note)}</span>
              </span>
              <img class="icon" src="assets/icons/pencil.svg" width="15" height="15" alt="">
            </li>`).join("")}
        </ul>
        <p class="edit__hint">${esc(s.hint)}</p>
        <button class="edit__done tap" type="button">${esc(s.done)}</button>
      </div>`);
    sheet = openSheet({
      title: s.title,
      body,
      onClose: () => {
        sheet = null;
        if (reask && !tripConfirmed) { log.append(tripConfirm); scrollToEnd(log); }
      },
    });
    body.querySelector(".edit__done").addEventListener("click", () => sheet?.close());
    body.querySelector(".is-focused")?.scrollIntoView({ block: "nearest" });
  }

  function openFamilyEdit(focusId) {
    if (sheet || busy) return;
    const s = fam.editSheet;
    const body = html(`
      <div class="edit">
        <ul class="edit__list fedit"></ul>
        <p class="edit__hint">${esc(s.hint)}</p>
        <button class="edit__done tap" type="button">${esc(s.done)}</button>
      </div>`);
    const list = body.querySelector(".fedit");
    const render = () => {
      list.innerHTML = peopleOrder.map((id) => {
        const pills = personPills(id);
        return `
          <li class="edit__row fedit__row${id === focusId ? " is-focused" : ""}" data-person="${id}">
            ${avatarStack(people[id].avatars, "fs__avatar")}
            <span class="edit__text">
              <span class="edit__value">${esc(people[id].name)}</span>
              <span class="fedit__pills">
                ${pills.length ? pills.map((p) => `
                  <span class="pill" data-key="${p.key}">
                    <span class="pill__label">${esc(p.label)}</span>
                    <button class="pill__x tap" type="button" aria-label="Remove ${esc(p.label)}">
                      <img class="icon" src="assets/icons/x-pill.svg" width="13" height="13" alt="">
                    </button>
                  </span>`).join("") : `<span class="fs__none">${esc(fam.summary.none)}</span>`}
              </span>
            </span>
          </li>`;
      }).join("");
    };
    render();
    const off = subscribe(render);
    list.addEventListener("click", (e) => {
      const x = e.target.closest(".pill__x");
      if (!x) return;
      const pill = x.closest(".pill");
      removePill(pill, () => removeNeed(pill.dataset.key, pill.closest("[data-person]").dataset.person));
    });
    sheet = openSheet({ title: s.title, body, onClose: () => { off(); sheet = null; } });
    body.querySelector(".edit__done").addEventListener("click", () => sheet?.close());
    body.querySelector(".is-focused")?.scrollIntoView({ block: "nearest" });
  }

  /* ---------- "Try saying" prompts ---------- */
  async function prompt(text) {
    // The H05 page is open over the chat: its questions are answered there next.
    if (plan.beachesOpen) return ctx.toast(beachesCopy.toast);
    if (busy || sheet) return;
    const state = getState();
    const p = promptsFor(ID, state.scenario, state.substep, state).find((x) => x.text === text);
    if (!p) return ctx.toast(`You said: “${text}”`);

    busy = true;
    if (p.action === "finalPlan") plan.announceFinalPlan(); // canvas note, right away
    await input.typeInto(text, ms("typePerChar"));
    input.clear();
    busy = false;
    if (!run.alive) return;

    switch (p.action) {
      case "confirm": return confirmTrip(text, "typed");
      case "editBudget":
        await userSays(text, "typed");
        return openTripEdit("budget", { reask: true });
      case "answer": return answer(groupIndex, { text, source: p.source || "typed", needs: p.needs || [] });
      case "confirmFamily": return confirmFamily(text, p.source || "typed");
      case "removeNeed": {
        await userSays(text, "typed");
        const pills = [...log.querySelectorAll(`[data-key="${p.need}"]`)];
        await Promise.all(pills.map((pill) => new Promise((done) => removePill(pill, done))));
        removeNeed(p.need);
        log.append(famConfirm); // ask again at the bottom
        scrollToEnd(log);
        return;
      }
      case "path": {
        const opt = paths.options.find((o) => o.id === p.path);
        return plan.choosePath(opt.id, text, "typed");
      }
      case "choice": return plan.choose(p.choice, text, "typed");
      case "explore": return plan.explore(p.explore);
      case "decide": return plan.decideBeaches(text, "typed");
      case "hotels": return plan.showHotels(text, "typed");
      case "cheaper": return plan.hotelChoice("cheaper", text, "typed");
      case "keepHotel": return plan.hotelChoice("keep", text, "typed");
      case "finalPlan": return plan.showFinalPlan(text, "tapped");
      case "travel": return plan.startTravel(text, "typed");
      case "fly": return plan.fly(text, "typed");
      default: return ctx.toast(`You said: “${text}”`);
    }
  }

  /* Join chip phrases into one sentence: "She naps in the day and gets motion sick." */
  function sentence(group, chips) {
    const parts = chips.map((c) => c.phrase);
    const joined = parts.length > 1 ? `${parts.slice(0, -1).join(", ")} and ${parts.at(-1)}` : parts[0];
    return `${group.subject} ${joined}.`;
  }

  function cleanup() {
    unsubscribe();
    sheet?.close();
    plan.closeBeaches();
    plan.closeBooking();
    tripCard?.destroy();
  }

  /* Shared toolkit for the plan stages (h03-plan.js). */
  const plan = planFlow({
    add, userSays, myraTyping, run, stage, setBusy, record, ctx, input, log,
    get instant() { return instant; },
    isBusy: () => busy || !!sheet,
    track: (card) => live.push(card),   // re-renders when family needs change
    openFamilyEdit,
    scrollTo: (sel) => {
      const target = log.querySelector(sel);
      const scroller = log.closest(".screen__scroll");
      if (target && scroller) scroller.scrollTo({ top: target.offsetTop - 12, behavior: "smooth" });
    },
  });

  return { start, prompt, cleanup, planStep: (id) => plan.planStep(id) };
}

