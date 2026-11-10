import React from 'react';
import { Tabs } from 'expo-router';
import TabBarIcon from '../../src/components/navigation/TabBarIcon';
import useTabScreenOptions from '../../src/components/navigation/useTabScreenOptions';

export const unstable_settings = {
  anchor: 'index',
};

export default function AlmaceneroLayout() {
  const screenOptions = useTabScreenOptions();

  return (
    <Tabs backBehavior="initialRoute" screenOptions={screenOptions}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Inventario',
          tabBarLabel: 'Inventario',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name="cube" color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="perfil"
        options={{
          title: 'Perfil',
          tabBarLabel: 'Perfil',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name="person-circle" color={color} focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
}
