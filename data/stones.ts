// Taş veri yapısı
export interface Stone {
  id: string;
  name: string;
  scientificName: string;
  category: string;
  color: string[];
  hardness: number; // Mohs sertlik skalası (1-10)
  origin: string[];
  properties: string[];
  healingProperties: string[];
  uses: string[];
  imageUrl?: string;
  description: string;
  cleansingMethods?: string[]; // Arındırma yöntemleri
}

// En popüler 5 kristal - Web araştırması sonuçlarına göre seçilmiştir
export const popularStones: Stone[] = [
  // Bu taşlar "Popüler Taşlar" kategorisinde gösterilecek
  {
    id: '1',
    name: 'Ametist',
    scientificName: 'Quartz',
    category: 'Silikat',
    color: ['Mor', 'Açık Mor', 'Koyu Mor'],
    hardness: 7,
    origin: ['Brezilya', 'Uruguay', 'Zambiya'],
    properties: ['Sakinleştirici', 'Koruyucu', 'Spiritüel'],
    healingProperties: ['Taç çakrasını açar', 'Stresi azaltır', 'Uykuyu iyileştirir'],
    uses: ['Meditasyon', 'Koruma', 'Şifa'],
    imageUrl: 'amethyst.png',
    description: 'Ametist, mor rengiyle bilinen, en popüler şifa kristallerinden biri olan sakinleştirici ve koruyucu bir kuvars türüdür.',
    cleansingMethods: [
      'Ay ışığı (en uygun yöntem)',
      'Temiz su (kısa süreli)',
      'Tütsüleme (adaçayı, lavanta)',
      'Ses arındırması (şarkı kasesi)',
      'Diğer kristallerle (Selenit, Berrak Kuvars)'
    ]
  },
  {
    id: '2',
    name: 'Berrak Kuvars',
    scientificName: 'Clear Quartz',
    category: 'Silikat',
    color: ['Şeffaf', 'Beyaz'],
    hardness: 7,
    origin: ['Brezilya', 'Arkansas', 'Madagaskar'],
    properties: ['Amplifikasyon', 'Temizlik', 'Şifa'],
    healingProperties: ['Tüm çakraları temizler', 'Enerjiyi amplifikasyon yapar', 'Diğer taşların gücünü artırır'],
    uses: ['Şifa', 'Meditasyon', 'Enerji Amplifikasyonu'],
    imageUrl: 'clear-quartz.png',
    description: 'Berrak Kuvars, şeffaflığıyla bilinen, en güçlü şifa taşlarından biri olan master healer taştır.',
    cleansingMethods: [
      'Su ile yıkama',
      'Güneş ışığında şarj',
      'Ay ışığında şarj',
      'Tütsü ile temizlik'
    ]
  },
  {
    id: '3',
    name: 'Gül Kuvarsı',
    scientificName: 'Rose Quartz',
    category: 'Silikat',
    color: ['Pembe', 'Açık Pembe'],
    hardness: 7,
    origin: ['Brezilya', 'Madagaskar', 'Hindistan'],
    properties: ['Sevgi', 'Şefkat', 'İyileşme'],
    healingProperties: ['Kalp çakrasını açar', 'Öz sevgiyi artırır', 'Duygusal iyileşme sağlar'],
    uses: ['Sevgi', 'İlişkiler', 'Duygusal İyileşme'],
    imageUrl: 'rose-quartz.png',
    description: 'Gül Kuvarsı, pembe rengiyle bilinen, sevgi ve şefkati temsil eden en popüler kalp şifa taşıdır.',
    cleansingMethods: [
      'Ay ışığı (en uygun yöntem)',
      'Temiz su (kısa süreli)',
      'Tütsüleme (gül, lavanta)',
      'Ses arındırması (şarkı kasesi)',
      'Diğer kristallerle (Selenit, Berrak Kuvars)'
    ]
  },
  {
    id: '4',
    name: 'Sitrin',
    scientificName: 'Citrine Quartz',
    category: 'Silikat',
    color: ['Sarı', 'Altın Sarısı', 'Turuncu'],
    hardness: 7,
    origin: ['Brezilya', 'Bolivya', 'Fransa'],
    properties: ['Bolluk', 'Başarı', 'Pozitif Enerji'],
    healingProperties: ['Solar pleksus çakrasını açar', 'Özgüveni artırır', 'Negatif enerjiyi temizler'],
    uses: ['Bolluk', 'Başarı', 'Motivasyon'],
    imageUrl: 'citrine.png',
    description: 'Sitrin, altın sarısı rengiyle bilinen, bolluk ve başarı getiren güneş enerjisi taşıdır.',
    cleansingMethods: [
      'Güneş ışığı (doğal enerji kaynağı)',
      'Ay ışığı',
      'Temiz su (kısa süreli)',
      'Tütsüleme (adaçayı, tarçın)',
      'Ses arındırması (şarkı kasesi)'
    ]
  },
  {
    id: '5',
    name: 'Kaplan Gözü',
    scientificName: 'Tiger Eye Quartz',
    category: 'Silikat',
    color: ['Altın', 'Kahverengi', 'Sarı'],
    hardness: 7,
    origin: ['Güney Afrika', 'Avustralya', 'Hindistan'],
    properties: ['Cesaret', 'Güç', 'Koruma'],
    healingProperties: ['Solar pleksus çakrasını güçlendirir', 'Özgüveni artırır', 'Koruma sağlar'],
    uses: ['Cesaret', 'Güç', 'Koruma'],
    imageUrl: 'tiger-eye.png',
    description: 'Kaplan Gözü, altın kahverengi çizgileriyle bilinen, cesaret ve güç veren koruyucu bir taştır.',
    cleansingMethods: [
      'Güneş ışığı (doğal enerji kaynağı)',
      'Ay ışığı',
      'Temiz su (kısa süreli)',
      'Tütsüleme (adaçayı, biberiye)',
      'Ses arındırması (şarkı kasesi)',
      'Toprakta gömme'
    ]
  }
];

