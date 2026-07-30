import { state } from './state.js';

export const STORY_DATA = {
    chapters: [
        {
            id: 'ch1',
            title: 'Le Déclic',
            events: [
                {
                    id: 'intro_morning',
                    title: 'Un nouveau matin',
                    text: "Les premiers rayons du soleil filtrent à travers les rideaux. C'est un matin paisible. À tes côtés, Nia dort encore. Tu contemples ce moment de calme avant que le tumulte de la journée ne commence. Entre tes ambitions professionnelles et ton besoin de sérénité, chaque journée ressemble à une danse délicate.",
                    choices: [
                        {
                            id: 'meditate',
                            text: "Prendre 15 minutes pour méditer.",
                            result: "Le silence te ressource. Tu te sens [ancré et prêt/ancrée et prête] à affronter les défis avec clarté.",
                            effects: { spirituality: 4, health: 4, argent: -1 },
                            traits: { patience: 5, resilience: 5 },
                            relationships: { partner: 5 }
                        },
                        {
                            id: 'early_work',
                            text: "Vérifier mes e-mails immédiatement.",
                            result: "Tu prends de l'avance sur ta journée, mais une légère tension s'installe déjà dans tes épaules.",
                            effects: { argent: 7, spirituality: -2, health: -2 },
                            traits: { ambition: 8 },
                            relationships: { partner: -2 }
                        },
                        {
                            id: 'wake_partner',
                            text: "Réveiller Nia en douceur.",
                            result: "Un moment de complicité partagé autour d'un café. La journée commence sous le signe de l'affection.",
                            effects: { love: 4, spirituality: 1, argent: -3 },
                            traits: { compassion: 8 },
                            relationships: { partner: 10 }
                        }
                    ]
                },
                {
                    id: 'breakfast_talk',
                    title: 'Le Petit-Déjeuner',
                    text: "À la cuisine, les discussions tournent autour des projets de la semaine. Nia évoque ses doutes sur l'avenir, tandis que ton téléphone ne cesse de vibrer avec des notifications du bureau. On te demande de venir plus tôt pour une réunion imprévue.",
                    choices: [
                        {
                            id: 'listen_partner',
                            text: "Poser le téléphone et écouter vraiment.",
                            result: "Une connexion sincère avec Nia. Le travail attendra quelques minutes, mais ton couple en sort renforcé.",
                            effects: { love: 5, spirituality: 1, argent: -6 },
                            trust: 10,
                            communication: 15
                        },
                        {
                            id: 'hurry_work',
                            text: "M'excuser et partir rapidement.",
                            result: "Tu es ponctuel et efficace, mais le regard déçu de Nia reste gravé dans ton esprit.",
                            effects: { argent: 11, love: -4, health: -2 },
                            disagreements: 1,
                            commitment: 10
                        },
                        {
                            id: 'multitask',
                            text: "Écouter tout en préparant mes affaires.",
                            result: "Tu tentes d'être partout à la fois. Tu n'es pleinement nulle part, mais tu limites la casse.",
                            effects: { argent: 4, love: 2, health: -4 },
                            communication: -5,
                            complicity: -5
                        }
                    ]
                },
                {
                    id: 'first_dilemma_office',
                    title: 'Le Poids de la Responsabilité',
                    text: "Au bureau, ton manager, Mr. Mensah, te prend à part. Il a remarqué ton investissement, mais aussi ta fatigue. 'La réussite n'est pas une ligne droite', te dit-il. 'C'est un cercle. S'il se brise, tout s'effondre.' Il te propose de déléguer une partie de tes tâches, au risque de ralentir ton ascension.",
                    choices: [
                        {
                            id: 'delegate_tasks',
                            text: "Accepter de déléguer.",
                            result: "Tu respires enfin. Ta santé s'améliore, mais ton influence au bureau stagne un peu.",
                            effects: { health: 12, spirituality: 4, argent: -6 },
                            traits: { prudence: 10 },
                            balance_priority: true
                        },
                        {
                            id: 'keep_control',
                            text: "Garder le contrôle total.",
                            result: "Ta réputation d'indispensable est intacte, mais le poids sur tes épaules devient oppressant.",
                            effects: { argent: 13, health: -6, spirituality: -4 },
                            traits: { ambition: 15 },
                            work_priority: true
                        }
                    ]
                }
            ]
        },
        {
            id: 'ch2',
            title: 'Le Carrefour des Opportunités',
            events: [
                {
                    id: 'the_offer',
                    title: 'L\'Appel du Destin',
                    text: "Un cabinet de recrutement international te contacte. Ils te proposent un poste de direction à Dakar. C'est le saut de carrière dont tu as toujours rêvé : un salaire doublé, des responsabilités majeures et un prestige immense. Cependant, cela implique un départ immédiat et une charge de travail colossale pour s'imposer.",
                    choices: [
                        {
                            id: 'ambitious_leap',
                            text: "Saisir l'opportunité sans hésiter.",
                            result: "Ton ambition est récompensée. Les chiffres grimpent, mais le stress commence à hanter tes nuits.",
                            effects: { argent: 18, health: -6, spirituality: -4, love: -2 },
                            traits: { ambition: 20 },
                            commitment: 10,
                            trust: -5
                        },
                        {
                            id: 'cautious_interest',
                            text: "Demander du temps pour réfléchir.",
                            result: "La prudence est ta boussole. Tu préserves ton calme, même si les recruteurs semblent moins enthousiastes.",
                            effects: { spirituality: 1, health: 4, argent: 4 },
                            traits: { prudence: 15 },
                            communication: 10
                        },
                        {
                            id: 'prioritize_current',
                            text: "Décliner pour stabiliser ma vie actuelle.",
                            result: "Tu choisis la sécurité du présent. Ta paix intérieure est intacte, mais un sentiment de stagnation t'effleure parfois.",
                            effects: { spirituality: 5, health: 7, argent: -8, love: 4 },
                            traits: { resilience: 10 },
                            trust: 15,
                            complicity: 10
                        }
                    ]
                },
                {
                    id: 'the_dilemma_dakar',
                    title: 'Partir ou Rester ?',
                    conditions: (s) => s.progress.decisions.includes('ambitious_leap') || s.progress.decisions.includes('cautious_interest'),
                    text: "La discussion avec Nia est inévitable. Déménager à Dakar changerait tout pour vous deux. Elle a ses propres racines ici, son propre travail. L'atmosphère est électrique, chargée d'espoirs et de craintes partagées.",
                    choices: [
                        {
                            id: 'promise_luxury',
                            text: "Promettre une vie meilleure là-bas.",
                            result: "Tu tentes de convaincre par les faits et le confort futur. Le lien matériel est fort, mais l'émotionnel reste fragile.",
                            effects: { argent: 7, love: -2, spirituality: -2 },
                            communication: -5,
                            commitment: 15
                        },
                        {
                            id: 'vulnerability_share',
                            text: "Partager mes peurs et mes doutes.",
                            result: "En montrant ta vulnérabilité, tu ouvres la porte à une véritable complicité. Une décision commune se dessine.",
                            effects: { love: 5, spirituality: 4, health: 4 },
                            communication: 20,
                            complicity: 15,
                            trust: 10
                        },
                        {
                            id: 'executive_decision',
                            text: "Imposer mon choix comme une nécessité.",
                            result: "La tension explose. Ta détermination est totale, mais une fissure apparaît dans la fondation de ton foyer.",
                            effects: { argent: 11, love: -10, health: -4, spirituality: -6 },
                            disagreements: 3,
                            communication: -20,
                            trust: -15
                        }
                    ]
                },
                {
                    id: 'the_charity_gala',
                    title: 'Le Gala de la Fondation',
                    text: "Mr. Mensah t'invite au gala annuel de la Fondation pour l'Éducation. C'est l'occasion idéale pour briller devant les investisseurs. Cependant, Nia comptait sur toi pour assister à une réunion de quartier importante concernant un projet qui lui tient à cœur. Le temps presse, tu ne peux pas être aux deux endroits.",
                    choices: [
                        {
                            id: 'gala_networking',
                            text: "Prioriser le Gala et le réseau.",
                            result: "Tu échanges des cartes de visite avec les plus grands. Ton influence au bureau bondit, mais tu manques un moment crucial pour Nia.",
                            effects: { argent: 13, love: -4, spirituality: -2 },
                            traits: { ambition: 10 },
                            relationships: { partner: -5 }
                        },
                        {
                            id: 'community_support',
                            text: "Soutenir Nia et le projet local.",
                            result: "Ton geste touche profondément Nia. Tu renforces tes liens communautaires, même si Mr. Mensah note ton absence.",
                            effects: { love: 5, spirituality: 5, argent: -6 },
                            traits: { generosity: 10, compassion: 5 },
                            relationships: { partner: 15 }
                        },
                        {
                            id: 'balanced_presence',
                            text: "Faire une apparition rapide au Gala.",
                            result: "Tu tentes l'impossible. Tu es [fatigué/fatiguée] d'avoir couru partout, mais tu as montré ton soutien aux deux causes. L'équilibre est fragile.",
                            effects: { argent: 4, love: 2, health: -6, spirituality: 1 },
                            traits: { prudence: 5 }
                        }
                    ]
                },
                {
                    id: 'the_investment',
                    title: 'L\'Investissement d\'une Vie',
                    text: "Tes économies ont fructifié. Un vieil ami te propose d'investir massivement dans une start-up technologique locale prometteuse. C'est une chance de soutenir l'innovation chez toi, mais cela demande de sacrifier ta réserve de sécurité financière familiale.",
                    choices: [
                        {
                            id: 'passion_project',
                            text: "Investir pour l'avenir du pays.",
                            result: "Ton sens du devoir et ton ambition se rejoignent. Tu te sens [fier/fière], malgré le risque financier réel.",
                            effects: { spirituality: 7, argent: 11, love: -4, health: -2 },
                            traits: { courage: 15, generosity: 10 },
                            commitment: 10
                        },
                        {
                            id: 'family_safety',
                            text: "Privilégier le confort du foyer.",
                            result: "La stabilité avant tout. Ta famille dort sur ses deux oreilles, mais tu te demandes si tu n'as pas manqué le train du futur.",
                            effects: { love: 5, health: 7, argent: -3, spirituality: -6 },
                            traits: { prudence: 15 },
                            trust: 10
                        }
                    ]
                }
            ]
        },
        {
            id: 'ch3',
            title: 'Famille, Traditions et Responsabilités',
            events: [
                {
                    id: 'the_family_request',
                    title: 'L\'Appel du Sang',
                    text: "Un message de ton village natal arrive. Ton oncle, le gardien des terres familiales, a besoin d'une aide financière urgente pour réparer la maison ancestrale. C'est un devoir moral fort, mais cette somme correspond exactement au budget que vous aviez mis de côté avec Nia pour votre premier achat immobilier.",
                    choices: [
                        {
                            id: 'honor_tradition',
                            text: "Envoyer l'argent sans hésiter.",
                            result: "Ta famille te couvre de bénédictions. Ton pilier spirituel rayonne, mais les projets de ton couple sont brutalement freinés.",
                            effects: { spirituality: 8, love: -6, argent: -8 },
                            traits: { generosity: 20, compassion: 10 },
                            trust: -10,
                            communication: -5
                        },
                        {
                            id: 'negotiate_family',
                            text: "Proposer une aide partielle.",
                            result: "Tu cherches le compromis. La famille est reconnaissante mais déçue, et Nia apprécie ta prudence financière.",
                            effects: { spirituality: 1, love: 2, argent: -3 },
                            traits: { prudence: 10, patience: 10 },
                            communication: 15,
                            trust: 10
                        },
                        {
                            id: 'refuse_family',
                            text: "Privilégier mon foyer actuel.",
                            result: "Ton projet immobilier avance, mais un sentiment de culpabilité et un froid avec tes aînés s'installent durablement.",
                            effects: { argent: 11, love: 4, spirituality: -10, health: -2 },
                            traits: { resilience: 10 },
                            trust: 20,
                            complicity: 10
                        }
                    ]
                },
                {
                    id: 'the_partner_dream',
                    title: 'Le Rêve de l\'Autre',
                    text: "Nia te confie son désir de reprendre ses études ou de lancer sa propre entreprise. Cela signifie que pendant un an, tu devras assumer [seul/seule] les charges du foyer et sans doute mettre tes propres ambitions en pause.",
                    choices: [
                        {
                            id: 'support_unconditionally',
                            text: "Soutenir ce rêve totalement.",
                            result: "L'amour et la complicité atteignent des sommets. Vous êtes une équipe, même si ton dos courbe sous le poids du travail supplémentaire.",
                            effects: { love: 8, health: -6, argent: 7, spirituality: 4 },
                            traits: { generosity: 15, courage: 10 },
                            complicity: 25,
                            commitment: 20
                        },
                        {
                            id: 'ask_for_wait',
                            text: "Demander d'attendre un meilleur moment.",
                            result: "La sécurité financière est maintenue, mais une tristesse silencieuse s'installe dans le regard de Nia.",
                            effects: { argent: 7, health: 4, love: -8, spirituality: -4 },
                            traits: { prudence: 15 },
                            communication: -10,
                            trust: -10
                        },
                        {
                            id: 'collaborative_plan',
                            text: "Construire un plan par étapes ensemble.",
                            result: "Le dialogue est constructif. Le chemin sera plus long, mais vous avancez main dans la main avec Nia.",
                            effects: { love: 4, spirituality: 1, health: -2, argent: 4 },
                            traits: { patience: 20 },
                            communication: 25,
                            trust: 15
                        }
                    ]
                },
                {
                    id: 'the_mentors_advice',
                    title: 'La Sagesse de Baba',
                    text: "Tu croises Baba lors d'une cérémonie. Il te voit [pensif/pensive]. 'L'arbre ne grandit pas sans ses racines', murmure-t-il, 'mais il ne doit pas non plus être étouffé par elles.' Il t'invite à une retraite spirituelle de trois jours, alors que tu as une semaine cruciale au bureau.",
                    choices: [
                        {
                            id: 'accept_retreat',
                            text: "Partir en retraite pour me retrouver.",
                            result: "Une clarté d'esprit retrouvée. Tu reviens plus fort, malgré les dossiers qui se sont accumulés sur ton bureau.",
                            effects: { spirituality: 11, health: 12, argent: -11 },
                            traits: { patience: 15 },
                            balance_priority: true
                        },
                        {
                            id: 'stay_professional',
                            text: "Rester focalisé sur mes objectifs.",
                            result: "Tu es le moteur de ton entreprise. Tes résultats sont impressionnants, mais ton esprit est en surchauffe constante.",
                            effects: { argent: 13, health: -6, spirituality: -8 },
                            traits: { ambition: 15 },
                            work_priority: true
                        }
                    ]
                }
            ]
        },
        {
            id: 'ch4',
            title: 'L\'Impact sur le Monde',
            events: [
                {
                    id: 'mentorship_dilemma',
                    title: 'Transmettre le Flambeau',
                    text: "Une jeune diplômée brillante, pleine d'énergie mais sans réseau, sollicite ton aide pour lancer son premier projet. En même temps, une opportunité de promotion 'éclair' se présente au bureau, exigeant que tu te consacres exclusivement à tes propres dossiers pendant les trois prochains mois.",
                    choices: [
                        {
                            id: 'choose_mentorship',
                            text: "Devenir son mentor et partager mon temps.",
                            result: "Ton aide change sa vie. Ta réputation de leader inspirant grandit, même si ton ascension personnelle ralentit légèrement.",
                            effects: { spirituality: 7, argent: -6, love: 2, health: -3 },
                            traits: { generosity: 15, compassion: 10 },
                            communication: 10,
                            trust: 5
                        },
                        {
                            id: 'focus_promotion',
                            text: "Me concentrer sur ma promotion.",
                            result: "Tu atteins tes objectifs de carrière avec brio. Mais le soir, un sentiment de vide te rappelle que le succès solitaire a un goût amer.",
                            effects: { argent: 18, spirituality: -6, health: -4, love: -2 },
                            traits: { ambition: 20 },
                            commitment: 15
                        }
                    ]
                },
                {
                    id: 'community_project',
                    title: 'Le Cœur du Quartier',
                    text: "Un projet de réhabilitation d'un parc local est en difficulté financière. Les habitants comptent sur des leaders comme toi pour investir ou mobiliser des fonds. Cet argent pourrait aussi servir à financer un voyage de repos dont vous avez désespérément besoin avec Nia.",
                    choices: [
                        {
                            id: 'invest_park',
                            text: "Investir dans le parc communautaire.",
                            result: "Le parc devient le poumon vert du quartier. Ton impact est visible et durable. Ta fatigue reste présente, mais ton cœur est léger.",
                            effects: { spirituality: 8, argent: -8, love: 2, health: -3 },
                            traits: { generosity: 20, courage: 10 },
                            trust: 10,
                            complicity: 5
                        },
                        {
                            id: 'choose_rest',
                            text: "Privilégier notre voyage de repos.",
                            result: "Vous revenez transformés et pleins d'énergie. Votre couple avec Nia rayonne, mais le parc reste en friche, rappelant une occasion manquée d'aider.",
                            effects: { health: 19, love: 5, spirituality: -6, argent: -3 },
                            traits: { prudence: 10 },
                            complicity: 20,
                            trust: 15
                        }
                    ]
                },
                {
                    id: 'ethical_standout',
                    title: 'Le Courage de l\'Éthique',
                    text: "Ton entreprise s'apprête à signer un contrat lucratif qui risque de nuire aux petits producteurs locaux. Tu es le [seul/seule] à avoir assez d'influence pour t'y opposer. Le faire pourrait compromettre ton avenir dans cette société.",
                    choices: [
                        {
                            id: 'oppose_contract',
                            text: "M'opposer fermement au contrat.",
                            result: "Les producteurs sont sauvés. Tu es [respecté/respectée] par la communauté, mais tes supérieurs te voient désormais comme un obstacle.",
                            effects: { spirituality: 11, argent: -16, love: 4, health: -6 },
                            traits: { courage: 25, honesty: 20 },
                            communication: 15,
                            commitment: -10
                        },
                        {
                            id: 'stay_silent',
                            text: "Rester silencieux et laisser faire.",
                            result: "Le contrat est signé. Ta position est sécurisée et tes bonus tombent, mais tu évites désormais de croiser ton propre regard dans le miroir.",
                            effects: { argent: 18, spirituality: -11, health: -6, love: -2 },
                            traits: { prudence: 10 },
                            commitment: 20,
                            trust: -15
                        }
                    ]
                }
            ]
        },
        {
            id: 'ch5',
            title: 'Les Grands Tournants de la Vie',
            events: [
                {
                    id: 'the_great_crisis',
                    title: 'L\'Épreuve de la Résilience',
                    text: "Le destin frappe sans prévenir. Une crise sectorielle majeure menace ton entreprise, ou une alerte de santé sérieuse te force à t'arrêter. Le Dr. Sow est formel : ton corps réclame une pause immédiate. C'est l'heure de vérité : le système que tu as bâti est-il assez solide pour supporter ce choc ?",
                    choices: [
                        {
                            id: 'resilient_sacrifice',
                            text: "Puisiser dans mes réserves pour protéger l'essentiel.",
                            result: "Tu sauves ce qui compte le plus, mais ton patrimoine et ton énergie sont au plus bas. Tes proches admirent ta force.",
                            effects: { health: -6, argent: -11, love: 5, spirituality: 5 },
                            traits: { resilience: 25, courage: 15 },
                            trust: 20,
                            complicity: 10
                        },
                        {
                            id: 'radical_pivot',
                            text: "Tout risquer dans une transformation radicale.",
                            result: "Tu refuses de subir. Tu changes de cap avec audace. Le succès est incertain, mais ton esprit est galvanisé.",
                            effects: { argent: 7, spirituality: 4, health: -8, love: -4 },
                            traits: { ambition: 20, courage: 20 },
                            commitment: 15,
                            disagreements: 1
                        }
                    ]
                }
            ]
        },
        {
            id: 'ch6',
            title: 'Les Épreuves de la Vie',
            events: [
                {
                    id: 'the_burnout',
                    title: 'Le Mur Invisible',
                    conditions: (s) => s.progress.stats.argent > 70 && s.progress.stats.health < 40,
                    text: "Un matin, ton corps refuse simplement de se lever. L'accumulation des nuits trop courtes et du stress permanent a fini par briser ta résistance. Le Dr. Sow est [formel/formelle] : arrêt total immédiat. Le bureau t'appelle, ignorant ton état.",
                    choices: [
                        {
                            id: 'total_shutdown',
                            text: "Couper mon téléphone et dormir.",
                            result: "Tu choisis ta survie. Ta santé remonte doucement, mais ton influence au bureau s'effondre en ton absence.",
                            effects: { health: 19, argent: -14, spirituality: 4, love: 2 },
                            traits: { resilience: 20, prudence: 10 },
                            trust: 10,
                            communication: 5
                        },
                        {
                            id: 'fight_the_fog',
                            text: "Tenter de travailler à distance.",
                            result: "Tu refuses de lâcher. Tu sauves les dossiers urgents, mais ton état s'aggrave et ton partenaire ne supporte plus de te voir ainsi.",
                            effects: { argent: 11, health: -8, love: -6, spirituality: -4 },
                            traits: { ambition: 15 },
                            disagreements: 2
                        }
                    ]
                },
                {
                    id: 'the_professional_betrayal',
                    title: 'Le Sable Mouvant',
                    conditions: (s) => s.progress.traits.ambition > 20,
                    text: "Un collègue en qui tu avais toute confiance a détourné un de tes projets majeurs pour s'en attribuer le mérite. Ta direction semble le croire. Tout ton travail des derniers mois risque de s'évaporer dans une injustice totale.",
                    choices: [
                        {
                            id: 'seek_justice_calmly',
                            text: "Rassembler des preuves et confronter.",
                            result: "La vérité éclate, mais le climat devient toxique. Tu récupères ton projet mais perds ta sérénité.",
                            effects: { argent: 7, spirituality: -6, health: -4, love: 2 },
                            traits: { honesty: 20, courage: 10 },
                            communication: 10
                        },
                        {
                            id: 'let_go_and_start_over',
                            text: "Lâcher prise et me réinventer ailleurs.",
                            result: "Tu quittes ce nid de vipères. Le choc financier est dur, mais ton âme respire enfin.",
                            effects: { argent: -14, spirituality: 8, health: 12, love: 4 },
                            traits: { resilience: 20, patience: 10 },
                            trust: 15,
                            complicity: 10
                        }
                    ]
                },
                {
                    id: 'the_relational_storm',
                    title: 'L\'Ombre du Doute',
                    conditions: (s) => s.progress.characters.partner.disagreements > 2 || s.progress.characters.partner.trust < 40,
                    text: "Les fissures du passé deviennent des gouffres. Nia et toi ne parlez plus le même langage. Une dispute éclate sur la direction de votre vie commune, menaçant de tout briser.",
                    choices: [
                        {
                            id: 'intensive_therapy',
                            text: "Proposer un dialogue profond et sincère à Nia.",
                            result: "Une épreuve émotionnelle épuisante, mais les murs commencent à tomber. La reconstruction sera longue.",
                            effects: { love: 6, spirituality: 5, health: -8, argent: -6 },
                            traits: { patience: 25, honesty: 15 },
                            communication: 30,
                            trust: 20
                        },
                        {
                            id: 'temporary_distance',
                            text: "Prendre de la distance quelques jours.",
                            result: "Le silence est lourd. Tu retrouves une forme de paix solitaire, mais l'avenir de ton couple avec Nia est en suspens.",
                            effects: { spirituality: 4, health: 4, love: -11, argent: -3 },
                            traits: { prudence: 10 },
                            communication: -20,
                            complicity: -15
                        }
                    ]
                },
                {
                    id: 'the_loss_generic',
                    title: 'L\'Ombre sur le Cœur',
                    conditions: (s) => !s.progress.completedEvents.includes('the_burnout') && !s.progress.completedEvents.includes('the_professional_betrayal') && !s.progress.completedEvents.includes('the_relational_storm'),
                    text: "Un événement imprévu secoue tes fondations : une perte financière imprévue ou la maladie d'un mentor. Le monde semble soudainement plus instable. Comment réagis-tu face à cette fragilité ?",
                    choices: [
                        {
                            id: 'spiritual_refuge',
                            text: "Me tourner vers la spiritualité et le calme.",
                            result: "Tu trouves la paix dans l'acceptation. Ton esprit est fort, même si ton influence matérielle diminue.",
                            effects: { spirituality: 7, health: 7, argent: -8 },
                            traits: { patience: 15, resilience: 10 }
                        },
                        {
                            id: 'fight_back',
                            text: "Lutter pour regagner le terrain perdu.",
                            result: "Tu refuses la défaite. Tes efforts sont surhumains, mais ton corps commence à crier grâce.",
                            effects: { argent: 13, health: -8, spirituality: -4 },
                            traits: { courage: 20, ambition: 10 }
                        }
                    ]
                }
            ]
        },
        {
            id: 'ch7',
            title: 'La Renaissance',
            events: [
                {
                    id: 'ch7_morning_reflection',
                    title: 'Le Premier Jour du Reste de ma Vie',
                    image: 'assets/scene-renaissance-african-webp.webp',
                    text: "Le silence de ton appartement n'est plus pesant, il est apaisant. Après les tempêtes du chapitre précédent, tu te réveilles avec une clarté nouvelle. Les erreurs du passé ne sont plus des fardeaux, mais des leçons gravées dans ton âme. Tu te regardes dans le miroir : les traits sont plus marqués, mais le regard est plus sûr. Par quoi souhaites-tu commencer cette reconstruction ?",
                    choices: [
                        {
                            id: 'rebuild_health_spirit',
                            text: "Prioriser mon ancrage spirituel et ma santé.",
                            result: "Tu passes tes matinées à méditer et à prendre soin de ton corps. Cette force intérieure devient ton nouveau bouclier contre le chaos du monde.",
                            effects: { spirituality: 7, health: 12, argent: -3 },
                            traits: { patience: 15, resilience: 15 },
                            communication: 10
                        },
                        {
                            id: 'rebuild_work_stability',
                            text: "Rétablir une stabilité financière saine.",
                            result: "Tu structures ton retour au travail avec une discipline de fer, refusant le surmenage. Ta base matérielle se consolide sans sacrifier ton âme.",
                            effects: { argent: 11, health: 4, spirituality: 1 },
                            traits: { prudence: 15, ambition: 5 },
                            commitment: 10
                        }
                    ]
                },
                {
                    id: 'ch7_partnership_repair',
                    title: 'Le Pacte de Confiance',
                    image: 'assets/scene-renaissance-african-webp.webp',
                    text: "Le soir venu, tu partages un thé avec Nia. Les non-dits se sont accumulés, mais l'envie de reconstruire est mutuelle. 'Nous avons survécu à la tempête', murmure-t-elle, 'mais comment allons-nous naviguer désormais ?' C'est le moment de définir les nouvelles règles de votre vie commune.",
                    choices: [
                        {
                            id: 'deep_transparency',
                            text: "Promettre une transparence totale et vulnérable.",
                            result: "En ouvrant ton cœur sans armure, tu redécouvres une complicité que tu croyais perdue. Le lien est plus profond qu'au premier jour.",
                            effects: { love: 6, spirituality: 4, health: 4 },
                            relationships: { partner: 15 },
                            trust: 25,
                            communication: 20,
                            complicity: 20,
                            traits: { honesty: 20 }
                        },
                        {
                            id: 'balanced_commitment',
                            text: "S'engager sur un équilibre temps-travail strict.",
                            result: "Tu fixes des limites claires pour protéger votre foyer. Votre partenaire se sent enfin priorisé(e) dans ton emploi du temps.",
                            effects: { love: 5, health: 7, argent: -6 },
                            relationships: { partner: 10 },
                            commitment: 20,
                            communication: 15,
                            traits: { patience: 15 }
                        }
                    ]
                },
                {
                    id: 'ch7_new_enterprise',
                    title: 'L\'Éclosion d\'un Nouveau Projet',
                    image: 'assets/scene-renaissance-african-webp.webp',
                    text: "Une ancienne connaissance te propose de co-fonder une structure innovante, centrée sur l'impact social et le bien-être des employés. C'est l'occasion de mettre en pratique tout ce que tu as appris sur l'équilibre. Le projet est ambitieux, mais il exige une éthique irréprochable dès ses fondations.",
                    choices: [
                        {
                            id: 'ethical_startup',
                            text: "Lancer cette entreprise à impact social.",
                            result: "Tu bâtis un environnement où chaque collaborateur s'épanouit. Ton succès a désormais un sens profond qui dépasse le simple profit.",
                            effects: { argent: 11, spirituality: 5, health: 4, love: 2 },
                            traits: { generosity: 15, courage: 10, honesty: 15 },
                            communication: 10,
                            commitment: 10
                        },
                        {
                            id: 'sustainable_freelance',
                            text: "Choisir l'indépendance pour maîtriser mon temps.",
                            result: "En travaillant à ton compte, tu préserves ta liberté et ton équilibre. Ta réussite est plus modeste, mais ta paix intérieure est absolue.",
                            effects: { health: 12, spirituality: 4, argent: 4, love: 4 },
                            traits: { prudence: 20, resilience: 10 },
                            trust: 10
                        }
                    ]
                },
                {
                    id: 'ch7_baba_reunion',
                    title: 'Le Regard du Mentor',
                    image: 'assets/scene-renaissance-african-webp.webp',
                    text: "Baba t'invite à marcher le long de la lagune. Il observe ta nouvelle posture. 'Celui qui a connu la chute connaît la valeur du sol', te dit-il avec un sourire malicieux. Il te demande quel est, selon toi, le secret de cette renaissance réussie.",
                    choices: [
                        {
                            id: 'answer_resilience',
                            text: "L'acceptation de ma propre vulnérabilité.",
                            result: "Baba acquiesce. 'C'est la force de l'eau qui contourne l'obstacle sans se briser.' Tu te sens [prêt/prête] à guider les autres à ton tour.",
                            effects: { spirituality: 7, health: 7, love: 4 },
                            traits: { resilience: 20, compassion: 15 },
                            communication: 15
                        },
                        {
                            id: 'answer_balance',
                            text: "La discipline de l'équilibre quotidien.",
                            result: "Baba sourit. 'La balance est un mouvement continu, jamais un état statique.' Ta sagesse impressionne le vieil homme.",
                            effects: { spirituality: 5, argent: 7, health: 7 },
                            traits: { patience: 20, prudence: 15 },
                            communication: 10
                        }
                    ]
                }
            ]
        },
        {
            id: 'ch8',
            title: 'Transmission et Héritage Humain',
            events: [
                {
                    id: 'ch8_mentorship_call',
                    title: 'L\'Appel de la Jeunesse',
                    image: 'assets/scene-transmission-african-webp.webp',
                    text: "Un groupe de jeunes diplômés sollicite ton expertise pour valider leur projet de coopérative agricole durable. Ils te voient comme une figure de réussite équilibrée. En même temps, une opportunité de conférence internationale prestigieuse à Dubaï se présente, ce qui renforcerait ton aura personnelle mais te prendrait tout ton temps libre.",
                    choices: [
                        {
                            id: 'invest_in_youth',
                            text: "Consacrer mon temps aux jeunes entrepreneurs.",
                            result: "Tes conseils précieux permettent à leur projet de décoller. Tu ressens une fierté immense en voyant leur passion s'organiser. Ton impact est direct et local.",
                            effects: { spirituality: 8, argent: -6, love: 2 },
                            traits: { generosity: 20, patience: 15 },
                            communication: 15
                        },
                        {
                            id: 'choose_international_fame',
                            text: "Participer à la conférence internationale.",
                            result: "Ta réputation mondiale atteint des sommets. Tu inspires des milliers de personnes à distance, même si le lien humain direct est sacrifié.",
                            effects: { argent: 18, spirituality: -4, health: -2 },
                            traits: { ambition: 20 },
                            commitment: 15
                        },
                        {
                            id: 'secret_mentorship_ngp',
                            text: "Créer un programme hybride visionnaire.",
                            conditions: (s) => s.meta.livesCount > 0,
                            result: "Grâce à ton expérience passée, tu sais comment automatiser tes conseils. Tu inspires les jeunes localement tout en rayonnant à l'international par tes méthodes innovantes. L'équilibre parfait.",
                            effects: { argent: 13, spirituality: 8, love: 5, health: 7 },
                            traits: { ambition: 15, generosity: 20, resilience: 15 },
                            communication: 25
                        }
                    ]
                },
                {
                    id: 'ch8_family_values',
                    title: 'L\'Héritage des Racines',
                    image: 'assets/scene-transmission-african-webp.webp',
                    text: "Une réunion de famille importante se prépare. On te demande de prendre la parole devant les plus jeunes pour partager les valeurs qui ont guidé ton parcours. C'est l'occasion de transmettre la sagesse de Baba et tes propres découvertes sur l'Équilibre.",
                    choices: [
                        {
                            id: 'share_wisdom_stories',
                            text: "Raconter mes échecs et mes leçons de vie.",
                            result: "Ton honnêteté touche les cœurs. Les jeunes de la famille se sentent compris et inspirés par ta résilience. Le lien familial est indestructible.",
                            effects: { love: 6, spirituality: 5, health: 4 },
                            relationships: { partner: 10 },
                            traits: { honesty: 20, compassion: 15 },
                            communication: 20,
                            trust: 15
                        },
                        {
                            id: 'offer_practical_support',
                            text: "Proposer une aide financière pour leurs études.",
                            result: "Tu assures leur avenir matériel avec générosité. Ils te sont reconnaissants, même si la transmission des valeurs reste plus discrète.",
                            effects: { spirituality: 4, argent: -8, love: 4 },
                            traits: { generosity: 25, prudence: 5 },
                            commitment: 10
                        }
                    ]
                },
                {
                    id: 'ch8_community_anchor',
                    title: 'L\'Ancre dans la Cité',
                    image: 'assets/scene-transmission-african-webp.webp',
                    text: "Ta ville souhaite lancer un centre d'incubation pour les métiers de demain et te propose d'en être le parrain ou la marraine. Cela demande un investissement personnel constant. Ta santé est stable, mais tu sens que tu dois faire un choix entre ton confort privé et cet engagement public.",
                    choices: [
                        {
                            id: 'public_engagement',
                            text: "Accepter le rôle de parrain/marraine du centre.",
                            result: "Le centre devient une référence. Tu es désormais une figure publique respectée pour ton engagement communautaire. Ton énergie est sollicitée, mais ton âme rayonne.",
                            effects: { spirituality: 7, argent: 7, health: -6, love: -2 },
                            traits: { courage: 15, generosity: 15 },
                            communication: 15,
                            commitment: 20
                        },
                        {
                            id: 'private_guidance',
                            text: "Préférer le conseil discret et privé.",
                            result: "Tu aides en coulisses, préservant ta santé et ton intimité familiale. Ton influence est réelle mais moins visible aux yeux de tous.",
                            effects: { health: 12, love: 4, spirituality: 1, argent: -3 },
                            traits: { prudence: 15, patience: 10 },
                            trust: 10
                        }
                    ]
                },
                {
                    id: 'ch8_reflection_impact',
                    title: 'L\'Écho de mes Pas',
                    image: 'assets/scene-transmission-african-webp.webp',
                    text: "En marchant avec Nia, vous croisez une personne que vous aviez aidée il y a des années. Elle vous remercie chaleureusement : sans votre intervention, sa vie aurait pris un tout autre tournant. Cela vous amène à réfléchir : quelle est la trace la plus importante que vous souhaitez laisser ?",
                    choices: [
                        {
                            id: 'trace_of_love',
                            text: "Le souvenir d'une vie vécue dans l'amour.",
                            result: "Nia te serre la main. Vous comprenez que vos relations sont votre plus beau chef-d'œuvre. L'équilibre est dans le cœur.",
                            effects: { love: 8, spirituality: 7, health: 7 },
                            relationships: { partner: 20 },
                            traits: { compassion: 25 },
                            complicity: 25,
                            communication: 15
                        },
                        {
                            id: 'trace_of_action',
                            text: "Le souvenir d'un bâtisseur de monde.",
                            result: "Tu regardes les bâtiments et les projets que tu as portés. Tu es [fier/fière] de la solidité de ce que tu légues à la société. L'équilibre est dans l'action.",
                            effects: { argent: 18, spirituality: 5, health: 4 },
                            traits: { courage: 20, ambition: 15 },
                            commitment: 20
                        }
                    ]
                }
            ]
        },
        {
            id: 'ch9',
            title: 'Le Grand Carrefour',
            events: [
                {
                    id: 'ch9_ultimate_responsibility',
                    title: 'Le Sommet de la Pyramide',
                    image: 'assets/scene-destiny-summit-african-webp.webp',
                    text: "Le gouvernement et les grands leaders du continent te proposent de prendre la tête d'une institution panafricaine majeure. C'est l'apogée d'une carrière, un pouvoir immense pour transformer des millions de vies. Cependant, cela exige un sacrifice quasi total de ta vie privée et une pression que ta santé, autrefois fragile, pourrait peiner à supporter.",
                    choices: [
                        {
                            id: 'accept_high_office',
                            text: "Accepter cette mission historique.",
                            result: "Tu deviens l'un des visages de la nouvelle Afrique. Ton influence est colossale, mais le soir, dans tes appartements dorés, le silence te rappelle le prix de cette solitude au sommet.",
                            effects: { argent: 21, spirituality: -6, love: -8, health: -6 },
                            traits: { ambition: 25, courage: 20 },
                            commitment: 30,
                            trust: -10
                        },
                        {
                            id: 'decline_for_balance',
                            text: "Décliner pour préserver mon équilibre.",
                            result: "Tu choisis la liberté et l'intimité. Ta décision surprend le monde, mais le regard de gratitude de Nia et ta paix intérieure confirment que tu as choisi ta vérité.",
                            effects: { love: 8, health: 15, spirituality: 7, argent: -11 },
                            traits: { prudence: 20, patience: 15 },
                            communication: 20,
                            complicity: 25
                        }
                    ]
                },
                {
                    id: 'ch9_the_legacy_choice',
                    title: 'L\'Héritage des Mains Ouvertes',
                    image: 'assets/scene-destiny-summit-african-webp.webp',
                    text: "Ton patrimoine et ton influence sont à leur maximum. Une décision s'impose : utiliser ces ressources pour bâtir un empire familial qui durera des générations, ou créer une fondation philanthropique radicale qui redistribuera cette richesse pour l'éducation et la santé dans les régions les plus pauvres.",
                    choices: [
                        {
                            id: 'build_family_empire',
                            text: "Bâtir un héritage familial puissant.",
                            result: "Tu sécurises l'avenir de ta lignée pour des décennies. Ta famille devient une institution respectée et influente, unie par le succès matériel.",
                            effects: { argent: 13, love: 5, spirituality: -4 },
                            traits: { ambition: 15, prudence: 20 },
                            trust: 15,
                            commitment: 15
                        },
                        {
                            id: 'philanthropic_shift',
                            text: "Léguer ma richesse à une œuvre collective.",
                            result: "Ton geste est salué comme un acte de noblesse rare. Tu ne laisses pas d'empire, mais tu as semé les graines d'un changement réel pour des milliers d'inconnus.",
                            effects: { spirituality: 11, argent: -11, love: 4 },
                            traits: { generosity: 30, compassion: 25 },
                            communication: 10
                        }
                    ]
                },
                {
                    id: 'ch9_vocation_convergence',
                    title: 'Le Chant de l\'Âme',
                    image: 'assets/scene-destiny-summit-african-webp.webp',
                    text: "Malgré tes succès, un appel intérieur se fait plus fort. Une vocation profonde — artistique, spirituelle ou écologique — te demande de quitter tes fonctions actuelles pour te consacrer entièrement à ce qui fait battre ton cœur depuis toujours. C'est le carrefour entre l'image que le monde a de toi et qui tu es vraiment.",
                    choices: [
                        {
                            id: 'follow_vocation',
                            text: "Suivre ma vocation sans compromis.",
                            result: "Tu abandonnes le prestige pour l'authenticité. Ce chemin est incertain, mais tu n'as jamais eu le sentiment d'être aussi vivant et aligné avec l'univers.",
                            effects: { spirituality: 11, health: 12, argent: -16, love: 5 },
                            traits: { courage: 25, honesty: 20 },
                            communication: 15
                        },
                        {
                            id: 'stay_influential',
                            text: "Rester là où j'ai le plus d'impact.",
                            result: "Tu choisis le pragmatisme. Ton influence continue de faire le bien de manière structurée, même si une part de tes rêves reste sagement rangée dans un tiroir.",
                            effects: { argent: 13, spirituality: -4, health: -4 },
                            traits: { resilience: 15, ambition: 10 },
                            commitment: 20
                        }
                    ]
                },
                {
                    id: 'ch9_final_destination',
                    title: 'L\'Ancre Finale',
                    image: 'assets/scene-destiny-summit-african-webp.webp',
                    text: "Toutes les routes convergent vers ce dernier instant de décision. Le monde change, ta ville se transforme. Tu dois choisir où tu poseras ton ancre pour tes dernières années. Seras-tu un sage au milieu de la cité, ou une âme paisible retirée dans la nature de tes ancêtres ?",
                    choices: [
                        {
                            id: 'sage_in_the_city',
                            text: "Rester au cœur de l'action et de la cité.",
                            result: "Tu demeures une figure incontournable, conseillant et guidant jusqu'au bout. Ton empreinte est gravée dans le béton et le verre de la cité.",
                            effects: { argent: 11, spirituality: 4, love: 2, health: -2 },
                            traits: { patience: 20, resilience: 15 },
                            communication: 15
                        },
                        {
                            id: 'return_to_roots',
                            text: "Retourner à la terre et au silence.",
                            result: "Tu retrouves la paix originelle. Loin du tumulte, tu savoures chaque instant avec tes proches, en harmonie totale avec le cycle de la vie.",
                            effects: { spirituality: 8, health: 15, love: 6, argent: -16 },
                            traits: { compassion: 20, prudence: 15 },
                            complicity: 25
                        }
                    ]
                }
            ]
        },
        {
            id: 'ch10',
            unique: true, // chapitre terminal : une seule de ses fins est jouée
            title: 'L\'Héritage',
            events: [
                {
                    id: 'ch10_legacy_sage',
                    title: 'L\'Héritage du Sage',
                    image: 'assets/scene-legacy-final-webp.webp',
                    conditions: (s) => s.progress.balance.level === 'Harmonie profonde' && s.progress.stats.spirituality >= 60 && s.progress.stats.love >= 60,
                    text: "Le soir tombe sur une vie de plénitude. Tu as réussi ce que peu d'âmes accomplissent : l'harmonie totale. Ton nom est synonyme de sagesse. Ta famille est soudée, ton esprit est en paix, et ton héritage n'est pas fait de pierres, mais d'une lumière qui continuera d'éclairer ton entourage bien après ton départ. Tu as trouvé le véritable Équilibre.",
                    choices: [
                        {
                            id: 'game_complete_sage',
                            text: "Contempler mon œuvre une dernière fois.",
                            result: "Félicitations. Vous avez atteint la fin la plus rare : l'Harmonie Profonde. Votre vie restera un modèle de résilience et d'amour pour les générations à venir.",
                        }
                    ]
                },
                {
                    id: 'ch10_legacy_builder',
                    title: 'L\'Héritage du Bâtisseur',
                    image: 'assets/scene-legacy-final-webp.webp',
                    conditions: (s) => s.progress.stats.argent >= 62 && s.progress.traits.ambition >= 90 && s.progress.balance.score >= 44,
                    text: "Tu contemples la cité que tu as aidé à bâtir. Tes entreprises, tes fondations et tes projets sont des piliers de la société moderne. Tu laisses derrière toi un empire et une influence qui transformeront le continent pour les siècles à venir. Si le prix a été lourd en termes de repos, ton œuvre, elle, est immortelle. Tu es le [Bâtisseur/Bâtisseuse] du Destin.",
                    choices: [
                        {
                            id: 'game_complete_builder',
                            text: "Voir mon nom gravé dans l'histoire.",
                            result: "Félicitations. Vous avez bâti un héritage matériel et social colossal. Votre nom restera lié à la grandeur et à la transformation de votre nation.",
                        }
                    ]
                },
                {
                    id: 'ch10_legacy_guide',
                    title: 'L\'Héritage du Guide',
                    image: 'assets/scene-legacy-final-webp.webp',
                    conditions: (s) => s.progress.traits.generosity >= 100 && s.progress.traits.compassion >= 56 && s.progress.stats.love >= 63,
                    text: "Autour de toi se pressent des visages reconnaissants. Ce ne sont pas tes succès personnels que l'on célèbre, mais les milliers de vies que tu as touchées, formées et sauvées. Ton héritage réside dans le cœur de chaque personne à qui tu as tendu la main. Tu as été [le Guide/la Guide], la boussole humaine au milieu des tempêtes. Ta richesse est éternelle car elle est partagée.",
                    choices: [
                        {
                            id: 'game_complete_guide',
                            text: "Sourire à ceux que j'ai fait grandir.",
                            result: "Félicitations. Votre impact humain est inégalé. Vous avez choisi la transmission plutôt que la possession, laissant un monde plus humain derrière vous.",
                        }
                    ]
                },
                {
                    id: 'ch10_legacy_visionary',
                    title: 'L\'Héritage du Visionnaire',
                    image: 'assets/scene-legacy-final-webp.webp',
                    conditions: (s) => s.progress.traits.courage >= 55 && s.progress.traits.honesty >= 30,
                    text: "On se souviendra de toi comme de celui ou celle qui n'a jamais tremblé. Dans les moments les plus sombres, tu as porté le flambeau de l'éthique et de la vérité. Tu as ouvert des voies là où d'autres voyaient des impasses. Ton héritage est celui du courage pur, une inspiration constante pour ceux qui osent rêver d'une Afrique meilleure. Tu es [le Visionnaire/la Visionnaire] du futur.",
                    choices: [
                        {
                            id: 'game_complete_visionary',
                            text: "Porter mon regard vers l'horizon lointain.",
                            result: "Félicitations. Votre intégrité et votre audace ont ouvert de nouveaux chemins. Vous êtes une légende vivante pour votre communauté.",
                        }
                    ]
                },
                {
                    id: 'ch10_legacy_incomplete',
                    title: 'L\'Héritage Inachevé',
                    image: 'assets/scene-legacy-final-webp.webp',
                    conditions: (s) => true, // Default ending
                    text: "Le bilan de ta vie est un mélange complexe d'ombres et de lumières. Tu as accompli de grandes choses, mais certains piliers sont restés fragiles. Des regrets se mêlent à tes succès, et tu sens que certaines leçons n'ont été apprises qu'à moitié. Ta trace est réelle, mais elle appelle à une nouvelle chance, un nouveau souffle pour atteindre enfin l'harmonie complète.",
                    choices: [
                        {
                            id: 'game_complete_incomplete',
                            text: "Accepter mon parcours avec humilité.",
                            result: "Votre voyage s'arrête ici pour cette existence. Chaque fin est un nouveau commencement. Prêt à explorer un autre chemin vers l'Équilibre ?",
                        }
                    ]
                }
            ]
        }
    ]
};

