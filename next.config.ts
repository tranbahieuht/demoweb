import createNextIntlPlugin from "next-intl/plugin";
import type { NextConfig } from "next";
const config: NextConfig = {
  images: {
    remotePatterns: [{ protocol: "https", hostname: "images.unsplash.com" }],
  },
  poweredByHeader: false,
  devIndicators: false,
};
export default createNextIntlPlugin("./src/i18n/request.ts")(config);
