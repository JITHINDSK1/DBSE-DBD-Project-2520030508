let parkings = [
  { _id: "1", name: "Inorbit Mall Parking", area: "Madhapur", city: "Hyderabad", address: "Madhapur, Hyderabad", lat: 17.4344, lng: 78.3867, totalSlots: 80, availableSlots: 42, pricePerHour: 50, openTime: "08:00", closeTime: "23:00", type: "mall", covered: true, isActive: true },
  { _id: "2", name: "GVK One Garage", area: "Banjara Hills", city: "Hyderabad", address: "Banjara Hills, Hyderabad", lat: 17.4190, lng: 78.4480, totalSlots: 40, availableSlots: 15, pricePerHour: 80, openTime: "08:00", closeTime: "23:00", type: "mall", covered: true, isActive: true },
  { _id: "3", name: "Hitech City Metro Station", area: "Hitech City", city: "Hyderabad", address: "Hitech City, Hyderabad", lat: 17.4504, lng: 78.3811, totalSlots: 150, availableSlots: 110, pricePerHour: 30, openTime: "08:00", closeTime: "23:00", type: "metro", covered: false, isActive: true },
  { _id: "4", name: "Sarath City Capital Mall", area: "Kondapur", city: "Hyderabad", address: "Kondapur, Hyderabad", lat: 17.4580, lng: 78.3670, totalSlots: 60, availableSlots: 5, pricePerHour: 60, openTime: "08:00", closeTime: "23:00", type: "mall", covered: true, isActive: true },
  { _id: "5", name: "Forum Sujana Mall", area: "Kukatpally", city: "Hyderabad", address: "Kukatpally, Hyderabad", lat: 17.4840, lng: 78.3890, totalSlots: 80, availableSlots: 28, pricePerHour: 40, openTime: "08:00", closeTime: "23:00", type: "mall", covered: true, isActive: true },
  { _id: "6", name: "Raidurg Metro Parking", area: "HITEC City", city: "Hyderabad", address: "HITEC City, Hyderabad", lat: 17.4440, lng: 78.3770, totalSlots: 100, availableSlots: 65, pricePerHour: 30, openTime: "08:00", closeTime: "23:00", type: "metro", covered: false, isActive: true },
  { _id: "7", name: "Atrium Mall Basement", area: "Gachibowli", city: "Hyderabad", address: "Gachibowli, Hyderabad", lat: 17.4400, lng: 78.3480, totalSlots: 50, availableSlots: 22, pricePerHour: 50, openTime: "08:00", closeTime: "23:00", type: "mall", covered: true, isActive: true },
  { _id: "8", name: "Manjeera Mall Parking", area: "Kukatpally", city: "Hyderabad", address: "Kukatpally, Hyderabad", lat: 17.4930, lng: 78.3990, totalSlots: 70, availableSlots: 18, pricePerHour: 40, openTime: "08:00", closeTime: "23:00", type: "mall", covered: true, isActive: true },
  { _id: "9", name: "Prasad IMAX Parking", area: "Necklace Road", city: "Hyderabad", address: "Necklace Road, Hyderabad", lat: 17.4150, lng: 78.4600, totalSlots: 60, availableSlots: 34, pricePerHour: 40, openTime: "08:00", closeTime: "23:00", type: "other", covered: false, isActive: true },
  { _id: "10", name: "Nampally Automated MLP", area: "Nampally", city: "Hyderabad", address: "Nampally, Hyderabad", lat: 17.3850, lng: 78.4670, totalSlots: 250, availableSlots: 48, pricePerHour: 35, openTime: "08:00", closeTime: "23:00", type: "mlp", covered: true, isActive: true },
  { _id: "11", name: "DLF Cyber City Parking", area: "Gachibowli", city: "Hyderabad", address: "Gachibowli, Hyderabad", lat: 17.4470, lng: 78.3490, totalSlots: 90, availableSlots: 55, pricePerHour: 40, openTime: "08:00", closeTime: "23:00", type: "other", covered: true, isActive: true },
  { _id: "12", name: "Western Aqua Basement", area: "Kondapur", city: "Hyderabad", address: "Kondapur, Hyderabad", lat: 17.4620, lng: 78.3560, totalSlots: 40, availableSlots: 19, pricePerHour: 50, openTime: "08:00", closeTime: "23:00", type: "other", covered: true, isActive: true },
  { _id: "13", name: "Krishe Sapphire Parking", area: "Madhapur", city: "Hyderabad", address: "Madhapur, Hyderabad", lat: 17.4410, lng: 78.3910, totalSlots: 45, availableSlots: 24, pricePerHour: 45, openTime: "08:00", closeTime: "23:00", type: "other", covered: true, isActive: true },
  { _id: "14", name: "Cyber Pearl Parking", area: "HITEC City", city: "Hyderabad", address: "HITEC City, Hyderabad", lat: 17.4500, lng: 78.3815, totalSlots: 60, availableSlots: 38, pricePerHour: 40, openTime: "08:00", closeTime: "23:00", type: "other", covered: true, isActive: true },
  { _id: "15", name: "Shilparamam Parking", area: "HITEC City", city: "Hyderabad", address: "HITEC City, Hyderabad", lat: 17.4530, lng: 78.3775, totalSlots: 120, availableSlots: 80, pricePerHour: 30, openTime: "08:00", closeTime: "23:00", type: "other", covered: false, isActive: true },
  { _id: "16", name: "Miyapur Metro Parking", area: "Miyapur", city: "Hyderabad", address: "Miyapur, Hyderabad", lat: 17.4960, lng: 78.3730, totalSlots: 130, availableSlots: 95, pricePerHour: 30, openTime: "08:00", closeTime: "23:00", type: "metro", covered: false, isActive: true },
  { _id: "17", name: "IKEA External Parking", area: "Gachibowli", city: "Hyderabad", address: "Gachibowli, Hyderabad", lat: 17.4250, lng: 78.3410, totalSlots: 200, availableSlots: 140, pricePerHour: 40, openTime: "08:00", closeTime: "23:00", type: "other", covered: false, isActive: true },
  { _id: "18", name: "AMB Cinemas Whitefields", area: "Kondapur", city: "Hyderabad", address: "Kondapur, Hyderabad", lat: 17.4560, lng: 78.3650, totalSlots: 40, availableSlots: 21, pricePerHour: 50, openTime: "08:00", closeTime: "23:00", type: "mall", covered: true, isActive: true },
  { _id: "19", name: "Somajiguda Smart Parking", area: "Somajiguda", city: "Hyderabad", address: "Somajiguda, Hyderabad", lat: 17.4240, lng: 78.4580, totalSlots: 50, availableSlots: 33, pricePerHour: 25, openTime: "08:00", closeTime: "23:00", type: "other", covered: false, isActive: true }
];

let bookings = [];

module.exports = {
  parkings,
  bookings
};
