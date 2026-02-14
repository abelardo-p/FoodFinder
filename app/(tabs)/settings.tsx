import ThemedButton from "@/components/ui/themed-button";
import { View } from "react-native";

export default function Settings() {
    return (
        <View>
            Empty View
            <ThemedButton style={{flexDirection: 'column', width: '25%'}} text='button' onPress={() => {}}></ThemedButton>
        </View>
    )
}