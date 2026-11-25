// OpenNext adapter config for Cloudflare Workers. Every page reads the team API at request time and keeps the
// answer in the "use cache" store for 60 s, so there is no ISR to persist and no R2 bucket is needed.
import { defineCloudflareConfig } from "@opennextjs/cloudflare";

export default defineCloudflareConfig({});
