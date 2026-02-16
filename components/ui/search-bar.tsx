import { useState, useEffect } from "react";
import { View, StyleSheet, Text, TextInput, StyleProp, ViewStyle, TextStyle} from "react-native";

type searchBarProps = {
  onChange: (text: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  containerStyle?: StyleProp<ViewStyle>;
  searchBarStyle?: StyleProp<TextStyle>;
}

export default function SearchBar({onChange, onFocus, onBlur, containerStyle, searchBarStyle}: searchBarProps) {
  const [text, setText] = useState(''); 




  return (
    <View style={[containerStyle, containerStyle]}>
      <TextInput
        placeholder="Search Ingredients"
        onChangeText={(text: string) => {setText(text); onChange(text); }}
        onFocus= {() => onFocus?.()}
        onBlur = {() => onBlur?.()}
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