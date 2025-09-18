export const supabase = {
  from: () => ({
    select: () => ({ order: async () => ({ data: [], error: null }) }),
  }),
};
