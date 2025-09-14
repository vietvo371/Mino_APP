import { NativeModules, Platform } from 'react-native';
import type { EkycVerifyRequest, EkycVerifyResponse } from '../types/ekyc';

const { VNPTEkycModule } = NativeModules;

interface VNPTEkycConfig {
  tokenId: string;
  tokenKey: string;
  accessToken: string;
  baseUrl?: string;
}

interface EkycInitResult {
  status: boolean;
  message?: string;
}

interface EkycCaptureResult {
  image: string; // base64
  hashImage: string;
  status: boolean;
  message?: string;
}

interface EkycLivenessResult {
  video: string; // base64
  images: string[]; // base64[]
  status: boolean;
  message?: string;
}

class EkycService {
  private static instance: EkycService;
  private isInitialized: boolean = false;

  private constructor() {}

  public static getInstance(): EkycService {
    if (!EkycService.instance) {
      EkycService.instance = new EkycService();
    }
    return EkycService.instance;
  }

  public async initialize(config: VNPTEkycConfig): Promise<EkycInitResult> {
    try {
      if (this.isInitialized) {
        return { status: true };
      }

      const result = await VNPTEkycModule.initialize({
        ...config,
        baseUrl: config.baseUrl || 'https://api.vnpt.vn/ekyc',
      });

      this.isInitialized = result.status;
      return result;
    } catch (error: any) {
      console.error('VNPT eKYC initialization error:', error);
      return {
        status: false,
        message: error.message || 'Failed to initialize VNPT eKYC SDK',
      };
    }
  }

  public async captureIdCard(type: 'front' | 'back'): Promise<EkycCaptureResult> {
    try {
      if (!this.isInitialized) {
        throw new Error('VNPT eKYC SDK is not initialized');
      }

      // Cấu hình chụp CCCD/CMND
      const config = {
        isCheckMrzCode: true, // Kiểm tra mã MRZ (cho CCCD gắn chip)
        isCheckLiveness: true, // Kiểm tra ảnh giả mạo
        isCheckBlur: true, // Kiểm tra ảnh mờ
        isCheckBrightness: true, // Kiểm tra độ sáng
        isCheckGlare: true, // Kiểm tra độ chói
        isValidatePostcode: true, // Xác thực mã bưu chính
        isCheckDocument: true, // Kiểm tra loại giấy tờ
      };

      const result = await VNPTEkycModule.captureIdCard(type, config);
      return result;
    } catch (error: any) {
      console.error('VNPT eKYC capture ID card error:', error);
      return {
        status: false,
        message: error.message || 'Failed to capture ID card',
        image: '',
        hashImage: '',
      };
    }
  }

  public async captureFace(): Promise<EkycCaptureResult> {
    try {
      if (!this.isInitialized) {
        throw new Error('VNPT eKYC SDK is not initialized');
      }

      // Cấu hình chụp khuôn mặt
      const config = {
        isCheckLiveness: true, // Kiểm tra ảnh giả mạo
        isCheckMask: true, // Kiểm tra đeo khẩu trang
        isCheckGlasses: true, // Kiểm tra đeo kính
        isValidatePostcode: true, // Xác thực mã bưu chính
      };

      const result = await VNPTEkycModule.captureFace(config);
      return result;
    } catch (error: any) {
      console.error('VNPT eKYC capture face error:', error);
      return {
        status: false,
        message: error.message || 'Failed to capture face',
        image: '',
        hashImage: '',
      };
    }
  }

  public async performLivenessDetection(): Promise<EkycLivenessResult> {
    try {
      if (!this.isInitialized) {
        throw new Error('VNPT eKYC SDK is not initialized');
      }

      // Cấu hình kiểm tra chống giả mạo
      const config = {
        numberOfImages: 5, // Số lượng ảnh cần chụp
        challengeCode: 'SMILE,BLINK', // Các thử thách: cười, nháy mắt
        timeOut: 30, // Thời gian timeout (giây)
      };

      const result = await VNPTEkycModule.performLiveness(config);
      return result;
    } catch (error: any) {
      console.error('VNPT eKYC liveness detection error:', error);
      return {
        status: false,
        message: error.message || 'Failed to perform liveness detection',
        video: '',
        images: [],
      };
    }
  }

  public async verifyEkyc(data: EkycVerifyRequest): Promise<EkycVerifyResponse> {
    try {
      if (!this.isInitialized) {
        throw new Error('VNPT eKYC SDK is not initialized');
      }

      // Cấu hình xác thực eKYC
      const config = {
        type: data.verify_type || 'FACE',
        method: data.verify_method || 'AUTO',
        idCardImages: {
          front: data.id_card_front_image,
          back: data.id_card_back_image,
        },
        faceImage: data.selfie_image,
        additionalData: {
          id_card_type: data.id_card_type,
          id_card_number: data.id_card_number,
          callback_url: data.callback_url,
        },
      };

      const result = await VNPTEkycModule.verifyEkyc(config);
      return this.transformVerifyResponse(result);
    } catch (error: any) {
      console.error('VNPT eKYC verification error:', error);
      throw new Error(error.message || 'Failed to verify eKYC');
    }
  }

  private transformVerifyResponse(sdkResponse: any): EkycVerifyResponse {
    return {
      session_id: sdkResponse.sessionId,
      transaction_id: sdkResponse.transactionId,
      status: sdkResponse.status,
      score: sdkResponse.score,
      verify_type: sdkResponse.verifyType,
      verify_method: sdkResponse.verifyMethod,
      ocr_result: {
        matched: sdkResponse.ocrResult?.matched || false,
        confidence: sdkResponse.ocrResult?.confidence || 0,
        errors: sdkResponse.ocrResult?.errors,
      },
      face_result: {
        matched: sdkResponse.faceResult?.matched || false,
        confidence: sdkResponse.faceResult?.confidence || 0,
        errors: sdkResponse.faceResult?.errors,
      },
      liveness_result: {
        passed: sdkResponse.livenessResult?.passed || false,
        score: sdkResponse.livenessResult?.score || 0,
        errors: sdkResponse.livenessResult?.errors,
      },
      data: {
        id_card: {
          type: sdkResponse.data?.idCard?.type,
          number: sdkResponse.data?.idCard?.number,
          name: sdkResponse.data?.idCard?.name,
          dob: sdkResponse.data?.idCard?.dob,
          gender: sdkResponse.data?.idCard?.gender,
          nationality: sdkResponse.data?.idCard?.nationality,
          ethnicity: sdkResponse.data?.idCard?.ethnicity,
          religion: sdkResponse.data?.idCard?.religion,
          place_of_origin: sdkResponse.data?.idCard?.placeOfOrigin,
          place_of_residence: sdkResponse.data?.idCard?.placeOfResidence,
          personal_identification: sdkResponse.data?.idCard?.personalIdentification,
          issuing_authority: sdkResponse.data?.idCard?.issuingAuthority,
          issue_date: sdkResponse.data?.idCard?.issueDate,
          expiry_date: sdkResponse.data?.idCard?.expiryDate,
        },
        face_matching: {
          score: sdkResponse.data?.faceMatching?.score || 0,
          result: sdkResponse.data?.faceMatching?.result || false,
        },
        liveness: {
          score: sdkResponse.data?.liveness?.score || 0,
          result: sdkResponse.data?.liveness?.result || false,
          mask_detected: sdkResponse.data?.liveness?.maskDetected || false,
        },
      },
      errors: sdkResponse.errors,
    };
  }
}

export const ekycService = EkycService.getInstance();
