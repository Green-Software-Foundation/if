import {AzureImporterModel} from '../../../../lib/azure-importer';
import {MetricsListOptionalParams} from '@azure/arm-monitor';
jest.mock('@azure/identity', () => ({
  __esModule: true,
  DefaultAzureCredential: class MockAzureCredentials {},
}));

jest.mock('@azure/arm-monitor', () => ({
  __esModule: true,

  MonitorClient: class MockMonitorClient {
    public metrics: any;
    constructor() {
      this.metrics = {
        list: (
          resourceUri: string,
          options?: MetricsListOptionalParams | undefined
        ) => {
          if (
            options !== undefined &&
            options.metricnames === 'Percentage CPU'
          ) {
            return {
              url: resourceUri,
              cost: 59,
              timespan: '2023-11-02T10:35:31Z/2023-11-02T11:35:31Z',
              interval: 'PT5M',
              namespace: 'Microsoft.Compute/virtualMachines',
              resourceregion: 'uksouth',
              value: [
                {
                  id: '/subscriptions/9de7e19f-8a18-4e73-9451-45fc74e7d0d3/resourceGroups/vm1_group/providers/Microsoft.Compute/virtualMachines/vm1/providers/Microsoft.Insights/metrics/Percentage CPU',
                  type: 'Microsoft.Insights/metrics',
                  name: [Object],
                  displayDescription:
                    'The percentage of allocated compute units that are currently in use by the Virtual Machine(s)',
                  errorCode: 'Success',
                  unit: 'Percent',
                  timeseries: [
                    {
                      data: [
                        {
                          timeStamp: new Date('2023-11-02T10:35:00.000Z'),
                          average: 3.14,
                        },
                      ],
                    },
                  ],
                },
              ],
            };
          } else if (
            options !== undefined &&
            options.metricnames === 'Available Memory Bytes'
          ) {
            return {
              url: resourceUri,
              cost: 59,
              timespan: '2023-11-02T10:35:31Z/2023-11-02T11:35:31Z',
              interval: 'PT5M',
              namespace: 'Microsoft.Compute/virtualMachines',
              resourceregion: 'uksouth',
              value: [
                {
                  id: '/subscriptions/9de7e19f-8a18-4e73-9451-45fc74e7d0d3/resourceGroups/vm1_group/providers/Microsoft.Compute/virtualMachines/vm1/providers/Microsoft.Insights/metrics/Percentage CPU',
                  type: 'Microsoft.Insights/metrics',
                  name: [Object],
                  displayDescription:
                    'The percentage of allocated compute units that are currently in use by the Virtual Machine(s)',
                  errorCode: 'Success',
                  unit: 'Percent',
                  timeseries: [
                    {
                      data: [
                        {
                          timeStamp: new Date('2023-11-02T10:35:00.000Z'),
                          average: 500000000,
                        },
                      ],
                    },
                  ],
                },
              ],
            };
          } else {
            throw new Error('invalid params');
          }
        },
      };
    }
  },
}));

jest.mock('@azure/arm-compute', () => ({
  __esModule: true,
  ComputeManagementClient: class MockComputeManagementClient {
    public virtualMachines: any;
    public resourceSkus: any;
    constructor() {
      this.virtualMachines = {
        list: function* () {
          yield {
            id: '/subscriptions/999999999999999999/resourceGroups/vm1_group/providers/Microsoft.Compute/virtualMachines/vm1',
            name: 'vm1',
            type: 'Microsoft.Compute/virtualMachines',
            location: 'uksouth',
            zones: ['1'],
            hardwareProfile: {vmSize: 'Standard_B1s'},
            storageProfile: {
              imageReference: [Object],
              osDisk: [Object],
              dataDisks: [],
              diskControllerType: 'SCSI',
            },
            osProfile: {
              computerName: 'vm1',
              adminUsername: 'user',
              linuxConfiguration: [Object],
              secrets: [],
              allowExtensionOperations: true,
              requireGuestProvisionSignal: true,
            },
            networkProfile: {networkInterfaces: [Array]},
            securityProfile: {
              uefiSettings: [Object],
              securityType: 'TrustedLaunch',
            },
            diagnosticsProfile: {bootDiagnostics: [Object]},
            provisioningState: 'Succeeded',
            vmId: '11cf628c-38bb-4b5e-b1f4-0c60d8dcbf13',
            timeCreated: '2023-10-20T10:54:50.248Z',
          };
        },
      };
      this.resourceSkus = {
        list: function* () {
          yield {
            resourceType: 'virtualMachines',
            name: 'Standard_B1s',
            locations: ['uksouth'],
            locationInfo: [{location: 'uksouth', zones: [], zoneDetails: []}],
            capabilities: [{name: 'MemoryGB', value: 1}],
            restrictions: [],
          };
        },
      };
    }
  },
}));

