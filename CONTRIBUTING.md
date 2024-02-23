## Contribution Guidelines <!-- omit from toc -->


First off, thanks for taking the time to contribute! 🎉

The following document is a rule set of guidelines for contributing.

## Table of Contents <!-- omit from toc -->

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
test(teads-curve): add unit test to check that error is raised on missing tdp param 
```

Run `npm run fix` before commiting. If your commit message does not conform to the conventional commit specification or if you have not run `npm run fix` your commit will not satisfy the commitlint check.

Add and commit with your commit message:

```bash
$ git add my/changed/files
$ git commit m "<my-commit-message>"
```  

### Step 5: Push

Push your topic branch to your fork:

```bash
$ git push origin <topic-branch-name>
```

### Step 6: Pull Request

Open a Pull Request from your fork of the repository to the `dev` branch of the IF repository with a clear title and description according to [template](.github/PULL_REQUEST_TEMPLATE.md).

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

It also helps to avoid ambiguity and naming collisions within and across plugins. Your name should describe what an element does as precisely as practically possible.

For example, we prefer `functionalUnit` to `funcUnit`, `fUnit`, or any other abbreviation.

In Typescript code we use lower Camel case (`likeThis`) for variable and function names and Pascal/Upper Camel case for class, type, enum, and interface names (`LikeThis`).

In yaml files, we prefer to use kebab-case (`like-this`) for field names. For example:

`energy-network` is the field name for the energy consumed by networking for an application
`functional-unit` is the unit in which to express an SCI value.

Global constants can be given capitalized names, such as `TIME_UNITS_IN_SECONDS`.


#### Documentation

Every logical unit (`Class, function, method`) should be covered with appropriate documentation. For documenting such, multi-line comment style is used.

```ts
❌ const a = (message: string) => console.log(message)

✅
/**
 * Logs given `message` to console.
 **/
const logMessage = (message: string) => console.log(message)
```

For documenting variable, expression, single line comments can be used after declaration.

```ts
class MockClass {
     // this is a mock field
  ❌ private mockField: string = "mock-field"
  ✅ private mockField: string = "mock-field" // Single line documenting style is used.
}
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

*[⬅️ back to the root](/README.md#ief)*
