## Contribution Guidelines <!-- omit from toc -->

First off, thanks for taking the time to contribute! 🎉

The following document is a rule set of guidelines for contributing.

## Table of Contents <!-- omit from toc -->

- [What and when to contribute](#what-and-when-to-contribute)
- [Reporting bugs](#reporting-bugs)
- [Disclosing vulnerabilities](#disclosing-vulnerabilities)
- [Code Contributions](#code-contributions)
  - [Step 1: Fork](#step-1-fork)
  - [Step 2: Branch](#step-2-branch)
  - [Step 3: Commit](#step-3-commit)
  - [Step 5: Push](#step-5-push)
  - [Step 6: Pull Request](#step-6-pull-request)
- [Coding guidelines](#coding-guidelines)
  - [Code structuring patterns](#code-structuring-patterns)
  - [Functional Programming](#functional-programming)
  - [Naming conventions](#naming-conventions)
    - [Documentation](#documentation)
  - [Writing tests](#writing-tests)
  - [How to report issues (bugs)](#how-to-report-issues-bugs)

## What and when to contribute

You can contribute anything to the IF, but we are likely to close out unsolicited PRs without merging them. Our issue board is completely open and we have tags (`core-only`, `good-first-issue`) to help contributors to choose tasks to work on. If an issue is unassigned and does not have the `core-only` label, it is available to work on. We recommend speaking to the core team on Github before starting working on an issue. You can do this by commenting on an existing issue or discussion thread or starting a new one if appropriate. This helps us to direct your energy in directions that are aligned with our roadmap, prevent multiple people working on the same task, and better manage our board. This all makes it much more likely that your work will get merged.

You can also contribute by participating in discussions on our mailing list at [if-community@greensoftware.foundation](https://groups.google.com/u/1/a/greensoftware.foundation/g/if-community). We send out weekly updates that includes what we've shipped, what we're working on and how you can get involved each week.

## Reporting bugs

We appreciate bug reports! If you experience an issue with IF, you can report it using our bug reporting template. To do this:

1. Go to the [IF repository](https://github.com/Green-Software-Foundation/if)
2. Click on the `Issues` tab
3. Click on `Create New Issue` and select the `Bug Report` template.
4. Fill out the requested information.

The more detailed information you provide in the bug report, the easier it will be for us to diagnose, triage, and resolve your issue. We ask for some simple information about your issue, including a description of the error, the expected behaviour, the actual behaviour and the steps we can take to reproduce the error in our local environments. We also then prompt you to provide a link to [Stackblitz](https://stackblitz.com/) or a similar online environment where we can run your manifest and observe the error. If you prefer *not* to send a link, we would appreciate a copy of the manifest file that you ran to produce the error, information about your runtime environment, and any additional code that's required to reproduce the error. This is all designed to enable us to reproduce the same error and debug it for you as quickly as possible.

Once a suitably detailed bug report exists, we will triage it. Triage means that the core team will examine the issue and assign an urgency label - either Low, Medium or High. 

The assessment rubric is as follows:

|                                                                                                                        | Consequence                                                                              | Severity |
| ---------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- | -------- |
| Bugs in IF core leading to incorrect calculations                                                                      | unusable framework                                                                       | 5        |
| Bugs in builtins leading to incorrect calculations                                                                     | core pathways fail, IF very limited in functionality                                     | 5        |
| Bugs in template                                                                                                       | Harder to build plugins, ecosystem growth is impacted                                    | 2        |
| Bugs in docs                                                                                                           | product does not match expectation, hard to debug, frustration, loss of adoption         | 2        |
| Security flaw: privacy related                                                                                         | leak user data, unlikely to achieve adoption in serious orgs                             | 5        |
| Security flaw: permissions escalation                                                                                  | expose user to malware                                                                   | 5        |
| Code not addressing user needs                                                                                         | no product market fit, loss of adoption                                                  | 5        |
| Communication failures within team                                                                                     | Conflicting or duplicating work, frustration, morale damage                              | 4        |
| Communication failures with community                                                                                  | we lose product market fit, we do not have good community retention, reputational damage | 3        |
| Communication failures with leadership                                                                                 | product does not meet business goals                                                     | 3        |
| License compliance failures, including in supply chain (e.g. exposing privileged api responses for free via  a plugin) | 4                                                                                        |
| Bugs affecting releases                                                                                                | users stuck on old versions                                                              | 4        |
| Strategy failures                                                                                                      | no product market fit                                                                    | 2        |

The mapping of severity to label is as follows:

| Severity | Label |
| -------- | ----- |
| 1        | L     |
| 2        | M     |
| 3        | M     |
| 4        | H     |
| 5        | H     |

During the bug triage we will also discuss a remediation plan for the bug. This will be communicated in the comments on the bug report. For high urgency bugs, the fix will be implemented as soon as possible, maybe reorganizing our current work to accommodate it. For medium priority bugs, we will schedule the fix in the next available sprint. Low priority bugs will be backlogged and addressed when there is developer time available. Low priority bugs will also be tagged `help-wanted` so that they can be addressed by community members.

Not every bug will be fixed. We may decide *not* to fix a bug in cases such as:

- fixing the bug has some detrimental side effect elsewhere in the product
- the bug has a fix coming soon as part of another upgrade
- the bug is only problematic for a single specific use case and fixing it would break features relied upon by other users
- the bug is contentious for some reason and there is reputational or community risks associated with the fix

The bug will be labelled `fix-now`, `fix-later` or `wont-fix` to reflect our remediation plan and details will be provided in issue comments.

## Disclosing vulnerabilities

If you discover a security vulnerability in IF, please report it to if-disclosures@greensoftware.foundation.

Include the following information:

- description of the issue
- steps to reproduce
- steps to fix, if known

The IF team will respond as quickly as possible. Post-graduation there will be no full-time development team, but GSF staff will aim to get the vulnerability patched as quickly as possible, aiming for <=14 day response time.


## Code Contributions

### Step 1: Fork

Fork the project on [GitHub](https://github.com/Green-Software-Foundation/if)

You then have your own copy of the repository that you can change. 

### Step 2: Branch

Create new branch in your forked copy of the `if` repository, which will contain your new feature, fix or change. 

```bash
$ git checkout -b <topic-branch-name>
```

### Step 3: Commit

Make sure git knows your name and email address:

```bash
$ git config --global user.name "Example User"
$ git config --global user.email "user@example.com"
```

Each commit should cover one change to one resource. You should not add multiple changes to a single commit.
Commit message should clearly describe on which resource changes are made.
For the commit message, we adhere to the [conventional commits](https://www.conventionalcommits.org/en/v1.0.0/) specification.
Conventional commits are organized with a type, a scope and a description. The type can be one of: 

- 'feat',
- 'fix',
- 'docs',
- 'chore',
- 'style',
- 'refactor',
- 'ci',
- 'test',
- 'revert',
- 'package',

The scope is optional but should refer to the part of the codebase you are amending in the commit, e.g. `lib`, `types` etc.

Here's an example of a valid commit message:

```
feat(lib): initial commit for time-sync logic
```

or 

```
test(lib): in teads-curve add unit test to check that error is raised on missing tdp param 
```

Run `npm run fix` before commiting. If your commit message does not conform to the conventional commit specification or if you have not run `npm run fix` your commit will not satisfy the commitlint check.

Add and commit with your commit message:

```bash
$ git add my/changed/files
$ git commit -m "<type-of-commit>(<my-optional-scope>): <my-commit-message>"
```  

### Step 5: Push

Push your topic branch to your fork:

```bash
$ git push origin <topic-branch-name>
```

### Step 6: Pull Request

Open a Pull Request from your fork of the repository to the `main` branch of the IF repository with a clear title and description according to [template](.github/PULL_REQUEST_TEMPLATE.md).

Pull requests will not be reviewed unless they pass all CI. This includes a lint check and running our unit tests.

## Coding guidelines

### Code structuring patterns

Avoid having functions which are responsible to do multiple things at the same time. Make sure one function/method does one thing, and does it well. 

### Functional Programming

We have a preference towards functional programming styles in the IF. This is because it makes it easier for different functions to be developed in isolation, composed in complex ways and executed in parallel.

We recommend starting with these [basic principles and guidelines](https://dev.to/jamesrweb/principles-of-functional-programming-4b7c) for functional programming.


### Naming conventions

We prefer not to use abbreviations of contractions in parameter names. 

Using fully descriptive names makes the code more readable, which in turn helps reviewers and anyone else aiming to understand how the plugin works. 

It also helps to avoid ambiguity and naming collisions within and across plugins. Ensure that names clearly and precisely describe the purpose of an element to make its functionality immediately apparent.

For example, we prefer `functionalUnit` to `funcUnit`, `fUnit`, or any other abbreviation.

In Typescript code we use lower Camel case (`likeThis`) for variable and function names and Pascal/Upper Camel case for class, type, enum, and interface names (`LikeThis`).

In yaml files, we prefer to use kebab-case (`like-this`) for field names. For example:

`energy-network` is the field name for the energy consumed by networking for an application
`functional-unit` is the unit in which to express an SCI value.

Global constants can be given capitalized names, such as `TIME_UNITS_IN_SECONDS`.


#### Documentation

Every logical unit (`function, method`) should be covered with appropriate documentation. For documenting such, multi-line comment style is used.

```ts
❌ const a = (message: string) => console.log(message)

✅
/**
 * Logs given `message` to console.
 **/
const logMessage = (message: string) => console.log(message)
```

### Writing tests

One test file should be responsible for one module. `describe` blocks should be used for module and function/method description. First `describe` should follow `resource/module: ` pattern. Second describe title should follow  `method(): ` pattern. Test units can use `it` blocks whose title should exactly describe behaviour and input argument.

See example: 
```ts
describe('util/args: ', () => {
   describe('parseProcessArgument(): ', () => {
      it('logs help message if property present in env.', () => {
         ...
      })
   })
})
```

### How to report issues (bugs)

Bug report should contain all the information required to reproduce a bug and to make it as easy as possible to fix. This includes providing the following information

- a description of the error,
- a description of the expected behaviour,
- a description of the actual behaviour,
- steps to reproduce

To help us to diagnose and debug your issue, please provide either a [Stackblitz](https://stackblitz.com/) link that captures your local environment and failing manifest file, OR:

- the manifest file that generated the error,
- links to any code (e.g. your own plugin code), it must be available online,
- runtime information such as OS, node version, package.json, IF version

Reported bugs will be discussed among the team in a weekly bug triage and be assigned a severity (low, medium or high). 

High severity bugs will be fixed as soon as possible, whereas medium and low severity bug fixes will likely be backlogged for attention in the next available sprint. 

In some cases, we might decide not to fix certain bugs if they are low severity, either because we anticipate fixes coming soon as part of already-scheduled upgrades or because we think the fixes make "good first issues" for community contributors.
Community members are welcome to report any issue they face and also work on fixing the low priority bugs.

*[⬅️ back to the root](/README.md#ief)*
