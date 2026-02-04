---
description: How to build and generate an Android APK for your device
---

This workflow guides you through building a standalone Android APK that can be installed on your phone.

I have already configured your `app.json` with the package name `com.togetherwithfarm.app` and created an `eas.json` file with a proper `preview` profile for APK generation.

### Prerequisites:
- You must have an Expo account. If you don't, sign up at [expo.dev/signup](https://expo.dev/signup).

### Step 1: Login to EAS
Login to your Expo account via the terminal.
```bash
npx eas-cli login
```

### Step 2: Start the Build
Run the following command to start the build process on Expo's servers. 
This uses the "preview" profile we configured in `eas.json` to generate an `.apk` file (instead of the Play Store's `.aab`).

// turbo
```bash
cd "Together-with-farm"
npx eas-cli build --platform android --profile preview
```

### Step 3: Wait and Download
1. The CLI will provide a link to the build status page on the Expo dashboard.
2. Wait for the build to finish (it usually takes 10-15 minutes).
3. Once complete, you can download the `.apk` file directly from the dashboard or use the QR code provided in the terminal.
4. Transfer the file to your Android device and install it!
