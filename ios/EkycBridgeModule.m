//
//  EkycBridgeModule.m
//  SampleEkycIntergrated
//
//  Created by Longcon99 on 30/05/2023.
//

#import <Foundation/Foundation.h>
#import "EkycBridgeModule.h"
#import "ICSdkEKYC/ICSdkEKYC.h"


@implementation EkycBridgeModule

// To export a module named RCTCalendarModule
RCT_EXPORT_MODULE(EkycBridge);

// Helper: apply language code ("vi" | "en"), default "vi"
static inline void RNSApplyLanguage(ICEkycCameraViewController *camera, NSString *language)
{
  if (language != nil && [language isKindOfClass:NSString.class]) {
    NSString *lang = [language lowercaseString];
    if ([lang isEqualToString:@"en"]) {
      camera.languageSdk = @"en";
      return;
    }
    if ([lang isEqualToString:@"vi"]) {
      camera.languageSdk = @"vi";
      return;
    }
  }
  camera.languageSdk = @"vi";
}

RCT_EXPORT_METHOD(startEkycFull:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject) {
  NSLog(@"Hello world");
  
  self._resolve = resolve;
  self._reject = reject;
  
  ICEkycCameraViewController *camera = (ICEkycCameraViewController *) [ICEkycCameraRouter createModule];
  camera.cameraDelegate = self;
  [self initParamSdkForCamera:camera];
  // Bật so sánh khuôn mặt với ảnh giấy tờ trong luồng full
  camera.isEnableCompare = YES;
  camera.compareType = 1; // so sánh với mặt trước giấy tờ
  
  /// Giá trị này xác định kiểu giấy tờ để sử dụng:
  /// - IDENTITY_CARD: Chứng minh thư nhân dân, Căn cước công dân
  /// - IDCardChipBased: Căn cước công dân gắn Chip
  /// - Passport: Hộ chiếu
  /// - DriverLicense: Bằng lái xe
  /// - MilitaryIdCard: Chứng minh thư quân đội
  camera.documentType = IdentityCard;
  
  /// Luồng đầy đủ
  /// Bước 1 - chụp ảnh giấy tờ
  /// Bước 2 - chụp ảnh chân dung xa gần
  camera.flowType = full;
  
  /// xác định xác thực khuôn mặt bằng oval xa gần
  camera.versionSdk = ProOval;
  
  /// Bật/Tắt chức năng So sánh ảnh trong thẻ và ảnh chân dung
  // camera.isCompareFaces = YES;
  
  /// Bật/Tắt chức năng kiểm tra che mặt
  camera.isCheckMaskedFace = YES;
  
  /// Bật/Tắt chức năng kiểm tra ảnh giấy tờ chụp trực tiếp (liveness card)
  camera.isCheckLivenessCard = YES;
  
  /// Lựa chọn chế độ kiểm tra ảnh giấy tờ ngay từ SDK
  /// - None: Không thực hiện kiểm tra ảnh khi chụp ảnh giấy tờ
  /// - Basic: Kiểm tra sau khi chụp ảnh
  /// - MediumFlip: Kiểm tra ảnh hợp lệ trước khi chụp (lật giấy tờ thành công → hiển thị nút chụp)
  /// - Advance: Kiểm tra ảnh hợp lệ trước khi chụp (hiển thị nút chụp)
  camera.validateDocumentType = Basic;
  
  /// Giá trị này xác định việc có xác thực số ID với mã tỉnh thành, quận huyện, xã phường tương ứng hay không.
  camera.isValidatePostcode = YES;
  
  /// Lựa chọn chức năng kiểm tra ảnh chân dung chụp trực tiếp (liveness face)
  /// - NoneCheckFace: Không thực hiện kiểm tra ảnh chân dung chụp trực tiếp hay không
  /// - iBETA: Kiểm tra ảnh chân dung chụp trực tiếp hay không iBeta (phiên bản hiện tại)
  /// - Standard: Kiểm tra ảnh chân dung chụp trực tiếp hay không Standard (phiên bản mới)
  camera.checkLivenessFace = IBeta;
  
  /// Giá trị này dùng để đảm bảo mỗi yêu cầu (request) từ phía khách hàng sẽ không bị thay đổi.
  camera.challengeCode = @"INNOVATIONCENTER";
  
  /// Ngôn ngữ sử dụng trong SDK
  /// - vi: Tiếng Việt
  /// - en: Tiếng Anh
  camera.languageSdk = @"vi";
  
  /// Bật/Tắt Hiển thị màn hình hướng dẫn
  camera.isShowTutorial = YES;
  
  /// Bật chức năng hiển thị nút bấm "Bỏ qua hướng dẫn" tại các màn hình hướng dẫn bằng video
  camera.isEnableGotIt = YES;
  
  /// Sử dụng máy ảnh mặt trước
  /// - PositionFront: Camera trước
  /// - PositionBack: Camera sau
  camera.cameraPositionForPortrait = PositionFront;
  
  dispatch_async(dispatch_get_main_queue(), ^{
    UIViewController *root = [[[UIApplication sharedApplication] delegate] window].rootViewController;
    BOOL modalPresent = (BOOL) (root.presentedViewController);
    
    if (modalPresent) {
      UIViewController *parent = root.presentedViewController;
      [parent setModalPresentationStyle:UIModalPresentationFullScreen];
      [parent showViewController:camera sender:parent];
      
    } else {
      [camera setModalPresentationStyle:UIModalPresentationFullScreen];
      [root showDetailViewController:camera sender:root];
    }
    
  });

};

