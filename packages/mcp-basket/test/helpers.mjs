import { mkdtemp, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

export async function withTemporaryStore(operation) {
  const directory = await mkdtemp(path.join(os.tmpdir(), "mcpbasket-"));

  try {
    return await operation(path.join(directory, "basket.json"));
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
}
