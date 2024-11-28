# Security Policy

## Reporting a Vulnerability

To report a security issue, please email if-disclosures@greensoftware.foundation with a description of the issue, steps required to reproduce the issue, affected versions and, if known, mitigations for the issue.

Our contributors are comprised of volunteers so we cannot guarantee a specific response time, but someone from our team will reply and address the issue as soon as possible.

# Security Review

We perform regular reviews inline with the information provided below.  All releases go through these reviews but multiple people in the project team prior to release as part of our quality and security review.

## Basics
### Basic Project Website Content
- Describe what the project does - ✅  in README and homepage at https://if.greensoftware.foundation
- Provide info how to obtain/provide feedback and contribute - ✅ https://if.greensoftware.foundation/community
- Explain contribution process - ✅ https://github.com/Green-Software-Foundation/if/blob/main/CONTRIBUTING.md

### FLOSS license
- Must be released as FLOSS - ✅ MIT License https://github.com/Green-Software-Foundation/if/blob/main/LICENSE
- Must post the license - ✅ https://github.com/Green-Software-Foundation/if/blob/main/LICENSE
- Also approved by OSI - ✅  https://opensource.org/license/MIT/

### Documentation
- Provides basic documentation - ✅ https://if.greensoftware.foundation

### Other
- Project site, downloads etc must support HTTPS with TLS - ✅ using GitHub to host which supports this https://github.com/Green-Software-Foundation/if
- Have mechanism for discussion - ✅ github issues https://github.com/Green-Software-Foundation/if/issues, discussion board https://github.com/Green-Software-Foundation/if/discussions and mailing list at if-community@greensoftware.foundaton
- Project must be maintained - ✅ actively maintaned by GSF and its members

## Change control
###  Public VCS repo
- Readable public VCS repo - ✅ yes, Github https://github.com/Green-Software-Foundation/if
- Track changes - ✅ yes, Git https://github.com/Green-Software-Foundation/if/commits/main
- Interim versions between releases available for review - ✅ yes, interim versions actively developed and availble on the `main` branch https://github.com/Green-Software-Foundation/if

### Unique versioning numbering
- Unique indentifier for each release - ✅ https://github.com/Green-Software-Foundation/if/releases

### Release notes
- Human readable release notes for each release (not git log) - ✅ https://github.com/Green-Software-Foundation/if/releases
- Address each publicly known vulnerability - ✅ N/A, no vulnerability reported yet

## Reporting
### Bug reporting process
- Process to submit bugs - ✅ https://github.com/Green-Software-Foundation/if/blob/main/CONTRIBUTING.md#reporting-bugs
- Must acknowledge bugs (reply) submitted between 2-12 months - ✅ each bug has at least an acknowledgement or was opened by a maintainer (so acknowledged by a maintainer): https://github.com/Green-Software-Foundation/if/issues?q=is%3Aopen+is%3Aissue+label%3Abug
- Publicly available archive for reports and responses - ✅ github issues: https://github.com/Green-Software-Foundation/if/issues?q=is%3Aopen+is%3Aissue+label%3Abug

## Vulnerability report process
- Have a vulnerability report process - ✅ Included in CONTRIBUTING.md
- Private vulnerability if supported must include info how to send - ✅ N/A (allowed) - no private vulnerability reporting set up but proposed
- Initial response time for vulnerability submitted in last 6 months must be <= 14 days - ✅ N/A (allowed) - no vulnerabilities have yet been reported. Response times for bugs and other issues have been <14 days, post-graduation development will be by volunteers and open source developer community, so we can't guarantee a time to resolution.

## Quality
### Working build system
- Must provide a working build system - ✅ IF is a locally running NodeJS app. We do provide a devcontainer for eays environment setup. Installation is simply achieved using `npm i @grnsft/if`.

### Automated test suite
- Have at least one automated test suite and documentation how to run it - ✅  We have a comprehensive set of unit tests and a library of becnhmark manifest files that act as integration tests. These can be run locally, and they are executed as part of our CI/CD on any PRs into `main`.

## New functionaility testing
- Formal/informal policy for adding tests for new features - ✅ Test suite in CI/CD checks for breaking changes in PRs. Any new feature must include unit tests and an example manifest that demonstrates usage.
- Evidence of policy being adhered to - ✅ 

### Warning flags
- Compiler warning flags or linter tools for code quality/errors - ✅ CodeQL analysis in automated CI : https://github.com/Green-Software-Foundation/carbon-aware-sdk/blob/dev/.github/workflows/1-pr.yaml#L82
- Address warnings from these tools - ✅ blocking PRs on fail

## Security
### Secure development knowledge
- At least one primary developer who knows how to design secure software - ✅ Manushak and Narek are both primary developers and have broad experience.
- At least one of the project's primary developers MUST know of common kinds of errors that lead to vulnerabilities in this kind of software, as well as at least one method to counter or mitigate each of them - ✅ 

### Use basic good cryptographic practices
- https://www.bestpractices.dev/en/criteria/0#0.crypto_published - ✅ uses HTTPS for WebAPI, N/A for CLI
- https://www.bestpractices.dev/en/criteria/0#0.crypto_floss - ✅ uses dotnet 8.0 implementations
- https://www.bestpractices.dev/en/criteria/0#0.crypto_keylength - ✅ uses dotnet 8.0 implementations
- https://www.bestpractices.dev/en/criteria/0#0.crypto_working - ✅ uses dotnet 8.0 implementations
- https://www.bestpractices.dev/en/criteria/0#0.crypto_password_storage - ✅ ⚠️  uses dotnet 8.0 implementations
- https://www.bestpractices.dev/en/criteria/0#0.crypto_random - ✅ uses dotnet 8.0 implementatons for HTTPS

### Secured delivery against man-in-the-middle (MITM) attacks
- Delivery mechanisms that counters MITM - ✅ uses HTTPS
- Cyrptographic hash NOT retrived over HTTP - ✅  uses HTTPS

### Publicly known vulnerabilities fixed
- No unpatched vulnerabilities of medium or higher severity that have been publicly known for more than 60 day - ✅ no such vulnerabilities

### Other security issues
- Public repo doesnt leak private credential - ✅ does not do that.

## Analysis
### Static code analysis
- At least one FLOSS static code analysis tool - ✅ uses `npm fix` for linting and error surfacing.
- All medium and higher severity exploitable vulnerabilities discovered with static code analysis MUST be fixed in a timely way after they are confirmed - ✅ We have not yet had any exploitable vulnerabilities reported, but the GSF team will respond promptly to any disclosed issues.

### Dynamic code analysis
- All medium and higher severity exploitable vulnerabilities discovered with dynamic code analysis MUST be fixed in a timely way after they are confirmed. - ✅ We have not yet had any exploitable vulnerabilities reported, but the GSF team will respond promptly to any disclosed issues.