// Start Full with language ("vi" | "en")
RCT_EXPORT_METHOD(startEkycFullWithLanguage:(NSString *)language resolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject) {
  NSLog(@"startEkycFullWithLanguage");
  self._resolve = resolve;
  self._reject = reject;

  ICEkycCameraViewController *camera = (ICEkycCameraViewController *) [ICEkycCameraRouter createModule];
  camera.cameraDelegate = self;
  [self initParamSdkForCamera:camera];
  // so khớp như startEkycFull
  camera.isEnableCompare = YES;
  camera.compareType = 1;
  camera.documentType = IdentityCard;
  camera.flowType = full;
  camera.versionSdk = ProOval;
  camera.isCheckMaskedFace = YES;
  camera.isCheckLivenessCard = YES;
  camera.validateDocumentType = Basic;
  camera.isValidatePostcode = YES;
  camera.checkLivenessFace = IBeta;
  camera.challengeCode = @"INNOVATIONCENTER";
  RNSApplyLanguage(camera, language);
  camera.isShowTutorial = YES;
  camera.isEnableGotIt = YES;
  camera.cameraPositionForPortrait = PositionFront;

  dispatch_async(dispatch_get_main_queue(), ^{
    UIViewController *root = [[[UIApplication sharedApplication] delegate] window].rootViewController;
    BOOL modalPresent = (BOOL) (root.presentedViewController);
    if (modalPresent) {
      UIViewController *parent = root.presentedViewController;
      [parent setModalPresentationStyle:UIModalPresentationFullScreen];
      [parent showViewController:camera sender:parent];
    } else {
      [camera setModalPresentationStyle:UIModalPresentationFullScreen];
      [root showDetailViewController:camera sender:root];
    }
  });
}


