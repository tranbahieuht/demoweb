import { mkdir, readFile, writeFile } from "node:fs/promises";
const photos = JSON.parse(
  await readFile(new URL("./photo-sources.json", import.meta.url), "utf8"),
);
await mkdir("public/images", { recursive: true });
const results = await Promise.allSettled(
  Object.entries(photos).map(async ([name, id]) => {
    const url = `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${name === "hero" ? 2400 : 1400}&q=85`;
    const res = await fetch(url);
    if (!res.ok || !res.headers.get("content-type")?.startsWith("image/"))
      throw new Error(`${name}: ${res.status}`);
    const bytes = new Uint8Array(await res.arrayBuffer());
    await writeFile(`public/images/${name}.jpg`, bytes);
    return `${name}: ${bytes.length} bytes`;
  }),
);
for (const result of results)
  console.log(
    result.status === "fulfilled" ? result.value : result.reason.message,
  );
if (results.some((r) => r.status === "rejected")) process.exitCode = 1;
