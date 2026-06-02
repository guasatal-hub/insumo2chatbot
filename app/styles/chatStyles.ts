import { StyleSheet } from "react-native";

// Configuración de Colores de Temas
export const colors = {
  dark: {
    background: "#0F172A",
    aiCard: "#1E293B",
    userBubble: "#EC4899",
    mainText: "#FFFFFF",
    secondaryText: "#94A3B8",
    inputBg: "#1E293B",
    border: "#1E293B",
    headerBg: "#0F172A",
    iconColor: "#FFFFFF",
  },
  light: {
    background: "#F8FAFC",
    aiCard: "#FFFFFF",
    userBubble: "#3B82F6",
    mainText: "#0F172A",
    secondaryText: "#64748B",
    inputBg: "#FFFFFF",
    border: "#E2E8F0",
    headerBg: "#F8FAFC",
    iconColor: "#0F172A",
  },
};

export const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  // HEADER
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingBottom: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  headerBtn: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  headerInfo: {
    flex: 1,
    marginLeft: 10,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.15,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
  },
  onlineDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#10B981",
    marginRight: 6,
  },
  headerSubtitle: {
    fontSize: 11,
    fontWeight: "500",
  },
  headerRightActions: {
    flexDirection: "row",
    alignItems: "center",
  },

  // CHAT AREA
  chatArea: {
    flex: 1,
  },

  // MESSAGES GENERAL
  userMessageContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "flex-start",
    marginVertical: 8,
  },
  botMessageContainer: {
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "flex-start",
    marginVertical: 8,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 8,
  },

  // USER MESSAGES
  userBubbleWrapper: {
    maxWidth: "75%",
    alignItems: "flex-end",
  },
  bubbleUser: {
    borderRadius: 18,
    borderTopRightRadius: 4,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  userText: {
    fontSize: 15,
    lineHeight: 21,
    fontWeight: "400",
  },
  timeUser: {
    fontSize: 9,
    marginTop: 4,
    alignSelf: "flex-end",
  },

  // BOT MESSAGES
  botBubbleWrapper: {
    maxWidth: "75%",
    alignItems: "flex-start",
  },
  bubbleBot: {
    borderRadius: 18,
    borderTopLeftRadius: 4,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  botText: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: "400",
  },
  timeBot: {
    fontSize: 9,
    marginTop: 4,
  },

  // ACTIONS
  actionButtons: {
    flexDirection: "row",
    marginTop: 6,
    gap: 6,
  },
  actionBtn: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },

  // TYPING INDICATOR
  typingContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 4,
  },
  dotsRow: {
    flexDirection: "row",
    alignItems: "center",
    height: 12,
    marginRight: 10,
    gap: 3,
  },
  typingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  typingText: {
    fontSize: 13,
    fontWeight: "500",
  },

  // INPUT AREA
  inputWrapper: {
    paddingHorizontal: 16,
    paddingTop: 8,
    borderTopWidth: 1,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    borderRadius: 24,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  inputIconBtn: {
    padding: 6,
    marginBottom: 2,
  },
  input: {
    flex: 1,
    fontSize: 15,
    paddingHorizontal: 8,
    paddingTop: 8,
    paddingBottom: 8,
    maxHeight: 110,
  },
  sendBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 3,
  },
});