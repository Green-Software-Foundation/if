# TDP Finder Model

## Scope

The TDP Finder model enables finding the TDP of a known processor in the model dataset. The TDP is then used by other models to calculate the e-cpu value. 

## Implementation

IEF implements the plugin based on the logic described above.

## Usage with IMPL
* Model Name: `tdp-finder`
```yaml
observations:
  - physical-processor: Intel Xeon Platinum 8175M
```
