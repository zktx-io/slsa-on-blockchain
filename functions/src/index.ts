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
import * as Busboy from 'busboy';
import * as path from 'path';
import * as os from 'os';
import * as fs from 'fs';
import * as serviceAccount from './serviceAccountKey.json';
import { DocData } from './types';

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
});

/**
 * Uploads a file to Firebase Cloud Storage.
 * Expects the request body to contain 'filename', 'contentType', and 'file' (base64 encoded).
 */
export const upload = onRequest(async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).send('Method Not Allowed');
    return;
  }

  const busboy = Busboy({ headers: req.headers });
  const tmpdir = os.tmpdir();
  const uploads: any = {};

  busboy.on('file', (fieldname, file, { filename }) => {
    const filepath = path.join(tmpdir, filename);
    uploads[fieldname] = filepath;
    file.pipe(fs.createWriteStream(filepath));
  });

  busboy.on('finish', async () => {
    const storage = admin.storage();
    const bucket = storage.bucket('slsa-on-blockchain.appspot.com');
    const uploadPromises = [];

    for (const name in uploads) {
      const file = uploads[name];
      uploadPromises.push(
        bucket.upload(file, { destination: path.basename(file) }),
      );
    }

    try {
      await Promise.all(uploadPromises);
      res.status(200).send('File uploaded successfully.');
    } catch (error) {
      functions.logger.error('Error uploading file:', error);
      res.status(500).send('Internal Server Error');
    } finally {
      for (const file in uploads) {
        fs.unlinkSync(uploads[file]);
      }
    }
  });

  busboy.end(req.rawBody);
});

/**
 * Downloads a file from Firebase Cloud Storage.
 * Expects the request body to contain 'filename'.
 * Returns the file contents as a base64 encoded string.
 */
export const download = onRequest({ cors: true }, async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).send('Method Not Allowed');
    return;
  }

  const storage = admin.storage();
  const bucket = storage.bucket('slsa-on-blockchain.appspot.com');
  const file = bucket.file(req.body.filename);

  try {
    const [contents] = await file.download();
    res.status(200).send(contents.toString('base64'));
  } catch (error) {
    functions.logger.error('Error downloading file:', error);
    res.status(500).send('Internal Server Error');
  }
});

/**
 * Creates a new document in the 'unsigned' collection.
 */
export const create = onRequest(async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).send('Method Not Allowed');
    return;
  }

  const { name, network, provenance } = req.body as DocData;

  if (!name || !network || !provenance) {
    res
      .status(400)
      .send('Invalid input, missing "name", "network" or "provenance"');
    return;
  }

  try {
    const uid = uuidv4();
    const firestore = admin.firestore();
    const docRef = firestore.collection('unsigned').doc(uid);
    await docRef.set({
      name,
      network,
      provenance,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    res.status(200).json({ uid });
  } catch (error) {
    functions.logger.error('Error saving data:', error);
    res.status(500).send('Internal Server Error');
  }
});

/**
 * Updates a document by moving it from 'unsigned' to 'signed' collection.
 */
export const update = onRequest({ cors: true }, async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).send('Method Not Allowed');
    return;
  }

  const { uid, signedData } = req.body;

  if (
    !uid ||
    !signedData ||
    (typeof signedData !== 'string' &&
      (!signedData.message || !signedData.signature))
  ) {
    res.status(400).send('Invalid input, missing "uid" or "signedData"');
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
      signedData,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    await oldDocRef.delete();

    res.status(200).json({ uid });
  } catch (error) {
    functions.logger.error('Error updating and moving data:', error);
    res.status(500).send('Internal Server Error');
  }
});

/**
 * Helper function to load and optionally delete a document from a specified collection.
 */
const _load = async (
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

    const { name, network, provenance, signedData } = doc.data() as DocData;
    if (collection === 'signed') {
      const storage = admin.storage();
      const bucket = storage.bucket('slsa-on-blockchain.appspot.com');
      const file = bucket.file(uid);
      await file.delete();
      await docRef.delete();
      res.status(200).json({ name, network, signedData });
    } else {
      res.status(200).json({ name, network, provenance });
    }
  } catch (error) {
    functions.logger.error(
      `Error reading and deleting data from ${collection}:`,
      error,
    );
    res.status(500).send('Internal Server Error');
  }
};

/**
 * Reads a document from the 'unsigned' collection.
 */
export const read = onRequest({ cors: true }, async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).send('Method Not Allowed');
    return;
  }
  const { uid } = req.body;
  await _load('unsigned', uid, res);
});

/**
 * Fetches a document from the 'signed' collection.
 */
export const fetch = onRequest(async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).send('Method Not Allowed');
    return;
  }
  const { uid } = req.body;
  await _load('signed', uid, res);
});

/**
 * Deletes old documents from a specified collection.
 */
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

/**
 * Deletes old files from the specified bucket, sorted by date.
 */
const deleteOldFilesFromBucket = async (bucketName: string, cutoff: Date) => {
  const storage = admin.storage();
  const bucket = storage.bucket(bucketName);
  const [files] = await bucket.getFiles();

  // Filter files older than the cutoff date and sort by date
  const deletePromises = files
    .filter(
      (file) =>
        !file.metadata.timeCreated ||
        new Date(file.metadata.timeCreated) < cutoff,
    )
    .map((file) => {
      return file
        .delete()
        .then(() =>
          functions.logger.log(`File ${file.name} deleted successfully.`),
        )
        .catch((error) => {
          if (error.code === 404) {
            functions.logger.warn(`File ${file.name} not found.`);
          } else {
            functions.logger.error(`Error deleting file ${file.name}:`, error);
          }
        });
    });
  await Promise.all(deletePromises);
};

/**
 * Deletes old documents from the 'unsigned' and 'signed' collections every 24 hours.
 */
export const deleteOldData = pubsub
  .schedule('every 24 hours')
  .onRun(async () => {
    const now = admin.firestore.Timestamp.now();
    const cutoff = new Date(now.toMillis() - 7 * 24 * 60 * 60 * 1000);

    try {
      await deleteOldDataFromCollection('unsigned', cutoff);
      await deleteOldDataFromCollection('signed', cutoff);
      await deleteOldFilesFromBucket('slsa-on-blockchain.appspot.com', cutoff);
      functions.logger.log('Old data deleted from both collections');
    } catch (error) {
      functions.logger.error('Error deleting old data:', error);
    }
  });
