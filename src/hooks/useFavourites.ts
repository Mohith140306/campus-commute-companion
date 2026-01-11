import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'bus-favourites';

export function useFavourites() {
  const [favourites, setFavourites] = useState<string[]>([]);

  // Load favourites from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setFavourites(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Failed to load favourites:', error);
    }
  }, []);

  // Save to localStorage whenever favourites change
  const saveFavourites = useCallback((newFavourites: string[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newFavourites));
      setFavourites(newFavourites);
    } catch (error) {
      console.error('Failed to save favourites:', error);
    }
  }, []);

  const addFavourite = useCallback((busNumber: string) => {
    if (!favourites.includes(busNumber)) {
      saveFavourites([...favourites, busNumber]);
    }
  }, [favourites, saveFavourites]);

  const removeFavourite = useCallback((busNumber: string) => {
    saveFavourites(favourites.filter(fav => fav !== busNumber));
  }, [favourites, saveFavourites]);

  const isFavourite = useCallback((busNumber: string) => {
    return favourites.includes(busNumber);
  }, [favourites]);

  const toggleFavourite = useCallback((busNumber: string) => {
    if (isFavourite(busNumber)) {
      removeFavourite(busNumber);
    } else {
      addFavourite(busNumber);
    }
  }, [isFavourite, addFavourite, removeFavourite]);

  return {
    favourites,
    addFavourite,
    removeFavourite,
    isFavourite,
    toggleFavourite,
  };
}
