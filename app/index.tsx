import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Animated,
  Image,
} from "react-native";
import * as Clipboard from "expo-clipboard";
import { GoogleGenerativeAI } from "@google/generative-ai";

// --- IMAGEN DEL BOT (REEMPLAZA CON TU LOGO) ---
const botAvatar = require("../assets/images/bot.png");

// --- IA ---
const API_KEY = "AIzaSyB10b-FTo4dzyd_3Za7cougzi2FucREpBo";
const genAI = new GoogleGenerativeAI(API_KEY);

// 👉 Animación Fade In
const FadeInView = ({ children, style }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <Animated.View style={{ ...style, opacity: fadeAnim }}>
      {children}
    </Animated.View>
  );
};

// --- CHATBOT ---
export default function ChatBot() {
  const [messages, setMessages] = useState([
    { id: "1", text: "¡Hola! ¿En qué puedo ayudarte hoy?", sender: "bot" },
  ]);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const flatListRef = useRef(null);

  const scrollToBottom = () => {
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const copyMessage = (text) => {
    Clipboard.setStringAsync(text);
  };

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMsg = {
      id: Math.random().toString(),
      text: input,
      sender: "user",
    };

    setMessages((prev) => [...prev, userMsg]);
    scrollToBottom();
    setInput("");
    setLoading(true);

    const typingId = Math.random().toString();

    setMessages((prev) => [
      ...prev,
      { id: typingId, text: "•••", sender: "bot", isTyping: true },
    ]);

    try {
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
      const result = await model.generateContent(userMsg.text);
      const response = await result.response.text();

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === typingId
            ? { ...msg, text: response, isTyping: false }
            : msg
        )
      );
    } catch (err) {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === typingId
            ? {
                ...msg,
                text: "⚠️ Error, intenta de nuevo.",
                isTyping: false,
              }
            : msg
        )
      );
    }

    scrollToBottom();
    setLoading(false);
  };

  const renderMessage = ({ item }) => (
    <FadeInView>
      <View
        style={[
          styles.row,
          item.sender === "user" ? styles.rightRow : styles.leftRow,
        ]}
      >
        {item.sender === "bot" && (
          <Image source={botAvatar} style={styles.avatar} />
        )}

        <View>
          <View
            style={[
              styles.bubble,
              item.sender === "user"
                ? styles.userBubble
                : styles.botBubble,
            ]}
          >
            <Text style={styles.msgText}>{item.text}</Text>
          </View>

          {/* ICONOS BAJO EL MENSAJE */}
          <View style={styles.msgActions}>
            <TouchableOpacity>
              <Text style={styles.icon}>👍</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => copyMessage(item.text)}>
              <Text style={styles.icon}>📋</Text>
            </TouchableOpacity>

            <TouchableOpacity>
              <Text style={styles.icon}>⋯</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </FadeInView>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      {/* Header estilo moderno */}
      <View style={styles.header}>
        <Image source={botAvatar} style={styles.headerAvatar} />
        <View>
          <Text style={styles.headerTitle}>Text Writer</Text>
          <Text style={styles.headerSubtitle}>Healthy eating tips</Text>
        </View>
      </View>

      {/* CHAT */}
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 10 }}
        onContentSizeChange={scrollToBottom}
      />

      {/* INPUT */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.textInput}
          placeholder="Send message..."
          placeholderTextColor="#AAA"
          value={input}
          multiline
          onChangeText={setInput}
        />
        <TouchableOpacity
          style={[styles.sendBtn, loading && { opacity: 0.5 }]}
          onPress={sendMessage}
          disabled={loading}
        >
          <Text style={styles.sendIcon}>➤</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

// --- ESTILOS ---
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0F0F1E" },

  // HEADER
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    backgroundColor: "#111122",
    borderBottomWidth: 1,
    borderBottomColor: "#222233",
  },
  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  headerTitle: { color: "#fff", fontSize: 20, fontWeight: "bold" },
  headerSubtitle: { color: "#888", fontSize: 13 },

  // MENSAJES
  row: { flexDirection: "row", marginVertical: 5, alignItems: "flex-end" },
  leftRow: { justifyContent: "flex-start" },
  rightRow: { justifyContent: "flex-end" },

  avatar: { width: 38, height: 38, borderRadius: 20, marginRight: 6 },

  bubble: {
    padding: 12,
    borderRadius: 20,
    maxWidth: "75%",
  },

  userBubble: {
    backgroundColor: "#C26FFB",
    alignSelf: "flex-end",
    borderBottomRightRadius: 5,
  },

  botBubble: {
    backgroundColor: "#2C2C40",
    alignSelf: "flex-start",
    borderBottomLeftRadius: 5,
  },

  msgText: { color: "#fff", fontSize: 16 },

  msgActions: {
    flexDirection: "row",
    marginTop: 4,
    marginLeft: 5,
  },
  icon: {
    color: "#AAA",
    fontSize: 15,
    marginRight: 12,
  },

  // INPUT
  inputContainer: {
    flexDirection: "row",
    padding: 10,
    backgroundColor: "#111122",
    borderTopWidth: 1,
    borderTopColor: "#222233",
  },
  textInput: {
    flex: 1,
    backgroundColor: "#1D1D30",
    padding: 12,
    borderRadius: 50,
    color: "#fff",
    maxHeight: 110,
  },
  sendBtn: {
    width: 45,
    height: 45,
    borderRadius: 30,
    backgroundColor: "#C26FFB",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },
  sendIcon: { color: "#fff", fontWeight: "bold", fontSize: 20 },
});
