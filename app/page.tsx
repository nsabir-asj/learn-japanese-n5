import { redirect } from 'next/navigation';
import { requireChatGPTUser } from './chatgpt-auth';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  await requireChatGPTUser('/');
  redirect('/trainer/kana_sprint.html');
}
