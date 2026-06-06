export interface Drone {
  id: string;
  model: string;
  serialNumber: string;
  payload: string;
  purchaseDate: string;
  purchaseAmount: number;
  status: 'active' | 'insured' | 'damaged';
}

export interface InsurancePlan {
  id: string;
  name: string;
  provider: string;
  coverage: string[];
  basePremium: number;
  coverageAmount: number;
  features: string[];
}

export interface Policy {
  id: string;
  policyNo: string;
  operatorName: string;
  droneModel: string;
  droneId: string;
  planName: string;
  coverageAmount: number;
  premium: number;
  startDate: string;
  endDate: string;
  status: 'active' | 'expired' | 'pending' | 'renewal';
}

export interface FlightTask {
  id: string;
  taskName: string;
  policyId: string;
  policyNo: string;
  startTime: string;
  endTime: string;
  location: string;
  riskLevel: 'low' | 'medium' | 'high';
  riskNote: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
}

export interface LossItem {
  id: string;
  type: 'drone' | 'payload' | 'other';
  name: string;
  quantity: number;
  unitPrice: number;
  damageDegree: 'minor' | 'moderate' | 'severe' | 'total';
}

export interface ThirdParty {
  id: string;
  type: 'person' | 'property';
  name: string;
  description: string;
  estimatedLoss: number;
}

export interface Accident {
  id: string;
  reportNo: string;
  taskId: string;
  taskName: string;
  accidentTime: string;
  location: string;
  lng: number;
  lat: number;
  description: string;
  lossItems: LossItem[];
  thirdParties: ThirdParty[];
  status: 'reported' | 'surveying' | 'auditing' | 'settled' | 'closed';
  reporter: string;
  reportTime: string;
}

export interface Material {
  id: string;
  accidentId: string;
  type: 'photo' | 'video' | 'document' | 'flight_data';
  name: string;
  url: string;
  uploadTime: string;
  uploader: string;
  auditStatus: 'pending' | 'approved' | 'rejected';
  auditRemark?: string;
}

export interface Survey {
  id: string;
  claimId: string;
  surveyor: string;
  surveyTime: string;
  location: string;
  report: string;
  photos: string[];
  status: 'scheduled' | 'in_progress' | 'completed';
}

export interface AuditNode {
  id: string;
  name: string;
  role: string;
  status: 'pending' | 'current' | 'completed';
  time?: string;
  comment?: string;
}

export interface Claim {
  id: string;
  claimNo: string;
  accidentId: string;
  reportNo: string;
  policyNo?: string;
  estimatedAmount: number;
  actualAmount: number;
  surveyor: string;
  surveyTime: string;
  auditNodes: AuditNode[];
  status: 'pending' | 'surveying' | 'auditing' | 'approved' | 'paid' | 'closed' | 'disputed';
  createTime: string;
  closeTime?: string;
}

export interface Dispute {
  id: string;
  claimId: string;
  claimNo: string;
  title: string;
  description: string;
  status: 'open' | 'processing' | 'resolved';
  createTime: string;
  handler: string;
  conclusion?: string;
  updateTime?: string;
}

export interface ClosingArchive {
  id: string;
  claimId: string;
  claimNo: string;
  version: number;
  archiveTime: string;
  actualAmount: number;
  content: string;
}

export interface Statistics {
  totalPolicies: number;
  activePolicies: number;
  totalPremium: number;
  totalAccidents: number;
  settledClaims: number;
  totalClaimAmount: number;
  pendingClaims: number;
  disputeCount: number;
}

export interface ChartData {
  month: string;
  policies: number;
  premium: number;
  accidents: number;
  claims: number;
}
