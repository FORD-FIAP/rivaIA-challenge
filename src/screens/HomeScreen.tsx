/** Tela inicial do app RIVA — hero fullscreen, composer e listagem de veículos */
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Animated,
} from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { Header } from '../components/home/Header';
import { Sidebar } from '../components/home/Sidebar';
import { RivaOrb } from '../components/home/RivaOrb';
import { ChatInput } from '../components/home/ChatInput';
import { FeaturedCard } from '../components/home/FeaturedCard';
import { VehicleCard } from '../components/home/VehicleCard';
import { Colors } from '../theme/colors';
import { featuredVehicle, vehicles } from '../mock/vehicles';
import { Vehicle } from '../types/vehicle';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

/** Altura aproximada do header para o hero ocupar o restante da tela */
const HEADER_HEIGHT = 64;

export function HomeScreen() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [vehicleList, setVehicleList] = useState<Vehicle[]>([]);
  const scrollRef = useRef<ScrollView>(null);
  const bounceAnim = useRef(new Animated.Value(0)).current;

  /** Carrega lista de veículos ao montar a tela */
  useEffect(() => {
    setVehicleList(vehicles);
  }, []);

  /** Animação de bounce contínua no botão flutuante */
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

  /** Rola até a seção de veículos ao pressionar o botão flutuante */
  function scrollToVehicles() {
    scrollRef.current?.scrollTo({ y: SCREEN_HEIGHT - HEADER_HEIGHT, animated: true });
  }

  return (
    <View style={styles.safe}>
      <Header onMenuPress={() => setSidebarOpen(true)} />

      <Sidebar
        visible={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        activeScreen="Início"
      />

      <ScrollView
        ref={scrollRef}
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero — ocupa a tela toda */}
        <View style={[styles.hero, { height: SCREEN_HEIGHT - HEADER_HEIGHT }]}>

          {/* Greeting — centralizado verticalmente */}
          <View style={styles.greetingBlock}>
            <RivaOrb />
            <Text style={styles.title}>
              Olá, <Text style={styles.titleAccent}>Mariana</Text>.
            </Text>
            <Text style={styles.subtitle}>Como posso ajudar?</Text>
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
    </View>
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

  // Hero fullscreen — tudo agrupado no centro da tela
  hero: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    gap: 32,
  },
  greetingBlock: {
    alignItems: 'center',
    gap: 8,
  },
  title: {
    color: Colors.textPrimary,
    fontSize: 26,
    fontWeight: '700',
    letterSpacing: -0.3,
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
    gap: 16,
    alignItems: 'center',
  },
  composerWrapper: {
    width: '100%',
  },

  // Botão flutuante — abaixo do composer
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

  // Seção de veículos
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
