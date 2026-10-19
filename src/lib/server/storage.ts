import {
	DeleteObjectsCommand,
	GetObjectCommand,
	ListObjectsV2Command,
	PutObjectCommand,
	S3Client,
} from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { env } from '$env/dynamic/private'
import type { StoredObject } from '$lib/server/storage-sweep'

const DOWNLOAD_TTL_SECONDS = 5 * 60

// Built on first use rather than at import, so tooling can import modules that
// depend on storage without runtime secrets configured.
let client: S3Client | null = null

function useS3(): S3Client {
	if (client) return client
	const accessKeyId = env.AWS_ACCESS_KEY_ID
	const secretAccessKey = env.AWS_SECRET_ACCESS_KEY
	if (!(accessKeyId && secretAccessKey)) {
		throw new Error('S3 credentials are not configured')
	}
	client = new S3Client({
		region: env.AWS_REGION ?? 'us-east-1',
		endpoint: env.AWS_ENDPOINT_URL_S3,
		// Neon Object Storage is path-style only.
		forcePathStyle: true,
		credentials: { accessKeyId, secretAccessKey },
	})
	return client
}

function bucket(): string {
	const name = env.S3_BUCKET
	if (!name) throw new Error('S3_BUCKET is not configured')
	return name
}

/** Stores an object and returns the key it was written under. */
export async function putObject(
	key: string,
	body: Buffer,
	contentType: string,
): Promise<string> {
	await useS3().send(
		new PutObjectCommand({
			Bucket: bucket(),
			Key: key,
			Body: body,
			ContentType: contentType,
		}),
	)
	return key
}

export async function deleteObjects(keys: string[]): Promise<void> {
	if (keys.length === 0) return
	await useS3().send(
		new DeleteObjectsCommand({
			Bucket: bucket(),
			Delete: { Objects: keys.map((Key) => ({ Key })) },
		}),
	)
}

/** Short-lived signed URL so private objects can be fetched directly. */
export async function presignDownload(key: string): Promise<string> {
	return getSignedUrl(
		useS3(),
		new GetObjectCommand({ Bucket: bucket(), Key: key }),
		{ expiresIn: DOWNLOAD_TTL_SECONDS },
	)
}

export async function listObjects(): Promise<StoredObject[]> {
	const objects: StoredObject[] = []
	let token: string | undefined
	do {
		const page = await useS3().send(
			new ListObjectsV2Command({
				Bucket: bucket(),
				ContinuationToken: token,
			}),
		)
		for (const item of page.Contents ?? []) {
			if (item.Key && item.LastModified) {
				objects.push({ key: item.Key, uploadedAt: item.LastModified })
			}
		}
		token = page.IsTruncated ? page.NextContinuationToken : undefined
	} while (token)
	return objects
}
