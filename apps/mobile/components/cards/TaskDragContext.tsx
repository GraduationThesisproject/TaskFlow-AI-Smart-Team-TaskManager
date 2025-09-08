import React, { createContext, useContext, useState, PropsWithChildren } from 'react';
import { useWindowDimensions } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  SharedValue,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import { View, StyleSheet } from 'react-native';

type DraggingContext = {
  draggingTaskId: string | null;
  setDraggingTask: (id: string, y: number) => void;
  dragY?: SharedValue<number>;
  dragX?: SharedValue<number>;
  dragOffsetY?: SharedValue<number>;
  updateItemPosition?: (id: string, y: number) => void;
};

const DraggingContext = createContext<DraggingContext>({
  setDraggingTask: () => {},
  draggingTaskId: null,
});

interface TaskDragAreaProps extends PropsWithChildren {
  updateItemPosition?: (id: string, y: number) => void;
  renderDraggingItem?: (id: string) => React.ReactNode;
}

export const TaskDragArea = ({
  children,
  updateItemPosition,
  renderDraggingItem,
}: TaskDragAreaProps) => {
  const [draggingTaskId, setDraggingTaskId] = useState<string | null>(null);
  const { width } = useWindowDimensions();

  const dragX = useSharedValue(0);
  const dragY = useSharedValue(0);
  const dragOffsetY = useSharedValue(0);

  const drop = () => {
    if (draggingTaskId && updateItemPosition) {
      updateItemPosition(draggingTaskId, dragY.value);
    }
    setDraggingTaskId(null);
  };

  const pan = Gesture.Pan()
    .manualActivation(true)
    .onTouchesMove((event, stateManager) => {
      if (draggingTaskId) {
        stateManager.activate();
      }
    })
    .onChange((event) => {
      dragX.value = dragX.value + event.changeX;
      dragY.value = dragY.value + event.changeY;
    })
    .onEnd(() => {
      console.log('Dropped at position:', dragY.value);
      runOnJS(drop)();
    })
    .onFinalize(() => {
      runOnJS(setDraggingTaskId)(null);
    });

  const setDraggingTask = (id: string, y: number) => {
    setDraggingTaskId(id);
    dragY.value = y;
    dragX.value = 20;
  };

  const animatedStyle = useAnimatedStyle(() => {
    return {
      top: dragY.value - dragOffsetY.value,
      left: dragX.value,
    };
  });

  return (
    <DraggingContext.Provider
      value={{
        setDraggingTask,
        dragY: draggingTaskId ? dragY : undefined,
        dragX: draggingTaskId ? dragX : undefined,
        draggingTaskId,
        dragOffsetY,
        updateItemPosition,
      }}
    >
      <GestureDetector gesture={pan}>
        <View style={StyleSheet.absoluteFill}>
          {children}

          {/* Floating dragged item */}
          <Animated.View
            style={[
              animatedStyle,
              {
                width: width - 40,
                position: 'absolute',
                transform: [{ rotateZ: '3deg' }],
                zIndex: 1000,
              },
            ]}
          >
            {draggingTaskId && renderDraggingItem && renderDraggingItem(draggingTaskId)}
          </Animated.View>
        </View>
      </GestureDetector>
    </DraggingContext.Provider>
  );
};

export const useDraggingContext = () => useContext(DraggingContext);
