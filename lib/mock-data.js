export const mockEmployees = [
  { id: '1', firstName: 'Carlos', lastName: 'García', email: 'carlos@andetur.com', phone: '555-0101', position: 'Gerente General', hireDate: '2022-01-15', salary: 45000, status: 'active' },
  { id: '2', firstName: 'María', lastName: 'López', email: 'maria@andetur.com', phone: '555-0102', position: 'Coordinadora de Destinos', hireDate: '2022-03-20', salary: 32000, status: 'active' },
  { id: '3', firstName: 'Juan', lastName: 'Rodríguez', email: 'juan@andetur.com', phone: '555-0103', position: 'Conductor', hireDate: '2022-06-10', salary: 28000, status: 'active' },
  { id: '4', firstName: 'Ana', lastName: 'Martínez', email: 'ana@andetur.com', phone: '555-0104', position: 'Asistente Administrativo', hireDate: '2023-01-05', salary: 22000, status: 'active' },
  { id: '5', firstName: 'Pedro', lastName: 'Sánchez', email: 'pedro@andetur.com', phone: '555-0105', position: 'Conductor', hireDate: '2023-02-14', salary: 28000, status: 'active' },
]

export const mockDestinations = [
  { id: '1', name: 'Machu Picchu', description: 'Maravilla del mundo antiguo', location: 'Cusco, Perú', region: 'Andes', country: 'Perú', latitude: -13.1631, longitude: -72.5450 },
  { id: '2', name: 'Salar de Uyuni', description: 'El mayor salar del mundo', location: 'Oruro, Bolivia', region: 'Altiplano', country: 'Bolivia', latitude: -20.3442, longitude: -66.8156 },
  { id: '3', name: 'Valle de la Luna', description: 'Paisaje desértico único', location: 'San Juan, Argentina', region: 'Cuyo', country: 'Argentina', latitude: -31.7833, longitude: -65.5000 },
  { id: '4', name: 'Galapagos', description: 'Islas con fauna única', location: 'Galápagos, Ecuador', region: 'Costa', country: 'Ecuador', latitude: -0.9469, longitude: -90.3196 },
  { id: '5', name: 'Patagonia', description: 'Glaciares y montañas', location: 'Santa Cruz, Argentina', region: 'Patagonia', country: 'Argentina', latitude: -50.5, longitude: -72.0 },
]

export const mockPackages = [
  { id: '1', name: 'Tour Clásico Perú', description: 'Visita los principales destinos peruanos', destinationId: '1', price: 1500, durationDays: 7, maxCapacity: 20, availableSpots: 15, status: 'active' },
  { id: '2', name: 'Aventura Salar', description: 'Experiencia única en el Salar de Uyuni', destinationId: '2', price: 1800, durationDays: 4, maxCapacity: 15, availableSpots: 8, status: 'active' },
  { id: '3', name: 'Escapada Desértica', description: 'Explora el Valle de la Luna', destinationId: '3', price: 1200, durationDays: 3, maxCapacity: 25, availableSpots: 12, status: 'active' },
  { id: '4', name: 'Naturaleza Galapagos', description: 'Safari marino en las Islas Galápagos', destinationId: '4', price: 2500, durationDays: 8, maxCapacity: 12, availableSpots: 5, status: 'active' },
  { id: '5', name: 'Patagonia Premium', description: 'Experiencia de lujo en la Patagonia', destinationId: '5', price: 2200, durationDays: 6, maxCapacity: 10, availableSpots: 7, status: 'active' },
]

export const mockVehicles = [
  { id: '1', plate: 'ANDES-001', model: 'Mercedes Sprinter', year: 2021, capacity: 20, vehicleType: 'Bus', status: 'active', fuelConsumption: 8.5, purchaseDate: '2021-03-10', maintenanceDate: '2024-05-15' },
  { id: '2', plate: 'ANDES-002', model: 'Volvo B7R', year: 2020, capacity: 45, vehicleType: 'Autobus', status: 'active', fuelConsumption: 7.2, purchaseDate: '2020-06-20', maintenanceDate: '2024-04-10' },
  { id: '3', plate: 'ANDES-003', model: 'Toyota Hiace', year: 2022, capacity: 15, vehicleType: 'Minibus', status: 'active', fuelConsumption: 10.5, purchaseDate: '2022-01-15', maintenanceDate: '2024-06-01' },
  { id: '4', plate: 'ANDES-004', model: 'Isuzu NQR', year: 2019, capacity: 18, vehicleType: 'Camión', status: 'maintenance', fuelConsumption: 9.0, purchaseDate: '2019-08-05', maintenanceDate: '2024-06-20' },
  { id: '5', plate: 'ANDES-005', model: 'Scania K380', year: 2023, capacity: 50, vehicleType: 'Autobus Premium', status: 'active', fuelConsumption: 6.8, purchaseDate: '2023-02-28', maintenanceDate: '2024-05-25' },
]

export const mockReservations = [
  { id: '1', packageId: '1', customerEmail: 'customer1@email.com', customerName: 'Roberto García', customerPhone: '555-1001', reservationDate: '2024-05-10', departureDate: '2024-06-15', returnDate: '2024-06-22', numberOfPeople: 4, totalPrice: 6000, status: 'confirmed', paymentStatus: 'paid' },
  { id: '2', packageId: '2', customerEmail: 'customer2@email.com', customerName: 'Claudia López', customerPhone: '555-1002', reservationDate: '2024-05-12', departureDate: '2024-07-01', returnDate: '2024-07-05', numberOfPeople: 2, totalPrice: 3600, status: 'pending', paymentStatus: 'pending' },
  { id: '3', packageId: '3', customerEmail: 'customer3@email.com', customerName: 'Fernando Ruiz', customerPhone: '555-1003', reservationDate: '2024-05-15', departureDate: '2024-06-20', returnDate: '2024-06-23', numberOfPeople: 3, totalPrice: 3600, status: 'confirmed', paymentStatus: 'paid' },
  { id: '4', packageId: '4', customerEmail: 'customer4@email.com', customerName: 'Sofía Mendez', customerPhone: '555-1004', reservationDate: '2024-05-18', departureDate: '2024-08-10', returnDate: '2024-08-18', numberOfPeople: 1, totalPrice: 2500, status: 'confirmed', paymentStatus: 'paid' },
  { id: '5', packageId: '5', customerEmail: 'customer5@email.com', customerName: 'Diego Torres', customerPhone: '555-1005', reservationDate: '2024-05-20', departureDate: '2024-07-15', returnDate: '2024-07-21', numberOfPeople: 2, totalPrice: 4400, status: 'confirmed', paymentStatus: 'unpaid' },
]

export const mockFinancialData = [
  { month: 'Enero', revenue: 45000, expenses: 28000, profit: 17000 },
  { month: 'Febrero', revenue: 52000, expenses: 32000, profit: 20000 },
  { month: 'Marzo', revenue: 48000, expenses: 29000, profit: 19000 },
  { month: 'Abril', revenue: 61000, expenses: 35000, profit: 26000 },
  { month: 'Mayo', revenue: 58000, expenses: 33000, profit: 25000 },
  { month: 'Junio', revenue: 72000, expenses: 40000, profit: 32000 },
]

export const dashboardStats = {
  totalEmployees: 5,
  totalDestinations: 5,
  totalPackages: 5,
  totalVehicles: 5,
  totalRevenue: 336000,
  totalReservations: 5,
  activeReservations: 4,
  occupancyRate: 78,
}
