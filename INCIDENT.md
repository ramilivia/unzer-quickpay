# Scenario


An incident just arose. It seems that some of our services are at least partly failing while others are seemingly working.
Explain what you’d be doing right now, when the issue is identified, and after the problem is fixed.


# Some Remarks


As described on the book Accelerate by Nicole Forsgren (Author who introduced the DORA Metrics) incident response it's at the very core of a team's performance. The DORA acronym stands for:


## 1. Deployment Frequency


Deployment frequency it's about how often a team deploys into production.


After conducting research it was determined that top performing teams deploy several times a day into production. This doesn't mean fully developed features, this could be a partial but meaningful unit of code hidden behind a feature flag.


This approach goes hand in hand with Trunk Based Development and talks about the problematic inherent to handling complex merging strategies such as GitFlow were merging. It's very hard and it's called "The Merging Hell". When merging and releasing into production often branches do not get stale and not divert for very long from main, another problem of enormous merges it's the probability of getting regression issues and the difficulty of identifying and reverting a problem. This all is mitigated by deploying smaller units on a frequent basis, in order to do so a strong automated test suite it's required including unit testing, integration testing and E2E testing for core flows.


## 2. Lead Time for Changes

Lead Time for Changes talks about how fast it is for a team to deploy changes into production.

I like to measure this dimension from when the Pull Request is created, since this is where the Individual Contribution ends and the team collaboration starts. This will measure the time that it takes for PRs to be reviewed, refactoring, automated testing suite reliability, testing, bug fixing, and deployment.

If the duration for changes is taking very long, this could be split into several smaller metrics, such as time for PR, time for deployment, etc.


## 3. Change Failure Rate (CFR)


This measures the percentage of deployments that cause a failure in production

`Change Failure Rate = (Failed Deployments / Total Deployments) × 100%`

For low performers more than 60% of the deployments fail while for high performers this should be less than 10%

## 4. Time To Restore Service (MTTR)

This measures how long it takes to recover from a failure in production.

High performers recover in less than one hour while low performers usually take longer than a day.

# Solution

A simple incident process would include the following steps

## 1. Incident Detection

The application should be integrated with an incident management tool such as Datadog with several points for ingestion;

- Log Analysis
The tool should be ingesting the logs and detecting if there are occurring errors at the application level

- Health Monitoring
The tool should be performing health checks on different dimensions such as CPU & Memory usage, latency and more. It also should be able to connect to CloudWatch or smilar tools

- Incident Reporting
Users should have an open channel for reporting issues, this channel could be integrated with our tool for detecting automatically high severity incidents

## 2. Incident Notification

Tools like datadog allow for having a calendar with the information for on-call rotation for our team members. Integrated with a tool like opsgenie this will trigger a notification to the right person, in case the notification it's not answered this will notify the next person available.


A Slack channel also gets created with all the information regarding this incident and with the pertinent team members. This channel will act as a war room and consolidate all of the progress.

## 3. Post-Mortem

Once the incident was fixed a Post-Mortem document should be created explaining the root cause and the fix for the problem to have as a future reference