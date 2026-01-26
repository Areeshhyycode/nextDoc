import { REPLIT_SIDECAR_ENDPOINT } from "./client";

export function parseObjectPath(path: string): {
  bucketName: string;
  objectName: string;
} {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const pathParts = normalizedPath.split("/");

  if (pathParts.length < 3) {
    throw new Error("Invalid path: must contain at least a bucket name");
  }

  return {
    bucketName: pathParts[1],
    objectName: pathParts.slice(2).join("/"),
  };
}

export async function signObjectURL({
  bucketName,
  objectName,
  method,
  ttlSec,
}: {
  bucketName: string;
  objectName: string;
  method: "GET" | "PUT" | "DELETE" | "HEAD";
  ttlSec: number;
}): Promise<string> {
  const request = {
    bucket_name: bucketName,
    object_name: objectName,
    method,
    expires_at: new Date(Date.now() + ttlSec * 1000).toISOString(),
  };

  const response = await fetch(
    `${REPLIT_SIDECAR_ENDPOINT}/object-storage/signed-object-url`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
    }
  );

  if (!response.ok) {
    throw new Error(
      `Failed to sign object URL, errorcode: ${response.status}, make sure you're running on Replit`
    );
  }

  const { signed_url: signedURL } = await response.json();
  return signedURL;
}

export function ensureTrailingSlash(path: string): string {
  return path.endsWith("/") ? path : `${path}/`;
}
