// services/EkycService.ts
import { NativeModules } from 'react-native';
import { LogResult } from '../types/EkycTypes';

const { EkycBridge } = NativeModules;

export class EkycService {
  static async startEkycFull(): Promise<LogResult> {
    console.log('EkycBridge', NativeModules);
    try {
      const result = await EkycBridge.startEkycFull();
      return JSON.parse(result);
    } catch (error) {
      throw new Error(`eKYC Full failed: ${error}`);
    }
  }

  static async startEkycOcr(): Promise<LogResult> {
    try {
      const result = await EkycBridge.startEkycOcr();
      return JSON.parse(result);
    } catch (error) {
      throw new Error(`eKYC OCR failed: ${error}`);
    }
  }

  static async startEkycFace(): Promise<LogResult> {
    try {
      const result = await EkycBridge.startEkycFace();
      return JSON.parse(result);
    } catch (error) {
      throw new Error(`eKYC Face failed: ${error}`);
    }
  }

  // Verify face against a reference image hash stored after eKYC
  static async verifyFace(referenceHash: string): Promise<LogResult> {
    try {
      const result = await EkycBridge.startEkycFaceWithReference(referenceHash);
      return JSON.parse(result);
    } catch (error) {
      throw new Error(`Verify Face failed: ${error}`);
    }
  }

  // VerifyFace flow: input ID then capture and verify
  static async verifyFaceById(verifyId: string): Promise<LogResult> {
    try {
      const result = await EkycBridge.startVerifyFaceWithId(verifyId);
      return JSON.parse(result);
    } catch (error) {
      throw new Error(`Verify Face by ID failed: ${error}`);
    }
  }
}