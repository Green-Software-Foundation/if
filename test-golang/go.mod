module github.com/greensoftwarefoundation/golang-test

go 1.20

replace (
	github.com/Green-Software-Foundation/carbonql => ../dist/go/carbonql/
	github.com/Green-Software-Foundation/carbonql/jsii => ../dist/go/carbonql/jsii
)

require (
	github.com/Green-Software-Foundation/carbonql v0.0.0
	github.com/kr/pretty v0.3.1
)

require (
	github.com/Masterminds/semver/v3 v3.2.1 // indirect
	github.com/aws/jsii-runtime-go v1.84.0 // indirect
	github.com/kr/text v0.2.0 // indirect
	github.com/rogpeppe/go-internal v1.9.0 // indirect
)
