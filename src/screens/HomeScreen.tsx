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
import { useAuth } from '../context/AuthContext';
import { useFavoritesContext } from '../context/FavoritesContext';
import { useChat } from '../context/ChatContext';
import { ChatInput } from '../components/home/ChatInput';
import { ChatThread } from '../components/home/ChatThread';
import { FeaturedCard } from '../components/home/FeaturedCard';
import { VeiculoCard } from '../components/home/VeiculoCard';
import { Colors } from '../theme/colors';
import { featuredVehicle, vehicles } from '../mock/vehicles';
import { Vehicle } from '../types/vehicle';
import { VeiculoFicha } from '../components/veiculos/VeiculoFicha';

export function HomeScreen() {
  const { height: windowHeight } = useWindowDimensions();
  const { openSidebar, navigate } = useNavigation();
  const { user, isAuthenticated, requestLogin } = useAuth();
  const { favorites } = useFavoritesContext();
  const { messages, hasConversation, isTyping, isFavorited, sendMessage, toggleFavorite } = useChat();

  function handleToggleFavoriteChat() {
    if (isAuthenticated) {
      toggleFavorite();
    } else {
      requestLogin({ type: 'chat' }, toggleFavorite);
    }
  }
  const chatAnim = useRef(new Animated.Value(hasConversation ? 1 : 0)).current;
  const favoriteVehicles = vehicles
    .concat(featuredVehicle)
    .filter((v) => favorites.includes(v.id));
  const [vehicleList, setVehicleList] = useState<Vehicle[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
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

  useEffect(() => {
    Animated.timing(chatAnim, {
      toValue: hasConversation ? 1 : 0,
      duration: 450,
      useNativeDriver: true,
    }).start();
  }, [hasConversation, chatAnim]);

  function handleSendMessage(_message: string) {
    // Chat mockado: o texto digitado é descartado e o próximo turno
    // do roteiro (mock/rivaChat.ts) é revelado.
    sendMessage();
  }

  function handleVehiclePress(vehicle: Vehicle) {
    setSelectedVehicle(vehicle);
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
        {/* Hero — ocupa a tela toda abaixo do header (sem conversa) ou
            vira modo chat (com conversa em andamento) */}
        <View style={[styles.hero, { height: heroHeight }, hasConversation && styles.heroChat]}>

          {/* Camada Greeting — fica visível enquanto não há conversa */}
          <Animated.View
            style={[
              styles.heroLayer,
              styles.greetingLayer,
              {
                opacity: chatAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 0] }),
                transform: [
                  {
                    translateY: chatAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, -16],
                    }),
                  },
                ],
              },
            ]}
            pointerEvents={hasConversation ? 'none' : 'auto'}
          >
            <View style={styles.greetingBlock}>
              <RivaOrb />
              <View style={styles.greetingText}>
                <Text style={styles.title}>
                  Olá{user ? <>, <Text style={styles.titleAccent}>{user.name}</Text></> : null}!
                </Text>
                <Text style={styles.subtitle}>O que gostaria de ver hoje?</Text>
              </View>
            </View>

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
          </Animated.View>

          {/* Camada Chat — entra com fade/translate quando há conversa */}
          <Animated.View
            style={[
              styles.heroLayer,
              styles.chatLayer,
              {
                opacity: chatAnim,
                transform: [
                  {
                    translateY: chatAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [16, 0],
                    }),
                  },
                ],
              },
            ]}
            pointerEvents={hasConversation ? 'auto' : 'none'}
          >
            <View style={styles.chatHeader}>
              <View style={styles.chatHeaderLeft}>
                <RivaOrb size={28} />
                <View>
                  <Text style={styles.chatHeaderTitle}>RIVA</Text>
                  <Text style={styles.chatHeaderSubtitle}>Assistente de veículos</Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={handleToggleFavoriteChat}
                style={styles.chatFavBtn}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <MaterialCommunityIcons
                  name={isFavorited ? 'star' : 'star-outline'}
                  size={18}
                  color={isFavorited ? Colors.accent : Colors.textMuted}
                />
              </TouchableOpacity>
            </View>

            <View style={styles.chatThreadWrapper}>
              <ChatThread messages={messages} isTyping={isTyping} />
            </View>

            <View style={styles.composerWrapper}>
              <ChatInput onSend={handleSendMessage} />
            </View>
          </Animated.View>

        </View>

        {/* Seção de veículos — escondida quando há chat ativo */}
        {!hasConversation && (
        <View style={styles.vehiclesSection}>
          {/* Badge carro da semana */}
          <View style={styles.badgeRow}>
            <View style={styles.badge}>
              <MaterialCommunityIcons name="fire" size={14} color="#E8A020" />
              <Text style={styles.badgeLabel}>CARRO DA SEMANA</Text>
            </View>
          </View>

          {/* Card destaque */}
          <View style={styles.featuredWrapper}>
            <FeaturedCard
              vehicle={featuredVehicle}
              onPress={() => handleVehiclePress(featuredVehicle)}
            />
          </View>

          {/* Favoritos */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Favoritos</Text>
          </View>
          {!isAuthenticated || favoriteVehicles.length === 0 ? (
            <View style={styles.favoritesEmpty}>
              <MaterialCommunityIcons name="star-outline" size={20} color={Colors.textMuted} />
              <Text style={styles.favoritesEmptyText}>
                Favorite algum conteúdo que gostou!
              </Text>
            </View>
          ) : (
            <View style={[styles.grid, { marginBottom: 28 }]}>
              {favoriteVehicles.map((vehicle) => (
                <View key={vehicle.id} style={styles.gridItem}>
                  <VeiculoCard
                    vehicle={vehicle}
                    onPress={() => handleVehiclePress(vehicle)}
                  />
                </View>
              ))}
            </View>
          )}

          {/* Grid */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Veículos mais analisados</Text>
            <TouchableOpacity onPress={() => navigate('Veículos')}>
              <Text style={styles.seeAll}>Ver tudo</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.grid}>
            {vehicleList.map((vehicle) => (
              <View key={vehicle.id} style={styles.gridItem}>
                <VeiculoCard
                  vehicle={vehicle}
                  onPress={() => handleVehiclePress(vehicle)}
                />
              </View>
            ))}
          </View>
        </View>
        )}
      </ScrollView>

      <VeiculoFicha
        vehicle={selectedVehicle}
        onClose={() => setSelectedVehicle(null)}
      />

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
    position: 'relative',
  },
  heroLayer: {
    ...StyleSheet.absoluteFillObject,
  },
  greetingLayer: {
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 48,
    paddingBottom: 96,
  },
  chatLayer: {
    alignItems: 'stretch',
    justifyContent: 'flex-start',
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 16,
    gap: 8,
  },
  heroChat: {},
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
    paddingVertical: 4,
  },
  chatHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  chatHeaderTitle: {
    color: Colors.textPrimary,
    fontSize: 14,
    fontFamily: 'Sora_700Bold',
  },
  chatHeaderSubtitle: {
    color: Colors.textMuted,
    fontSize: 11,
    fontFamily: 'Sora_400Regular',
  },
  chatFavBtn: {
    width: 38,
    height: 38,
    borderRadius: Colors.radiusPill,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chatResetBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chatThreadWrapper: {
    flex: 1,
    minHeight: 0,
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
  favoritesEmpty: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 18,
    paddingHorizontal: 14,
    backgroundColor: Colors.surface,
    borderRadius: Colors.radiusLg,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 28,
  },
  favoritesEmptyText: {
    flex: 1,
    color: Colors.textMuted,
    fontSize: 13,
    fontFamily: 'Sora_400Regular',
  },
});