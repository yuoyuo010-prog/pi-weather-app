import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ActivityIndicator } from 'react-native';
import * as Location from 'expo-location';

export default function App() {
  const [weather, setWeather] = useState(null);
  const [piPrice, setPiPrice] = useState('0.00');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  // أدخل مفتاح OpenWeatherMap هنا
  const API_KEY = "365e6a4539ab091e88bd28b8cf41f60c";

  const fetchData = async () => {
    setLoading(true);
    setErrorMsg(null);

    try {
      // 1. طلب صلاحيات الموقع الجغرافي
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('تم رفض صلاحية الوصول للموقع');
        setLoading(false);
        return;
      }

      // 2. جلب الموقع الحالي
      let location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;

      // 3. جلب بيانات الطقس
      const weatherRes = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=metric&lang=ar&appid=${API_KEY}`
      );
      const weatherData = await weatherRes.json();

      // 4. جلب سعر Pi
      const piRes = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=pi-network-iou&vs_currencies=usd');
      const piData = await piRes.json();

      setWeather({
        city: weatherData.name,
        temp: Math.round(weatherData.main.temp),
        feelsLike: Math.round(weatherData.main.feels_like),
        wind: weatherData.wind.speed,
        desc: weatherData.weather[0].description,
      });

      if (piData['pi-network-iou']) {
        setPiPrice(piData['pi-network-iou'].usd);
      }
    } catch (error) {
      setErrorMsg('حدث خطأ أثناء جلب البيانات');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>مشروع تطبيق الطقس & Pi</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#8A2BE2" />
      ) : errorMsg ? (
        <Text style={styles.error}>{errorMsg}</Text>
      ) : weather ? (
        <View style={styles.card}>
          <Text style={styles.city}>{weather.city}</Text>
          <Text style={styles.temp}>{weather.temp}°C</Text>
          <Text style={styles.desc}>{weather.desc}</Text>

          <View style={styles.row}>
            <Text style={styles.details}>الملموسة: {weather.feelsLike}°C</Text>
            <Text style={styles.details}>الرياح: {weather.wind} م/ث</Text>
          </View>

          <View style={styles.divider} />

          <Text style={styles.piPrice}>سعر Pi الحالي: ${piPrice}</Text>
        </View>
      ) : null}

      <TouchableOpacity style={styles.button} onPress={fetchData}>
        <Text style={styles.buttonText}>تحديث البيانات</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212', alignItems: 'center', justifyContent: 'center', padding: 20 },
  header: { fontSize: 20, color: '#fff', marginBottom: 20, fontWeight: 'bold' },
  card: { backgroundColor: '#1E1E2C', padding: 20, borderRadius: 15, width: '100%', alignItems: 'center' },
  city: { fontSize: 22, color: '#fff', fontWeight: 'bold' },
  temp: { fontSize: 48, color: '#FFD700', fontWeight: 'bold' },
  desc: { fontSize: 16, color: '#aaa', marginBottom: 10 },
  row: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginTop: 10 },
  details: { color: '#ccc', fontSize: 14 },
  divider: { height: 1, backgroundColor: '#333', width: '100%', marginVertical: 15 },
  piPrice: { fontSize: 16, color: '#8A2BE2', fontWeight: 'bold' },
  button: { marginTop: 20, backgroundColor: '#8A2BE2', padding: 12, borderRadius: 8 },
  buttonText: { color: '#fff', fontWeight: 'bold' },
  error: { color: '#ff5555', fontSize: 16 }
});
