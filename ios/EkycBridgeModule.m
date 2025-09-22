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

-(void) initParamSdkForCamera:(ICEkycCameraViewController *)camera {
  camera.tokenKey = @"MFwwDQYJKoZIhvcNAQEBBQADSwAwSAJBAKDkNJECt3ow2jyClCKo3r2gJ+0zBhS0T3CPvjnWbdfhgCwO19R7bmhzLGFKuMfumnmnnxK73KnQfppt/jKsGWcCAwEAAQ==";
  camera.tokenId = @"3e87ddb5-25d2-06ce-e063-63199f0afe5b";
  camera.accessToken = @"bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0cmFuc2FjdGlvbl9pZCI6IjI5ZTljYWE0LTdiZjItNGFiMS1hNDNhLTkyNDA5NTJjNjJjMCIsInN1YiI6ImJjN2JmZDI2LThmMTYtMTFmMC1hNzY5LWY3MjI4MWE1OTJjOCIsImF1ZCI6WyJyZXN0c2VydmljZSJdLCJ1c2VyX25hbWUiOiJxdW9jbG9uZ2RuZ0BnbWFpbC5jb20iLCJzY29wZSI6WyJyZWFkIl0sImlzcyI6Imh0dHBzOi8vbG9jYWxob3N0IiwibmFtZSI6InF1b2Nsb25nZG5nQGdtYWlsLmNvbSIsImV4cCI6MTc1ODUzOTg0OSwidXVpZF9hY2NvdW50IjoiYmM3YmZkMjYtOGYxNi0xMWYwLWE3NjktZjcyMjgxYTU5MmM4IiwiYXV0aG9yaXRpZXMiOlsiVVNFUiJdLCJqdGkiOiI5YTE0NTlhZi0zNmIyLTRmODItYTViYy1kMmViZmJkN2Y2ODEiLCJjbGllbnRfaWQiOiI4X2hvdXIifQ.qVyJ6aURNnA_r1IjMPd3XYLjE_ynFuAUdnA8ZJy1iO84JXsDaGIIbMyXCbN58T_WZ7y7xa6430zk0cRCqBMToU5AjX2PHfHbxIGT5sCXA0tentGXeSL6XngMyl80MMNu2Xy1i5Up6fa8mt-iRC7JEmvdGoHXwrrF6o6NtXbWiXDMC58hlPYXd8wELhEPze2DxFDsZQ3MUOV1Y2XEHF6pZ7rbPQwhfOadtpj6lbQr3ToZQRE6Sbv4sM6VdYpA318UuxV-GqVOtIpkwZoVXjjWVSREHeBcCF1m6x3DUYmZc0VQBaleKNf2QBhuYhSEU0P3m48ydltahAgaUvE_HzvNjg";
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
