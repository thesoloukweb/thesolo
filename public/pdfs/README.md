# PDF Menu Files

Bu klasör TheSolo Kitchen & Bar'ın menü PDF dosyalarını içerir.

## Gerekli PDF Dosyaları:

### 1. Breakfast & Brunch Menu
- **Dosya adı**: `breakfast-menu.pdf`
- **İçerik**: Kahvaltı ve brunch menüsü
- **Boyut**: A4 format önerilir

### 2. A La Carte Menu  
- **Dosya adı**: `alacarte-menu.pdf`
- **İçerik**: A la carte ana yemek menüsü
- **Boyut**: A4 format önerilir

### 3. Drinks & Cocktails Menu
- **Dosya adı**: `drinks-menu.pdf`
- **İçerik**: İçecekler ve kokteyl menüsü
- **Boyut**: A4 format önerilir
- **Not**: Bu menü "Featured" olarak işaretlenmiştir

### 4. BBQ Party Menu
- **Dosya adı**: `bbq-menu.pdf`
- **İçerik**: BBQ party menüsü
- **Boyut**: A4 format önerilir

### 5. Party Sharing Platter
- **Dosya adı**: `party-sharing-platter.pdf`
- **İçerik**: Party paylaşım tabağı menüsü
- **Boyut**: A4 format önerilir

### 6. Party Drinks Package
- **Dosya adı**: `party-drinks-package.pdf`
- **İçerik**: Party içecek paketi menüsü
- **Boyut**: A4 format önerilir

### 7. Christmas Party
- **Dosya adı**: `christmas-party.pdf`
- **İçerik**: Noel party menüsü
- **Boyut**: A4 format önerilir

### 8. Events Brochure
- **Dosya adı**: `events-brochure.pdf`
- **İçerik**: Etkinlik alanları broşürü (Rooftop Terrace, Private Dining, Bar & Lounge, vb.)
- **Boyut**: A4 format önerilir
- **Kullanım**: Restaurant Gallery bölümünde "Events Brochure" butonu ile açılır

## Kullanım:

Menu section'ında 7 adet menu kartı carousel (kaydırma) sistemiyle gösterilir:
- **Görünür**: Aynı anda 4 kart görünür
- **Kaydırma**: "Next Menu" butonu veya indicator'lar ile kaydırılır
- **Auto-rotate**: 6 saniyede bir otomatik kaydırır
- **PDF Açma**: Herhangi bir karta tıklandığında ilgili PDF yeni pencerede açılır

### Carousel Mantığı:
- **Slide 0**: Kart 0, 1, 2, 3 görünür (Breakfast & Brunch başlıklı)
- **Slide 1**: Kart 1, 2, 3, 4 görünür (A La Carte başlıklı) 
- **Slide 2**: Kart 2, 3, 4, 5 görünür (Drinks başlıklı)
- **Slide 3**: Kart 3, 4, 5, 6 görünür (BBQ Party başlıklı)

### Teknik Detaylar:
- PDF dosyaları `public/pdfs/` klasöründe bulunmalıdır
- Dosyalar `window.open()` ile yeni pencerede açılır
- Pencere boyutu: 800x600 px
- Scroll ve resize özelliği aktif
- Carousel `transform: translateX()` ile çalışır

### Gerekli Görseller:
- `menu-1.jpg` - Breakfast & Brunch
- `menu-2.jpg` - A La Carte  
- `menu-3.jpg` - Drinks (Featured)
- `menu-4.jpg` - BBQ Party
- `menu-5.jpg` - Party Sharing Platter
- `menu-6.jpg` - Party Drinks Package
- `menu-7.jpg` - Christmas Party

### Önemli Notlar:
- PDF dosyalarının boyutu optimize edilmiş olmalıdır
- Dosya adları tam olarak yukarıdaki gibi olmalıdır
- PDF dosyaları web'de görüntülenebilir formatda olmalıdır
- Görseller `public/images/` klasöründe bulunmalıdır
