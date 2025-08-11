import React from 'react';
import { ScrollView, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const PRIMARY_BLUE = '#1E3A8A';

export default function TermsScreen() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <ScrollView contentContainerStyle={styles.container} style={{ flex: 1 }}>
        <Text style={styles.title}>Terms and Conditions</Text>

        <Text style={styles.sectionTitle}>1. Acceptance of Terms</Text>
        <Text style={styles.text}>
          By creating an account or using Journalyze, you agree to be bound by these Terms and Conditions. If you do not agree, please do not use the app.
        </Text>

        <Text style={styles.sectionTitle}>2. User Accounts</Text>
        <Text style={styles.text}>
          You are responsible for maintaining the confidentiality of your account and password. You agree to provide accurate and complete information and to update it as necessary.
        </Text>

        <Text style={styles.sectionTitle}>3. Content</Text>
        <Text style={styles.text}>
          You retain ownership of the content you post on Journalyze. By posting, you grant Journalyze a non-exclusive, royalty-free license to use, display, and distribute your content within the app. You are responsible for the legality and appropriateness of your content.
        </Text>

        <Text style={styles.sectionTitle}>4. Prohibited Conduct</Text>
        <Text style={styles.text}>
          You agree not to use Journalyze to post or share content that is unlawful, harmful, threatening, abusive, harassing, defamatory, vulgar, obscene, or otherwise objectionable. Journalyze reserves the right to remove content and suspend accounts that violate these terms.
        </Text>

        <Text style={styles.sectionTitle}>5. Privacy</Text>
        <Text style={styles.text}>
          Your privacy is important to us. Please review our Privacy Policy to understand how we collect, use, and protect your information.
        </Text>

        <Text style={styles.sectionTitle}>6. Modifications</Text>
        <Text style={styles.text}>
          Journalyze reserves the right to modify these Terms and Conditions at any time. Continued use of the app after changes constitutes acceptance of the new terms.
        </Text>

        <Text style={styles.sectionTitle}>7. Disclaimer</Text>
        <Text style={styles.text}>
          Journalyze is provided on an "as is" and "as available" basis. We do not guarantee that the app will be error-free or uninterrupted.
        </Text>

        <Text style={styles.sectionTitle}>8. Contact</Text>
        <Text style={styles.text}>
          If you have any questions about these Terms and Conditions, please contact us at support@journalyze.com.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
  },
  title: {
    fontWeight: 'bold',
    fontSize: 22,
    color: PRIMARY_BLUE,
    marginBottom: 18,
    textAlign: 'center',
  },
  sectionTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    color: PRIMARY_BLUE,
    marginTop: 18,
    marginBottom: 4,
  },
  text: {
    fontSize: 15,
    color: '#222',
    marginBottom: 10,
    lineHeight: 22,
  },
});
