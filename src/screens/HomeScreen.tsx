/** Tela inicial do app RIVA — hero fullscreen, composer e listagem de veículos */
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  useWindowDimensions,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { Header } from '../components/home/Header';
import { RivaOrb } from '../components/home/RivaOrb';
import { useNavigation } from '../context/NavigationContext';
import { ChatInput } from '../components/home/ChatInput';
import { FeaturedCard } from '../components/home/FeaturedCard';
import { VehicleCard } from '../components/home/VehicleCard';
import { Colors } from '../theme/colors';
import { featuredVehicle, vehicles } from '../mock/vehicles';
import { Vehicle } from '../types/vehicle';

export function HomeScreen() {
  const { height: windowHeight } = useWindowDimensions();
  const { openSidebar } = useNavigation();
  const [vehicleList, setVehicleList] = useState<Vehicle[]>([]);
  const [headerHeight, setHeaderHeight] = useState(80);
  const scrollRef = useRef<ScrollView>(null);
  const bounceAnim = useRef(new Animated.Value(0)).current;

  const heroHeight = windowHeight - headerHeight;

  useEffect(() => {
    setVehicleList(vehicles);
  }, []);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(bounceAnim, { toValue: 6, duration: 600, useNativeDriver: true }),
        Animated.timing(bounceAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
      ])
    ).start();
  }, [bounceAnim]);

  function handleSendMessage(message: string) {
    // TODO: integrar com backend quando disponível
    console.log('Mensagem enviada:', message);
  }

  function handleVehiclePress(vehicle: Vehicle) {
    // TODO: navegar para tela de detalhes
    console.log('Veículo selecionado:', vehicle.name);
  }

  function scrollToVehicles() {
    scrollRef.current?.scrollTo({ y: heroHeight, animated: true });
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View onLayout={(e) => setHeaderHeight(e.nativeEvent.layout.height)}>
        <Header onMenuPress={openSidebar} />
      </View>

      <ScrollView
        ref={scrollRef}
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero — ocupa a tela toda abaixo do header */}
        <View style={[styles.hero, { height: heroHeight }]}>

          {/* Greeting */}
          <View style={styles.greetingBlock}>
            <RivaOrb />
            <View style={styles.greetingText}>
              <Text style={styles.title}>
                Olá, <Text style={styles.titleAccent}>Mariana</Text>!
              </Text>
              <Text style={styles.subtitle}>O que gostaria de ver hoje?</Text>
            </View>
          </View>

          {/* Bloco inferior — input + botão flutuante */}
          <View style={styles.bottomBlock}>
            <View style={styles.composerWrapper}>
              <ChatInput onSend={handleSendMessage} />
            </View>

            <Animated.View style={[styles.floatingBtn, { transform: [{ translateY: bounceAnim }] }]}>
              <TouchableOpacity style={styles.floatingBtnInner} onPress={scrollToVehicles}>
                <Text style={styles.floatingBtnLabel}>Veículos da semana</Text>
                <Feather name="chevron-down" size={14} color={Colors.textSecondary} />
              </TouchableOpacity>
            </Animated.View>
          </View>

        </View>

        {/* Seção de veículos — visível ao scrollar */}
        <View style={styles.vehiclesSection}>
          {/* Badge picape da semana */}
          <View style={styles.badgeRow}>
            <View style={styles.badge}>
              <MaterialCommunityIcons name="fire" size={14} color="#E8A020" />
              <Text style={styles.badgeLabel}>PICAPE DA SEMANA</Text>
            </View>
          </View>

          {/* Card destaque */}
          <View style={styles.featuredWrapper}>
            <FeaturedCard
              vehicle={featuredVehicle}
              onPress={() => handleVehiclePress(featuredVehicle)}
            />
          </View>

          {/* Grid */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Veículos mais analisados</Text>
            <TouchableOpacity>
              <Text style={styles.seeAll}>Ver tudo</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.grid}>
            {vehicleList.map((vehicle) => (
              <View key={vehicle.id} style={styles.gridItem}>
                <VehicleCard
                  vehicle={vehicle}
                  onPress={() => handleVehiclePress(vehicle)}
                />
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  scroll: {
    flex: 1,
  },

  hero: {
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 48,
    paddingBottom: 96,
  },
  greetingBlock: {
    alignItems: 'center',
    gap: 38,
    marginTop: '18%',
  },
  greetingText: {
    alignItems: 'center',
    gap: 2,
  },
  title: {
    color: Colors.textPrimary,
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: -0.4,
    textAlign: 'center',
    fontFamily: 'Sora_700Bold',
  },
  titleAccent: {
    color: Colors.accent,
  },
  subtitle: {
    color: Colors.textSecondary,
    fontSize: 16,
    fontWeight: '400',
    textAlign: 'center',
    fontFamily: 'Sora_400Regular',
  },
  bottomBlock: {
    width: '100%',
    gap: 24,
    alignItems: 'center',
  },
  composerWrapper: {
    width: '100%',
  },

  floatingBtn: {
    alignItems: 'center',
  },
  floatingBtnInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  floatingBtnLabel: {
    color: Colors.textSecondary,
    fontSize: 13,
    fontFamily: 'Sora_400Regular',
  },

  vehiclesSection: {
    paddingHorizontal: 20,
    paddingBottom: 48,
    paddingTop: 8,
  },
  badgeRow: {
    marginBottom: 14,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(232,160,32,0.12)',
    borderWidth: 1,
    borderColor: '#E8A020',
    borderRadius: Colors.radiusPill,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  badgeLabel: {
    color: '#E8A020',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    fontFamily: 'Sora_700Bold',
  },
  featuredWrapper: {
    marginBottom: 28,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  sectionTitle: {
    color: Colors.textPrimary,
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Sora_600SemiBold',
  },
  seeAll: {
    color: Colors.accent,
    fontSize: 13,
    fontFamily: 'Sora_400Regular',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  gridItem: {
    width: '47.5%',
  },
});