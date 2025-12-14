// MongoDB initialization script
// This script runs when the MongoDB container is first created

// Switch to the tracktruck database
db = db.getSiblingDB('tracktruck');

// Create collections
db.createCollection('users');
db.createCollection('trucks');
db.createCollection('trailers');
db.createCollection('tires');
db.createCollection('trips');
db.createCollection('maintenances');
db.createCollection('fuels');

// Create indexes for better query performance
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ role: 1 });

db.trucks.createIndex({ plateNumber: 1 }, { unique: true });
db.trucks.createIndex({ status: 1 });

db.trailers.createIndex({ plateNumber: 1 }, { unique: true });
db.trailers.createIndex({ status: 1 });

db.tires.createIndex({ serialNumber: 1 }, { unique: true });
db.tires.createIndex({ status: 1 });

db.trips.createIndex({ truckId: 1 });
db.trips.createIndex({ driverId: 1 });
db.trips.createIndex({ status: 1 });
db.trips.createIndex({ createdAt: -1 });

db.maintenances.createIndex({ truckId: 1 });
db.maintenances.createIndex({ trailerId: 1 });
db.maintenances.createIndex({ tireId: 1 });
db.maintenances.createIndex({ nextDueDate: 1 });

db.fuels.createIndex({ truckId: 1 });
db.fuels.createIndex({ tripId: 1 });
db.fuels.createIndex({ createdAt: -1 });

print('MongoDB initialization completed successfully!');
