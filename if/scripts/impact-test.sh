#!/bin/bash

echo "Starting impact tests"
prefix="examples/manifests/";
for file in examples/manifests/*;
do
echo ""
echo executing $file, outfile is ${file#"$prefix"}
echo ""
npx ts-node ./src --manifest $file --output examples/outputs/${file#"$prefix"}
done
exit 0
