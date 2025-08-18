export default {
  expo: {
    name: "Journaltest",
    slug: "journaltest",
    version: "1.0.0",
  icon: "./assets/mount.png",
    owner: "zack254",
    extra: {
      API_BASE_URL: process.env.EXPO_PUBLIC_API_BASE_URL,
  CLOUDINARY_CLOUD_NAME: process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_UPLOAD_PRESET: process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET,
      eas: {
        projectId: "5705b292-fe59-4ba1-8c26-1965e250b289"
      }
    },
    android: {
      package: "com.zack254.journalyze"
    },
  },
};
