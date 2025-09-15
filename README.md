# 🪨 Crystal App (StoneApp)

Modern, hızlı ve AI destekli bir kristal ve taş koleksiyonu uygulaması. Expo/React Native ile geliştirilmiştir.

## 🚀 Özellikler
- **Koleksiyon Yönetimi:** Kristal ve taş ekle, favorilere al, filtrele ve ara.
- **AI Taş Analizi:** Fotoğraf çekerek veya galeriden seçerek taşları OpenAI GPT-4 Vision ile analiz et.
- **Kamera Desteği:** Uygulama içinden fotoğraf çekimi ve galeri seçimi.
- **Tema Desteği:** Koyu/açık mod.
- **Kullanıcı Girişi:** E-posta ile kayıt/oturum açma, misafir modu, çıkış.
- **Veri Saklama:** AsyncStorage ile offline koleksiyon ve ayarlar.
- **Hata Yönetimi & Analytics:** Crash reporting, kullanıcı aksiyon takibi.
- **Güvenli API Key Yönetimi:** OpenAI API anahtarı ekleme/kaldırma.
- **Güzel UI:** Animasyonlu splash screen, modern ve hızlı arayüz.

## 📦 Kurulum
```bash
# Bağımlılıkları yükle
npm install

# Geliştirme sunucusunu başlat
npm start
```

## 📱 Test
- **Expo Go ile:** QR kodu tarayarak temel özellikleri test edebilirsin.
- **Emülatör/cihazda:** Kamera ve AI analizi dahil tüm özellikler için development build önerilir.

## 🛠️ Kullanılan Teknolojiler
- React Native 0.79.5
- Expo SDK 53
- TypeScript 5.8
- @react-navigation
- expo-camera, expo-image-picker
- OpenAI GPT-4 Vision API

## 📂 Klasör Yapısı
```
crystalfixed/
├── App.tsx
├── app.json
├── assets/
├── components/
├── config/
├── contexts/
├── data/
├── hooks/
├── navigation/
├── screens/
├── services/
├── types/
├── utils/
```

## 🔒 Çevresel Değişkenler
- `.env.production` ve `.env.development` dosyalarını doldurmayı unutma.

## 📝 Katkı
Pull request ve issue açarak katkıda bulunabilirsin!

## 📄 Lisans
MIT

---

**Crystal App** ile taş koleksiyonunu dijitalleştir, AI ile analiz et, modern mobil deneyimi yaşa!
