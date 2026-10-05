import { createClient } from '@insforge/sdk';

const baseUrl = import.meta.env.VITE_INSFORGE_URL || 'https://a2a2t997.ap-southeast.insforge.app';
const anonKey = import.meta.env.VITE_INSFORGE_ANON_KEY || 'anon_9c210eedc78d68b8b92fffc1dbc7db52dc31a52fa197de0c066a180dd4128444';

export const insforge = createClient({
  baseUrl,
  anonKey,
});

export default insforge;
