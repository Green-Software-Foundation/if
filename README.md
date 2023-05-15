# carbonQL

Modern applications are composed of many smaller pieces of software (components) running on many different environments, for example, private cloud, public cloud, bare-metal, virtualized, containerized, mobile, laptops, and desktops.
Every environment requires a different way of measurement, and there is no single solution you can use to calculate the carbon emissions for all environments.      
The friction to measuring software emissions isn't that we need to know how, it's that we run software on many things and each thing has several different ways to measure.

## Solution

Therefore, the intent of this project is to build a SDK or a framework codenamed *carbonQL* that you can use to measure your software emissions for every runtime environment. If your application runs on bare-metal servers in the private cloud, virtualized servers in the public cloud, mobile, desktop, and laptop end-user devices, the carbonQL SDK  gives you data for all of them.

The carbonQL is:        

-**Opinionated**: It’s the expertise in software measurement codified into software. Rather than giving you options, it gives you answers.   

-**Ubiquitous**: Whatever the environment, bare metal, virtualized, mobile, IoT, carbon QL project will always be able to give you numbers.   

-**Declarative**: You express your intentions, needs, and context, and carbonQL selects the correct measurement methodology. For example, if you are calculating an SCI score, the carbonQL SDK will return you data that meets the requirements of the SCI. Likewise, if you are calculating for GHG reporting, the SDK will return you information that meets the requirements of GHG reporting.      

-**Free**: carbonQL is open source and comes linked with public data sources that are free to use. Using the library doesn't cost anything; however, the free sources might be limited.     

-**Extendable**: The SDK can be enhanced to leverage more advanced commercial or private models, for example, real-time electricity carbon intensity feeds.


**Audience**        

-Software monitoring products looking to add carbon as a software measurement metric.       

-Software optimization tools looking to represent optimizations in terms of carbon reductions.      

-Developer tooling. Developer and Dev/Ops focussed products looking to add carbon measurement.
-Sustainability professionals who are interested in calculating the carbon emissions for reporting.     

-Organizations looking to measure-for-action the carbon emissions reduction from migrating a software application from on-prem to the cloud.        


## Integration with SCI Open Data

At the backend carbonQL project is planned to be integrated with multiple datasets that can be used to provide  carbon emissions values. These datasets could be public or private as well.

As per SCI specifications, carbon emissions values are required for the 4 different components of the SCI equation E, I, M and R. There are reference emission value datasets like Climatiq, Boazvita, Cloud carbon co-efficients that need to be leveraged to provide values for these SCI components. We refer to these emission value datasets as SCI open data and there is a curated list of datasets available as part of the [SCI guidance project](https://sci-guide.greensoftware.foundation/)


## Architecture of the Solution

The carbonQL acts like a facade, it might call out to other APIs, CSV files, DBs, the underlying model can be of any format and in any location. 

![CarbonQL_architecture](https://user-images.githubusercontent.com/10396742/219698334-eb98bcfd-f968-400a-9ffd-b0aeaee8823f.JPG)


It provides a common interface to all the various models, makes opinionated decisions about which model to use and how its results should be transformed into the format you need for your calculations. In the above diagram we can see that the carbonQL is intended to connect to various backend carbon datasets like Climatiq, Cloud carbon co-efficients to bring back emissions data given the usage.