export const ACHIEVEMENTS = [
    { id: 'first_step', title: 'Premier Pas', desc: 'Compléter le Chapitre 1.', icon: '👣' },
    { id: 'perfect_balance', title: 'Harmonie Totale', desc: 'Terminer une vie en Harmonie profonde.', icon: '⚖️' },
    { id: 'spiritual_giant', title: 'Géant Spirituel', desc: 'Porter le pilier Spiritualité à son plus haut.', icon: '🟣' },
    { id: 'great_lover', title: 'Cœur d\'Or', desc: 'Porter le pilier Amour à son plus haut.', icon: '❤️' },
    { id: 'peak_health', title: 'Force de la Nature', desc: 'Porter le pilier Santé à son plus haut.', icon: '💚' },
    { id: 'argent_titan', title: 'Bâtisseur Infatigable', desc: 'Porter le pilier Argent à son plus haut.', icon: '🪙' },
    { id: 'resilient_soul', title: 'Âme Résiliente', desc: 'Surmonter la grande crise du Chapitre 5.', icon: '🌪️' },
    { id: 'legacy_sage', title: 'Héritage du Sage', desc: 'Débloquer la fin du Sage.', icon: '📜' },
    { id: 'legacy_builder', title: 'Héritage du Bâtisseur', desc: 'Débloquer la fin du Bâtisseur.', icon: '🏗️' }
];

