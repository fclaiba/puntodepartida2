import { defineConfig, Plugin } from 'vite';
import react from '@vitejs/plugin-react-swc';

// Plugin to strip version suffix (e.g., "lucide-react@0.487.0" -> "lucide-react")
function stripVersionSpecifier(): Plugin {
  return {
    name: 'resolve-versioned-specifiers',
    enforce: 'pre',
    resolveId(source) {
      if (source.startsWith('.') || source.startsWith('/') || source.includes(':')) return null;
      // Determine package name boundary
      let pkgName = source;
      let rest = '';
      if (source.startsWith('@')) {
        const secondSlash = source.indexOf('/', source.indexOf('/') + 1);
        if (secondSlash !== -1) {
          pkgName = source.slice(0, secondSlash);
          rest = source.slice(secondSlash);
        }
      } else {
        const slash = source.indexOf('/');
        if (slash !== -1) {
          pkgName = source.slice(0, slash);
          rest = source.slice(slash);
        }
      }
      const atIndex = pkgName.lastIndexOf('@');
      if (atIndex > 0) {
        const cleaned = pkgName.slice(0, atIndex) + rest;
        return this.resolve(cleaned, undefined);
      }
      return null;
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [stripVersionSpecifier(), react()],
});


