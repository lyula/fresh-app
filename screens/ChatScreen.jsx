import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, TextInput, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { useUser } from '../context/user';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { getConversation } from '../utils/api';
import { useRoute, useNavigation } from '@react-navigation/native';

export default function ChatScreen() {
  const { userId: myUserId } = useUser();
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
        if (Array.isArray(data)) {
          setMessages(data);
        } else if (data && Array.isArray(data.messages)) {
          setMessages(data.messages);
        } else {
          setMessages([]);
        }
        setLoading(false);
      })
      .catch(() => {
        setMessages([]);
        setLoading(false);
      });
  }, [user]);

  const handleSend = async () => {
    if (!input.trim()) return;
    setSending(true);
    // TODO: Implement sendMessage API and optimistic update
    setInput('');
    setSending(false);
  };

  const renderMessage = ({ item }) => {
    if (!item || typeof item !== 'object' || !('from' in item)) return null;
    const isOwn = item.from === myUserId;
    return (
      <View style={[styles.messageRow, isOwn ? styles.ownMessage : styles.otherMessage]}>
        {!isOwn && (
          <Image
            source={{ uri: user.profileImage || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.username || 'User')}` }}
            style={styles.avatar}
          />
        )}
        <View style={[styles.bubble, isOwn ? styles.ownBubble : styles.otherBubble]}>
          {typeof item.text === 'string' && item.text.length > 0 ? (
            <Text style={[styles.messageText, isOwn ? styles.ownMessageText : null]}>{String(item.text)}</Text>
          ) : null}
          {/* Add media/image/audio rendering here if needed */}
          <Text style={[styles.time, isOwn ? styles.ownTime : null]}>{String(formatTime(item.createdAt) || '')}</Text>
        </View>
      </View>
    );
  };

  const formatTime = (timestamp) => {
    const d = new Date(timestamp);
    // Format as HH:mm in user's local time
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 56 + (insets.top || 0) : 0}
      >
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
            <Text style={styles.headerUsername}>{typeof user.username === 'string' ? user.username : 'User'}</Text>
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
            data={Array.isArray(messages) ? messages.filter(m => m && typeof m === 'object' && 'from' in m) : []}
            renderItem={renderMessage}
            keyExtractor={item => (item && typeof item === 'object' && item._id ? String(item._id) : Math.random().toString(36))}
            contentContainerStyle={styles.messagesList}
            // initialScrollIndex removed to prevent flicker
            onContentSizeChange={() => {
              if (flatListRef.current) {
                flatListRef.current.scrollToEnd({ animated: false });
              }
            }}
            getItemLayout={(data, index) => (
              {length: 70, offset: 70 * index, index} // 70 is an estimated row height
            )}
          />
        )}
        {/* Input */}
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
  verifiedBadge: { width: 20, height: 20, marginLeft: 0, alignSelf: 'center' },
  messagesList: { padding: 12, paddingBottom: 24 },
  messageRow: { flexDirection: 'row', alignItems: 'flex-end', marginBottom: 10 },
  ownMessage: { justifyContent: 'flex-end', flexDirection: 'row' },
  otherMessage: { justifyContent: 'flex-start', flexDirection: 'row' },
  avatar: { width: 28, height: 28, borderRadius: 14, marginRight: 8, marginLeft: 0 },
  bubble: { borderRadius: 16, padding: 10, maxWidth: '80%' },
  ownBubble: { backgroundColor: '#007AFF', marginLeft: 40, marginRight: 0, alignSelf: 'flex-end' },
  otherBubble: { backgroundColor: '#f1f0f0', marginRight: 40, marginLeft: 0, alignSelf: 'flex-start' },
  messageText: { fontSize: 15 },
  ownMessageText: { color: '#fff' },
  time: { fontSize: 11, color: '#888', marginTop: 4, alignSelf: 'flex-end' },
  ownTime: { color: '#e0e0e0' },
  inputRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingTop: 6, paddingBottom: 6, borderTopWidth: 1, borderColor: '#eee', backgroundColor: '#fafafa', marginBottom: 0 },
  input: { flex: 1, fontSize: 16, backgroundColor: '#f5f5f5', borderRadius: 20, paddingHorizontal: 16, paddingTop: 12, paddingBottom: 20, marginRight: 8, marginBottom: 0 },
  sendButton: { backgroundColor: '#007AFF', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8 },
  sendText: { color: '#fff', fontWeight: 'bold' },
});
