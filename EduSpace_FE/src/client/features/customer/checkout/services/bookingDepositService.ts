export const bookingDepositService = {
  /**
   * Mock: Tạo yêu cầu thanh toán đặt cọc (Deposit Intent)
   */
  createIntent: async (data: { grandTotal: number; customerName: string; customerEmail: string; spaceRef: string }) => {
    console.log('Mock: Creating payment intent', data);
    // Giả lập ID tiền cọc
    return { depositId: 'MOCK-DEP-' + Date.now() };
  },

  /**
   * Mock: Tạo link thanh toán PayOS
   */
  createPayos: async (depositId: string, returnUrl: string) => {
    console.log('Mock: Creating PayOS link', { depositId, returnUrl });
    // Trong thực tế sẽ gọi BE để lấy link từ PayOS. Ở đây ta trả về returnUrl để quay lại trang kết quả.
    return { 
      checkoutUrl: returnUrl,
      paymentLinkId: 'MOCK-LINK-' + depositId 
    };
  }
};
