import { ClinicalNodeCategory, MetastasisCategory, PathologicNodeCategory, StagingBasis, TumorCategory } from './staging';

export const tnmDefinitions: {
  tumor: Record<TumorCategory, string>;
  nodes: {
    clinical: Record<ClinicalNodeCategory, string>;
    pathologic: Record<PathologicNodeCategory, string>;
  };
  metastasis: Record<MetastasisCategory, string>;
} = {
  tumor: {
    Tis: 'Carcinoma in situ; noninvasive disease such as DCIS.',
    T0: 'No evidence of a primary breast tumor.',
    T1a: 'Tumor is larger than 1 mm but not larger than 5 mm.',
    T1b: 'Tumor is larger than 5 mm but not larger than 10 mm.',
    T1c: 'Tumor is larger than 10 mm but not larger than 20 mm.',
    T2: 'Tumor is larger than 2 cm but not larger than 5 cm.',
    T3: 'Tumor is larger than 5 cm.',
    T4a: 'Tumor extends to the chest wall, not including only pectoralis muscle adherence or invasion.',
    T4b: 'Tumor has skin ulceration, ipsilateral satellite skin nodules, or edema including peau d orange.',
    T4c: 'Both T4a chest wall extension and T4b skin involvement are present.',
    T4d: 'Inflammatory carcinoma.',
  },
  nodes: {
    clinical: {
      N0: 'No regional lymph node metastasis is detected clinically.',
      N1mi: 'Micrometastases are present; this applies clinically only in limited situations with a resected node before primary-tumor resection.',
      N1: 'Movable ipsilateral level I-II axillary nodes are clinically involved.',
      N2a: 'Ipsilateral level I-II axillary nodes are clinically fixed or matted.',
      N2b: 'Clinically apparent ipsilateral internal mammary nodes with no clinically evident axillary involvement.',
      N3a: 'Clinically apparent ipsilateral infraclavicular level III axillary nodes are involved.',
      N3b: 'Clinically apparent ipsilateral internal mammary nodes with clinically evident level I-II axillary involvement.',
      N3c: 'Clinically apparent ipsilateral supraclavicular nodes are involved.',
    },
    pathologic: {
      N0: 'No regional lymph node metastasis is identified pathologically.',
      'N0(i+)': 'Only isolated tumor cells are found; deposits are 0.2 mm or smaller or no more than 200 cells.',
      'N0(mol+)': 'Molecular findings are positive, but no regional nodal metastasis is found by histology or immunohistochemistry.',
      N1mi: 'Micrometastases are present; deposits are larger than 0.2 mm but none are larger than 2 mm.',
      N1a: 'Metastases are present in 1-3 axillary lymph nodes, with at least one deposit larger than 2 mm.',
      N1b: 'Internal mammary sentinel nodes are positive, with no axillary node metastasis.',
      N1c: 'N1a axillary involvement and N1b internal mammary sentinel-node involvement are both present.',
      N2a: 'Metastases are present in 4-9 axillary lymph nodes, with at least one deposit larger than 2 mm.',
      N2b: 'Clinically detected internal mammary nodes are positive, with no axillary node metastasis.',
      N3a: 'Metastases are present in 10 or more axillary nodes, or infraclavicular level III axillary nodes are involved.',
      N3b: 'Internal mammary nodal involvement is present with positive axillary nodes, or more than 3 axillary nodes plus internal mammary sentinel-node disease.',
      N3c: 'Ipsilateral supraclavicular lymph nodes are involved.',
    },
  },
  metastasis: {
    M0: 'No clinical or radiographic evidence of distant metastasis.',
    M1: 'Distant metastasis is present.',
  },
};

export const nodeOptionsByBasis: Record<StagingBasis, readonly (ClinicalNodeCategory | PathologicNodeCategory)[]> = {
  clinical: ['N0', 'N1mi', 'N1', 'N2a', 'N2b', 'N3a', 'N3b', 'N3c'],
  pathologic: ['N0', 'N0(i+)', 'N0(mol+)', 'N1mi', 'N1a', 'N1b', 'N1c', 'N2a', 'N2b', 'N3a', 'N3b', 'N3c'],
};

export function getNodeDefinition(basis: StagingBasis, nodes: ClinicalNodeCategory | PathologicNodeCategory): string {
  if (basis === 'clinical') {
    return tnmDefinitions.nodes.clinical[nodes as ClinicalNodeCategory];
  }

  return tnmDefinitions.nodes.pathologic[nodes as PathologicNodeCategory];
}
