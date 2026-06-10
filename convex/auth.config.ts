// The Clerk JWT issuer (Frontend API URL) differs per deployment: the dev
// Convex deployment validates dev-Clerk tokens, prod validates prod-Clerk.
// Driven by the CLERK_JWT_ISSUER_DOMAIN env var per deployment, falling back to
// the dev instance so local dev keeps working without any env set.
//   prod:  npx convex env set CLERK_JWT_ISSUER_DOMAIN https://clerk.useflipbook.com --prod
export default {
  providers: [
    {
      domain:
        process.env.CLERK_JWT_ISSUER_DOMAIN ?? "https://polished-lizard-53.clerk.accounts.dev",
      applicationID: "convex",
    },
  ],
};
