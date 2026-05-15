(function initHowToLearnSupabase() {
  const config = window.HowToLearnSupabaseConfig || {};
  const hasConfig =
    config.url &&
    config.anonKey &&
    !config.url.includes("YOUR_PROJECT_REF") &&
    !config.anonKey.includes("YOUR_SUPABASE_ANON_KEY");

  window.HowToLearnSupabase = {
    isConfigured: Boolean(hasConfig && window.supabase),
    client: hasConfig && window.supabase ? window.supabase.createClient(config.url, config.anonKey) : null,
  };
})();
