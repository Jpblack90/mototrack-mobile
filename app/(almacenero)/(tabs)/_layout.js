import React from 'react';
import { View } from 'react-native';
import { Tabs } from 'expo-router';
import TabBarIcon from '../../../src/components/navigation/TabBarIcon';
import useTabScreenOptions from '../../../src/components/navigation/useTabScreenOptions';
import { useTheme } from '../../../src/theme';
import useStockAlerts from '../../../src/hooks/useStockAlerts';

export const unstable_settings = {
  anchor: 'index',
};

export default function AlmaceneroLayout() {
  const screenOptions = useTabScreenOptions();
  const { colors } = useTheme();
  const { total: alertCount } = useStockAlerts();

  // Fondo del tema detrás de las esquinas redondeadas de la barra
  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
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
          name="alertas"
          options={{
            title: 'Alertas',
            tabBarLabel: 'Alertas',
            tabBarBadge: alertCount > 0 ? alertCount : undefined,
            tabBarIcon: ({ color, focused }) => (
              <TabBarIcon
                name="alert-circle"
                color={color}
                focused={focused}
              />
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
