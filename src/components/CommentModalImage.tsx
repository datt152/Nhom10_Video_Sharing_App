import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  ScrollView,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const scale = (size: number) => (SCREEN_WIDTH / 375) * size;
const moderateScale = (size: number, factor = 0.5) => size + (scale(size) - size) * factor;

interface Comment {
  id: string;
  imageId: string;
  userId: string;
  content: string;
  createdAt: string;
  likeCount: number;
  likedBy: string[];
  replyCount: number;
  parentId: string | null;
  user?: {
    id: string;
    username: string;
    fullname: string;
    avatar: string;
    bio?: string;
  };
  isLiked?: boolean;
  replies?: Comment[];
}

interface CommentModalProps {
  imageId: string;
  comments: Comment[];
  currentUserId: string;
  isVisible: boolean;
  onClose: () => void;
  onAddComment: (content: string, parentId?: string | null) => void;
  onDeleteComment: (commentId: string, parentId?: string | null) => void;
  onLikeComment: (commentId: string) => void;
}

export default function CommentModalImage({
  imageId,
  comments,
  currentUserId,
  isVisible,
  onClose,
  onAddComment,
  onDeleteComment,
  onLikeComment,
}: CommentModalProps) {
  const [commentText, setCommentText] = useState('');
  const [replyingTo, setReplyingTo] = useState<Comment | null>(null);
  const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set());
  const slideAnim = React.useRef(new Animated.Value(SCREEN_HEIGHT)).current;

  useEffect(() => {
    console.log('🎬 CommentModal isVisible:', isVisible);
    console.log('📊 Comments count:', comments.length);
    
    if (isVisible) {
      slideAnim.setValue(SCREEN_HEIGHT);
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 50,
        friction: 8,
      }).start(() => {
        console.log('✅ Modal animation completed');
      });
    }
  }, [isVisible]);

  const handleSendComment = () => {
    if (commentText.trim()) {
      onAddComment(commentText.trim(), replyingTo?.id || null);
      setCommentText('');
      setReplyingTo(null);
    }
  };

  const handleReply = (comment: Comment) => {
    setReplyingTo(comment);
  };

  const toggleExpand = (commentId: string) => {
    setExpandedComments((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(commentId)) {
        newSet.delete(commentId);
      } else {
        newSet.add(commentId);
      }
      return newSet;
    });
  };

  const handleDelete = (commentId: string, parentId: string | null) => {
    onDeleteComment(commentId, parentId);
  };

  const formatTime = (dateString: string) => {
    const now = new Date();
    const commentDate = new Date(dateString);
    const diffInMs = now.getTime() - commentDate.getTime();
    const diffInMins = Math.floor(diffInMs / 60000);
    
    if (diffInMins < 1) return 'Just now';
    if (diffInMins < 60) return `${diffInMins} mins ago`;
    
    const diffInHours = Math.floor(diffInMins / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    
    return commentDate.toLocaleDateString();
  };

  const renderReply = (reply: Comment, parentId: string) => {
    const canDelete = reply.userId === currentUserId;
    const avatarUrl = reply.user?.avatar || 'https://via.placeholder.com/32';
    const username = reply.user?.username || 'Unknown';

    return (
      <View style={styles.replyItem} key={reply.id}>
        <Image source={{ uri: avatarUrl }} style={styles.replyAvatar} />
        <View style={styles.commentContent}>
          <View style={styles.commentHeader}>
            <Text style={styles.commentUsername}>{username}</Text>
            <Text style={styles.commentTime}>{formatTime(reply.createdAt)}</Text>
          </View>
          <Text style={styles.commentText}>{reply.content}</Text>
        </View>
        <View style={styles.actionsColumn}>
          <TouchableOpacity style={styles.likeButton} onPress={() => onLikeComment(reply.id)}>
            <Ionicons
              name={reply.isLiked ? 'heart' : 'heart-outline'}
              size={moderateScale(18)}
              color={reply.isLiked ? '#FF3B5C' : '#666'}
            />
            {reply.likeCount > 0 && <Text style={styles.likeCount}>{reply.likeCount}</Text>}
          </TouchableOpacity>
          {canDelete && (
            <TouchableOpacity style={styles.deleteButton} onPress={() => handleDelete(reply.id, parentId)}>
              <Ionicons name="trash-outline" size={moderateScale(14)} color="#999" />
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  const renderComment = (item: Comment) => {
    const isExpanded = expandedComments.has(item.id);
    const hasReplies = item.replies && item.replies.length > 0;
    const canDelete = item.userId === currentUserId;
    const avatarUrl = item.user?.avatar || 'https://via.placeholder.com/40';
    const username = item.user?.username || 'Unknown';

    return (
      <View style={styles.commentWrapper} key={item.id}>
        <View style={styles.commentItem}>
          <Image source={{ uri: avatarUrl }} style={styles.commentAvatar} />
          <View style={styles.commentContent}>
            <View style={styles.commentHeader}>
              <Text style={styles.commentUsername}>{username}</Text>
              <Text style={styles.commentTime}>{formatTime(item.createdAt)}</Text>
            </View>
            <Text style={styles.commentText}>{item.content}</Text>
            <View style={styles.commentActions}>
              <TouchableOpacity style={styles.replyButton} onPress={() => handleReply(item)}>
                <Text style={styles.replyButtonText}>Reply</Text>
              </TouchableOpacity>
              {hasReplies && (
                <TouchableOpacity style={styles.viewRepliesButton} onPress={() => toggleExpand(item.id)}>
                  <Text style={styles.viewRepliesText}>
                    {isExpanded ? 'Hide' : `View ${item.replyCount}`} {item.replyCount === 1 ? 'reply' : 'replies'}
                  </Text>
                  <Ionicons
                    name={isExpanded ? 'chevron-up' : 'chevron-down'}
                    size={moderateScale(14)}
                    color="#666"
                  />
                </TouchableOpacity>
              )}
            </View>
          </View>
          <View style={styles.actionsColumn}>
            <TouchableOpacity style={styles.likeButton} onPress={() => onLikeComment(item.id)}>
              <Ionicons
                name={item.isLiked ? 'heart' : 'heart-outline'}
                size={moderateScale(20)}
                color={item.isLiked ? '#FF3B5C' : '#666'}
              />
              {item.likeCount > 0 && <Text style={styles.likeCount}>{item.likeCount}</Text>}
            </TouchableOpacity>
            {canDelete && (
              <TouchableOpacity style={styles.deleteButton} onPress={() => handleDelete(item.id, null)}>
                <Ionicons name="trash-outline" size={moderateScale(16)} color="#999" />
              </TouchableOpacity>
            )}
          </View>
        </View>
        {hasReplies && isExpanded && (
          <View style={styles.repliesContainer}>
            {item.replies!.map((reply) => renderReply(reply, item.id))}
          </View>
        )}
      </View>
    );
  };

  const currentUserComment = comments.find(c => c.userId === currentUserId);
  const currentUserAvatar = currentUserComment?.user?.avatar || 'https://randomuser.me/api/portraits/men/45.jpg';

  return (
    <SafeAreaView style={styles.fullScreen}>
      <TouchableOpacity 
        style={styles.backdrop} 
        activeOpacity={1} 
        onPress={onClose}
      />
      
      <Animated.View 
        style={[
          styles.modalContent,
          { transform: [{ translateY: slideAnim }] }
        ]}
      >
        <View style={styles.modalInner}>
          <View style={styles.handleContainer}>
            <View style={styles.handle} />
          </View>

          <View style={styles.header}>
            <Text style={styles.headerTitle}>
              {comments.reduce((sum, c) => sum + 1 + (c.replies?.length || 0), 0)} comments
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={moderateScale(24)} color="#000" />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.commentsList}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {comments.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Ionicons name="chatbubble-outline" size={moderateScale(48)} color="#ccc" />
                <Text style={styles.emptyText}>No comments yet</Text>
                <Text style={styles.emptySubtext}>Be the first to comment!</Text>
              </View>
            ) : (
              comments.map((comment) => renderComment(comment))
            )}
          </ScrollView>

          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
          >
            {replyingTo && (
              <View style={styles.replyingToBar}>
                <Text style={styles.replyingToText}>
                  Replying to @{replyingTo.user?.username}
                </Text>
                <TouchableOpacity onPress={() => setReplyingTo(null)}>
                  <Ionicons name="close" size={moderateScale(18)} color="#666" />
                </TouchableOpacity>
              </View>
            )}

            <View style={styles.inputContainer}>
              <Image source={{ uri: currentUserAvatar }} style={styles.inputAvatar} />
              <TextInput
                style={styles.input}
                placeholder={
                  replyingTo
                    ? `Reply to @{replyingTo.user?.username}...`
                    : 'Leave comment...'
                }
                placeholderTextColor="#999"
                value={commentText}
                onChangeText={setCommentText}
                multiline
                maxLength={500}
              />
              <TouchableOpacity
                style={[styles.sendButton, !commentText.trim() && styles.sendButtonDisabled]}
                onPress={handleSendComment}
                disabled={!commentText.trim()}
              >
                <Ionicons
                  name="send"
                  size={moderateScale(20)}
                  color={commentText.trim() ? '#FF3B5C' : '#ccc'}
                />
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  fullScreen: {
    flex: 1,
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: moderateScale(20),
    borderTopRightRadius: moderateScale(20),
    height: SCREEN_HEIGHT * 0.75,
    ...Platform.select({
      android: {
        elevation: 24,
      },
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -3 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
      },
    }),
  },
  modalInner: {
    flex: 1,
    backgroundColor: '#fff',
    borderTopLeftRadius: moderateScale(20),
    borderTopRightRadius: moderateScale(20),
  },
  handleContainer: {
    alignItems: 'center',
    paddingVertical: moderateScale(8),
    backgroundColor: '#fff',
  },
  handle: {
    width: scale(40),
    height: moderateScale(4),
    backgroundColor: '#ddd',
    borderRadius: moderateScale(2),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: scale(16),
    paddingVertical: moderateScale(12),
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    backgroundColor: '#fff',
  },
  headerTitle: {
    fontSize: moderateScale(16),
    fontWeight: '700',
    color: '#000',
  },
  closeButton: {
    padding: moderateScale(4),
  },
  scrollView: {
    flex: 1,
    backgroundColor: '#fff',
  },
  commentsList: {
    paddingHorizontal: scale(16),
    paddingTop: moderateScale(12),
    paddingBottom: moderateScale(20),
  },
  commentWrapper: {
    marginBottom: moderateScale(16),
  },
  commentItem: {
    flexDirection: 'row',
    marginBottom: moderateScale(8),
  },
  commentAvatar: {
    width: moderateScale(40),
    height: moderateScale(40),
    borderRadius: moderateScale(20),
    marginRight: scale(12),
    backgroundColor: '#f0f0f0',
  },
  commentContent: {
    flex: 1,
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: moderateScale(4),
  },
  commentUsername: {
    fontSize: moderateScale(14),
    fontWeight: '600',
    color: '#000',
    marginRight: scale(8),
  },
  commentTime: {
    fontSize: moderateScale(12),
    color: '#999',
  },
  commentText: {
    fontSize: moderateScale(14),
    color: '#333',
    lineHeight: moderateScale(20),
    marginBottom: moderateScale(6),
  },
  commentActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(16),
  },
  replyButton: {
    paddingVertical: moderateScale(4),
  },
  replyButtonText: {
    fontSize: moderateScale(12),
    fontWeight: '600',
    color: '#666',
  },
  viewRepliesButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(4),
  },
  viewRepliesText: {
    fontSize: moderateScale(12),
    fontWeight: '600',
    color: '#007AFF',
  },
  actionsColumn: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: moderateScale(10),
    paddingLeft: scale(8),
  },
  repliesContainer: {
    marginLeft: scale(52),
    borderLeftWidth: 2,
    borderLeftColor: '#f0f0f0',
    paddingLeft: scale(12),
  },
  replyItem: {
    flexDirection: 'row',
    marginBottom: moderateScale(12),
  },
  replyAvatar: {
    width: moderateScale(32),
    height: moderateScale(32),
    borderRadius: moderateScale(16),
    marginRight: scale(10),
    backgroundColor: '#f0f0f0',
  },
  likeButton: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: moderateScale(4),
  },
  likeCount: {
    fontSize: moderateScale(11),
    color: '#666',
    marginTop: moderateScale(2),
  },
  deleteButton: {
    padding: moderateScale(6),
    borderRadius: moderateScale(4),
  },
  replyingToBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: scale(16),
    paddingVertical: moderateScale(8),
    backgroundColor: '#f8f8f8',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  replyingToText: {
    fontSize: moderateScale(13),
    color: '#666',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: scale(16),
    paddingVertical: moderateScale(12),
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    backgroundColor: '#fff',
  },
  inputAvatar: {
    width: moderateScale(32),
    height: moderateScale(32),
    borderRadius: moderateScale(16),
    marginRight: scale(12),
    backgroundColor: '#f0f0f0',
  },
  input: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    borderRadius: moderateScale(20),
    paddingHorizontal: scale(16),
    paddingVertical: moderateScale(10),
    fontSize: moderateScale(14),
    color: '#000',
    maxHeight: 100,
    minHeight: 40,
  },
  sendButton: {
    marginLeft: scale(12),
    padding: moderateScale(8),
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: moderateScale(60),
  },
  emptyText: {
    fontSize: moderateScale(16),
    fontWeight: '600',
    color: '#666',
    marginTop: moderateScale(16),
  },
  emptySubtext: {
    fontSize: moderateScale(14),
    color: '#999',
    marginTop: moderateScale(8),
  },
});