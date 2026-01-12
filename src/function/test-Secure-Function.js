import { app } from './../firebase'
import { getFunctions, httpsCallable } from "firebase/functions";

export const testSecureFunction = async () => {
   const functions = getFunctions(app, "us-central1");
  const testFunction = httpsCallable(functions, "testSecureFunction");

  const result = await testFunction();
  return result.data;
}


