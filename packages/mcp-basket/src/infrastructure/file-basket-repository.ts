import { randomUUID } from "node:crypto";
import { mkdir, open, readFile, rename, rm, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { BasketSchema, type Basket } from "../domain/index.js";
import type { BasketRepository } from "../application/contracts.js";

const LOCK_RETRY_MS = 25;
const LOCK_TIMEOUT_MS = 5_000;
const STALE_LOCK_MS = 30_000;

export class BasketStorageLockError extends Error {
  constructor(filePath: string) {
    super(`Timed out waiting for the MCPBasket store lock: ${filePath}`);
    this.name = "BasketStorageLockError";
  }
}

export class FileBasketRepository implements BasketRepository {
  constructor(private readonly filePath: string) {}

  path(): string {
    return this.filePath;
  }

  async read(): Promise<Basket | undefined> {
    try {
      const raw = await readFile(this.filePath, "utf8");
      return BasketSchema.parse(JSON.parse(raw));
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") {
        return undefined;
      }
      throw error;
    }
  }

  async write(basket: Basket): Promise<Basket> {
    const parsed = BasketSchema.parse(basket);
    await mkdir(path.dirname(this.filePath), { recursive: true });

    const temporaryPath = `${this.filePath}.${process.pid}.${randomUUID()}.tmp`;
    await writeFile(temporaryPath, `${JSON.stringify(parsed, null, 2)}\n`, "utf8");
    await rename(temporaryPath, this.filePath);
    return parsed;
  }

  async runExclusive<T>(operation: () => Promise<T>): Promise<T> {
    await mkdir(path.dirname(this.filePath), { recursive: true });
    const lockPath = `${this.filePath}.lock`;
    const lock = await this.acquireLock(lockPath);

    try {
      return await operation();
    } finally {
      await lock.close();
      await rm(lockPath, { force: true });
    }
  }

  private async acquireLock(lockPath: string) {
    const deadline = Date.now() + LOCK_TIMEOUT_MS;

    while (true) {
      try {
        return await open(lockPath, "wx");
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code !== "EEXIST") {
          throw error;
        }

        await this.removeStaleLock(lockPath);
        if (Date.now() >= deadline) {
          throw new BasketStorageLockError(this.filePath);
        }
        await delay(LOCK_RETRY_MS);
      }
    }
  }

  private async removeStaleLock(lockPath: string): Promise<void> {
    try {
      const lockInfo = await stat(lockPath);
      if (Date.now() - lockInfo.mtimeMs > STALE_LOCK_MS) {
        await rm(lockPath, { force: true });
      }
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
        throw error;
      }
    }
  }
}

function delay(milliseconds: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}
