import { useCallback } from "react";
import { useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { Id } from "../convex/_generated/dataModel";

/**
 * Small helper hook that delegates file uploads to Convex storage using the shared generateUploadUrl mutation.
 */
export const useConvexUpload = () => {
  const generateUploadUrl = useMutation(api.articles.generateUploadUrl);

  return useCallback(
    async (file: File) => {
      const postUrl = await generateUploadUrl();
      const response = await fetch(postUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.status} ${response.statusText}`);
      }

      const { storageId } = await response.json();
      return storageId as Id<"_storage">;
    },
    [generateUploadUrl]
  );
};


