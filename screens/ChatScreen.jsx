import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, TextInput, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { getConversation } from '../utils/api';
import { useRoute, useNavigation } from '@react-navigation/native';

export default function ChatScreen() {
  const insets = useSafeAreaInsets();
  const route = useRoute();
  const navigation = useNavigation();
  const { user } = route.params || {};
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const flatListRef = useRef(null);

  useEffect(() => {
    if (!user || !user._id) return;
    setLoading(true);
    getConversation(user._id)
      .then(data => {
        setMessages(Array.isArray(data) ? data : []);
        setLoading(false);
        setTimeout(() => {
          if (flatListRef.current) flatListRef.current.scrollToEnd({ animated: false });
        }, 100);
      })
      .catch(() => setLoading(false));
  }, [user]);

  const handleSend = async () => {
    if (!input.trim()) return;
    setSending(true);
    // TODO: Implement sendMessage API and optimistic update
    setInput('');
    setSending(false);
  };

  const renderMessage = ({ item }) => {
    const isOwn = item.from === user.myUserId; // Replace with actual user id logic
    return (
      <View style={[styles.messageRow, isOwn ? styles.ownMessage : styles.otherMessage]}>
        {!isOwn && (
          <Image
            source={{ uri: user.profileImage || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.username)}` }}
            style={styles.avatar}
          />
        )}
        <View style={styles.bubble}>
          {item.text ? <Text style={styles.messageText}>{item.text}</Text> : null}
          {/* Add media/image/audio rendering here if needed */}
          <Text style={styles.time}>{formatTime(item.createdAt)}</Text>
        </View>
      </View>
    );
  };

  const formatTime = (timestamp) => {
    const d = new Date(timestamp);
    const now = new Date();
    const diffMs = now - d;
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    if (diffMins < 10080) return `${Math.floor(diffMins / 1440)}d ago`;
    if (diffMins < 43200) return `${Math.floor(diffMins / 10080)}w ago`;
    if (diffMins < 525600) return `${Math.floor(diffMins / 43200)}mo ago`;
    return `${Math.floor(diffMins / 525600)}y ago`;
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
  <View style={[styles.header, { paddingTop: insets.top > 0 ? Math.min(insets.top, 8) : 4, paddingBottom: 0 }]}> {/* Reduced top padding */}
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        <Image
          source={{ uri: user.profileImage || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.username)}` }}
          style={styles.headerAvatar}
        />
        <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
          <Text style={styles.headerUsername}>{user.username}</Text>
          {user.verified && (
            <Image source={require('../assets/blue-badge.png')} style={styles.verifiedBadge} />
          )}
        </View>
      </View>
      {/* Messages */}
      {loading ? (
        <ActivityIndicator style={{ flex: 1 }} size="large" color="#007AFF" />
      ) : (
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={item => item._id}
          contentContainerStyle={styles.messagesList}
          onContentSizeChange={() => flatListRef.current && flatListRef.current.scrollToEnd({ animated: false })}
        />
      )}
      {/* Input */}
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            value={input}
            onChangeText={setInput}
            placeholder="Type a message..."
            editable={!sending}
          />
          <TouchableOpacity style={styles.sendButton} onPress={handleSend} disabled={sending || !input.trim()}>
            <Text style={styles.sendText}>Send</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, borderBottomWidth: 1, borderColor: '#eee', backgroundColor: '#f9f9f9', minHeight: 0, height: 56 },
  backButton: { marginRight: 10, padding: 4 },
  backText: { fontSize: 22, color: '#007AFF' },
  headerAvatar: { width: 32, height: 32, borderRadius: 16, marginRight: 8 },
  headerUsername: { fontWeight: 'bold', fontSize: 16, lineHeight: 20 },
  verifiedBadge: { width: 14, height: 14, marginLeft: 4, alignSelf: 'center' },
  messagesList: { padding: 12, paddingBottom: 24 },
  messageRow: { flexDirection: 'row', alignItems: 'flex-end', marginBottom: 10 },
  ownMessage: { justifyContent: 'flex-end' },
  otherMessage: { justifyContent: 'flex-start' },
  avatar: { width: 28, height: 28, borderRadius: 14, marginRight: 8 },
  bubble: { backgroundColor: '#f1f0f0', borderRadius: 16, padding: 10, maxWidth: '80%' },
  messageText: { fontSize: 15 },
  time: { fontSize: 11, color: '#888', marginTop: 4, alignSelf: 'flex-end' },
  inputRow: { flexDirection: 'row', alignItems: 'center', padding: 8, borderTopWidth: 1, borderColor: '#eee', backgroundColor: '#fafafa' },
  input: { flex: 1, fontSize: 16, backgroundColor: '#f5f5f5', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8, marginRight: 8 },
  sendButton: { backgroundColor: '#007AFF', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8 },
  sendText: { color: '#fff', fontWeight: 'bold' },
});
