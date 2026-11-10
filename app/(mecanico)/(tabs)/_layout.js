import React from 'react';
import { View } from 'react-native';
import { Tabs } from 'expo-router';
import TabBarIcon from '../../../src/components/navigation/TabBarIcon';
import useTabScreenOptions from '../../../src/components/navigation/useTabScreenOptions';
import { useTheme } from '../../../src/theme';

export const unstable_settings = {
  anchor: 'index',
};

export default function MecanicoLayout() {
  const screenOptions = useTabScreenOptions();
  const { colors } = useTheme();

  // Fondo del tema detrás de las esquinas redondeadas de la barra
  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Tabs backBehavior="initialRoute" screenOptions={screenOptions}>
        <Tabs.Screen
          name="index"
          options={{
            title: 'Mis órdenes',
            tabBarLabel: 'Mis órdenes',
            tabBarIcon: ({ color, focused }) => (
              <TabBarIcon name="construct" color={color} focused={focused} />
            ),
          }}
        />
        <Tabs.Screen
          name="perfil"
          options={{
            title: 'Perfil',
            tabBarLabel: 'Perfil',
            tabBarIcon: ({ color, focused }) => (
              <TabBarIcon
                name="person-circle"
                color={color}
                focused={focused}
              />
            ),
          }}
        />
      </Tabs>
    </View>
  );
}
