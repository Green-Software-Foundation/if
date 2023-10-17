import {expect} from '@jest/globals';

import * as YAML from 'js-yaml';

export const readFile = async (_filePath: string, _format: string) => {
  return `
  name: gsf-demo
  description: 
    Hello
  tags:
    kind: web
    complexity: moderate
    category: cloud
  initialize:
    models:
      - name: boavizta-cpu
        kind: builtin
        config:
          allocation: LINEAR
          verbose: true
  graph:
    children:
      front-end:
        pipeline: 
          - boavizta-cpu
        config:
          boavizta-cpu:
            core-units: 24
            processor: Intel® Core™ i7-1185G7
        observations:
          - timestamp: 2023-07-06T00:00 # [KEYWORD] [NO-SUBFIELDS] time when measurement occurred
            duration: 3600 # Secs
            cpu-util: 18.392
          - timestamp: 2023-08-06T00:00 # [KEYWORD] [NO-SUBFIELDS] time when measurement occurred
            duration: 3600 # Secs
            cpu-util: 16`;
};

export const mkdir = (dirPath: string, _object: any) => dirPath;

export const writeFile = async (pathToFile: string, content: string) => {
  if (pathToFile === 'reject') {
    throw Error('Wrong file path');
  }

  const mockPathToFile = 'mock-pathToFile';
  const mockContent = {
    name: 'mock-name',
  };
  const mockObject = YAML.dump(mockContent, {noRefs: true});

  expect(pathToFile).toBe(mockPathToFile);
  expect(content).toBe(mockObject);
};
