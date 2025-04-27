import React, { useMemo } from "react";
import { View, Image, ScrollView } from "react-native";
import { Text } from "~/components/ui/text";
import { Ionicons } from "@expo/vector-icons";
import { useColorScheme } from "~/lib/useColorScheme";
import { Crown } from "lucide-react-native";
import { LoadingScreen } from "../ui/LoadingScreen";
import { useLeaderboard } from "~/lib/hooks/useQueries";
import { cn } from "~/lib/utils";

interface LeaderboardProps {
  currentUsername: string | null;
}

interface LeaderboardUserInfo {
  position: number;
  id: number;
  hive_author: string;
  points: number;
}

export function Leaderboard({ currentUsername }: LeaderboardProps) {
  const { isDarkColorScheme } = useColorScheme();
  const { data: leaderboardData, isLoading, error } = useLeaderboard();

  const { topSkaters, surroundingUsers, currentUserInfo } = useMemo(() => {
    if (!leaderboardData)
      return { topSkaters: [], surroundingUsers: [], currentUserInfo: null };

    // Updated the map and filter functions to include explicit type annotations for parameters
    const top10 = leaderboardData.slice(0, 10).map((user: LeaderboardUserInfo, index: number) => ({
      position: index + 1,
      id: user.id,
      hive_author: user.hive_author,
      points: user.points,
    }));

    let surroundingUsers: LeaderboardUserInfo[] = [];
    let currentUserInfo = null;

    if (currentUsername) {
      const userIndex = leaderboardData.findIndex(
        (user: LeaderboardUserInfo) => user.hive_author === currentUsername
      );

      if (userIndex !== -1) {
        currentUserInfo = {
          position: userIndex + 1,
          id: leaderboardData[userIndex].id,
          hive_author: leaderboardData[userIndex].hive_author,
          points: leaderboardData[userIndex].points,
        };

        if (userIndex > 9) {
          const startIndex = userIndex > 14 ? userIndex - 5 : 10;
          const endIndex = Math.min(userIndex + 5, leaderboardData.length - 1);

          surroundingUsers = leaderboardData
            .slice(startIndex, endIndex + 1)
            .map((user: LeaderboardUserInfo, idx: number) => ({
              position: startIndex + idx + 1,
              id: user.id,
              hive_author: user.hive_author,
              points: user.points,
            }))
            .filter((user: LeaderboardUserInfo) => user.hive_author !== currentUsername); // Removendo duplicata do usuário atual

          surroundingUsers = [...surroundingUsers, currentUserInfo].sort(
            (a, b) => a.position - b.position
          );
        }
      }
    }

    return { topSkaters: top10, surroundingUsers, currentUserInfo };
  }, [leaderboardData, currentUsername]);

  if (isLoading) return <LoadingScreen />;
  if (error)
    return (
      <View className="flex-1 justify-center items-center">
        <Text>Error loading leaderboard</Text>
      </View>
    );

  return (
    <ScrollView className="w-full py-4" showsVerticalScrollIndicator={false}>
      <View className="items-center mb-4">
        <View
          className="w-24 h-24 rounded-full bg-foreground/10 items-center justify-center border-3"
          style={{
            borderColor: isDarkColorScheme ? "#ffffff20" : "#00000020",
          }}
        >
          <Ionicons name="podium-outline" size={48} color="#34C759" />
        </View>
        <Text className="text-3xl font-bold mt-2">Leaderboard</Text>
      </View>

      <View className="divide-solid divide-cyan-200">
        {topSkaters.map((skater: LeaderboardUserInfo, index: number) => (
          <LeaderboardItem
            key={skater.id}
            skater={skater}
            isTop={index < 3}
            isCurrentUser={skater.hive_author === currentUsername}
          />
        ))}

        {currentUserInfo && surroundingUsers.length > 0 && (
          <>
            {surroundingUsers.map((skater) => (
              <LeaderboardItem
                key={skater.id}
                skater={skater}
                isCurrentUser={skater.hive_author === currentUsername}
              />
            ))}
          </>
        )}
      </View>
    </ScrollView>
  );
}

const LeaderboardItem = ({
  skater,
  isTop = false,
  isCurrentUser = false,
}: {
  skater: LeaderboardUserInfo;
  isTop?: boolean;
  isCurrentUser?: boolean;
}) => (
  <View
    className={cn(
      "flex-row items-center justify-between p-2",
      isTop && "rounded-[10px]",
      isCurrentUser && "border-2 border-green-500",
    )}
  >
    <Text
      className={cn(
        "text-base font-bold w-[50px] text-center",
        isTop ? "text-[#d4af37]" : "text-[#eee]"
      )}
    >
      #{skater.position}
    </Text>

    <View className="h-12 w-12 mr-3 rounded-full relative">
      <Image
        source={{
          uri: `https://images.hive.blog/u/${skater.hive_author}/avatar/small`,
        }}
        className="w-10 h-10 rounded-full border-[3px]"
      />
      {isTop && skater.position === 1 && (
        <View className="absolute -top-4 left-1/2 -translate-x-1/2">
          <Crown size={18} color="#FFCC00" strokeWidth={2} />
        </View>
      )}
    </View>

    <Text
      className={cn(
        "text-base font-bold pl-2.5 flex-1 text-left",
        isTop ? "text-white" : "text-[#eee]"
      )}
    >
      {skater.hive_author}
    </Text>
    <Text
      className={cn(
        "text-base font-bold",
        isTop ? "text-[#4caf50]" : "text-white"
      )}
    >
      {skater.points.toFixed(0)}
    </Text>
  </View>
);
