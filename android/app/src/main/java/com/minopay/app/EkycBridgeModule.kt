package com.minopay.app

import android.app.Activity
import android.content.Intent
import com.facebook.react.bridge.*
import com.google.gson.JsonObject
import com.vnptit.idg.sdk.activity.VnptIdentityActivity
import com.vnptit.idg.sdk.activity.VnptOcrActivity
import com.vnptit.idg.sdk.activity.VnptPortraitActivity
import com.vnptit.idg.sdk.utils.KeyIntentConstants.*
import com.vnptit.idg.sdk.utils.KeyResultConstants.*
import com.vnptit.idg.sdk.utils.SDKEnum

class EkycBridgeModule(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    companion object {
        private const val EKYC_REQUEST_CODE = 100
        private const val LOG_OCR = "LOG_OCR"
        private const val LOG_LIVENESS_CARD_FRONT = "LOG_LIVENESS_CARD_FRONT"
        private const val LOG_LIVENESS_CARD_REAR = "LOG_LIVENESS_CARD_REAR"
        private const val LOG_COMPARE = "LOG_COMPARE"
        private const val LOG_LIVENESS_FACE = "LOG_LIVENESS_FACE"
        private const val LOG_MASK_FACE = "LOG_MASK_FACE"

        // Credentials from iOS EkycBridgeModule.m (lines 471-473)
        // Renamed to avoid conflict with SDK's KeyIntentConstants
        private const val MY_TOKEN_KEY = "MFwwDQYJKoZIhvcNAQEBBQADSwAwSAJBAKDkNJECt3ow2jyClCKo3r2gJ+0zBhS0T3CPvjnWbdfhgCwO19R7bmhzLGFKuMfumnmnnxK73KnQfppt/jKsGWcCAwEAAQ=="
        private const val MY_TOKEN_ID = "3e87ddb5-25d2-06ce-e063-63199f0afe5b"
        private const val MY_ACCESS_TOKEN = "bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0cmFuc2FjdGlvbl9pZCI6IjE2NDNiYTE5LTcwNDAtNGVmYy1hMWM1LTU1MTUzYzA5YTczNiIsInN1YiI6ImJjN2JmZDI2LThmMTYtMTFmMC1hNzY5LWY3MjI4MWE1OTJjOCIsImF1ZCI6WyJyZXN0c2VydmljZSJdLCJ1c2VyX25hbWUiOiJxdW9jbG9uZ2RuZ0BnbWFpbC5jb20iLCJzY29wZSI6WyJyZWFkIl0sImlzcyI6Imh0dHBzOi8vbG9jYWxob3N0IiwibmFtZSI6InF1b2Nsb25nZG5nQGdtYWlsLmNvbSIsInV1aWRfYWNjb3VudCI6ImJjN2JmZDI2LThmMTYtMTFmMC1hNzY5LWY3MjI4MWE1OTJjOCIsImF1dGhvcml0aWVzIjpbIlVTRVIiXSwianRpIjoiYWY4YmJhMmEtN2MyMC00YmMxLTlkODYtYjQyMWNhYmI4ODIyIiwiY2xpZW50X2lkIjoiYWRtaW5hcHAifQ.Ef0ngesK8dKyTP6x_FBZ5u1KocEsfESMXmJItVC2isEX6zW0-BLbRIxRFGpEBcFTdUrDisE165o2MD9-VS810rF1UEYmsWbpTegCda4YjmiRgN02m2G4PFJTYV6L2Yc3qP-PpdqPYz6Lcnd8P4kXo4ulD8Kv5Rqb-38lCIpWbbrHar72cCyFzrB9KSb3h0KuB1bUf__nwK7BYx2MzezwcwMyYjnNKANHn3TTX_tMmbSL8-gWnl7pkmcbA5eRz-WffJstGatQ_7cgzD5dUBE1DAwreU8lk1xtG1yV3OUQqU6090HzRRZ1iGoNEq1P8ZUCRAuY_bscWwxO7a5OM7j8bg"
    }

    private var ekycPromise: Promise? = null

    private val activityEventListener = object : BaseActivityEventListener() {
        override fun onActivityResult(
            activity: Activity,
            requestCode: Int,
            resultCode: Int,
            data: Intent?
        ) {
            if (requestCode == EKYC_REQUEST_CODE) {
                when (resultCode) {
                    Activity.RESULT_OK -> {
                        if (data != null && ekycPromise != null) {
                            try {
                                val dataInfoResult = data.getStringExtra(INFO_RESULT)
                                val dataLivenessCardFrontResult = data.getStringExtra(LIVENESS_CARD_FRONT_RESULT)
                                val dataLivenessCardRearResult = data.getStringExtra(LIVENESS_CARD_REAR_RESULT)
                                val dataCompareResult = data.getStringExtra(COMPARE_RESULT)
                                val dataLivenessFaceResult = data.getStringExtra(LIVENESS_FACE_RESULT)
                                val dataMaskedFaceResult = data.getStringExtra(MASKED_FACE_RESULT)

                                android.util.Log.d("EkycBridge", "INFO_RESULT: $dataInfoResult")
                                android.util.Log.d("EkycBridge", "LIVENESS_CARD_FRONT: $dataLivenessCardFrontResult")
                                android.util.Log.d("EkycBridge", "LIVENESS_CARD_REAR: $dataLivenessCardRearResult")
                                android.util.Log.d("EkycBridge", "COMPARE_RESULT: $dataCompareResult")
                                android.util.Log.d("EkycBridge", "LIVENESS_FACE: $dataLivenessFaceResult")
                                android.util.Log.d("EkycBridge", "MASKED_FACE: $dataMaskedFaceResult")

                                val json = JsonObject()
                                json.addProperty(LOG_OCR, dataInfoResult)
                                json.addProperty(LOG_LIVENESS_CARD_FRONT, dataLivenessCardFrontResult)
                                json.addProperty(LOG_LIVENESS_CARD_REAR, dataLivenessCardRearResult)
                                json.addProperty(LOG_COMPARE, dataCompareResult)
                                json.addProperty(LOG_LIVENESS_FACE, dataLivenessFaceResult)
                                json.addProperty(LOG_MASK_FACE, dataMaskedFaceResult)

                                ekycPromise?.resolve(json.toString())
                            } catch (e: Exception) {
                                android.util.Log.e("EkycBridge", "Error processing result", e)
                                ekycPromise?.reject("E_EKYC_ERROR", "Error processing eKYC result: ${e.message}")
                            }
                        } else {
                            ekycPromise?.reject("E_NO_DATA", "No data returned from eKYC")
                        }
                        ekycPromise = null
                    }
                    Activity.RESULT_CANCELED -> {
                        android.util.Log.d("EkycBridge", "User cancelled eKYC")
                        ekycPromise?.reject("CANCELLED", "User cancelled eKYC")
                        ekycPromise = null
                    }
                    else -> {
                        android.util.Log.d("EkycBridge", "Unknown result code: $resultCode")
                        ekycPromise?.reject("E_UNKNOWN_RESULT", "Unknown result code: $resultCode")
                        ekycPromise = null
                    }
                }
            }
        }
    }

    init {
        reactContext.addActivityEventListener(activityEventListener)
    }

    override fun getName(): String = "EkycBridge"

    /**
     * Phương thức thực hiện eKYC luồng đầy đủ bao gồm: Chụp ảnh giấy tờ và chụp ảnh chân dung
     * Tương đương với startEkycFull trong iOS (EkycBridgeModule.m line 35-124)
     */
    @ReactMethod
    fun startEkycFull(promise: Promise) {
        val currentActivity = reactApplicationContext.currentActivity ?: run {
            promise.reject("E_ACTIVITY_DOES_NOT_EXIST", "Activity doesn't exist")
            return
        }

        ekycPromise = promise

        val intent = getBaseIntent(currentActivity, VnptIdentityActivity::class.java)

        // Giá trị này xác định kiểu giấy tờ để sử dụng
        intent.putExtra(DOCUMENT_TYPE, SDKEnum.DocumentTypeEnum.IDENTITY_CARD.value)

        // Bật so sánh khuôn mặt với ảnh giấy tờ trong luồng full
        intent.putExtra(IS_COMPARE_FLOW, true)

        // Bật/Tắt chức năng kiểm tra ảnh giấy tờ chụp trực tiếp (liveness card)
        intent.putExtra(IS_CHECK_LIVENESS_CARD, true)

        // Lựa chọn chức năng kiểm tra ảnh chân dung chụp trực tiếp (liveness face)
        intent.putExtra(CHECK_LIVENESS_FACE, SDKEnum.ModeCheckLiveNessFace.iBETA.value)

        // Bật/Tắt chức năng kiểm tra che mặt
        intent.putExtra(IS_CHECK_MASKED_FACE, true)

        // Lựa chọn chế độ kiểm tra ảnh giấy tờ ngay từ SDK
        intent.putExtra(TYPE_VALIDATE_DOCUMENT, SDKEnum.TypeValidateDocument.Basic.value)

        // Giá trị này xác định việc có xác thực số ID với mã tỉnh thành, quận huyện, xã phường tương ứng hay không
        intent.putExtra(IS_VALIDATE_POSTCODE, true)

        // Giá trị này xác định phiên bản khi sử dụng Máy ảnh tại bước chụp ảnh chân dung luồng full
        // ADVANCED = ProOval (chụp ảnh chân dung xa gần)
        intent.putExtra(VERSION_SDK, SDKEnum.VersionSDKEnum.ADVANCED.value)

        currentActivity.startActivityForResult(intent, EKYC_REQUEST_CODE)
    }

    /**
     * Start Full eKYC with language selection
     * Tương đương với startEkycFullWithLanguage trong iOS (line 127-164)
     */
    @ReactMethod
    fun startEkycFullWithLanguage(language: String, promise: Promise) {
        val currentActivity = reactApplicationContext.currentActivity ?: run {
            promise.reject("E_ACTIVITY_DOES_NOT_EXIST", "Activity doesn't exist")
            return
        }

        ekycPromise = promise

        try {
            android.util.Log.d("EkycBridge", "Starting eKYC Full with language: $language")
            
            val intent = getBaseIntent(currentActivity, VnptIdentityActivity::class.java, language)

            intent.putExtra(DOCUMENT_TYPE, SDKEnum.DocumentTypeEnum.IDENTITY_CARD.value)
            intent.putExtra(IS_COMPARE_FLOW, true)
            intent.putExtra(IS_CHECK_LIVENESS_CARD, true)
            intent.putExtra(CHECK_LIVENESS_FACE, SDKEnum.ModeCheckLiveNessFace.iBETA.value)
            intent.putExtra(IS_CHECK_MASKED_FACE, true)
            intent.putExtra(TYPE_VALIDATE_DOCUMENT, SDKEnum.TypeValidateDocument.Basic.value)
            intent.putExtra(IS_VALIDATE_POSTCODE, true)
            intent.putExtra(VERSION_SDK, SDKEnum.VersionSDKEnum.ADVANCED.value)

            android.util.Log.d("EkycBridge", "Starting activity...")
            currentActivity.startActivityForResult(intent, EKYC_REQUEST_CODE)
            android.util.Log.d("EkycBridge", "Activity started successfully")
        } catch (e: Exception) {
            android.util.Log.e("EkycBridge", "Error starting eKYC", e)
            ekycPromise?.reject("E_START_ACTIVITY_FAILED", "Failed to start eKYC: ${e.message}", e)
            ekycPromise = null
        }
    }

    /**
     * Phương thức thực hiện eKYC luồng "Chụp ảnh giấy tờ" (OCR)
     * Tương đương với startEkycOcr trong iOS (line 167-238)
     */
    @ReactMethod
    fun startEkycOcr(promise: Promise) {
        val currentActivity = reactApplicationContext.currentActivity ?: run {
            promise.reject("E_ACTIVITY_DOES_NOT_EXIST", "Activity doesn't exist")
            return
        }

        ekycPromise = promise

        val intent = getBaseIntent(currentActivity, VnptOcrActivity::class.java)

        // Giá trị này xác định kiểu giấy tờ để sử dụng
        intent.putExtra(DOCUMENT_TYPE, SDKEnum.DocumentTypeEnum.IDENTITY_CARD.value)

        // Bật/Tắt chức năng kiểm tra ảnh giấy tờ chụp trực tiếp (liveness card)
        intent.putExtra(IS_CHECK_LIVENESS_CARD, true)

        // Lựa chọn chế độ kiểm tra ảnh giấy tờ ngay từ SDK
        intent.putExtra(TYPE_VALIDATE_DOCUMENT, SDKEnum.TypeValidateDocument.Basic.value)

        // Xác thực số ID với mã tỉnh thành
        intent.putExtra(IS_VALIDATE_POSTCODE, true)

        currentActivity.startActivityForResult(intent, EKYC_REQUEST_CODE)
    }

    /**
     * Start OCR with language selection
     * Tương đương với startEkycOcrWithLanguage trong iOS (line 241-272)
     */
    @ReactMethod
    fun startEkycOcrWithLanguage(language: String, promise: Promise) {
        val currentActivity = reactApplicationContext.currentActivity ?: run {
            promise.reject("E_ACTIVITY_DOES_NOT_EXIST", "Activity doesn't exist")
            return
        }

        ekycPromise = promise

        val intent = getBaseIntent(currentActivity, VnptOcrActivity::class.java, language)

        intent.putExtra(DOCUMENT_TYPE, SDKEnum.DocumentTypeEnum.IDENTITY_CARD.value)
        intent.putExtra(IS_CHECK_LIVENESS_CARD, true)
        intent.putExtra(TYPE_VALIDATE_DOCUMENT, SDKEnum.TypeValidateDocument.Basic.value)
        intent.putExtra(IS_VALIDATE_POSTCODE, true)

        currentActivity.startActivityForResult(intent, EKYC_REQUEST_CODE)
    }

    /**
     * Phương thức thực hiện eKYC luồng "Chụp ảnh chân dung"
     * Tương đương với startEkycFace trong iOS (line 275-349)
     */
    @ReactMethod
    fun startEkycFace(promise: Promise) {
        val currentActivity = reactApplicationContext.currentActivity ?: run {
            promise.reject("E_ACTIVITY_DOES_NOT_EXIST", "Activity doesn't exist")
            return
        }

        ekycPromise = promise

        val intent = getBaseIntent(currentActivity, VnptPortraitActivity::class.java)

        // Giá trị này xác định phiên bản khi sử dụng Máy ảnh tại bước chụp ảnh chân dung
        // ADVANCED: chụp ảnh chân dung xa gần (ProOval)
        intent.putExtra(VERSION_SDK, SDKEnum.VersionSDKEnum.ADVANCED.value)

        // Bật/Tắt chức năng So sánh ảnh trong thẻ và ảnh chân dung
        intent.putExtra(IS_COMPARE_FLOW, false)

        // Bật/Tắt chức năng kiểm tra che mặt
        intent.putExtra(IS_CHECK_MASKED_FACE, true)

        // Lựa chọn chức năng kiểm tra ảnh chân dung chụp trực tiếp (liveness face)
        intent.putExtra(CHECK_LIVENESS_FACE, SDKEnum.ModeCheckLiveNessFace.iBETA.value)

        currentActivity.startActivityForResult(intent, EKYC_REQUEST_CODE)
    }

    /**
     * Start Face detection with language selection
     * Tương đương với startEkycFaceWithLanguage trong iOS (line 352-382)
     */
    @ReactMethod
    fun startEkycFaceWithLanguage(language: String, promise: Promise) {
        val currentActivity = reactApplicationContext.currentActivity ?: run {
            promise.reject("E_ACTIVITY_DOES_NOT_EXIST", "Activity doesn't exist")
            return
        }

        ekycPromise = promise

        val intent = getBaseIntent(currentActivity, VnptPortraitActivity::class.java, language)

        intent.putExtra(VERSION_SDK, SDKEnum.VersionSDKEnum.ADVANCED.value)
        intent.putExtra(IS_COMPARE_FLOW, false)
        intent.putExtra(IS_CHECK_MASKED_FACE, true)
        intent.putExtra(CHECK_LIVENESS_FACE, SDKEnum.ModeCheckLiveNessFace.iBETA.value)

        currentActivity.startActivityForResult(intent, EKYC_REQUEST_CODE)
    }

    /**
     * Verify face against a reference hash (compare with stored face)
     * Tương đương với startEkycFaceWithReference trong iOS (line 386-426)
     */
    @ReactMethod
    fun startEkycFaceWithReference(referenceHash: String, promise: Promise) {
        val currentActivity = reactApplicationContext.currentActivity ?: run {
            promise.reject("E_ACTIVITY_DOES_NOT_EXIST", "Activity doesn't exist")
            return
        }

        ekycPromise = promise

        val intent = getBaseIntent(currentActivity, VnptPortraitActivity::class.java)

        intent.putExtra(VERSION_SDK, SDKEnum.VersionSDKEnum.ADVANCED.value)
        intent.putExtra(IS_CHECK_MASKED_FACE, true)
        intent.putExtra(CHECK_LIVENESS_FACE, SDKEnum.ModeCheckLiveNessFace.iBETA.value)

        // Enable compare against provided reference hash
        intent.putExtra(IS_COMPARE_FLOW, true)
        // Note: Android SDK may have different implementation for general face comparison
        // You may need to pass referenceHash through headers or different mechanism
        // depending on SDK version 3.6.6 capabilities

        currentActivity.startActivityForResult(intent, EKYC_REQUEST_CODE)
    }

    /**
     * VerifyFace flow: input ID → capture face → verify
     * Tương đương với startVerifyFaceWithId trong iOS (line 429-468)
     */
    @ReactMethod
    fun startVerifyFaceWithId(verifyId: String, promise: Promise) {
        val currentActivity = reactApplicationContext.currentActivity ?: run {
            promise.reject("E_ACTIVITY_DOES_NOT_EXIST", "Activity doesn't exist")
            return
        }

        ekycPromise = promise

        val intent = getBaseIntent(currentActivity, VnptPortraitActivity::class.java)

        intent.putExtra(VERSION_SDK, SDKEnum.VersionSDKEnum.ADVANCED.value)
        intent.putExtra(IS_CHECK_MASKED_FACE, true)
        intent.putExtra(CHECK_LIVENESS_FACE, SDKEnum.ModeCheckLiveNessFace.iBETA.value)

        // Pass Verify ID for backend (may need to implement custom header mechanism)
        // Note: Android SDK may handle this differently than iOS
        // You may need to add custom headers or parameters based on SDK documentation

        currentActivity.startActivityForResult(intent, EKYC_REQUEST_CODE)
    }

    /**
     * Get base intent with common configurations
     * Tương đương với initParamSdkForCamera trong iOS (line 470-477)
     */
    private fun getBaseIntent(
        activity: Activity,
        clazz: Class<*>,
        language: String = "vi"
    ): Intent {
        val intent = Intent(activity, clazz)

        // Nhập thông tin bộ mã truy cập từ iOS credentials
        // Sử dụng SDK constants làm key, giá trị token của mình làm value
        intent.putExtra(ACCESS_TOKEN, MY_ACCESS_TOKEN)
        intent.putExtra(TOKEN_ID, MY_TOKEN_ID)
        intent.putExtra(TOKEN_KEY, MY_TOKEN_KEY)

        // Giá trị này dùng để đảm bảo mỗi yêu cầu (request) từ phía khách hàng sẽ không bị thay đổi
        intent.putExtra(CHALLENGE_CODE, "INNOVATIONCENTER")

        // Ngôn ngữ sử dụng trong SDK
        val languageValue = when (language.lowercase()) {
            "en" -> SDKEnum.LanguageEnum.ENGLISH.value
            "vi" -> SDKEnum.LanguageEnum.VIETNAMESE.value
            else -> SDKEnum.LanguageEnum.VIETNAMESE.value
        }
        intent.putExtra(LANGUAGE_SDK, languageValue)

        // Bật/Tắt Hiển thị màn hình hướng dẫn
        intent.putExtra(IS_SHOW_TUTORIAL, true)

        // Bật chức năng hiển thị nút bấm "Bỏ qua hướng dẫn" tại các màn hình hướng dẫn bằng video
        intent.putExtra(IS_ENABLE_GOT_IT, true)

        // Sử dụng máy ảnh mặt trước
        intent.putExtra(CAMERA_POSITION_FOR_PORTRAIT, SDKEnum.CameraTypeEnum.FRONT.value)

        return intent
    }
}

