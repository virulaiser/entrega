import React from "react";
import { View, StyleSheet,Dimensions } from "react-native";
import MapView, { Marker } from "react-native-maps";


export default function MapsComponents({location}) {
    return (
        <View style={styles.container}>
            <MapView
                style={styles.map}
                initialRegion={{
                    latitude: location.latitude || 37.78825,
                    longitude: location.longitude || -122.4324,
                    latitudeDelta: 0.0922,
                    longitudeDelta: 0.0421,
                }}
            >
                {location.latitude && location.longitude && (
                    <Marker
                        coordinate={{
                            latitude: location.latitude,
                            longitude: location.longitude,
                        }}
                        title="Tu ubicación"
                        description="Aquí estás"
                    />
                )}
            </MapView>
        </View>
    );


}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#f5f5f5",
    },
    map: {
        width: Dimensions.get("window").width,
        height: Dimensions.get("window").height * 0.5,
    },
});