import { MaterialCommunityIcons } from '@expo/vector-icons';

export type Category = {
  id: string;
  name: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  color: string;
};

export const defaultExpenseCategories: Category[] = [
  { id: 'exp_groceries', name: 'Groceries/Sabzi', icon: 'cart', color: '#00D68F' },
  { id: 'exp_milk', name: 'Milk', icon: 'cow', color: '#7BED9F' },
  { id: 'exp_food', name: 'Food Outside', icon: 'silverware-fork-knife', color: '#FF9F43' },
  { id: 'exp_rent', name: 'Rent', icon: 'home', color: '#2E86DE' },
  { id: 'exp_electricity', name: 'Electricity', icon: 'flash', color: '#FECA57' },
  { id: 'exp_water', name: 'Water', icon: 'water', color: '#48DBFB' },
  { id: 'exp_gas', name: 'Gas/LPG', icon: 'fire', color: '#FF6B6B' },
  { id: 'exp_mobile', name: 'Mobile/Recharge', icon: 'cellphone', color: '#9B59B6' },
  { id: 'exp_internet', name: 'Internet/WiFi', icon: 'wifi', color: '#00CEC9' },
  { id: 'exp_transport', name: 'Transport/Petrol', icon: 'car', color: '#F368E0' },
  { id: 'exp_medical', name: 'Medical/Doctor', icon: 'hospital-box', color: '#EE5253' },
  { id: 'exp_education', name: 'Education/Tuition', icon: 'school', color: '#22A6B3' },
  { id: 'exp_shopping', name: 'Shopping/Kapde', icon: 'shopping', color: '#FF9FF3' },
  { id: 'exp_entertainment', name: 'Entertainment', icon: 'movie', color: '#8395A7' },
  { id: 'exp_emi', name: 'EMI/Loan', icon: 'bank', color: '#576574' },
  { id: 'exp_insurance', name: 'Insurance', icon: 'shield-check', color: '#1DD1A1' },
  { id: 'exp_donations', name: 'Donations/Daan', icon: 'heart', color: '#FF4757' },
  { id: 'exp_festival', name: 'Festival/Tyohaar', icon: 'party-popper', color: '#FFA502' },
  { id: 'exp_household', name: 'Household/Saman', icon: 'sofa', color: '#A4B0BE' },
  { id: 'exp_kids', name: 'Kids', icon: 'baby', color: '#FF6348' },
  { id: 'exp_other', name: 'Other', icon: 'dots-horizontal', color: '#CED6E0' },
];

export const defaultIncomeCategories: Category[] = [
  { id: 'inc_salary', name: 'Salary', icon: 'briefcase', color: '#00D68F' },
  { id: 'inc_kheti', name: 'Kheti', icon: 'sprout', color: '#1DD1A1' },
  { id: 'inc_school_refund', name: 'School Refund', icon: 'school', color: '#2E86DE' },
  { id: 'inc_business', name: 'Business/Freelance', icon: 'laptop', color: '#48DBFB' },
  { id: 'inc_gift', name: 'Gift/Received', icon: 'gift', color: '#FF9F43' },
  { id: 'inc_refund', name: 'Refund', icon: 'cash-refund', color: '#00CEC9' },
  { id: 'inc_cashback', name: 'Cashback', icon: 'cellphone-check', color: '#9B59B6' },
  { id: 'inc_rental', name: 'Rental Income', icon: 'home-city', color: '#F368E0' },
  { id: 'inc_other', name: 'Other', icon: 'dots-horizontal', color: '#CED6E0' },
];
