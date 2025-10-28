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
  
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isRecordingRef = useRef<boolean>(false); // Track recording state reliably

  // Reset màn hình khi focus lại
  useFocusEffect(
  React.useCallback(() => {
    console.log('📱 [useFocusEffect] Screen focused');
    isScreenActiveRef.current = true; // ✅ Màn hình đang active

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

      // Reset tất cả state khi rời màn hình
      setRecordedVideo(null);
      setRecordingTime(0);
      setIsRecording(false);
      setTorchEnabled(false);
      setCameraType('back');
      isRecordingRef.current = false;
    };
  }, [])
);


  // Cleanup on unmount
  useEffect(() => {
    console.log('🎬 [useEffect] Component mounted');
    
    return () => {
      console.log('💀 [useEffect] Component unmounting');
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
      // Reset ref khi unmount
      isRecordingRef.current = false;
    };
  }, []);

  // Request permission if not granted
  useEffect(() => {
  (async () => {
    if (!cameraPermission?.granted) {
      await requestCameraPermission();
    }
    if (!micPermission?.granted) {
      await requestMicPermission();
    }
  })();
}, [cameraPermission, micPermission]);


  // Close camera
  const handleClose = () => {
    console.log('❌ [handleClose] Closing camera');
    console.log('❌ [handleClose] isRecordingRef.current:', isRecordingRef.current);
    
    if (isRecordingRef.current) {
      console.log('⏹️ [handleClose] Stopping recording before close');
      stopRecording();
    }
    navigation.goBack();
  };

  // Flip camera
  const flipCamera = () => {
    const newType = cameraType === 'back' ? 'front' : 'back';
    console.log('🔄 [Flip] Camera flipped from', cameraType, 'to', newType);
    setCameraType(newType);
  };

  // Toggle flash
  const toggleFlash = () => {
  const newTorch = !torchEnabled;
  console.log('⚡ [Flash] Torch toggled:', newTorch);
  setTorchEnabled(newTorch);
};

  // Start recording
  const startRecording = async () => {
    console.log('🎬 [startRecording] Called');
    console.log('🎬 [startRecording] isRecordingRef.current:', isRecordingRef.current);
    
    if (!cameraRef.current) {
      console.log('❌ [startRecording] Camera ref is null');
      return;
    }

    // Prevent starting if already recording
    if (isRecordingRef.current) {
      console.log('⚠️ [startRecording] Already recording, skipping...');
      return;
    }

    try {
      console.log('▶️ [startRecording] Setting recording state to true');
      isRecordingRef.current = true; // ✅ Set ref FIRST
      setIsRecording(true);
      setRecordingTime(0);

      // Start timer
      console.log('⏱️ [startRecording] Starting timer');
      recordingTimerRef.current = setInterval(() => {
        setRecordingTime((prev) => {
          const newTime = prev + 1;
          console.log('⏱️ [Timer] Recording time:', newTime, 'seconds');
          
          if (newTime >= 60) {
            console.log('⏱️ [Timer] Max duration reached, stopping...');
            stopRecording();
            return 60;
          }
          return newTime;
        });
      }, 1000);

      console.log('🎬 [startRecording] Starting camera recording...');
      
      const video = await cameraRef.current.recordAsync({
        maxDuration: 60,
      });

      if (isScreenActiveRef.current && video) {
        console.log('✅ [startRecording] Video recorded successfully');
        console.log('📹 [startRecording] Video URI:', video.uri);
        setRecordedVideo(video.uri);
      }
    } catch (error) {
      console.error('❌ [startRecording] Error:', error);
      Alert.alert('Error', 'Failed to record video');
      isRecordingRef.current = false; // ✅ Reset ref on error
      setIsRecording(false);
      
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
        recordingTimerRef.current = null;
      }
    }
  };

  // Stop recording
  const stopRecording = () => {
    console.log('⏹️ [stopRecording] Called');
    console.log('⏹️ [stopRecording] isRecordingRef.current:', isRecordingRef.current);
    console.log('⏹️ [stopRecording] cameraRef.current:', !!cameraRef.current);
    
    if (cameraRef.current && isRecordingRef.current) {
      console.log('⏹️ [stopRecording] Stopping camera recording...');
      try {
        cameraRef.current.stopRecording();
        isRecordingRef.current = false; // ✅ Reset ref
        setIsRecording(false);
        
        if (recordingTimerRef.current) {
          console.log('⏱️ [stopRecording] Clearing timer');
          clearInterval(recordingTimerRef.current);
          recordingTimerRef.current = null;
        }
        console.log('✅ [stopRecording] Recording stopped successfully');
      } catch (error) {
        console.log('⚠️ [stopRecording] Error:', error);
        isRecordingRef.current = false; // ✅ Reset ref even on error
        setIsRecording(false);
      }
    } else {
      console.log('⚠️ [stopRecording] Cannot stop - not recording or camera ref null');
    }
  };

  // Upload from gallery
  const handleUpload = async () => {
    console.log('📁 [handleUpload] Opening gallery...');
    
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
        allowsEditing: true,
        quality: 1,
        videoMaxDuration: 60,
      });

      console.log('📁 [handleUpload] Result:', result);

      if (!result.canceled && result.assets[0]) {
        console.log('✅ [handleUpload] Video selected:', result.assets[0].uri);
        setRecordedVideo(result.assets[0].uri);
      } else {
        console.log('❌ [handleUpload] Selection canceled');
      }
    } catch (error) {
      console.error('❌ [handleUpload] Error:', error);
      Alert.alert('Error', 'Failed to pick video');
    }
  };

  // Use recorded video
  const handleUseVideo = () => {
    console.log('➡️ [handleUseVideo] Navigating to EditVideo');
    console.log('📹 [handleUseVideo] Video URI:', recordedVideo);
    
    if (recordedVideo) {
      navigation.navigate("EditVideo" as never, { videoUri: recordedVideo });
    } else {
      console.log('❌ [handleUseVideo] No video to use');
    }
  };

  // Retake video
  const handleRetake = () => {
    console.log('🔄 [handleRetake] Retaking video');
    console.log('🔄 [handleRetake] Previous video:', recordedVideo);
    
    setRecordedVideo(null);
    setRecordingTime(0);
    isRecordingRef.current = false; // ✅ Reset ref
    
    console.log('✅ [handleRetake] States reset');
  };

  // Format time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Check permissions
  if (!cameraPermission || !micPermission) {
  return <View style={styles.container} />;
}

