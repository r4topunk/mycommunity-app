import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Dimensions,
  LayoutAnimation,
  Platform,
  UIManager,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { useAuth } from '~/lib/auth-provider';
import * as SecureStore from 'expo-secure-store';
import { API_BASE_URL } from '~/lib/constants';

const { height } = Dimensions.get('window');

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type Comment = {
  author: string;
  body: string;
  permlink: string;
};

type CommentsScreenProps = {
  postAuthor: string;
  postPermlink: string;
  comments: Comment[];
  onClose?: () => void;
  onRefreshComments?: () => void;
};

export function CommentsScreen({ postAuthor, postPermlink, comments, onClose, onRefreshComments }: CommentsScreenProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [newComment, setNewComment] = useState('');
  const { username } = useAuth();
  const [postingKey, setPostingKey] = useState<string | null>(null);
  const [replyToPermlink, setReplyToPermlink] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsVisible(true);

    const loadKey = async () => {
      if (username && username !== 'SPECTATOR') {
        const key = await SecureStore.getItemAsync(username);
        setPostingKey(key);
      }
    };

    loadKey();
  }, [username]);

  const handleSendComment = async () => {
    if (!newComment.trim() || !username || !postingKey) {
      Alert.alert("Error", "Missing comment, username, or key");
      return;
    }

    setIsSending(true); // Start loading

    const parentAuthor = replyToPermlink
      ? comments.find(c => c.permlink === replyToPermlink)?.author || postAuthor
      : postAuthor;

    const parentPermlink = replyToPermlink || postPermlink;

    const postData = {
      author: username,
      parent_author: parentAuthor,
      parent_permlink: parentPermlink,
      comment: { body: newComment },
    };

    try {
      const res = await fetch(`${API_BASE_URL}/createcomment`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${postingKey}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(postData),
      });

      const result = await res.json();
      if (result.success) {
        setNewComment('');
        setReplyToPermlink(null);
        setTimeout(() => {
          onRefreshComments?.();
        }, 1000); // Delay refresh by 1 second
      } else {
        Alert.alert("Error", result.error || "Failed to post comment");
      }
    } catch (err) {
      console.error("Comment error:", err);
      Alert.alert("Error", "Could not send comment.");
    } finally {
      setIsSending(false); // Done loading
    }
  };

  const handleClose = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsVisible(false);
    setTimeout(() => onClose?.(), 400);
  };

  return (
    <View
      className="absolute inset-0 bg-background/80"
      style={{
        opacity: isVisible ? 1 : 0,
        transform: [{ translateY: isVisible ? 0 : height }]
      }}
    >
      <ScrollView
        className="flex-1 bg-white/60 dark:bg-black/40 rounded-t-2xl p-4"
        contentContainerStyle={{ paddingBottom: 40, flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        nestedScrollEnabled
      >
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-lg font-bold text-black dark:text-white">Comments</Text>
          <TouchableOpacity onPress={handleClose}>
            <Text className="text-green-500 font-semibold">Close</Text>
          </TouchableOpacity>
        </View>



        {comments.map((item) => (
            // const media = extractMediaFromBody(item.body);
            // const commentContent = item.body.replace(/<iframe.*?<\/iframe>|!\[.*?\]\(.*?\)/g, '').trim();
          <View
            key={item.permlink}
            className="border-b border-gray-200 dark:border-gray-700 pb-2 mb-6"
          >
            <TouchableOpacity onPress={() => {
              setReplyToPermlink(prev => prev === item.permlink ? null : item.permlink);
            }}>
              <Text className="font-semibold text-gray-800 dark:text-gray-300">@{item.author}</Text>
              <Text className="text-sm text-gray-800 dark:text-gray-300">{item.body}</Text>
            </TouchableOpacity>

            {replyToPermlink === item.permlink && (
              <View className="ml-4 mt-2 flex-row items-center space-x-2">
                <TextInput
                  value={newComment}
                  onChangeText={setNewComment}
                  placeholder={`Reply to @${item.author}`}
                  className="flex-1 text-base text-gray-800 dark:text-gray-200 bg-gray-100 dark:bg-gray-800 px-3 py-2 rounded"
                />
                <TouchableOpacity
                  onPress={handleSendComment}
                  disabled={isSending}
                  className={`bg-green-800 px-3 py-2 rounded ${isSending ? 'opacity-50' : ''}`}
                >
                  <Text className="text-white text-sm">
                    {isSending ? 'Sending...' : 'Send'}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        ))}

        {!replyToPermlink && (
          <View className="absolute bottom-0 left-0 right-0 bg-white dark:bg-black p-4 border-t border-gray-200 dark:border-gray-700">
            <View className="flex-row items-center space-x-2">
              <TextInput
                value={newComment}
                onChangeText={setNewComment}
                placeholder="Write a comment..."
                className="flex-1 text-base text-gray-800 dark:text-gray-200 bg-gray-100 dark:bg-gray-800 px-3 py-2 rounded"
              />
              <TouchableOpacity
                onPress={handleSendComment}
                className="bg-green-800 px-3 py-2 rounded"
              >
                <Text className="text-white text-sm">Send</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
