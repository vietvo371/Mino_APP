import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  PermissionsAndroid,
  Modal,
  Dimensions,
  Alert,
  SafeAreaView,
} from 'react-native';
import MapView, { Marker, Region } from 'react-native-maps';
import Geolocation from 'react-native-geolocation-service';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { theme } from '../theme/colors';

interface Location {
  latitude: number;
  longitude: number;
}

interface LocationPickerProps {
  value?: Location;
  onChange: (location: Location) => void;
  label?: string;
  error?: string;
  required?: boolean;
  onAddressChange?: (address: string | null) => void;
}

const DEFAULT_LOCATION = {
  latitude: 28.6139,
  longitude: 77.2090, //New Delhi, India coordinates
};

const LocationPicker: React.FC<LocationPickerProps> = ({
  value,
  onChange,
  label,
  error,
  required = false,
  onAddressChange,
}) => {
  const mapRef = useRef<MapView>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<Location | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(value || null);
  const [mapReady, setMapReady] = useState(false);
  const [addressText, setAddressText] = useState<string | null>(null);

  const requestLocationPermission = async () => {
    try {
      if (Platform.OS === 'ios') {
        const auth = await Geolocation.requestAuthorization('whenInUse');
        if (auth === 'granted') {
          return true;
        }
      } else {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Location Permission',
            message: 'AgriCred needs access to your location to mark your farm location.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          },
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          return true;
        }
      }
      Alert.alert(
        'Permission Denied',
        'Location permission is required to use this feature. Please enable it in your device settings.',
        [{ text: 'OK' }]
      );
      return false;
    } catch (err) {
      console.warn(err);
      return false;
    }
  };

  const animateToLocation = (location: Location) => {
    mapRef.current?.animateToRegion({
      latitude: location.latitude,
      longitude: location.longitude,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    }, 1000);
  };

  const getCurrentLocation = async () => {
    try {
      const hasPermission = await requestLocationPermission();
      if (!hasPermission) {
        return;
      }

      Geolocation.getCurrentPosition(
        position => {
          const location = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          };
          setCurrentLocation(location);
          setSelectedLocation(location);
          onChange(location);
          fetchAddress(location.latitude, location.longitude);
          animateToLocation(location);
          console.log('Current location:', location);
        },
        error => {
          console.error(error);
          Alert.alert(
            'Error',
            'Could not get your location. Please try again or select manually.',
            [{ text: 'OK' }]
          );
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 },
      );
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (!value && !currentLocation) {
      getCurrentLocation();
    }
  }, []);

  const formatLocation = (location: Location) => {
    return `${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}`;
  };

  const fetchAddress = async (lat: number, lon: number) => {
    try {
      const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&addressdetails=1&accept-language=en`;
      const res = await fetch(url, {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'AgriCredApp/1.0'
        }
      });
      const data = await res.json();
      const addr = data?.address || {};
      const road = addr.road || addr.neighbourhood || addr.suburb || null;
      const city = addr.city || addr.town || addr.village || addr.county || null;
      const country = addr.country || null;
      const minimal = [road, city, country].filter(Boolean).join(', ');
      setAddressText(minimal || null);
      console.log('Address:', minimal);
      onAddressChange?.(minimal || null);
    } catch (e) {
      setAddressText(null);
      onAddressChange?.(null);
    }
  };

  const handleMapPress = (e: any) => {
    const location = e.nativeEvent.coordinate;
    setSelectedLocation(location);
    onChange(location);
    fetchAddress(location.latitude, location.longitude);
    console.log('Selected location:', location);
  };

  const handleConfirmLocation = () => {
    if (selectedLocation) {
      onChange(selectedLocation);
      setModalVisible(false);
    } else {
      Alert.alert('Error', 'Please select a location first');
    }
  };

  return (
    <View style={styles.container}>
      {label && (
        <Text style={styles.label}>
          {label}
          {required && <Text style={styles.required}> *</Text>}
        </Text>
      )}
      <TouchableOpacity
        style={[styles.button, error ? styles.buttonError : {}]}
        onPress={() => setModalVisible(true)}>
        <View style={styles.buttonContent}>
          <Icon name="map-marker" size={24} color={theme.colors.primary} style={styles.buttonIcon} />
          <Text
            style={[
              styles.buttonText,
              !selectedLocation && styles.placeholderText,
            ]}>
            {selectedLocation ? (addressText || formatLocation(selectedLocation)) : 'Select location'}
          </Text>
        </View>
      </TouchableOpacity>
      {error && <Text style={styles.errorText}>{error}</Text>}

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalContainer}>
          <SafeAreaView style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={styles.closeButton}>
                <Icon name="arrow-left" size={24} color={theme.colors.text} />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Select Location</Text>
              <View style={styles.headerRight} />
            </View>

            <View style={styles.mapContainer}>
              <MapView
                ref={mapRef}
                style={styles.map}
                initialRegion={{
                  latitude: selectedLocation?.latitude || DEFAULT_LOCATION.latitude,
                  longitude: selectedLocation?.longitude || DEFAULT_LOCATION.longitude,
                  latitudeDelta: 0.0922,
                  longitudeDelta: 0.0421,
                }}
                onPress={handleMapPress}>
                {selectedLocation && (
                  <Marker coordinate={selectedLocation} />
                )}
              </MapView>
            </View>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.currentLocationButton}
                onPress={getCurrentLocation}>
                <Icon name="crosshairs-gps" size={24} color={theme.colors.white} />
                <Text style={styles.currentLocationText}>Use Current Location</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.confirmButton}
                onPress={handleConfirmLocation}>
                <Text style={styles.confirmButtonText}>Confirm Location</Text>
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: theme.spacing.md,
  },
  label: {
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  required: {
    color: theme.colors.error,
  },
  button: {
    height: 48,
    paddingHorizontal: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.white,
    justifyContent: 'center',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonIcon: {
    marginRight: theme.spacing.sm,
  },
  buttonError: {
    borderColor: theme.colors.error,
  },
  buttonText: {
    flex: 1,
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text,
  },
  placeholderText: {
    color: theme.colors.textLight,
  },
  errorText: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.error,
    marginTop: theme.spacing.xs,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: theme.colors.overlay,
  },
  modalContent: {
    flex: 1,
    backgroundColor: theme.colors.white,
    marginTop: 80,
    borderTopLeftRadius: theme.borderRadius.lg,
    borderTopRightRadius: theme.borderRadius.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  modalTitle: {
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: theme.typography.fontSize.lg,
    color: theme.colors.text,
  },
  closeButton: {
    padding: theme.spacing.xs,
  },
  headerRight: {
    width: 40,
  },
  mapContainer: {
    flex: 1,
    overflow: 'hidden',
  },
  map: {
    flex: 1,
    width: '100%',
    height: 200,
  },
  modalFooter: {
    padding: theme.spacing.md,
    backgroundColor: theme.colors.white,
  },
  currentLocationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.sm,
  },
  currentLocationText: {
    marginLeft: theme.spacing.sm,
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.white,
  },
  confirmButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
  },
  confirmButtonText: {
    color: theme.colors.white,
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: theme.typography.fontSize.md,
  },
});

export default LocationPicker; 