export function checkAchievements() {
    const unlocked = state.meta.unlockedAchievements;
    const stats = state.progress.stats;
    const newUnlocks = [];

    const check = (id, condition) => {
        if (!unlocked.includes(id) && condition) {
            unlocked.push(id);
            newUnlocks.push(ACHIEVEMENTS.find(a => a.id === id));
        }
    };

    check('first_step', state.progress.chapterIndex > 0);
    check('perfect_balance', state.progress.balance.level === 'Harmonie profonde');
    check('spiritual_giant', stats.spirituality >= 78);
    check('great_lover', stats.love >= 78);
    check('peak_health', stats.health >= 78);
    check('argent_titan', stats.argent >= 78);
    check('resilient_soul', state.progress.completedEvents.includes('resilient_sacrifice') || state.progress.completedEvents.includes('radical_pivot'));

    // Ces deux hauts faits existaient dans la liste mais aucune vérification
    // ne les décernait : ils étaient inatteignables.
    check('legacy_sage', state.meta.unlockedEnds.includes('ch10_legacy_sage'));
    check('legacy_builder', state.meta.unlockedEnds.includes('ch10_legacy_builder'));

    if (newUnlocks.length > 0) {
        saveGame();
    }
    return newUnlocks;
}

/**
 * Usure du temps : points perdus par chaque pilier au passage d'un chapitre.
 *
 * Sans elle, le jeu récompensait la simple accumulation : un pilier monté tôt
 * restait acquis pour toujours. Avec elle, il faut entretenir — ce qui est le
 * sujet même d'ÉQUILIBRE. Valeur calée par simulation : à 2 la pression est
 * trop faible pour peser sur les décisions, à 4 tous les piliers s'effondrent
 * et l'équilibre devient une égalité par le bas.
 */
