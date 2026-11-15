/* Screen registry: step id -> screen module. One module per screen. */
import h01 from "./h01-home.js";
import h02 from "./h02-myra-home.js";
import h03 from "./h03-chat-summary.js";
import h06b from "./h06b-map.js";
import h07a from "./h07a-chat-modes.js";
import h07b from "./h07b-chat-train.js";
import h07c from "./h07c-chat-drive.js";

/* H03e, H04, H05 (a sheet), H06a and H08 live inside the H03 chat (h03-plan.js), not as screens. */
export const screens = { h01, h02, h03, h06b, h07a, h07b, h07c };