jest.setTimeout(30000);

describe('lib/azure-importer: ', () => {
  describe('init AzureImporterModel: ', () => {
    it('initalizes object with properties.', async () => {
      const azureModel = await new AzureImporterModel();
      expect(azureModel).toHaveProperty('authenticate');
      expect(azureModel).toHaveProperty('configure');
      expect(azureModel).toHaveProperty('execute');
    });
  });

  describe('authenticate(): ', () => {
    it('authenticate is undefined', async () => {
      const azureModel = await new AzureImporterModel().configure('name', {});
      expect(azureModel).toBeInstanceOf(AzureImporterModel);
      await expect(azureModel.authenticate({})).toBe(undefined);
    });
  });

  describe('configure(): ', () => {
    it('configure returns name and empty config', async () => {
      const azureModel = new AzureImporterModel();
      await expect(azureModel.configure('azure', {})).resolves.toBeInstanceOf(
        AzureImporterModel
      );
      expect(azureModel.name).toBe('azure');
      expect(azureModel.staticParams).toStrictEqual({});
    });
  });

  describe('modelIdentifier(): ', () => {
    it('modelIdendifier() returns expected name', async () => {
      const azureModel = new AzureImporterModel();
      expect(azureModel.modelIdentifier()).toBe('azure');
    });
  });

  describe('execute(): ', () => {
    it('throws error for missing input field.', async () => {
      const azureModel = new AzureImporterModel();
      expect.assertions(2);
      expect(await azureModel.configure('azure', {})).toBeInstanceOf(
        AzureImporterModel
      );
      try {
        await azureModel.execute([
          {
            timestamp: '2023-11-02T10:35:31.820Z',
            duration: 3600,
            'azure-observation-aggregation': 'average',
            'azure-subscription-id': '9de7e19f-8a18-4e73-9451-45fc74e7d0d3',
            'azure-resource-group': 'vm1_group',
            'azure-vm-name': 'vm1',
          },
        ]);
      } catch (error) {
        if (error instanceof Error) {
          expect(error).toBeInstanceOf(Error);
        }
      }
    });

    it('throws error if time is provided in seconds.', async () => {
      const azureModel = new AzureImporterModel();

      expect.assertions(2);

      try {
        await azureModel.execute([
          {
            timestamp: '2023-11-02T10:35:31.820Z',
            duration: 3600,
            'azure-observation-window': '5 sec',
            'azure-observation-aggregation': 'average',
            'azure-subscription-id': '9de7e19f-8a18-4e73-9451-45fc74e7d0d3',
            'azure-resource-group': 'vm1_group',
            'azure-vm-name': 'vm1',
          },
        ]);
      } catch (error) {
        if (error instanceof Error) {
          expect(error).toBeInstanceOf(Error);
          expect(error.message).toEqual(
            'The minimum unit of time for azure importer is minutes'
          );
        }
      }
    });

    it('execute() throws error for time unit of seconds ', async () => {
      const azureModel = new AzureImporterModel();
      await expect(
        azureModel.execute([
          {
            timestamp: '2023-11-02T10:35:31.820Z',
            duration: 3600,
            'azure-observation-window': '5 sec',
            'azure-observation-aggregation': 'average',
            'azure-subscription-id': '9de7e19f-8a18-4e73-9451-45fc74e7d0d3',
            'azure-resource-group': 'vm1_group',
            'azure-vm-name': 'vm1',
          },
        ])
      ).rejects.toStrictEqual(
        Error('The minimum unit of time for azure importer is minutes')
      );
    });
  });

  it('returns valid data.', async () => {
    const azureModel = new AzureImporterModel();

    await expect(
      azureModel.execute([
        {
          timestamp: '2023-11-02T10:35:00.000Z',
          duration: 3600,
          'azure-observation-window': '5 mins',
          'azure-observation-aggregation': 'average',
          'azure-subscription-id': '9de7e19f-8a18-4e73-9451-45fc74e7d0d3',
          'azure-resource-group': 'vm1_group',
          'azure-vm-name': 'vm1',
        },
      ])
    ).resolves.toEqual([
      {
        timestamp: '2023-11-02T10:35:00.000Z',
        duration: 3600,
        'cpu-util': '3.14',
        'mem-availableGB': 0.5,
        'mem-usedGB': 0.5,
        'total-memoryGB': 1,
        'mem-util': 50,
        location: 'uksouth',
        'cloud-instance-type': 'Standard_B1s',
      },
    ]);
  });
});
