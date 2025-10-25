import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const imageList = [
    { id: 1, uri: 'https://placekitten.com/250/250', isPublic: true },
    { id: 2, uri: 'https://placekitten.com/251/250', isPublic: false },
];

const ProfileImagesTab: React.FC = () => {
    const [filter, setFilter] = useState<'public' | 'private'>('public');
    const filtered = imageList.filter((i) =>
        filter === 'public' ? i.isPublic : !i.isPublic
    );

    return (
        <View style={styles.container}>
            <View style={styles.filterRow}>
                <TouchableOpacity
                    style={[styles.filterBtn, filter === 'public' && styles.activeFilter]}
                    onPress={() => setFilter('public')}
                >
                    <Ionicons name="earth-outline" size={16} color={filter === 'public' ? '#FF4EB8' : '#666'} />
                    <Text style={[styles.filterText, filter === 'public' && styles.activeText]}>Công khai</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.filterBtn, filter === 'private' && styles.activeFilter]}
                    onPress={() => setFilter('private')}
                >
                    <Ionicons name="lock-closed-outline" size={16} color={filter === 'private' ? '#FF4EB8' : '#666'} />
                    <Text style={[styles.filterText, filter === 'private' && styles.activeText]}>Riêng tư</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.grid}>
                {filtered.length > 0 ? (
                    filtered.map((i) => (
                        <View key={i.id} style={styles.card}>
                            <Image source={{ uri: i.uri }} style={styles.thumbnail} />
                            {!i.isPublic && <Text style={styles.privateTag}>Riêng tư</Text>}
                        </View>
                    ))
                ) : (
                    <Text style={styles.emptyText}>Không có hình ảnh nào</Text>
                )}
            </View>
        </View>
    );
};

export default ProfileImagesTab;

const styles = StyleSheet.create({
    container: { marginTop: 10 },
    filterRow: { flexDirection: 'row', justifyContent: 'center', gap: 25 },
    filterBtn: { flexDirection: 'row', alignItems: 'center', gap: 5 },
    filterText: { color: '#666' },
    activeFilter: { borderBottomWidth: 2, borderBottomColor: '#FF4EB8' },
    activeText: { color: '#FF4EB8', fontWeight: '600' },
    grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', paddingHorizontal: 15, marginTop: 10 },
    card: { width: '48%', position: 'relative', marginBottom: 10 },
    thumbnail: { width: '100%', height: 160, borderRadius: 10 },
    privateTag: { position: 'absolute', bottom: 6, right: 6, backgroundColor: '#0008', color: '#fff', paddingHorizontal: 6, borderRadius: 5 },
    emptyText: { textAlign: 'center', marginTop: 40, color: '#999' },
});
