/** Bottom sheet de detalhe do veículo — identificação e preço reais da FIPE */
import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Animated,
  useWindowDimensions,
} from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { Vehicle } from '../../types/vehicle';
import { Colors } from '../../theme/colors';
import { useFavoritesContext } from '../../context/FavoritesContext';
import { useAuth } from '../../context/AuthContext';
import { useRecentlyViewedContext } from '../../context/RecentlyViewedContext';
import { useNavigation } from '../../context/NavigationContext';
import { useChat } from '../../context/ChatContext';
import { useFipePrice } from '../../hooks/useFipePrice';

interface VeiculoFichaProps {
  vehicle: Vehicle | null;
  onClose: () => void;
}

export function VeiculoFicha({ vehicle, onClose }: VeiculoFichaProps) {
  const { height: screenHeight } = useWindowDimensions();
  const { isFavorite, toggle } = useFavoritesContext();
  const { isAuthenticated, requestLogin } = useAuth();
  const { trackView } = useRecentlyViewedContext();
  const { openCompareWithVehicle, navigate } = useNavigation();
  const { sendMessage } = useChat();
  const favorited = isAuthenticated && vehicle ? isFavorite(vehicle.id) : false;
  const slideAnim = useRef(new Animated.Value(screenHeight)).current;
  const backdropAnim = useRef(new Animated.Value(0)).current;
  const fipe = useFipePrice(vehicle?.fipeCode, vehicle?.preco ?? '');

  const visible = vehicle !== null;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: visible ? 0 : screenHeight,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(backdropAnim, {
        toValue: visible ? 1 : 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
    if (visible && vehicle) trackView(vehicle.id);
  }, [visible]);

  if (!vehicle) return null;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents={visible ? 'auto' : 'none'}>
      {/* Backdrop */}
      <Animated.View style={[styles.backdrop, { opacity: backdropAnim }]}>
        <TouchableOpacity style={StyleSheet.absoluteFill} onPress={onClose} activeOpacity={1} />
      </Animated.View>

      {/* Painel */}
      <Animated.View style={[styles.panel, { transform: [{ translateY: slideAnim }] }]}>
        <ScrollView showsVerticalScrollIndicator={false} style={styles.scroll} bounces={false}>
          <View style={styles.imageArea}>
            <View style={styles.imagePlaceholder}>
              <MaterialCommunityIcons name="car-side" size={80} color={Colors.action} />
            </View>

            <View style={styles.brandBadge}>
              <Text style={styles.brandBadgeText}>{vehicle.marca}</Text>
            </View>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Feather name="x" size={16} color={Colors.textPrimary} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.favButton}
              onPress={() => {
                if (isAuthenticated) {
                  toggle(vehicle.id);
                } else {
                  requestLogin({ type: 'vehicle', vehicle }, () => toggle(vehicle.id));
                }
              }}
            >
              <MaterialCommunityIcons
                name={favorited ? 'star' : 'star-outline'}
                size={17}
                color={favorited ? Colors.accent : Colors.textPrimary}
              />
            </TouchableOpacity>
          </View>

          <View style={styles.body}>
            <Text style={styles.name}>{vehicle.modelo}</Text>

            <View style={styles.identGrid}>
              <IdentItem label="Marca" value={vehicle.marca} />
              <IdentItem label={fipe.isLive ? 'Preço (FIPE)' : 'Preço'} value={fipe.price || 'Indisponível'} valueAccent />
            </View>

            <View style={styles.noticeBox}>
              <Feather name="info" size={14} color={Colors.textMuted} />
              <Text style={styles.noticeText}>
                Ficha técnica completa (motor, dimensões, off-road, segurança) ainda não
                está disponível — vai chegar quando integrarmos uma API específica pra isso.
              </Text>
            </View>

            <View style={{ height: 12 }} />
          </View>
        </ScrollView>

        {/* Botões fixos no rodapé */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.compareButton}
            onPress={() => {
              openCompareWithVehicle(vehicle.id);
              onClose();
            }}
          >
            <MaterialCommunityIcons name="compare-horizontal" size={18} color={Colors.textPrimary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.rivaButton}
            onPress={() => {
              sendMessage(`Me conte mais sobre o ${vehicle.modelo}`);
              navigate('Início');
              onClose();
            }}
          >
            <MaterialCommunityIcons name="star-four-points-outline" size={16} color="#FFFFFF" />
            <Text style={styles.rivaLabel}>Falar com RIVA</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </View>
  );
}

function IdentItem({ label, value, valueAccent }: { label: string; value: string; valueAccent?: boolean }) {
  return (
    <View style={identItemStyles.container}>
      <Text style={identItemStyles.label}>{label}</Text>
      <Text style={[identItemStyles.value, valueAccent && identItemStyles.valueAccent]} numberOfLines={2}>{value}</Text>
    </View>
  );
}

const identItemStyles = StyleSheet.create({
  container: {
    width: '47%',
    gap: 3,
  },
  label: {
    color: Colors.textHint,
    fontSize: 11,
    fontFamily: 'Sora_400Regular',
  },
  value: {
    color: Colors.textPrimary,
    fontSize: 14,
    fontWeight: '700',
    fontFamily: 'Sora_700Bold',
  },
  valueAccent: {
    color: Colors.accent,
  },
});

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  panel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.bg,
    borderTopLeftRadius: Colors.radius2xl,
    borderTopRightRadius: Colors.radius2xl,
    maxHeight: '92%',
    overflow: 'hidden',
  },
  scroll: {
    flex: 1,
  },
  imageArea: {
    height: 220,
    backgroundColor: Colors.surface,
    position: 'relative',
    overflow: 'hidden',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandBadge: {
    position: 'absolute',
    top: 16,
    left: 20,
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderRadius: Colors.radiusPill,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  brandBadgeText: {
    color: Colors.bg,
    fontSize: 12,
    fontWeight: '700',
    fontFamily: 'Sora_700Bold',
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 20,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  favButton: {
    position: 'absolute',
    top: 56,
    right: 20,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  name: {
    color: Colors.textPrimary,
    fontSize: 22,
    fontWeight: '700',
    fontFamily: 'Sora_700Bold',
    marginBottom: 16,
  },
  identGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20,
  },
  noticeBox: {
    flexDirection: 'row',
    gap: 8,
    backgroundColor: Colors.surface2,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Colors.radiusMd,
    padding: 12,
  },
  noticeText: {
    flex: 1,
    color: Colors.textMuted,
    fontSize: 12,
    lineHeight: 18,
    fontFamily: 'Sora_400Regular',
  },
  footer: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  compareButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.borderStrong,
  },
  rivaButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: Colors.action,
    borderRadius: Colors.radiusPill,
    paddingVertical: 10,
  },
  rivaLabel: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
    fontFamily: 'Sora_700Bold',
  },
});
