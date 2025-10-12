"use server";

export async function createOrganization(name: string, imageUrl: string) {
  // Simulate organization creation logic
  const newOrg = {
    id: Math.random().toString(36).substring(2, 15),
    name,
    imageUrl,
    createdAt: new Date(),
  };
  // In a real application, you would save this to your database
  console.log("Organization created:", newOrg);
  return newOrg;
} 