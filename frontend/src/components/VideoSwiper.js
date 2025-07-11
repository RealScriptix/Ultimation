import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  Platform,
  Text,
  Animated,
  PanResponder,
} from 'react-native';
import {
  PanGestureHandler,
  State,
  TapGestureHandler,
  PinchGestureHandler,
} from 'react-native-gesture-handler';
import { useSelector, useDispatch } from 'react-redux';
import Video from 'react-native-video';
import LinearGradient from 'react-native-linear-gradient';
import { BlurView } from 'react-native-blur';
import HapticFeedback from 'react-native-haptic-feedback';

import VideoOverlay from './VideoOverlay';
import SwipeActions from './SwipeActions';
import { videoActions } from '../store/slices/videoSlice';
import { likeVideo, unlikeVideo } from '../store/actions/videoActions';
import { trackSwipe } from '../services/analytics';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const VideoSwiper = ({ video, index, isActive, onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown }) => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const [paused, setPaused] = useState(!isActive);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isLiked, setIsLiked] = useState(video.userEngagement?.isLiked || false);
  const [showLikeAnimation, setShowLikeAnimation] = useState(false);
  const [showSwipeHint, setShowSwipeHint] = useState(false);

  // Animation values
  const translateX = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(1)).current;
  const likeOpacity = useRef(new Animated.Value(0)).current;
  const swipeHintOpacity = useRef(new Animated.Value(0)).current;

  // Gesture handlers
  const panRef = useRef(null);
  const tapRef = useRef(null);
  const doubleTapRef = useRef(null);

  const SWIPE_THRESHOLD = 50;
  const LIKE_THRESHOLD = 80;

  useEffect(() => {
    setPaused(!isActive);
    if (isActive) {
      // Show swipe hint for new users
      showSwipeHintAnimation();
    }
  }, [isActive]);

  useEffect(() => {
    setIsLiked(video.userEngagement?.isLiked || false);
  }, [video.userEngagement]);

  const showSwipeHintAnimation = () => {
    setTimeout(() => {
      setShowSwipeHint(true);
      Animated.sequence([
        Animated.timing(swipeHintOpacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.delay(2000),
        Animated.timing(swipeHintOpacity, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setShowSwipeHint(false);
      });
    }, 1000);
  };

  const handlePanGesture = ({ nativeEvent }) => {
    const { translationX, translationY, velocityX, velocityY, state } = nativeEvent;

    if (state === State.ACTIVE) {
      // Update translation values
      translateX.setValue(translationX);
      translateY.setValue(translationY);

      // Show like animation if swiping right
      if (translationX > LIKE_THRESHOLD && !showLikeAnimation) {
        setShowLikeAnimation(true);
        HapticFeedback.trigger('impactLight');
        Animated.timing(likeOpacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }).start();
      } else if (translationX < LIKE_THRESHOLD && showLikeAnimation) {
        setShowLikeAnimation(false);
        Animated.timing(likeOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }).start();
      }

      // Scale effect for pinch-like feeling
      const scaleValue = Math.max(0.95, 1 - Math.abs(translationX) / 1000);
      scale.setValue(scaleValue);
    }

    if (state === State.END) {
      const absTranslationX = Math.abs(translationX);
      const absTranslationY = Math.abs(translationY);

      // Reset like animation
      if (showLikeAnimation) {
        setShowLikeAnimation(false);
        Animated.timing(likeOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }).start();
      }

      // Determine swipe direction
      if (absTranslationX > absTranslationY) {
        // Horizontal swipe
        if (translationX > SWIPE_THRESHOLD) {
          // Swipe right - Like video
          handleSwipeRight();
        } else if (translationX < -SWIPE_THRESHOLD) {
          // Swipe left - Next video
          handleSwipeLeft();
        }
      } else {
        // Vertical swipe
        if (translationY > SWIPE_THRESHOLD) {
          // Swipe down - View channel
          handleSwipeDown();
        } else if (translationY < -SWIPE_THRESHOLD) {
          // Swipe up - Previous video
          handleSwipeUp();
        }
      }

      // Reset animations
      Animated.parallel([
        Animated.spring(translateX, {
          toValue: 0,
          useNativeDriver: true,
          tension: 100,
          friction: 8,
        }),
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
          tension: 100,
          friction: 8,
        }),
        Animated.spring(scale, {
          toValue: 1,
          useNativeDriver: true,
          tension: 100,
          friction: 8,
        }),
      ]).start();
    }
  };

  const handleSwipeRight = async () => {
    HapticFeedback.trigger('impactMedium');
    trackSwipe(video.id, 'right');
    
    try {
      if (isLiked) {
        await dispatch(unlikeVideo(video.id));
        setIsLiked(false);
      } else {
        await dispatch(likeVideo(video.id));
        setIsLiked(true);
        showLikeHeartAnimation();
      }
    } catch (error) {
      console.error('Error liking video:', error);
    }
    
    if (onSwipeRight) onSwipeRight();
  };

  const handleSwipeLeft = () => {
    HapticFeedback.trigger('impactLight');
    trackSwipe(video.id, 'left');
    if (onSwipeLeft) onSwipeLeft();
  };

  const handleSwipeUp = () => {
    HapticFeedback.trigger('impactLight');
    trackSwipe(video.id, 'up');
    if (onSwipeUp) onSwipeUp();
  };

  const handleSwipeDown = () => {
    HapticFeedback.trigger('impactLight');
    trackSwipe(video.id, 'down');
    if (onSwipeDown) onSwipeDown();
  };

  const handleSingleTap = ({ nativeEvent }) => {
    if (nativeEvent.state === State.END) {
      setPaused(!paused);
      HapticFeedback.trigger('selection');
    }
  };

  const handleDoubleTap = ({ nativeEvent }) => {
    if (nativeEvent.state === State.END) {
      handleSwipeRight();
    }
  };

  const showLikeHeartAnimation = () => {
    // Create floating heart animation
    const heartAnimation = new Animated.Value(0);
    
    Animated.sequence([
      Animated.timing(heartAnimation, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(heartAnimation, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const onProgress = ({ currentTime, playableDuration }) => {
    setCurrentTime(currentTime);
    if (duration > 0) {
      setProgress(currentTime / duration);
    }
  };

  const onLoad = ({ duration }) => {
    setDuration(duration);
  };

  const onEnd = () => {
    // Auto-advance to next video
    if (onSwipeLeft) {
      setTimeout(() => {
        onSwipeLeft();
      }, 500);
    }
  };

  return (
    <View style={styles.container}>
      <PanGestureHandler
        ref={panRef}
        onGestureEvent={handlePanGesture}
        onHandlerStateChange={handlePanGesture}
        activeOffsetX={[-10, 10]}
        activeOffsetY={[-10, 10]}
      >
        <Animated.View
          style={[
            styles.videoContainer,
            {
              transform: [
                { translateX },
                { translateY },
                { scale },
              ],
            },
          ]}
        >
          <TapGestureHandler
            ref={tapRef}
            onHandlerStateChange={handleSingleTap}
            waitFor={doubleTapRef}
          >
            <TapGestureHandler
              ref={doubleTapRef}
              onHandlerStateChange={handleDoubleTap}
              numberOfTaps={2}
            >
              <View style={styles.videoWrapper}>
                <Video
                  source={{ uri: video.videoUrl }}
                  style={styles.video}
                  resizeMode="cover"
                  repeat
                  paused={paused}
                  onProgress={onProgress}
                  onLoad={onLoad}
                  onEnd={onEnd}
                  bufferConfig={{
                    minBufferMs: 2000,
                    maxBufferMs: 5000,
                    bufferForPlaybackMs: 1000,
                    bufferForPlaybackAfterRebufferMs: 1500,
                  }}
                />
                
                {/* Video overlay with user info, actions, etc. */}
                <VideoOverlay
                  video={video}
                  isLiked={isLiked}
                  onLikePress={handleSwipeRight}
                  progress={progress}
                  currentTime={currentTime}
                  duration={duration}
                  paused={paused}
                />

                {/* Like animation overlay */}
                {showLikeAnimation && (
                  <Animated.View
                    style={[
                      styles.likeAnimationOverlay,
                      { opacity: likeOpacity }
                    ]}
                  >
                    <LinearGradient
                      colors={['rgba(255, 0, 100, 0.8)', 'rgba(255, 0, 150, 0.8)']}
                      style={styles.likeGradient}
                    >
                      <Text style={styles.likeText}>❤️</Text>
                      <Text style={styles.likeLabel}>Like</Text>
                    </LinearGradient>
                  </Animated.View>
                )}

                {/* Swipe hints for new users */}
                {showSwipeHint && (
                  <Animated.View
                    style={[
                      styles.swipeHintContainer,
                      { opacity: swipeHintOpacity }
                    ]}
                  >
                    <SwipeActions />
                  </Animated.View>
                )}

                {/* Gradient overlays for better text visibility */}
                <LinearGradient
                  colors={['transparent', 'rgba(0,0,0,0.7)']}
                  style={styles.bottomGradient}
                />
                <LinearGradient
                  colors={['rgba(0,0,0,0.3)', 'transparent']}
                  style={styles.topGradient}
                />
              </View>
            </TapGestureHandler>
          </TapGestureHandler>
        </Animated.View>
      </PanGestureHandler>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  videoContainer: {
    flex: 1,
    width: screenWidth,
    height: screenHeight,
  },
  videoWrapper: {
    flex: 1,
    position: 'relative',
  },
  video: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  likeAnimationOverlay: {
    position: 'absolute',
    left: 0,
    top: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  likeGradient: {
    paddingHorizontal: 30,
    paddingVertical: 20,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  likeText: {
    fontSize: 60,
    marginBottom: 10,
  },
  likeLabel: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  swipeHintContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 5,
  },
  bottomGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 150,
    zIndex: 1,
  },
  topGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 100,
    zIndex: 1,
  },
});

export default VideoSwiper;