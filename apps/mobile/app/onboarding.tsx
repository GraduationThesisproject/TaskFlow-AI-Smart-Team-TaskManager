import React, { useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, Dimensions, FlatList, useColorScheme, TouchableOpacity, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Colors, { lightTheme, darkTheme } from '@/constants/Colors';
import { Fonts, FontSizes, FontWeights } from '@/constants/Fonts';
import LottieView from 'lottie-react-native';
import taskManagement from '../assets/images/task management.json';
import teamCollaboration from '../assets/images/Business team.json';
import dragAndDrop from '../assets/images/Sorting Pictures.json';
import deadline from '../assets/images/Businessman balancing on time unicycle.json';
const { width } = Dimensions.get('window');

type Slide = {
  key: string;
  title: string;
  description: string;
  // local Lottie animation source
  animation: any;
};

const SLIDES: Slide[] = [
  {
    key: 'create',
    title: 'Create Tasks Effortlessly',
    description: 'Quickly add tasks, set details, and keep work moving.',
    animation: taskManagement,
  },
  {
    key: 'drag',
    title: 'Drag Between Lists',
    description: 'Reorder or move cards across columns with a simple drag.',
    animation: dragAndDrop,
  },
  {
    key: 'collab',
    title: 'Collaborate with Your Team',
    description: 'Assign, comment, and stay aligned in real-time.',
    animation: teamCollaboration,
  },
  {
    key: 'notify',
    title: 'Never Miss a Deadline',
    description: 'Get timely reminders and notifications on important work.',
    animation: deadline,
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const scheme = useColorScheme();
  const theme = scheme === 'dark' ? darkTheme : lightTheme;
  const [index, setIndex] = useState(0);
  const listRef = useRef<FlatList<Slide>>(null);

  const isLast = index === SLIDES.length - 1;

  const handleNext = () => {
    if (isLast) {
      handleGetStarted();
      return;
    }
    const next = Math.min(index + 1, SLIDES.length - 1);
    setIndex(next);
    listRef.current?.scrollToIndex({ index: next, animated: true });
  };

  const handleBack = () => {
    if (index === 0) return;
    const prev = Math.max(index - 1, 0);
    setIndex(prev);
    listRef.current?.scrollToIndex({ index: prev, animated: true });
  };

  const handleSkip = () => {
    // Allow devs/users to skip immediately to auth
    handleGetStarted();
  };

  const handleGetStarted = async () => {
    try {
      await AsyncStorage.setItem('hasSeenOnboarding', 'true');
    } catch {}
    router.replace('/login');
  };

  const renderItem = ({ item }: { item: Slide }) => (
    <View style={[styles.slide, { width }]}> 
      <View style={styles.contentContainer}>
        <View style={styles.illustrationWrapper}>
          <LottieView
            source={item.animation}
            autoPlay
            loop
            style={{ width: '100%', height: '100%' }}
            resizeMode="contain"
          />
        </View>
        <View style={styles.textContainer}>
          <Text style={[styles.title, { color: theme.foreground }]}>{item.title}</Text>
          <Text style={[styles.description, { color: theme['muted-foreground'] }]}>{item.description}</Text>
        </View>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}> 
      <StatusBar barStyle={scheme === 'dark' ? 'light-content' : 'dark-content'} />
      
      {/* Professional Header */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Text style={[styles.logoText, { color: theme.primary }]}>TaskFlow</Text>
        </View>
        <TouchableOpacity
          onPress={handleSkip}
          style={[styles.skipButton, { backgroundColor: theme.primary + '10' }]}
          accessibilityRole="button"
          accessibilityLabel="Skip onboarding"
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={[styles.skipText, { color: theme.primary }]}>Skip</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        ref={listRef}
        data={SLIDES}
        keyExtractor={(item) => item.key}
        renderItem={renderItem}
        horizontal
        showsHorizontalScrollIndicator={false}
        pagingEnabled
        onMomentumScrollEnd={(e) => {
          const newIndex = Math.round(e.nativeEvent.contentOffset.x / width);
          setIndex(newIndex);
        }}
        contentContainerStyle={{ alignItems: 'center', paddingVertical: 40 }}
      />

      <View style={styles.bottomBar}>
        {!isLast ? (
          <>
            <TouchableOpacity
              onPress={handleBack}
              disabled={index === 0}
              style={styles.bottomAction}
              accessibilityRole="button"
              accessibilityLabel="Back"
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Text style={[styles.bottomText, { color: index === 0 ? theme.muted : theme.primary }]}>Back</Text>
            </TouchableOpacity>

            <View style={styles.paginationText}>
              {SLIDES.map((_, i) => {
                const active = i === index;
                return (
                  <Text
                    key={i}
                    style={{
                      color: active ? theme.primary : theme['muted-foreground'],
                      marginHorizontal: 3,
                      fontSize: 12,
                    }}
                  >
                    {active ? '●' : '○'}
                  </Text>
                );
              })}
            </View>

            <TouchableOpacity
              onPress={handleNext}
              style={styles.bottomAction}
              accessibilityRole="button"
              accessibilityLabel="Next"
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Text style={[styles.bottomText, { color: theme.primary }]}>Next</Text>
            </TouchableOpacity>
          </>
        ) : (
          <TouchableOpacity
            onPress={handleNext}
            style={[styles.primaryButton, { backgroundColor: theme.primary }]}
            accessibilityRole="button"
            accessibilityLabel="Get Started"
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={[styles.primaryButtonText, { color: theme.background }]}>Get started</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  // Professional Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 20,
  },
  logoContainer: {
    flex: 1,
  },
  logoText: {
    fontFamily: Fonts.secondary.bold,
    fontSize: FontSizes['2xl'],
    fontWeight: '700',
  },
  skipButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  skipText: {
    fontFamily: Fonts.secondary.medium,
    fontSize: FontSizes.sm,
    fontWeight: '600',
  },
  slide: {
    paddingHorizontal: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentContainer: {
    alignItems: 'center',
    width: '100%',
  },
  illustrationWrapper: {
    width: width * 0.75,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
  },
  textContainer: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  title: {
    textAlign: 'center',
    fontFamily: Fonts.secondary.bold,
    fontSize: FontSizes['3xl'],
    fontWeight: '700',
    lineHeight: 36,
    marginBottom: 16,
  },
  description: {
    textAlign: 'center',
    fontFamily: Fonts.primary.regular,
    fontSize: FontSizes.lg,
    lineHeight: 24,
    opacity: 0.8,
    maxWidth: width * 0.8,
  },
  bottomBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 40,
    paddingHorizontal: 32,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  bottomAction: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    minWidth: 60,
    alignItems: 'center',
    borderRadius: 12,
  },
  bottomText: {
    fontFamily: Fonts.secondary.semiBold,
    fontSize: FontSizes.base,
    fontWeight: '600',
  },
  paginationText: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  primaryButton: {
    flex: 1,
    marginHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    fontFamily: Fonts.secondary.bold,
    fontSize: FontSizes.lg,
    fontWeight: '700',
  },
});


