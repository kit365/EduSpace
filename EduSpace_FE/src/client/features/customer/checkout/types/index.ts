export interface CheckoutData {
  spaceId: number;
  spaceName: string;
  spaceImage: string;
  date: string;
  time: string;
  duration: number;
  guests: number;
  pricePerHour: number;
  totalPrice: number;
  cleaningFee?: number;
  serviceFee?: number;
  grandTotal?: number;
}

export interface PaymentInfo {
  method: 'card' | 'bank' | 'momo';
  cardNumber?: string;
  cardName?: string;
  expiryDate?: string;
  cvv?: string;
}

export interface BillingInfo {
  fullName: string;
  email: string;
  phone: string;
  company?: string;
  taxId?: string;
}
