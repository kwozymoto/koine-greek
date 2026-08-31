/* Pronunciation clips — Erasmian (seminary/academic), one file per letter
   and diphthong. Recorded/produced by the user; cue sheet in
   audio/Erasmian_Koine_Greek_App_Audio/erasmian_alphabet_cues.json.
   Each clip says the letter name, then its sound.

   Format: [greek, name, sound, kind, file]  — file lives in audio/clips/ */

const AUDIO_CLIPS=[
["Α α","Alpha","ah","letter","01_alpha.mp3"],
["Β β","Beta","b","letter","02_beta.mp3"],
["Γ γ","Gamma","g","letter","03_gamma.mp3"],
["Δ δ","Delta","d","letter","04_delta.mp3"],
["Ε ε","Epsilon","eh","letter","05_epsilon.mp3"],
["Ζ ζ","Zeta","dz","letter","06_zeta.mp3"],
["Η η","Eta","ay","letter","07_eta.mp3"],
["Θ θ","Theta","th","letter","08_theta.mp3"],
["Ι ι","Iota","ih / ee","letter","09_iota.mp3"],
["Κ κ","Kappa","k","letter","10_kappa.mp3"],
["Λ λ","Lambda","l","letter","11_lambda.mp3"],
["Μ μ","Mu","m","letter","12_mu.mp3"],
["Ν ν","Nu","n","letter","13_nu.mp3"],
["Ξ ξ","Xi","ks","letter","14_xi.mp3"],
["Ο ο","Omicron","short o","letter","15_omicron.mp3"],
["Π π","Pi","p","letter","16_pi.mp3"],
["Ρ ρ","Rho","r","letter","17_rho.mp3"],
["Σ σ ς","Sigma","s","letter","18_sigma.mp3"],
["Τ τ","Tau","t","letter","19_tau.mp3"],
["Υ υ","Upsilon","ew / ü","letter","20_upsilon.mp3"],
["Φ φ","Phi","f","letter","21_phi.mp3"],
["Χ χ","Chi","kh","letter","22_chi.mp3"],
["Ψ ψ","Psi","ps","letter","23_psi.mp3"],
["Ω ω","Omega","oh","letter","24_omega.mp3"],
["αι","alpha + iota","eye","diphthong","d01_ai.mp3"],
["ει","epsilon + iota","ay","diphthong","d02_ei.mp3"],
["οι","omicron + iota","oy","diphthong","d03_oi.mp3"],
["υι","upsilon + iota","wee","diphthong","d04_ui.mp3"],
["αυ","alpha + upsilon","ow","diphthong","d05_au.mp3"],
["ευ","epsilon + upsilon","ew","diphthong","d06_eu.mp3"],
["ηυ","eta + upsilon","ew","diphthong","d07_hu.mp3"],
["ου","omicron + upsilon","oo","diphthong","d08_ou.mp3"]
];

/* greek -> filename, for instant lookup from the alphabet grid and drills */
const AUDIO_BY_GREEK = Object.fromEntries(AUDIO_CLIPS.map(c => [c[0], c[4]]));
