
import { auth } from '@/lib/auth';
import Drizzle from '@/lib/db/db';
import { devices } from '@/lib/db/schema';
import { headers } from 'next/headers';
import { eq } from 'drizzle-orm';


export async function fetchDevices() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) {
    throw new Error('Unauthorized');
  }
  const organizationId = session.session.activeOrganizationId;
  if (!organizationId) {
    throw new Error('No active organization');
  }
  const res = await Drizzle.select().from(devices).where(eq(devices.organizationId, organizationId));
  return res;
}
