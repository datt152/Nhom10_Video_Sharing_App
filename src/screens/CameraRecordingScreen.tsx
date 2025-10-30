import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  StatusBar,
  Alert,
  Modal,
  FlatList,
  Image,
  TextInput,
  _View
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { CameraView, CameraType, useCameraPermissions, useMicrophonePermissions } from 'expo-camera';
import { Audio, Video } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { useMusic } from '../hooks/useMusic';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const CameraRecordScreen: React.FC = () => {
  const navigation = useNavigation();
  const cameraRef = useRef<CameraView>(null);
  const isScreenActiveRef = useRef(true);

  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [micPermission, requestMicPermission] = useMicrophonePermissions();

  const [cameraType, setCameraType] = useState<CameraType>('back');
  const [torchEnabled, setTorchEnabled] = useState(false);

  const [isRecording, setIsRecording] = useState(false);
  const [recordedVideo, setRecordedVideo] = useState<string | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);

  const [musicUri, setMusicUri] = useState<string | null>(null);
  const [sound, setSound] = useState<Audio.Sound | null>(null);

  const [timerDelay, setTimerDelay] = useState<number | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isRecordingRef = useRef<boolean>(false);

  const { musicList, selectedMusic, fetchMusic, selectMusic } = useMusic();
  const [showMusicModal, setShowMusicModal] = useState(false);
  const [activeTab, setActiveTab] = useState('ForYou');
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    fetchMusic(); // Lấy danh sách nhạc khi mở màn hình
  }, []);

