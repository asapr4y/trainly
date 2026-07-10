import { mkdir, copyFile, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";

const dist = join(process.cwd(), "dist");
const output = join(process.cwd(), "outputs", "trainly");
const files = ["index.html", "styles.css", "app.js"];

await rm(dist, { recursive: true, force: true });
await rm(output, { recursive: true, force: true });
await mkdir(dist, { recursive: true });
await mkdir(output, { recursive: true });

for (const file of files) {
  await copyFile(join(process.cwd(), file), join(dist, file));
  await copyFile(join(process.cwd(), file), join(output, file));
}

await writeFile(
  join(output, "README.txt"),
  "Open index.html in a browser, or run npm.cmd run dev from the project folder to use the local server.\n"
);

console.log("Built Trainly into dist/ and outputs/trainly/.");
