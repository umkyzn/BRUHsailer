import dotenv from 'dotenv';
import { google } from 'googleapis';
import fs from 'fs-extra';
import path from 'path';

dotenv.config();

const credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS || '{}');
const auth = new google.auth.GoogleAuth({
  credentials,
  scopes: ["https://www.googleapis.com/auth/drive"],
});

async function downloadFiles(): Promise<void> {
  const client = await auth.getClient();
  const drive = google.drive({ version: "v3", auth: client as any });
  const folderId = process.env.FOLDER_ID;

  if (!folderId) {
    throw new Error("FOLDER_ID not set in environment variables");
  }

  const response = await drive.files.list({
    q: `'${folderId}' in parents and mimeType='application/json' and trashed = false`,
    fields: "files(id, name, mimeType)",
  });

  const files = (response.data as any).files;

  if (!files || files.length === 0) {
    console.log(
      "No JSON files found in the specified folder. They need to be exported first."
    );
    return;
  }

  const dataDir = path.join(process.cwd(), "data");
  await fs.ensureDir(dataDir);

  let archivedFolderId: string;
  const archivedFolderName = "archived";
  const archivedSearch = await drive.files.list({
    q: `'${folderId}' in parents and name='${archivedFolderName}' and mimeType='application/vnd.google-apps.folder' and trashed = false`,
    fields: "files(id, name)",
  });

  const archivedFiles = (archivedSearch.data as any).files;
  if (archivedFiles && archivedFiles.length > 0 && archivedFiles[0].id) {
    archivedFolderId = archivedFiles[0].id;
  } else {
    const createFolderRes = await drive.files.create({
      requestBody: {
        name: archivedFolderName,
        mimeType: "application/vnd.google-apps.folder",
        parents: [folderId],
      },
      fields: "id",
    });
    if (!createFolderRes.data.id) {
      throw new Error("Failed to create archived folder");
    }
    archivedFolderId = createFolderRes.data.id;
    console.log(`Created archived folder with ID: ${archivedFolderId}`);
  }

  for (const file of files) {
    if (!file.id || !file.name) continue;

    console.log(`Downloading ${file.name}`);

    const dest = path.join(dataDir, file.name);

    const res = await drive.files.get(
      {
        fileId: file.id,
        alt: "media",
      },
      { responseType: "stream" }
    );

    const destStream = fs.createWriteStream(dest);

    await new Promise<void>((resolve, reject) => {
      res.data
        .on("error", (err: Error) => {
          reject(err);
        })
        .pipe(destStream)
        .on("error", (err: Error) => {
          reject(err);
        })
        .on("finish", () => {
          console.log(`Successfully downloaded ${file.name}`);
          resolve();
        });
    });

    try {
      await drive.files.update({
        fileId: file.id,
        addParents: archivedFolderId,
        removeParents: folderId,
        fields: "id, parents"
      });
      console.log(`Archived ${file.name} to the 'archived' folder in Google Drive.`);
    } catch (archiveErr) {
      const errorMessage = archiveErr instanceof Error ? archiveErr.message : String(archiveErr);
      console.error(`Failed to archive ${file.name}:`, errorMessage);
    }
  }

  console.log("All JSON files downloaded successfully.");
}

downloadFiles().catch(console.error);
