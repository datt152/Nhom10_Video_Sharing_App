import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
  StyleSheet,
  Dimensions,
  Animated,
  TouchableWithoutFeedback,
  Keyboard,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useUser } from '../hooks/useUser';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface Comment {
  id: string;
  videoId: string;
  userId: string;
  content: string;
  createdAt: string;
  likeCount: number;
  likedBy: string[];
  replyCount: number;
  parentId: string | null;
  user?: any;
  isLiked?: boolean;
  replies?: Comment[];
}

interface CommentModalProps {
  videoId: string;
  comments: Comment[];
  currentUserId: string;
  isVisible: boolean;
  onClose: () => void;
  onAddComment: (content: string, parentId?: string | null) => Promise<void>;
  onDeleteComment: (commentId: string, parentId?: string | null) => Promise<boolean>;
  onLikeComment: (commentId: string) => Promise<void>;
}

const CommentModal: React.FC<CommentModalProps> = ({
  videoId,
  comments,
  currentUserId,
  isVisible,
  onClose,
  onAddComment,
  onDeleteComment,
  onLikeComment,
}) => {
  const [commentText, setCommentText] = useState('');
  const [replyingTo, setReplyingTo] = useState<Comment | null>(null);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const flatListRef = useRef<FlatList>(null);
  const {currentUser} = useUser(currentUserId);
  // ✅ Lắng nghe keyboard để co modal
  useEffect(() => {
    const showSubscription = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (e) => {
        setKeyboardHeight(e.endCoordinates.height);
      }
    );

    const hideSubscription = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        setKeyboardHeight(0);
      }
    );

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  useEffect(() => {
    if (isVisible) {
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
          tension: 65,
          friction: 11,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: SCREEN_HEIGHT,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isVisible]);

  const handleClose = () => {
    Keyboard.dismiss();
    setKeyboardHeight(0);
    onClose();
  };

  const handleSendComment = async () => {
    if (!commentText.trim()) return;

    try {
      await onAddComment(commentText.trim(), replyingTo?.id || null);
      setCommentText('');
      setReplyingTo(null);
      Keyboard.dismiss();
      
      setTimeout(() => {
        flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
      }, 100);
    } catch (error) {
      console.error('Error sending comment:', error);
    }
  };

  const handleReply = (comment: Comment) => {
    setReplyingTo(comment);
  };

  const handleCancelReply = () => {
    setReplyingTo(null);
  };

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d`;
    return `${Math.floor(seconds / 604800)}w`;
  };

  const renderComment = ({ item }: { item: Comment }) => (
    <View style={styles.commentContainer}>
      <Image
        source={{ uri: item.user?.avatar || 'https://via.placeholder.com/40' }}
        style={styles.commentAvatar}
      />
      <View style={styles.commentContent}>
        <View style={styles.commentHeader}>
          <Text style={styles.commentUsername}>{item.user?.username || 'Unknown'}</Text>
          <Text style={styles.commentTime}>{formatTimeAgo(item.createdAt)}</Text>
        </View>
        <Text style={styles.commentText}>{item.content}</Text>
        
        <View style={styles.commentActions}>
          <TouchableOpacity
            style={styles.commentActionButton}
            onPress={() => onLikeComment(item.id)}
          >
            <Ionicons
              name={item.isLiked ? 'heart' : 'heart-outline'}
              size={16}
              color={item.isLiked ? '#FF3B5C' : '#666'}
            />
            <Text style={[styles.commentActionText, item.isLiked && styles.likedText]}>
              {item.likeCount > 0 ? item.likeCount : 'Like'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.commentActionButton}
            onPress={() => handleReply(item)}
          >
            <Ionicons name="chatbubble-outline" size={16} color="#666" />
            <Text style={styles.commentActionText}>Reply</Text>
          </TouchableOpacity>

          {item.userId === currentUserId && (
            <TouchableOpacity
              style={styles.commentActionButton}
              onPress={() => onDeleteComment(item.id, item.parentId)}
            >
              <Ionicons name="trash-outline" size={16} color="#FF3B5C" />
              <Text style={[styles.commentActionText, { color: '#FF3B5C' }]}>Delete</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Replies */}
        {item.replies && item.replies.length > 0 && (
          <View style={styles.repliesContainer}>
            {item.replies.map((reply) => (
              <View key={reply.id} style={styles.replyContainer}>
                <Image
                  source={{ uri: reply.user?.avatar || 'https://via.placeholder.com/32' }}
                  style={styles.replyAvatar}
                />
                <View style={styles.replyContent}>
                  <View style={styles.commentHeader}>
                    <Text style={styles.replyUsername}>{reply.user?.username || 'Unknown'}</Text>
                    <Text style={styles.commentTime}>{formatTimeAgo(reply.createdAt)}</Text>
                  </View>
                  <Text style={styles.replyText}>{reply.content}</Text>
                  
                  <View style={styles.commentActions}>
                    <TouchableOpacity
                      style={styles.commentActionButton}
                      onPress={() => onLikeComment(reply.id)}
                    >
                      <Ionicons
                        name={reply.isLiked ? 'heart' : 'heart-outline'}
                        size={14}
                        color={reply.isLiked ? '#FF3B5C' : '#666'}
                      />
                      <Text style={[styles.replyActionText, reply.isLiked && styles.likedText]}>
                        {reply.likeCount > 0 ? reply.likeCount : 'Like'}
                      </Text>
                    </TouchableOpacity>

                    {reply.userId === currentUserId && (
                      <TouchableOpacity
                        style={styles.commentActionButton}
                        onPress={() => onDeleteComment(reply.id, item.id)}
                      >
                        <Ionicons name="trash-outline" size={14} color="#FF3B5C" />
                        <Text style={[styles.replyActionText, { color: '#FF3B5C' }]}>Delete</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}
      </View>
    </View>
  );

  if (!isVisible) return null;
const modalHeight = keyboardHeight > 0 
  ? SCREEN_HEIGHT*0.75 - keyboardHeight 
  : SCREEN_HEIGHT * 0.75; 
  return (
    <View style={styles.modalOverlay}>
      {/* Backdrop */}
      <TouchableWithoutFeedback onPress={handleClose}>
        <Animated.View
          style={[
            styles.backdrop,
            {
              opacity: backdropOpacity,
            },
          ]}
        />
      </TouchableWithoutFeedback>

      {/* Modal Content */}
      <Animated.View
        style={[
          styles.modalContainer,
          {
            top: SCREEN_HEIGHT*0.25,
            bottom: 0,
          },
        ]}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.dragHandle} />
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>
              {comments.length} {comments.length === 1 ? 'Comment' : 'Comments'}
            </Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <Ionicons name="close" size={28} color="#000" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Comments List */}
        <FlatList
          ref={flatListRef}
          data={comments}
          renderItem={renderComment}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.commentsList}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="chatbubble-outline" size={64} color="#ccc" />
              <Text style={styles.emptyText}>No comments yet</Text>
              <Text style={styles.emptySubtext}>Be the first to comment!</Text>
            </View>
          }
        />

        {/* Reply indicator */}
        {replyingTo && (
          <View style={styles.replyingContainer}>
            <Ionicons name="arrow-undo" size={16} color="#666" />
            <Text style={styles.replyingText}>
              Replying to @{replyingTo.user?.username}
            </Text>
            <TouchableOpacity onPress={handleCancelReply}>
              <Ionicons name="close-circle" size={20} color="#666" />
            </TouchableOpacity>
          </View>
        )}

        {/* Input */}
        <View style={styles.inputContainer}>
          <Image
            source={{ uri: currentUser?.avatar }}
            style={styles.inputAvatar}
          />
          <TextInput
            style={styles.input}
            placeholder={replyingTo ? `Reply to @${replyingTo.user?.username}...` : 'Add a comment...'}
            placeholderTextColor="#999"
            value={commentText}
            onChangeText={setCommentText}
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              !commentText.trim() && styles.sendButtonDisabled,
            ]}
            onPress={handleSendComment}
            disabled={!commentText.trim()}
          >
            <Ionicons
              name="send"
              size={20}
              color={commentText.trim() ? '#FF3B5C' : '#ccc'}
            />
          </TouchableOpacity>
        </View>
      </Animated.View>
    </View>
  );
};

export default CommentModal;

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  modalContainer: {
    position: 'absolute',
    width: '100%',
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 5,
  },
  header: {
    paddingTop: 8,
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  dragHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#ddd',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 12,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
  },
  closeButton: {
    padding: 4,
  },
  commentsList: {
    paddingVertical: 12,
    paddingBottom: 120,
  },
  commentContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
  },
  commentAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  commentContent: {
    flex: 1,
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  commentUsername: {
    fontSize: 14,
    fontWeight: '700',
    color: '#000',
    marginRight: 8,
  },
  commentTime: {
    fontSize: 12,
    color: '#999',
  },
  commentText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
    marginBottom: 8,
  },
  commentActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  commentActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  commentActionText: {
    fontSize: 13,
    color: '#666',
    fontWeight: '600',
  },
  likedText: {
    color: '#FF3B5C',
  },
  repliesContainer: {
    marginTop: 12,
    marginLeft: 12,
    paddingLeft: 12,
    borderLeftWidth: 2,
    borderLeftColor: '#f0f0f0',
  },
  replyContainer: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  replyAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 10,
  },
  replyContent: {
    flex: 1,
  },
  replyUsername: {
    fontSize: 13,
    fontWeight: '700',
    color: '#000',
    marginRight: 8,
  },
  replyText: {
    fontSize: 13,
    color: '#333',
    lineHeight: 18,
    marginBottom: 6,
  },
  replyActionText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#999',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#ccc',
    marginTop: 4,
  },
  replyingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#f8f8f8',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    gap: 8,
    position: 'absolute',
    bottom: 65,
    left: 0,
    right: 0,
  },
  replyingText: {
    flex: 1,
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    backgroundColor: '#fff',
    gap: 12,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  inputAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  input: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14,
    color: '#000',
    maxHeight: 100,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
});