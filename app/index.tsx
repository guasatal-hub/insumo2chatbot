import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Audio } from "expo-av";
import * as Clipboard from "expo-clipboard";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import Animated, {
  FadeInLeft,
  FadeInRight,
  FadeOutDown,
  interpolateColor,
  Layout,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { model } from "./gemini";
import { colors, styles } from "./styles/chatStyles";

// Componente del Indicador de Escritura de la IA
function TypingIndicator({ activeColors }: { activeColors: any }) {
  const dot1 = useSharedValue(0);
  const dot2 = useSharedValue(0);
  const dot3 = useSharedValue(0);

  useEffect(() => {
    dot1.value = withRepeat(
      withSequence(withTiming(-6, { duration: 300 }), withTiming(0, { duration: 300 })),
      -1,
      true
    );
    const t2 = setTimeout(() => {
      dot2.value = withRepeat(
        withSequence(withTiming(-6, { duration: 300 }), withTiming(0, { duration: 300 })),
        -1,
        true
      );
    }, 150);
    const t3 = setTimeout(() => {
      dot3.value = withRepeat(
        withSequence(withTiming(-6, { duration: 300 }), withTiming(0, { duration: 300 })),
        -1,
        true
      );
    }, 300);

    return () => {
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, []);

  const animatedDot1 = useAnimatedStyle(() => ({
    transform: [{ translateY: dot1.value }],
  }));
  const animatedDot2 = useAnimatedStyle(() => ({
    transform: [{ translateY: dot2.value }],
  }));
  const animatedDot3 = useAnimatedStyle(() => ({
    transform: [{ translateY: dot3.value }],
  }));

  return (
    <Animated.View
      entering={FadeInLeft.duration(300)}
      exiting={FadeOutDown.duration(200)}
      style={styles.botMessageContainer}
    >
      <View style={[styles.avatar, { backgroundColor: "#8B5CF6" }]}>
        <Ionicons name="sparkles" size={18} color="#FFFFFF" />
      </View>
      <View style={styles.botBubbleWrapper}>
        <View style={[styles.bubbleBot, { backgroundColor: activeColors.aiCard }]}>
          <View style={styles.typingContainer}>
            <View style={styles.dotsRow}>
              <Animated.View
                style={[styles.typingDot, { backgroundColor: activeColors.mainText }, animatedDot1]}
              />
              <Animated.View
                style={[styles.typingDot, { backgroundColor: activeColors.mainText }, animatedDot2]}
              />
              <Animated.View
                style={[styles.typingDot, { backgroundColor: activeColors.mainText }, animatedDot3]}
              />
            </View>
            <Text style={[styles.typingText, { color: activeColors.secondaryText }]}>
              La IA está escribiendo...
            </Text>
          </View>
        </View>
      </View>
    </Animated.View>
  );
}

export default function ChatBot() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<
    { role: string; text: string; time: string; liked?: boolean }[]
  >([
    {
      role: "bot",
      text: "¡Hola! Soy tu asistente de Inteligencia Artificial. ¿En qué puedo ayudarte hoy?",
      time: "Ayer",
      liked: false,
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [sound, setSound] = useState<any>();
  const scrollRef = useRef<ScrollView>(null);
  const insets = useSafeAreaInsets();

  // Reanimated Shared Value para transición suave de temas
  const themeProgress = useSharedValue(0);

  // Carga inicial del tema persistido
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem("theme_preference");
        if (savedTheme === "dark" || savedTheme === "light") {
          setTheme(savedTheme);
          themeProgress.value = savedTheme === "dark" ? 0 : 1;
        }
      } catch (error) {
        console.log("Error loading theme:", error);
      }
    };
    loadTheme();
  }, []);

  // Escuchar cambios de tema para animar
  useEffect(() => {
    themeProgress.value = withTiming(theme === "dark" ? 0 : 1, { duration: 350 });
  }, [theme]);

  // Alternar Modo Oscuro / Claro
  const toggleTheme = async () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    try {
      await AsyncStorage.setItem("theme_preference", nextTheme);
    } catch (error) {
      console.log("Error saving theme:", error);
    }
  };

  // 🔊 Sonido de Envío
  async function playSendSound() {
    try {
      const { sound } = await Audio.Sound.createAsync(
        require("../assets/images/send.mp3.mp3")
      );
      setSound(sound);
      await sound.playAsync();
    } catch (error) {
      console.log("Error playing sound:", error);
    }
  }

  useEffect(() => {
    return sound
      ? () => {
        sound.unloadAsync();
      }
      : undefined;
  }, [sound]);

  // 🕒 Obtener Hora
  const getHour = () => {
    const now = new Date();
    return now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  // 📋 Copiar Texto al Portapapeles
  const copyToClipboard = async (text: string) => {
    await Clipboard.setStringAsync(text);
    Alert.alert("Mensaje Copiado", "El texto se copió al portapapeles con éxito.");
  };

  // ❤️ Marcar Favorito
  const toggleLike = (index: number) => {
    setMessages((prev) =>
      prev.map((msg, i) =>
        i === index ? { ...msg, liked: !msg.liked } : msg
      )
    );
  };

  // 🔄 Regenerar Respuesta
  const handleRegenerate = async (index: number) => {
    const userPrompt = messages[index - 1]?.role === "user" ? messages[index - 1].text : "";
    if (!userPrompt) return;

    setIsTyping(true);
    scrollToBottom();

    try {
      const result = await model.generateContent(userPrompt);
      const aiText = result.response.text();
      setIsTyping(false);

      setMessages((prev) =>
        prev.map((msg, i) =>
          i === index ? { ...msg, text: aiText, time: getHour() } : msg
        )
      );
    } catch (error) {
      console.log("Error regenerating response:", error);
      setIsTyping(false);
    }
  };

  // 📤 Enviar Mensaje
  const handleSend = async () => {
    if (!input.trim()) return;

    playSendSound();

    const userMessage = {
      role: "user",
      text: input.trim(),
      time: getHour(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const currentPrompt = input;
    setInput("");
    setIsTyping(true);
    scrollToBottom();

    try {
      const result = await model.generateContent(currentPrompt);
      const aiText = result.response.text();

      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        { role: "bot", text: aiText, time: getHour(), liked: false },
      ]);
      scrollToBottom();
    } catch (error) {
      console.log("Error:", error);
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          role: "bot",
          text: "Lo siento, ocurrió un error en la conexión. Por favor, intenta de nuevo.",
          time: getHour(),
          liked: false,
        },
      ]);
      scrollToBottom();
    }
  };

  // Auto-scroll al final
  const scrollToBottom = () => {
    setTimeout(() => {
      scrollRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  // Colores Activos según el Estado
  const activeColors = theme === "dark" ? colors.dark : colors.light;

  // Estilos Animados con Reanimated
  const containerAnimatedStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      themeProgress.value,
      [0, 1],
      [colors.dark.background, colors.light.background]
    ),
  }));

  const headerAnimatedStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      themeProgress.value,
      [0, 1],
      [colors.dark.headerBg, colors.light.headerBg]
    ),
    borderBottomColor: interpolateColor(
      themeProgress.value,
      [0, 1],
      [colors.dark.border, colors.light.border]
    ),
  }));

  const inputContainerAnimatedStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      themeProgress.value,
      [0, 1],
      [colors.dark.background, colors.light.background]
    ),
    borderTopColor: interpolateColor(
      themeProgress.value,
      [0, 1],
      [colors.dark.border, colors.light.border]
    ),
  }));

  const paddingTop = insets.top > 0 ? insets.top : 40;
  const paddingBottom = insets.bottom > 0 ? insets.bottom : 10;

  return (
    <Animated.View style={[styles.container, containerAnimatedStyle]}>
      <StatusBar barStyle={theme === "dark" ? "light-content" : "dark-content"} />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
      >
        {/* CABECERA (HEADER) */}
        <Animated.View style={[styles.header, { paddingTop }, headerAnimatedStyle]}>
          <TouchableOpacity style={styles.headerBtn}>
            <Ionicons name="menu" size={24} color={activeColors.iconColor} />
          </TouchableOpacity>

          <View style={styles.headerInfo}>
            <Text style={[styles.headerTitle, { color: activeColors.mainText }]}>
              Gemini Chat
            </Text>
            <View style={styles.statusRow}>
              <View style={styles.onlineDot} />
              <Text style={[styles.headerSubtitle, { color: activeColors.secondaryText }]}>
                Asistente Inteligente activo
              </Text>
            </View>
          </View>

          <View style={styles.headerRightActions}>
            <TouchableOpacity onPress={toggleTheme} style={[styles.headerBtn, { marginRight: 8 }]}>
              <Ionicons
                name={theme === "dark" ? "sunny" : "moon"}
                size={22}
                color={activeColors.iconColor}
              />
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerBtn}>
              <Ionicons name="settings-outline" size={22} color={activeColors.iconColor} />
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* ÁREA DE CHAT (MENSAJES) */}
        <ScrollView
          ref={scrollRef}
          onContentSizeChange={scrollToBottom}
          style={styles.chatArea}
          contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 16, paddingBottom: 30 }}
        >
          {messages.map((msg, index) => {
            const isUser = msg.role === "user";

            return (
              <Animated.View
                key={index}
                entering={isUser ? FadeInRight.duration(300) : FadeInLeft.duration(300)}
                layout={Layout.springify()}
                style={isUser ? styles.userMessageContainer : styles.botMessageContainer}
              >
                {/* Avatar para la IA (a la izquierda) */}
                {!isUser && (
                  <View style={[styles.avatar, { backgroundColor: "#8B5CF6" }]}>
                    <Ionicons name="sparkles" size={18} color="#FFFFFF" />
                  </View>
                )}

                <View style={isUser ? styles.userBubbleWrapper : styles.botBubbleWrapper}>
                  <View
                    style={[
                      isUser ? styles.bubbleUser : styles.bubbleBot,
                      {
                        backgroundColor: isUser
                          ? activeColors.userBubble
                          : activeColors.aiCard,
                        shadowColor: "#000",
                        shadowOffset: { width: 0, height: 1 },
                        shadowOpacity: theme === "light" ? 0.05 : 0,
                        shadowRadius: 4,
                        elevation: theme === "light" ? 1 : 0,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        isUser ? styles.userText : styles.botText,
                        { color: isUser ? "#FFFFFF" : activeColors.mainText },
                      ]}
                    >
                      {msg.text}
                    </Text>
                    <Text
                      style={[
                        isUser ? styles.timeUser : styles.timeBot,
                        {
                          color: isUser
                            ? "rgba(255, 255, 255, 0.7)"
                            : activeColors.secondaryText,
                        },
                      ]}
                    >
                      {msg.time}
                    </Text>
                  </View>

                  {/* Acciones de Mensaje IA */}
                  {!isUser && (
                    <View style={styles.actionButtons}>
                      <TouchableOpacity
                        onPress={() => copyToClipboard(msg.text)}
                        style={[styles.actionBtn, { backgroundColor: activeColors.inputBg }]}
                      >
                        <Ionicons name="copy-outline" size={14} color={activeColors.secondaryText} />
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => toggleLike(index)}
                        style={[styles.actionBtn, { backgroundColor: activeColors.inputBg }]}
                      >
                        <Ionicons
                          name={msg.liked ? "heart" : "heart-outline"}
                          size={14}
                          color={msg.liked ? "#EF4444" : activeColors.secondaryText}
                        />
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => handleRegenerate(index)}
                        style={[styles.actionBtn, { backgroundColor: activeColors.inputBg }]}
                      >
                        <Ionicons name="refresh-outline" size={14} color={activeColors.secondaryText} />
                      </TouchableOpacity>
                    </View>
                  )}
                </View>

                {/* Avatar para el Usuario (a la derecha) */}
                {isUser && (
                  <View style={[styles.avatar, { backgroundColor: activeColors.userBubble }]}>
                    <Ionicons name="person" size={18} color="#FFFFFF" />
                  </View>
                )}
              </Animated.View>
            );
          })}

          {/* Animación de Escritura de la IA */}
          {isTyping && <TypingIndicator activeColors={activeColors} />}
        </ScrollView>

        {/* INPUT DE ESCRITURA */}
        <Animated.View
          style={[
            styles.inputWrapper,
            { paddingBottom: paddingBottom + 8 },
            inputContainerAnimatedStyle,
          ]}
        >
          <View
            style={[
              styles.inputContainer,
              {
                backgroundColor: activeColors.inputBg,
                borderColor: activeColors.border,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: -2 },
                shadowOpacity: theme === "light" ? 0.03 : 0,
                shadowRadius: 4,
                elevation: theme === "light" ? 1 : 0,
              },
            ]}
          >
            <TouchableOpacity style={styles.inputIconBtn}>
              <Ionicons name="add-circle-outline" size={24} color={activeColors.secondaryText} />
            </TouchableOpacity>

            <TextInput
              value={input}
              onChangeText={setInput}
              onFocus={scrollToBottom}
              placeholder="Escribe tu mensaje..."
              placeholderTextColor={activeColors.secondaryText}
              style={[
                styles.input,
                {
                  color: activeColors.mainText,
                },
              ]}
              multiline
            />

            <TouchableOpacity
              onPress={handleSend}
              disabled={!input.trim()}
              style={[
                styles.sendBtn,
                {
                  backgroundColor: input.trim() ? activeColors.userBubble : "rgba(148, 163, 184, 0.2)",
                },
              ]}
            >
              <Ionicons
                name="send"
                size={16}
                color={input.trim() ? "#FFFFFF" : activeColors.secondaryText}
              />
            </TouchableOpacity>
          </View>
        </Animated.View>
      </KeyboardAvoidingView>
    </Animated.View>
  );
}
