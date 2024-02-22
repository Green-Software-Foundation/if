#!/bin/bash
echo 'Running all manifests'   


for f in ./examples/impls/test/*.yml; do 
  echo "Processing $f file..."; 
  npm run if -- --manigest $f 
  done