// 🎧 Khi user chọn nhạc, tự khởi tạo Audio.Sound để phát khi quay
useEffect(() => {
  const setupSound = async () => {
    try {
      if (selectedMusic?.uri) {
        console.log('🎧 [setupSound] Tạo mới sound object cho:', selectedMusic.title);
        
        // Dừng và hủy sound cũ nếu có
        if (sound) {
          await sound.stopAsync();
          await sound.unloadAsync();
          console.log('🧹 [setupSound] Đã dọn sound cũ');
        }

        // Tạo sound mới
        const { sound: newSound } = await Audio.Sound.createAsync(
          { uri: selectedMusic.uri },
          { shouldPlay: false }
        );

        setSound(newSound);
        setMusicUri(selectedMusic.uri);
        console.log('✅ [setupSound] Sound object created & ready');
      } else {
        console.log('🚫 [setupSound] Không có selectedMusic.uri — bỏ qua');
        setSound(null);
      }
    } catch (err) {
      console.error('❌ [setupSound] Lỗi khi tạo sound:', err);
      setSound(null);
    }
  };

  setupSound();
}, [selectedMusic]);



  useFocusEffect(
    React.useCallback(() => {
      console.log('📱 [useFocusEffect] Screen focused');
      isScreenActiveRef.current = true;
      setRecordedVideo(null);
      setRecordingTime(0);
      setIsRecording(false);
      setTorchEnabled(false);
      setCameraType('back');
      setTimerDelay(null);
      isRecordingRef.current = false;

      return () => {
        console.log('🔄 [useFocusEffect] Screen blurred - cleanup');
        isScreenActiveRef.current = false;

        if (isRecordingRef.current && cameraRef.current) {
          try {
            cameraRef.current.stopRecording();
          } catch (error) {
            console.log('⚠️ [Cleanup] Error stopping recording:', error);
          }
        }

        if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
        if (countdownRef.current) clearInterval(countdownRef.current);

        // stop music nếu đang phát
        if (sound) {
          sound.stopAsync();
          sound.unloadAsync();
        }
      };
    }, [sound])
  );

  useEffect(() => {
    return () => {
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
      if (countdownRef.current) clearInterval(countdownRef.current);
      isRecordingRef.current = false;
      if (sound) sound.unloadAsync();
    };
  }, []);

  useEffect(() => {
    (async () => {
      if (!cameraPermission?.granted) await requestCameraPermission();
      if (!micPermission?.granted) await requestMicPermission();
    })();
  }, [cameraPermission, micPermission]);

  const handleClose = () => {
    if (isRecordingRef.current) stopRecording();
    navigation.goBack();
  };

  const flipCamera = () => {
    setCameraType((prev) => (prev === 'back' ? 'front' : 'back'));
  };

  const toggleFlash = () => {
    setTorchEnabled((prev) => !prev);
  };


  const startRecording = async () => {
    if (!cameraRef.current || isRecordingRef.current) return;

    if (timerDelay) {
      setCountdown(timerDelay);
      let timeLeft = timerDelay;
      countdownRef.current = setInterval(() => {
        timeLeft -= 1;
        if (timeLeft > 0) setCountdown(timeLeft);
        else {
          clearInterval(countdownRef.current!);
          setCountdown(null);
          startRecordingNow();
        }
      }, 1000);
      return;
    }

    startRecordingNow();
  };

  const startRecordingNow = async () => {
    try {
      isRecordingRef.current = true;
      setIsRecording(true);
      setRecordingTime(0);

      console.log('🎬 [startRecordingNow] Bắt đầu quay...');
console.log('🎧 [Debug] musicUri =', musicUri);
console.log('🎧 [Debug] selectedMusic =', selectedMusic);
console.log('🎧 [Debug] sound =', sound ? '✅ Có sound object' : '❌ Không có sound');

if (musicUri && sound) {
  try {
    console.log('🎵 [startRecordingNow] Phát nhạc từ đầu...');
    await sound.setPositionAsync(0);
    await sound.playAsync();
  } catch (err) {
    console.log('⚠️ [startRecordingNow] Lỗi khi phát nhạc:', err);
  }
} else {
  console.log('🚫 [startRecordingNow] Không có nhạc được chọn hoặc sound chưa khởi tạo.');
}


      recordingTimerRef.current = setInterval(() => {
        setRecordingTime((prev) => {
          if (prev >= 60) {
            stopRecording();
            return 60;
          }
          return prev + 1;
        });
      }, 1000);

      const video = await cameraRef.current!.recordAsync({ maxDuration: 60 });
      if (isScreenActiveRef.current && video) {
        if (sound) await sound.stopAsync();

        navigation.navigate('EditVideo' as never, {
          videoUri: video.uri,
          musicUri: musicUri || null,
        } as never);
      }
    } catch (error) {
      console.error('❌ [startRecordingNow] Error:', error);
      Alert.alert('Error', 'Failed to record video');
    } finally {
      isRecordingRef.current = false;
      setIsRecording(false);
    }
  };

  const stopRecording = async () => {
    console.log('🛑 [stopRecording] Đang dừng quay...');
if (cameraRef.current && isRecordingRef.current) {
  try {
    console.log('📹 [stopRecording] Gọi stopRecording() của camera...');
    cameraRef.current.stopRecording();
  } catch (e) {
    console.log('⚠️ [stopRecording] Lỗi khi dừng camera:', e);
  }
}


    if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
   if (sound) {
  console.log('🔇 [stopRecording] Dừng nhạc phát cùng video...');
  await sound.stopAsync();
}


    isRecordingRef.current = false;
    setIsRecording(false);
  };

  const handleUpload = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
        allowsEditing: true,
        quality: 1,
        videoMaxDuration: 60,
      });
      if (!result.canceled && result.assets[0]) {
        const uri = result.assets[0].uri;
        navigation.navigate('EditVideo' as never, {
          videoUri: uri,
          musicUri: musicUri || null,
        } as never);
      }
    } catch (error) {
      console.error('❌ [handleUpload] Error:', error);
      Alert.alert('Error', 'Failed to pick video');
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!cameraPermission || !micPermission) return <View style={styles.container} />;
  if (!cameraPermission?.granted || !micPermission?.granted) return;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      <CameraView
        ref={cameraRef}
        style={styles.camera}
        facing={cameraType}
        enableTorch={torchEnabled}
        mode="video"
      >
        {countdown !== null && (
          <View style={styles.countdownOverlay}>
            <Text style={styles.countdownText}>{countdown}</Text>
          </View>
        )}

        <View style={styles.topBar}>
          <TouchableOpacity style={styles.topButton} onPress={handleClose}>
            <Ionicons name="close" size={32} color="#fff" />
          </TouchableOpacity>

          <View style={styles.centerTop}>
            {selectedMusic && (
            <View style={styles.selectedMusicLabel}>
              <Ionicons name="musical-notes" size={16} color="#fff" style={{ marginRight: 6 }} />
              <Text style={styles.selectedMusicText} numberOfLines={1}>
                {selectedMusic?.title ?? 'Add audio'}

              </Text>
            </View>
          )}
            {isRecording && (
              <View style={styles.recordingIndicator}>
                <View style={styles.recordingDot} />
                <Text style={styles.recordingTime}>{formatTime(recordingTime)}</Text>
              </View>
            )}
          </View>
          
          <View style={styles.topButton} />
        </View>

        {/* Right tools */}
        <View style={styles.rightTools}>
          <TouchableOpacity style={styles.tool} onPress={flipCamera}>
            <Ionicons name="camera-reverse-outline" size={28} color="#fff" />
            <Text style={styles.toolText}>Flip</Text>
          </TouchableOpacity>

          {/* 🎵 Replace Filter with Music */}
          <TouchableOpacity
            style={styles.tool}
            onPress={() => setShowMusicModal(true)}
          >
            <Ionicons name="musical-notes" size={28} color="#fff" />

          </TouchableOpacity>


          <TouchableOpacity
            style={styles.tool}
            onPress={() => {
              const newDelay = timerDelay === 3 ? 10 : timerDelay === 10 ? null : 3;
              setTimerDelay(newDelay);
            }}
          >
            <Ionicons
              name="time-outline"
              size={28}
              color={timerDelay ? '#FF4EB8' : '#fff'}
            />
            <Text style={styles.toolText}>{timerDelay ? `${timerDelay}s` : 'Timer'}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.tool} onPress={toggleFlash}>
            <Ionicons
              name={torchEnabled ? 'flash-off' : 'flash'}
              size={28}
              color="#fff"
            />
            <Text style={styles.toolText}>Flash</Text>
          </TouchableOpacity>
        </View>

        {/* Bottom controls */}
        <View style={styles.bottomControls}>
          <TouchableOpacity style={styles.bottomButton}>
            <View style={styles.effectButton}>
              <Ionicons name="happy-outline" size={24} color="#fff" />
            </View>
            <Text style={styles.bottomButtonText}>Effect</Text>
          </TouchableOpacity>

          <View style={styles.recordButtonContainer}>
            {isRecording ? (
              <TouchableOpacity style={styles.recordButton} onPress={stopRecording}>
                <View style={styles.stopButton} />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={styles.recordButton} onPress={startRecording}>
                <View style={styles.recordInner} />
              </TouchableOpacity>
            )}
          </View>

          <TouchableOpacity style={styles.bottomButton} onPress={handleUpload}>
            <View style={styles.uploadButton}>
              <Ionicons name="images-outline" size={24} color="#fff" />
            </View>
            <Text style={styles.bottomButtonText}>Upload</Text>
          </TouchableOpacity>
        </View>
      </CameraView>
      <Modal
  visible={showMusicModal}
  animationType="slide"
  transparent
  onRequestClose={() => setShowMusicModal(false)}
