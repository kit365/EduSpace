// ─── Booking Detail Data Model + Mock Data ────────────────────────────────────

class PaymentLineItem {
  final String label;
  final double value;

  const PaymentLineItem({required this.label, required this.value});

  String get valueStr => '\$${value.toStringAsFixed(2)}';
}

class MockBookingDetail {
  final String bookingId;
  final String roomName;
  final String date;
  final String timeRange;
  final String status;
  final String wifiNetwork;
  final String wifiPassword;
  final List<PaymentLineItem> lineItems;
  final double totalPaid;
  final String paymentMethod;
  final String hostName;
  final String hostRole;
  final double hostRating;
  final int hostReviews;
  final String address;
  final String cancellationDeadline;

  const MockBookingDetail({
    required this.bookingId,
    required this.roomName,
    required this.date,
    required this.timeRange,
    required this.status,
    required this.wifiNetwork,
    required this.wifiPassword,
    required this.lineItems,
    required this.totalPaid,
    required this.paymentMethod,
    required this.hostName,
    required this.hostRole,
    required this.hostRating,
    required this.hostReviews,
    required this.address,
    required this.cancellationDeadline,
  });
}

// ─── Mock instances ───────────────────────────────────────────────────────────
const mockBookingDetails = [
  MockBookingDetail(
    bookingId: '#EDU-77421',
    roomName: 'Advanced Physics Lab',
    date: 'October 24, 2024',
    timeRange: '10:00 AM - 12:00 PM',
    status: 'Confirmed',
    wifiNetwork: 'EduSpace_Guest',
    wifiPassword: 'StudyHard2024',
    lineItems: [
      PaymentLineItem(label: 'Classroom Rate (\$45/hr × 2)', value: 90.00),
      PaymentLineItem(label: 'Cleaning Fee', value: 15.00),
      PaymentLineItem(label: 'Service Fee', value: 9.50),
    ],
    totalPaid: 114.50,
    paymentMethod: 'Visa ending in 4242',
    hostName: 'Dr. Sarah Jenkins',
    hostRole: 'Education Coordinator',
    hostRating: 4.9,
    hostReviews: 124,
    address:
        '123 Education Plaza, Suite 400, Knowledge District, Ho Chi Minh City',
    cancellationDeadline: 'Oct 22, 10:00 AM',
  ),
  MockBookingDetail(
    bookingId: '#EDU-81203',
    roomName: 'Creative Arts Studio',
    date: 'October 28, 2024',
    timeRange: '02:00 PM - 05:00 PM',
    status: 'Awaiting Payment',
    wifiNetwork: 'EduSpace_Studio',
    wifiPassword: 'Creative2024',
    lineItems: [
      PaymentLineItem(label: 'Classroom Rate (\$30/hr × 3)', value: 90.00),
      PaymentLineItem(label: 'Service Fee', value: 9.00),
    ],
    totalPaid: 99.00,
    paymentMethod: 'Pending payment',
    hostName: 'Mr. Nguyen Van A',
    hostRole: 'Studio Manager',
    hostRating: 4.7,
    hostReviews: 87,
    address: '56 University Ave, District 3, Ho Chi Minh City',
    cancellationDeadline: 'Oct 26, 02:00 PM',
  ),
  MockBookingDetail(
    bookingId: '#EDU-79845',
    roomName: 'Main Lecture Hall 4',
    date: 'November 02, 2024',
    timeRange: '09:00 AM - 12:00 PM',
    status: 'Confirmed',
    wifiNetwork: 'EduSpace_Hall',
    wifiPassword: 'Lecture2024',
    lineItems: [
      PaymentLineItem(label: 'Classroom Rate (\$60/hr × 3)', value: 180.00),
      PaymentLineItem(label: 'Cleaning Fee', value: 15.00),
      PaymentLineItem(label: 'Service Fee', value: 12.50),
    ],
    totalPaid: 207.50,
    paymentMethod: 'Visa ending in 8821',
    hostName: 'Ms. Tran Thi B',
    hostRole: 'Facility Coordinator',
    hostRating: 4.8,
    hostReviews: 56,
    address: '88 Innovation Blvd, Binh Thanh District, Ho Chi Minh City',
    cancellationDeadline: 'Oct 31, 09:00 AM',
  ),
];
