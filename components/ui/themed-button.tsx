import { Button, View } from "react-native"


type buttonProps = {
  text: string;
  style ?: any;
  color ?: string;
  onPress: () => void;
}


export default function ThemedButton({text, style, color, onPress}: buttonProps) {
  return (
    <View style = {[style]}>
      <Button
        onPress={() => {onPress()}}
        title={text}
        color={color ?? "#841584"}
      />
    </View>
  )
}

// Accepts as input styling for the button and its content