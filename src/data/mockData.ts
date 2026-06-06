import type { Drone, InsurancePlan, Policy, FlightTask, Accident, Material, Claim, Dispute, Statistics, ChartData } from '../types';

export const mockDrones: Drone[] = [
  {
    id: '1',
    model: '大疆 M300 RTK',
    serialNumber: 'SN-DJI-M300-001',
    payload: '禅思 H20T 云台相机',
    purchaseDate: '2024-03-15',
    purchaseAmount: 128000,
    status: 'insured'
  },
  {
    id: '2',
    model: '大疆 Mavic 3E',
    serialNumber: 'SN-DJI-M3E-002',
    payload: '4/3 CMOS 广角相机',
    purchaseDate: '2024-05-20',
    purchaseAmount: 36888,
    status: 'insured'
  },
  {
    id: '3',
    model: '大疆 Inspire 3',
    serialNumber: 'SN-DJI-I3-003',
    payload: '全画幅 8K 云台相机',
    purchaseDate: '2024-01-10',
    purchaseAmount: 79888,
    status: 'active'
  },
  {
    id: '4',
    model: '极飞 P100 Pro',
    serialNumber: 'SN-XAG-P100-004',
    payload: '40L 农业喷洒系统',
    purchaseDate: '2024-02-28',
    purchaseAmount: 65000,
    status: 'damaged'
  },
  {
    id: '5',
    model: '大疆 Mini 4 Pro',
    serialNumber: 'SN-DJI-M4P-005',
    payload: '1/1.3 英寸 CMOS 相机',
    purchaseDate: '2024-06-01',
    purchaseAmount: 6188,
    status: 'active'
  }
];

export const mockInsurancePlans: InsurancePlan[] = [
  {
    id: '1',
    name: '基础保障计划',
    provider: '平安保险',
    coverage: ['机身损失', '第三者责任'],
    basePremium: 1200,
    coverageAmount: 500000,
    features: ['意外损坏保障', '第三者责任50万', '7x24小时理赔']
  },
  {
    id: '2',
    name: '标准保障计划',
    provider: '太平洋保险',
    coverage: ['机身损失', '第三者责任', '飞手责任'],
    basePremium: 2800,
    coverageAmount: 1000000,
    features: ['意外损坏保障', '第三者责任100万', '飞手意外伤害', '丢失盗抢保障', '快速理赔通道']
  },
  {
    id: '3',
    name: '专业保障计划',
    provider: '人保财险',
    coverage: ['机身损失', '第三者责任', '飞手责任', '载荷设备'],
    basePremium: 5800,
    coverageAmount: 2000000,
    features: ['全机身损坏保障', '第三者责任200万', '飞手意外伤害50万', '载荷设备保障', '全国查勘网络', '法律援助服务']
  },
  {
    id: '4',
    name: '企业定制计划',
    provider: '平安保险',
    coverage: ['机身损失', '第三者责任', '飞手责任', '载荷设备', '业务中断'],
    basePremium: 12000,
    coverageAmount: 5000000,
    features: ['高端定制保障', '第三者责任500万', '业务中断损失', '专属客户经理', 'VIP理赔服务', '年度风险评估']
  }
];

