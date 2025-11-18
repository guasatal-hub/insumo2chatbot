import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  StyleSheet,
} from "react-native";
import { Audio } from "expo-av";
import { model } from "./gemini.ts";

// 📌 IMPORTA EL AVATAR DEL BOT (ASEGÚRATE QUE EL ARCHIVO EXISTE)
const botAvatar = require("../assets/images/bot.png");

export default function ChatBot() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<
    { role: string; text: string; time: string }[]
  >([]);
  const [sound, setSound] = useState<any>();
  const scrollRef = useRef<any>();

  // 🔊 SONIDO DE ENVÍO
  async function playSendSound() {
    const { sound } = await Audio.Sound.createAsync(
      require("../assets/images/send.mp3.mp3")
    );
    setSound(sound);
    await sound.playAsync();
  }

  useEffect(() => {
    return sound
      ? () => {
          sound.unloadAsync();
        }
      : undefined;
  }, [sound]);

  // 🕒 HORA ESTILO WHATSAPP
  const getHour = () => {
    const now = new Date();
    return now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
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

    // 🟦 Mostrar burbuja "escribiendo..."
    setMessages((prev) => [
      ...prev,
      { role: "typing", text: "Escribiendo...", time: getHour() },
    ]);

    try {
      const result = await model.generateContent(input);
      const aiText = result.response.text();

      // ❌ Quitar "escribiendo..."
      setMessages((prev) => prev.filter((m) => m.role !== "typing"));

      // ✔ Mensaje del bot
      setMessages((prev) => [
        ...prev,
        { role: "bot", text: aiText, time: getHour() },
      ]);
    } catch (error) {
      console.log("Error:", error);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollRef}
        onContentSizeChange={() =>
          scrollRef.current?.scrollToEnd({ animated: true })
        }
        style={{ flex: 1 }}
      >
        {messages.map((msg, index) => (
          <View
            key={index}
            style={[
              styles.messageContainer,
              msg.role === "user"
                ? styles.userMessage
                : msg.role === "typing"
                ? styles.typingMessage
                : styles.botMessage,
            ]}
          >
            {/* Avatar del bot */}
            {msg.role !== "user" && msg.role !== "typing" && (
              <Image source={botAvatar} style={styles.avatar} />
            )}

            {/* Burbuja */}
            <View
              style={[
                styles.bubble,
                msg.role === "user"
                  ? styles.bubbleUser
                  : msg.role === "typing"
                  ? styles.bubbleTyping
                  : styles.bubbleBot,
              ]}
            >
              <Text
                style={{
                  color: msg.role === "user" ? "white" : "#222",
                  fontSize: 16,
                }}
              >
                {msg.text}
              </Text>

              {/* Hora del mensaje */}
              <Text
                style={{
                  fontSize: 10,
                  color: msg.role === "user" ? "#dff" : "#666",
                  marginTop: 4,
                  alignSelf: "flex-end",
                }}
              >
                {msg.time}
              </Text>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* ➕ Input */}
      <View style={styles.inputContainer}>
        <TextInput
          value={input}
          onChangeText={setInput}
          placeholder="Escribe un mensaje..."
          style={styles.input}
        />

        <TouchableOpacity onPress={handleSend} style={styles.sendBtn}>
          <Text style={{ color: "white", fontWeight: "bold" }}>Enviar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#E7EBEE",
    paddingTop: 40,
  },

  messageContainer: {
    flexDirection: "row",
    paddingHorizontal: 10,
    marginVertical: 5,
    alignItems: "flex-end",
  },

  userMessage: {
    justifyContent: "flex-end",
  },

  botMessage: {
    justifyContent: "flex-start",
  },

  typingMessage: {
    justifyContent: "flex-start",
  },

  avatar: {
    width: 32,
    height: 32,
    borderRadius: 50,
    marginRight: 6,
  },

  bubble: {
    maxWidth: "75%",
    padding: 10,
    borderRadius: 12,
  },

  bubbleUser: {
    backgroundColor: "#0084FF",
    marginLeft: "auto",
  },

  bubbleBot: {
    backgroundColor: "#F1F0F0",
  },

  bubbleTyping: {
    backgroundColor: "#DDD",
    fontStyle: "italic",
  },

  inputContainer: {
    flexDirection: "row",
    backgroundColor: "white",
    padding: 10,
    alignItems: "center",
    borderTopWidth: 1,
    borderColor: "#CCC",
  },

  input: {
    flex: 1,
    backgroundColor: "#F3F3F3",
    padding: 10,
    borderRadius: 20,
    fontSize: 16,
    marginRight: 10,
  },

  sendBtn: {
    backgroundColor: "#0084FF",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
  },
});
