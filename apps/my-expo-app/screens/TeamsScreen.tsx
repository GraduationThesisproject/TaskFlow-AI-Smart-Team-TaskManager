import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Plus, Search, Users } from 'lucide-react-native';

export default function TeamsScreen() {
  const teams = [
    {
      id: 1,
      name: 'Finance Team',
      members: 5,
      activeProjects: 3,
      color: 'bg-blue-500',
      members_avatars: [
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0",
        "https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0",
        "https://images.unsplash.com/photo-1605993439219-9d09d2020fa5?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0",
      ]
    },
    {
      id: 2,
      name: 'Development Team',
      members: 8,
      activeProjects: 5,
      color: 'bg-green-500',
      members_avatars: [
        "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0",
        "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0",
      ]
    },
    {
      id: 3,
      name: 'Marketing Team',
      members: 4,
      activeProjects: 2,
      color: 'bg-purple-500',
      members_avatars: [
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0",
        "https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0",
      ]
    },
  ];

  return (
    <View className="flex-1 bg-black">
      {/* Header */}
      <View className="px-4 pt-12 pb-6">
        <View className="flex-row items-center justify-between">
          <Text className="text-white text-2xl font-bold">Teams</Text>
          <TouchableOpacity>
            <Plus color="white" size={24} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Search Bar */}
      <View className="px-4 mb-6">
        <View className="flex-row items-center bg-gray-800 rounded-lg px-3 py-2">
          <Search color="#9CA3AF" size={20} />
          <Text className="text-gray-400 ml-2">Search teams...</Text>
        </View>
      </View>

      <ScrollView className="flex-1 px-4">
        {/* Teams List */}
        {teams.map((team) => (
          <TouchableOpacity
            key={team.id}
            className="bg-gray-900 rounded-xl p-4 mb-4"
          >
            <View className="flex-row items-center justify-between mb-3">
              <View className="flex-row items-center">
                <View className={`${team.color} w-12 h-12 rounded-lg items-center justify-center mr-3`}>
                  <Users color="white" size={20} />
                </View>
                <View>
                  <Text className="text-white text-lg font-bold">{team.name}</Text>
                  <Text className="text-gray-400 text-sm">{team.members} members</Text>
                </View>
              </View>
              <View className="items-end">
                <Text className="text-teal-400 font-medium">{team.activeProjects} projects</Text>
                <Text className="text-gray-500 text-xs">active</Text>
              </View>
            </View>

            {/* Team Members Avatars */}
            <View className="flex-row items-center">
              <View className="flex-row">
                {team.members_avatars.slice(0, 3).map((avatar, index) => (
                  <Image
                    key={index}
                    source={{ uri: avatar }}
                    className="w-8 h-8 rounded-full border-2 border-gray-900"
                    style={{ marginLeft: index > 0 ? -8 : 0 }}
                  />
                ))}
                {team.members > 3 && (
                  <View 
                    className="w-8 h-8 rounded-full bg-gray-700 border-2 border-gray-900 items-center justify-center"
                    style={{ marginLeft: -8 }}
                  >
                    <Text className="text-white text-xs">+{team.members - 3}</Text>
                  </View>
                )}
              </View>
            </View>
          </TouchableOpacity>
        ))}

        {/* Create Team Button */}
        <TouchableOpacity className="bg-teal-400 rounded-xl py-4 items-center mt-4">
          <View className="flex-row items-center">
            <Plus color="black" size={20} />
            <Text className="text-black font-medium ml-2">Create New Team</Text>
          </View>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