// Tüm taşlar (popüler taşlar dahil)
export const stones: Stone[] = [...popularStones];

// Taş kategorileri
export const stoneCategories = {
  popular: 'Popüler Taşlar',
  userStones: 'Taşlarınız'
};

// Kullanıcı kütüphanesi için interface
export interface UserLibrary {
  id: string;
  userId: string;
  stones: Stone[];
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Varsayılan kullanıcı kütüphanesi
export const createDefaultUserLibrary = (userId: string): UserLibrary => ({
  id: `library_${userId}_${Date.now()}`,
  userId,
  stones: [],
  name: 'Benim Kütüphanem',
  description: 'Kişisel kristal koleksiyonum',
  createdAt: new Date(),
  updatedAt: new Date()
});

// Kullanıcı kütüphanesi yönetimi için yardımcı fonksiyonlar
export const libraryHelpers = {
  addStoneToLibrary: (library: UserLibrary, stone: Stone): UserLibrary => {
    const exists = library.stones.find(s => s.id === stone.id);
    if (exists) return library;
    
    return {
      ...library,
      stones: [...library.stones, stone],
      updatedAt: new Date()
    };
  },
  
  removeStoneFromLibrary: (library: UserLibrary, stoneId: string): UserLibrary => ({
    ...library,
    stones: library.stones.filter(s => s.id !== stoneId),
    updatedAt: new Date()
  }),
  
  isStoneInLibrary: (library: UserLibrary, stoneId: string): boolean => {
    return library.stones.some(s => s.id === stoneId);
  }
};

// Taş kategorileri
export const categories = [
  'Silikat',
  'Karbonat',
  'Sülfat',
  'Halit',
  'Oksit',
  'Sülfür',
  'Volkanik Cam'
];

// Taş renkleri
export const colors = [
  'Kırmızı', 'Turuncu', 'Sarı', 'Yeşil', 'Mavi', 'Mor', 'Pembe', 'Kahverengi', 'Siyah', 'Beyaz', 'Gri'
];

// Menşei ülkeleri
export const origins = [
  'Brezilya', 'Madagaskar', 'Pakistan', 'Uruguay', 'Zambiya', 'İspanya', 'Hindistan', 'Sri Lanka', 'Myanmar', 'Tayland', 'Avustralya', 'ABD', 'Kanada', 'Rusya', 'Çin', 'Türkiye', 'Meksika', 'İzlanda', 'Finlandiya', 'İngiltere', 'Kongo', 'Namibya', 'Afghanistan', 'Şili', 'İskoçya', 'Güney Afrika', 'Bolivya', 'Fransa'
];