export const mockPolicies: Policy[] = [
  {
    id: '1',
    policyNo: 'POL-2024-00001',
    operatorName: '飞翔航空科技有限公司',
    droneModel: '大疆 M300 RTK',
    droneId: '1',
    planName: '专业保障计划',
    coverageAmount: 2000000,
    premium: 5800,
    startDate: '2024-03-20',
    endDate: '2025-03-19',
    status: 'active'
  },
  {
    id: '2',
    policyNo: 'POL-2024-00002',
    operatorName: '飞翔航空科技有限公司',
    droneModel: '大疆 Mavic 3E',
    droneId: '2',
    planName: '标准保障计划',
    coverageAmount: 1000000,
    premium: 2800,
    startDate: '2024-05-25',
    endDate: '2025-05-24',
    status: 'active'
  },
  {
    id: '3',
    policyNo: 'POL-2023-00156',
    operatorName: '宏图测绘服务有限公司',
    droneModel: '极飞 P100 Pro',
    droneId: '4',
    planName: '基础保障计划',
    coverageAmount: 500000,
    premium: 1200,
    startDate: '2023-06-10',
    endDate: '2024-06-09',
    status: 'renewal'
  },
  {
    id: '4',
    policyNo: 'POL-2023-00089',
    operatorName: '蓝天航拍工作室',
    droneModel: '大疆 Inspire 3',
    droneId: '3',
    planName: '专业保障计划',
    coverageAmount: 2000000,
    premium: 5800,
    startDate: '2023-01-15',
    endDate: '2024-01-14',
    status: 'expired'
  },
  {
    id: '5',
    policyNo: 'POL-2024-00003',
    operatorName: '智航无人机服务公司',
    droneModel: '大疆 Mini 4 Pro',
    droneId: '5',
    planName: '基础保障计划',
    coverageAmount: 500000,
    premium: 1200,
    startDate: '2024-06-05',
    endDate: '2025-06-04',
    status: 'pending'
  },
  {
    id: '6',
    policyNo: 'POL-2024-00004',
    operatorName: '飞翔航空科技有限公司',
    droneModel: '大疆 Inspire 3',
    droneId: '3',
    planName: '企业定制计划',
    coverageAmount: 5000000,
    premium: 12000,
    startDate: '2024-04-01',
    endDate: '2025-03-31',
    status: 'active'
  }
];

export const mockFlightTasks: FlightTask[] = [
  {
    id: '1',
    taskName: '城市三维建模项目',
    policyId: '1',
    policyNo: 'POL-2024-00001',
    startTime: '2024-07-15 08:00',
    endTime: '2024-07-15 12:00',
    location: '北京市朝阳区CBD区域',
    riskLevel: 'medium',
    riskNote: '高楼密集区域，注意避障；上午风力较大，谨慎飞行',
    status: 'completed'
  },
  {
    id: '2',
    taskName: '农田巡查作业',
    policyId: '3',
    policyNo: 'POL-2023-00156',
    startTime: '2024-07-16 06:00',
    endTime: '2024-07-16 10:00',
    location: '河北省石家庄市正定县农场',
    riskLevel: 'low',
    riskNote: '开阔农田区域，障碍物较少；注意避让电力线路',
    status: 'in_progress'
  },
  {
    id: '3',
    taskName: '影视航拍宣传片',
    policyId: '2',
    policyNo: 'POL-2024-00002',
    startTime: '2024-07-18 14:00',
    endTime: '2024-07-18 18:00',
    location: '上海市外滩区域',
    riskLevel: 'high',
    riskNote: '人员密集区域，需提前报备；注意低空建筑物和鸟类',
    status: 'scheduled'
  },
  {
    id: '4',
    taskName: '电力线路巡检',
    policyId: '1',
    policyNo: 'POL-2024-00001',
    startTime: '2024-07-20 07:00',
    endTime: '2024-07-20 11:00',
    location: '山东省济南市郊区',
    riskLevel: 'medium',
    riskNote: '高压线路区域，保持安全距离；注意电磁干扰',
    status: 'scheduled'
  },
  {
    id: '5',
    taskName: '桥梁结构检测',
    policyId: '6',
    policyNo: 'POL-2024-00004',
    startTime: '2024-07-10 09:00',
    endTime: '2024-07-10 15:00',
    location: '武汉市长江大桥',
    riskLevel: 'high',
    riskNote: '复杂结构环境，近距飞行风险高；需两名飞手协同作业',
    status: 'completed'
  }
];

