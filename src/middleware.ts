// import {
//   convexAuthNextjsMiddleware,
//   createRouteMatcher,
//   nextjsMiddlewareRedirect,
// } from "@convex-dev/auth/nextjs/server";

// // Define route matchers
// const isSignInPage = createRouteMatcher(["/auth"]);
// const isProtectedRoute = createRouteMatcher(["/product(.*)"]);

// export default convexAuthNextjsMiddleware(async (request, { convexAuth }) => {
//   // Check if the request is for the sign-in page and the user is authenticated
//   if (isSignInPage(request) && (await convexAuth.isAuthenticated())) {
//     return nextjsMiddlewareRedirect(request, "/");
//   }
  
//   // Check if the request is for a protected route and the user is not authenticated
//   if (isProtectedRoute(request) && !(await convexAuth.isAuthenticated())) {
//     return nextjsMiddlewareRedirect(request, "/auth");
//   }

// });

// export const config = {
//   // Apply middleware to all routes except static assets
//   matcher: ["/((?!\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
// };
import {
  convexAuthNextjsMiddleware,
  createRouteMatcher,
  nextjsMiddlewareRedirect,
} from "@convex-dev/auth/nextjs/server";
 
const isSignInPage = createRouteMatcher(["/auth"]);
const isProtectedRoute = createRouteMatcher(["/product(.*)"]);
 
export default convexAuthNextjsMiddleware(async (request, { convexAuth }) => {
  if (isSignInPage(request) && (await convexAuth.isAuthenticated())) {
    return nextjsMiddlewareRedirect(request, "/");
  }
  if (isProtectedRoute(request) && !(await convexAuth.isAuthenticated())) {
    return nextjsMiddlewareRedirect(request, "/auth");
  }
});
 
export const config = {
  // The following matcher runs middleware on all routes
  // except static assets.
  matcher: ["/((?!\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};