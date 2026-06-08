const { google } = require("googleapis");
const fs = require("fs-extra");
const path = require("path");

const credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS);
const auth = new google.auth.GoogleAuth({
  credentials,
  scopes: ["https://www.googleapis.com/auth/drive"],
});

async function downloadFiles() {
  const drive = google.drive({ version: "v3", auth: await auth.getClient() });
  const folderId = process.env.FOLDER_ID;

  const response = await drive.files.list({
    q: `'${folderId}' in parents and mimeType='application/json' and trashed = false`,
    fields: "files(id, name, mimeType)",
  });

  const files = response.data.files;

  if (!files || files.length === 0) {
    console.log(
      "No JSON files found in the specified folder. They need to be exported first."
    );
    return;
  }

  const dataDir = path.join(process.cwd(), "data");
  await fs.ensureDir(dataDir);

  let archivedFolderId;
  const archivedFolderName = "archived";
  const archivedSearch = await drive.files.list({
    q: `'${folderId}' in parents and name='${archivedFolderName}' and mimeType='application/vnd.google-apps.folder' and trashed = false`,
    fields: "files(id, name)",
  });
  if (archivedSearch.data.files && archivedSearch.data.files.length > 0) {
    archivedFolderId = archivedSearch.data.files[0].id;
  } else {
    const createFolderRes = await drive.files.create({
      resource: {
        name: archivedFolderName,
        mimeType: "application/vnd.google-apps.folder",
        parents: [folderId],
      },
      fields: "id",
    });
    archivedFolderId = createFolderRes.data.id;
    console.log(`Created archived folder with ID: ${archivedFolderId}`);
  }

  for (const file of files) {
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

    await new Promise((resolve, reject) => {
      res.data
        .on("error", (err) => {
          reject(err);
        })
        .pipe(destStream)
        .on("error", (err) => {
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
      console.error(`Failed to archive ${file.name}:`, archiveErr.message);
    }
  }

  console.log("All JSON files downloaded successfully.");
}

downloadFiles().catch(console.error);