export const mockAccidents: Accident[] = [
  {
    id: '1',
    reportNo: 'ACC-2024-00001',
    taskId: '5',
    taskName: '桥梁结构检测',
    accidentTime: '2024-07-10 11:30',
    location: '武汉市长江大桥',
    lng: 114.2890,
    lat: 30.5548,
    description: '执行桥梁底部检测时，飞行器受侧风影响失控撞向桥梁钢结构',
    lossItems: [
      { id: '1', type: 'drone', name: '大疆 Inspire 3 机身', quantity: 1, unitPrice: 79888, damageDegree: 'severe' },
      { id: '2', type: 'payload', name: '禅思 X9 云台相机', quantity: 1, unitPrice: 35000, damageDegree: 'total' }
    ],
    thirdParties: [
      { id: '1', type: 'property', name: '桥梁钢结构漆面', description: '约2平方米漆面划伤', estimatedLoss: 5000 }
    ],
    status: 'settled',
    reporter: '张工',
    reportTime: '2024-07-10 11:45'
  },
  {
    id: '2',
    reportNo: 'ACC-2024-00002',
    taskId: '1',
    taskName: '城市三维建模项目',
    accidentTime: '2024-07-15 09:20',
    location: '北京市朝阳区CBD区域',
    lng: 116.4621,
    lat: 39.9084,
    description: 'GPS信号丢失导致飞行器漂移，刮蹭到建筑物外墙空调外机',
    lossItems: [
      { id: '1', type: 'drone', name: '大疆 M300 RTK 桨叶', quantity: 2, unitPrice: 800, damageDegree: 'minor' },
      { id: '2', type: 'drone', name: '机身外壳', quantity: 1, unitPrice: 5000, damageDegree: 'moderate' }
    ],
    thirdParties: [],
    status: 'auditing',
    reporter: '李明',
    reportTime: '2024-07-15 09:35'
  },
  {
    id: '3',
    reportNo: 'ACC-2024-00003',
    taskId: '2',
    taskName: '农田巡查作业',
    accidentTime: '2024-07-16 07:45',
    location: '河北省石家庄市正定县农场',
    lng: 114.5471,
    lat: 38.1456,
    description: '喷洒作业中撞到高压输电线，飞行器坠落到农田中',
    lossItems: [
      { id: '1', type: 'drone', name: '极飞 P100 Pro 整机', quantity: 1, unitPrice: 65000, damageDegree: 'total' },
      { id: '2', type: 'payload', name: '40L 喷洒系统', quantity: 1, unitPrice: 15000, damageDegree: 'total' }
    ],
    thirdParties: [
      { id: '1', type: 'person', name: '农田看护人员', description: '受到惊吓，轻微擦伤', estimatedLoss: 2000 }
    ],
    status: 'surveying',
    reporter: '王强',
    reportTime: '2024-07-16 08:00'
  },
  {
    id: '4',
    reportNo: 'ACC-2024-00004',
    taskId: '3',
    taskName: '影视航拍宣传片',
    accidentTime: '2024-07-18 15:30',
    location: '上海市外滩区域',
    lng: 121.4904,
    lat: 31.2397,
    description: '降落时受到人流干扰，飞行器侧翻，云台受损',
    lossItems: [
      { id: '1', type: 'payload', name: '哈苏云台相机', quantity: 1, unitPrice: 28000, damageDegree: 'moderate' }
    ],
    thirdParties: [],
    status: 'reported',
    reporter: '陈飞',
    reportTime: '2024-07-18 15:40'
  }
];

export const mockMaterials: Material[] = [
  { id: '1', accidentId: '1', type: 'photo', url: '', name: '事故现场全景照片.jpg', uploadTime: '2024-07-10 12:00', auditStatus: 'approved' },
  { id: '2', accidentId: '1', type: 'photo', url: '', name: '机身损坏细节.jpg', uploadTime: '2024-07-10 12:05', auditStatus: 'approved' },
  { id: '3', accidentId: '1', type: 'photo', url: '', name: '桥梁损伤部位.jpg', uploadTime: '2024-07-10 12:10', auditStatus: 'approved' },
  { id: '4', accidentId: '1', type: 'video', url: '', name: '飞行数据记录.mp4', uploadTime: '2024-07-10 12:15', auditStatus: 'approved' },
  { id: '5', accidentId: '1', type: 'document', url: '', name: '无人机购买发票.pdf', uploadTime: '2024-07-10 14:30', auditStatus: 'approved' },
  { id: '6', accidentId: '2', type: 'photo', url: '', name: '现场照片1.jpg', uploadTime: '2024-07-15 09:50', auditStatus: 'pending' },
  { id: '7', accidentId: '2', type: 'photo', url: '', name: '现场照片2.jpg', uploadTime: '2024-07-15 09:55', auditStatus: 'pending' },
  { id: '8', accidentId: '2', type: 'flight_data', url: '', name: '飞行日志.dat', uploadTime: '2024-07-15 10:00', auditStatus: 'pending' },
  { id: '9', accidentId: '3', type: 'photo', url: '', name: '坠落现场.jpg', uploadTime: '2024-07-16 08:20', auditStatus: 'approved' },
  { id: '10', accidentId: '3', type: 'photo', url: '', name: '高压线接触点.jpg', uploadTime: '2024-07-16 08:25', auditStatus: 'approved' },
  { id: '11', accidentId: '3', type: 'document', url: '', name: '维修报价单.pdf', uploadTime: '2024-07-16 10:00', auditStatus: 'pending' },
  { id: '12', accidentId: '4', type: 'photo', url: '', name: '云台损坏照片.jpg', uploadTime: '2024-07-18 15:50', auditStatus: 'pending' }
];

