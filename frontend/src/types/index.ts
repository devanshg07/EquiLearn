export interface School {
  id: number;
  name: string;
  location: string;
  description: string;
  needs: string[];
  fundingGoal: number;
  currentFunding: number;
  imageUrl: string;
  category: string;
}

export interface Donation {
  id: number;
  schoolId: number;
  schoolName: string;
  amount: number;
  date: string;
  donorName: string;
  message?: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'donor' | 'admin';
  totalDonated?: number;
  city?: string;
}

export interface ImpactStats {
  totalDonations: number;
  schoolsSupported: number;
  studentsImpacted: number;
  totalFunding: number;
}

export interface MicroDonationPool {
  id: number;
  name: string;
  description: string;
  targetAmount: number;
  currentAmount: number;
  participants: number;
  endDate: string;
}

export interface LoginForm {
  email: string;
  password: string;
}

export interface RegisterForm {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: 'donor' | 'admin';
} 