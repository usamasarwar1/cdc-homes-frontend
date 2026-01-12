import { app } from './../firebase'
import { getFunctions, httpsCallable } from "firebase/functions";

export const testSecureFunction = async () => {
   const functions = getFunctions(app, "us-central1");
  const dummyGet = httpsCallable(functions, "testSecureFunction");

  const result = await dummyGet();
  return result.data;
}


