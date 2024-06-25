import * as YAML from 'js-yaml';
import * as fs from 'fs';
import * as fsAsync from 'fs/promises';
import * as path from 'path';

export const readFile = async (filePath: string) => {
  /** mock for util/npm */
  if (filePath.includes('package.json-npm')) {
    const updatedPath = filePath.replace('-npm', '');
    return fs.readFileSync(updatedPath, 'utf8');
  }

  /** mock for util/json */
  if (filePath.includes('json-reject')) {
    return Promise.reject(new Error('rejected'));
  }

  if (filePath.includes('json')) {
    if (filePath.includes('param')) {
      return JSON.stringify({
        'mock-carbon': {
          description: 'an amount of carbon emitted into the atmosphere',
          unit: 'gCO2e',
          aggregation: 'sum',
        },
        'mock-cpu': {
          description: 'number of cores available',
          unit: 'cores',
          aggregation: 'none',
        },
      });
    }

    return JSON.stringify(filePath);
  }

  if (filePath.includes('fail.csv')) {
    throw new Error('file not found');
  }

  if (filePath.includes('fail-csv-reader.csv')) {
    return `
cpu-cores-available,≈ç≈¬˚∆∑∂´®øˆ´cpu-cores-utilized,     ---- cpu-manufacturer,cpu-model-name,cpu-tdp,gpu-count,gpu-model-name,Hardware Information on AWS Documentation & Comments,instance-class,instance-storage,memory-available,platform-memory,release-date,storage-drives
16,8,AWS,AWS Graviton
16,16,AWS,AWS Graviton,150.00,N/A,N/A,AWS Graviton (ARM),a1.4xlarge,EBS-Only,32,32,November 2018,`;
  }

  /**
   * Used for csv lookup plugin.
   */
  if (filePath.includes('.csv')) {
    return `
cpu-cores-available,cpu-cores-utilized,cpu-manufacturer,cpu-model-name,cpu-tdp,gpu-count,gpu-model-name,Hardware Information on AWS Documentation & Comments,instance-class,instance-storage,memory-available,platform-memory,release-date,storage-drives
16,8,AWS,AWS Graviton,150.00,N/A,N/A,AWS Graviton (ARM),a1.2xlarge,EBS-Only,16,32,November 2018,
16,16,AWS,AWS Graviton,150.00,N/A,N/A,AWS Graviton (ARM),a1.4xlarge,EBS-Only,32,32,November 2018,`;
  }

  /** mock for util/yaml */
  return `
  name: gsf-demo
  description: 
    Hello
  tags:
    kind: web
    complexity: moderate
    category: cloud
  initialize:
    plugins:
      mockavizta:
        path: mockavizta
        method: Mockavizta
  tree:
    children:
      front-end:
        pipeline: 
          - boavizta-cpu
        config:
          boavizta-cpu:
            core-units: 24
            processor: Intel® Core™ i7-1185G7
        inputs:
          - timestamp: 2023-07-06T00:00
            duration: 3600 # Secs
            cpu/utilization: 18.392
          - timestamp: 2023-08-06T00:00
            duration: 3600 # Secs
            cpu/utilization: 16`;
};

export const mkdir = (dirPath: string) => dirPath;

export const writeFile = async (pathToFile: string, content: string) => {
  if (pathToFile.includes('package.json-npm1')) {
    const updatedPath = pathToFile.replace('-npm1', '');
    const fileContent = await fsAsync.readFile(updatedPath, 'utf8');
    const fileContentObject = JSON.parse(fileContent);
    const parsedContent = JSON.parse(content);

    for (const property in fileContentObject) {
      expect(parsedContent).toHaveProperty(property);
    }
  } else if (pathToFile.includes('package.json-npm')) {
    const updatedPath = pathToFile.replace('-npm', '');
    const fileContent = await fsAsync.readFile(updatedPath, 'utf8');

    expect(content).toBe(fileContent);
  } else if (pathToFile.includes('/manifest.yml')) {
    const templateManifest = path.resolve(
      __dirname,
      '../../config/env-template.yml'
    );
    const fileContent = await fsAsync.readFile(templateManifest, 'utf8');

    expect(content).toBe(fileContent);
  } else {
    if (pathToFile === 'reject') {
      throw new Error('Wrong file path');
    }

    const mockPathToFile = 'mock-pathToFile';
    const mockContent = {
      name: 'mock-name',
    };
    const mockObject = YAML.dump(mockContent, {noRefs: true});

    expect(pathToFile).toBe(mockPathToFile);
    expect(content).toBe(mockObject);
  }
};

export const stat = async (filePath: string) => {
  if (filePath === 'true') {
    return true;
  } else {
    throw new Error('File not found.');
  }
};

export const access = async (directoryPath: string) => {
  if (directoryPath === 'true') {
    return true;
  } else {
    throw new Error('Directory not found.');
  }
};

export const unlink = async (filePath: string) => {
  if (filePath === 'true') {
    return;
  } else {
    throw new Error('File not found.');
  }
};
