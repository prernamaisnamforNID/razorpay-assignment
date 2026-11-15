/* Family needs — one source of truth in state.needs: [{ key, who: [personId, …] }].
   The understood cards, the family summary and the edit sheet all read from here. */
import { getState, setState } from "./state.js";
import { needs as NEEDS, people, peopleOrder, familyGroups } from "../data/journey.js";

export const groupById = (id) => familyGroups.find((g) => g.id === id);

/* Add needs for a group. Each item: { key, who? } — `who` defaults to everyone in the group. */
export function addNeeds(groupId, items) {
  const group = groupById(groupId);
  const list = getState().needs.filter((n) => !items.some((i) => i.key === n.key));
  items.forEach((i) => list.push({ key: i.key, who: [...(i.who || group.people)] }));
  setState({ needs: list });
}

/* Remove a need for one person, or for everyone when personId is omitted. */
export function removeNeed(key, personId = null) {
  const list = getState().needs
    .map((n) => (n.key !== key || !personId ? n : { ...n, who: n.who.filter((p) => p !== personId) }))
    .filter((n) => !(n.key === key && (!personId || n.who.length === 0)));
  setState({ needs: list });
}

export const hasNeed = (key) => getState().needs.some((n) => n.key === key);
export const needLabel = (key) => NEEDS[key]?.label || key;

/* Pills for an understood card: "Pure veg (both)", "Short walks (Papa)". */
export function groupPills(groupId) {
  const group = groupById(groupId);
  return getState().needs
    .filter((n) => NEEDS[n.key]?.group === groupId)
    .map((n) => {
      let label = needLabel(n.key);
      if (group.people.length > 1) {
        label += n.who.length === group.people.length
          ? " (both)"
          : ` (${n.who.map((p) => people[p].name).join(", ")})`;
      }
      return { key: n.key, label, person: n.who[0] };
    });
}

/* Pills for one person in the family summary / edit sheet. */
export function personPills(personId) {
  return getState().needs
    .filter((n) => n.who.includes(personId))
    .map((n) => ({ key: n.key, label: needLabel(n.key) }));
}

/* Pills for H04's "Planning around" strip: one per need that has a `strip` label,
   on the first person it applies to. Needs with the same `join` for the same person
   share a pill ("Short walks, no stairs"). Returns [{ person, label }]. */
export function stripPills() {
  const out = [];
  getState().needs.forEach((n) => {
    const def = NEEDS[n.key];
    if (!def?.strip || !n.who.length) return;
    const person = n.who[0];
    const pill = out.find((p) => p.person === person && ((def.join && p.join === def.join) || p.labels.includes(def.strip)));
    if (!pill) out.push({ person, join: def.join, labels: [def.strip] });
    else if (!pill.labels.includes(def.strip)) pill.labels.push(def.strip);
  });
  return out.map((p) => ({
    person: p.person,
    label: p.labels.map((l, i) => (i ? l.toLowerCase() : l)).join(", "),
  }));
}

/* "N things to keep in mind" — one per person per need. */
export const needCount = () => getState().needs.reduce((sum, n) => sum + n.who.length, 0);

export { people, peopleOrder };
