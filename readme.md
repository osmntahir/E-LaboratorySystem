
# E-Lab Yönetim Sistemi

## Proje Özeti

E-Lab Yönetim Sistemi, modern bir laboratuvar yönetim platformudur. Bu sistem, doktorlar ve hastalar için kullanıcı dostu bir arayüz sunarak, laboratuvar süreçlerini dijitalleştirir ve verimliliği artırır. Doktorlar, hastaların tahlil sonuçlarını görüntüleyebilir, yeni sonuçlar ekleyebilir ve kılavuzlar üzerinden değerlendirme yapabilir. Hastalar ise kendi test sonuçlarını inceleyebilir, geçmiş verileri görebilir ve grafiksel analizlerle sağlık durumlarını takip edebilir.

### Projenin Amacı

Bu projenin amacı, laboratuvar süreçlerini dijitalleştirerek hızlı, güvenilir ve kullanıcı dostu bir çözüm sunmaktır. Proje, hem kullanıcı deneyimini iyileştirmek hem de laboratuvarların yönetim süreçlerini optimize etmek için tasarlanmıştır.

---

## Yapılanlar

### Yönetici Modülü (Admin)

- **Kontrol Paneli**: Yöneticiye hasta ve test sayısı gibi istatistikleri canlı olarak gösterir.
- **Hasta Yönetimi**: Yeni hasta ekleme, mevcut hastaları düzenleme ve silme işlemleri yapılabilir.
- **Test Sonuçları Yönetimi**: Hastalara ait test sonuçlarını ekleme, düzenleme ve kılavuzlara göre analiz etme.
- **Kılavuz Yönetimi**: Laboratuvar test kılavuzlarını yönetme (oluşturma, güncelleme ve silme).

### Hasta Modülü (User)

- **Test Geçmişi Görüntüleme**: Hasta, geçmiş test sonuçlarını liste şeklinde görebilir.
- **Grafiksel Analiz**: Test sonuçlarının zaman içindeki değişimlerini grafikler üzerinde analiz edebilir.
- **Profil Yönetimi**: Kullanıcı, kişisel bilgilerini görüntüleyebilir ve düzenleyebilir.

---

## Kullanılan Teknolojiler

### Frontend

- **React Native**: Hem iOS hem de Android cihazları destekleyen kullanıcı arayüzü geliştirme.
- **React Native Paper**: Modern ve kullanıcı dostu tasarımlar için UI bileşenleri.

### Backend

- **Firebase Firestore**: Veritabanı olarak kullanıldı. Gerçek zamanlı veri senkronizasyonu sağlar.
- **Firebase Authentication**: Kullanıcı kimlik doğrulama işlemleri.

---

## Klasör Hiyerarşisi

```
src/
├── components/           # Tekrar kullanılabilir React Native bileşenleri
├── context/              # Uygulama genelinde kullanılan Context API
├── screens/              # Uygulama ekranları
│   ├── admin/            # Yöneticiye özel ekranlar
│   ├── users/            # Kullanıcılara özel ekranlar
│   ├── auth/             # Giriş ve kayıt ekranları
├── services/             # Firebase ve diğer API çağrıları
├── styles/               # Ortak stiller
├── utils/                # Yardımcı fonksiyonlar
firebaseConfig.js         # Firebase yapılandırması
App.js                    # Ana uygulama dosyası
```

## Kurulum

### Gereksinimler

- Node.js
- Expo CLI
- Firebase hesabı

### Adımlar

1. Depoyu klonlayın:
   ```bash
   git clone https://github.com/osmntahir/E-LaboratorySystem.git
   cd E-LaboratorySystem
   ```

2. Bağımlılıkları yükleyin:
   ```bash
   npm install
   ```

3. Firebase yapılandırmasını tamamlayın ve `firebaseConfig.js` dosyasını düzenleyin.

4. Uygulamayı çalıştırın:
   ```bash
   npx expo start
   ```

---


