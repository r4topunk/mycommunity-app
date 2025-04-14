import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { View } from "react-native";
import { Text } from "~/components/ui/text";
import { useColorScheme } from "~/lib/useColorScheme";

// Use the exact icon names from Ionicons
export type IconName = React.ComponentProps<typeof Ionicons>["name"];

interface InfoItem {
  icon: IconName;
  title: string;
  text: string;
}

interface SpectatorInfoBaseProps {
  icon?: IconName;
  iconColor?: string;
  title: string;
  titleUppercase?: boolean;
  description: string;
  infoItems: InfoItem[];
}

export function SpectatorInfoBase({
  icon,
  iconColor,
  title,
  titleUppercase = false,
  description,
  infoItems,
}: SpectatorInfoBaseProps) {
  const { isDarkColorScheme } = useColorScheme();

  return (
    <>
      <View className="items-center mt-2 mb-4">
        {icon && (
          <View
            className="w-24 h-24 rounded-full bg-foreground/10 items-center justify-center"
            style={{ borderWidth: 3, borderColor: isDarkColorScheme ? "#ffffff20" : "#00000020" }}
          >
            <Ionicons name={icon} size={48} color={iconColor} />
          </View>
        )}
        <Text className={`text-3xl font-bold ${!icon ? "mt-0" : "mt-2"} ${titleUppercase ? 'uppercase' : ''}`}>{title}</Text>
        <Text className="text-center opacity-70 mt-2 mx-4">
          {description}
        </Text>
      </View>

      <View className="w-full flex flex-col gap-4">
        {infoItems.map((item, index) => (
          <View key={index} className="w-full p-4 bg-foreground/5 rounded-xl">
            <View className="items-center flex flex-col gap-1 px-4">
              <Ionicons name={item.icon} size={24} color={iconColor} />
              <Text className="font-bold mt-2 uppercase text-lg">{item.title}</Text>
            </View>
            <View>
              <Text className="text-muted-foreground text-center">{item.text}</Text>
            </View>
          </View>
        ))}
      </View>
    </>
  );
}