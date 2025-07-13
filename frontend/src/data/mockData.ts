import { School, Donation, User, ImpactStats, MicroDonationPool } from '../types';

export const mockDonations: Donation[] = [
  {
    id: 1,
    schoolId: 1,
    schoolName: "Lincoln Elementary School",
    amount: 500,
    date: "2024-01-15",
    donorName: "John Smith",
    message: "Happy to support STEM education!"
  },
  {
    id: 2,
    schoolId: 2,
    schoolName: "Riverside High School",
    amount: 1000,
    date: "2024-01-14",
    donorName: "Sarah Johnson"
  },
  {
    id: 3,
    schoolId: 1,
    schoolName: "Lincoln Elementary School",
    amount: 250,
    date: "2024-01-13",
    donorName: "Mike Davis",
    message: "Keep up the great work!"
  },
  {
    id: 4,
    schoolId: 3,
    schoolName: "Sunset Middle School",
    amount: 750,
    date: "2024-01-12",
    donorName: "Lisa Chen"
  },
  {
    id: 5,
    schoolId: 4,
    schoolName: "Maple Elementary",
    amount: 300,
    date: "2024-01-11",
    donorName: "Robert Wilson"
  }
];

export const mockUsers: (User & { password: string })[] = [
  {
    id: 1,
    name: "John Smith",
    email: "john@example.com",
    role: "donor",
    totalDonated: 1500,
    password: "password123"
  },
  {
    id: 2,
    name: "Sarah Johnson",
    email: "sarah@example.com",
    role: "donor",
    totalDonated: 2500,
    password: "password123"
  },
  {
    id: 3,
    name: "Admin User",
    email: "admin@equilearn.org",
    role: "admin",
    password: "admin123"
  }
];

export const mockImpactStats: ImpactStats = {
  totalDonations: 2847,
  schoolsSupported: 15,
  studentsImpacted: 8500,
  totalFunding: 125000
};

export const mockMicroDonationPools: MicroDonationPool[] = [
  {
    id: 1,
    name: "Back to School Supplies",
    description: "Help provide essential school supplies for students in need across multiple schools.",
    targetAmount: 10000,
    currentAmount: 6500,
    participants: 127,
    endDate: "2024-02-15"
  },
  {
    id: 2,
    name: "Technology for All",
    description: "Fund computers and tablets for schools that lack basic technology infrastructure.",
    targetAmount: 25000,
    currentAmount: 18200,
    participants: 89,
    endDate: "2024-03-01"
  },
  {
    id: 3,
    name: "Sports Equipment Drive",
    description: "Provide sports equipment and uniforms for schools to promote physical education.",
    targetAmount: 8000,
    currentAmount: 4200,
    participants: 156,
    endDate: "2024-02-28"
  }
]; 