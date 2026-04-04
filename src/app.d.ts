// See https://svelte.dev/docs/kit/types#app.d.ts
declare global {
  namespace App {
    interface Locals {
      admin?: {
        id: string;
        email: string;
        name: string;
      };
    }
  }
}

export {};
