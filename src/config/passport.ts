import passport from "passport";
import { Strategy as GoogleStrategy, Profile } from "passport-google-oauth20";

passport.use(
  new GoogleStrategy(
    {
      clientID: "sook-443123.apps.googleusercontent.com",
      clientSecret:
        "235796130132-nq6bk990o19h7drdru9v5h21rh4ksrv4.apps.googleusercontent.com",
      callbackURL: "http://localhost:5000/auth/google/callback",
    },
    (token: string, tokenSecret: string, profile: Profile, done: Function) => {
      // Sauvegarde ou mise à jour de l'utilisateur dans la base de données
      console.log(profile); // Affiche le profil utilisateur récupéré
      return done(null, profile);
    }
  )
);
