# Contributing to ief <!-- omit from toc -->

## Table of Contents <!-- omit from toc -->

- [Code Contributions](#code-contributions)
    - [Step 1: Clone](#step-1-clone)
    - [Step 2: Branch](#step-2-branch)
    - [Step 3: Commit](#step-3-commit)
    - [Step 4: Sync](#step-4-sync)
    - [Step 5: Push](#step-5-push)
    - [Step 6: Pull Request](#step-6-pull-request)
- [Commit message guidelines](#commit-message-guidelines)
- [Coding guidelines](#coding-guidelines)
    - [Code structuring patterns](#code-structuring-patterns)
        - [Object Oriented Programming](#object-oriented-programming)
        - [Functional Programming](#functional-programming)
    - [Naming patterns](#naming-patterns)
    - [Documentation](#documentation)
    - [Writing tests](#writing-tests)

## Code Contributions

#### Step 1: Clone

Clone the project on [GitHub](git@github.com:Green-Software-Foundation/ief.git)
   
   ```bash
   $ git clone git@github.com:Green-Software-Foundation/ief.git
   $ cd ief
   ```
   
For developing new features and bug fixes, the development branch should be pulled and built upon.

#### Step 2: Branch

Create new branch from main (`staging` or `master`), which will contain your new feature, fix or change. 

    ```bash
    $ git checkout -b <topic-branch-name>
    ```

#### Step 3: Commit

Make sure git knows your name and email address:

   ```bash
   $ git config --global user.name "Example User"
   $ git config --global user.email "user@example.com"
   ```

Commiting multiple files with changes on multiple resources is strongly restricted.
Commit message should clearly describe on which resource changes are made.

Add and commit:

   ```bash
   $ git add my/changed/files
   $ git commit
   ```  
    
Commit your changes in logical chunks. Do not push all changes in one commit!! 

Please adhere to these [Commit message guidelines](#commit-message-guidelines)
   or your code is unlikely be merged into the main project.

#### Step 4: Sync

Use git pull/merge to synchronize your work with the main repository.

   ```bash
   $ git pull origin dev
   ```
   
#### Step 5: Push

Push your topic branch:

   ```bash
   $ git push origin <topic-branch-name>
   ```

#### Step 6: Pull Request

Open a Pull Request with a clear title and description.

Pull request should pass all CI which are defined, should have at least one approve.

CI can include lint checks, running tests,  and etc.

## Commit message guidelines

The commit message should describe what changed and why.

   1. The first line should:
       * contain a short description of the change
       * be 60 characters or less
       * be prefixed with the name of the changed subsystem
       * be entirely in lowercase with the exception of proper nouns, acronyms, and the words that refer to code,
         like function/variable names
        
       Examples:
       
       ```
        util: add getInitializedModel method to models.
        deps: add express package to dependencies.
        service: refactor get user.
       ```
   2. Keep the second line blank. 
          
   3. Wrap all other lines at 72 columns:
      * describe each line in logical chunks
      * start each line with: space hyphen space ( - ...)
      * be entirely in lowercase with the exception of proper nouns, acronyms, and the words that refer to code,
        like function/variable names
      
      Examples:
      
      ```    
        - remove deprecated logger
        - refactor some method
        - add JSDoc on existing function
      ```
## Coding guidelines

#### Code structuring patterns

Avoid having functions which are responsible to do multiple things at the same time. Make sure one function/method does one thing, and does it well. 

###### Object Oriented Programming

While following `Object Oriented Programming` paradigm, it's important to follow [SOLID](https://en.wikipedia.org/wiki/SOLID) principles.

###### Functional Programming

When designing module of the application in `Functional Programming` paradigm, the key to follow [basic](https://dev.to/jamesrweb/principles-of-functional-programming-4b7c) principles.

#### Naming patterns

Make sure your class/function/variable describes exactly what it does. Avoid using shortened words like txt, arr while doing naming decision.

```ts
❌ const a = "<MOCK_VALUE_HERE>"
✅ const mockValue = "<MOCK_VALUE_HERE>"

❌ const a = (txt: string) => console.log(txt)
✅ const logMessage = (message: string) => console.log(message)
```

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

#### Writing tests

One test file should be responsible for one module. `describe` blocks should be used for module and function/method description. First `describe` should follow `resource/module: ` pattern. Second describe title should follow  `method(): ` pattern. Test units can use either `test` or `it`, title should exactly describe behaviour and input argument. Make sure each test case covers one branch.

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
