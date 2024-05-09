# Impact Framework


> [!IMPORTANT]
> Incubation Project: This project is an incubation project being run inside the Green Software Foundation; as such, we DON’T recommend using it in any critical use case. Incubation projects are experimental, offer no support guarantee, have minimal governance and process, and may be retired at any moment. This project may one day Graduate, in which case this disclaimer will be removed.

**Note** We have recently (March 2024) refactored the IF codebase and introduced some changes affecting both users and developers. You can read our migration guide [HERE](./Refactor-migration-guide.md) to help you update to the latest version!


[Impact Framework](https://greensoftwarefoundation.atlassian.net/wiki/spaces/~612dd45e45cd76006a84071a/pages/17072136/Opensource+Impact+Engine+Framework) (IF) is an [Incubation](https://oc.greensoftware.foundation/project-lifecycle.html#incubation) project from the [Open Source Working Group](https://greensoftwarefoundation.atlassian.net/wiki/spaces/~612dd45e45cd76006a84071a/pages/852049/Open+Source+Working+Group) in the [Green Software Foundation](https://greensoftware.foundation/).


**Our documentation is online at [if.greensoftware.foundation](https://if.greensoftware.foundation/)**


**IF** is a framework to **M**odel, **M**easure, si**M**ulate and **M**onitor the environmental impacts of software

Modern applications are composed of many smaller pieces of software (components) running on many different environments, for example, private cloud, public cloud, bare-metal, virtualized, containerized, mobile, laptops, and desktops.

Every environment requires a different plugin of measurement, and there is no single solution you can use to calculate the environmental impacts for all components across all environments.      

The friction to measuring software emissions isn't that we need to know how, it's that we run software on many things and each thing has several different ways to measure.

Read the [specification and design docs](https://if.greensoftware.foundation) to begin.


## Get started

The first thing to understand is that IF is a framework for running plugins. This means that in order to do some calculations, you need to load some plugins from some external resource. We provide a [standard library of plugins](https://github.com/Green-Software-Foundation/if-plugins) and a repository of [community plugins](https://github.com/Green-Software-Foundation/if-unofficial-plugins) to get you started. 

Start by installing framework itself:

```sh
npm install -g "@grnsft/if"
```
Then installing some plugins:

```sh
npm install -g "@grnsft/if-plugins"
```

Then create a `manifest` file that describes your application (see our docs for a detailed explanation).

Then, run `if` using the following command:

```sh
ie --manifest <path-to-your-manifest-file>
## or you can use aliases
ie -m <path-to-your-manifest-file>
```

Note that above command will not print the final output. In order to print the final output to the console, run `if` using the optional stdout argument:
```sh
ie --manifest <path-to-your-manifest-file> --stdout
## or using aliases
ie -m <path-to-your-manifest-file> -s
```

You can also add a savepath for your output yaml in order to have the output stored in a file:

```sh
ie --manifest <path-to-your-manifest-file> --output <your-savepath>
## or using aliases
ie -m <path-to-your-manifest-file> -o <your-savepath>
```

The `ie` CLI tool will configure and run the plugins defined in your input `yaml` (`manifest`) and return the results as an output `yaml` (`output`).

Use the `help` command if you need guidance about the available commands

```sh
ie --help
## or using alias
ie -h
```

## Documentation

Please read our documentation at [if.greensoftware.foundation](https://if.greensoftware.foundation/)

## Video walk-through

Watch this video to learn how to create and run a `manifest`.

[![Watch the walk-through video](https://i3.ytimg.com/vi/R-6eDM8AsvY/maxresdefault.jpg)](https://youtu.be/GW37Qd4AQbU)


## Contributing

To contribute to IF, please fork this repository and raise a pull request from your fork. 

You can check our issue board for issues tagged `help-wanted`. These are issues that are not currently, actively being worked on by the core team but are well-scoped enough for someone to pick up. We recommend commenting on the issue to start a chat with the core team, then start working on the issue when you have been assigned to it. This process helps to ensure your work is aligned with our roadmap and makes it much more likely that your changes will get merged compared to unsolicited PRs.

Please read the full contribution guidelines at [if.greensoftware.foundation](https://if.greensoftware.foundation/Contributing)

The same guidelines also apply to `if-docs`, `if-plugins` and `if-unofficial-plugins`.

## Bug reports

To report bugs please use our bug report template. You can do this by opening a new issue and selecting `Bug Report` when you are prompted to pick a template. The more information you provide,.the quicker we will be able to reproduce, diagnose and triage your issue.

To read about our bug reporting and triage process, please see [our contribution guidelines](contributing.md#reporting-bugs).
