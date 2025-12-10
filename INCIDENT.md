# Scenario

An incident just arose. It seems that some of our services are at least partly failing while others are seemingly working.
Explain what you’d be doing right now, when the issue is identified, and after the problem is fixed.

# Some Remarks

As described on the book Accelerate by Nicole Forsgren (Author who introduced the DORA Metrics) incident response it's at the very core of a team's performance. The DORA acronym stands for:

## 1. Deployment Frequency

Deployment frequency it's about how often a team deploys into production. 

After the conducted research it was determined that top performant teams deploy several times a day into production. This doesn't mean fully developed features, this could be a partial but meaningful unit of code hidden behind a feature flag.

This approach that goes hand on hand with Trunk Based Development and talks about the problematic inherent to handling complex merging strategies such as GitFlow were merging it's very hard and it's called "The Merging Hell". When merging and releasing into production often branches do not get stale and not divert for very long from main, another problem of enormous merges it's the probability of getting regression issues and the difficulty of identifying and reverting a problem. This all is mitigated by deploying smaller units in a frequent basis, in order to do so a strong automated test suite it's required including unit testing, integration testing and E2E testing for core flows.

## 2. Lead Time for Changes
## 3. Change Failure Rate (CFR)
## 4. Time To Restore Service (MTTR)