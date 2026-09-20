/**
 * Mock for @expo/vector-icons
 */

import React from 'react';
import { Text } from 'react-native';

const createIconMock = (name) => {
  return (props) => {
    return React.createElement(Text, {
      ...props,
      testID: `icon-${name}`,
    }, name);
  };
};

export const Ionicons = createIconMock('Ionicons');
export const MaterialIcons = createIconMock('MaterialIcons');
export const FontAwesome = createIconMock('FontAwesome');
export const Feather = createIconMock('Feather');
export const MaterialCommunityIcons = createIconMock('MaterialCommunityIcons');

export default {
  Ionicons,
  MaterialIcons,
  FontAwesome,
  Feather,
  MaterialCommunityIcons,
};
