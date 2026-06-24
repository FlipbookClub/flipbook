import { createUploadTask, FileSystemUploadType } from "expo-file-system/legacy";

import type { Id } from "../../convex/_generated/dataModel";

// Upload a local image to a Convex upload URL; returns its storageId. Streams
// the file from disk (expo-file-system) rather than loading it into a JS blob,
// which could spike memory and crash on large photos. Shared by the create- and
// edit-community emblem flows.
export async function uploadImageToConvex(
  uploadUrl: string,
  uri: string,
  mimeType: string,
): Promise<Id<"_storage">> {
  const task = createUploadTask(uploadUrl, uri, {
    httpMethod: "POST",
    uploadType: FileSystemUploadType.BINARY_CONTENT,
    headers: { "Content-Type": mimeType },
  });
  const result = await task.uploadAsync();
  if (!result) throw new Error("Upload was cancelled");
  if (result.status < 200 || result.status >= 300) {
    throw new Error(`Image upload failed with status ${result.status}`);
  }
  const body = JSON.parse(result.body) as { storageId?: Id<"_storage"> };
  if (!body.storageId) throw new Error("Upload succeeded but no storageId returned");
  return body.storageId;
}
