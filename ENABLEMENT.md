# Enablement Guide for Impact Framework (IF)

## What is the Impact Framework?

The **Impact Framework (IF)** empowers you to calculate and understand the environmental impact of your software. It comes with a standard library of built-in plugins, referred to as builtins, and an Explorer for discovering and installing third-party plugins.

## How to Use the Impact Framework?

### Prerequisites

Before getting started, ensure you have the following:

1. **Node.js**: Installed and configured.
2. **NPM**: Comes with Node.js; ensure it’s updated.
3. **Access to Documentation**: Familiarize yourself with the [IF documentation](https://if.greensoftware.foundation/).
4. **Basic YAML Knowledge**: For creating and managing manifest files.

## Steps to Enable the Impact Framework

### Step 1: Installation

Install the latest version of IF globally using NPM:

```sh
npm install -g "@grnsft/if"
```

`IF` provides multiple command-line tools, with the primary tool being `if-run`.

### Step 2: Working with Command-Line Tools

1. `if-run`: Execute Manifest Files

   - Description: Executes manifest files to calculate impact.
   - Manifest File: A YAML file central to IF functionality. It contains configurations, application architecture, input data, and serves as a portable, shareable, human-readable document for audits.
   - Usage:

   ```sh
   if-run --manifest <path-to-your-manifest-file>
   ```

More about if-run [here](https://if.greensoftware.foundation/reference/cli#if-run).

2. `if-env`: Create Local Development Environments

   - Description: Sets up a local environment for running manifests.
   - Usage:

   ```sh
   mkdir my-manifest && cd my-manifest
   if-env
   ```

Find details in the [documentation](https://if.greensoftware.foundation/reference/cli#if-env).

3. `if-check`: Verify Manifests

   - Description: Combines the functionalities of if-env and if-diff to verify manifest files with outputs and execution sections.
   - Usage:

   ```sh
   # Check a specific manifest file
   if-check -m <path-to-your-manifest-file>

   # Check all manifests in a directory
   if-check -d /path-to-your-manifests
   ```

Explore more in the [documentation](https://if.greensoftware.foundation/reference/cli#if-check).

4. `if-csv`: Save Data to CSV

   - Description: Saves calculated impact data to a CSV file.
   - Usage:

   ```sh
   if-csv -m ./my-manifest.yml -p carbon
   ```

Read more in the [documentation](https://if.greensoftware.foundation/reference/cli#if-csv).

5. `if-diff`: Compare Manifests or Outputs

   - Description: Compares two manifest or output files to identify differences.
   - Usage:

   ```sh
   if-diff <file1> <file2>
   ```

Details are available in the [documentation](https://if.greensoftware.foundation/reference/cli#if-diff).

### Step 3: Explore Plugins

- Built-In Plugins: Utilize IF’s built-ins for common environmental impact assessments.
- Third-Party Plugins: Visit the Explorer to discover and install third-party plugins tailored to your needs.

### Step 4: Help and Guidance

For assistance with any command, use the --help flag:

```sh
if-run --help
```

## Additional Resources

- Documentation: [IF Documentation](https://if.greensoftware.foundation)
- Third-Party Plugins: [Plugin Explorer](https://explorer.if.greensoftware.foundation)

## Support

Join the IF Community for updates and discussions:

- Mailing List: [if-community@greensoftware.foundation](https://groups.google.com/u/1/a/greensoftware.foundation/g/if-community)
