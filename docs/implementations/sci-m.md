# Software Carbon Intensity - Embodied Carbon (SCI-O)

Software systems cause emissions through the hardware that they operate on, both through the energy that the physical
hardware consumes and the emissions associated with manufacturing the hardware. This specification defines a methodology
for calculating the rate of carbon emissions for a software system. The purpose is to help users and developers make
informed choices about which tools, approaches, architectures, and services they use in the future. It is a score rather
than a total; lower numbers are better than higher numbers, and reaching 0 is impossible. This specification is focused
on helping users and developers understand how to improve software to reduce or avoid the creation of
emissions. [Read more...](https://github.com/Green-Software-Foundation/sci/blob/main/Software_Carbon_Intensity/Software_Carbon_Intensity_Specification.md)

## Scope

Embodied carbon (otherwise referred to as “embedded carbon”) is the amount of carbon emitted during the creation and disposal of a hardware device.

To calculate the share of M for a software application, use the equation:
```
M = TE * TS * RS
```
Where:

TE = Total Embodied Emissions; the sum of Life Cycle Assessment (LCA) emissions for all hardware components.

TS = Time-share; the share of the total life span of the hardware reserved for use by the software.

RS = Resource-share; the share of the total available resources of the hardware reserved for use by the software.
The equation can be expanded further:

```M = TE * (TiR/EL) * (RR/ToR)```

Where:

TiR = Time Reserved; the length of time the hardware is reserved for use by the software.

EL = Expected Lifespan; the anticipated time that the equipment will be installed.

RR = Resources Reserved; the number of resources reserved for use by the software.

ToR = Total Resources; the total number of resources available.


[Embodied Emissions...](https://github.com/Green-Software-Foundation/sci/blob/main/Software_Carbon_Intensity/Software_Carbon_Intensity_Specification.md#embodied-emissions)

## Implementation

IEF implements the plugin based on the logic described above.

It expects all five values to be provided as input to determine the ```m``` value.

## Usage

```typescript
import { SciMModel } from '@gsf/ief';

const sciMModel = new SciMModel();
sciMModel.configure()
const results = sciMModel.calculate([
  {
    te: 200, // in gCO2e for total resource units
    tir: 60 * 60 * 24 * 30, // time reserved in seconds, can point to another field "duration"
    el: 60 * 60 * 24 * 365 * 4, // lifespan in seconds (4 years)
    rr: 1, // resource units reserved / used
    tor: 1, // total resource units available
  },
  {
    te: 200, // in gCO2e
    tir: "duration", //point to another field "duration"
    el: 60 * 60 * 24 * 365 * 4, // lifespan in seconds (4 years)
    rr: 1, // resource units reserved / used
    tor: 1, // total resource units available
    duration: 60 * 60 * 24 * 30,
  },
])
```
