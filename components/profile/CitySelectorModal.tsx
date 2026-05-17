'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, MapPin, Loader2 } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';

interface City {
  id: string;
  lokasi: string;
}

interface CitySelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CitySelectorModal({ isOpen, onClose }: CitySelectorModalProps) {
  const { setPrayerCity, prayerCityId } = useAppStore();
  const [cities, setCities] = useState<City[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && cities.length === 0) {
      setLoading(true);
      fetch('https://api.myquran.com/v2/sholat/kota/semua')
        .then(res => res.json())
        .then(data => {
          if (data.status && data.data) {
            setCities(data.data);
          }
        })
        .catch(err => console.error('Failed to fetch cities', err))
        .finally(() => setLoading(false));
    }
  }, [isOpen, cities.length]);

  const filteredCities = cities.filter(city => 
    city.lokasi.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = (city: City) => {
    setPrayerCity(city.id, city.lokasi);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[101] w-full max-w-md h-[80vh] flex flex-col rounded-2xl shadow-2xl overflow-hidden"
            style={{ background: 'var(--bg-primary)', border: '1px solid var(--border)' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b shrink-0" style={{ borderColor: 'var(--border)' }}>
              <div>
                <h2 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>
                  Pilih Lokasi Jadwal Sholat
                </h2>
              </div>
              <button onClick={onClose} className="p-2 rounded-xl transition-colors hover:bg-white/10" style={{ color: 'var(--text-secondary)' }}>
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search */}
            <div className="p-4 shrink-0 border-b" style={{ borderColor: 'var(--border)', background: 'var(--bg-secondary)' }}>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  placeholder="Cari kota atau kabupaten..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm outline-none transition-all focus:ring-2 focus:ring-indigo-500/50"
                  style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}
                />
              </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {loading ? (
                <div className="flex flex-col items-center justify-center h-full space-y-3">
                  <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
                  <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Memuat daftar kota...</p>
                </div>
              ) : filteredCities.length > 0 ? (
                filteredCities.map(city => {
                  const isSelected = city.id === prayerCityId;
                  return (
                    <button
                      key={city.id}
                      onClick={() => handleSelect(city)}
                      className={`w-full flex items-center justify-between p-3 rounded-xl transition-colors text-left ${isSelected ? 'bg-indigo-500/10' : 'hover:bg-white/5'}`}
                    >
                      <div className="flex items-center gap-3">
                        <MapPin className="w-4 h-4" style={{ color: isSelected ? '#6366F1' : 'var(--text-muted)' }} />
                        <span className="text-sm font-medium" style={{ color: isSelected ? '#6366F1' : 'var(--text-primary)' }}>
                          {city.lokasi}
                        </span>
                      </div>
                      {isSelected && (
                        <div className="w-2 h-2 rounded-full bg-indigo-500" />
                      )}
                    </button>
                  );
                })
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Kota tidak ditemukan</p>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
