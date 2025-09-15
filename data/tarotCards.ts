// Tarot kartı veri yapısı
export interface TarotCard {
  id: string;
  number: number;
  name: string;
  nameEn: string;
  keywords: string[];
  uprightMeaning: string[];
  reversedMeaning: string[];
  symbols: string[];
  description: string;
  element?: string;
  planet?: string;
  zodiac?: string;
  imageUrl?: string;
}

// 22 Major Arcana Kartları
export const majorArcana: TarotCard[] = [
  {
    id: '0',
    number: 0,
    name: 'Deli',
    nameEn: 'The Fool',
    keywords: ['Yeni başlangıçlar', 'Masumiyet', 'Spontanlık', 'Özgür ruh'],
    uprightMeaning: [
      'Yeni bir yolculuğa çıkma zamanı',
      'Risk alma ve maceraya atılma',
      'Saf potansiyel ve sınırsız olasılıklar',
      'İçgüdülere güvenme'
    ],
    reversedMeaning: [
      'Düşüncesizce hareket etme',
      'Aşırı risk alma',
      'Planlamadan hareket etme',
      'Naivlik ve deneyimsizlik'
    ],
    symbols: ['Uçurum', 'Beyaz gül', 'Köpek', 'Dağlar', 'Güneş'],
    description: 'Deli kartı, yeni başlangıçları ve sınırsız potansiyeli temsil eder. Hayatın büyük macerasına atılma zamanının geldiğini gösterir.',
    element: 'Hava',
    planet: 'Uranüs'
  },
  {
    id: '1',
    number: 1,
    name: 'Büyücü',
    nameEn: 'The Magician',
    keywords: ['Manifestasyon', 'Güç', 'Beceri', 'Konsantrasyon'],
    uprightMeaning: [
      'Hedeflerinizi gerçekleştirme gücü',
      'Yaratıcılık ve yetenek',
      'Odaklanma ve kararlılık',
      'Kaynaklarınızı etkili kullanma'
    ],
    reversedMeaning: [
      'Manipülasyon ve aldatma',
      'Yeteneklerin kötüye kullanımı',
      'Odak eksikliği',
      'Güç arayışında kaybolma'
    ],
    symbols: ['Sonsuzluk işareti', 'Değnek', 'Kupa', 'Kılıç', 'Pentagram'],
    description: 'Büyücü kartı, kişinin iç gücünü ve manifestasyon yeteneğini temsil eder. Hedeflerinize ulaşmak için gerekli araçlara sahip olduğunuzu gösterir.',
    element: 'Hava',
    planet: 'Merkür'
  },
  {
    id: '2',
    number: 2,
    name: 'Yüksek Rahibe',
    nameEn: 'The High Priestess',
    keywords: ['Sezgi', 'Gizem', 'Bilinçaltı', 'İç bilgelik'],
    uprightMeaning: [
      'İç sesinizi dinleme zamanı',
      'Sezgilerinize güvenme',
      'Gizli bilgilere erişim',
      'Ruhsal gelişim ve meditasyon'
    ],
    reversedMeaning: [
      'Sezgileri görmezden gelme',
      'İç sesle bağlantı kopukluğu',
      'Gizli bilgilerin yanlış kullanımı',
      'Ruhsal blokajlar'
    ],
    symbols: ['Ay', 'Pomegranate', 'Haç', 'Tora', 'Su'],
    description: 'Yüksek Rahibe kartı, iç bilgelik ve sezgisel gücü temsil eder. Cevapların içinizde olduğunu ve sessizlikte dinlemeniz gerektiğini gösterir.',
    element: 'Su',
    planet: 'Ay'
  },
  {
    id: '3',
    number: 3,
    name: 'İmparatoriçe',
    nameEn: 'The Empress',
    keywords: ['Bereket', 'Yaratıcılık', 'Doğa', 'Annelik'],
    uprightMeaning: [
      'Bolluk ve bereket dönemi',
      'Yaratıcı projelerde başarı',
      'Doğayla bağlantı kurma',
      'Besleyici ve koruyucu enerji'
    ],
    reversedMeaning: [
      'Yaratıcı blokajlar',
      'Aşırı koruyuculuk',
      'Maddi kaygılar',
      'Doğayla bağlantı kopukluğu'
    ],
    symbols: ['Buğday', 'Venüs işareti', 'Taç', 'Nehir', 'Yastık'],
    description: 'İmparatoriçe kartı, doğanın bereketini ve yaratıcı gücü temsil eder. Hayatınızda bolluk ve büyüme döneminin başladığını gösterir.',
    element: 'Toprak',
    planet: 'Venüs'
  },
  {
    id: '4',
    number: 4,
    name: 'İmparator',
    nameEn: 'The Emperor',
    keywords: ['Otorite', 'Yapı', 'Kontrol', 'Liderlik'],
    uprightMeaning: [
      'Liderlik pozisyonunda olma',
      'Düzen ve yapı kurma',
      'Otoriteyi doğru kullanma',
      'Kararlı ve güçlü duruş'
    ],
    reversedMeaning: [
      'Aşırı kontrol ve baskı',
      'Otoritenin kötüye kullanımı',
      'Katılık ve esneklik eksikliği',
      'Güç mücadelesi'
    ],
    symbols: ['Taht', 'Koç kafası', 'Orb', 'Dağlar', 'Zırh'],
    description: 'İmparator kartı, liderlik ve otoriteyi temsil eder. Hayatınızda düzen kurma ve sorumluluklarınızı üstlenme zamanının geldiğini gösterir.',
    element: 'Ateş',
    zodiac: 'Koç'
  },
  {
    id: '5',
    number: 5,
    name: 'Hierophant',
    nameEn: 'The Hierophant',
    keywords: ['Gelenek', 'Ruhsal rehberlik', 'Öğretim', 'Konformizm'],
    uprightMeaning: [
      'Ruhsal öğretim ve rehberlik',
      'Geleneksel değerlere saygı',
      'Mentordan öğrenme',
      'Grup aidiyeti ve topluluk'
    ],
    reversedMeaning: [
      'Geleneklere karşı çıkma',
      'Kendi yolunu bulma isteği',
      'Dogmalara karşı duruş',
      'Ruhsal özgürlük arayışı'
    ],
    symbols: ['Anahtar', 'Haç', 'Taç', 'Sütunlar', 'Çiçekler'],
    description: 'Hierophant kartı, ruhsal öğretim ve geleneksel bilgeliği temsil eder. Bir mentor veya rehberden öğrenme zamanının geldiğini gösterir.',
    element: 'Toprak',
    zodiac: 'Boğa'
  },
  {
    id: '6',
    number: 6,
    name: 'Aşıklar',
    nameEn: 'The Lovers',
    keywords: ['Aşk', 'Seçim', 'Birlik', 'Uyum'],
    uprightMeaning: [
      'Derin aşk ve bağlılık',
      'Önemli bir seçim yapma',
      'Uyum ve denge',
      'Ruhsal birlik'
    ],
    reversedMeaning: [
      'İlişki problemleri',
      'Yanlış seçimler',
      'Uyumsuzluk ve çatışma',
      'Bağlılık eksikliği'
    ],
    symbols: ['Melek', 'Adem ve Havva', 'Ağaç', 'Dağ', 'Güneş'],
    description: 'Aşıklar kartı, aşk ve önemli seçimleri temsil eder. Hayatınızda önemli bir karar verme anının geldiğini gösterir.',
    element: 'Hava',
    zodiac: 'İkizler'
  },
  {
    id: '7',
    number: 7,
    name: 'Savaş Arabası',
    nameEn: 'The Chariot',
    keywords: ['Zafer', 'Kontrol', 'Kararlılık', 'İlerleme'],
    uprightMeaning: [
      'Hedeflere doğru ilerleme',
      'İrade gücü ve kararlılık',
      'Zorlukları aşma',
      'Başarı ve zafer'
    ],
    reversedMeaning: [
      'Kontrol kaybı',
      'Yön belirsizliği',
      'İç çatışmalar',
      'Motivasyon eksikliği'
    ],
    symbols: ['Savaş arabası', 'Sfenks', 'Yıldızlar', 'Şehir', 'Zırh'],
    description: 'Savaş Arabası kartı, kararlılık ve ilerlemeyi temsil eder. Hedeflerinize ulaşmak için gerekli gücün sizde olduğunu gösterir.',
    element: 'Su',
    zodiac: 'Yengeç'
  },
  {
    id: '8',
    number: 8,
    name: 'Güç',
    nameEn: 'Strength',
    keywords: ['İç güç', 'Cesaret', 'Sabır', 'Şefkat'],
    uprightMeaning: [
      'İç gücünüzü keşfetme',
      'Sabır ve dayanıklılık',
      'Şefkatle güç kullanma',
      'Korkuları yenme'
    ],
    reversedMeaning: [
      'Güvensizlik ve zayıflık',
      'Sabırsızlık',
      'İç çatışmalar',
      'Korkularla mücadele'
    ],
    symbols: ['Kadın', 'Aslan', 'Sonsuzluk işareti', 'Çiçekler', 'Dağlar'],
    description: 'Güç kartı, iç gücü ve şefkati temsil eder. Zorlukları şiddetle değil, sevgi ve sabrla aşabileceğinizi gösterir.',
    element: 'Ateş',
    zodiac: 'Aslan'
  },
  {
    id: '9',
    number: 9,
    name: 'Ermiş',
    nameEn: 'The Hermit',
    keywords: ['İç arayış', 'Bilgelik', 'Yalnızlık', 'Rehberlik'],
    uprightMeaning: [
      'İç dünyaya yolculuk',
      'Bilgelik arayışı',
      'Yalnızlıkta huzur bulma',
      'Ruhsal rehberlik'
    ],
    reversedMeaning: [
      'İzolasyon ve yalnızlık',
      'İç sesle bağlantı kopukluğu',
      'Rehberliği reddetme',
      'Kaybolmuşluk hissi'
    ],
    symbols: ['Fener', 'Değnek', 'Dağ', 'Yıldız', 'Gri sakal'],
    description: 'Ermiş kartı, iç arayış ve bilgeliği temsil eder. Cevapları bulmak için içe dönme zamanının geldiğini gösterir.',
    element: 'Toprak',
    zodiac: 'Başak'
  },
  {
    id: '10',
    number: 10,
    name: 'Kader Çarkı',
    nameEn: 'Wheel of Fortune',
    keywords: ['Kader', 'Döngü', 'Şans', 'Değişim'],
    uprightMeaning: [
      'Olumlu değişimler',
      'Şans ve fırsat',
      'Kaderin dönüşü',
      'Yeni döngünün başlangıcı'
    ],
    reversedMeaning: [
      'Kötü şans',
      'Kontrolsüz değişimler',
      'Olumsuz döngü',
      'Direniş ve takılma'
    ],
    symbols: ['Çark', 'Sfenks', 'Yılan', 'Anubis', 'Bulutlar'],
    description: 'Kader Çarkı kartı, değişim ve döngüleri temsil eder. Hayatınızda önemli bir dönüm noktasının geldiğini gösterir.',
    element: 'Ateş',
    planet: 'Jüpiter'
  },
  {
    id: '11',
    number: 11,
    name: 'Adalet',
    nameEn: 'Justice',
    keywords: ['Adalet', 'Denge', 'Gerçek', 'Karma'],
    uprightMeaning: [
      'Adil kararlar alma',
      'Denge ve eşitlik',
      'Gerçeğin ortaya çıkması',
      'Karma ve sonuçlar'
    ],
    reversedMeaning: [
      'Adaletsizlik',
      'Dengesizlik',
      'Yanlış kararlar',
      'Sorumluluktan kaçma'
    ],
    symbols: ['Terazi', 'Kılıç', 'Taç', 'Sütunlar', 'Perde'],
    description: 'Adalet kartı, denge ve adaleti temsil eder. Verdiğiniz kararların sonuçlarıyla yüzleşme zamanının geldiğini gösterir.',
    element: 'Hava',
    zodiac: 'Terazi'
  },
  {
    id: '12',
    number: 12,
    name: 'Asılan Adam',
    nameEn: 'The Hanged Man',
    keywords: ['Fedakarlık', 'Bekleme', 'Farklı bakış açısı', 'Teslim olma'],
    uprightMeaning: [
      'Sabırla bekleme zamanı',
      'Farklı perspektif kazanma',
      'Fedakarlık yapma',
      'İç huzuru bulma'
    ],
    reversedMeaning: [
      'Gereksiz fedakarlık',
      'Takılıp kalma',
      'Değişime direnç',
      'Sabırsızlık'
    ],
    symbols: ['Asılı figür', 'Ağaç', 'Hale', 'Su', 'Kırmızı pantolon'],
    description: 'Asılan Adam kartı, bekleme ve farklı bakış açısını temsil eder. Bazen duraksama ve düşünmenin gerekli olduğunu gösterir.',
    element: 'Su',
    planet: 'Neptün'
  },
  {
    id: '13',
    number: 13,
    name: 'Ölüm',
    nameEn: 'Death',
    keywords: ['Dönüşüm', 'Son', 'Yeniden doğuş', 'Değişim'],
    uprightMeaning: [
      'Büyük dönüşüm zamanı',
      'Eski dönemin sonu',
      'Yeniden doğuş',
      'Gerekli değişimler'
    ],
    reversedMeaning: [
      'Değişime direnç',
      'Takılıp kalma',
      'Korku ve endişe',
      'Dönüşümü geciktirme'
    ],
    symbols: ['İskelet', 'Zırh', 'Bayrak', 'Nehir', 'Güneş'],
    description: 'Ölüm kartı, dönüşüm ve yeniden doğuşu temsil eder. Eski dönemin bitip yeni bir başlangıcın geldiğini gösterir.',
    element: 'Su',
    zodiac: 'Akrep'
  },
  {
    id: '14',
    number: 14,
    name: 'Ölçülülük',
    nameEn: 'Temperance',
    keywords: ['Denge', 'Uyum', 'Sabır', 'İyileşme'],
    uprightMeaning: [
      'Hayatta denge kurma',
      'Sabır ve ölçülülük',
      'İyileşme süreci',
      'Uyum ve barış'
    ],
    reversedMeaning: [
      'Dengesizlik',
      'Aşırılık',
      'Sabırsızlık',
      'Uyumsuzluk'
    ],
    symbols: ['Melek', 'Kupalar', 'Su', 'Dağ', 'Yol'],
    description: 'Ölçülülük kartı, denge ve uyumu temsil eder. Hayatınızda ölçülü davranma ve sabır gösterme zamanının geldiğini gösterir.',
    element: 'Ateş',
    zodiac: 'Yay'
  },
  {
    id: '15',
    number: 15,
    name: 'Şeytan',
    nameEn: 'The Devil',
    keywords: ['Bağımlılık', 'Kısıtlama', 'Maddi takıntı', 'Gölge'],
    uprightMeaning: [
      'Bağımlılıkları fark etme',
      'Maddi takıntılar',
      'Kısıtlayıcı durumlar',
      'Gölge yönlerle yüzleşme'
    ],
    reversedMeaning: [
      'Bağımlılıktan kurtulma',
      'Özgürleşme',
      'Kısıtlamalardan çıkma',
      'İç gücü bulma'
    ],
    symbols: ['Şeytan figürü', 'Zincirler', 'Boynuzlar', 'Ters pentagram', 'Alev'],
    description: 'Şeytan kartı, bağımlılık ve kısıtlamaları temsil eder. Sizi kısıtlayan durumları fark etme zamanının geldiğini gösterir.',
    element: 'Toprak',
    zodiac: 'Oğlak'
  },
  {
    id: '16',
    number: 16,
    name: 'Kule',
    nameEn: 'The Tower',
    keywords: ['Ani değişim', 'Yıkım', 'Aydınlanma', 'Özgürleşme'],
    uprightMeaning: [
      'Ani ve beklenmedik değişim',
      'Eski yapıların yıkılması',
      'Gerçeğin ortaya çıkması',
      'Özgürleştirici yıkım'
    ],
    reversedMeaning: [
      'Değişime direnç',
      'Yıkımdan kaçınma',
      'İç çöküş',
      'Korku ve endişe'
    ],
    symbols: ['Kule', 'Şimşek', 'Taç', 'İnsanlar', 'Alev'],
    description: 'Kule kartı, ani değişim ve yıkımı temsil eder. Eski yapıların yıkılıp yenilerinin kurulması gerektiğini gösterir.',
    element: 'Ateş',
    planet: 'Mars'
  },
  {
    id: '17',
    number: 17,
    name: 'Yıldız',
    nameEn: 'The Star',
    keywords: ['Umut', 'İlham', 'Ruhsal rehberlik', 'İyileşme'],
    uprightMeaning: [
      'Umut ve iyimserlik',
      'Ruhsal rehberlik',
      'İlham ve yaratıcılık',
      'İyileşme ve yenilenme'
    ],
    reversedMeaning: [
      'Umutsuzluk',
      'İlham eksikliği',
      'Ruhsal bağlantı kopukluğu',
      'Güvensizlik'
    ],
    symbols: ['Yıldızlar', 'Su', 'Kadın figürü', 'Kuş', 'Dağlar'],
    description: 'Yıldız kartı, umut ve ilhamı temsil eder. Karanlık dönemden sonra ışığın göründüğünü ve umudun geri geldiğini gösterir.',
    element: 'Hava',
    zodiac: 'Kova'
  },
  {
    id: '18',
    number: 18,
    name: 'Ay',
    nameEn: 'The Moon',
    keywords: ['İllüzyon', 'Korku', 'Bilinçaltı', 'Sezgi'],
    uprightMeaning: [
      'Bilinçaltından gelen mesajlar',
      'Sezgilere güvenme',
      'Gizli gerçeklerin ortaya çıkması',
      'İç dünyaya yolculuk'
    ],
    reversedMeaning: [
      'İllüzyonların dağılması',
      'Korkuları yenme',
      'Netlik kazanma',
      'Aldanmışlıktan çıkma'
    ],
    symbols: ['Ay', 'Köpekler', 'Kerevit', 'Yol', 'Kuleler'],
    description: 'Ay kartı, illüzyon ve bilinçaltını temsil eder. Gerçekle illüzyon arasında ayrım yapma zamanının geldiğini gösterir.',
    element: 'Su',
    zodiac: 'Balık'
  },
  {
    id: '19',
    number: 19,
    name: 'Güneş',
    nameEn: 'The Sun',
    keywords: ['Başarı', 'Mutluluk', 'Canlılık', 'Pozitif enerji'],
    uprightMeaning: [
      'Başarı ve zafer',
      'Mutluluk ve neşe',
      'Pozitif enerji',
      'Hayat dolu olmak'
    ],
    reversedMeaning: [
      'Geçici başarısızlık',
      'Enerji eksikliği',
      'Olumsuzluk',
      'İç karartı'
    ],
    symbols: ['Güneş', 'Çocuk', 'At', 'Ayçiçekleri', 'Bayrak'],
    description: 'Güneş kartı, başarı ve mutluluğu temsil eder. Hayatınızda aydınlık ve pozitif bir dönemin başladığını gösterir.',
    element: 'Ateş',
    planet: 'Güneş'
  },
  {
    id: '20',
    number: 20,
    name: 'Yargı',
    nameEn: 'Judgement',
    keywords: ['Yeniden doğuş', 'Uyanış', 'Çağrı', 'Değerlendirme'],
    uprightMeaning: [
      'Ruhsal uyanış',
      'Yeniden doğuş',
      'Yüksek çağrıya cevap verme',
      'Geçmişi değerlendirme'
    ],
    reversedMeaning: [
      'Kendini yargılama',
      'Geçmişte takılma',
      'Çağrıyı görmezden gelme',
      'İç eleştiri'
    ],
    symbols: ['Melek', 'Trompet', 'İnsanlar', 'Mezarlar', 'Dağlar'],
    description: 'Yargı kartı, yeniden doğuş ve uyanışı temsil eder. Ruhsal bir çağrıya cevap verme zamanının geldiğini gösterir.',
    element: 'Ateş',
    planet: 'Plüton'
  },
  {
    id: '21',
    number: 21,
    name: 'Dünya',
    nameEn: 'The World',
    keywords: ['Tamamlanma', 'Başarı', 'Bütünlük', 'Döngünün sonu'],
    uprightMeaning: [
      'Hedeflere ulaşma',
      'Tamamlanma hissi',
      'Başarı ve tatmin',
      'Yeni döngüye hazırlık'
    ],
    reversedMeaning: [
      'Tamamlanmamış işler',
      'Hedeflere ulaşamama',
      'Tatminsizlik',
      'Döngüyü kapatamama'
    ],
    symbols: ['Çelenk', 'Kadın figürü', 'Dört element', 'Sonsuzluk', 'Dünya'],
    description: 'Dünya kartı, tamamlanma ve başarıyı temsil eder. Uzun bir yolculuğun sonuna geldiğinizi ve hedeflerinize ulaştığınızı gösterir.',
    element: 'Toprak',
    planet: 'Satürn'
  }
];