export const USURE_PAR_CHAPITRE = 3;

/**
 * Applique l'usure du temps à tous les piliers.
 * À appeler une fois par passage de chapitre.
 * @returns {number} le nombre de points retirés à chaque pilier
 */
export function appliquerUsure() {
    const stats = state.progress.stats;
    Object.keys(stats).forEach(p => {
        stats[p] = Math.max(0, stats[p] - USURE_PAR_CHAPITRE);
    });
    return USURE_PAR_CHAPITRE;
}

/**
 * Titre honorifique attribué à une vie selon son niveau d'équilibre final.
 */
const TITRES_DE_VIE = {
    'Harmonie profonde': 'Gardien de l\'Équilibre',
    'Équilibre stable': 'Bâtisseur serein',
    'Équilibre fragile': 'Funambule',
    'Déséquilibre important': 'Âme en tension',
    'Rupture': 'Vie brisée'
};

/**
 * Dresse le bilan d'une vie achevée : pilier dominant, pilier négligé,
 * réputation retenue, état du foyer et titre honorifique.
 *
 * Utilisée par l'écran de fin de vie et par l'archivage dans le Hall.
 * @returns {{isBalanced:boolean,dominantStat:string,weakestStat:string,
 *            balanceScore:number,balanceLevel:string,primaryReputation:string,
 *            familyStatus:string,titre:string}}
 */