>
  <View style={styles.modalContainer}>
    <View style={styles.modalContent}>
      {/* Header */}
      <View style={styles.modalHeader}>
        <Text style={styles.modalTitle}>Add audio</Text>
        <TouchableOpacity onPress={() => setShowMusicModal(false)}>
          <Ionicons name="close" size={24} color="#555" />
        </TouchableOpacity>
      </View>

      {/* Ô tìm kiếm */}
      <View style={styles.searchRow}>
        <Ionicons name="search" size={20} color="#777" style={{ marginRight: 8 }} />
        <TextInput
          placeholder="Search music..."
          placeholderTextColor="#888"
          style={styles.searchInput}
          value={searchText}
          onChangeText={setSearchText}
        />
      </View>

      {/* Danh sách nhạc */}
      <FlatList
        data={musicList.filter(m =>
          m.title.toLowerCase().includes(searchText.toLowerCase()) ||
          m.artist.toLowerCase().includes(searchText.toLowerCase())
        )}
        keyExtractor={(item, index) => item?.id ?? index.toString()}
        renderItem={({ item }) => (
          <View style={styles.musicItem}>
            <TouchableOpacity
            style={[
              styles.useButton,
              selectedMusic?.id === item.id && { borderColor: '#FF4EB8', borderWidth: 2 },
            ]}
            onPress={() => {
              selectMusic(item);
            }}
          >
            <Image source={{ uri: item.cover }} style={styles.musicCover} />
            <View style={{ flex: 1 }}>
              <Text style={styles.musicTitle} numberOfLines={1}>{item.title}</Text>
              <Text style={styles.musicArtist}>{item.artist}</Text>
            </View>
            <Ionicons
              name={
                selectedMusic?.id === item.id
                  ? 'checkmark-circle'
                  : 'musical-notes-outline'
              }
              size={22}
              color={selectedMusic?.id === item.id ? '#FF4EB8' : '#888'}
            />
          </TouchableOpacity>
          </View>
        )}
      />
    </View>
  </View>
