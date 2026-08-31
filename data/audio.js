/* Pronunciation clips — Erasmian (seminary/academic), one file per letter
   and diphthong. Recorded/produced by the user; cue sheet in
   docs/erasmian_alphabet_cues.json.
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

/* Vocabulary pronunciation — one clip per lemma, indexed by position in
   VOCAB (which is why data/vocab.js is append-only). Files in audio/vocab/.

   This array covers entries 0-469. The tier-5 words appended after them for
   Black's chapter lists have no recording yet, so VOCAB_AUDIO[i] is
   undefined for those and every caller treats that as "no audio": the
   "Hear it" button is not drawn and the lookup speaker stays unlit.

   v2, bare citation forms: each clip speaks only the word shown on the card
   front (θεός), not the lexical line (θεός, -οῦ, ὁ). The first pack read the
   whole line, so the voice named three things while the card showed one.

   The service worker pre-caches the whole set in the background from
   data/offline.json, so they play offline without being asked for; Settings
   → Offline → Check reports the count and tops up anything that failed. */

const VOCAB_AUDIO=["000_o.mp3","001_kai.mp3","002_autos.mp3","003_su.mp3","004_de.mp3","005_en.mp3","006_ego.mp3","007_eimi.mp3","008_lego.mp3","009_eis.mp3","010_ou.mp3","011_os.mp3","012_theos.mp3","013_oti.mp3","014_pas.mp3","015_me.mp3","016_gar.mp3","017_esous.mp3","018_ek.mp3","019_epi.mp3","020_kurios.mp3","021_echo.mp3","022_pros.mp3","023_ginomai.mp3","024_dia.mp3","025_ina.mp3","026_apo.mp3","027_alla.mp3","028_erchomai.mp3","029_poieo.mp3","030_tis.mp3","031_anthropos.mp3","032_ristos.mp3","033_tis.mp3","034_os.mp3","035_ei.mp3","036_oun.mp3","037_kata.mp3","038_meta.mp3","039_orao.mp3","040_akouo.mp3","041_polus.mp3","042_didomi.mp3","043_pater.mp3","044_emera.mp3","045_pneuma.mp3","046_uios.mp3","047_eis.mp3","048_adelphos.mp3","049_e.mp3","050_peri.mp3","051_logos.mp3","052_eautou.mp3","053_oida.mp3","054_laleo.mp3","055_ouranos.mp3","056_ekeinos.mp3","057_mathetes.mp3","058_lambano.mp3","059_ge.mp3","060_megas.mp3","061_pistis.mp3","062_pisteuo.mp3","063_oudeis.mp3","064_agios.mp3","065_apokrinomai.mp3","066_onoma.mp3","067_ginosko.mp3","068_upo.mp3","069_exerchomai.mp3","070_aner.mp3","071_gune.mp3","072_te.mp3","073_dunamai.mp3","074_thelo.mp3","075_outos.mp3","076_idou.mp3","077_oudaios.mp3","078_eiserchomai.mp3","079_nomos.mp3","080_para.mp3","081_grapho.mp3","082_kosmos.mp3","083_kathos.mp3","084_men.mp3","085_cheir.mp3","086_eurisko.mp3","087_aggelos.mp3","088_ochlos.mp3","089_amartia.mp3","090_ergon.mp3","091_doxa.mp3","092_basileia.mp3","093_ethnos.mp3","094_polis.mp3","095_tote.mp3","096_esthio.mp3","097_aulos.mp3","098_kardia.mp3","099_etros.mp3","100_allos.mp3","101_protos.mp3","102_istemi.mp3","103_ostis.mp3","104_poreuomai.mp3","105_uper.mp3","106_kaleo.mp3","107_nun.mp3","108_sarx.mp3","109_eos.mp3","110_egeiro.mp3","111_prophetes.mp3","112_agapao.mp3","113_aphiemi.mp3","114_oude.mp3","115_laos.mp3","116_soma.mp3","117_palin.mp3","118_zao.mp3","119_phone.mp3","120_duo.mp3","121_zoe.mp3","122_blepo.mp3","123_apostello.mp3","124_amen.mp3","125_nekros.mp3","126_sun.mp3","127_doulos.mp3","128_otan.mp3","129_aion.mp3","130_archiereus.mp3","131_ballo.mp3","132_thanatos.mp3","133_dunamis.mp3","134_paradidomi.mp3","135_meno.mp3","136_aperchomai.mp3","137_zeteo.mp3","138_agape.mp3","139_basileus.mp3","140_ekklesia.mp3","141_idios.mp3","142_krino.mp3","143_monos.mp3","144_oikos.mp3","145_apothnesko.mp3","146_osos.mp3","147_aletheia.mp3","148_mello.mp3","149_olos.mp3","150_parakaleo.mp3","151_anistemi.mp3","152_sozo.mp3","153_ora.mp3","154_ekei.mp3","155_opou.mp3","156_pos.mp3","157_psuche.mp3","158_agathos.mp3","159_exousia.mp3","160_airo.mp3","161_dei.mp3","162_odos.mp3","163_allelon.mp3","164_kalos.mp3","165_ophthalmos.mp3","166_tithemi.mp3","167_teknon.mp3","168_eteros.mp3","169_arisaios.mp3","170_aima.mp3","171_artos.mp3","172_gennao.mp3","173_didasko.mp3","174_peripateo.mp3","175_phobeomai.mp3","176_enopion.mp3","177_eti.mp3","178_oikia.mp3","179_pous.mp3","180_dikaiosune.mp3","181_eirene.mp3","182_thalassa.mp3","183_kathemai.mp3","184_akoloutheo.mp3","185_apollumi.mp3","186_pipto.mp3","187_epta.mp3","188_oute.mp3","189_arche.mp3","190_pleroo.mp3","191_proserchomai.mp3","192_dikaioo.mp3","193_kairos.mp3","194_proseuchomai.mp3","195_kago.mp3","196_meter.mp3","197_osper.mp3","198_anoigo.mp3","199_upago.mp3","200_semeion.mp3","201_entole.mp3","202_skotos.mp3","203_phos.mp3","204_elpis.mp3","205_charis.mp3","206_sophia.mp3","207_martureo.mp3","208_marturia.mp3","209_kerusso.mp3","210_euaggelion.mp3","211_euaggelizo.mp3","212_doxazo.mp3","213_stauros.mp3","214_stauroo.mp3","215_apoluo.mp3","216_thronos.mp3","217_arnion.mp3","218_naos.mp3","219_ieron.mp3","220_thusia.mp3","221_diatheke.mp3","222_epaggelia.mp3","223_sperma.mp3","224_dexios.mp3","225_mesos.mp3","226_aionios.mp3","227_pistos.mp3","228_dikaios.mp3","229_poneros.mp3","230_presbuteros.mp3","231_asthenes.mp3","232_alethes.mp3","233_eleeo.mp3","234_eleos.mp3","235_outos.mp3","236_ean.mp3","237_te.mp3","238_an.mp3","239_oannes.mp3","240_ote.mp3","241_topos.mp3","242_medeis.mp3","243_archo.mp3","244_oste.mp3","245_anabaino.mp3","246_mallon.mp3","247_ekballo.mp3","248_ekastos.mp3","249_katabaino.mp3","250_pempo.mp3","251_ouses.mp3","252_apostolos.mp3","253_stoma.mp3","254_baptizo.mp3","255_udor.mp3","256_prosopon.mp3","257_emos.mp3","258_erousalem.mp3","259_imon.mp3","260_kephale.mp3","261_dodeka.mp3","262_chairo.mp3","263_apokteino.mp3","264_braam.mp3","265_pino.mp3","266_pur.mp3","267_tereo.mp3","268_aiteo.mp3","269_srael.mp3","270_ago.mp3","271_sabbaton.mp3","272_rema.mp3","273_ploion.mp3","274_treis.mp3","275_karpos.mp3","276_phero.mp3","277_phemi.mp3","278_eite.mp3","279_erosoluma.mp3","280_daimonion.mp3","281_grammateus.mp3","282_dokeo.mp3","283_oros.mp3","284_exo.mp3","285_thelema.mp3","286_erotao.mp3","287_nux.mp3","288_alilaia.mp3","289_agapetos.mp3","290_ode.mp3","291_proskuneo.mp3","292_ede.mp3","293_imation.mp3","294_uparcho.mp3","295_auid.mp3","296_sunago.mp3","297_chara.mp3","298_euthus.mp3","299_aspazomai.mp3","300_lithos.mp3","301_didaskalos.mp3","302_theoreo.mp3","303_mede.mp3","304_sunagoge.mp3","305_toioutos.mp3","306_dechomai.mp3","307_eperotao.mp3","308_krazo.mp3","309_tritos.mp3","310_loipos.mp3","311_ilatos.mp3","312_chronos.mp3","313_opos.mp3","314_ouchi.mp3","315_dio.mp3","316_paidion.mp3","317_eschatos.mp3","318_speiro.mp3","319_peitho.mp3","320_makarios.mp3","321_tuphlos.mp3","322_parabole.mp3","323_kakos.mp3","324_glossa.mp3","325_paralambano.mp3","326_chreia.mp3","327_ara.mp3","328_etos.mp3","329_graphe.mp3","330_eremos.mp3","331_emprosthen.mp3","332_apodidomi.mp3","333_phaneroo.mp3","334_pou.mp3","335_prosphero.mp3","336_pro.mp3","337_krisis.mp3","338_phulake.mp3","339_amartolos.mp3","340_krateo.mp3","341_phobos.mp3","342_ouketi.mp3","343_achri.mp3","344_mikros.mp3","345_ouai.mp3","346_therion.mp3","347_soteria.mp3","348_apaggello.mp3","349_kathizo.mp3","350_dioko.mp3","351_omoios.mp3","352_thlipsis.mp3","353_oudas.mp3","354_oudaia.mp3","355_katoikeo.mp3","356_epiginosko.mp3","357_deuteros.mp3","358_genea.mp3","359_rodes.mp3","360_seautou.mp3","361_therapeuo.mp3","362_thaumazo.mp3","363_phoneo.mp3","364_deo.mp3","365_meros.mp3","366_eggizo.mp3","367_akobos.mp3","368_luo.mp3","369_kainos.mp3","370_choris.mp3","371_pascho.mp3","372_amartano.mp3","373_anastasis.mp3","374_axios.mp3","375_semeron.mp3","376_oligos.mp3","377_ergazomai.mp3","378_dierchomai.mp3","379_eulogeo.mp3","380_pantote.mp3","381_paristemi.mp3","382_time.mp3","383_klaio.mp3","384_etoimazo.mp3","385_ikanos.mp3","386_miseo.mp3","387_oikodomeo.mp3","388_mnemeion.mp3","389_telos.mp3","390_tessares.mp3","391_logizomai.mp3","392_perisseuo.mp3","393_thura.mp3","394_probaton.mp3","395_apto.mp3","396_epitithemi.mp3","397_planao.mp3","398_pente.mp3","399_eucharisteo.mp3","400_epithumia.mp3","401_upotasso.mp3","402_prasso.mp3","403_boulomai.mp3","404_peirazo.mp3","405_diakoneo.mp3","406_emautou.mp3","407_archon.mp3","408_paraginomai.mp3","409_orge.mp3","410_arti.mp3","411_atanas.mp3","412_agros.mp3","413_ilippos.mp3","414_epistrepho.mp3","415_ous.mp3","416_kalos.mp3","417_proseuche.mp3","418_peritome.mp3","419_kauchaomai.mp3","420_oseph.mp3","421_opiso.mp3","422_diabolos.mp3","423_eutheos.mp3","424_martus.mp3","425_opheilo.mp3","426_upostrepho.mp3","427_metanoeo.mp3","428_ptochos.mp3","429_melos.mp3","430_mete.mp3","431_blasphemeo.mp3","432_oinos.mp3","433_astheneo.mp3","434_biblion.mp3","435_diakonia.mp3","436_ekporeuomai.mp3","437_deiknumi.mp3","438_nai.mp3","439_arneomai.mp3","440_poios.mp3","441_echthros.mp3","442_elios.mp3","443_apas.mp3","444_akathartos.mp3","445_paraggello.mp3","446_anaginosko.mp3","447_dunatos.mp3","448_upomone.mp3","449_phaino.mp3","450_anemos.mp3","451_katharizo.mp3","452_iereus.mp3","453_poterion.mp3","454_plen.mp3","455_exesti-n.mp3","456_elpizo.mp3","457_phulasso.mp3","458_phule.mp3","459_omoios.mp3","460_plethos.mp3","461_parresia.mp3","462_sunerchomai.mp3","463_skandalizo.mp3","464_didache.mp3","465_epikaleo.mp3","466_agorazo.mp3","467_eggus.mp3","468_ide.mp3","469_suneidesis.mp3"];

