# Software Carbon Intensity - Operational Emissions (SCI-O)

Software systems cause emissions through the hardware that they operate on, both through the energy that the physical
hardware consumes and the emissions associated with manufacturing the hardware. This specification defines a methodology
for calculating the rate of carbon emissions for a software system. The purpose is to help users and developers make
informed choices about which tools, approaches, architectures, and services they use in the future. It is a score rather
than a total; lower numbers are better than higher numbers, and reaching 0 is impossible. This specification is focused
on helping users and developers understand how to improve software to reduce or avoid the creation of
emissions. [Read more...](https://github.com/Green-Software-Foundation/sci/blob/main/Software_Carbon_Intensity/Software_Carbon_Intensity_Specification.md)

## Scope

To calculate the operational emissions O for a software application, use the following:

O = (E * I)

[Operational Emissions...](https://github.com/Green-Software-Foundation/sci/blob/main/Software_Carbon_Intensity/Software_Carbon_Intensity_Specification.md#operational-emissions)

## Implementation

IEF implements the plugin based on the simple multiplication of the energy and intensity values as inputs.

The component has no internal way of determining the energy and intensity values. These values are expected to be
provided by the user.

## Usage

```typescript
import {SciOModel} from '@gsf/ief';

const sciOModel = new SciOModel();
sciOModel.configure()
const results = sciOModel.calculate([
  {
    energy: 0.5, // energy value in kWh 
    'grid-ci': 0.5, // intensity value gCO2e/kWh
  }
])
```
