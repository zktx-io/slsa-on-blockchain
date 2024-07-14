/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import { pubsub } from 'firebase-functions/v1';
import { onRequest } from 'firebase-functions/v2/https';
import { v4 as uuidv4 } from 'uuid';
import * as serviceAccount from './serviceAccountKey.json';

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
});

interface DocData {
  chain: string;
  network: string;
  project: string;
  provenance: string;
  signatures?: string[];
}

export const create = onRequest(async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).send('Method Not Allowed');
    return;
  }

  const { chain, network, project, provenance } = req.body as DocData;

  if (!chain || !network || !project || !provenance) {
    res
      .status(400)
      .send(
        'Invalid input, missing "chain", "network", "project" or "provenance"',
      );
    return;
  }

  try {
    const uid = uuidv4();
    const firestore = admin.firestore();
    const docRef = firestore.collection('unsigned').doc(uid);
    await docRef.set({
      chain,
      network,
      project,
      provenance,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    res.status(200).json({ uid });
  } catch (error) {
    console.error('Error saving data:', error);
    res.status(500).send('Internal Server Error');
  }
});

export const update = onRequest(async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).send('Method Not Allowed');
    return;
  }

  const { uid, signatures } = req.body;

  if (!uid || !signatures) {
    res.status(400).send('Invalid input, missing "uid" or "signatures"');
    return;
  }

  try {
    const firestore = admin.firestore();
    const oldDocRef = firestore.collection('unsigned').doc(uid);
    const doc = await oldDocRef.get();

    if (!doc.exists) {
      res.status(404).send('Document not found');
      return;
    }

    const data = doc.data();
    const newDocRef = firestore.collection('signed').doc(uid);
    await newDocRef.set({
      ...data,
      signatures,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    await oldDocRef.delete();

    res.status(200).json({ uid });
  } catch (error) {
    console.error('Error updating and moving data:', error);
    res.status(500).send('Internal Server Error');
  }
});

const load = async (
  collection: 'signed' | 'unsigned',
  uid: string,
  res: functions.Response,
) => {
  try {
    const firestore = admin.firestore();
    const docRef = firestore.collection(collection).doc(uid);
    const doc = await docRef.get();

    if (!doc.exists) {
      res.status(404).send('Document not found');
      return;
    }

    const { chain, network, signatures } = doc.data() as DocData;
    collection ==='signed' && await docRef.delete();

    res.status(200).json({ chain, network, signatures });
  } catch (error) {
    console.error(`Error reading and deleting data from ${collection}:`, error);
    res.status(500).send('Internal Server Error');
  }
};

export const loadUnsigned = onRequest(async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).send('Method Not Allowed');
    return;
  }
  const { uid } = req.body;
  await load('unsigned', uid, res);
});

export const loadSigned = onRequest(async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).send('Method Not Allowed');
    return;
  }
  const { uid } = req.body;
  await load('signed', uid, res);
});

const deleteOldDataFromCollection = async (
  collectionName: string,
  cutoff: Date,
) => {
  const firestore = admin.firestore();
  const oldItemsQuery = firestore
    .collection(collectionName)
    .where('createdAt', '<', cutoff);
  const snapshot = await oldItemsQuery.get();
  const batch = firestore.batch();
  snapshot.docs.forEach((doc) => {
    batch.delete(doc.ref);
  });
  await batch.commit();
};

export const deleteOldData = pubsub
  .schedule('every 24 hours')
  .onRun(async () => {
    const now = admin.firestore.Timestamp.now();
    const cutoff = new Date(now.toMillis() - 7 * 24 * 60 * 60 * 1000);

    try {
      await deleteOldDataFromCollection('unsigned', cutoff);
      await deleteOldDataFromCollection('signed', cutoff);
      console.log('Old data deleted from both collections');
    } catch (error) {
      console.error('Error deleting old data:', error);
    }
  });
