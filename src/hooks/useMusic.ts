// 📁 src/hooks/useMusic.ts
import { useState, useCallback } from 'react';
import axios from 'axios';
import { Audio } from 'expo-av';

const API_BASE_URL = 'http://192.168.1.125:3000'; // URL của JSON Server hoặc backend của bạn

export interface Music {
  id: string;
  title: string;
  artist: string;
  cover: string;
  uri?: string; // nếu có file nhạc local hoặc URL stream
}

export const useMusic = () => {
  const [musicList, setMusicList] = useState<Music[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedMusic, setSelectedMusic] = useState<Music | null>(null);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // 🧩 Fetch danh sách nhạc
  const fetchMusic = useCallback(async () => {
    setLoading(true);
    try {
      console.log('🎧 Fetching music list...');
      const res = await axios.get(`${API_BASE_URL}/music`);
      setMusicList(res.data);
    } catch (error) {
      console.error('❌ Error fetching music:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // 🎵 Chọn nhạc
  const selectMusic = useCallback(async (music: Music) => {
    try {
      // Dừng nhạc cũ nếu đang phát
      if (sound) {
        await sound.stopAsync();
        await sound.unloadAsync();
      }

      // Nếu nhạc này đã được chọn rồi → bỏ chọn
      if (selectedMusic?.id === music.id) {
        setSelectedMusic(null);
        setIsPlaying(false);
        return;
      }

      setSelectedMusic(music);

      if (music.uri) {
        const { sound: newSound } = await Audio.Sound.createAsync(
          { uri: music.uri },
          { shouldPlay: false }
        );
        setSound(newSound);
      }
    } catch (error) {
      console.error('❌ Error selecting music:', error);
    }
  }, [sound, selectedMusic]);

  // ▶️ Phát nhạc preview
  const playPreview = useCallback(async () => {
    try {
      if (!sound) return;
      await sound.replayAsync();
      setIsPlaying(true);
    } catch (error) {
      console.error('❌ Error playing preview:', error);
    }
  }, [sound]);

  // ⏸️ Dừng nhạc
  const stopPreview = useCallback(async () => {
    try {
      if (sound) {
        await sound.stopAsync();
        setIsPlaying(false);
      }
    } catch (error) {
      console.error('❌ Error stopping preview:', error);
    }
  }, [sound]);

  return {
    musicList,
    loading,
    selectedMusic,
    isPlaying,
    fetchMusic,
    selectMusic,
    playPreview,
    stopPreview,
  };
};
