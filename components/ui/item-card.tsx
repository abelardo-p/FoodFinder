import { PropsWithChildren, ReactNode, useState} from "react";
import { View, StyleSheet, TouchableOpacity, Text} from "react-native";

export default function ItemCard({ head, children }: PropsWithChildren & { head: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <View style={[styles.bubble]}>
      <TouchableOpacity
        onPress={() => setIsOpen((value) => !value)}
        activeOpacity={0.6}>
        <View style={styles.heading}>{head}</View>
        {isOpen && <View style={styles.content}>{children}</View>}
      </TouchableOpacity>
    </View>
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
