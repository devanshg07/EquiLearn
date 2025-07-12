import { School, Donation, User, ImpactStats, MicroDonationPool } from '../types';

export const mockSchools: School[] = [
  {
    id: 1,
    name: "Lincoln Elementary School",
    location: "Oakland, CA",
    description: "A diverse elementary school serving 450 students from low-income families. We need new computers and educational software to enhance our STEM curriculum.",
    needs: ["Computers", "Educational Software", "STEM Materials"],
    fundingGoal: 25000,
    currentFunding: 15000,
    imageUrl: "https://images.unsplash.com/photo-1523050854058-8df90110c9e1?w=400",
    category: "Elementary"
  },
  {
    id: 2,
    name: "Riverside High School",
    location: "Detroit, MI",
    description: "Urban high school with 800 students. Our science lab equipment is outdated and we need new textbooks for all subjects.",
    needs: ["Lab Equipment", "Textbooks", "Science Materials"],
    fundingGoal: 35000,
    currentFunding: 22000,
    imageUrl: "https://images.unsplash.com/photo-1562774053-701939374585?w=400",
    category: "High School"
  },
  {
    id: 3,
    name: "Sunset Middle School",
    location: "Phoenix, AZ",
    description: "Middle school serving 600 students. We need art supplies, musical instruments, and sports equipment to provide well-rounded education.",
    needs: ["Art Supplies", "Musical Instruments", "Sports Equipment"],
    fundingGoal: 18000,
    currentFunding: 8500,
    imageUrl: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=400",
    category: "Middle School"
  },
  {
    id: 4,
    name: "Maple Elementary",
    location: "Seattle, WA",
    description: "Elementary school with 320 students. We need library books, playground equipment, and classroom supplies.",
    needs: ["Library Books", "Playground Equipment", "Classroom Supplies"],
    fundingGoal: 12000,
    currentFunding: 7800,
    imageUrl: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400",
    category: "Elementary"
  },
  {
    id: 5,
    name: "Central High School",
    location: "Miami, FL",
    description: "High school with 950 students. We need technology upgrades, career counseling resources, and college prep materials.",
    needs: ["Technology Upgrades", "Career Resources", "College Prep Materials"],
    fundingGoal: 42000,
    currentFunding: 28000,
    imageUrl: "https://images.unsplash.com/photo-1523240794102-9ebd0b167f3f?w=400",
    category: "High School"
  }
];

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