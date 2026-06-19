import type { Basket } from "../domain/index.js";

export interface BasketRepository {
  path(): string;
  read(): Promise<Basket | undefined>;
  write(basket: Basket): Promise<Basket>;
  runExclusive<T>(operation: () => Promise<T>): Promise<T>;
}
