import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const NotificationScreen: React.FC = () => {
  const navigation = useNavigation()
  const notifications = [
    { id: 1, type: 'like', user: 'Mai Anh', time: '2m ago' },
    { id: 2, type: 'comment', user: 'Long Nguyen', time: '10m ago' },
    { id: 3, type: 'follow', user: 'Nhi Tran', time: '1h ago' },
    { id: 4, type: 'mention', user: 'Tuan Le', time: '3h ago' },
    { id: 5, type: 'like', user: 'Thao Vo', time: '5h ago' },
  ];

  const getIcon = (type: string) => {
    switch (type) {
      case 'like':
        return <Ionicons name="heart" size={22} color="#FF4EB8" />;
      case 'comment':
        return <Ionicons name="chatbubble-ellipses" size={22} color="#FF4EB8" />;
      case 'follow':
        return <Ionicons name="person-add" size={22} color="#FF4EB8" />;
      default:
        return <Ionicons name="alert-circle" size={22} color="#FF4EB8" />;
    }
  };

  return (
    <View style={styles.container}>
      
      <View style={styles.header}>
         <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={26} color="#FF4EB8" />
        </TouchableOpacity>
        <Text style={styles.title}>Notifications</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {notifications.map((item) => (
          <View key={item.id} style={styles.card}>
            <Image
              source={{ uri: `https://i.pravatar.cc/100?img=${item.id + 3}` }}
              style={styles.avatar}
            />
            <View style={styles.info}>
              <Text style={styles.message}>
                <Text style={styles.user}>{item.user}</Text>{' '}
                {item.type === 'like'
                  ? 'liked your video.'
                  : item.type === 'comment'
                  ? 'commented on your post.'
                  : item.type === 'follow'
                  ? 'started following you.'
                  : 'mentioned you in a post.'}
              </Text>
              <Text style={styles.time}>{item.time}</Text>
            </View>
            {getIcon(item.type)}
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

export default NotificationScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    paddingRight: 15,
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FF4EB8',
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF5FA',
    marginHorizontal: 15,
    marginVertical: 8,
    padding: 12,
    borderRadius: 15,
    shadowColor: '#FF4EB8',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 1,
  },
  avatar: {
    width: 45,
    height: 45,
    borderRadius: 22,
    marginRight: 10,
  },
  info: {
    flex: 1,
  },
  user: {
    fontWeight: '600',
    color: '#111',
  },
  message: {
    color: '#333',
  },
  time: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
});
