#!/bin/bash
echo 'Running all manifests'   


for f in ./examples/manifests/*.yml; do 
  echo "Processing $f file..."; 
  npm run if -- --manifest $f 
  done
