import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  Dimensions,
  StatusBar,
  ActivityIndicator,
  Text,
  RefreshControl,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';

import VideoSwiper from '../components/VideoSwiper';
import LoadingSpinner from '../components/LoadingSpinner';
import { getPersonalizedFeed, getNextVideo } from '../store/actions/videoActions';
import { trackScreenView } from '../services/analytics';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const FeedScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const { 
    personalizedFeed, 
    loading, 
    currentVideoIndex, 
    hasMore,
    refreshing 
  } = useSelector(state => state.video);

  const [viewedVideos, setViewedVideos] = useState(new Set());
  const flatListRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  // Track screen view
  useFocusEffect(
    React.useCallback(() => {
      trackScreenView('Feed');
      setIsVisible(true);
      return () => setIsVisible(false);
    }, [])
  );

  // Load initial feed
  useEffect(() => {
    if (personalizedFeed.length === 0 && !loading) {
      loadFeed();
    }
  }, []);

  // Preload next videos when near the end
  useEffect(() => {
    if (currentIndex >= personalizedFeed.length - 3 && hasMore && !loading) {
      loadMoreVideos();
    }
  }, [currentIndex, personalizedFeed.length, hasMore, loading]);

  const loadFeed = async () => {
    try {
      await dispatch(getPersonalizedFeed({ refresh: true }));
    } catch (error) {
      console.error('Error loading feed:', error);
    }
  };

  const loadMoreVideos = async () => {
    try {
      await dispatch(getPersonalizedFeed({ 
        page: Math.floor(personalizedFeed.length / 20) + 1 
      }));
    } catch (error) {
      console.error('Error loading more videos:', error);
    }
  };

  const handleRefresh = async () => {
    setCurrentIndex(0);
    setViewedVideos(new Set());
    await loadFeed();
  };

  const handleSwipeLeft = async () => {
    // Move to next video
    const nextIndex = currentIndex + 1;
    if (nextIndex < personalizedFeed.length) {
      setCurrentIndex(nextIndex);
      scrollToIndex(nextIndex);
      
      // Mark current video as viewed
      setViewedVideos(prev => new Set([...prev, personalizedFeed[currentIndex].id]));
    }
  };

  const handleSwipeUp = () => {
    // Go to previous video
    const prevIndex = currentIndex - 1;
    if (prevIndex >= 0) {
      setCurrentIndex(prevIndex);
      scrollToIndex(prevIndex);
    }
  };

  const handleSwipeDown = (video) => {
    // Navigate to creator's profile
    navigation.navigate('Profile', { 
      userId: video.creator.id,
      username: video.creator.username 
    });
  };

  const scrollToIndex = (index) => {
    if (flatListRef.current) {
      flatListRef.current.scrollToIndex({
        index,
        animated: true,
      });
    }
  };

  const onViewableItemsChanged = ({ viewableItems }) => {
    if (viewableItems.length > 0) {
      const visibleIndex = viewableItems[0].index;
      setCurrentIndex(visibleIndex);
    }
  };

  const viewabilityConfig = {
    itemVisiblePercentThreshold: 50,
  };

  const renderVideo = ({ item, index }) => {
    const isActive = index === currentIndex && isVisible;
    
    return (
      <View style={styles.videoContainer}>
        <VideoSwiper
          video={item}
          index={index}
          isActive={isActive}
          onSwipeLeft={handleSwipeLeft}
          onSwipeUp={handleSwipeUp}
          onSwipeDown={() => handleSwipeDown(item)}
          onSwipeRight={() => {
            // Handle like - already handled in VideoSwiper
          }}
        />
      </View>
    );
  };

  const getItemLayout = (data, index) => ({
    length: screenHeight,
    offset: screenHeight * index,
    index,
  });

  const keyExtractor = (item) => item.id.toString();

  if (loading && personalizedFeed.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <LoadingSpinner />
        <Text style={styles.loadingText}>Loading your feed...</Text>
      </View>
    );
  }

  if (personalizedFeed.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyTitle}>No videos found</Text>
        <Text style={styles.emptySubtitle}>
          Follow some creators or check back later for new content!
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      <FlatList
        ref={flatListRef}
        data={personalizedFeed}
        renderItem={renderVideo}
        keyExtractor={keyExtractor}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        snapToInterval={screenHeight}
        snapToAlignment="start"
        decelerationRate="fast"
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        getItemLayout={getItemLayout}
        removeClippedSubviews={true}
        maxToRenderPerBatch={3}
        windowSize={5}
        initialNumToRender={2}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#fff"
            colors={['#ff0066']}
          />
        }
        ListFooterComponent={
          loading && personalizedFeed.length > 0 ? (
            <View style={styles.footerLoader}>
              <ActivityIndicator size="large" color="#ff0066" />
            </View>
          ) : null
        }
      />

      {/* Video counter */}
      <View style={styles.videoCounter}>
        <Text style={styles.counterText}>
          {currentIndex + 1} / {personalizedFeed.length}
        </Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  videoContainer: {
    width: screenWidth,
    height: screenHeight,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  loadingText: {
    color: '#fff',
    fontSize: 16,
    marginTop: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  emptySubtitle: {
    color: '#ccc',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  footerLoader: {
    height: screenHeight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoCounter: {
    position: 'absolute',
    top: 60,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    zIndex: 10,
  },
  counterText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
});

export default FeedScreen;