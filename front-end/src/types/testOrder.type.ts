export interface TestOrder {
  _id: string;
  patientName: string;
  dateOfBirth: string;
  gender: string;
  address: string;
  phoneNumber: string;
  email: string;
  status: string;
  createdDate: string;
  createdBy: string;
  runDate: string;
  runBy: string;
  testResults: TestResults[];

  comments: Comments[];
  createdAt: string;
  updatedAt: string;
  createdByUser?: {
    fullName: string;
    email: string;
  };
  runByUser?: {
    fullName: string;
    email: string;
  };
}
export interface TestResults {
  _id: string;
  testName: string;
  result: string;
  unit: string;
  normalRange: string;
  status: string;
  flag: string;
  hl7MessageId: string;
  rawHl7Data: string;
  processedData: {
    originalFlag: string;
    processingTimestamp: string;
    configApplied: string;
  };
  createdAt: string;
  updatedAt: string;
  reviewedBy: string;
  aiReviewedAt: string;
}
export interface Comments {
  _id: string;
  content: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  modifiedBy: string;
  isDeleted: boolean;
} 
