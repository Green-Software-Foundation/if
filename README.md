# Impact Engine Framework

[Impact Engine Framework](https://greensoftwarefoundation.atlassian.net/wiki/spaces/~612dd45e45cd76006a84071a/pages/17072136/Opensource+Impact+Engine+Framework) is an [Incubation](https://oc.greensoftware.foundation/project-lifecycle.html#incubation) project from the [Open Source Working Group](https://greensoftwarefoundation.atlassian.net/wiki/spaces/~612dd45e45cd76006a84071a/pages/852049/Open+Source+Working+Group) in the [Green Software Foundation](https://greensoftware.foundation/).

**IEF** is a framework to **M**odel, **M**easure, si**M**ulate and **M**onitor the environmental impacts of software

Modern applications are composed of many smaller pieces of software (components) running on many different environments, for example, private cloud, public cloud, bare-metal, virtualized, containerized, mobile, laptops, and desktops.

Every environment requires a different model of measurement, and there is no single solution you can use to calculate the environmental impacts for all components across all environments.      

The friction to measuring software emissions isn't that we need to know how, it's that we run software on many things and each thing has several different ways to measure.

Read the [specification and design docs](https://github.com/Green-Software-Foundation/if-docs) to begin.


## Get started

The first thing to understand is that IF is a framework for running model plugins. This means that in order to do some calculations, you need to load some models from some external resource. We provide a [standard library of models](https://github.com/Green-Software-Foundation/if-models) and a repository of [community models](https://github.com/Green-Software-Foundation/if-community-models) to get you started. 

Start by installing some models:

```sh
yarn add https://github.com/Green-Software-Foundation/if-models
```

Then create an `impl` file that describes your application (see our docs for a detailed explanation).

Then, run `impact-engine` using the following command:

```sh
npx ts-node impact-engine.ts --impl <path-to-your-impl-file>
```

You can also add an optional savepath for your output yaml (if you do not provide one, the output will be printed to the console):

```sh
npx ts-node impact-engine.ts --impl <path-to-your-impl-file> --ompl <your-savepath>
```

The `impact-engine` CLI tool will configure and run the models defined in your input `yaml` (`impl`) and return the results as an output `yaml` (`ompl`).

## Video walk-through

Watch this video to learn how to create and run an `impl`.

[![Watch the walk-through video](https://i3.ytimg.com/vi/R-6eDM8AsvY/maxresdefault.jpg)](https://youtu.be/R-6eDM8AsvY)


## Run tests

To run the complete set of tests simply run

```sh
yarn test
```

To refresh the set of `ompl`s used for validating the output files, run the `scripts/impact-test.sh` bash script (for unix only) as follows:

```sh
./scripts/impact-test.sh
```

Then run

```sh
yarn test
```
