#!/bin/bash
 
echo "Starting impact tests"
prefix="manifests/examples"

# Using find to traverse files recursively within the manifests/examples folder
find "$prefix" -type f | while read -r file; do
    # Remove the prefix and store the output file path
    outfile="${file#$prefix/}"
    
    echo ""
    echo "Executing $file, outfile is $outfile"
    echo ""
    
    # Ensure the output directory exists before running the command
    output_dir="manifests/outputs/$(dirname "$outfile")"
    mkdir -p "$output_dir"
    
    # Run the npm command with the correct file and output path
    npm run if-run -- -m "$file" -o "$output_dir/$(basename "$outfile")"
done

exit 0