RCT_EXPORT_METHOD(startEkycOcr:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject) {
  NSLog(@"Hello world");
  
  self._resolve = resolve;
  self._reject = reject;
  
  ICEkycCameraViewController *camera = (ICEkycCameraViewController *) [ICEkycCameraRouter createModule];
  camera.cameraDelegate = self;
  [self initParamSdkForCamera:camera];
  
  /// Giá trị này xác định kiểu giấy tờ để sử dụng:
  /// - IDENTITY_CARD: Chứng minh thư nhân dân, Căn cước công dân
  /// - IDCardChipBased: Căn cước công dân gắn Chip
  /// - Passport: Hộ chiếu
  /// - DriverLicense: Bằng lái xe
  /// - MilitaryIdCard: Chứng minh thư quân đội
  camera.documentType = IdentityCard;
  
  /// Luồng đầy đủ
  /// Bước 1 - chụp ảnh giấy tờ
  /// Bước 2 - chụp ảnh chân dung xa gần
  camera.flowType = ocr;
  
  /// Bật/Tắt chức năng kiểm tra ảnh giấy tờ chụp trực tiếp (liveness card)
  camera.isCheckLivenessCard = YES;
  
  /// Lựa chọn chế độ kiểm tra ảnh giấy tờ ngay từ SDK
  /// - None: Không thực hiện kiểm tra ảnh khi chụp ảnh giấy tờ
  /// - Basic: Kiểm tra sau khi chụp ảnh
  /// - MediumFlip: Kiểm tra ảnh hợp lệ trước khi chụp (lật giấy tờ thành công → hiển thị nút chụp)
  /// - Advance: Kiểm tra ảnh hợp lệ trước khi chụp (hiển thị nút chụp)
  camera.validateDocumentType = Basic;
  
  /// Giá trị này xác định việc có xác thực số ID với mã tỉnh thành, quận huyện, xã phường tương ứng hay không.
  camera.isValidatePostcode = YES;
  
  /// Giá trị này dùng để đảm bảo mỗi yêu cầu (request) từ phía khách hàng sẽ không bị thay đổi.
  camera.challengeCode = @"INNOVATIONCENTER";
  
  /// Ngôn ngữ sử dụng trong SDK
  /// - vi: Tiếng Việt
  /// - en: Tiếng Anh
  camera.languageSdk = @"vi";
  
  /// Bật/Tắt Hiển thị màn hình hướng dẫn
  camera.isShowTutorial = YES;
  
  /// Bật chức năng hiển thị nút bấm "Bỏ qua hướng dẫn" tại các màn hình hướng dẫn bằng video
  camera.isEnableGotIt = YES;
  
  /// Sử dụng máy ảnh mặt trước
  /// - PositionFront: Camera trước
  /// - PositionBack: Camera sau
  camera.cameraPositionForPortrait = PositionFront;
  
  dispatch_async(dispatch_get_main_queue(), ^{
    UIViewController *root = [[[UIApplication sharedApplication] delegate] window].rootViewController;
    BOOL modalPresent = (BOOL) (root.presentedViewController);
    
    if (modalPresent) {
      UIViewController *parent = root.presentedViewController;
      [parent setModalPresentationStyle:UIModalPresentationFullScreen];
      [parent showViewController:camera sender:parent];
      
    } else {
      [camera setModalPresentationStyle:UIModalPresentationFullScreen];
      [root showDetailViewController:camera sender:root];
    }
    
  });

};

// Start OCR with language
RCT_EXPORT_METHOD(startEkycOcrWithLanguage:(NSString *)language resolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject) {
  NSLog(@"startEkycOcrWithLanguage");
  self._resolve = resolve;
  self._reject = reject;

  ICEkycCameraViewController *camera = (ICEkycCameraViewController *) [ICEkycCameraRouter createModule];
  camera.cameraDelegate = self;
  [self initParamSdkForCamera:camera];
  camera.documentType = IdentityCard;
  camera.flowType = ocr;
  camera.isCheckLivenessCard = YES;
  camera.validateDocumentType = Basic;
  camera.isValidatePostcode = YES;
  camera.challengeCode = @"INNOVATIONCENTER";
  RNSApplyLanguage(camera, language);
  camera.isShowTutorial = YES;
  camera.isEnableGotIt = YES;
  camera.cameraPositionForPortrait = PositionFront;

  dispatch_async(dispatch_get_main_queue(), ^{
    UIViewController *root = [[[UIApplication sharedApplication] delegate] window].rootViewController;
    BOOL modalPresent = (BOOL) (root.presentedViewController);
    if (modalPresent) {
      UIViewController *parent = root.presentedViewController;
      [parent setModalPresentationStyle:UIModalPresentationFullScreen];
      [parent showViewController:camera sender:parent];
    } else {
      [camera setModalPresentationStyle:UIModalPresentationFullScreen];
      [root showDetailViewController:camera sender:root];
    }
  });
}


