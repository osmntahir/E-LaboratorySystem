
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

## Ekran Görüntüleri

### Admin Paneli

<div align="center">
  <img src="https://github.com/user-attachments/assets/857f610a-a04f-4c7a-af20-4ba753ca5b07" alt="Screenshot 1" width="30%" style="margin: 10px;">
  <img src="https://github.com/user-attachments/assets/af28e5ed-8827-455c-9ec0-510ed96dc8cd" alt="Screenshot 2" width="30%" style="margin: 10px;">
  <img src="https://github.com/user-attachments/assets/0c1d707c-c8e7-41c9-85f6-ba54f55c2fca" alt="Screenshot 3" width="30%" style="margin: 10px;">
</div>

<div align="center">
  <img src="https://github.com/user-attachments/assets/5457937c-dfec-4afa-8a0e-8ef5889266a5" alt="Screenshot 4" width="30%" style="margin: 10px;">
  <img src="https://github.com/user-attachments/assets/9a2c6319-b6c0-4573-80ab-8a223b4aebdf" alt="Screenshot 5" width="30%" style="margin: 10px;">
  <img src="https://github.com/user-attachments/assets/2f4fd057-fbbe-4b64-af5e-ccd5eba1afd6" alt="Screenshot 6" width="30%" style="margin: 10px;">
</div>

<div align="center">
  <img src="https://github.com/user-attachments/assets/5be6322e-e04e-4774-9144-64ad9f820287" alt="Screenshot 7" width="30%" style="margin: 10px;">
  <img src="https://github.com/user-attachments/assets/38ea7857-207d-4d3a-b100-1faa4fa36636" alt="Screenshot 8" width="30%" style="margin: 10px;">
  <img src="https://github.com/user-attachments/assets/b04bac67-efea-482b-bd1d-9d54ac87e09c" alt="Screenshot 9" width="30%" style="margin: 10px;">
</div>

<div align="center">
  <img src="https://github.com/user-attachments/assets/9b433a35-c926-4b45-aec7-a105f38c4485" alt="Screenshot 10" width="30%" style="margin: 10px;">
  <img src="https://github.com/user-attachments/assets/525cb25c-81d3-4ddc-86a9-ff3316cf5fd2" alt="Screenshot 11" width="30%" style="margin: 10px;">
  <img src="https://github.com/user-attachments/assets/9bdddfde-e8e5-444a-984a-4f2043cf27a2" alt="Screenshot 12" width="30%" style="margin: 10px;">
</div>



### Hasta Paneli

<div align="center">
  <img src="https://github.com/user-attachments/assets/5514d289-dcf1-4cb6-8293-c66654270502" alt="Screenshot 13" width="30%" style="margin: 10px;">
  <img src="https://github.com/user-attachments/assets/6927472d-918c-47c0-b0ab-d267d31dbc1e" alt="Screenshot 14" width="30%" style="margin: 10px;">
  <img src="https://github.com/user-attachments/assets/491f7d74-a4bc-4675-927c-555591c98ae5" alt="Screenshot 15" width="30%" style="margin: 10px;">
</div>

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


