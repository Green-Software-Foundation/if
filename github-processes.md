
## IF Repositories

- [`if`](https://github.com/Green-Software-Foundation/if)
    - source code for the IF
- [`if-plugins`](https://github.com/Green-Software-Foundation/if-plugins)
    - source code for standard library of plugins
    - IF core team commit to maintaining these plugins 
- [`if-unofficial-plugins`](https://github.com/Green-Software-Foundation/if-unofficial-plugins)
    - source code for plugins relying on third party data/APIs
    - intended to be deprecated and removed in mid-term future
    - plugins in this repo should be handed over to relevant orgs to maintain
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
- PRs to `main` can be mrged after one approval from core team
- Pushing directly to `main` is possible but discouraged

### When can we break our rules?

- `release` branches have the strictest rules. We should never override the process outlined above for `release` branches in any repository.
- On `main` we can be slightly more flexible. It is acceptable to skip QA for PRs that only change typos, documentation or comments. Any changes to source code or tests should be QA approved before merge.
- In emergency scenarios where an urgent hotfix is required it might be required to skip QA review on `main`branches - this should only happen with QA authorization so QA can retroactively test as soon as possible.

## DCO

We require contributors to conform to the DCO agreement on our repositories. This means either signing commits or explicitly adding a DCO commit message. This ensures all contributors agree to the conditions imposed by our licenses and adhere to our expected practises. The DCO must be satisfied in order to PRs to be merged.

## Commits

Commits are expected to conform to the [conventional-commits](https://www.conventionalcommits.org/en/v1.0.0/) syntax.
Commits are expected to be signed, and have descriptive commit messages.
We might ask people to provide new messages in some circumstances, or to break their PRs into smaller logical units.

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
- PR makes use of a third party API or dataset in an illegitimate way (e.g. exposing data that should be paywalled)

After a PR has passed triage, it can be assigned to a core team member to review. Developer review precedes QA review. Community PRs (PRs raised from outside the core team) will *always* go through a full QA vetting procedure before being merged.

We intend to respond to new PRs and issues within 3 days of the ticket being opened, even if only with a brief message thanking the OP and explaining the triage process.


## Labels

```
//review status labels 
awaiting-triage 
triage-pass 
awaiting-review 
review-pass 
awaiting-qa 
qa-pass 
changes-needed 

//change type labels 
fix 
feature 
docs 
package 
other 

// size labels 
small 
medium 
large 

// priority labels 
high-priority 
med-priority 
low-priority 

//delay explanation labels 
abandoned 
blocked 
backlogged
```

Each PR is expected to have one label from each category assigned to it at all times.
