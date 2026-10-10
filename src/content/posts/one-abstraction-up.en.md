---
title: One abstraction up
key: one-abstraction-up
locale: en
date: 2026-10-10
draft: false
tags: [ai, engineering, career, essay]
excerpt: Every ten years the layer where you get tested moves up. CRUD apps used to be enough. Now the artifact is free and the proof is an operating product — and the data says almost nobody is doing it.
---

There is a pattern in this industry that people keep rediscovering as if it were new.

Every five to ten years, the layer where you are tested moves up one step. And after a lag, whatever was below stops being a differentiator, because it stopped being scarce.

Punch cards. Then assembly. Then C. Then Java and object orientation. Then interpreted languages — Python, JavaScript. Then frameworks: React, Rails, the whole assembly era.

Each layer absorbed the one beneath it, and each layer had its own thing you had to demonstrate before anyone would hire you.

<div class="not-prose my-8 rounded-xl border border-[var(--color-border)] bg-[var(--color-border)]/20 p-5">
  <p class="text-sm text-[var(--color-muted)] m-0 mb-3">I gave this as a talk. The slides are self-contained and run in the browser.</p>
  <a href="/talks/one-abstraction-up" class="font-semibold text-[var(--color-accent)] hover:underline">Open the deck &rarr;</a>
</div>

## What the test used to look like

In the 2010s, if you could write basic Python and produce a calculator or a small game, you could get hired. That was the demonstration. It proved you could make a computer do a thing on purpose.

In the 2020s the bar moved to a CRUD application. A Netflix clone with login, a database, a few screens, some state management. Same function: proof that you could assemble something whole.

Now all of that, and considerably more, is a prompt away. I can describe an app and have a working first version before lunch.

So the artifact stopped being the proof. Which raises the obvious question: proof of what, now?

## The correction people get wrong

The tempting reading is "the lower layers no longer matter". That is wrong, and it is the fastest way to lose a technical room.

The abstraction does not remove the need to understand the layer below. It removes the need to *demonstrate* it. React developers still need to know what the DOM is doing. People building with AI still need to understand HTTP, data models, idempotency, and what happens when a payment webhook fires twice.

The test moved. It did not get easier. If you say "you are obsolete", people defend themselves and stop listening. If you say "the layer you are being tested on moved", they lean in.

## How bad is adoption, really

Here is where it gets interesting, because the numbers are smaller than the discourse suggests.

As of April 2026, roughly **2.2 percent of US households had a paid AI subscription**. The same figure was about 0.1 percent in January 2023 — which is astonishing growth from a genuinely tiny base. ([a16z, State of Markets II](https://www.a16z.news/p/state-of-markets-ii), citing PNC Research.)

Note the precision: that measures *paying* households, not usage. Free usage is enormous. Paid penetration is tiny. Both things are true.

Now the corporate side, which is worse. About 30 percent of S&P 500 companies report some "quantifiable impact" from AI. Only around 2 percent track any metric for it at all.

And the study everyone quotes: MIT's NANDA initiative, *The GenAI Divide: State of AI in Business 2025*, found that 95 percent of enterprise generative-AI pilots produce no measurable impact on the P&L. ([Fortune](https://fortune.com/2025/08/18/mit-report-95-percent-generative-ai-pilots-at-companies-failing-cfo/))

That study has been criticised — the sample skews to large enterprises, and "failure" is defined loosely. I think you should say that out loud before someone else does. What survives the criticism is the report's own conclusion, which is more useful than its headline:

> The core issue? Not the quality of the AI models, but the "learning gap" for both tools and organizations.

The bottleneck is not capability. It is orchestration. Picking one pain point and running it all the way to production.

The report's lead author put the contrast sharply: enterprises stall at the pilot stage, while companies run by 19- and 20-year-olds "pick one pain point, execute well" and go from zero to 20 million dollars in a year.

## What that looks like when you actually do it

I will use my own project, because I know exactly where the work was.

I built a test-prep engine. The idea is not novel — there is an incumbent in the market I am entering. What matters here is how it got built.

I set up a DAG of agents and ran a multi-day pipeline:

- read the certification specification
- construct the test DNA — what a valid question actually is
- find the published test books
- scrape them, OCR them, normalize the text
- solve every question
- verify the answers
- build gradient descent to weight the item bank
- deploy the backend
- build the frontend and the app UI

That is not one task automated. It is a workflow, end to end, running over days, on the free tier of a serverless platform — which means it can hold thousands of users before a bill exists.

What I contributed was ideas, orchestration, verification, and product decisions. Not typing. The code was never the bottleneck; knowing what to build and whether it was correct was.

> This is the part that should worry anyone whose plan is "learn to code". The code was the easy half.

## Where the moat moved

| | Was | Is |
|---|---|---|
| Scarce | Writing the code | Operating the thing |
| Proof | The artifact | The users |
| Hard part | Building it | Getting anyone to care |
| Failure mode | It does not compile | It compiles and nobody comes |

The last row is the one that matters. Every failure mode I trained for as an engineer was a failure to *build*. The failure mode that actually kills projects now is a failure to *distribute*, and nothing in a computer science education prepares you for it.

## TAM is a ceiling, not an access route

A common piece of advice — and it is good advice, as far as it goes — is to do proper market research, read what the big consultancies publish, size the total addressable market, and build for something large.

The trap is treating a market size as a plan. There are three numbers, not one:

1. **Total market.** How big the prize is if everything goes right.
2. **Reachable segment.** Who you can actually get in front of this year.
3. **Your channel.** How the first thousand users arrive, by name.

A two-billion-dollar market you cannot reach is worth less than a fifty-million-dollar market where you have distribution. Name all three, or the size is just a benchmark you borrowed from somebody else — which is exactly what happened to me when I set my first user target by copying a competitor's number.

## What I think this means

The gap is not model quality. It is how many ideas get executed end to end and then kept running.

So the durable skill is not the current tool. It is the rate at which you can get re-certified at each new layer. The framework you learn today is the CRUD app of 2029.

And if you are early in your career and the market is genuinely brutal — it is, that part is real — the smallest useful move is not a course. It is shipping something small that a real person uses, and then fixing the first bug they hit. Ten real users changes the conversation more than another certificate.

---

*Sources: household paid-AI penetration from PNC Research via [a16z State of Markets II](https://www.a16z.news/p/state-of-markets-ii); enterprise pilot data from MIT NANDA's [The GenAI Divide](https://fortune.com/2025/08/18/mit-report-95-percent-generative-ai-pilots-at-companies-failing-cfo/) via Fortune. Market-research-first framing adapted from Michia Rohrssen.*
