// Public barrel for the lead-capture system.
//
// Two flavors:
//   • InlineBlock — drop into any server-rendered section. Surface-aware
//     copy (homepage / service / blog-mid / blog-end / footer / sitewide).
//   • StickyBar + ExitIntent — site-wide client islands; mount once in
//     the root layout. Path- and channel-suppressed automatically.
//
// State is per-browser localStorage (see ./state.ts). Frequency cap
// suppresses re-asks; once a visitor subscribes anywhere, every variant
// goes quiet for a year.

export { CaptureForm } from "./CaptureForm";
export { InlineBlock } from "./InlineBlock";
export { StickyBar } from "./StickyBar";
export { ExitIntent } from "./ExitIntent";
export type { CaptureContext, CaptureCopy, Locale } from "./copy";
export { getCopy } from "./copy";
