import {describe, expect, jest, test} from '@jest/globals';
import {CloudInstanceMetadataModel} from '../../../../lib/cloud-instance-metadata/index';

jest.setTimeout(30000);

describe('cimd:configure test:aws', () => {
  test('initialize and test:aws', async () => {
    const model = await new CloudInstanceMetadataModel().configure('cimd', {});
    expect(model).toBeInstanceOf(CloudInstanceMetadataModel);
    await expect(
      model.execute([
        {
          'cloud-instance-type': 'm5n.large',
          'cloud-vendor': 'aws',
        },
      ])
    ).resolves.toStrictEqual(
      expect.arrayContaining([
        {
          'cloud-instance-type': 'm5n.large',
          'cloud-vendor': 'aws',
          'physical-processor': 'Intel Xeon Platinum 8259CL',
          'vcpus-allocated': '2',
          'vcpus-total': '96',
          'memory-available': '8',
        },
      ])
    );
    await expect(
      model.execute([
        {
          'cloud-instance-type': 't2.micro',
          'cloud-vendor': 'aws2',
        },
      ])
    ).rejects.toThrowError(
      'cloud-vendor: Only `aws`/`azure` is currently supported'
    );
    await expect(
      model.execute([
        {
          'cloud-instance-type': 't2.micro2',
          'cloud-vendor': 'aws',
        },
      ])
    ).rejects.toThrowError(
      'cloud-instance-type: t2.micro2 is not supported in vendor: aws'
    );
  });
});

describe('cimd:configure test:azure', () => {
  test('initialize and test', async () => {
    const model = await new CloudInstanceMetadataModel().configure('cimd', {});
    expect(model).toBeInstanceOf(CloudInstanceMetadataModel);
    await expect(
      model.execute([
        {
          'cloud-instance-type': 'Standard_NC24s_v3',
          'cloud-vendor': 'azure',
        },
      ])
    ).resolves.toStrictEqual(
      expect.arrayContaining([
        {
          'cloud-instance-type': 'Standard_NC24s_v3',
          'cloud-vendor': 'azure',
          'physical-processor': 'Intel Xeon E5-2690 v4',
          'vcpus-allocated': '24',
          'vcpus-total': '28',
          'memory-available': '448',
          'thermal-design-power': '135',
        },
      ])
    );
    await expect(
      model.execute([
        {
          'cloud-instance-type': 't2.micro',
          'cloud-vendor': 'aws2',
        },
      ])
    ).rejects.toThrowError(
      'cloud-vendor: Only `aws`/`azure` is currently supported'
    );
    await expect(
      model.execute([
        {
          'cloud-instance-type': 't2.micro2',
          'cloud-vendor': 'azure',
        },
      ])
    ).rejects.toThrowError(
      'cloud-instance-type: t2.micro2 is not supported in vendor: azure'
    );
  });
});
