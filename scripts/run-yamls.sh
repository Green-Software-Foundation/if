#!/bin/bash
echo 'Running all impls'   


for f in ./examples/impls/test/*.yml; do 
  echo "Processing $f file..."; 
  npm run impact-engine -- --impl $f 
  done
