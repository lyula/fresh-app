import { View, TextInput, Text, TouchableOpacity, StyleSheet, Image, ScrollView, ActivityIndicator, SafeAreaView, StatusBar, KeyboardAvoidingView } from 'react-native';
import { ProgressBar } from 'react-native-paper';
import { Platform } from 'react-native';
import React, { useState, useRef, useEffect } from 'react';
import { createPost } from '../utils/createPost';
import * as ImagePicker from 'expo-image-picker';
import { Alert } from 'react-native';
import { uploadToCloudinary, deleteFromCloudinary } from '../utils/cloudinaryUpload';
import { Video } from 'expo-av';
import { useUser } from '../context/user';
import { Ionicons } from '@expo/vector-icons';

const LINK_COLOR = '#1E3A8A';
const GOLD = '#a99d6b';

export default function CreatePostScreen({ navigation, onPostCreated, visible = true, onClose }) {
  const { userId, user } = useUser();
  const [content, setContent] = useState('');
  // Store both local and uploaded URIs for instant preview
  const [images, setImages] = useState([]); // Array of { uri, base64 }
  const [videos, setVideos] = useState([]); // Array of { uri, base64, cloudinaryUrl }
  const [videoUploading, setVideoUploading] = useState(false);
  const [videoUploadProgress, setVideoUploadProgress] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [imagePreview, setImagePreview] = useState(null);

  // Improved image picker for multiple images
  const handlePickImage = async () => {
    if (Platform.OS === 'web') {
      Alert.alert('Not supported', 'Media picking is not supported on web.');
      return;
    }
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission?.granted) {
        Alert.alert('Permission required', 'Please allow access to your media library to select images.');
        return;
      }
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: false,
        quality: 1,
        base64: true,
      });
      if (!result?.assets) {
        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          quality: 1,
          base64: true,
        });
      }
      if (result && !result.canceled && result.assets && result.assets.length > 0) {
        const newImages = result.assets.map(asset => ({ uri: asset.uri, base64: asset.base64 }));
        setImages(newImages);
      }
    } catch (err) {
      setError('Could not open image picker.');
    }
  };
  // Improved video picker for multiple videos
  const handlePickVideo = async () => {
    if (Platform.OS === 'web') {
      Alert.alert('Not supported', 'Media picking is not supported on web.');
      return;
    }
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission?.granted) {
        Alert.alert('Permission required', 'Please allow access to your media library to select videos.');
        return;
      }
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
        allowsMultipleSelection: false,
        quality: 1,
        base64: true,
      });
      if (!result?.assets) {
        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Videos,
          quality: 1,
          base64: true,
        });
      }
      if (result && !result.canceled && result.assets && result.assets.length > 0) {
        setVideoUploading(true);
        setError('');
        setVideoUploadProgress(0);
        try {
          const asset = result.assets[0];
          // Modified uploadToCloudinary to accept a progress callback
          const cloudinaryUrl = await uploadToCloudinary(asset.uri, 'video', (progress) => {
            setVideoUploadProgress(progress);
          });
          setVideos([{ uri: asset.uri, base64: asset.base64, cloudinaryUrl }]);
        } catch (err) {
          setError('Failed to upload video.');
        }
        setVideoUploading(false);
      }
    } catch (err) {
      setError('Could not open video picker.');
      setVideoUploading(false);
    }
  };

  const pickSingleImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 1,
      base64: true,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      setImagePreview('data:image/jpeg;base64,' + result.assets[0].base64);
    }
  };

  const handleSubmit = async () => {
    if (!content.trim() && images.length === 0 && videos.length === 0) {
      setError('Post must have text or media.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      // Upload images/videos to Cloudinary before creating post
      const uploadedImages = await Promise.all(images.map(async img => {
        const url = await uploadToCloudinary(img.uri, 'image');
        return url;
      }));
      const uploadedVideos = await Promise.all(videos.map(async vid => {
        const url = await uploadToCloudinary(vid.uri, 'video');
        return url;
      }));
      // Send post to backend
      const newPost = await createPost({
        content,
        images: uploadedImages,
        videos: uploadedVideos
      });
      setContent('');
      setImages([]);
      setVideos([]);
      if (onPostCreated) onPostCreated(newPost);
      if (navigation) {
        navigation.navigate('PostsFeed', { newPost });
      }
    } catch (e) {
      setError('Failed to create post.');
    }
    setLoading(false);
  };

  const handleCancel = () => {
    setContent('');
    setImages([]);
    setVideos([]);
    if (onClose) onClose();
    else if (navigation) navigation.goBack();
  };

  // Ref for ScrollView and input overlay
  const scrollViewRef = useRef(null);
  const inputOverlayRef = useRef(null);

  // Automatically scroll to input overlay when typing
  useEffect(() => {
    if (content.length > 0 && inputOverlayRef.current && scrollViewRef.current) {
      setTimeout(() => {
        inputOverlayRef.current.measure((fx, fy, width, height, px, py) => {
          scrollViewRef.current.scrollTo({ y: py - 40, animated: true });
        });
      }, 150); // slight delay for rendering
    }
  }, [content]);

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" translucent={false} />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <SafeAreaView style={styles.centeredContainer}>
          <ScrollView
            ref={scrollViewRef}
            style={{ width: '100%' }}
            contentContainerStyle={{ flexGrow: 1 }}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.formContent}>
              <View style={styles.userRowFlat}>
                <Image
                  source={{ uri: (user?.profileImage || user?.profile?.profileImage || 'https://cdn-icons-png.flaticon.com/512/149/149071.png') }}
                  style={styles.avatarFlat}
                />
                <Text style={styles.usernameFlat}>{user?.username || 'User'}</Text>
                <View style={styles.flexGrow} />
                <TouchableOpacity onPress={handleCancel}>
                  <Text style={[styles.flatCancel, styles.cancelRightPad]}>Cancel</Text>
                </TouchableOpacity>
              </View>
              {/* Preview selected images */}
              {images.length > 0 && images[0].base64 && (
                <View style={{ position: 'relative', marginBottom: 12 }}>
                  <Image source={{ uri: 'data:image/jpeg;base64,' + images[0].base64 }} style={styles.mediaPreviewFlat} />
                  <TouchableOpacity
                    style={{ position: 'absolute', top: 8, right: 8, backgroundColor: '#fff', borderRadius: 16, padding: 4, elevation: 2 }}
                    onPress={() => setImages([])}
                  >
                    <Ionicons name="close-circle" size={28} color="#e11d48" />
                  </TouchableOpacity>
                </View>
              )}
              {/* Preview selected videos */}
              {videoUploading && (
                <View style={{ marginBottom: 12, alignItems: 'center', width: '100%' }}>
                  <ProgressBar progress={videoUploadProgress} color={LINK_COLOR} style={{ height: 8, borderRadius: 8, width: '90%' }} />
                  <Text style={{ color: LINK_COLOR, marginTop: 8 }}>Uploading video... {Math.round(videoUploadProgress * 100)}%</Text>
                </View>
              )}
              {videos.length > 0 && videos[0].cloudinaryUrl && !videoUploading && (
                <View style={{ position: 'relative', marginBottom: 12, justifyContent: 'center', alignItems: 'center' }}>
                  <Video
                    source={{ uri: videos[0].cloudinaryUrl }}
                    style={styles.mediaPreviewFlat}
                    resizeMode="cover"
                    shouldPlay={false}
                    useNativeControls={false}
                  />
                  {/* Custom Controls */}
                  <View style={{ position: 'absolute', bottom: 16, left: 0, right: 0, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 16 }}>
                    <TouchableOpacity style={{ backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: 24, padding: 8 }} onPress={() => {/* play/pause logic here */}}>
                      <Ionicons name="play" size={28} color="#fff" />
                    </TouchableOpacity>
                    <TouchableOpacity style={{ backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: 24, padding: 8 }} onPress={() => {/* mute/unmute logic here */}}>
                      <Ionicons name="volume-high" size={28} color="#fff" />
                    </TouchableOpacity>
                  </View>
                  {/* Overlay input box when typing */}
                  {content.length > 0 && (
                    <View
                      ref={inputOverlayRef}
                      style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '100%', justifyContent: 'flex-end', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.15)' }}
                    >
                      <TextInput
                        style={{
                          width: '90%',
                          minHeight: 48,
                          maxHeight: 120,
                          backgroundColor: 'rgba(255,255,255,0.95)',
                          borderRadius: 12,
                          padding: 12,
                          fontSize: 16,
                          marginBottom: 24,
                          color: '#222',
                        }}
                        placeholder="What's on your mind?"
                        placeholderTextColor="#888"
                        multiline
                        value={content}
                        onChangeText={setContent}
                        textAlignVertical={Platform.OS === 'android' ? 'top' : 'auto'}
                        maxLength={2200}
                        autoFocus={true}
                      />
                    </View>
                  )}
                  <TouchableOpacity
                    style={{ position: 'absolute', top: 8, right: 8, backgroundColor: '#fff', borderRadius: 16, padding: 4, elevation: 2 }}
                    onPress={async () => {
                      try {
                        await deleteFromCloudinary(videos[0].cloudinaryUrl, 'video');
                      } catch (err) {}
                      setVideos([]);
                    }}
                  >
                    <Ionicons name="close-circle" size={28} color="#e11d48" />
                  </TouchableOpacity>
                </View>
              )}
              <View style={styles.inputContainerFlat}>
                <ScrollView
                  style={styles.inputScrollFlat}
                  contentContainerStyle={{ flexGrow: 1 }}
                  keyboardShouldPersistTaps="handled"
                >
                  <TextInput
                    style={styles.inputFlat}
                    placeholder="What's on your mind?"
                    placeholderTextColor="#888"
                    multiline
                    value={content}
                    onChangeText={setContent}
                    textAlignVertical={Platform.OS === 'android' ? 'top' : 'auto'}
                    maxLength={2200}
                  />
                </ScrollView>
              </View>
              <View style={styles.mediaAndPostRow}>
                <View style={styles.mediaPickerRowFlat}>
                  <TouchableOpacity style={styles.iconBtnFlat} onPress={async () => {
                    let result = await ImagePicker.launchImageLibraryAsync({
                      mediaTypes: ImagePicker.MediaTypeOptions.Images,
                      allowsEditing: false,
                      quality: 1,
                      base64: true,
                    });
                    if (!result.canceled && result.assets && result.assets.length > 0) {
                      setImages([{ uri: result.assets[0].uri, base64: result.assets[0].base64 }]);
                    }
                  }}>
                    <Ionicons name="image-outline" size={26} color={LINK_COLOR} />
                    <Text style={styles.mediaPickerLabelFlat}>Image</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.iconBtnFlat} onPress={handlePickVideo}>
                    <Ionicons name="videocam-outline" size={26} color={LINK_COLOR} />
                    <Text style={styles.mediaPickerLabelFlat}>Video</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.flexGrow} />
                <TouchableOpacity 
                  style={[styles.postBtnFlat, (!content.trim() && images.length === 0 && videos.length === 0 || loading) && { opacity: 0.6 }]}
                  onPress={handleSubmit} 
                  disabled={loading || (!content.trim() && images.length === 0 && videos.length === 0)}
                >
                  {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.postBtnTextFlat}>Post</Text>}
                </TouchableOpacity>
              </View>
              {error ? <Text style={styles.errorFlat}>{error}</Text> : null}
            </View>
          </ScrollView>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </>
  );
}