RCT_EXPORT_METHOD(startEkycFace:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject) {
  NSLog(@"Hello world");
  
  self._resolve = resolve;
  self._reject = reject;
  
  ICEkycCameraViewController *camera = (ICEkycCameraViewController *) [ICEkycCameraRouter createModule];
  camera.cameraDelegate = self;
  [self initParamSdkForCamera:camera];
  
  /// Giá trị này xác định kiểu giấy tờ để sử dụng:
  /// - IDENTITY_CARD: Chứng minh thư nhân dân, Căn cước công dân
  /// - IDCardChipBased: Căn cước công dân gắn Chip
  /// - Passport: Hộ chiếu
  /// - DriverLicense: Bằng lái xe
  /// - MilitaryIdCard: Chứng minh thư quân đội
  camera.documentType = IdentityCard;
  
  /// Luồng đầy đủ
  /// Bước 1 - chụp ảnh giấy tờ
  /// Bước 2 - chụp ảnh chân dung xa gần
  camera.flowType = face;
  
  /// xác định xác thực khuôn mặt bằng oval xa gần
  camera.versionSdk = ProOval;
  
  /// Bật/Tắt chức năng So sánh ảnh trong thẻ và ảnh chân dung
  // camera.isCompareFaces = YES;
  
  /// Bật/Tắt chức năng kiểm tra che mặt
  camera.isCheckMaskedFace = YES;
  
  /// Lựa chọn chức năng kiểm tra ảnh chân dung chụp trực tiếp (liveness face)
  /// - NoneCheckFace: Không thực hiện kiểm tra ảnh chân dung chụp trực tiếp hay không
  /// - iBETA: Kiểm tra ảnh chân dung chụp trực tiếp hay không iBeta (phiên bản hiện tại)
  /// - Standard: Kiểm tra ảnh chân dung chụp trực tiếp hay không Standard (phiên bản mới)
  camera.checkLivenessFace = IBeta;
  
  /// Giá trị này dùng để đảm bảo mỗi yêu cầu (request) từ phía khách hàng sẽ không bị thay đổi.
  camera.challengeCode = @"INNOVATIONCENTER";
  
  /// Ngôn ngữ sử dụng trong SDK
  /// - vi: Tiếng Việt
  /// - en: Tiếng Anh
  camera.languageSdk = @"vi";
  
  /// Bật/Tắt Hiển thị màn hình hướng dẫn
  camera.isShowTutorial = YES;
  
  /// Bật chức năng hiển thị nút bấm "Bỏ qua hướng dẫn" tại các màn hình hướng dẫn bằng video
  camera.isEnableGotIt = YES;
  
  /// Sử dụng máy ảnh mặt trước
  /// - PositionFront: Camera trước
  /// - PositionBack: Camera sau
  camera.cameraPositionForPortrait = PositionFront;
  
  
  dispatch_async(dispatch_get_main_queue(), ^{
    UIViewController *root = [[[UIApplication sharedApplication] delegate] window].rootViewController;
    BOOL modalPresent = (BOOL) (root.presentedViewController);
    
    if (modalPresent) {
      UIViewController *parent = root.presentedViewController;
      [parent setModalPresentationStyle:UIModalPresentationFullScreen];
      [parent showViewController:camera sender:parent];
      
    } else {
      [camera setModalPresentationStyle:UIModalPresentationFullScreen];
      [root showDetailViewController:camera sender:root];
    }
    
  });

};

// Start Face with language
RCT_EXPORT_METHOD(startEkycFaceWithLanguage:(NSString *)language resolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject) {
  NSLog(@"startEkycFaceWithLanguage");
  self._resolve = resolve;
  self._reject = reject;

  ICEkycCameraViewController *camera = (ICEkycCameraViewController *) [ICEkycCameraRouter createModule];
  camera.cameraDelegate = self;
  [self initParamSdkForCamera:camera];
  camera.documentType = IdentityCard;
  camera.flowType = face;
  camera.versionSdk = ProOval;
  camera.isCheckMaskedFace = YES;
  camera.checkLivenessFace = IBeta;
  camera.challengeCode = @"INNOVATIONCENTER";
  RNSApplyLanguage(camera, language);
  camera.isShowTutorial = YES;
  camera.isEnableGotIt = YES;
  camera.cameraPositionForPortrait = PositionFront;
  dispatch_async(dispatch_get_main_queue(), ^{
    UIViewController *root = [[[UIApplication sharedApplication] delegate] window].rootViewController;
    BOOL modalPresent = (BOOL) (root.presentedViewController);
    if (modalPresent) {
      UIViewController *parent = root.presentedViewController;
      [parent setModalPresentationStyle:UIModalPresentationFullScreen];
      [parent showViewController:camera sender:parent];
    } else {
      [camera setModalPresentationStyle:UIModalPresentationFullScreen];
      [root showDetailViewController:camera sender:root];
    }
  });
}


