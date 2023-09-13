# WattTime Grid Emissions Model

## Introduction

WattTime technology—based on real-time grid data, cutting-edge algorithms, and machine learning—provides first-of-its-kind insight into your local electricity grid’s marginal emissions rate. [Read More...](https://www.watttime.org/api-documentation/#introduction)


## Scope 

WattTime Model provides a way to calculate emissions for a given time in a specific location. 

The model is based on the WattTime API. The model uses the following inputs:
* location: Location of the software system ({latitude:0.0, longitude:0.0})
* timestamp: Timestamp of the recorded event (2021-01-01T00:00:00Z) RFC3339
* duration: Duration of the recorded event in seconds (3600)


## Implementation

Limitations: 
* Set of observations are to be within 32 days of each other. 
* Emissions are aggregated for every 5 minutes regardless of the granularity of the observations.

### Authentication
**Required Parameters:**

* username: Username for the WattTime API
* password: Password for the WattTime API



```typescript
// environment variable configuration
// export WATT_TIME_USERNAME=test1
// export WATT_TIME_PASSWORD=test2
// use environment variables to configure the model
const env_model = await new WattTimeGridEmissions().configure('watt-time', {
  username: process.env.WATT_TIME_USERNAME,
  password: process.env.WATT_TIME_PASSWORD,
});
```

#### Environment Variable based configuration for IMPL
```yaml
# environment variable config , prefix the environment variables with "ENV" to load them inside the model.  
# export WATT_TIME_USERNAME=test1
# export WATT_TIME_PASSWORD=test2
config:
  username: ENV_WATT_TIME_USERNAME
  password: ENV_WATT_TIME_PASSWORD
observations:
  - timestamp: 2021-01-01T00:00:00Z
    location:
      latitude: 43.22
      longitude: -80.22
    duration: 3600
```
#### Static configuration for IMPL
```yaml
config:
  username: username
  password: password
observations:
  - timestamp: 2021-01-01T00:00:00Z
    location:
      latitude: 43.22
      longitude: -80.22
    duration: 3600
```


### Calculations


