import { BasketService, type BasketRepository } from "../application/index.js";
import {
  FileBasketRepository,
  getBasketLinks,
  HermesRefinementDispatcher,
  resolveBasketRuntimeConfig,
  type BasketLinks,
  type BasketRuntimeConfig,
} from "../infrastructure/index.js";

export type BasketRuntime = {
  config: BasketRuntimeConfig;
  service: BasketService;
  links: BasketLinks;
  refinementDispatcher: HermesRefinementDispatcher;
};

export function createBasketRuntime(options: {
  environment?: NodeJS.ProcessEnv;
  repository?: BasketRepository;
  config?: BasketRuntimeConfig;
} = {}): BasketRuntime {
  const config = options.config || resolveBasketRuntimeConfig(options.environment);
  const repository = options.repository || new FileBasketRepository(config.storePath);

  return {
    config,
    service: new BasketService(repository),
    links: getBasketLinks(config),
    refinementDispatcher: new HermesRefinementDispatcher(config.refinement.hermesCommand),
  };
}