export function evaluateLifePath() {
    const stats = state.progress.stats;
    const rep = getReputationTags();
    const partenaire = state.progress.characters.partner;
    const eq = calculateBalance();

    const cles = Object.keys(stats);
    const dominant = cles.reduce((a, b) => (stats[a] > stats[b] ? a : b));
    const faible = cles.reduce((a, b) => (stats[a] < stats[b] ? a : b));

    return {
        isBalanced: Object.values(stats).every(v => v > 40 && v < 70),
        dominantStat: dominant,
        weakestStat: faible,
        balanceScore: Math.round(eq.score),
        balanceLevel: eq.level,
        primaryReputation: rep[0] || 'Inconnu',
        familyStatus: partenaire.relationship > 70 ? 'Harmonieux'
                    : (partenaire.relationship < 30 ? 'Rompu' : 'Neutre'),
        titre: TITRES_DE_VIE[eq.level] || 'Une vie en chemin'
    };
}

/**
 * Returns the current active event based on game state.
 */
export function getCurrentEvent() {
    const chapter = STORY_DATA.chapters[state.progress.chapterIndex];
    if (!chapter) return null;
    return chapter.events[state.progress.eventIndex] || null;
}

/**
 * Calculates current reputation tags based on traits and decisions.
 */
export function getReputationTags() {
    const tags = [];
    const t = state.progress.traits;
    const d = state.progress.decisions;
    
    // Thresholds for personality-based reputation
    if (t.ambition >= 15) tags.push('Ambitieux');
    if (t.compassion >= 15) tags.push('Altruiste');
    if (t.prudence >= 15) tags.push('Prudent');
    if (t.courage >= 10) tags.push('Courageux');
    if (t.honesty >= 10) tags.push('Personne de confiance');
    if (t.generosity >= 10) tags.push('Généreux');
    if (t.resilience >= 10) tags.push('Résilient');
    
    // Logic-based reputation
    const workFocus = d.filter(id => id.includes('accept') || id.includes('work') || id.includes('overtime')).length;
    if (workFocus >= 2) tags.push('Responsable');
    if (d.includes('accept_relocation') && d.includes('accept_promo')) tags.push('Opportuniste');
    
    // Update state cache
    state.progress.reputation = tags;
    return tags;
}