/* The other forms printed in a lexical entry — ἡ, τό, πᾶσα, πατρός — as 42
   shared clips rather than one per entry. 207 entries reference them, but
   168 of those are the gender article repeating (θεός, -οῦ, ὁ), so the same
   recording serves every feminine noun. Files in audio/forms/.

   Keyed by the Greek form itself, since these are not tied to a scheduler
   index the way the headword clips are. */

const FORM_AUDIO={"ἡ":"f01_he.mp3","ὁ":"f02_ho.mp3","τό":"f03_to.mp3","οὐκ":"f04_ouk.mp3","οὐχ":"f05_ouch.mp3","ἥ":"f06_he_rel.mp3","ὅ":"f07_ho_rel.mp3","πᾶσα":"f08_pasa.mp3","πᾶν":"f09_pan.mp3","ἐξ":"f10_ex.mp3","τί":"f11_ti_int.mp3","τι":"f12_ti_ind.mp3","πολλή":"f13_polle.mp3","πολύ":"f14_polu.mp3","πατρός":"f15_patros.mp3","μία":"f16_mia.mp3","ἕν":"f17_hen.mp3","γῆς":"f18_ges.mp3","μεγάλη":"f19_megale.mp3","μέγα":"f20_mega.mp3","οὐδεμία":"f21_oudemia.mp3","οὐδέν":"f22_ouden.mp3","ἀνδρός":"f23_andros.mp3","γυναικός":"f24_gunaikos.mp3","χειρός":"f25_cheiros.mp3","ἥτις":"f26_hetis.mp3","ὅ τι":"f27_ho_ti.mp3","σαρκός":"f28_sarkos.mp3","ποδός":"f29_podos.mp3","μητρός":"f30_metros.mp3","φωτός":"f31_photos.mp3","αὕτη":"f32_haute.mp3","τοῦτο":"f33_touto.mp3","μηδεμία":"f34_medemia.mp3","μηδέν":"f35_meden.mp3","ὕδατος":"f36_hudatos.mp3","πυρός":"f37_puros.mp3","τρία":"f38_tria.mp3","τά":"f39_ta.mp3","ὄρους":"f40_orous.mp3","νυκτός":"f41_nuktos.mp3","ὠτός":"f42_otos.mp3"};

/* The speakable extras for VOCAB[i]: whole words only, never the
   abbreviated endings (-οῦ, -ας), which are print conventions rather than
   anything a voice can say. */
function extraForms(i){
  const parts=VOCAB[i][0].split(",").map(s=>s.trim());
  return parts.slice(1)
    .filter(p=>p && !p.startsWith("-") && FORM_AUDIO[p])
    .map(p=>({form:p, file:FORM_AUDIO[p]}));
}