// Verify face against a reference hash (compare with stored face)
RCT_EXPORT_METHOD(startEkycFaceWithReference:(NSString *)referenceHash resolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject) {
  NSLog(@"startEkycFaceWithReference");
  self._resolve = resolve;
  self._reject = reject;

  ICEkycCameraViewController *camera = (ICEkycCameraViewController *) [ICEkycCameraRouter createModule];
  camera.cameraDelegate = self;
  [self initParamSdkForCamera:camera];

  camera.documentType = IdentityCard;
  camera.flowType = face;
  camera.versionSdk = ProOval;

  // Enable liveness & mask checks (safety)
  camera.isCheckMaskedFace = YES;

  // Enable compare against provided reference hash
  camera.isEnableCompare = YES;
  camera.isCompareGeneral = YES;
  camera.hashImageCompare = referenceHash ?: @"";
  camera.thresLevel = @"normal";

  camera.challengeCode = @"INNOVATIONCENTER";
  camera.languageSdk = @"vi";
  camera.isShowTutorial = YES;
  camera.isEnableGotIt = YES;
  camera.cameraPositionForPortrait = PositionFront;

  dispatch_async(dispatch_get_main_queue(), ^{
    UIViewController *root = [[[UIApplication sharedApplication] delegate] window].rootViewController;
    BOOL modalPresent = (BOOL) (root.presentedViewController);
    if (modalPresent) {
      UIViewController *parent = root.presentedViewController;
      [parent setModalPresentationStyle:UIModalPresentationFullScreen];
      [parent showViewController:camera sender:parent];
    } else {
      [camera setModalPresentationStyle:UIModalPresentationFullScreen];
      [root showDetailViewController:camera sender:root];
    }
  });
};

// VerifyFace flow (docs): nhập ID → chụp face → xác thực; log ra hash ảnh
RCT_EXPORT_METHOD(startVerifyFaceWithId:(NSString *)verifyId resolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject) {
  NSLog(@"startVerifyFaceWithId");
  self._resolve = resolve;
  self._reject = reject;

  ICEkycCameraViewController *camera = (ICEkycCameraViewController *) [ICEkycCameraRouter createModule];
  camera.cameraDelegate = self;
  [self initParamSdkForCamera:camera];

  // SDK hiện tại không có flow verifyFace riêng; dùng flow face và truyền ID qua headers
  camera.flowType = face;
  camera.versionSdk = ProOval;
  camera.documentType = IdentityCard;
  camera.isCheckMaskedFace = YES;
  camera.checkLivenessFace = IBeta;
  camera.languageSdk = @"vi";
  camera.challengeCode = @"INNOVATIONCENTER";

  // Truyền Verify ID cho BE qua headers
  NSMutableDictionary *headers = [NSMutableDictionary new];
  headers[@"X-Verify-Id"] = verifyId ?: @"";
  // giữ Authorization đã set trong initParamSdkForCamera
  if (camera.headersRequest != nil) {
    [headers addEntriesFromDictionary:camera.headersRequest];
  }
  camera.headersRequest = headers;

  dispatch_async(dispatch_get_main_queue(), ^{
    UIViewController *root = [[[UIApplication sharedApplication] delegate] window].rootViewController;
    BOOL modalPresent = (BOOL) (root.presentedViewController);
    if (modalPresent) {
      UIViewController *parent = root.presentedViewController;
      [parent setModalPresentationStyle:UIModalPresentationFullScreen];
      [parent showViewController:camera sender:parent];
    } else {
      [camera setModalPresentationStyle:UIModalPresentationFullScreen];
      [root showDetailViewController:camera sender:root];
    }
  });
};

