// BetterAuth route handler (sign-in / sign-out / session). Mounted at
// /api/auth/* — referenced by the admin sign-in form and by getSession().
//
// Cache-Control: no-store inherited from BetterAuth's handler (cookies +
// dynamic session state).

import { toNextJsHandler } from "better-auth/next-js";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

export const { GET, POST } = toNextJsHandler(auth);
