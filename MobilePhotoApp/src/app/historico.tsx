import React, { useEffect, useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  FlatList, 
  Image, 
  SafeAreaView, 
  ActivityIndicator, 
  Modal, 
  TouchableOpacity, 
  Alert, 
  TextInput 
} from 'react-native';
import * as MediaLibrary from 'expo-media-library';
import * as FileSystem from 'expo-file-system/legacy';  
import { supabase } from '../supabaseConfig';

export default function Historico() {
  const [vistorias, setVistorias] = useState<any[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [filtro, setFiltro] = useState('');
  
  const [modalVisible, setModalVisible] = useState(false);
  const [imagemSelecionada, setImagemSelecionada] = useState<string | null>(null);

  useEffect(() => {
    buscarVistorias();
  }, []);

  const buscarVistorias = async () => {
    const { data, error } = await supabase
      .from('vistorias')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) Alert.alert("Erro", "Não foi possível carregar as vistorias.");
    else setVistorias(data || []);
    setCarregando(false);
  };

  // Lógica do filtro
  const vistoriasFiltradas = vistorias.filter((item) => 
    item.condominio.toLowerCase().includes(filtro.toLowerCase())
  );

  // Função corrigida para baixar a imagem
  const baixarImagem = async (url: string) => {
    try {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert("Permissão negada", "Precisamos de acesso à galeria para salvar a foto.");
        return;
      }

      // Fix do TypeScript: Garantimos uma string válida para o caminho
      const baseDir = FileSystem.cacheDirectory ?? FileSystem.documentDirectory ?? '';
      const fileUri = `${baseDir}vistoria_${Date.now()}.jpg`;

      const downloadResult = await FileSystem.downloadAsync(url, fileUri);

      if (downloadResult.uri) {
        await MediaLibrary.saveToLibraryAsync(downloadResult.uri);
        Alert.alert("Sucesso!", "Foto salva na sua galeria.");
      }
    } catch (e) {
      console.error(e);
      Alert.alert("Erro", "Falha ao baixar a imagem.");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.titulo}>Histórico de Vistorias 📋</Text>

      <TextInput 
        style={styles.inputBusca}
        placeholder="🔍 Filtrar por condomínio..."
        value={filtro}
        onChangeText={setFiltro}
      />

      {carregando ? (
        <ActivityIndicator size="large" color="#FF9900" style={{marginTop: 20}} />
      ) : (
        <FlatList
          data={vistoriasFiltradas}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={styles.card} 
              onPress={() => { 
                setImagemSelecionada(item.foto_url); 
                setModalVisible(true); 
              }}
            >
              <Image source={{ uri: item.foto_url }} style={styles.imagem} />
              <View style={styles.info}>
                <Text style={styles.textoBold}>{item.condominio}</Text>
                <Text>Bloco: {item.predio} | Ap: {item.apartamento}</Text>
              </View>
            </TouchableOpacity>
          )}
          ListEmptyComponent={<Text style={{textAlign: 'center', marginTop: 20}}>Nenhuma vistoria encontrada.</Text>}
        />
      )}

      {/* Modal para Visualização */}
      <Modal visible={modalVisible} transparent={false} animationType="fade">
        <SafeAreaView style={styles.modalContainer}>
          <Image source={{ uri: imagemSelecionada! }} style={styles.imagemFull} resizeMode="contain" />
          
          <TouchableOpacity style={styles.botaoBaixar} onPress={() => baixarImagem(imagemSelecionada!)}>
            <Text style={styles.textoBotao}>Baixar Imagem ⬇️</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.botaoFechar} onPress={() => setModalVisible(false)}>
            <Text style={styles.textoBotaoFechar}>Fechar</Text>
          </TouchableOpacity>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FA', padding: 20 },
  titulo: { fontSize: 22, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  inputBusca: { backgroundColor: '#FFF', padding: 15, borderRadius: 8, marginBottom: 15, borderWidth: 1, borderColor: '#DDD' },
  card: { backgroundColor: '#FFF', padding: 15, borderRadius: 10, marginBottom: 15, flexDirection: 'row', alignItems: 'center' },
  imagem: { width: 80, height: 80, borderRadius: 8, marginRight: 15 },
  info: { flex: 1 },
  textoBold: { fontWeight: 'bold', fontSize: 16 },
  modalContainer: { flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' },
  imagemFull: { width: '100%', height: '70%' },
  botaoBaixar: { backgroundColor: '#FF9900', padding: 15, borderRadius: 8, marginTop: 20, width: '80%' },
  botaoFechar: { marginTop: 20 },
  textoBotao: { color: '#FFF', textAlign: 'center', fontWeight: 'bold' },
  textoBotaoFechar: { color: '#FFF', textDecorationLine: 'underline' }
});