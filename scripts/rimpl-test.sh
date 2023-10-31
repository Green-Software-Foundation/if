#!/bin/bash

echo "Starting rimpl tests"
prefix="examples/impls/test/";
for file in examples/impls/test/*;
do
echo ""
echo executing $file, outfile is ${file#"$prefix"}
echo ""
npx ts-node scripts/rimpl.ts --impl $file --ompl examples/ompls/${file#"$prefix"}
done
exit 0
