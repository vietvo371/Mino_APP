import { ekycApi } from '../ekycApi';

describe('eKYC Flow Tests', () => {
  // Test data
  const testUser = {
    phone: '+84123456789',
    email: 'test@example.com',
    otp: '123456',
    fullName: 'Test User',
    idNumber: '123456789012',
    dateOfBirth: '1990-01-01',
    address: '123 Test Street',
    nationality: 'Vietnam',
  };

  // Mock files
  const mockIdCardFront = {
    uri: 'file://mock/id_card_front.jpg',
    type: 'image/jpeg',
    name: 'id_card_front.jpg',
  };

  const mockIdCardBack = {
    uri: 'file://mock/id_card_back.jpg',
    type: 'image/jpeg',
    name: 'id_card_back.jpg',
  };

  const mockSelfie = {
    uri: 'file://mock/selfie.jpg',
    type: 'image/jpeg',
    name: 'selfie.jpg',
  };

  describe('Authentication Flow', () => {
    it('should request OTP with phone number', async () => {
      const response = await ekycApi.requestOtp(testUser.phone, 'phone');
      expect(response).toBeDefined();
      // Add more specific assertions based on your API response
    });

    it('should request OTP with email', async () => {
      const response = await ekycApi.requestOtp(testUser.email, 'email');
      expect(response).toBeDefined();
      // Add more specific assertions
    });

    it('should verify OTP with phone number', async () => {
      const response = await ekycApi.verifyOtp(testUser.phone, 'phone', testUser.otp);
      expect(response).toBeDefined();
      // Add more specific assertions
    });

    it('should verify OTP with email', async () => {
      const response = await ekycApi.verifyOtp(testUser.email, 'email', testUser.otp);
      expect(response).toBeDefined();
      // Add more specific assertions
    });
  });

  describe('eKYC Flow', () => {
    it('should upload ID card front image', async () => {
      const response = await ekycApi.uploadIdCard('front', mockIdCardFront);
      expect(response).toBeDefined();
      // Add more specific assertions
    });

    it('should upload ID card back image', async () => {
      const response = await ekycApi.uploadIdCard('back', mockIdCardBack);
      expect(response).toBeDefined();
      // Add more specific assertions
    });

    it('should upload selfie image', async () => {
      const response = await ekycApi.uploadSelfie(mockSelfie);
      expect(response).toBeDefined();
      // Add more specific assertions
    });

    it('should submit personal information', async () => {
      const response = await ekycApi.submitInformation({
        fullName: testUser.fullName,
        idNumber: testUser.idNumber,
        dateOfBirth: testUser.dateOfBirth,
        address: testUser.address,
        nationality: testUser.nationality,
      });
      expect(response).toBeDefined();
      // Add more specific assertions
    });

    it('should get eKYC status', async () => {
      const response = await ekycApi.getStatus();
      expect(response).toBeDefined();
      expect(response.status).toBeDefined();
      // Add more specific assertions
    });
  });

  describe('Complete Flow', () => {
    it('should complete full eKYC flow', async () => {
      // 1. Request OTP
      await ekycApi.requestOtp(testUser.phone, 'phone');

      // 2. Verify OTP
      await ekycApi.verifyOtp(testUser.phone, 'phone', testUser.otp);

      // 3. Upload ID card images
      await ekycApi.uploadIdCard('front', mockIdCardFront);
      await ekycApi.uploadIdCard('back', mockIdCardBack);

      // 4. Upload selfie
      await ekycApi.uploadSelfie(mockSelfie);

      // 5. Submit information
      await ekycApi.submitInformation({
        fullName: testUser.fullName,
        idNumber: testUser.idNumber,
        dateOfBirth: testUser.dateOfBirth,
        address: testUser.address,
        nationality: testUser.nationality,
      });

      // 6. Check final status
      const status = await ekycApi.getStatus();
      expect(status.status).toBe('verified');
    });
  });
});
