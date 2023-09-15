export const CONFIG = {
  MODEL_IDS: {
    BOAVIZTA_CPU: 'org.boavizta.cpu.sci',
    BOAVIZTA_CLOUD: 'org.boavizta.cloud.sci',
    AVEVA: 'aveva',
    EMEM: 'e-mem',
    ESHOPPEN: 'org.gsf.eshoppen',
    ESHOPPEN_CPU: 'org.gsf.eshoppen-cpu',
    ESHOPPEN_MEM: 'org.gsf.eshoppen-mem',
    ESHOPPEN_NET: 'org.gsf.eshoppen-net',
    SCI_ACCENTURE: 'org.gsf.sci-o',
    CCF: 'ccf.cloud.sci',
    SCI: 'org.gsf.sci',
    SCI_E: 'sci-e',
    SCI_M: 'org.gsf.sci-m',
    SCI_O: 'org.gsf.sci-o',
    SHELL_MODEL: 'shellModel',
    TEADS_AWS: 'teads.cloud.sci',
    TEADS_CURVE: 'teads.curve',
    WATT_TIME: 'org.wattime.grid',
  },
  VALIDATION: {
    IMPL_CLI: {
      impl: String,
      ompl: {
        type: String,
        optional: true,
      },
    },
  },
};