</Modal>


    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
  },
  permissionText: {
    color: '#fff',
    fontSize: 18,
    textAlign: 'center',
    marginTop: 20,
  },
  permissionButton: {
    backgroundColor: '#FF4EB8',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
  },
  permissionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: StatusBar.currentHeight || 20,
    paddingHorizontal: 20,
  },
  topButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerTop: {
    flex: 1,
    alignItems: 'center',  },
  recordingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  recordingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF3B5C',
    marginRight: 8,
  },
  recordingTime: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  rightTools: {
    position: 'absolute',
    right: 20,
    top: '30%',
    gap: 25,
  },
  tool: {
    alignItems: 'center',
  },
  toolText: {
    color: '#fff',
    fontSize: 12,
    marginTop: 4,
  },
  bottomControls: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  bottomButton: {
    alignItems: 'center',
  },
  bottomButtonText: {
    color: '#fff',
    fontSize: 12,
    marginTop: 8,
  },
  effectButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  uploadButton: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  recordButtonContainer: {
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  recordButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'transparent',
    borderWidth: 5,
    borderColor: '#FF3B5C',
    justifyContent: 'center',
    alignItems: 'center',
  },
  recordInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FF3B5C',
  },
  stopButton: {
    width: 30,
    height: 30,
    borderRadius: 4,
    backgroundColor: '#FF3B5C',
  },
  preview: {
    flex: 1,
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF3B5C',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
    gap: 6,
  },
  nextText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  countdownOverlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  countdownText: {
    fontSize: 120,
    color: '#fff',
    fontWeight: '700',
  },
  selectMusicButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginBottom: 10,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: '70%',
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: { fontSize: 18, fontWeight: 'bold' },
  tabRow: { flexDirection: 'row', marginBottom: 15 },
  tabButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabButtonActive: { borderBottomColor: '#FF4EB8' },
  tabText: { color: '#888' },
  tabTextActive: { color: '#FF4EB8', fontWeight: 'bold' },
  musicItem: {
    alignItems: 'center',
    marginBottom: 15,
    borderColor: 'white'
  },
  musicCover: { width: 50, height: 50, borderRadius: 50, marginRight: 20 },
  musicTitle: { fontWeight: '600' },
  musicArtist: { color: '#999', fontSize: 12 },
  useButton: {
    borderWidth: 1,
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 8,
    flexDirection: 'row',
    borderColor: '#FF4EB8',
    alignItems: 'center'

  },
  useButtonText: { color: '#FF4EB8', fontWeight: 'bold' },
  selectedMusicLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 6,
    maxWidth: '80%',
  },
  selectedMusicText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
searchRow: {
  flexDirection: 'row',
  alignItems: 'center',
  backgroundColor: '#f2f2f2',
  borderRadius: 10,
  paddingHorizontal: 12,
  paddingVertical: 8,
  marginBottom: 15,
},
searchInput: {
  flex: 1,
  fontSize: 15,
  color: '#333',
},
});

export default CameraRecordScreen;