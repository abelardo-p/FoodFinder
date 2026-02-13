import { useState } from "react";
import { View, StyleSheet, Text, TextInput} from "react-native";

type updateFunction = {
  onChangeCallback: (text: string) => void;
}

export default function SearchBar({onChangeCallback}: updateFunction) {
  const [text, onChangeText] = useState(''); 
  return (
    <View>
      <TextInput
        placeholder="Search"
        onChangeText={(text: string) => {onChangeText(text); onChangeCallback(text)}}
        defaultValue={text}
        style={styles.searchBar}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  searchBar: {
    height: 40,
    padding: 5,
    marginHorizontal: 8,
    borderWidth: 1,
  }
});