export const mockClaims: Claim[] = [
  {
    id: '1',
    claimNo: 'CLA-2024-00001',
    accidentId: '1',
    reportNo: 'ACC-2024-00001',
    estimatedAmount: 129888,
    actualAmount: 115000,
    surveyor: '刘查勘',
    surveyTime: '2024-07-11 10:00',
    auditNodes: [
      { id: '1', name: '报案登记', role: '系统', status: 'completed', time: '2024-07-10 11:45', comment: '报案信息已登记' },
      { id: '2', name: '材料审核', role: '理赔专员', status: 'completed', time: '2024-07-10 16:30', comment: '材料齐全，符合要求' },
      { id: '3', name: '现场查勘', role: '查勘员', status: 'completed', time: '2024-07-11 15:00', comment: '已完成现场查勘，损失属实' },
      { id: '4', name: '赔付测算', role: '理赔专员', status: 'completed', time: '2024-07-12 10:00', comment: '核定赔付金额115,000元' },
      { id: '5', name: '一级审批', role: '理赔主管', status: 'completed', time: '2024-07-12 14:00', comment: '同意赔付' },
      { id: '6', name: '二级审批', role: '理赔经理', status: 'completed', time: '2024-07-13 09:00', comment: '同意赔付' },
      { id: '7', name: '财务支付', role: '财务', status: 'completed', time: '2024-07-15 10:00', comment: '赔款已支付' },
      { id: '8', name: '结案归档', role: '系统', status: 'completed', time: '2024-07-15 16:00', comment: '案件已结案' }
    ],
    status: 'closed',
    createTime: '2024-07-10 11:45'
  },
  {
    id: '2',
    claimNo: 'CLA-2024-00002',
    accidentId: '2',
    reportNo: 'ACC-2024-00002',
    estimatedAmount: 6600,
    actualAmount: 0,
    surveyor: '王查勘',
    surveyTime: '2024-07-16 09:00',
    auditNodes: [
      { id: '1', name: '报案登记', role: '系统', status: 'completed', time: '2024-07-15 09:35', comment: '报案信息已登记' },
      { id: '2', name: '材料审核', role: '理赔专员', status: 'completed', time: '2024-07-15 14:00', comment: '材料审核中' },
      { id: '3', name: '现场查勘', role: '查勘员', status: 'completed', time: '2024-07-16 12:00', comment: '已完成查勘' },
      { id: '4', name: '赔付测算', role: '理赔专员', status: 'current', time: '', comment: '' },
      { id: '5', name: '一级审批', role: '理赔主管', status: 'pending', time: '', comment: '' },
      { id: '6', name: '二级审批', role: '理赔经理', status: 'pending', time: '', comment: '' },
      { id: '7', name: '财务支付', role: '财务', status: 'pending', time: '', comment: '' },
      { id: '8', name: '结案归档', role: '系统', status: 'pending', time: '', comment: '' }
    ],
    status: 'auditing',
    createTime: '2024-07-15 09:35'
  },
  {
    id: '3',
    claimNo: 'CLA-2024-00003',
    accidentId: '3',
    reportNo: 'ACC-2024-00003',
    estimatedAmount: 82000,
    actualAmount: 0,
    surveyor: '李查勘',
    surveyTime: '',
    auditNodes: [
      { id: '1', name: '报案登记', role: '系统', status: 'completed', time: '2024-07-16 08:00', comment: '报案信息已登记' },
      { id: '2', name: '材料审核', role: '理赔专员', status: 'current', time: '', comment: '' },
      { id: '3', name: '现场查勘', role: '查勘员', status: 'pending', time: '', comment: '' },
      { id: '4', name: '赔付测算', role: '理赔专员', status: 'pending', time: '', comment: '' },
      { id: '5', name: '一级审批', role: '理赔主管', status: 'pending', time: '', comment: '' },
      { id: '6', name: '二级审批', role: '理赔经理', status: 'pending', time: '', comment: '' },
      { id: '7', name: '财务支付', role: '财务', status: 'pending', time: '', comment: '' },
      { id: '8', name: '结案归档', role: '系统', status: 'pending', time: '', comment: '' }
    ],
    status: 'surveying',
    createTime: '2024-07-16 08:00'
  },
  {
    id: '4',
    claimNo: 'CLA-2024-00004',
    accidentId: '4',
    reportNo: 'ACC-2024-00004',
    estimatedAmount: 28000,
    actualAmount: 0,
    surveyor: '',
    surveyTime: '',
    auditNodes: [
      { id: '1', name: '报案登记', role: '系统', status: 'completed', time: '2024-07-18 15:40', comment: '报案信息已登记' },
      { id: '2', name: '材料审核', role: '理赔专员', status: 'pending', time: '', comment: '' },
      { id: '3', name: '现场查勘', role: '查勘员', status: 'pending', time: '', comment: '' },
      { id: '4', name: '赔付测算', role: '理赔专员', status: 'pending', time: '', comment: '' },
      { id: '5', name: '一级审批', role: '理赔主管', status: 'pending', time: '', comment: '' },
      { id: '6', name: '二级审批', role: '理赔经理', status: 'pending', time: '', comment: '' },
      { id: '7', name: '财务支付', role: '财务', status: 'pending', time: '', comment: '' },
      { id: '8', name: '结案归档', role: '系统', status: 'pending', time: '', comment: '' }
    ],
    status: 'pending',
    createTime: '2024-07-18 15:40'
  }
];

