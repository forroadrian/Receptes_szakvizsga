import { v2 as cloudinary, type UploadApiOptions, type UploadApiResponse } from 'cloudinary'
import type { H3Event } from 'h3'

type UploadArgs = {
    buffer: Buffer
    folder: 'profiles' | 'recipes'
    publicId: string
    transformation?: UploadApiOptions['transformation']
}

let configured = false

const configure = (event: H3Event) => {
    if (configured) return

    const { cloudinaryCloudName, cloudinaryApiKey, cloudinaryApiSecret } = useRuntimeConfig(event)

    if (!cloudinaryCloudName || !cloudinaryApiKey || !cloudinaryApiSecret) {
        throw createError({ statusCode: 500, message: 'Cloudinary környezeti változók hiányoznak.' })
    }

    cloudinary.config({
        cloud_name: cloudinaryCloudName as string,
        api_key: cloudinaryApiKey as string,
        api_secret: cloudinaryApiSecret as string,
        secure: true,
    })

    configured = true
}

const DEFAULT_TRANSFORMATION: UploadApiOptions['transformation'] = [
    { width: 400, height: 400, crop: 'fill', gravity: 'auto', quality: 'auto', fetch_format: 'auto' },
]

export const uploadImage = (event: H3Event, { buffer, folder, publicId, transformation }: UploadArgs): Promise<UploadApiResponse> => {
    configure(event)

    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            {
                folder,
                public_id: publicId,
                overwrite: true,
                resource_type: 'image',
                transformation: transformation ?? DEFAULT_TRANSFORMATION,
            },
            (error, result) => {
                if (error || !result) {
                    reject(error ?? new Error('Cloudinary upload returned no result'))
                    return
                }
                resolve(result)
            },
        )
        stream.end(buffer)
    })
}
