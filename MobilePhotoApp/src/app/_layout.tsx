// 1. Importamos o Stack, que é um gerenciador de telas simples
import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    // 2. O Stack funciona como uma pilha de cartas, colocando uma tela sobre a outra
    <Stack>
      {/* 
        3. Declaramos a nossa tela 'index'.
        Usamos 'headerShown: false' para esconder o cabeçalho padrão do sistema, 
        já que nós mesmos criamos um cabeçalho azul bem bonito no nosso index.tsx! 
      */}
      <Stack.Screen name="index" options={{ headerShown: false }} />
    </Stack>
  );
}