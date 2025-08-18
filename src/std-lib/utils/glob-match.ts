function globToRegExp(pattern: string): RegExp {
  const escaped = pattern
    // Escape regex special characters
    .replace(/[-[\]{}()+?.\\^$|]/g, '\\$&')
    // Temporarily replace double asterisk
    .replace(/\*\*/g, '§§')
    // Create regex version of *
    .replace(/\*/g, '[^/]*')
    // Create regex version of **
    .replace(/§§/g, '.*')

  return new RegExp(`^${escaped}$`);
}

export function globMatch(pattern: string, path: string): boolean {
  return globToRegExp(pattern).test(path);
}