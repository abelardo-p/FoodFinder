import { useState } from "react";
import { View, StyleSheet, Text, TextInput, StyleProp, ViewStyle, TextStyle} from "react-native";

type searchBarProps = {
  containerStyle?: StyleProp<ViewStyle>;
  searchBarStyle?: StyleProp<TextStyle>;
  onChangeCallBack: (text: string) => void;
}

export default function SearchBar({containerStyle, searchBarStyle, onChangeCallBack}: searchBarProps) {
  const [text, setText] = useState(''); 
  return (
    <View style={[containerStyle, containerStyle]}>
      <TextInput
        placeholder="Search Ingredients"
        onChangeText={(text: string) => {setText(text); onChangeCallBack(text);}}
        defaultValue={text}
        style={[styles.searchBar, searchBarStyle]}
      />
    </View> 
  );
}

const styles = StyleSheet.create({
  searchBar: {
    height: 50,
    width: 225,
    padding: 5,
    marginHorizontal: 8,
    borderWidth: 1,
  }
});