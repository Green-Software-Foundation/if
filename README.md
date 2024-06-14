# Impact Framework

[![Node.js CI](https://github.com/Green-Software-Foundation/if/actions/workflows/nodejs-ci.yml/badge.svg)](https://github.com/Green-Software-Foundation/if/actions/workflows/nodejs-ci.yml)

> [!IMPORTANT]
> Incubation Project: This project is an incubation project being run inside the Green Software Foundation; as such, we DON’T recommend using it in any critical use case. Incubation projects are experimental, offer no support guarantee, have minimal governance and process, and may be retired at any moment. This project may one day Graduate, in which case this disclaimer will be removed.

**Our documentation is online at [if.greensoftware.foundation](https://if.greensoftware.foundation/)**

**IF** is a framework to **M**odel, **M**easure, si**M**ulate and **M**onitor the environmental impacts of software

Modern applications are composed of many smaller pieces of software (components) running on many different environments, for example, private cloud, public cloud, bare-metal, virtualized, containerized, mobile, laptops, and desktops.

Every environment requires a different plugin of measurement, and there is no single solution you can use to calculate the environmental impacts for all components across all environments.

The friction to measuring software emissions isn't that we need to know how, it's that we run software on many things and each thing has several different ways to measure.

Read the [specification and design docs](https://if.greensoftware.foundation) to begin.

## Get started

IF is a framework for running pipelines of plugins that operate on a set of observations. This is all configured using a manifest file.  We provide a standard library of plugins that come bundled with IF - we refer to these as `builtins`. We also have an [Explorer](https://explorer.if.greensoftware.foundation) where anyone can list third party plugins you can install.

Start by installing the latest version of IF:

```sh
npm install -g "@grnsft/if"
```

Then create a `manifest` file that describes your application (see our docs for a detailed explanation).

Then, run `if` using the following command:

```sh
if-run --manifest <path-to-your-manifest-file> --stdout
## or you can use aliases
if-run -m <path-to-your-manifest-file> --stdout
```

Note that above command will print your outputs to the console. You can also provide the `--output` command to save your outputs to a yaml file:

```sh
if-run -m <path-to-your-manifest> -o <savepath>
```

Note that you also have to add configuration to your manifest to enable this, as follows:

```yaml
initialize:
  output:
    - yaml
```

The `if-run` CLI tool will configure and run the plugins defined in your input `yaml` (`manifest`) and return the results as an output `yaml` (`output`).

Use the `debug` command if you want to diagnose and fix errors in your plugin:

```sh
if-run --manifest <path-to-your-manifest-file> --debug
```

Use the `help` command if you need guidance about the available commands

```sh
if-run --help
## or using alias
if-run -h
```

## Documentation

Please read our documentation at [if.greensoftware.foundation](https://if.greensoftware.foundation/)


## Video walk-through

Watch this video to learn how to create and run a `manifest`.

[![Watch the walk-through video](https://i3.ytimg.com/vi/R-6eDM8AsvY/maxresdefault.jpg)](https://youtu.be/GW37Qd4AQbU)


## Join our mailing list

We have a public mailing list at [if-community@greensoftware.foundation](https://groups.google.com/u/1/a/greensoftware.foundation/g/if-community). We send out weekly updates that explain what we've shipped, what we're working on and how you can get involved each week!


## Contributing

To contribute to IF, please fork this repository and raise a pull request from your fork.

You can check our issue board for issues. We mark some issues `core-only` if they are somehow sensitive and we want one of our core developers to handle it. Any other issues are open for the community to work on. We recommend commenting on the issue to start a chat with the core team, then start working on the issue when you have been assigned to it. This process helps to ensure your work is aligned with our roadmap and makes it much more likely that your changes will get merged compared to unsolicited PRs.

Please read the full contribution guidelines at [if.greensoftware.foundation](https://if.greensoftware.foundation/Contributing)


## Bug reports

To report bugs please use our bug report template. You can do this by opening a new issue and selecting `Bug Report` when you are prompted to pick a template. The more information you provide,.the quicker we will be able to reproduce, diagnose and triage your issue.

To read about our bug reporting and triage process, please see [our contribution guidelines](contributing.md#reporting-bugs).
