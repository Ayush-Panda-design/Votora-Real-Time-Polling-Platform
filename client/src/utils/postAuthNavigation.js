/** Where to send the user immediately after a successful sign-in. */
export const resolvePostAuthPath = (user, redirect) =>
  redirect || (user?.onboardingCompleted ? '/dashboard' : '/onboarding');
