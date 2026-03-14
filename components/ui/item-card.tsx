import { ReactNode, useState } from "react";
import { View, StyleSheet, TouchableOpacity, Text, ViewProps, StyleProp, ViewStyle} from "react-native";


type ItemCardProps = ViewProps & {
  head: ReactNode;
  isActive?: boolean;
  pressableStyle?: StyleProp<ViewStyle>;
  longPressStyle?: StyleProp<ViewStyle>;
  onClickCallBack: () => void;
  onLongClickCallBack?: () => void;
};

export default function ItemCard({head, isActive, pressableStyle, longPressStyle, onClickCallBack, onLongClickCallBack}: ItemCardProps) {

  return (
    <TouchableOpacity
      onPress={() => onClickCallBack()}
      onLongPress={() =>  onLongClickCallBack?.() }
      activeOpacity={0.6}
      style={[styles.bubble, pressableStyle, isActive && longPressStyle]}
    >
      {head}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  bubble: {
    // borderColor: 'darkgrey',
    // borderWidth: 1,

    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'lightgrey',
    padding: 5,
    borderRadius: 10,

    shadowColor: '#000',
    shadowOffset: { width: 2, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  // heading: {
  //   flexDirection: 'row',
  //   alignItems: 'center',
  //   margin: 12
  // },
  // content: {
  //   flexDirection: 'row',
  //   justifyContent: 'center',
  //   alignItems: 'center',
  //   margin: 10,
  //   marginTop: 0,
  // }
});
