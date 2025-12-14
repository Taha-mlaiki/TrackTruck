// Mock implementations for repositories
export const createMockRepository = <T>() => ({
  create: jest.fn(),
  findById: jest.fn(),
  find: jest.fn(),
  list: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
});

export const createMockUserRepository = () => ({
  ...createMockRepository(),
  findByEmail: jest.fn(),
  list: jest.fn(),
});

export const createMockTruckRepository = () => ({
  ...createMockRepository(),
  findByPlate: jest.fn(),
});

export const createMockTripRepository = () => ({
  ...createMockRepository(),
});

export const createMockFuelRepository = () => ({
  ...createMockRepository(),
  findByTruck: jest.fn(),
  findByDateRange: jest.fn(),
  getTotalConsumptionByTruck: jest.fn(),
  getTotalCostByTruck: jest.fn(),
  getConsumptionStats: jest.fn(),
});

// Mock PdfService
export const createMockPdfService = () => ({
  generateTripPdfBuffer: jest.fn().mockResolvedValue(Buffer.from('mock-pdf')),
});

// Sample test data
export const sampleUser = {
  _id: '507f1f77bcf86cd799439011',
  id: '507f1f77bcf86cd799439011',
  name: 'Test User',
  email: 'test@example.com',
  role: 'Driver',
  password: 'hashedpassword',
};

export const sampleAdmin = {
  _id: '507f1f77bcf86cd799439012',
  id: '507f1f77bcf86cd799439012',
  name: 'Admin User',
  email: 'admin@example.com',
  role: 'Admin',
  password: 'hashedpassword',
};

export const sampleTruck = {
  _id: '507f1f77bcf86cd799439013',
  id: '507f1f77bcf86cd799439013',
  plateNumber: 'ABC-123',
  modelName: 'Volvo FH',
  odometerKm: 50000,
  isActive: true,
  assignedTo: null,
};

export const sampleTrip = {
  _id: '507f1f77bcf86cd799439014',
  id: '507f1f77bcf86cd799439014',
  reference: 'TRP-001',
  origin: 'Casablanca',
  destination: 'Rabat',
  plannedStart: new Date(),
  truck: sampleTruck._id,
  driver: sampleUser._id,
  status: 'pending',
  startOdometer: 50000,
};

export const sampleFuel = {
  _id: '507f1f77bcf86cd799439015',
  id: '507f1f77bcf86cd799439015',
  truck: sampleTruck._id,
  liters: 100,
  costPerLiter: 12.5,
  totalCost: 1250,
  odometerAtFill: 50500,
  fuelType: 'diesel',
  filledBy: sampleUser._id,
  date: new Date(),
};
