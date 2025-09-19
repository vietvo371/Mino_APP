#!/bin/bash

# Simple archive script for Xcode 16.3
set -e

echo "🧹 Cleaning..."
rm -rf build/
rm -rf ~/Library/Developer/Xcode/DerivedData/Mimo-*

echo "📦 Installing pods..."
export LANG=en_US.UTF-8
pod install

echo "🔧 Building archive..."

# Simple archive command
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
  -EnableIndexWhileBuilding=NO \
  -CLANG_WARN_QUOTED_INCLUDE_IN_FRAMEWORK_HEADER=NO \
  -GCC_WARN_INHIBIT_ALL_WARNINGS=YES \
  -COMPILER_INDEX_STORE_ENABLE=NO \
  -ONLY_ACTIVE_ARCH=NO \
  -VALID_ARCHS=arm64

echo "✅ Archive completed!"
echo "📁 Location: ./build/Mimo.xcarchive"
