

#Converts the CSV files from CCF Coefficients Database to JSON.
ccf-data:
	cat third-party/ccf-coefficients/data/aws-instances.csv | python -c 'import csv, json, sys; print(json.dumps([dict(r) for r in csv.DictReader(sys.stdin)]))' > lib/ccf/aws-instances.json
	cat third-party/ccf-coefficients/output/coefficients-aws-use.csv | python -c 'import csv, json, sys; print(json.dumps([dict(r) for r in csv.DictReader(sys.stdin)]))' > lib/ccf/aws-use.json
	cat third-party/ccf-coefficients/output/coefficients-aws-embodied.csv | python -c 'import csv, json, sys; print(json.dumps([dict(r) for r in csv.DictReader(sys.stdin)]))' > lib/ccf/aws-embodied.json
	cat third-party/ccf-coefficients/data/gcp-instances.csv | python -c 'import csv, json, sys; print(json.dumps([dict(r) for r in csv.DictReader(sys.stdin)]))' > lib/ccf/gcp-instances.json
	cat third-party/ccf-coefficients/output/coefficients-gcp-use.csv | python -c 'import csv, json, sys; print(json.dumps([dict(r) for r in csv.DictReader(sys.stdin)]))' > lib/ccf/gcp-use.json
	cat third-party/ccf-coefficients/output/coefficients-gcp-embodied.csv | python -c 'import csv, json, sys; print(json.dumps([dict(r) for r in csv.DictReader(sys.stdin)]))' > lib/ccf/gcp-embodied.json
	cat third-party/ccf-coefficients/data/azure-instances.csv | python -c 'import csv, json, sys; print(json.dumps([dict(r) for r in csv.DictReader(sys.stdin)]))' > lib/ccf/azure-instances.json
	cat third-party/ccf-coefficients/output/coefficients-azure-use.csv | python -c 'import csv, json, sys; print(json.dumps([dict(r) for r in csv.DictReader(sys.stdin)]))' > lib/ccf/azure-use.json
	cat third-party/ccf-coefficients/output/coefficients-azure-embodied.csv | python -c 'import csv, json, sys; print(json.dumps([dict(r) for r in csv.DictReader(sys.stdin)]))' > lib/ccf/azure-embodied.json

install-shell-imp:
  cp src/lib/shell-imp/sampler /usr/local/bin/sampler
