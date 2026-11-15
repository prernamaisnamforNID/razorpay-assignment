/* Screen registry: step id -> screen module. One module per screen. */
import h01 from "./h01-home.js";
import h02 from "./h02-myra-home.js";
import h03 from "./h03-chat-summary.js";
import h04 from "./h04-chat-destination.js";
import h05 from "./h05-beaches-sheet.js";
import h06a from "./h06a-chat-fit.js";
import h06b from "./h06b-map.js";
import h07a from "./h07a-chat-modes.js";
import h07b from "./h07b-chat-train.js";
import h07c from "./h07c-chat-drive.js";

export const screens = { h01, h02, h03, h04, h05, h06a, h06b, h07a, h07b, h07c };
