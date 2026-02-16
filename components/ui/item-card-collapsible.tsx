import { PropsWithChildren, ReactNode, useState} from "react";
import { View, StyleSheet, TouchableOpacity, Text, ViewProps, StyleProp, ViewStyle, PressableProps} from "react-native";

type ItemCardCollapsibleProps = ViewProps & {
  head: ReactNode;
  children?: ReactNode;
  onPress: () => void;
  pressableStyle?: StyleProp<ViewStyle>;
  headerStyle?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
};

export default function ItemCardCollapsible({ head, children, onPress, pressableStyle, headerStyle, contentStyle}: ItemCardCollapsibleProps) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <TouchableOpacity style={[styles.bubble, pressableStyle]}
      onPress={() => {setIsOpen((value) => !value); onPress()}}
      activeOpacity={0.6}>
      <View style={[styles.heading, headerStyle]}>{head}</View>
      {isOpen && <View style={[styles.content, contentStyle]}>{children}</View>}
    </TouchableOpacity>

  );
}

const styles = StyleSheet.create({
  bubble: {
    // borderColor: 'darkgrey',
    // borderWidth: 1,
    flexDirection: 'column',
    alignItems: 'center',
    backgroundColor: 'lightgrey',
    padding: 5,
    borderRadius: 10,
    gap: 10
  },
    heading: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 12
  },
  content: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    margin: 10,
    marginTop: 0,
  }
});
