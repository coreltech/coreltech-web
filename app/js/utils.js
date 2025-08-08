// /app/js/utils.js
export async function generateCaseId() {
  const db = firebase.firestore();
  const year = new Date().getFullYear();
  const collection = db.collection("casos");

  // Obtener los casos de este año
  const snapshot = await collection
    .where("casoId", ">=", `CT-${year}-`)
    .where("casoId", "<", `CT-${year}-\uf8ff`)
    .get();

  const count = snapshot.size + 1;
  return `CT-${year}-${count.toString().padStart(3, '0')}`; // CT-2025-001
}