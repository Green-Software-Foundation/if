import * as YAML from 'js-yaml';

export const readFile = async (filePath: string) => {
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
};

export const stat = async (filePath: string) => {
  if (filePath === 'true') {
    return true;
  } else {
    throw new Error('File not found.');
  }
};
