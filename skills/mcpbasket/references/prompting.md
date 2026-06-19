# Prompt Construction

Use these directives when interpreting a request or writing a task prompt for an agent with MCPBasket.

## When To Use The Basket

Create or update a basket when the request is about a potentially purchasable product or service, including requests to:

- Find, source, price, recommend, compare, or shortlist options.
- Check retailers, variants, availability, sales, delivery, or subscriptions.
- Prepare options for a later decision, even when the user does not say "basket" or "checkout".

Do not create candidates for general factual research with no possible purchase decision. Do not wait for the word "basket" before recording viable findings.

## Prompt Contract

An effective prompt supplies the details that change the shortlist:

- The product or service and intended use.
- Hard requirements and preferences, such as compatibility, size, color, materials, or exclusions.
- Candidate count and comparison criteria.
- Budget and currency when relevant.
- Delivery country, retailer constraints, and timeframe when relevant.
- A clear capture instruction: create or update the basket and add viable candidates.
- A clear boundary: research only; do not purchase or initiate payment.

Missing optional details are not a reason to block research. Use the known context, keep uncertain fields as unknown or estimated, and ask a follow-up only when the answer would materially change which products qualify.

## Reusable Prompt

```text
Research [number] [product or service] for [intended use].
Must satisfy: [hard requirements]. Prefer: [preferences].
Budget: [amount and currency]. Deliver to: [country] by [date or timeframe].
Compare: [price, availability, reviews, compatibility, delivery, or other criteria].

Create or update the MCPBasket "[basket title]" and add every viable candidate with its merchant, product URL, selected variant, price and currency, availability, and evidence for why it matches. Mark inferred data as estimated or unknown. Do not purchase, reserve, or start payment.
```

## Agent Behavior

1. Set basket context before researching. Record the user goal, constraints, currency, locale, destination, and target stores when known.
2. Add each credible result as it is found. Use `candidate` for early finds, `shortlisted` for options that meet the brief, and `needs_review` for uncertain data.
3. Capture observed evidence, not assumptions: source URL, merchant, title, selected options, current price and currency, availability, observed timestamp, and why the option matches.
4. Update an existing candidate when it is the same product and merchant instead of creating duplicates.
5. Show the user the basket after meaningful research. The current viewer is local to the machine running the agent; do not claim or construct a public URL.

## Examples

```text
Find five compact mechanical keyboards for a shared office. They must be ISO Spanish, under 150 EUR, and suitable for quiet typing. Prefer wireless models available in Spain. Compare price, switch noise, layout, and delivery.

Create or update the MCPBasket "Quiet office keyboard". Add every viable option with evidence and selected configuration. Do not buy anything.
```

```text
Compare three one-month eSIM plans for a trip to Japan in October. I need at least 10 GB, data-only is fine, and I care about price and activation steps.

Add suitable plans to MCPBasket "Japan eSIM" with the merchant, plan terms, price and currency, coverage evidence, and any activation restrictions. This is research only; do not initiate checkout.
```

## Purchase Boundary

MCPBasket records candidates and can export approved line items. It never authorizes, reserves, or submits a purchase. If a user asks to buy, first make the selection explicit and obtain approval for the exact merchant, product or variant, price or estimate, quantity, delivery destination, and payment path. A separate checkout integration is responsible for the transaction.