export const mockDisputes: Dispute[] = [
  {
    id: '1',
    claimId: '2',
    claimNo: 'CLA-2024-00002',
    title: '赔付金额异议',
    description: '被保险人认为定损金额偏低，要求重新核定维修费用',
    status: 'processing',
    createTime: '2024-07-17 09:00',
    handler: '理赔主管张经理'
  },
  {
    id: '2',
    claimId: '3',
    claimNo: 'CLA-2024-00003',
    title: '第三方责任认定争议',
    description: '第三方看护人员提出额外的精神损害赔偿要求',
    status: 'open',
    createTime: '2024-07-17 14:30',
    handler: '待分配'
  }
];

export const mockStatistics: Statistics = {
  totalPolicies: 156,
  activePolicies: 128,
  totalPremium: 456800,
  totalAccidents: 23,
  settledClaims: 18,
  totalClaimAmount: 589600,
  pendingClaims: 5,
  disputeCount: 2
};

export const mockChartData: ChartData[] = [
  { month: '1月', policies: 12, premium: 36000, accidents: 2, claims: 1 },
  { month: '2月', policies: 15, premium: 42000, accidents: 1, claims: 1 },
  { month: '3月', policies: 18, premium: 52000, accidents: 3, claims: 2 },
  { month: '4月', policies: 14, premium: 45000, accidents: 2, claims: 2 },
  { month: '5月', policies: 22, premium: 68000, accidents: 4, claims: 3 },
  { month: '6月', policies: 25, premium: 72000, accidents: 3, claims: 3 },
  { month: '7月', policies: 28, premium: 85000, accidents: 4, claims: 3 },
  { month: '8月', policies: 22, premium: 56800, accidents: 4, claims: 3 }
];

export const statusLabels: Record<string, string> = {
  active: '有效',
  expired: '已过期',
  pending: '待审核',
  renewal: '待续保',
  reported: '已报案',
  surveying: '查勘中',
  auditing: '审核中',
  settled: '已赔付',
  closed: '已结案',
  scheduled: '待执行',
  in_progress: '进行中',
  completed: '已完成',
  cancelled: '已取消',
  low: '低风险',
  medium: '中风险',
  high: '高风险',
  approved: '已通过',
  rejected: '已驳回'
};
