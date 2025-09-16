// auth.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.6.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut, updateProfile } from "https://www.gstatic.com/firebasejs/10.6.0/firebase-auth.js";
import { getDatabase, ref, set, push, child, get, update } from "https://www.gstatic.com/firebasejs/10.6.0/firebase-database.js";

// Config Firebase (SEUS DADOS)
const firebaseConfig = {
  apiKey: "AIzaSyBCH1OrwCzQ2WB__2xrMGq00l2AdzUzrkU",
  authDomain: "ancorar-93131.firebaseapp.com",
  databaseURL: "https://ancorar-93131-default-rtdb.firebaseio.com",
  projectId: "ancorar-93131",
  storageBucket: "ancorar-93131.firebasestorage.app",
  messagingSenderId: "951288286740",
  appId: "1:951288286740:web:b8aabee53283bcae2ba101"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth();
const db = getDatabase();

// Cadastro
export function cadastrarUsuario(nome, email, senha, tipo){
  createUserWithEmailAndPassword(auth,email,senha)
  .then(userCredential=>{
    const user = userCredential.user;
    updateProfile(user,{displayName:nome});
    set(ref(db,"usuarios/"+user.uid),{
      nome,
      email,
      tipo
    });
    alert("Cadastro realizado com sucesso!");
  })
  .catch(err=>alert(err.message));
}

// Login
export function loginUsuario(email, senha){
  signInWithEmailAndPassword(auth,email,senha)
  .catch(err=>alert(err.message));
}

// Logout
export function logout(){
  signOut(auth);
}

// Monitorar Auth
export function monitorarAuth(callback){
  onAuthStateChanged(auth,callback);
}

// Enviar Currículo
export function enviarCurriculo(nome,email,file){
  return new Promise((resolve,reject)=>{
    const reader = new FileReader();
    reader.onload = function(e){
      const dataBase64 = e.target.result;
      const user = auth.currentUser;
      const newCvRef = push(ref(db,"curriculos"));
      set(newCvRef,{
        nome,
        email,
        arquivoBase64:dataBase64,
        ownerId:user.uid,
        visualizacoes:0,
        visualizadoPor: {}
      }).then(()=>resolve())
      .catch(err=>reject(err));
    };
    reader.readAsDataURL(file);
  });
}

// Marcar visualização de currículos (contratante)
export async function visualizarCurriculo(cvId, contratanteId, contratanteNome){
  const cvRef = ref(db, "curriculos/" + cvId + "/visualizadoPor/" + contratanteId);
  await set(cvRef, { nome: contratanteNome, data: new Date().toISOString() });
  
  // Incrementar contagem
  const cvCountRef = ref(db, "curriculos/" + cvId + "/visualizacoes");
  const snapshot = await get(cvCountRef);
  let count = snapshot.exists() ? snapshot.val() : 0;
  update(cvCountRef, count + 1);
}

// Buscar currículos
export async function carregarCurriculos(){
  const snapshot = await get(ref(db,"curriculos"));
  return snapshot.exists() ? snapshot.val() : {};
}

// Buscar dados do usuário
export async function getUsuario(uid){
  const snapshot = await get(ref(db,"usuarios/"+uid));
  return snapshot.exists() ? snapshot.val() : null;
}
