# Future Remote Service

## Status

**Not implemented.** The MVP is local-only: an agent writes its basket to the local MCPBasket store and reviews it through the local viewer on the same machine.

## Future Boundary

A later, separate service may let a user opt into a durable online basket. That service would authenticate the agent and the customer, create a customer-specific basket identity, and persist a remote copy of the selected basket data. It could then offer a mobile-accessible basket view for that customer.

The browser would read that service's own durable record. It would never connect to an agent's local HTTP address.

## Trust and Checkout

The same future service may become the trust boundary for a final checkout flow. It would receive product candidates and evidence from an authenticated agent, associate them with a specific customer identity, and require the appropriate security and approval steps before a payment-capable integration is called.

This repository does not yet define that service's API, authentication scheme, storage, payment providers, or approval model. Those decisions belong to the second phase.

## Compatibility Goal

The neutral product model and generic line-item export are intentionally retained so a later remote service can consume baskets without changing the local research workflow.
