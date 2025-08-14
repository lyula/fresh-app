import React, { useState } from 'react';
import { createPost } from '../utils/createPost';
import { View, TextInput, Text, TouchableOpacity, StyleSheet, Image, ScrollView, ActivityIndicator, SafeAreaView, StatusBar, KeyboardAvoidingView, Platform } from 'react-native';
import { Video } from 'expo-av';
import { useUser } from '../context/user';
import { Ionicons } from '@expo/vector-icons';

const LINK_COLOR = '#1E3A8A';
const GOLD = '#a99d6b';

export default function CreatePostScreen({ navigation, onPostCreated, visible = true, onClose }) {
  const { userId, user } = useUser();
  const [content, setContent] = useState('');
  const [images, setImages] = useState([]); // Array of image URIs
  const [videos, setVideos] = useState([]); // Array of video URIs
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Example image picker for multiple images
  const handlePickImage = async () => {
    // Replace with your image picker logic (e.g., expo-image-picker)
    // This is a placeholder for multiple selection
    // Example: let result = await ImagePicker.launchImageLibraryAsync({ allowsMultipleSelection: true });
    // if (!result.canceled) setImages([...images, ...result.assets.map(a => a.uri)]);
  };
  // Example video picker for multiple videos
  const handlePickVideo = async () => {
    // Replace with your video picker logic (e.g., expo-image-picker)
    // Example: let result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: 'Videos', allowsMultipleSelection: true });
    // if (!result.canceled) setVideos([...videos, ...result.assets.map(a => a.uri)]);
  };

  const handleSubmit = async () => {
    if (!content.trim()) {
      setError('Post content cannot be empty.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      // Send post to backend
      const newPost = await createPost({ content, images, videos });
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
                <TouchableOpacity onPress={onClose || (() => navigation && navigation.goBack())}>
                  <Text style={[styles.flatCancel, styles.cancelRightPad]}>Cancel</Text>
                </TouchableOpacity>
              </View>
              {/* Preview selected images */}
              {images.length > 0 && (
                <ScrollView horizontal style={{ marginBottom: 12 }}>
                  {images.map((img, idx) => (
                    <Image key={idx} source={{ uri: img }} style={styles.mediaPreviewFlat} />
                  ))}
                </ScrollView>
              )}
              {/* Preview selected videos */}
              {videos.length > 0 && (
                <ScrollView horizontal style={{ marginBottom: 12 }}>
                  {videos.map((vid, idx) => (
                    <Video
                      key={idx}
                      source={{ uri: vid }}
                      style={styles.mediaPreviewFlat}
                      useNativeControls
                      resizeMode="contain"
                      shouldPlay={false}
                    />
                  ))}
                </ScrollView>
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
                  <TouchableOpacity style={styles.iconBtnFlat} onPress={handlePickImage}>
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
                  style={[styles.postBtnFlat, (!content.trim() || loading) && { opacity: 0.6 }]}
                  onPress={handleSubmit} 
                  disabled={loading || !content.trim()}
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
    width: '96%',
    aspectRatio: 1,
    borderRadius: 8,
    marginBottom: 12,
    backgroundColor: '#000',
    maxHeight: 320,
    alignSelf: 'center',
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