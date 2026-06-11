import React from "react";

// WDYR patches React with browser-only instanceof checks (Element, Node, etc).
// The guard below ensures it NEVER runs on the Node.js SSR server —
// layout.tsx requires this file at module scope (a Server Component),
// so without the window check the server would throw:
//   "TypeError: Right hand side of instanceof is not an object"
if (process.env.NODE_ENV === "development" && typeof window !== "undefined") {
  const whyDidYouRender =
    require("@welldone-software/why-did-you-render");

  whyDidYouRender(React, {
    trackAllPureComponents: true,
  });
}