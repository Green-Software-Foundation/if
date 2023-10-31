# Overview

Impact Framework (IF) aims to make software carbon measurements easy.

IF allows you to calculate the energy and carbon impacts of your software applications withou writing any code. All you have to do is write a simple manifest file, known as an `impl` and IF handles the rest.

The project is entirely open source and composability is a core design principle - we want you to be able to create your own models and plug them in to our framework, or pick from a broad universe of open source models created by others.

# Motivation

If you can't measure, you can't improve. Software has many negative environmental **impacts** which we need to optimize, carbon, water, and energy, to name just a few.

Unfortunately, measuring software impact metrics like carbon, water, and energy is complex and nuanced. 

Modern applications are composed of many smaller pieces of software (components) running on different environments, for example, private cloud, public cloud, bare-metal, virtualized, containerized, mobile, laptops, desktops, embedded, and IoT. Many components that make up a typical software application are run on something other than resources you own or control, which makes including the impact of managed services in your measurement especially hard.  

The impacts of software components also vary over time, so as well as understanding **which** components contribute most to the overall impacts, there is also a question of **when** they contribute the most.

Only through a granular analysis of the impacts of your software system can investments in reducing its impact be prioritized and verified. Measurement is the first and most crucial step in greening a software system, and the first step in that process with the [Impact Engine Framework](Impact%20Engine%20Framework.md) is to create an [Impact Graph](Impact%20Graph.md).

## Navigating these docs

The lefthand sidebar contains links to all the information you need to understand Impact Framework. 

You can find specification pages for individual components of the framework in [`specification`](./specification/). 

In [`tutorials`](./tutorials) you will find walkthrouhg guides and tutorials explaining how to achieve specific tasks, such as writing an `impl`, running the model and creating new plugins. 

You will find documentation for the individual built-in model implementations in [`models`](./05-models/).

