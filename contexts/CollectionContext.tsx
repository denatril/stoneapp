import React, { createContext, useContext, useState, ReactNode, useCallback, useMemo, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Stone } from '../data/stones';

interface CollectionContextType {
  collection: Stone[];
  addToCollection: (stone: Stone) => void;
  removeFromCollection: (stoneId: string) => void;
  isInCollection: (stoneId: string) => boolean;
  getCollectionCount: () => number;
  createCustomStone: (stoneData: Partial<Stone>) => Stone;
  addCustomStoneToCollection: (stoneData: Partial<Stone>) => void;
}

const CollectionContext = createContext<CollectionContextType | undefined>(undefined);

export const useCollection = () => {
  const context = useContext(CollectionContext);
  if (!context) {
    throw new Error('useCollection must be used within a CollectionProvider');
  }
  return context;
};

interface CollectionProviderProps {
  children: ReactNode;
}

export const CollectionProvider: React.FC<CollectionProviderProps> = ({ children }) => {
  const [collection, setCollection] = useState<Stone[]>([]);

  // Load collection from AsyncStorage on mount
  useEffect(() => {
    loadCollection();
  }, []);

  const loadCollection = async () => {
    try {
      const storedCollection = await AsyncStorage.getItem('collection');
      if (storedCollection) {
        setCollection(JSON.parse(storedCollection));
      }
    } catch (error) {
      console.error('Error loading collection:', error);
    }
  };

  const saveCollection = async (newCollection: Stone[]) => {
    try {
      await AsyncStorage.setItem('collection', JSON.stringify(newCollection));
    } catch (error) {
      console.error('Error saving collection:', error);
    }
  };

  const addToCollection = useCallback((stone: Stone) => {
    setCollection(prev => {
      // Eğer taş zaten koleksiyonda varsa, ekleme
      if (prev.some(item => item.id === stone.id)) {
        return prev;
      }
      const newCollection = [...prev, stone];
      saveCollection(newCollection);
      return newCollection;
    });
  }, []);

  const removeFromCollection = useCallback((stoneId: string) => {
    setCollection(prev => {
      const newCollection = prev.filter(stone => stone.id !== stoneId);
      saveCollection(newCollection);
      return newCollection;
    });
  }, []);

  const isInCollection = useCallback((stoneId: string) => {
    return collection.some(stone => stone.id === stoneId);
  }, [collection]);

  const getCollectionCount = useCallback(() => {
    return collection.length;
  }, [collection]);



  // Özel taş oluşturma fonksiyonu
  const createCustomStone = useCallback((stoneData: Partial<Stone>): Stone => {
    const timestamp = Date.now().toString();
    const customStone: Stone = {
      id: `custom_${timestamp}`,
      name: stoneData.name || 'Bilinmeyen Taş',
      scientificName: stoneData.scientificName || 'Bilinmiyor',
      category: stoneData.category || 'Diğer',
      color: stoneData.color || ['Bilinmiyor'],
      hardness: stoneData.hardness || 5,
      origin: stoneData.origin || ['Bilinmiyor'],
      properties: stoneData.properties || ['Özel Taş'],
      healingProperties: stoneData.healingProperties || ['Kullanıcı tarafından eklendi'],
      uses: stoneData.uses || ['Kişisel Koleksiyon'],
      imageUrl: stoneData.imageUrl,
      description: stoneData.description || 'Bu taş kullanıcı tarafından koleksiyona eklenmiştir.',
      cleansingMethods: stoneData.cleansingMethods || [
        'Ay ışığı (güvenli yöntem)',
        'Tütsüleme (adaçayı)',
        'Ses arındırması (şarkı kasesi)',
        'Diğer kristallerle (Selenit, Berrak Kuvars)'
      ]
    };
    return customStone;
  }, []);

  // Özel taş oluşturup koleksiyona ekleme
  const addCustomStoneToCollection = useCallback((stoneData: Partial<Stone>) => {
    const customStone = createCustomStone(stoneData);
    addToCollection(customStone);
  }, [createCustomStone, addToCollection]);

  const value: CollectionContextType = useMemo(() => ({
    collection,
    addToCollection,
    removeFromCollection,
    isInCollection,
    getCollectionCount,
    createCustomStone,
    addCustomStoneToCollection,
  }), [
    collection,
    addToCollection,
    removeFromCollection,
    isInCollection,
    getCollectionCount,
    createCustomStone,
    addCustomStoneToCollection,
  ]);

  return (
    <CollectionContext.Provider value={value}>
      {children}
    </CollectionContext.Provider>
  );
};