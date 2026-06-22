import { spawn } from "node:child_process";
import type { SearchRefinementRequest } from "../domain/index.js";

export class HermesRefinementDispatcher {
  constructor(private readonly command?: string) {}

  isConfigured(): boolean {
    return this.command != null;
  }

  async dispatch(request: SearchRefinementRequest): Promise<boolean> {
    if (this.command == null) {
      return false;
    }

    const prompt = [
      "Process MCPBasket refinement request " + request.id + ".",
      "Call basket-get-refinement-request with that id to load the persisted source-search snapshot and user refinement prompt.",
      "Create a new search with basket-set-context using startNewSearch: true, refinementOfSearchId, and refinementRequestId from the request.",
      "Research and verify refined candidates. Do not purchase anything.",
      "When the refined response is fully recorded, call basket-complete-refinement-request with a concise summary and the new search id.",
    ].join(" ");
    try {
      const child = spawn(this.command, ["--oneshot", prompt], {
        detached: true,
        stdio: "ignore",
      });

      return await new Promise((resolve) => {
        child.once("spawn", () => {
          child.unref();
          resolve(true);
        });
        child.once("error", () => resolve(false));
      });
    } catch {
      return false;
    }
  }
}
