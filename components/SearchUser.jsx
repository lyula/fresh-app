import React, { useState } from 'react';
import { View, TextInput, StyleSheet, FlatList, TouchableOpacity, Text } from 'react-native';

// Dummy data for demonstration; replace with real user search results
const dummyUsers = [
  { id: '1', name: 'Alice' },
  { id: '2', name: 'Bob' },
  { id: '3', name: 'Charlie' },
  { id: '4', name: 'Diana' },
  { id: '5', name: 'Eve' },
];

export default function SearchUser({ onUserSelect }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);

  const handleSearch = (text) => {
    setQuery(text);
    // Simulate search (replace with real API call)
    if (text.trim() === '') {
      setResults([]);
    } else {
      setResults(dummyUsers.filter(u => u.name.toLowerCase().includes(text.toLowerCase())));
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Search users..."
        value={query}
        onChangeText={handleSearch}
        autoCapitalize="none"
        autoCorrect={false}
      />
      {results.length > 0 && (
        <FlatList
          data={results}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.resultItem} onPress={() => onUserSelect?.(item)}>
              <Text style={styles.resultText}>{item.name}</Text>
            </TouchableOpacity>
          )}
          style={styles.resultsList}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ececec',
  },
  resultsList: {
    marginTop: 6,
    maxHeight: 180,
    borderRadius: 10,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ececec',
  },
  resultItem: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ececec',
  },
  resultText: {
    fontSize: 16,
    color: '#222',
  },
});