/**
 * Checks if the player has a specific reputation tag.
 */
export function hasReputation(tag) {
    return getReputationTags().includes(tag);
}

/**
 * Checks if a specific flag is set in memories.
 */
export function hasMemory(key, value = true) {
    return state.progress.memories[key] === value;
}

/**
 * Calculates the Cercle d'Équilibre (Balance Circle).
 * Analyzes pillars, reputation, relations, traits, and decisions.
 */
export function calculateBalance() {
    const stats = Object.values(state.progress.stats);
    const max = Math.max(...stats);
    const min = Math.min(...stats);
    const range = max - min;
    const mean = stats.reduce((a, b) => a + b) / stats.length;

    // Logic for quality assessment beyond just stats
    // La moyenne divisait par 4 en dur alors que le nombre de personnages
    // actifs varie (l'enfant, le médecin et le mentor n'entrent en jeu que
    // plus tard) : le malus de relations se déclenchait à tort dès le départ.
    const actifs = Object.values(state.progress.characters).filter(c => c.active !== false);
    const relAvg = actifs.length
        ? actifs.reduce((sum, c) => sum + c.relationship, 0) / actifs.length
        : 50;

    let score = 100 - (range * 0.8) - (Math.abs(50 - mean) * 0.4);
    if (relAvg < 40) score -= 10;

    // Paliers calés sur la distribution réelle de la nouvelle économie
    // (4 000 parties par stratégie). Ils sont pensés pour qu'un joueur
    // attentif atteigne l'Harmonie profonde environ une fois sur cinq :
    // assez rare pour valoir quelque chose, assez fréquent pour être visé.
    let level = 'Rupture';
    if (score >= 70 && range <= 20) level = 'Harmonie profonde';
    else if (score >= 58 && range <= 34) level = 'Équilibre stable';
    else if (score >= 44 && range <= 52) level = 'Équilibre fragile';
    else if (range <= 72) level = 'Déséquilibre important';

    state.progress.balance.score = Math.max(0, Math.min(100, score));
    state.progress.balance.level = level;

    return state.progress.balance;
}

