export const getCurrentUserId = (): number | null => {
  const stored = localStorage.getItem("user");

  if (!stored) {
    return null;
  }

  try {
    const user = JSON.parse(stored) as { id?: number };
    return user.id ?? null;
  } catch {
    return null;
  }
};
