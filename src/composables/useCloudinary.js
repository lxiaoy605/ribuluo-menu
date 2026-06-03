const CLOUD_NAME = 'dnpbszdiu'
const UPLOAD_PRESET = 'ribuluo_menu'
const UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`

export function useCloudinary() {
  async function uploadImage(file) {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('upload_preset', UPLOAD_PRESET)

    const res = await fetch(UPLOAD_URL, {
      method: 'POST',
      body: formData
    })

    if (!res.ok) {
      const err = await res.json()
      throw new Error(err.error?.message || '上传失败')
    }

    const data = await res.json()
    return {
      url: data.secure_url,
      publicId: data.public_id,
      width: data.width,
      height: data.height,
      format: data.format
    }
  }

  return { uploadImage }
}
