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
import { Video } from 'expo-av';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
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

  const [isRecording, setIsRecording] = useState(false);
  const [recordedVideo, setRecordedVideo] = useState<string | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);

  // Timer
  const [timerDelay, setTimerDelay] = useState<number | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);

  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isRecordingRef = useRef<boolean>(false);

  // Reset màn hình khi focus lại
  useFocusEffect(
    React.useCallback(() => {
      console.log('📱 [useFocusEffect] Screen focused');
      isScreenActiveRef.current = true;

      // Reset giao diện mỗi khi quay lại
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

        if (recordingTimerRef.current) {
          clearInterval(recordingTimerRef.current);
          recordingTimerRef.current = null;
        }

        if (countdownRef.current) {
          clearInterval(countdownRef.current);
          countdownRef.current = null;
          setCountdown(null);
          
        }
      };
    }, [])
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
      if (countdownRef.current) clearInterval(countdownRef.current);
      isRecordingRef.current = false;
    };
  }, []);

  // Request permission
  useEffect(() => {
    (async () => {
      if (!cameraPermission?.granted) await requestCameraPermission();
      if (!micPermission?.granted) await requestMicPermission();
    })();
  }, [cameraPermission, micPermission]);

  // Close camera
  const handleClose = () => {
    if (isRecordingRef.current) stopRecording();
    navigation.goBack();
  };

  // Flip camera
  const flipCamera = () => {
    const newType = cameraType === 'back' ? 'front' : 'back';
    setCameraType(newType);
  };

  // Toggle flash
  const toggleFlash = () => {
    setTorchEnabled((prev) => !prev);
  };
const startRecording = async () => {
    if (!cameraRef.current || isRecordingRef.current) return;

    // Nếu có timer, chạy countdown trước khi quay
    if (timerDelay) {
      console.log('⏳ [Timer] Countdown starting:', timerDelay);
      setCountdown(timerDelay);

      let timeLeft = timerDelay;
      countdownRef.current = setInterval(() => {
        timeLeft -= 1;
        if (timeLeft > 0) {
          setCountdown(timeLeft);
        } else {
          clearInterval(countdownRef.current!);
          setCountdown(null);
          console.log('🎬 [Timer] Countdown done, start recording');
          startRecordingNow();
        }
      }, 1000);
      return;
    }

    // Nếu không có timer thì quay luôn
    startRecordingNow();
  };

  const startRecordingNow = async () => {
    try {
      isRecordingRef.current = true;
      setIsRecording(true);
      setRecordingTime(0);

      recordingTimerRef.current = setInterval(() => {
        setRecordingTime((prev) => {
          if (prev >= 60) {
            stopRecording();
            return 60;
          }
          return prev + 1;
        });
      }, 1000);

      console.log('🎥 [startRecordingNow] Recording started');
      const video = await cameraRef.current!.recordAsync({ maxDuration: 60 });

      if (isScreenActiveRef.current && video) {
        setRecordedVideo(video.uri);
      }
    } catch (error) {
      console.error('❌ [startRecordingNow] Error:', error);
      Alert.alert('Error', 'Failed to record video');
      isRecordingRef.current = false;
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    if (cameraRef.current && isRecordingRef.current) {
      try {
        cameraRef.current.stopRecording();
      } catch (e) {
        console.log('⚠️ Error stopping recording:', e);
      }
    }

    isRecordingRef.current = false;
    setIsRecording(false);

    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }
  };

  // Upload from gallery
  const handleUpload = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
        allowsEditing: true,
        quality: 1,
        videoMaxDuration: 60,
      });
      if (!result.canceled && result.assets[0]) {
        setRecordedVideo(result.assets[0].uri);
      }
    } catch (error) {
      console.error('❌ [handleUpload] Error:', error);
      Alert.alert('Error', 'Failed to pick video');
    }
  };

  const handleUseVideo = () => {
    if (recordedVideo) {
      navigation.navigate('EditVideo' as never, { videoUri: recordedVideo });
    }
  };

  const handleRetake = () => {
    setRecordedVideo(null);
    setRecordingTime(0);
    isRecordingRef.current = false;
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Check permissions
  if (!cameraPermission || !micPermission) {
  return <View style={styles.container} />;
}

if (!cameraPermission?.granted || !micPermission?.granted) {
    return (
      <View style={styles.container}>
        <Ionicons name="mic-outline" size={80} color="#666" />
        <Text style={styles.permissionText}>
          Camera & Microphone permissions required
        </Text>
        <TouchableOpacity
          style={styles.permissionButton}
          onPress={async () => {
            await requestCameraPermission();
            await requestMicPermission();
          }}
        >
          <Text style={styles.permissionButtonText}>Grant Permissions</Text>
        </TouchableOpacity>
      </View>
    );
  }


  // Preview recorded video
  if (recordedVideo) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" />
        <View style={styles.topBar}>
          <TouchableOpacity style={styles.nextButton} onPress={handleRetake}>
            <Ionicons name="arrow-back" size={20} color="#fff" />
            <Text style={styles.nextText}>Back</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.nextButton} onPress={handleUseVideo}>
            <Text style={styles.nextText}>Next</Text>
            <Ionicons name="arrow-forward" size={20} color="#fff" />
          </TouchableOpacity>
        </View>

        <Video
          source={{ uri: recordedVideo }}
          style={styles.preview}
          useNativeControls
          resizeMode="cover"
          isLooping
          shouldPlay
        />
      </View>
    );
  }

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
        {/* Đếm ngược Timer */}
        {countdown !== null && (
          <View style={styles.countdownOverlay}>
            <Text style={styles.countdownText}>{countdown}</Text>
          </View>
        )}

        {/* Top bar */}
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

          <TouchableOpacity style={styles.tool}>
            <MaterialIcons name="filter" size={28} color="#fff" />
            <Text style={styles.toolText}>Filter</Text>
          </TouchableOpacity>

          {/* Timer button */}
          <TouchableOpacity
            style={styles.tool}
            onPress={() => {
              const newDelay = timerDelay === 3 ? 10 : timerDelay === 10 ? null : 3;
              console.log('⏰ [Timer] Set to:', newDelay);
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
});

export default CameraRecordScreen;