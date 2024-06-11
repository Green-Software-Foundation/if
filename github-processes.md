
## IF Repositories

- [`if`](https://github.com/Green-Software-Foundation/if)
    - source code for the IF
- [`if-plugins`](https://github.com/Green-Software-Foundation/if-plugins) **DEPRECATED**
    - source code for standard library of plugins
    - IF core team commit to maintaining these plugins 
- [`if-unofficial-plugins`](https://github.com/Green-Software-Foundation/if-unofficial-plugins)
    - source code for plugins relying on third-party data/APIs
    - intended to be deprecated and removed in mid-term future
    - plugins in this repo should be handed over to relevant organizations to maintain
- [`if-plugin-template`](https://github.com/Green-Software-Foundation/if-plugin-template)
    - template for new plugins
    - intended for builders to bootstrap IF-compatible plugin development
- [`if-standards`](https://github.com/Green-Software-Foundation/if-standards)
    - not currently used, but intended to be the home of params.ts
    - will have a dedicated discussion board and governance to set IF standards
- [`if-exhaust plugins`](https://github.com/Green-Software-Foundation/if-exhaust-plugins)
    - not currently used
    - intended to become a separate repo just for exhaust plugins
    - requires strict rules from if


## Branch names and purposes

Our main repositories all have two branches: `main` and `release`.
Here are the rules applied to each branch:

### `if`, `if-plugins`, `if-unofficial-plugins` and `if-exhaust-plugins`

#### `main`
- target branch for PRs
- PRs can be merged into `main` with two core team reviews, one being QA
- `main` regularly advances ahead of the `release` branch
- merged into `release` periodically, only after full QA approval
- pushing directly to `main` is forbidden - all changes are by PR
- PRs will not be merged if they do not pass CI/CD

#### `release`

- release is our stable branch
- it is protected and only merged into when we have a fully QA-approved `main` state that we want to release
- npm packages are released using `release` branch
- PRs into `release` are forbidden except to update tests, README, Github config, CI/CD or release config.
- Pushing directly to `release` is forbidden
- `release` should always satisfy a basic set of regression and scenario tests
- merging `main` into `release` requires that all automated tests pass and two core team members have approved, one being QA.

### `if-plugin-template` 

- we only maintain a single branch: `main`
- PRs to `main` can be merged after one approval from core team
- Pushing directly to `main` is possible but discouraged


### `if-docs`

- we only maintain a single branch - `main`
- PRs to `main` can be merged after one approval from core team
- Pushing directly to `main` is possible but discouraged

### When can we break our rules?

- `release` branches have the strictest rules. We should never override the process outlined above for `release` branches in any repository.
- On `main` we can be slightly more flexible. It is acceptable to skip QA for PRs that only change typos, documentation or comments. Any changes to source code or tests should be QA approved before merge.
- In emergency scenarios where an urgent hotfix is required it might be required to skip QA review on `main` branches - this should only happen with QA authorization so QA can retroactively test as soon as possible.

### How to create a release

Creating a release of `if`, `if-plugins` or `if-unofficial-plugins` is achieved by following these steps:

1) core team member creates a tagged release on `main`
2) new tagged release triggers automatic commit to be pushed to `main` that updates package and lock files that include new version numbers
3) `main` branch is manually merged into `release` by core team member
4) merging into release triggers automatic new release to be created on npm

We use [semantic versioning](https://semver.org/) to number our releases. 
## DCO

We require contributors to conform to the DCO agreement on our repositories. This means either signing commits or explicitly adding a DCO commit message. This ensures all contributors agree to the conditions imposed by our licenses and adhere to our expected practices. The DCO must be satisfied in order to PRs to be merged.

## Commits

Commits are expected to conform to the [conventional-commits](https://www.conventionalcommits.org/en/v1.0.0/) syntax.
Commits are expected to be signed and have descriptive commit messages.
We might ask people to provide new messages in some circumstances or to break their PRs into smaller logical units.

## PR triage

We run a weekly PR triage call on Thursdays. The most important outcome of this call is to examine open PRs and issues across all the IF repositories and determine which ones include changes that we might want to merge. This initial sift for changes that are or are not aligned with our goals for the IF should be prioritized above technical comments and fixes.

Some reasons why a PR might not pass triage:

- changes are not aligned with our vision for IF
- we do not see a strong reason for making a change
- changes are obviously technically incorrect
- changes are too large to properly review (e.g. covering too many files)
- too many changes are made in too few commits
- commit messages are ambiguous
- PR description is too short, vague or imprecise
- PR would for some other reason take too long for core team to assess
- PR makes changes that do not conform to our license
- PR makes use of a third-party API or dataset in an illegitimate way (e.g. exposing data that should be paywalled)

After a PR has passed triage, it can be assigned to a core team member to review. Developer review precedes QA review. Community PRs (PRs raised from outside the core team) will *always* go through a full QA vetting procedure before being merged.

We intend to respond to new PRs and issues within 3 days of the ticket being opened, even if only with a brief message thanking the OP and explaining the triage process.

There may be exceptional instances where bug fixes are prioritized over other ongoing tasks and worked on immediately, before triage. 

## Labels

| Label            | Used by   | Description                                                                                |
| ---------------- | --------- | ------------------------------------------------------------------------------------------ |
| blocked          | all       | The issue is blocked and cannot proceed.                                                   |
| bug              | all       | Error, flaw or fault                                                                       |
| core-only        | all       | This issue is reserved for the IF core team only                                           |
| draft            | all       | The issue is still being written, no need to respond or action on anything.                |
| good-first-issue | all       | This issue is a good one for someone looking to get involved with this project/initiative. |
| help-wanted      | all       | This issue can be picked up by anyone in the community                                     |
| needs-response   | all       | The issue has stalled because someone isn’t responding.                                    |
| agenda           | core team | Use for any meeting agenda or minutes issue.                                               |
| EPIC             | core team | Used to denote an issue that represents a whole epic                                       |
| initiative       | core team | A helper label, needed for GSF internal processes                                          |
| i-summary        | core team | A helper label, needed for GSF internal processes                                          |
| i-milestone      | core team | A helper label, needed for GSF internal processes                                          |
| project-update   | core team | Used to flag project progress updates                                                      |


## Releases

We aim to release fortnightly, every other Tuesday. We release npm packages for `if`, `if-plugins`, `if-unofficial-plugins`, and `if-plugin-template`.

## Hotfixes

We will hotfix by raising PRs into `release` when necessary. These PRs require sign-off by a core developer and our QA engineer. 

If more than two hotfixes are required on a particular release, the team will call a spike meeting to determine the causes of the bugs, identify any changes required to our QA process and determine next steps for fixing the release. 

Hotfixes on release can be merged back into `main` when they have been fully QA tested.

We intend for hotfixes to be as infrequent as possible.


## Software Development Life Cycle

Our normal process is to have week-long sprints where we tackle issues that contribute to a larger epic which typically last for 4-6 weeks.

Our Executive Director and Product owner take responsibility for defining epics. This means they make decisions about how IF should change and translate that into a series of documents that get worked up into tickets for specific tasks. After the initial design, individual tasks are refined by the product owner, which means defining a scope of work and acceptance criteria for each task. 

Refinement is the process of taking a loosely scoped or ambiguous ticket and making it so well-described that anyone could pick it up off the board and produce an equivalent outcome to one of the core team. It's important we do this diligently even if it feels unnecessary or frictionful, because:

- it keeps us all aligned with the purpose and rationale of individual tasks
- it improves our transparency
- it lowers the barrier to entry for contributors
- it helps us to "measure twice, cut once" and avoid doing work more than once
- it helps us to think together about each issue
- it provides an archive of our thinking that we can go back to in future.

We use checkboxes for the statement of work and acceptance criteria as this helps to track progress on the task while it is in flight.

A ticket is considered READY when it has been refined by the product owner. In general, we try to pass the refined ticket to a core developer to review any implementation details.

We have the `core-only` label that we apply to tasks that are reserved for the core team to work on. Community contributions that cover these tickets are unlikely to get merged unless organized in advance. This is typically for sensitive parts of the core of the IF.

Epics are also opresented to the community on the IF discussion forum in advance of being worked on in a development sprint. This is to give community contributors a chance to give feedback, suggest course corrections and discuss the changes with the team. These discussions can also lead to community members taking on some of the epic tasks.

Once the tickets are refined they get prioritized and assigned during our development sprints. There is a pre-sprint prioritization call between the project sponsor, owner and manager to determien the priorities for each sprint, then a sprint planning meeting where the tasks are assigned and sized.

### Overview of development practises

| Stage                                                             | Participants                                              | Inputs                                                                                                | Outputs                                                                                                                                                                                                                                              | Overview                                                                                                                                                         |
| ----------------------------------------------------------------- | --------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1. Initiation                                                     | Sponsor and Product Owner                                 | Problem Statement and Objectives                                                                      | Action Plan                                                                                                                                                                                                                                          | In this phase, the team identifies a specific job-to-be-done or problem, develops a high-level vision for a solution, and outlines a preliminary task breakdown. |
| 2. Backlog                                                        | Product Owner                                             | Breakdown of Epic or Milestone Tasks                                                                  | An issue for each high-level task detailing the What and Why, along with a link to its parent epic                                                                                                                                                   | In this phase, each task from the epic or milestone is incorporated into the backlog (labeled as 'draft'), setting the context effectively.                      |
| 3. Design                                                         | Sponsor and Product Owner                                 | What and Why, link to parent Epic	Priority, Preliminary Acceptance Criteria and outline of work scope | In this phase, preliminary acceptance criteria are documented as a foundation for further refinement.                                                                                                                                                |
| 4. Refinement	Product Owner, Dev and QA (where applicable)        | Preliminary Acceptance Criteria and outline of work scope | Comprehensive scenarios for Acceptance Criteria, confirmed work scope, and size                       | In this phase, engineers review the desired outcomes to ensure technical feasibility, clarify doubts, and solidify their understanding. They also estimate the required effort. Following this review, the issue is deemed Ready for implementation. |
| 5. Implementation                                                 | Dev and QA (where applicable)                             | A comprehensive set of scenarios for Acceptance Criteria and a confirmed Scope of Work.               | A Pull Request (PR) including Unit Tests that pass and manifest files for automated testing, Technical documentation                                                                                                                                 | In this phase, engineers execute the solution and review PRs. They also record a demo to demonstrate that it meets the acceptance criteria.                      |
| 6. UAT                                                            | Product Owner and Sponsor (if applicable)                 | Working feature and Acceptance Criteria                                                               | TBC                                                                                                                                                                                                                                                  | In this phase, the Product Owner verifies that the implementation matches the design by reviewing a demonstration of the work completed.                         |
| 7. Rollout	| Product Owner,  Sponsor and Marketing (if applicable) | Demos, Technical Documentation                            | TBC                                                                                                   | In this phase, the Product Owner ensures that the community is prepared for the upcoming change. This preparation includes updates to the change log, project announcements, revisions to documentation, marketing efforts, and more.                |