if (!cameraPermission.granted || !micPermission.granted) {
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
    console.log('🎥 [Render] Showing preview for:', recordedVideo);
    
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" />
        {/* Top bar */}
        <View style={styles.topBar}>
          <TouchableOpacity style={styles.nextButton} onPress={handleRetake}>
            <Ionicons name="arrow-back" size={20} color="#fff" />
            <Text style={styles.nextText}>Back</Text>
          </TouchableOpacity>
          <View style={styles.topButton} />
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

  console.log('📸 [Render] Showing camera view');
  console.log('📸 [Render] Camera type:', cameraType);
  console.log('📸 [Render] Flash:', torchEnabled);
  console.log('📸 [Render] Is recording:', isRecording);
  console.log('📸 [Render] Is recording (ref):', isRecordingRef.current);

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

        {/* Right side tools */}
        <View style={styles.rightTools}>
          <TouchableOpacity style={styles.tool} onPress={flipCamera}>
            <Ionicons name="camera-reverse-outline" size={28} color="#fff" />
            <Text style={styles.toolText}>Flip</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.tool}>
            <MaterialIcons name="filter" size={28} color="#fff" />
            <Text style={styles.toolText}>Filter</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.tool}>
            <Ionicons name="time-outline" size={28} color="#fff" />
            <Text style={styles.toolText}>Timer</Text>
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
          {/* Effects button */}
          <TouchableOpacity style={styles.bottomButton}>
            <View style={styles.effectButton}>
              <Ionicons name="happy-outline" size={24} color="#fff" />
            </View>
            <Text style={styles.bottomButtonText}>Effect</Text>
          </TouchableOpacity>

          {/* Record button */}
          <View style={styles.recordButtonContainer}>
            {isRecording ? (
              <TouchableOpacity
                style={styles.recordButton}
                onPress={stopRecording}
              >
                <View style={styles.stopButton} />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles.recordButton}
                onPress={startRecording}
              >
                <View style={styles.recordInner} />
              </TouchableOpacity>
            )}
          </View>

          {/* Upload button */}
          <TouchableOpacity style={styles.bottomButton} onPress={handleUpload}>
            <View style={styles.uploadButton}>
              <Ionicons name="images-outline" size={24} color="#fff" />
            </View>
            <Text style={styles.bottomButtonText}>Upload</Text>
          </TouchableOpacity>
        </View>

        {/* Add audio button (top center) */}
        <TouchableOpacity style={styles.addAudioButton}>
          <Ionicons name="musical-note" size={18} color="#000" />
          <Text style={styles.addAudioText}>Add audio</Text>
        </TouchableOpacity>
      </CameraView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  camera: {
    flex: 1,
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  permissionText: {
    color: '#fff',
    fontSize: 18,
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 30,
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
  
  // Top bar
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: StatusBar.currentHeight || 20,
    paddingHorizontal: 20,
    paddingBottom: 10,
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

  // Add audio button
  addAudioButton: {
    position: 'absolute',
    top: StatusBar.currentHeight ? StatusBar.currentHeight + 50 : 90,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  addAudioText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },

  // Right tools
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
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },

  // Bottom controls
  bottomControls: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  bottomButton: {
    alignItems: 'center',
  },
  bottomButtonText: {
    color: '#fff',
    fontSize: 12,
    marginTop: 8,
    fontWeight: '500',
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

  // Record button
  recordButtonContainer: {
    position: 'relative',
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

  // Preview mode
  preview: {
    flex: 1,
  },
  previewTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  previewActions: {
    position: 'absolute',
    bottom: 40,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  retakeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    gap: 8,
  },
  actionText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF3B5C',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
    gap: 8,
  },
  nextText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default CameraRecordScreen;