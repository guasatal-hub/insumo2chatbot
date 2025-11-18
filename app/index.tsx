import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Clipboard,
  Alert,
} from "react-native";
import { Audio } from "expo-av";
import { model } from "./gemini.ts";

const botAvatar = require("../assets/images/bot.png");

export default function ChatBot() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<
    { role: string; text: string; time: string; liked?: boolean }[]
  >([]);
  const [sound, setSound] = useState<any>();
  const scrollRef = useRef<any>();

  // 🔊 SONIDO DE ENVÍO
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

  // 🕒 HORA
  const getHour = () => {
    const now = new Date();
    return now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  // 📋 COPIAR TEXTO
  const copyToClipboard = (text: string) => {
    Clipboard.setString(text);
    Alert.alert("Copiado", "Texto copiado al portapapeles");
  };

  // ❤️ DAR LIKE
  const toggleLike = (index: number) => {
    setMessages((prev) =>
      prev.map((msg, i) =>
        i === index ? { ...msg, liked: !msg.liked } : msg
      )
    );
  };

  // 📤 ENVIAR MENSAJE
  const handleSend = async () => {
    if (!input.trim()) return;

    playSendSound();

    const userMessage = {
      role: "user",
      text: input,
      time: getHour(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    // Mostrar "escribiendo..."
    setMessages((prev) => [
      ...prev,
      { role: "typing", text: "Escribiendo...", time: getHour() },
    ]);

    try {
      const result = await model.generateContent(input);
      const aiText = result.response.text();

      // Quitar "escribiendo..."
      setMessages((prev) => prev.filter((m) => m.role !== "typing"));

      // Mensaje del bot
      setMessages((prev) => [
        ...prev,
        { role: "bot", text: aiText, time: getHour(), liked: false },
      ]);
    } catch (error) {
      console.log("Error:", error);
      setMessages((prev) => prev.filter((m) => m.role !== "typing"));
      setMessages((prev) => [
        ...prev,
        {
          role: "bot",
          text: "Lo siento, ocurrió un error. Intenta de nuevo.",
          time: getHour(),
          liked: false,
        },
      ]);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 20}
    >
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity>
          <Text style={styles.backBtn}>←</Text>
        </TouchableOpacity>
        <Image source={botAvatar} style={styles.headerAvatar} />
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>Text writer</Text>
          <Text style={styles.headerSubtitle}>Healthy eating tips</Text>
        </View>
        <TouchableOpacity>
          <Text style={styles.menuBtn}>⋮</Text>
        </TouchableOpacity>
      </View>

      {/* CHAT */}
      <ScrollView
        ref={scrollRef}
        onContentSizeChange={() =>
          scrollRef.current?.scrollToEnd({ animated: true })
        }
        style={styles.chatArea}
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        {messages.map((msg, index) => (
          <View key={index}>
            {msg.role === "user" ? (
              // MENSAJE USUARIO
              <View style={styles.userMessageContainer}>
                <View style={styles.bubbleUser}>
                  <Text style={styles.userText}>{msg.text}</Text>
                  <Text style={styles.timeUser}>{msg.time}</Text>
                </View>
              </View>
            ) : msg.role === "typing" ? (
              // ESCRIBIENDO...
              <View style={styles.botMessageContainer}>
                <Image source={botAvatar} style={styles.avatar} />
                <View style={styles.bubbleTyping}>
                  <Text style={styles.typingText}>{msg.text}</Text>
                </View>
              </View>
            ) : (
              // MENSAJE BOT
              <View style={styles.botMessageContainer}>
                <Image source={botAvatar} style={styles.avatar} />
                <View style={styles.botBubbleWrapper}>
                  <View style={styles.bubbleBot}>
                    <Text style={styles.botText}>{msg.text}</Text>
                    <Text style={styles.timeBot}>{msg.time}</Text>
                  </View>
                  {/* BOTONES DE ACCIÓN */}
                  <View style={styles.actionButtons}>
                    <TouchableOpacity
                      onPress={() => copyToClipboard(msg.text)}
                      style={styles.actionBtn}
                    >
                      <Text style={styles.actionIcon}>📋</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => toggleLike(index)}
                      style={styles.actionBtn}
                    >
                      <Text style={styles.actionIcon}>
                        {msg.liked ? "❤️" : "🤍"}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionBtn}>
                      <Text style={styles.actionIcon}>🔄</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            )}
          </View>
        ))}
      </ScrollView>

      {/* INPUT */}
      <View style={styles.inputContainer}>
        <TouchableOpacity style={styles.iconBtn}>
          <Text style={styles.icon}>😊</Text>
        </TouchableOpacity>
        
        <TextInput
          value={input}
          onChangeText={setInput}
          placeholder="Send message..."
          placeholderTextColor="#999"
          style={styles.input}
          multiline
        />
        
        <TouchableOpacity style={styles.iconBtn}>
          <Text style={styles.icon}>📎</Text>
        </TouchableOpacity>
        
        <TouchableOpacity onPress={handleSend} style={styles.sendBtn}>
          <Text style={styles.sendIcon}>➤</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },

  // HEADER
  header: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1A1A1A",
    paddingTop: 50,
    paddingBottom: 15,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  backBtn: {
    fontSize: 28,
    color: "#FFF",
    marginRight: 10,
  },
  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFF",
  },
  headerSubtitle: {
    fontSize: 12,
    color: "#888",
    marginTop: 2,
  },
  menuBtn: {
    fontSize: 24,
    color: "#FFF",
  },

  // CHAT
  chatArea: {
    flex: 1,
    backgroundColor: "#000",
  },

  // MENSAJES USUARIO
  userMessageContainer: {
    alignItems: "flex-end",
    paddingHorizontal: 15,
    marginVertical: 8,
  },
  bubbleUser: {
    backgroundColor: "#E91E8E",
    borderRadius: 20,
    borderBottomRightRadius: 4,
    padding: 14,
    maxWidth: "80%",
  },
  userText: {
    color: "#FFF",
    fontSize: 15,
    lineHeight: 20,
  },
  timeUser: {
    fontSize: 10,
    color: "rgba(255,255,255,0.7)",
    marginTop: 6,
    alignSelf: "flex-end",
  },

  // MENSAJES BOT
  botMessageContainer: {
    flexDirection: "row",
    paddingHorizontal: 15,
    marginVertical: 8,
    alignItems: "flex-start",
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 10,
    marginTop: 4,
  },
  botBubbleWrapper: {
    flex: 1,
  },
  bubbleBot: {
    backgroundColor: "#2A2A2A",
    borderRadius: 20,
    borderBottomLeftRadius: 4,
    padding: 14,
    maxWidth: "85%",
  },
  botText: {
    color: "#FFF",
    fontSize: 15,
    lineHeight: 22,
  },
  timeBot: {
    fontSize: 10,
    color: "#888",
    marginTop: 6,
  },

  // ESCRIBIENDO
  bubbleTyping: {
    backgroundColor: "#2A2A2A",
    borderRadius: 20,
    borderBottomLeftRadius: 4,
    padding: 14,
  },
  typingText: {
    color: "#AAA",
    fontSize: 14,
    fontStyle: "italic",
  },

  // BOTONES DE ACCIÓN
  actionButtons: {
    flexDirection: "row",
    marginTop: 8,
    marginLeft: 4,
  },
  actionBtn: {
    marginRight: 12,
  },
  actionIcon: {
    fontSize: 18,
  },

  // INPUT
  inputContainer: {
    flexDirection: "row",
    backgroundColor: "#1A1A1A",
    paddingVertical: 10,
    paddingHorizontal: 15,
    paddingBottom: Platform.OS === "ios" ? 30 : 10,
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#333",
  },
  iconBtn: {
    padding: 8,
  },
  icon: {
    fontSize: 24,
  },
  input: {
    flex: 1,
    backgroundColor: "#2A2A2A",
    color: "#FFF",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 25,
    fontSize: 15,
    marginHorizontal: 8,
    maxHeight: 100,
  },
  sendBtn: {
    width: 40,
    height: 40,
    backgroundColor: "#E91E8E",
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  sendIcon: {
    color: "#FFF",
    fontSize: 20,
    fontWeight: "bold",
  },
});