- **What**: 
- **Why**: 
- **DoD**:
- [ ] Does the model meet the specification?
- [ ] Does the model have complete test coverage, including edge cases, happy path and error cases?
- [ ] Is the code documented?

## Config
- `variable`: If this variable is present in the top level config what behaviour does it trigger? What is the default value if none is provided?

## Observation
_List the variables this model expects in an input observation_
- `variable`: Description

## Impacts
_List the variables this model exports out as an impact_
- `variable`: Description

## Behavior
What does the model do to turn the observations into impacts? List any important equations or references.

## Assumptions
What are the core assumptions this model makes?

## Limitations
In what situations is this model limited in it's function, behaviour, accuracy etc...

## Example
Provide at least one example of some input config and observations. This is in pimpl format not rimpl format, so the config is the global config and all parameters must be present on the observation.

### Input

```yaml
config:
 key: value
observations: 
  - timestamp: 2023-07-06T00:00
    duration: 3600
```

### Output

```yaml
config:
 key: value
observations: 
  - timestamp: 2023-07-06T00:00
    duration: 3600
    yyyy: zzzz
impacts: 
  - timestamp: 2023-07-06T00:00
    duration: 3600
    yyyy: zzzz
    aaaa: bbbb
```