const styles = StyleSheet.create({
  cancelRightPad: {
    paddingRight: 10,
  },
  centeredContainer: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  formContent: {
    width: '100%',
    maxWidth: 420,
    alignSelf: 'center',
    marginTop: 32, // Move elements down
  },
  flatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingHorizontal: 12,
    paddingTop: 18,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    backgroundColor: '#fff',
    elevation: 0,
    shadowOpacity: 0,
  },
  flatCancel: {
    fontSize: 16,
    color: LINK_COLOR,
    fontWeight: '500',
    paddingVertical: 2,
    paddingHorizontal: 2,
  },
  cancelRightPad: {
    paddingRight: 10,
  },
  flexGrow: {
    flex: 1,
  },
  postBtnFlat: {
    backgroundColor: LINK_COLOR,
    paddingVertical: 10,
    paddingHorizontal: 38,
    borderRadius: 8,
    alignItems: 'center',
    marginLeft: 8,
    marginRight: 8,
  },
  postBtnTextFlat: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  pageContent: {
    flex: 1,
    paddingHorizontal: 0,
    paddingTop: 10,
    backgroundColor: '#fff',
  },
  userRowFlat: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    marginLeft: 12,
    gap: 8,
  },
  avatarFlat: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#eee',
  },
  usernameFlat: {
    fontSize: 16,
    color: '#222',
    fontWeight: '600',
    marginLeft: 10,
  },
  mediaPreviewFlat: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 16,
    marginBottom: 12,
    backgroundColor: 'transparent',
    maxHeight: undefined,
    alignSelf: 'center',
    overflow: 'hidden',
  },
  inputContainerFlat: {
    width: '96%',
    maxHeight: 120, // About 6 lines of text
    minHeight: 90,
    alignSelf: 'center',
    marginBottom: 12,
    borderRadius: 8,
    backgroundColor: '#f9fafb',
    borderColor: '#e5e7eb',
    borderWidth: 1,
    overflow: 'hidden',
  },
  inputScrollFlat: {
    maxHeight: 120,
    minHeight: 90,
  },
  inputFlat: {
    width: '100%',
    padding: 12,
    fontSize: 16,
    color: '#222',
    backgroundColor: 'transparent',
  },
  mediaPickerRowFlat: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginLeft: 12,
    gap: 18,
    marginBottom: 12,
  },
  iconBtnFlat: {
    alignItems: 'center',
    padding: 6,
    borderRadius: 6,
    backgroundColor: '#f1f5f9',
    flexDirection: 'column',
    minWidth: 60,
  },
  mediaPickerLabelFlat: {
    fontSize: 13,
    color: LINK_COLOR,
    marginTop: 2,
    fontWeight: '500',
  },
  errorFlat: {
    color: '#e11d48',
    marginTop: 6,
    fontSize: 15,
    alignSelf: 'center',
    marginBottom: 2,
  },
});