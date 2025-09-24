// NEXT_PUBLIC_APPWRITE_HOST_URL=http://appwrite.overview.management/v1
// NEXT_PUBLIC_APPWRITE_PROJECT_ID=68b9f55700013c2cc550
// APPWRITE_API_KEY=your_api_key_here

const env = {
  port: process.env.PORT || 3000,
  jwtSecret: String(process.env.JWT_SECRET) || '',
  appwrite: {
    hostUrl: String(process.env.NEXT_PUBLIC_APPWRITE_HOST_URL) || 'https://appwrite.overview.management/v1',
    projectId: String(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID) || '68b9f55700013c2cc550',
    apiKey: String(process.env.APPWRITE_API_KEY) || '',
    emailUrl: String(process.env.APPWRITE_VERIFICATION_URL) || 'http://localhost:3000/verify',
  },
  postgresql: {
    connectionString: String(process.env.DATABASE_URL),
  },
}
export default env;