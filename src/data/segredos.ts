import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

/**
 * PIN e senha local nunca ficam guardados como texto: só um "resumo" (hash) com sal.
 * No celular vão para o cofre do sistema (Keychain no iPhone, Keystore no Android).
 * No navegador (só para testes) caem no armazenamento comum.
 */

const web = Platform.OS === 'web';

async function guardar(chave: string, valor: string | null) {
  if (web) return valor === null ? AsyncStorage.removeItem(chave) : AsyncStorage.setItem(chave, valor);
  return valor === null ? SecureStore.deleteItemAsync(chave) : SecureStore.setItemAsync(chave, valor);
}

async function ler(chave: string) {
  return web ? AsyncStorage.getItem(chave) : SecureStore.getItemAsync(chave);
}

async function resumo(texto: string, sal: string) {
  return Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, `${sal}:${texto}`);
}

function novoSal() {
  return Array.from(Crypto.getRandomBytes(16), (b) => b.toString(16).padStart(2, '0')).join('');
}

async function salvarSegredo(chave: string, texto: string) {
  const sal = novoSal();
  await guardar(chave, `${sal}$${await resumo(texto, sal)}`);
}

async function conferirSegredo(chave: string, texto: string) {
  const guardado = await ler(chave);
  if (!guardado) return false;
  const [sal, h] = guardado.split('$');
  return (await resumo(texto, sal)) === h;
}

export const PIN = {
  salvar: (pin: string) => salvarSegredo('dh_pin', pin),
  conferir: (pin: string) => conferirSegredo('dh_pin', pin),
  existe: async () => (await ler('dh_pin')) !== null,
  apagar: () => guardar('dh_pin', null),
};

/** Senha da conta no modo local (sem Supabase). Com Supabase, quem confere é o servidor. */
export const SENHA_LOCAL = {
  salvar: (senha: string) => salvarSegredo('dh_senha', senha),
  conferir: (senha: string) => conferirSegredo('dh_senha', senha),
  existe: async () => (await ler('dh_senha')) !== null,
  apagar: () => guardar('dh_senha', null),
};
