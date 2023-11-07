import {MetricsListOptionalParams} from '@azure/arm-monitor';

export const mockCredentials = class MockAzureCredentials {};

export const mockMonitor = class MockMonitorClient {
  public metrics: any;
  constructor() {
    this.metrics = {
      list: (
        resourceUri: string,
        options?: MetricsListOptionalParams | undefined
      ) => {
        if (options !== undefined && options.metricnames === 'Percentage CPU') {
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
};

export const mockComputeClient = class MockComputeManagementClient {
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
};