/**
 * Logic to advance to the next event or chapter.
 * Now handles branch selection based on state/decisions.
 */
export function advanceStory() {
    const chapters = STORY_DATA.chapters;
    let currentChapter = chapters[state.progress.chapterIndex];
    if (!currentChapter) return null;

    // Un chapitre `unique` ne joue qu'un seul de ses événements : le récit
    // s'arrête juste après. Sans ce garde-fou, les cinq fins du chapitre 10
    // s'enchaînaient comme des scènes ordinaires.
    if (currentChapter.unique) {
        state.progress.chapterIndex++;
        state.progress.eventIndex = 0;
        return null;
    }

    state.progress.eventIndex++;
    
    // Find next valid event in current chapter
    const findNextValidEvent = (chapter, startIndex) => {
        for (let i = startIndex; i < chapter.events.length; i++) {
            const event = chapter.events[i];
            if (!event.conditions || event.conditions(state)) return i;
        }
        return -1;
    };

    let nextEventIdx = findNextValidEvent(currentChapter, state.progress.eventIndex);

    if (nextEventIdx === -1) {
        // Move to next chapter
        state.progress.chapterIndex++;
        state.progress.eventIndex = 0;
        currentChapter = chapters[state.progress.chapterIndex];
        
        while (currentChapter && nextEventIdx === -1) {
            nextEventIdx = findNextValidEvent(currentChapter, 0);
            if (nextEventIdx !== -1) break;
            state.progress.chapterIndex++;
            currentChapter = chapters[state.progress.chapterIndex];
        }
        state.progress.eventIndex = nextEventIdx !== -1 ? nextEventIdx : 0;
        if (!currentChapter) return null;
    } else {
        state.progress.eventIndex = nextEventIdx;
    }
    
    return getCurrentEvent();
}
