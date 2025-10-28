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
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { Video } from 'expo-av';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const CameraRecordScreen: React.FC = () => {
  const navigation = useNavigation();
  const cameraRef = useRef<CameraView>(null);
  
  const [permission, requestPermission] = useCameraPermissions();
  const [cameraType, setCameraType] = useState<CameraType>('back');
  const [flash, setFlash] = useState<'off' | 'on'>('off');
  const [isRecording, setIsRecording] = useState(false);
  const [recordedVideo, setRecordedVideo] = useState<string | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
    };
  }, []);

  // Request permission if not granted
  useEffect(() => {
    if (permission && !permission.granted && permission.canAskAgain) {
      requestPermission();
    }
  }, [permission]);

  // Close camera
  const handleClose = () => {
    if (isRecording) {
      stopRecording();
    }
    navigation.goBack();
  };

  // Flip camera
  const flipCamera = () => {
    setCameraType(current => current === 'back' ? 'front' : 'back');
  };

  // Toggle flash
  const toggleFlash = () => {
    setFlash(current => current === 'off' ? 'on' : 'off');
  };

  // Start recording
  const startRecording = async () => {
    if (!cameraRef.current) return;

    try {
      setIsRecording(true);
      setRecordingTime(0);

      // Start timer
      recordingTimerRef.current = setInterval(() => {
        setRecordingTime((prev) => {
          if (prev >= 60) {
            stopRecording();
            return 60;
          }
          return prev + 1;
        });
      }, 1000);

      console.log('🎬 Starting recording...');
      
      const video = await cameraRef.current.recordAsync({
        maxDuration: 60,
      });

      if (video) {
        setRecordedVideo(video.uri);
        console.log('✅ Video recorded:', video.uri);
      }
    } catch (error) {
      console.error('❌ Recording error:', error);
      Alert.alert('Error', 'Failed to record video');
      setIsRecording(false);
      
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
        recordingTimerRef.current = null;
      }
    }
  };

  // Stop recording
  const stopRecording = () => {
    if (cameraRef.current && isRecording) {
      console.log('⏹️ Stopping recording...');
      cameraRef.current.stopRecording();
      setIsRecording(false);
      
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
        recordingTimerRef.current = null;
      }
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
        console.log('✅ Video selected from gallery:', result.assets[0].uri);
      }
    } catch (error) {
      console.error('❌ Error picking video:', error);
      Alert.alert('Error', 'Failed to pick video');
    }
  };

  // Use recorded video
  const handleUseVideo = () => {
    if (recordedVideo) {
       navigation.navigate("EditVideo" as never, { videoUri: recordedVideo });
    }
  };

  // Retake video
  const handleRetake = () => {
    setRecordedVideo(null);
    setRecordingTime(0);
  };

  // Format time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Check permissions
  if (!permission) {
    return <View style={styles.container} />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <View style={styles.permissionContainer}>
          <Ionicons name="camera-outline" size={80} color="#666" />
          <Text style={styles.permissionText}>Camera permission required</Text>
          <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
            <Text style={styles.permissionButtonText}>Grant Permission</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Preview recorded video
  if (recordedVideo) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" />
        
        <Video
          source={{ uri: recordedVideo }}
          style={styles.preview}
          useNativeControls
          isLooping
          shouldPlay
        />

        {/* Top bar */}
        <View style={styles.topBar}>
          <TouchableOpacity style={styles.topButton} onPress={handleRetake}>
            <Ionicons name="arrow-back" size={28} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.previewTitle}>Preview</Text>
          <View style={styles.topButton} />
        </View>

        {/* Bottom actions */}
        <View style={styles.previewActions}>
          <TouchableOpacity style={styles.retakeButton} onPress={handleRetake}>
            <Ionicons name="refresh" size={24} color="#fff" />
            <Text style={styles.actionText}>Retake</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.nextButton} onPress={handleUseVideo}>
            <Text style={styles.nextText}>Next</Text>
            <Ionicons name="arrow-forward" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
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
        flash={flash}
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
              name={flash === 'off' ? 'flash-off' : 'flash'} 
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
            
            {/* Progress ring */}
            {isRecording && (
              <View style={styles.progressRing}>
                <View 
                  style={[
                    styles.progressFill,
                    { 
                      transform: [
                        { 
                          rotate: `${(recordingTime / 60) * 360}deg` 
                        }
                      ] 
                    }
                  ]} 
                />
              </View>
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
    backgroundColor: '#000',
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
    paddingTop: StatusBar.currentHeight || 40,
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
  progressRing: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  progressFill: {
    width: '100%',
    height: '100%',
    borderRadius: 40,
    borderWidth: 3,
    borderColor: '#FF3B5C',
    borderRightColor: 'transparent',
    borderBottomColor: 'transparent',
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