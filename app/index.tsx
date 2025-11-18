import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from "react-native";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI("AIzaSyB10b-FTo4dzyd_3Za7cougzi2FucREpBo");

export default function ChatBot() {
  const [messages, setMessages] = useState([
    {
      id: "1",
      text: "🤖 ¡Hola! Soy tu asistente IA. ¿Qué quieres saber?",
      sender: "bot",
    },
  ]);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const flatListRef = useRef(null);

  const scrollToBottom = () => {
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMsg = {
      id: Math.random().toString(),
      text: input,
      sender: "user",
    };

    setMessages((prev) => [...prev, userMsg]);
    scrollToBottom();
    setInput("");
    setLoading(true);

    try {
      const model = genAI.getGenerativeModel({
        model: "gemini-2.5-flash",
      });

      const result = await model.generateContent(input);
      const response = await result.response.text(); // CORREGIDO

      const botMsg = {
        id: Math.random().toString(),
        text: response,
        sender: "bot",
      };

      setMessages((prev) => [...prev, botMsg]);
      scrollToBottom();
    } catch (error) {
      const botMsg = {
        id: Math.random().toString(),
        text: "⚠️ Error al obtener respuesta",
        sender: "bot",
      };
      setMessages((prev) => [...prev, botMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"} // CORREGIDO
    >
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View
            style={[
              styles.message,
              item.sender === "user" ? styles.userMsg : styles.botMsg,
            ]}
          >
            <Text style={styles.text}>{item.text}</Text>
          </View>
        )}
        onContentSizeChange={scrollToBottom}
        contentContainerStyle={{ paddingBottom: 100 }}
      />

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          placeholder="Escribe algo..."
          placeholderTextColor="#aaa"
          multiline
        />
        <TouchableOpacity onPress={sendMessage} disabled={loading}>
          <Text style={[styles.sendButton, loading && { opacity: 0.4 }]}>
            ➡️
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0c1027",
    paddingTop: 50,
  },
  message: {
    margin: 8,
    padding: 10,
    borderRadius: 10,
    maxWidth: "80%",
  },
  userMsg: {
    alignSelf: "flex-end",
    backgroundColor: "#0078ff",
  },
  botMsg: {
    alignSelf: "flex-start",
    backgroundColor: "#2f3542",
  },
  text: {
    color: "white",
  },
  inputContainer: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    backgroundColor: "#1e1e3f",
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
  },
  input: {
    flex: 1,
    color: "white",
    fontSize: 16,
    minHeight: 40,
  },
  sendButton: {
    fontSize: 22,
    marginLeft: 10,
  },
});
