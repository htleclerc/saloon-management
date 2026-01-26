# User Prompt Recap

This file summarizes the recent requests and objectives from the user to help track progress and improve future interactions.

## Recent Conversations

- **General Cleanup (Current)**: "Maintenant fais moi un clean up général en gardant la meme cohérence que mainteant avant que je ne passe à la phase 3"
- **Project Structure & Rules**: Clarification of localStore/Supabase architecture, model verification, and strict agent rules (French default, no hardcoding, DDD, etc.).
- **Fix Configuration Page**: "La page configuration ne marche pas" - Debugging and fixing the configuration layout/page.
- **Stop and Restart**: Application restart procedures.
- **Internationalization**: "Internationalizing Team Pages" - Ensuring all team-related pages are fully translated.
- **File Management**: "Investigating File Management" - Implementing image uploads for team members using Storage providers.
- **UI Audit**: "UI Audit and Development" - General UI improvements and consistency checks.
- **Read-Only Mode**: "Finalize Read-Only Enforcement" - Protecting actions based on permissions.
- **Dashboard Refactor**: "Refactor Dashboard Action Buttons" - Centralizing action permissions.
- **Course Scripts**: Updates to educational content.

## Key Themes & Preferences
- **Architecture**: DDD, Provider pattern (Local/Supabase), Strict TypeScript.
- **UI/UX**: Premium design, Tailwind (if used) or Vanilla CSS (preferred per rules, but project seems to have Tailwind artifacts? Need to verify), Responsive.
- **Rules**: 
    - French language for variables/text (defaulting to English for code/variables as per standard, but texts in French/i18n). *Correction from Rule 2*: "L'anglais est la langue par défaut! Toujours l'utiliser pour les varibles les textes les fonctions fichiers et toujours penser l'internationalisation!" -> Code in English, i18n for display.
    - No hardcoded data/colors.
    - Systematic usage of `instructions.md` updates.
