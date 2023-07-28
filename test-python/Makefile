
.PHONY: build-jsii update impcon

install:
	python3 -m venv venv
	. venv/bin/activate

build-jsii:
	yarn
	yarn package

update:
	pip install ../dist/python/carbon_ql.core-1.0.0-py3-none-any.whl --force-reinstall

impcon: build-jsii update
	python3 impcon.py

