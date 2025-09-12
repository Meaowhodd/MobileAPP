import { LinearGradient } from "expo-linear-gradient";
import { Eye, EyeOff } from "lucide-react-native"; // ไอคอน
import { useState } from "react";
import { Image, Text, TextInput, TouchableOpacity, View } from "react-native";

export default function LoginScreen() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <LinearGradient
      colors={["#4A3AFF", "#A86EFF"]}
      className="flex-1 justify-center px-6"
    >
      {/* Logo / App Name */}
      <View className="items-center mb-10">
        <Text className="text-white text-4xl font-bold">MeetEase</Text>
      </View>

      {/* Email Field */}
      <View className="mb-4">
        <Text className="text-white mb-1">Email address</Text>
        <TextInput
          placeholder="Enter your email"
          placeholderTextColor="#ddd"
          className="bg-white/20 text-white p-3 rounded-2xl"
          keyboardType="email-address"
        />
      </View>

      {/* Password Field */}
      <View className="mb-4">
        <Text className="text-white mb-1">Password</Text>
        <View className="bg-white/20 rounded-2xl flex-row items-center px-3">
          <TextInput
            placeholder="Enter your password"
            placeholderTextColor="#ddd"
            className="flex-1 text-white py-3"
            secureTextEntry={!showPassword}
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            {showPassword ? (
              <EyeOff size={20} color="white" />
            ) : (
              <Eye size={20} color="white" />
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Remember Me & Reset */}
      <View className="flex-row justify-between items-center mb-4">
        <TouchableOpacity>
          <Text className="text-white">Remember Me</Text>
        </TouchableOpacity>
        <TouchableOpacity>
          <Text className="text-white underline">Reset Password</Text>
        </TouchableOpacity>
      </View>

      {/* Sign In Button */}
      <TouchableOpacity className="bg-yellow-400 py-4 rounded-2xl mb-6">
        <Text className="text-black text-center text-lg font-semibold">
          Sign in
        </Text>
      </TouchableOpacity>

      {/* Sign Up link */}
      <View className="items-center mb-4">
        <Text className="text-white">
          Don't have an account?{" "}
          <Text className="text-yellow-300 underline">Sign Up</Text>
        </Text>
      </View>

      {/* Social Buttons */}
      <View className="flex-row justify-center space-x-4">
        <TouchableOpacity className="bg-white rounded-full p-3">
          <Image
            source={{ uri: "https://img.icons8.com/color/48/google-logo.png" }}
            style={{ width: 30, height: 30 }}
          />
        </TouchableOpacity>
        <TouchableOpacity className="bg-white rounded-full p-3">
          <Image
            source={{ uri: "https://img.icons8.com/ios-filled/50/mac-os.png" }}
            style={{ width: 30, height: 30, tintColor: "black" }}
          />
        </TouchableOpacity>
        <TouchableOpacity className="bg-white rounded-full p-3">
          <Image
            source={{ uri: "https://img.icons8.com/color/48/facebook-new.png" }}
            style={{ width: 30, height: 30 }}
          />
        </TouchableOpacity>
      </View>

      {/* Terms */}
      <View className="items-center mt-6">
        <Text className="text-white text-xs text-center">
          By signing up you agree to our{" "}
          <Text className="underline text-yellow-300">Terms</Text> and{" "}
          <Text className="underline text-yellow-300">Conditions of Use</Text>
        </Text>
      </View>
    </LinearGradient>
  );
}