-(void) initParamSdkForCamera:(ICEkycCameraViewController *)camera {
  camera.tokenKey = @"MFwwDQYJKoZIhvcNAQEBBQADSwAwSAJBAKDkNJECt3ow2jyClCKo3r2gJ+0zBhS0T3CPvjnWbdfhgCwO19R7bmhzLGFKuMfumnmnnxK73KnQfppt/jKsGWcCAwEAAQ==";
  camera.tokenId = @"3e87ddb5-25d2-06ce-e063-63199f0afe5b";
  camera.accessToken = @"bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0cmFuc2FjdGlvbl9pZCI6IjE2NDNiYTE5LTcwNDAtNGVmYy1hMWM1LTU1MTUzYzA5YTczNiIsInN1YiI6ImJjN2JmZDI2LThmMTYtMTFmMC1hNzY5LWY3MjI4MWE1OTJjOCIsImF1ZCI6WyJyZXN0c2VydmljZSJdLCJ1c2VyX25hbWUiOiJxdW9jbG9uZ2RuZ0BnbWFpbC5jb20iLCJzY29wZSI6WyJyZWFkIl0sImlzcyI6Imh0dHBzOi8vbG9jYWxob3N0IiwibmFtZSI6InF1b2Nsb25nZG5nQGdtYWlsLmNvbSIsInV1aWRfYWNjb3VudCI6ImJjN2JmZDI2LThmMTYtMTFmMC1hNzY5LWY3MjI4MWE1OTJjOCIsImF1dGhvcml0aWVzIjpbIlVTRVIiXSwianRpIjoiYWY4YmJhMmEtN2MyMC00YmMxLTlkODYtYjQyMWNhYmI4ODIyIiwiY2xpZW50X2lkIjoiYWRtaW5hcHAifQ.Ef0ngesK8dKyTP6x_FBZ5u1KocEsfESMXmJItVC2isEX6zW0-BLbRIxRFGpEBcFTdUrDisE165o2MD9-VS810rF1UEYmsWbpTegCda4YjmiRgN02m2G4PFJTYV6L2Yc3qP-PpdqPYz6Lcnd8P4kXo4ulD8Kv5Rqb-38lCIpWbbrHar72cCyFzrB9KSb3h0KuB1bUf__nwK7BYx2MzezwcwMyYjnNKANHn3TTX_tMmbSL8-gWnl7pkmcbA5eRz-WffJstGatQ_7cgzD5dUBE1DAwreU8lk1xtG1yV3OUQqU6090HzRRZ1iGoNEq1P8ZUCRAuY_bscWwxO7a5OM7j8bg";
  NSMutableDictionary *headers = [NSMutableDictionary new];
  headers[@"Authorization"] = camera.accessToken;
  camera.headersRequest = headers;
}


#pragma mark - Delegate
- (void)icEkycGetResult {
  NSLog(@"Finished SDK");
  
  NSString* dataInfoResult = ICEKYCSavedData.shared.ocrResult;
  NSString* dataLivenessCardFrontResult = ICEKYCSavedData.shared.livenessCardFrontResult;
  NSString* dataLivenessCardRearResult = ICEKYCSavedData.shared.livenessCardBackResult;
  NSString* dataCompareResult = ICEKYCSavedData.shared.compareFaceResult;
  NSString* dataLivenessFaceResult = ICEKYCSavedData.shared.livenessFaceResult;
  NSString* dataMaskedFaceResult = ICEKYCSavedData.shared.maskedFaceResult;
  
  NSDictionary* dict = @{
    @"LOG_OCR": dataInfoResult,
    @"LOG_LIVENESS_CARD_FRONT": dataLivenessCardFrontResult,
    @"LOG_LIVENESS_CARD_REAR": dataLivenessCardRearResult,
    @"LOG_COMPARE": dataCompareResult,
    @"LOG_LIVENESS_FACE": dataLivenessFaceResult,
    @"LOG_MASK_FACE": dataMaskedFaceResult
  };
  
  NSError* error;
  NSData* data= [NSJSONSerialization dataWithJSONObject:dict options:0 error:&error];
  
  NSString* resultJson = @"";
  if (error) {
    NSLog(@"Failure to serialize JSON object %@", error);
    
  } else {
    resultJson = [[NSString alloc] initWithData:data encoding:NSUTF8StringEncoding];
  }
  
  self._resolve(resultJson);
  // self._resolve = nil;
  
}

- (void)icEkycCameraClosedWithType:(ScreenType)type {
  NSLog(@"icEkycCameraClosedWithType SDK");

}

@end
