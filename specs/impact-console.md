# Impact Console (IMPCON)

Once built IMPs can be used in many different applications that need some form of software measurement. However, for development, testing and the demo functionality we need a solution to call IMPs before those higher-level applications and middleware layers are created.

`IMPCON` is a command line tool which we can use to:
* Load an IMP.
* Pass data to an IMP.
* Verify that the output impact metric is correct.

```
impcon 
-plugin <path>: The IMP code is loaded dynamically into memory.
-static-data param=val, param=val, param=val: Static data passed into the command line.
-snapshot param=val, param=val, param=val (or a file): Passes in telemetry on command line for simple use cases.
-batch <path to file>: Passes in data from a file as a single batch.
-stream <path to file>: Fakes a stream interface from batch file data.
```

`IMPCON` then prints out the console (or perhaps to a file) the result of calling that IMM through the IMP with data provided on the command line. 

Using `IMPCON` we can:

* Demo the features of an IMP calling an IMM, to an audience, to bring understanding.
* Compare one IMM to another, pass in the same data and see if the results differ.
* Compare two IMPs that perhaps call the same IMM, how they differ in function.
* Test an IMP/IMM, pass in some input data and see if the output matches what’s expected.