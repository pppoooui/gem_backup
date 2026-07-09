import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const packageJson = JSON.parse(
  readFileSync(new URL("../../package.json", import.meta.url), "utf8"),
);
const packageLock = JSON.parse(
  readFileSync(new URL("../../package-lock.json", import.meta.url), "utf8"),
);

describe("Linux Docker native dependencies", () => {
  it("locks the Lightning CSS binary required by Alpine x64 builds", () => {
    expect(
      packageJson.optionalDependencies?.["lightningcss-linux-x64-musl"],
    ).toBe("1.32.0");
    expect(
      packageLock.packages["node_modules/lightningcss-linux-x64-musl"],
    ).toMatchObject({
      version: "1.32.0",
      optional: true,
      os: ["linux"],
      cpu: ["x64"],
      libc: ["musl"],
    });
  });
});
