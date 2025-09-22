//
//  EkycBridgeModule.h
//  SampleEkycIntergrated
//
//  Created by Longcon99 on 30/05/2023.
//

#ifndef EkycBridgeModule_h
#define EkycBridgeModule_h

#import <React/RCTBridgeModule.h>
#import "ICSdkEKYC/ICSdkEKYC.h"

@interface EkycBridgeModule: NSObject <RCTBridgeModule, ICEkycCameraDelegate>

@property(nonatomic, copy) RCTPromiseResolveBlock _resolve;
@property(nonatomic, copy) RCTPromiseRejectBlock _reject;

@end

#endif /* EkycBridgeModule_h */
