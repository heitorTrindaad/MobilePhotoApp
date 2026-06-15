import React, { useState } from 'react';
import { StyleSheet, Text, View, SafeAreaView, TextInput, TouchableOpacity, ActivityIndicator, Alert, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { supabase } from '../supabaseConfig';

export default function Index() {
  const [condominio, setCondominio] = useState('');
  const [predio, setPredio] = useState('');
  const [apartamento, setApartamento] = useState('');
  const [foto, setFoto] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);

  const escolherFoto = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.5,
    });

    if (!result.canceled) {
      setFoto(result.assets[0].uri);
    }
  };

  const salvarVistoria = async () => {
    if (!condominio || !predio || !apartamento || !foto) {
      Alert.alert('Atenção', 'Por favor, preencha todos os campos e selecione uma foto!');
      return;
    }

    setCarregando(true);

    try {
      // 1. Converter a foto em um formato de dados para envio
      const response = await fetch(foto);
      const blob = await response.blob();
      const arrayBuffer = await blob.arrayBuffer();

      // 2. Enviar a foto para o Storage (o "galpão")
      const nomeArquivo = `${Date.now()}.jpg`;
      const { error: uploadError } = await supabase.storage
        .from('fotos_vistorias')
        .upload(nomeArquivo, arrayBuffer, { contentType: 'image/jpeg' });

      if (uploadError) throw uploadError;

      // 3. Pegar a URL pública da foto
      const { data: { publicUrl } } = supabase.storage
        .from('fotos_vistorias')
        .getPublicUrl(nomeArquivo);

      // 4. Salvar os dados na tabela 'vistorias' (incluindo a URL da foto)
      const { error: dbError } = await supabase
        .from('vistorias')
        .insert([{
          condominio,
          predio,
          apartamento,
          foto_url: publicUrl
        }]);

      if (dbError) throw dbError;

      Alert.alert('Sucesso! 🎉', 'Vistoria enviada com sucesso!');
      setCondominio('');
      setPredio('');
      setApartamento('');
      setFoto(null);

    } catch (error) {
      console.error(error);
      Alert.alert('Erro', 'Não foi possível salvar a vistoria. Verifique sua conexão.');
    } finally {
      setCarregando(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.formulario}>
        <Text style={styles.titulo}>Nova Vistoria 🚧</Text>
        
        <TextInput style={styles.input} placeholder="Condomínio" value={condominio} onChangeText={setCondominio} />
        <TextInput style={styles.input} placeholder="Bloco / Prédio" value={predio} onChangeText={setPredio} />
        <TextInput style={styles.input} placeholder="Apartamento" value={apartamento} onChangeText={setApartamento} />

        <TouchableOpacity style={styles.botaoFoto} onPress={escolherFoto}>
          <Text style={styles.textoBotaoFoto}>{foto ? "✅ Foto Selecionada" : "📸 Adicionar Foto"}</Text>
        </TouchableOpacity>

        {foto && <Image source={{ uri: foto }} style={{ width: 100, height: 100, marginBottom: 15, alignSelf: 'center', borderRadius: 8 }} />}

        <TouchableOpacity 
          style={[styles.botaoPrincipal, carregando && styles.botaoDesativado]} 
          onPress={salvarVistoria} 
          disabled={carregando}
        >
          {carregando ? <ActivityIndicator color="#FFF" /> : <Text style={styles.textoBotaoPrincipal}>Salvar Vistoria</Text>}
        </TouchableOpacity>

        <TouchableOpacity style={styles.botaoHistorico} onPress={() => router.push('/historico' as any)}>
          <Text style={styles.textoBotaoHistorico}>Ver Histórico 🗂️</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FA', justifyContent: 'center', padding: 20 },
  formulario: { backgroundColor: '#FFFFFF', padding: 20, borderRadius: 10, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 5, elevation: 3 },
  titulo: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center', color: '#333' },
  input: { backgroundColor: '#F0F0F0', padding: 15, borderRadius: 8, marginBottom: 15 },
  botaoFoto: { backgroundColor: '#E0E0E0', padding: 15, borderRadius: 8, marginBottom: 15, alignItems: 'center' },
  textoBotaoFoto: { color: '#333' },
  botaoPrincipal: { backgroundColor: '#FF9900', padding: 15, borderRadius: 8, alignItems: 'center', marginTop: 10 },
  botaoDesativado: { backgroundColor: '#FFC880' },
  textoBotaoPrincipal: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 16 },
  botaoHistorico: { marginTop: 15, alignItems: 'center', padding: 10 },
  textoBotaoHistorico: { color: '#0052CC', fontWeight: '600' }
});