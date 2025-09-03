import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Settings, Bell, User, LogOut, ChevronRight } from 'lucide-react-native';

export default function ProfileScreen() {
  const menuItems = [
    { title: 'Account Settings', icon: User, action: () => {} },
    { title: 'Notifications', icon: Bell, action: () => {} },
    { title: 'Preferences', icon: Settings, action: () => {} },
    { title: 'Sign Out', icon: LogOut, action: () => {}, danger: true },
  ];

  return (
    <View className="flex-1 bg-black">
      {/* Header */}
      <View className="px-4 pt-12 pb-6">
        <Text className="text-white text-2xl font-bold">Profile</Text>
      </View>

      <ScrollView className="flex-1 px-4">
        {/* Profile Info */}
        <View className="bg-gray-900 rounded-xl p-6 mb-6 items-center">
          <Image
            source={{ uri: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0" }}
            className="w-20 h-20 rounded-full mb-4"
          />
          <Text className="text-white text-xl font-bold">John Doe</Text>
          <Text className="text-gray-400 text-sm">Project Manager</Text>
          <Text className="text-gray-400 text-sm">john.doe@company.com</Text>
        </View>

        {/* Menu Items */}
        <View className="bg-gray-900 rounded-xl overflow-hidden">
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              className="flex-row items-center justify-between p-4 border-b border-gray-800 last:border-b-0"
              onPress={item.action}
            >
              <View className="flex-row items-center">
                <item.icon 
                  color={item.danger ? "#EF4444" : "white"} 
                  size={20} 
                />
                <Text className={`ml-3 font-medium ${item.danger ? 'text-red-500' : 'text-white'}`}>
                  {item.title}
                </Text>
              </View>
              <ChevronRight 
                color={item.danger ? "#EF4444" : "#9CA3AF"} 
                size={16} 
              />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
