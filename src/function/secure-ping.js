import { app } from './../firebase'
import { getFunctions, httpsCallable } from "firebase/functions";

export const callSecurePing = async () => {
   const functions = getFunctions(app, "us-central1");
  const securePing = httpsCallable(functions, "securePing");

  const result = await securePing();
  return result.data;
}


