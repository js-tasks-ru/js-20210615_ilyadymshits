const IMGUR_CLIENT_ID = '28aaa2e823b03b1';
// const IMGUR_CLIENT_ID = '8d6227841ef87f2';
const IMGUR_CLIENT_SECRET = 'b2ac437abc5e0c7b9d33ce505dab1f937b588a25';

// throws FetchError if upload failed
export default class ImageUploader {
  async upload(file) {
    const formData = new FormData();

    formData.append('image', file);

    try {
      const response = await fetch('https://api.imgur.com/3/image', {
        method: 'POST',
        headers: {
          Authorization: `Client-ID ${IMGUR_CLIENT_ID}`
          // Authorization: `Bearer ${IMGUR_CLIENT_SECRET}`
        },
        body: formData,
        referrer: ''
      });

      return await response.json();
    } catch (error) {
      return Promise.reject(error);
    }
  }
}
