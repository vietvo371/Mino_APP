# Hướng dẫn Fix cuối cùng trong Xcode

## 🚨 **Vấn đề hiện tại:**
- Lỗi `-Werror=return-type` và các warnings khác
- Build failed với error code 65
- Cần fix thủ công trong Xcode

## 🔧 **Cách fix trong Xcode:**

### **Bước 1: Mở Xcode**
```bash
open ios/Mino.xcworkspace
```

### **Bước 2: Fix Build Settings cho tất cả targets**
1. Chọn project "Mino" (bên trái)
2. Chọn target "Mino"
3. Chọn tab "Build Settings"
4. Tìm "Other Warning Flags"
5. **Xóa tất cả flags** `-Werror=*` (đặc biệt là `-Werror=return-type`)

### **Bước 3: Fix Pods Build Settings**
1. Chọn project "Pods" (bên trái)
2. Chọn target "Mino" trong Pods
3. Chọn tab "Build Settings"
4. Tìm "Other Warning Flags"
5. **Xóa tất cả flags** `-Werror=*`

### **Bước 4: Fix cho tất cả targets trong Pods**
Lặp lại bước 2-3 cho tất cả targets trong Pods:
- React-Core
- React-hermes
- React-runtimescheduler
- React-jsitooling
- React-jsiexecutor
- React-jserrorhandler
- React-graphics
- React-rendererdebug
- React-renderercss
- React-rendererconsistency
- React-performancetimeline
- React-oscompat
- React-logger
- React-jsinspectortracing
- React-jsinspector
- React-jsinspectornetwork
- React-featureflags
- React-debug
- React-cxxreact

### **Bước 5: Alternative - Disable New Architecture**
1. Chọn project "Mino"
2. Chọn target "Mino"
3. Chọn tab "Build Settings"
4. Tìm "RCT_NEW_ARCH_ENABLED"
5. Đặt thành "0"

### **Bước 6: Clean và Build**
1. **⌘+Shift+K** (Clean)
2. **⌘+Shift+Option+K** (Clean Build Folder)
3. **⌘+B** (Build)

## 🎯 **Kết quả mong đợi:**
- ✅ App build thành công
- ✅ eKYC SDK hoạt động
- ✅ Có thể test eKYC functionality

## 📱 **Test eKYC sau khi build thành công:**
1. Mở `EkycExampleScreen`
2. Thay thế tokens thật:
   ```typescript
   const options: EkycOptions = {
     tokenId: 'your_token_id_here',
     tokenKey: 'your_token_key_here', 
     authorization: 'your_authorization_here',
     flowType: 'full',
     language: 'vi'
   };
   ```
3. Test trên thiết bị thật
4. Kiểm tra permissions camera/microphone

## 🔍 **Nếu vẫn gặp lỗi:**
1. Kiểm tra logs trong Xcode console
2. Test trên thiết bị thật
3. Đảm bảo có access token hợp lệ từ VNPT
4. Kiểm tra frameworks được embed đúng cách

## 📞 **Hỗ trợ:**
- Kiểm tra logs trong Xcode console
- Test trên thiết bị thật
- Đảm bảo có access token hợp lệ từ VNPT
