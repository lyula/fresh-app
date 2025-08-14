import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Image, ActivityIndicator, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { COUNTRIES } from '../utils/countries';
import { COUNTRY_CURRENCIES, getUserCurrency, convertFromUSD, formatCurrency } from '../utils/currency';
import { getFlagEmoji } from '../utils/countryData';

const FINANCE_CPM_USD = 10.00;
const CATEGORIES = [
  "Finance", "Education", "Technology", "Health", "Lifestyle", "Trading", "Forex", "Crypto", "Events", "Jobs"
];
const TARGET_USERBASE_OPTIONS = [
  { value: "1000", label: "1,000 - 10,000 users (Small audience)", multiplier: 1 },
  { value: "10000", label: "10,000 - 50,000 users (Medium audience)", multiplier: 1.3 },
  { value: "50000", label: "50,000 - 200,000 users (Large audience)", multiplier: 1.8 },
  { value: "200000", label: "200,000 - 1M users (Very large audience)", multiplier: 2.5 },
  { value: "1000000", label: "1M+ users (Maximum reach)", multiplier: 3.2 },
];

export default function AdCreationScreen() {
  const navigation = useNavigation();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [whatsappCountryCode, setWhatsappCountryCode] = useState(COUNTRIES[0]?.code || "");
  const [showWhatsappCodeDropdown, setShowWhatsappCodeDropdown] = useState(false);
  const [countryQuery, setCountryQuery] = useState("");
  const [contactMethod, setContactMethod] = useState("link");
  const [selectedCountries, setSelectedCountries] = useState([]);
  const [duration, setDuration] = useState(1);
  const [targetUserbase, setTargetUserbase] = useState("");
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showUserbaseDropdown, setShowUserbaseDropdown] = useState(false);
  const [countryList, setCountryList] = useState(COUNTRIES);
  const [userCountry, setUserCountry] = useState("United States");
  const [exchangeRates, setExchangeRates] = useState({ USD: 1 });
  const [ratesLoading, setRatesLoading] = useState(false);
  const [currencyMode, setCurrencyMode] = useState('local');
  const [isGlobalTargeting, setIsGlobalTargeting] = useState(false);
  const [image, setImage] = useState("");
  const [video, setVideo] = useState("");
  const [previewType, setPreviewType] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState("");
  const [uploadPercentage, setUploadPercentage] = useState(0);

  useEffect(() => {
    // Fetch exchange rates from API
    async function fetchRates() {
      setRatesLoading(true);
      try {
        const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
        const data = await response.json();
        if (data.rates) setExchangeRates(data.rates);
      } catch (e) {
        setExchangeRates({ USD: 1 });
      } finally {
        setRatesLoading(false);
      }
    }
    fetchRates();
  }, []);

  // Calculation logic
  const calculatePayment = () => {
    if (!targetUserbase) return 0;
    const targetOption = TARGET_USERBASE_OPTIONS.find(option => option.value === targetUserbase);
    const audienceSize = targetOption ? Number(targetOption.value) : 1000;
    const estimatedViews = audienceSize * duration;
    return (estimatedViews / 1000) * FINANCE_CPM_USD;
  };
  const payment = calculatePayment();
  const targetOption = TARGET_USERBASE_OPTIONS.find(option => option.value === targetUserbase);
  const audienceSize = targetOption ? Number(targetOption.value) : 0;
  const estimatedViews = audienceSize * duration;

  // Media picker
  async function pickMedia(type) {
    let result;
    if (type === 'image') {
      result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.8 });
      if (!result.cancelled) {
        setImage(result.assets[0].uri);
        setVideo("");
        setPreviewType('image');
      }
    } else {
      result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Videos });
      if (!result.cancelled) {
        setVideo(result.assets[0].uri);
        setImage("");
        setPreviewType('video');
      }
    }
  }
  function removeMedia() {
    setImage("");
    setVideo("");
    setPreviewType("");
  }

  // Country selection
  function handleAddCountry(name) {
    if (!selectedCountries.includes(name)) {
      setSelectedCountries([...selectedCountries, name]);
      setCountryQuery("");
    }
  }
  function handleRemoveCountry(name) {
    setSelectedCountries(selectedCountries.filter((c) => c !== name));
  }

  // Form submission
  function handleSubmit() {
    // TODO: Implement API call
    navigation.goBack();
  }

  // Filter countries
  const filteredCountries = countryQuery
    ? countryList.filter(
        (c) =>
          c.name.toLowerCase().includes(countryQuery.toLowerCase()) &&
          !selectedCountries.includes(c.name)
      )
    : countryList.filter((c) => !selectedCountries.includes(c.name));

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Create a New Ad</Text>
        <Text style={styles.desc}>Fill in the details below to create and run your advertisement.</Text>
        {/* Title */}
        <TextInput style={styles.input} placeholder="Ad Title" value={title} onChangeText={setTitle} />
        {/* Description */}
        <TextInput style={[styles.input, {height: 80}]} placeholder="Description" value={description} onChangeText={setDescription} multiline />
        {/* Category Dropdown */}
        <Text style={styles.label}>Category</Text>
        <View style={styles.dropdownWrap}>
          <TouchableOpacity onPress={() => setShowCategoryDropdown(!showCategoryDropdown)} style={styles.dropdown} activeOpacity={0.8}>
            <Text style={{color: category ? '#222' : '#888'}}>{category || 'Select category'}</Text>
          </TouchableOpacity>
          {showCategoryDropdown && (
            <View style={styles.dropdownListAbsolute}>
              {CATEGORIES.map(cat => (
                <TouchableOpacity key={cat} style={styles.dropdownItem} onPress={() => { setCategory(cat); setShowCategoryDropdown(false); }}>
                  <Text>{cat}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
        {/* Media Upload */}
        <Text style={styles.label}>Ad Media (Required)</Text>
        <View style={{flexDirection: 'row', gap: 8, marginBottom: 8}}>
          <TouchableOpacity style={[styles.mediaBtn, image && styles.mediaBtnActive]} onPress={() => pickMedia('image')} disabled={!!video}>
            <Text style={styles.mediaBtnText}>{image ? 'Change Image' : 'Upload Image'}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.mediaBtn, video && styles.mediaBtnActive]} onPress={() => pickMedia('video')} disabled={!!image}>
            <Text style={styles.mediaBtnText}>{video ? 'Change Video' : 'Upload Video'}</Text>
          </TouchableOpacity>
        </View>
        {(image || video) && (
          <View style={styles.previewBox}>
            <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
              <Text style={styles.previewLabel}>{previewType === 'video' ? 'Video Preview:' : 'Image Preview:'}</Text>
              <TouchableOpacity onPress={removeMedia}><Text style={styles.removeText}>Remove</Text></TouchableOpacity>
            </View>
            {image ? (
              <Image source={{uri: image}} style={styles.previewImg} resizeMode="cover" />
            ) : (
              <Video source={{uri: video}} style={styles.previewImg} controls />
            )}
          </View>
        )}
        {/* Contact Method */}
        <Text style={styles.label}>Contact Method</Text>
        <View style={{flexDirection: 'row', gap: 12, marginBottom: 8}}>
          <TouchableOpacity style={[styles.radioBtn, contactMethod === 'link' && styles.radioBtnActive]} onPress={() => setContactMethod('link')}><Text style={styles.radioText}>Link</Text></TouchableOpacity>
          <TouchableOpacity style={[styles.radioBtn, contactMethod === 'whatsapp' && styles.radioBtnActive]} onPress={() => setContactMethod('whatsapp')}><Text style={styles.radioText}>WhatsApp</Text></TouchableOpacity>
          <TouchableOpacity style={[styles.radioBtn, contactMethod === 'direct-message' && styles.radioBtnActive]} onPress={() => setContactMethod('direct-message')}><Text style={styles.radioText}>In-app DMs</Text></TouchableOpacity>
        </View>
        {contactMethod === 'link' && (
          <TextInput style={styles.input} placeholder="Destination URL" value={linkUrl} onChangeText={setLinkUrl} />
        )}
        {contactMethod === 'whatsapp' && (
          <View style={{flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8}}>
            <TextInput
              style={[styles.input, {width: 100}]}
              placeholder="Code"
              value={whatsappCountryCode}
              onChangeText={setWhatsappCountryCode}
              keyboardType="number-pad"
            />
            <TextInput style={[styles.input, {flex: 1}]} placeholder="WhatsApp number" value={whatsappNumber} onChangeText={setWhatsappNumber} keyboardType="phone-pad" />
          </View>
        )}
        {/* Targeting Type */}
        <Text style={styles.label}>Targeting Type</Text>
        <View style={{flexDirection: 'row', gap: 12, marginBottom: 8}}>
          <TouchableOpacity style={[styles.radioBtn, !isGlobalTargeting && styles.radioBtnActive]} onPress={() => {setIsGlobalTargeting(false); setSelectedCountries([]);}}><Text style={styles.radioText}>Specific Countries</Text></TouchableOpacity>
          <TouchableOpacity style={[styles.radioBtn, isGlobalTargeting && styles.radioBtnActive]} onPress={() => {setIsGlobalTargeting(true); setSelectedCountries([]);}}><Text style={styles.radioText}>Global</Text></TouchableOpacity>
        </View>
        {!isGlobalTargeting && (
          <View style={{marginBottom: 8}}>
            <TextInput style={styles.input} placeholder="Search country..." value={countryQuery} onChangeText={setCountryQuery} />
            <View style={{flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginBottom: 4}}>
              {selectedCountries.map(name => (
                <View key={name} style={styles.countryTag}>
                  <Text>{getFlagEmoji(COUNTRIES.find(c => c.name === name)?.code)} {name}</Text>
                  <TouchableOpacity onPress={() => handleRemoveCountry(name)}><Text style={styles.removeText}>×</Text></TouchableOpacity>
                </View>
              ))}
            </View>
            {filteredCountries.length > 0 && countryQuery.length > 0 && (
              <View style={styles.suggestionBox}>
                {filteredCountries.slice(0, 10).map(c => (
                  <TouchableOpacity key={c.name} style={styles.suggestionItem} onPress={() => handleAddCountry(c.name)}>
                    <Text>{getFlagEmoji(c.code)} {c.name} (Tier {c.tier})</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        )}
        {/* Duration */}
        <Text style={styles.label}>Duration (days)</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter duration in days"
          value={duration === 0 ? '' : duration.toString()}
          onChangeText={v => {
            const num = Number(v);
            if (v === '') {
              setDuration(0);
            } else if (!isNaN(num) && num > 0) {
              setDuration(num);
            }
          }}
          keyboardType="numeric"
        />
        {/* Target Userbase Dropdown */}
        <Text style={styles.label}>Target Userbase</Text>
        <View style={styles.dropdownWrap}>
          <TouchableOpacity onPress={() => setShowUserbaseDropdown(!showUserbaseDropdown)} style={styles.dropdown} activeOpacity={0.8}>
            <Text style={{color: targetUserbase ? '#222' : '#888'}}>{TARGET_USERBASE_OPTIONS.find(opt => opt.value === targetUserbase)?.label || 'Select target audience size'}</Text>
          </TouchableOpacity>
          {showUserbaseDropdown && (
            <View style={styles.dropdownListAbsolute}>
              {TARGET_USERBASE_OPTIONS.map(opt => (
                <TouchableOpacity key={opt.value} style={styles.dropdownItem} onPress={() => { setTargetUserbase(opt.value); setShowUserbaseDropdown(false); }}>
                  <Text>{opt.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
        {/* Payment Calculation */}
        <View style={styles.paymentBox}>
          <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
            <Text style={styles.label}>Total Payment ({currencyMode === 'local' ? getUserCurrency(userCountry).code : 'USD'})</Text>
            <TouchableOpacity onPress={() => setCurrencyMode(currencyMode === 'local' ? 'usd' : 'local')} style={styles.toggleBtn} disabled={ratesLoading}>
              <Text style={styles.toggleText}>{currencyMode === 'local' ? 'Show in USD' : `Show in ${getUserCurrency(userCountry).code}`}</Text>
            </TouchableOpacity>
          </View>
          <TextInput style={styles.input} value={ratesLoading ? 'Loading...' : formatCurrency(payment, currencyMode, userCountry, exchangeRates)} editable={false} />
          <Text style={styles.paymentDesc}>CPM-based pricing: ${FINANCE_CPM_USD.toFixed(2)} per 1,000 views. Estimated views: {estimatedViews.toLocaleString()}. Price calculation: (Estimated Views / 1,000) × CPM.</Text>
        </View>
        {/* Submit */}
        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit} disabled={isUploading || (!image && !video)}>
          <Text style={styles.submitText}>{isUploading ? 'Uploading...' : 'Create Ad'}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: '#f7f8fa', padding: 16 },
  backButton: { alignSelf: 'flex-start', marginBottom: 12, paddingVertical: 6, paddingHorizontal: 12, borderRadius: 8, backgroundColor: '#e3e7ed' },
  backText: { fontSize: 16, color: '#2d6cdf', fontWeight: 'bold' },
  card: { width: '100%', backgroundColor: '#fff', borderRadius: 16, padding: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 2, marginBottom: 24 },
  title: { fontSize: 20, fontWeight: 'bold', color: '#222', marginBottom: 8, textAlign: 'center' },
  desc: { fontSize: 15, color: '#555', marginBottom: 12, textAlign: 'center' },
  label: { fontSize: 15, color: '#555', fontWeight: '500', marginBottom: 4 },
  input: { backgroundColor: '#f0f2f5', borderRadius: 8, padding: 12, marginBottom: 12, fontSize: 15, color: '#222' },
  catBtn: { backgroundColor: '#e3e7ed', borderRadius: 20, paddingVertical: 8, paddingHorizontal: 16, marginRight: 8 },
  catBtnActive: { backgroundColor: '#a99d6b' },
  catText: { color: '#555', fontSize: 15 },
  catTextActive: { color: '#fff', fontWeight: 'bold' },
  mediaBtn: { flex: 1, backgroundColor: '#e3e7ed', borderRadius: 8, paddingVertical: 12, alignItems: 'center' },
  mediaBtnActive: { backgroundColor: '#a99d6b' },
  mediaBtnText: { color: '#555', fontWeight: 'bold' },
  previewBox: { backgroundColor: '#f0f2f5', borderRadius: 8, padding: 8, marginBottom: 12 },
  previewLabel: { fontSize: 14, color: '#555', marginBottom: 4 },
  previewImg: { width: '100%', height: 160, borderRadius: 8, backgroundColor: '#ddd' },
  removeText: { color: '#e74c3c', fontWeight: 'bold', marginLeft: 8 },
  radioBtn: { backgroundColor: '#e3e7ed', borderRadius: 20, paddingVertical: 8, paddingHorizontal: 16 },
  radioBtnActive: { backgroundColor: '#a99d6b' },
  radioText: { color: '#555', fontSize: 15 },
  countryTag: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#e3e7ed', borderRadius: 16, paddingHorizontal: 8, paddingVertical: 4, marginRight: 4, marginBottom: 4 },
  suggestionBox: { backgroundColor: '#fff', borderRadius: 8, padding: 8, marginBottom: 8, elevation: 2 },
  suggestionItem: { paddingVertical: 6 },
  paymentBox: { backgroundColor: '#f0f2f5', borderRadius: 8, padding: 12, marginBottom: 12 },
  paymentDesc: { fontSize: 13, color: '#888', marginTop: 4 },
  toggleBtn: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, backgroundColor: '#e3e7ed' },
  toggleText: { color: '#a99d6b', fontWeight: 'bold' },
  submitButton: { backgroundColor: '#a99d6b', borderRadius: 8, paddingVertical: 14, alignItems: 'center', marginTop: 8 },
  submitText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  dropdownWrap: { marginBottom: 12 },
  dropdown: { backgroundColor: '#f0f2f5', borderRadius: 8, padding: 12, fontSize: 15, color: '#222' },
  dropdownList: { backgroundColor: '#fff', borderRadius: 8, marginTop: 2, elevation: 2 },
  dropdownListAbsolute: { position: 'absolute', top: 52, left: 0, right: 0, zIndex: 10, backgroundColor: '#fff', borderRadius: 8, elevation: 4 },
  dropdownItem: { padding: 12, borderBottomWidth: 1, borderBottomColor: '#eee' },
});