// Tarot kartı kategorileri
export const tarotCategories = {
  majorArcana: 'Major Arcana',
  userReadings: 'Okumalarınız'
};

// Tarot okuma türleri
export const readingTypes = {
  threeCard: 'Üç Kart Okuma',
  singleCard: 'Tek Kart Okuma',
  celtic: 'Kelt Haçı'
};

// Üç kart okuma pozisyonları
export const threeCardPositions = {
  past: 'Geçmiş',
  present: 'Şimdi',
  future: 'Gelecek'
};

// Tarot okuma sonucu interface
export interface TarotReading {
  id: string;
  userId: string;
  cards: {
    card: TarotCard;
    position: string;
    isReversed: boolean;
  }[];
  readingType: string;
  interpretation?: string;
  createdAt: Date;
}

// Varsayılan tarot okuma oluşturma
export const createTarotReading = (userId: string, cards: TarotCard[], readingType: string): TarotReading => ({
  id: `reading_${userId}_${Date.now()}`,
  userId,
  cards: cards.map((card, index) => ({
    card,
    position: Object.values(threeCardPositions)[index] || 'Bilinmeyen',
    isReversed: Math.random() < 0.3 // %30 ihtimalle ters
  })),
  readingType,
  createdAt: new Date()
});

// Rastgele kart seçme fonksiyonu
export const getRandomCards = (count: number = 3): TarotCard[] => {
  const shuffled = [...majorArcana].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
};

// Kart arama fonksiyonu
export const searchCards = (query: string): TarotCard[] => {
  const lowercaseQuery = query.toLowerCase();
  return majorArcana.filter(card => 
    card.name.toLowerCase().includes(lowercaseQuery) ||
    card.nameEn.toLowerCase().includes(lowercaseQuery) ||
    card.keywords.some(keyword => keyword.toLowerCase().includes(lowercaseQuery))
  );
};