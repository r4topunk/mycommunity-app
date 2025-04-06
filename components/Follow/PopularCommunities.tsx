import React, { useRef } from "react";
import { View, ScrollView, NativeSyntheticEvent, NativeScrollEvent } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Text } from "~/components/ui/text";
import { pop_communities } from "~/lib/hooks/useCommunities";

type Props = {
  onIndexChange: (index: number) => void;
};

export const PopularCommunitiesCarousel: React.FC<Props> = ({ onIndexChange }) => {
  const scrollRef = useRef<ScrollView>(null);

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(e.nativeEvent.contentOffset.x / e.nativeEvent.layoutMeasurement.width);
    onIndexChange(index);
    // console.log("Current index:", index);
  };

  return (
    <View className="absolute top-0 left-0 right-0 bottom-0 justify-center items-center">
      <Ionicons
        name="chevron-back"
        size={32}
        color="white"
        style={{
          position: "absolute",
          left: 10,
          top: "50%",
          transform: [{ translateY: -16 }],
          opacity: 0.6,
        }}
      />
      <Ionicons
        name="chevron-forward"
        size={32}
        color="white"
        style={{
          position: "absolute",
          right: 10,
          top: "50%",
          transform: [{ translateY: -16 }],
          opacity: 0.6,
        }}
      />

      <ScrollView
        horizontal
        pagingEnabled
        ref={scrollRef}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        showsHorizontalScrollIndicator={false}
        className="w-full h-full"
      >
        {pop_communities.map(([id, name]) => (
          <View
            key={id}
            className="w-screen h-full justify-center items-center px-4"
          >
            <View className="bg-black/60 rounded-xl p-4">
              <Text className="text-3xl text-white font-bold text-center">
                {name}
              </Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};
