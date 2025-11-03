import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  StatusBar,
  Alert,
} from 'react-native';
import { CameraView, CameraType, useCameraPermissions, useMicrophonePermissions } from 'expo-camera';
import { Audio } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const CameraRecordScreen: React.FC = () => {
  const navigation = useNavigation();
  const cameraRef = useRef<CameraView>(null);
  const isScreenActiveRef = useRef(true);

  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [micPermission, requestMicPermission] = useMicrophonePermissions();

  const [cameraType, setCameraType] = useState<CameraType>('back');
  const [torchEnabled, setTorchEnabled] = useState(false);

  // ✅ State cho chế độ: 'video' hoặc 'photo'
  const [mode, setMode] = useState<'video' | 'photo'>('video');

  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);

  const [musicUri, setMusicUri] = useState<string | null>(null);
  const [sound, setSound] = useState<Audio.Sound | null>(null);

  const [timerDelay, setTimerDelay] = useState<number | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isRecordingRef = useRef<boolean>(false);

  useFocusEffect(
    React.useCallback(() => {
      console.log('📱 [useFocusEffect] Screen focused');
      isScreenActiveRef.current = true;
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

  // ✅ Chụp ảnh
  const takePicture = async () => {
    if (!cameraRef.current) return;

    if (timerDelay) {
      setCountdown(timerDelay);
      let timeLeft = timerDelay;
      countdownRef.current = setInterval(() => {
        timeLeft -= 1;
        if (timeLeft > 0) setCountdown(timeLeft);
        else {
          clearInterval(countdownRef.current!);
          setCountdown(null);
          takePictureNow();
        }
      }, 1000);
      return;
    }

    takePictureNow();
  };

  const takePictureNow = async () => {
    try {
      console.log('📸 [takePictureNow] Chụp ảnh...');
      const photo = await cameraRef.current!.takePictureAsync({
        quality: 1,
        exif: false,
      });

      if (photo && isScreenActiveRef.current) {
        console.log('✅ [takePictureNow] Ảnh đã chụp:', photo.uri);
        navigation.navigate('EditImage' as never, {
          imageUri: photo.uri,
        } as never);
      }
    } catch (error) {
      console.error('❌ [takePictureNow] Error:', error);
      Alert.alert('Error', 'Failed to take picture');
    }
  };

  // ✅ Quay video
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

      if (musicUri && sound) {
        try {
          await sound.setPositionAsync(0);
          await sound.playAsync();
        } catch (err) {
          console.log('⚠️ [startRecordingNow] Lỗi khi phát nhạc:', err);
        }
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
        cameraRef.current.stopRecording();
      } catch (e) {
        console.log('⚠️ [stopRecording] Lỗi khi dừng camera:', e);
      }
    }

    if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    if (sound) await sound.stopAsync();

    isRecordingRef.current = false;
    setIsRecording(false);
  };

  const handleUpload = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsEditing: true,
        quality: 1,
        videoMaxDuration: 60,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];

        if (asset.type === 'video') {
          navigation.navigate('EditVideo' as never, {
            videoUri: asset.uri,
          } as never);
        } else if (asset.type === 'image') {
          navigation.navigate('EditImage' as never, {
            imageUri: asset.uri,
          } as never);
        }
      }
    } catch (error) {
      console.error('❌ [handleUpload] Error:', error);
      Alert.alert('Error', 'Failed to pick media');
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // ✅ Handle capture/record based on mode
  const handleCapturePress = () => {
    if (mode === 'photo') {
      takePicture();
    } else {
      if (isRecording) {
        stopRecording();
      } else {
        startRecording();
      }
    }
  };

  if (!cameraPermission || !micPermission) return <View style={styles.container} />;
  if (!cameraPermission?.granted || !micPermission?.granted) return null;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      <CameraView
        ref={cameraRef}
        style={styles.camera}
        facing={cameraType}
        enableTorch={torchEnabled}
        mode={mode === 'video' ? 'video' : 'picture'}
        videoQuality="480p"
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
          <View style={styles.effectButton} />

          {/* ✅ Tab selector + Capture button */}
          <View style={styles.captureWrapper}>
            {/* Tab selector trên nút */}
            <View style={styles.modeTabContainer}>
              <TouchableOpacity
                style={[styles.modeTab, mode === 'photo' && styles.modeTabActive]}
                onPress={() => setMode('photo')}
              >
                <Text style={[styles.modeTabText, mode === 'photo' && styles.modeTabTextActive]}>
                  Photo
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modeTab, mode === 'video' && styles.modeTabActive]}
                onPress={() => setMode('video')}
              >
                <Text style={[styles.modeTabText, mode === 'video' && styles.modeTabTextActive]}>
                  Video
                </Text>
              </TouchableOpacity>
            </View>

            {/* Capture/Record button */}
            <TouchableOpacity
              style={styles.recordButtonContainer}
              onPress={handleCapturePress}
            >
              {mode === 'video' ? (
                <View style={[styles.recordButton, isRecording && styles.recordingButton]}>
                  {isRecording ? (
                    <View style={styles.stopButton} />
                  ) : (
                    <View style={styles.recordInner} />
                  )}
                </View>
              ) : (
                <View style={styles.captureButton}>
                  <View style={styles.captureInner} />
                </View>
              )}
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.bottomButton} onPress={handleUpload}>
            <View style={styles.uploadButton}>
              <Ionicons name="images-outline" size={24} color="#fff" />
            </View>
            <Text style={styles.bottomButtonText}>Upload</Text>
          </TouchableOpacity>
        </View>
      </CameraView>
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
    alignItems: 'center',
  },
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
    alignItems: 'flex-end',
  },
  effectButton: {
    width: 44,
    height: 44,
  },
  bottomButton: {
    alignItems: 'center',
  },
  bottomButtonText: {
    color: '#fff',
    fontSize: 12,
    marginTop: 8,
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
  // ✅ Capture wrapper với tab
  captureWrapper: {
    alignItems: 'center',
  },
  modeTabContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 20,
    padding: 3,
    marginBottom: 12,
    gap: 4,
  },
  modeTab: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
  },
  modeTabActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  modeTabText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 13,
    fontWeight: '600',
  },
  modeTabTextActive: {
    color: '#FF3B5C',
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
  recordingButton: {
    borderColor: '#fff',
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
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'transparent',
    borderWidth: 5,
    borderColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FF3B5C',
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
});

export default CameraRecordScreen;