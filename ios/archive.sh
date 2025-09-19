#!/bin/bash

# Script to build archive with Xcode 16.3 fixes
set -e

echo "🧹 Cleaning build folder..."
rm -rf ~/Library/Developer/Xcode/DerivedData/Mimo-*
rm -rf build/

echo "📦 Installing pods..."
export LANG=en_US.UTF-8
pod install --repo-update

echo "🔧 Building archive with Xcode 16.3 fixes..."

# Build with specific settings to avoid parallel build issues
xcodebuild archive \
  -workspace Mimo.xcworkspace \
  -scheme Mimo \
  -configuration Release \
  -archivePath ./build/Mimo.xcarchive \
  -destination generic/platform=iOS \
  -jobs 1 \
  -parallelizeTargets=NO \
  -UseModernBuildSystem=YES \
  -UseNewBuildSystem=YES \
  -EnableBitcode=NO \
  -EnableUserScriptSandboxing=NO \
  -EnableAddressSanitizer=NO \
  -EnableThreadSanitizer=NO \
  -EnableUndefinedBehaviorSanitizer=NO \
  -EnableCodeCoverage=NO \
  -EnableIndexWhileBuilding=NO \
  -CLANG_ANALYZER_LOCALIZABILITY_NONLOCALIZED=NO \
  -CLANG_WARN_QUOTED_INCLUDE_IN_FRAMEWORK_HEADER=NO \
  -GCC_WARN_INHIBIT_ALL_WARNINGS=YES \
  -COMPILER_INDEX_STORE_ENABLE=NO \
  -SWIFT_COMPILATION_MODE=wholemodule \
  -ONLY_ACTIVE_ARCH=NO \
  -VALID_ARCHS=arm64 \
  -EXCLUDED_ARCHS[sdk=iphonesimulator*]=i386

echo "✅ Archive completed successfully!"
echo "📁 Archive location: ./build/Mimo.xcarchive"
