// MyRosary World — content module. Prayer texts are standard official versions; do not paraphrase.
export const LANGS = [
  { id: 'ko', name: '한국어', voice: 'ko-KR' },
  { id: 'en', name: 'English', voice: 'en-US' },
  { id: 'it', name: 'Italiano', voice: 'it-IT' },
  { id: 'fr', name: 'Français', voice: 'fr-FR' },
  { id: 'es', name: 'Español', voice: 'es-ES' },
  { id: 'pt', name: 'Português', voice: 'pt-BR' },
  { id: 'tl', name: 'Filipino', voice: 'fil-PH' },
];

export const REGIONS = [
  { id: 'europe', defaultLang: 'en', langs: ['en', 'it', 'fr'],
    paper: '#f4efe4', ink: '#1c2333', accent: '#b68235', accent2: '#6e2a35', scrim: '#141a2a', muted: '#6b6a66',
    images: ['03', '04', '13', '17', '07', '06', '11'] },
  { id: 'northamerica', defaultLang: 'en', langs: ['en', 'es'],
    paper: '#f2f3f4', ink: '#14233a', accent: '#c19a4f', accent2: '#5a6b7d', scrim: '#0f1a2b', muted: '#66707c',
    images: ['05', '16', '13', '06', '03', '17'] },
  { id: 'southamerica', defaultLang: 'es', langs: ['es', 'pt'],
    paper: '#f7efe2', ink: '#1f3a2e', accent: '#c98f2b', accent2: '#b4553a', scrim: '#1c2a24', muted: '#6d6558',
    images: ['15', '14', '17', '02', '13', '05'] },
  { id: 'asia', defaultLang: 'en', langs: ['en', 'tl'],
    paper: '#f5f2ec', ink: '#23272a', accent: '#b9a06a', accent2: '#4f7f6f', scrim: '#1b1f22', muted: '#6a6c6a',
    images: ['07', '10', '11', '06', '01', '16'] },
  { id: 'korea', defaultLang: 'ko', langs: ['ko'],
    paper: '#f3ede2', ink: '#2a2622', accent: '#b68235', accent2: '#2f4a7a', scrim: '#1e1b18', muted: '#6b645a',
    images: ['01', '12', '10', '02', '11', '08', '07'] },
];

// focal: object-position for cover crops (face / subject kept in frame)
export const IMAGES = {
  '01': { src: 'img/01-mary-single.jpg', focal: '50% 22%', title: { ko: '빛 가운데 서신 성모', en: 'Our Lady in Light' }, tone: 'light' },
  '02': { src: 'img/02-mary-child.jpg', focal: '55% 30%', title: { ko: '성모와 아기 예수', en: 'Mother and Child' }, tone: 'light' },
  '03': { src: 'img/03-praying-jesus.jpg', focal: '50% 30%', title: { ko: '기도하시는 예수', en: 'Christ in Prayer' }, tone: 'light' },
  '04': { src: 'img/04-cross.jpg', focal: '50% 45%', title: { ko: '빈 무덤의 십자가', en: 'The Cross at the Tomb' }, tone: 'light' },
  '05': { src: 'img/05-jesus-sheep.jpg', focal: '40% 35%', title: { ko: '착한 목자', en: 'The Good Shepherd' }, tone: 'light' },
  '06': { src: 'img/06-side-jesus.jpg', focal: '60% 25%', title: { ko: '손을 내미시는 예수', en: 'Christ Reaching Out' }, tone: 'light' },
  '07': { src: 'img/07-relief-holy-family.jpg', focal: '50% 45%', title: { ko: '성가정', en: 'The Holy Family' }, tone: 'light' },
  '08': { src: 'img/08-mary-profile.jpg', focal: '50% 30%', title: { ko: '성모의 옆모습', en: 'Our Lady in Profile' }, tone: 'light' },
  '10': { src: 'img/10-blue-mary.jpg', focal: '50% 40%', title: { ko: '푸른 옷의 성모', en: 'Our Lady in Blue' }, tone: 'light' },
  '11': { src: 'img/11-prayer-rosary.jpg', focal: '45% 30%', title: { ko: '묵주를 든 기도', en: 'Prayer with Rosary' }, tone: 'light' },
  '12': { src: 'img/12-mary-child-neutral.jpg', focal: '50% 30%', title: { ko: '성모와 아기', en: 'Mother and Child' }, tone: 'light' },
  '13': { src: 'img/13.jpg', focal: '50% 30%', title: { ko: '물 위를 걸으시는 예수', en: 'Christ Walking on Water' }, tone: 'mid' },
  '14': { src: 'img/14.jpg', focal: '50% 40%', title: { ko: '부활', en: 'The Resurrection' }, tone: 'mid' },
  '15': { src: 'img/15.jpg', focal: '50% 55%', title: { ko: '빛을 향한 무리', en: 'The Multitude Toward the Light' }, tone: 'mid' },
  '16': { src: 'img/16.jpg', focal: '50% 35%', title: { ko: '성령', en: 'The Holy Spirit' }, tone: 'light' },
  '17': { src: 'img/17.jpg', focal: '40% 45%', title: { ko: '빈 무덤 앞의 마리아', en: 'Mary at the Empty Tomb' }, tone: 'dark' },
};
export const IMAGE_IDS = Object.keys(IMAGES);

export const MYSTERY_SETS = ['joyful', 'luminous', 'sorrowful', 'glorious'];
// Sun/Wed glorious, Mon/Sat joyful, Tue/Fri sorrowful, Thu luminous
export const DAY_TO_SET = ['glorious', 'joyful', 'sorrowful', 'glorious', 'luminous', 'sorrowful', 'joyful'];

export const SCRIPTURE = {
  joyful: ['Lk 1:26-38', 'Lk 1:39-56', 'Lk 2:1-20', 'Lk 2:22-38', 'Lk 2:41-52'],
  luminous: ['Mt 3:13-17', 'Jn 2:1-11', 'Mk 1:14-15', 'Lk 9:28-36', 'Mt 26:26-29'],
  sorrowful: ['Lk 22:39-46', 'Jn 19:1', 'Mt 27:27-31', 'Jn 19:16-17', 'Lk 23:33-46'],
  glorious: ['Mt 28:1-10', 'Acts 1:9-11', 'Acts 2:1-4', 'Rev 12:1', 'Rev 12:1'],
};

export const PRAYERS = {
  ko: {
    sign: '성부와 성자와 성령의 이름으로. 아멘.',
    kiss: '십자가에 입을 맞추십니다.',
    creed: '전능하신 천주 성부, 천지의 창조주를 저는 믿나이다.\n그 외아들 우리 주 예수 그리스도님, 성령으로 인하여 동정 마리아께 잉태되어 나시고, 본시오 빌라도 통치 아래서 고난을 받으시고, 십자가에 못 박혀 돌아가시고 묻히셨으며, 저승에 가시어 사흗날에 죽은 이들 가운데서 부활하시고, 하늘에 올라 전능하신 천주 성부 오른편에 앉으시며, 그리로부터 살아 있는 이와 죽은 이를 심판하러 오시리라 믿나이다.\n성령을 믿으며, 거룩하고 보편된 교회와 모든 성인의 통공을 믿으며, 죄의 용서와 육신의 부활을 믿으며, 영원한 삶을 믿나이다. 아멘.',
    our: '하늘에 계신 우리 아버지, 아버지의 이름이 거룩히 빛나시며, 아버지의 나라가 오시며, 아버지의 뜻이 하늘에서와 같이 땅에서도 이루어지소서.\n오늘 저희에게 일용할 양식을 주시고, 저희에게 잘못한 이를 저희가 용서하오니 저희 죄를 용서하시고, 저희를 유혹에 빠지지 않게 하시고 악에서 구하소서. 아멘.',
    hail: '은총이 가득하신 마리아님, 기뻐하소서! 주님께서 함께 계시니 여인 중에 복되시며 태중의 아들 예수님 또한 복되시나이다.\n천주의 성모 마리아님, 이제와 저희 죽을 때에 저희 죄인을 위하여 빌어주소서. 아멘.',
    glory: '영광이 성부와 성자와 성령께 처음과 같이 이제와 항상 영원히. 아멘.',
    fatima: '예수님, 저희 죄를 용서하시며, 저희를 지옥 불에서 구하시고, 연옥 영혼을 돌보시되 가장 버림받은 영혼을 특히 돌보소서.',
    salve: '모후이시며 사랑이 넘친 어머니, 우리의 생명, 우리의 기쁨, 우리의 희망이시여.\n당신 우러러 하와의 그 자손들이 눈물을 흘리며 슬피 울면서 이 눈물의 골짜기에서 당신께 하소연하나이다.\n우리들의 보호자 성모님, 불쌍한 우리를 인자로운 눈으로 굽어보소서. 귀양살이 끝날 그때에 당신의 아드님 우리 주 예수님 뵙게 하소서.\n너그러우시고 자애로우시며 오! 아름다우신 동정 마리아님.',
  },
  en: {
    sign: 'In the name of the Father, and of the Son, and of the Holy Spirit. Amen.',
    kiss: 'Kiss the crucifix.',
    creed: 'I believe in God, the Father almighty, Creator of heaven and earth, and in Jesus Christ, his only Son, our Lord, who was conceived by the Holy Spirit, born of the Virgin Mary, suffered under Pontius Pilate, was crucified, died and was buried; he descended into hell; on the third day he rose again from the dead; he ascended into heaven, and is seated at the right hand of God the Father almighty; from there he will come to judge the living and the dead.\nI believe in the Holy Spirit, the holy catholic Church, the communion of saints, the forgiveness of sins, the resurrection of the body, and life everlasting. Amen.',
    our: 'Our Father, who art in heaven, hallowed be thy name; thy kingdom come, thy will be done on earth as it is in heaven.\nGive us this day our daily bread, and forgive us our trespasses, as we forgive those who trespass against us; and lead us not into temptation, but deliver us from evil. Amen.',
    hail: 'Hail Mary, full of grace, the Lord is with thee. Blessed art thou among women, and blessed is the fruit of thy womb, Jesus.\nHoly Mary, Mother of God, pray for us sinners, now and at the hour of our death. Amen.',
    glory: 'Glory be to the Father, and to the Son, and to the Holy Spirit, as it was in the beginning, is now, and ever shall be, world without end. Amen.',
    fatima: 'O my Jesus, forgive us our sins, save us from the fires of hell, and lead all souls to heaven, especially those in most need of thy mercy.',
    salve: 'Hail, holy Queen, Mother of mercy, our life, our sweetness and our hope. To thee do we cry, poor banished children of Eve; to thee do we send up our sighs, mourning and weeping in this valley of tears.\nTurn then, most gracious advocate, thine eyes of mercy toward us, and after this our exile show unto us the blessed fruit of thy womb, Jesus.\nO clement, O loving, O sweet Virgin Mary.',
  },
  it: {
    sign: 'Nel nome del Padre e del Figlio e dello Spirito Santo. Amen.',
    kiss: 'Si bacia il crocifisso.',
    creed: 'Io credo in Dio, Padre onnipotente, creatore del cielo e della terra; e in Gesù Cristo, suo unico Figlio, nostro Signore, il quale fu concepito di Spirito Santo, nacque da Maria Vergine, patì sotto Ponzio Pilato, fu crocifisso, morì e fu sepolto; discese agli inferi; il terzo giorno risuscitò da morte; salì al cielo, siede alla destra di Dio Padre onnipotente; di là verrà a giudicare i vivi e i morti.\nCredo nello Spirito Santo, la santa Chiesa cattolica, la comunione dei santi, la remissione dei peccati, la risurrezione della carne, la vita eterna. Amen.',
    our: 'Padre nostro, che sei nei cieli, sia santificato il tuo nome, venga il tuo regno, sia fatta la tua volontà, come in cielo così in terra.\nDacci oggi il nostro pane quotidiano, e rimetti a noi i nostri debiti come anche noi li rimettiamo ai nostri debitori, e non abbandonarci alla tentazione, ma liberaci dal male. Amen.',
    hail: 'Ave, o Maria, piena di grazia, il Signore è con te. Tu sei benedetta fra le donne e benedetto è il frutto del tuo seno, Gesù.\nSanta Maria, Madre di Dio, prega per noi peccatori, adesso e nell\'ora della nostra morte. Amen.',
    glory: 'Gloria al Padre e al Figlio e allo Spirito Santo. Come era nel principio, e ora e sempre nei secoli dei secoli. Amen.',
    fatima: 'Gesù mio, perdona le nostre colpe, preservaci dal fuoco dell\'inferno, porta in cielo tutte le anime, specialmente le più bisognose della tua misericordia.',
    salve: 'Salve, Regina, Madre di misericordia; vita, dolcezza e speranza nostra, salve. A Te ricorriamo, noi esuli figli di Eva; a Te sospiriamo, gementi e piangenti in questa valle di lacrime.\nOrsù dunque, avvocata nostra, rivolgi a noi gli occhi tuoi misericordiosi. E mostraci, dopo questo esilio, Gesù, il frutto benedetto del tuo seno.\nO clemente, o pia, o dolce Vergine Maria.',
  },
  fr: {
    sign: 'Au nom du Père, et du Fils, et du Saint-Esprit. Amen.',
    kiss: 'On embrasse le crucifix.',
    creed: 'Je crois en Dieu, le Père tout-puissant, créateur du ciel et de la terre. Et en Jésus-Christ, son Fils unique, notre Seigneur, qui a été conçu du Saint-Esprit, est né de la Vierge Marie, a souffert sous Ponce Pilate, a été crucifié, est mort et a été enseveli, est descendu aux enfers, le troisième jour est ressuscité des morts, est monté aux cieux, est assis à la droite de Dieu le Père tout-puissant, d\'où il viendra juger les vivants et les morts.\nJe crois en l\'Esprit Saint, à la sainte Église catholique, à la communion des saints, à la rémission des péchés, à la résurrection de la chair, à la vie éternelle. Amen.',
    our: 'Notre Père, qui es aux cieux, que ton nom soit sanctifié, que ton règne vienne, que ta volonté soit faite sur la terre comme au ciel.\nDonne-nous aujourd\'hui notre pain de ce jour. Pardonne-nous nos offenses, comme nous pardonnons aussi à ceux qui nous ont offensés. Et ne nous laisse pas entrer en tentation, mais délivre-nous du Mal. Amen.',
    hail: 'Je vous salue, Marie, pleine de grâce ; le Seigneur est avec vous. Vous êtes bénie entre toutes les femmes, et Jésus, le fruit de vos entrailles, est béni.\nSainte Marie, Mère de Dieu, priez pour nous, pauvres pécheurs, maintenant et à l\'heure de notre mort. Amen.',
    glory: 'Gloire au Père, et au Fils, et au Saint-Esprit, comme il était au commencement, maintenant et toujours, pour les siècles des siècles. Amen.',
    fatima: 'Ô mon Jésus, pardonnez-nous nos péchés, préservez-nous du feu de l\'enfer, et conduisez au ciel toutes les âmes, surtout celles qui ont le plus besoin de votre miséricorde.',
    salve: 'Salut, ô Reine, Mère de miséricorde, notre vie, notre douceur, notre espérance, salut ! Enfants d\'Ève, exilés, nous crions vers vous ; vers vous nous soupirons, gémissant et pleurant dans cette vallée de larmes.\nÔ vous, notre avocate, tournez vers nous vos regards miséricordieux. Et après cet exil, montrez-nous Jésus, le fruit béni de vos entrailles.\nÔ clémente, ô miséricordieuse, ô douce Vierge Marie.',
  },
  es: {
    sign: 'En el nombre del Padre, y del Hijo, y del Espíritu Santo. Amén.',
    kiss: 'Se besa el crucifijo.',
    creed: 'Creo en Dios, Padre todopoderoso, Creador del cielo y de la tierra. Creo en Jesucristo, su único Hijo, nuestro Señor, que fue concebido por obra y gracia del Espíritu Santo, nació de santa María Virgen, padeció bajo el poder de Poncio Pilato, fue crucificado, muerto y sepultado, descendió a los infiernos, al tercer día resucitó de entre los muertos, subió a los cielos y está sentado a la derecha de Dios, Padre todopoderoso. Desde allí ha de venir a juzgar a vivos y muertos.\nCreo en el Espíritu Santo, la santa Iglesia católica, la comunión de los santos, el perdón de los pecados, la resurrección de la carne y la vida eterna. Amén.',
    our: 'Padre nuestro, que estás en el cielo, santificado sea tu Nombre; venga a nosotros tu reino; hágase tu voluntad en la tierra como en el cielo.\nDanos hoy nuestro pan de cada día; perdona nuestras ofensas, como también nosotros perdonamos a los que nos ofenden; no nos dejes caer en la tentación, y líbranos del mal. Amén.',
    hail: 'Dios te salve, María, llena eres de gracia; el Señor es contigo; bendita Tú eres entre todas las mujeres, y bendito es el fruto de tu vientre, Jesús.\nSanta María, Madre de Dios, ruega por nosotros, pecadores, ahora y en la hora de nuestra muerte. Amén.',
    glory: 'Gloria al Padre, y al Hijo, y al Espíritu Santo. Como era en el principio, ahora y siempre, por los siglos de los siglos. Amén.',
    fatima: 'Oh Jesús mío, perdona nuestros pecados, líbranos del fuego del infierno, lleva al cielo a todas las almas, especialmente a las más necesitadas de tu misericordia.',
    salve: 'Dios te salve, Reina y Madre de misericordia, vida, dulzura y esperanza nuestra; Dios te salve. A Ti llamamos los desterrados hijos de Eva; a Ti suspiramos, gimiendo y llorando, en este valle de lágrimas.\nEa, pues, Señora, abogada nuestra, vuelve a nosotros esos tus ojos misericordiosos; y después de este destierro, muéstranos a Jesús, fruto bendito de tu vientre.\n¡Oh clementísima, oh piadosa, oh dulce Virgen María!',
  },
  pt: {
    sign: 'Em nome do Pai, e do Filho, e do Espírito Santo. Amém.',
    kiss: 'Beija-se o crucifixo.',
    creed: 'Creio em Deus Pai todo-poderoso, criador do céu e da terra; e em Jesus Cristo, seu único Filho, nosso Senhor; que foi concebido pelo poder do Espírito Santo; nasceu da Virgem Maria; padeceu sob Pôncio Pilatos, foi crucificado, morto e sepultado; desceu à mansão dos mortos; ressuscitou ao terceiro dia; subiu aos céus; está sentado à direita de Deus Pai todo-poderoso, donde há de vir a julgar os vivos e os mortos.\nCreio no Espírito Santo, na santa Igreja católica, na comunhão dos santos, na remissão dos pecados, na ressurreição da carne, na vida eterna. Amém.',
    our: 'Pai nosso que estais nos céus, santificado seja o vosso nome; venha a nós o vosso reino; seja feita a vossa vontade, assim na terra como no céu.\nO pão nosso de cada dia nos dai hoje; perdoai-nos as nossas ofensas, assim como nós perdoamos a quem nos tem ofendido; e não nos deixeis cair em tentação, mas livrai-nos do mal. Amém.',
    hail: 'Ave Maria, cheia de graça, o Senhor é convosco; bendita sois vós entre as mulheres, e bendito é o fruto do vosso ventre, Jesus.\nSanta Maria, Mãe de Deus, rogai por nós, pecadores, agora e na hora da nossa morte. Amém.',
    glory: 'Glória ao Pai, e ao Filho, e ao Espírito Santo. Como era no princípio, agora e sempre. Amém.',
    fatima: 'Ó meu Jesus, perdoai-nos e livrai-nos do fogo do inferno; levai as almas todas para o céu e socorrei principalmente as que mais precisarem.',
    salve: 'Salve, Rainha, Mãe de misericórdia, vida, doçura e esperança nossa, salve! A vós bradamos, os degredados filhos de Eva; a vós suspiramos, gemendo e chorando neste vale de lágrimas.\nEia, pois, advogada nossa, esses vossos olhos misericordiosos a nós volvei; e depois deste desterro nos mostrai Jesus, bendito fruto do vosso ventre.\nÓ clemente, ó piedosa, ó doce sempre Virgem Maria.',
  },
  tl: {
    sign: 'Sa ngalan ng Ama, at ng Anak, at ng Espiritu Santo. Amen.',
    kiss: 'Hagkan ang krusipiho.',
    creed: 'Sumasampalataya ako sa Diyos Amang makapangyarihan sa lahat, na may gawa ng langit at lupa. Sumasampalataya ako kay Hesukristo, iisang Anak ng Diyos, Panginoon nating lahat. Nagkatawang-tao siya lalang ng Espiritu Santo, ipinanganak ni Santa Mariang Birhen. Pinagpakasakit ni Poncio Pilato, ipinako sa krus, namatay, inilibing. Nanaog sa kinaroroonan ng mga yumao. Nang may ikatlong araw nabuhay na mag-uli. Umakyat sa langit. Naluluklok sa kanan ng Diyos Amang makapangyarihan sa lahat. Doon magmumulang paririto at huhukom sa nangabubuhay at nangamatay na tao.\nSumasampalataya naman ako sa Diyos Espiritu Santo, sa banal na Simbahang Katolika, sa kasamahan ng mga banal, sa kapatawaran ng mga kasalanan, sa pagkabuhay na muli ng nangamatay na tao at sa buhay na walang hanggan. Amen.',
    our: 'Ama namin, sumasalangit Ka, sambahin ang ngalan Mo. Mapasaamin ang kaharian Mo. Sundin ang loob Mo dito sa lupa para nang sa langit.\nBigyan Mo kami ngayon ng aming kakanin sa araw-araw. At patawarin Mo kami sa aming mga sala, para nang pagpapatawad namin sa nagkakasala sa amin. At huwag Mo kaming ipahintulot sa tukso, at iadya Mo kami sa lahat ng masama. Amen.',
    hail: 'Aba Ginoong Maria, napupuno ka ng grasya, ang Panginoong Diyos ay sumasaiyo. Bukod kang pinagpala sa babaeng lahat, at pinagpala naman ang iyong anak na si Hesus.\nSanta Maria, Ina ng Diyos, ipanalangin mo kaming makasalanan, ngayon at kung kami\'y mamamatay. Amen.',
    glory: 'Luwalhati sa Ama, at sa Anak, at sa Espiritu Santo. Kapara nang sa unang-una, ngayon at magpasawalang hanggan. Amen.',
    fatima: 'O Hesus ko, patawarin Mo kami sa aming mga sala, iligtas Mo kami sa apoy ng impiyerno, hanguin Mo ang mga kaluluwa sa purgatoryo, lalung-lalo na ang mga walang nakakaalaala.',
    salve: 'Aba po, Santa Mariang Hari, Ina ng awa. Ikaw ang kabuhayan at katamisan, aba, pinananaligan ka namin. Ikaw nga ang tinatawag namin, pinapanaw na taong anak ni Eva. Ikaw rin ang pinagbubuntung-hininga namin ng aming pagtangis dini sa lupang bayang kahapis-hapis.\nAy aba, pintakasi ka namin, ilingon mo sa amin ang mga mata mong maawain. At saka kung matapos yaring pagpanaw sa amin, ipakita mo sa amin ang iyong Anak na si Hesus.\nSanta Maria, Ina ng Diyos, maawain, maalam at matamis na Birhen.',
  },
};

export const MYSTERIES = {
  ko: {
    joyful: ['마리아께서 예수님을 잉태하심을 묵상합시다.', '마리아께서 엘리사벳을 방문하심을 묵상합시다.', '마리아께서 예수님을 낳으심을 묵상합시다.', '마리아께서 예수님을 성전에 바치심을 묵상합시다.', '마리아께서 잃으셨던 예수님을 성전에서 찾으심을 묵상합시다.'],
    luminous: ['예수님께서 요르단 강에서 세례를 받으심을 묵상합시다.', '예수님께서 카나에서 첫 기적을 행하심을 묵상합시다.', '예수님께서 하느님 나라를 선포하심을 묵상합시다.', '예수님께서 영광스럽게 변모하심을 묵상합시다.', '예수님께서 성체성사를 세우심을 묵상합시다.'],
    sorrowful: ['예수님께서 우리를 위하여 피땀 흘리심을 묵상합시다.', '예수님께서 우리를 위하여 매 맞으심을 묵상합시다.', '예수님께서 우리를 위하여 가시관 쓰심을 묵상합시다.', '예수님께서 우리를 위하여 십자가 지심을 묵상합시다.', '예수님께서 우리를 위하여 십자가에 못 박혀 돌아가심을 묵상합시다.'],
    glorious: ['예수님께서 부활하심을 묵상합시다.', '예수님께서 승천하심을 묵상합시다.', '예수님께서 성령을 보내심을 묵상합시다.', '예수님께서 마리아를 하늘에 불러올리심을 묵상합시다.', '예수님께서 마리아께 천상 모후의 관을 씌우심을 묵상합시다.'],
  },
  en: {
    joyful: ['The Annunciation', 'The Visitation', 'The Nativity', 'The Presentation in the Temple', 'The Finding of Jesus in the Temple'],
    luminous: ['The Baptism of Jesus in the Jordan', 'The Wedding at Cana', 'The Proclamation of the Kingdom of God', 'The Transfiguration', 'The Institution of the Eucharist'],
    sorrowful: ['The Agony in the Garden', 'The Scourging at the Pillar', 'The Crowning with Thorns', 'The Carrying of the Cross', 'The Crucifixion and Death of Our Lord'],
    glorious: ['The Resurrection', 'The Ascension', 'The Descent of the Holy Spirit', 'The Assumption of Mary', 'The Coronation of Mary as Queen of Heaven'],
  },
  it: {
    joyful: ['L\'Annunciazione dell\'Angelo a Maria', 'La Visita di Maria a Santa Elisabetta', 'La Nascita di Gesù a Betlemme', 'La Presentazione di Gesù al Tempio', 'Il Ritrovamento di Gesù nel Tempio'],
    luminous: ['Il Battesimo di Gesù al Giordano', 'Le Nozze di Cana', 'L\'Annuncio del Regno di Dio', 'La Trasfigurazione', 'L\'Istituzione dell\'Eucaristia'],
    sorrowful: ['L\'Agonia di Gesù nel Getsemani', 'La Flagellazione di Gesù', 'La Coronazione di spine', 'Gesù carico della croce', 'La Crocifissione e morte di Gesù'],
    glorious: ['La Risurrezione di Gesù', 'L\'Ascensione di Gesù al cielo', 'La Discesa dello Spirito Santo', 'L\'Assunzione di Maria al cielo', 'L\'Incoronazione di Maria Regina del cielo e della terra'],
  },
  fr: {
    joyful: ['L\'Annonciation', 'La Visitation', 'La Nativité', 'La Présentation de Jésus au Temple', 'Le Recouvrement de Jésus au Temple'],
    luminous: ['Le Baptême de Jésus au Jourdain', 'Les Noces de Cana', 'L\'Annonce du Royaume de Dieu', 'La Transfiguration', 'L\'Institution de l\'Eucharistie'],
    sorrowful: ['L\'Agonie de Jésus à Gethsémani', 'La Flagellation', 'Le Couronnement d\'épines', 'Le Portement de la croix', 'Le Crucifiement et la mort de Jésus'],
    glorious: ['La Résurrection', 'L\'Ascension', 'La Pentecôte', 'L\'Assomption de Marie', 'Le Couronnement de Marie au ciel'],
  },
  es: {
    joyful: ['La Encarnación del Hijo de Dios', 'La Visitación de Nuestra Señora a su prima Santa Isabel', 'El Nacimiento del Hijo de Dios en Belén', 'La Presentación de Jesús en el Templo', 'El Niño Jesús perdido y hallado en el Templo'],
    luminous: ['El Bautismo de Jesús en el Jordán', 'Las Bodas de Caná', 'El Anuncio del Reino de Dios', 'La Transfiguración', 'La Institución de la Eucaristía'],
    sorrowful: ['La Oración de Jesús en el Huerto', 'La Flagelación del Señor', 'La Coronación de espinas', 'Jesús con la cruz a cuestas', 'La Crucifixión y muerte de Nuestro Señor'],
    glorious: ['La Resurrección del Señor', 'La Ascensión del Señor', 'La Venida del Espíritu Santo', 'La Asunción de Nuestra Señora', 'La Coronación de la Santísima Virgen'],
  },
  pt: {
    joyful: ['A Anunciação do Anjo a Maria', 'A Visitação de Maria a sua prima Isabel', 'O Nascimento de Jesus em Belém', 'A Apresentação do Menino Jesus no Templo', 'O Encontro do Menino Jesus no Templo'],
    luminous: ['O Batismo de Jesus no Jordão', 'As Bodas de Caná', 'O Anúncio do Reino de Deus', 'A Transfiguração', 'A Instituição da Eucaristia'],
    sorrowful: ['A Agonia de Jesus no Horto', 'A Flagelação de Jesus', 'A Coroação de espinhos', 'Jesus carrega a cruz', 'A Crucificação e morte de Jesus'],
    glorious: ['A Ressurreição de Jesus', 'A Ascensão de Jesus ao céu', 'A Descida do Espírito Santo', 'A Assunção de Maria ao céu', 'A Coroação de Maria como Rainha do céu e da terra'],
  },
  tl: {
    joyful: ['Ang Pagbati ng Anghel kay Maria', 'Ang Pagdalaw ni Maria kay Elisabet', 'Ang Pagsilang ni Hesus', 'Ang Paghahandog kay Hesus sa Templo', 'Ang Pagkakita kay Hesus sa Templo'],
    luminous: ['Ang Pagbibinyag kay Hesus sa Ilog Jordan', 'Ang Kasalan sa Cana', 'Ang Pagpapahayag ng Kaharian ng Diyos', 'Ang Pagbabagong-anyo ni Hesus', 'Ang Pagtatatag ng Eukaristiya'],
    sorrowful: ['Ang Paghihirap ni Hesus sa Halamanan', 'Ang Paghampas kay Hesus', 'Ang Pagpuputong ng Koronang Tinik', 'Ang Pagpapasan ni Hesus ng Krus', 'Ang Pagkamatay ni Hesus sa Krus'],
    glorious: ['Ang Muling Pagkabuhay ni Hesus', 'Ang Pag-akyat ni Hesus sa Langit', 'Ang Pagbaba ng Espiritu Santo', 'Ang Pag-aakyat kay Maria sa Langit', 'Ang Pagpuputong kay Maria bilang Reyna ng Langit at Lupa'],
  },
};

// Short meditation notes (ko/en; other languages fall back to en)
export const MEDITATIONS = {
  ko: {
    joyful: ['천사가 마리아께 구세주의 어머니가 되실 것을 알리고, 마리아는 "말씀대로 이루어지소서" 하고 응답합니다.', '마리아는 엘리사벳을 찾아가고, 엘리사벳은 "여인 중에 복되시다" 하고 인사합니다.', '베들레헴의 구유에서 구세주가 태어나십니다.', '마리아와 요셉은 아기 예수를 성전에 바치고, 시메온은 구원을 봅니다.', '사흘 만에 성전에서 아버지의 집에 있는 소년 예수를 찾습니다.'],
    luminous: ['요르단 강에서 세례를 받으신 예수님 위에 "사랑하는 아들"이라는 소리가 들립니다.', '카나의 혼인 잔치에서 물이 포도주가 되어 첫 표징을 보이십니다.', '"하느님의 나라가 가까이 왔다. 회개하고 복음을 믿어라."', '산 위에서 예수님의 얼굴이 해처럼 빛납니다.', '최후의 만찬에서 빵과 포도주를 몸과 피로 내어 주십니다.'],
    sorrowful: ['겟세마니에서 땀이 피처럼 떨어질 때까지 기도하십니다.', '빌라도의 명으로 기둥에서 매를 맞으십니다.', '가시관을 쓰시고 조롱을 받으십니다.', '골고타를 향해 십자가를 지고 가십니다.', '십자가에 못 박혀 "다 이루어졌다" 하시고 숨을 거두십니다.'],
    glorious: ['사흗날 새벽, 무덤은 비어 있고 주님은 살아 계십니다.', '제자들이 보는 가운데 하늘로 오르십니다.', '오순절에 성령이 불꽃 모양 혀처럼 제자들 위에 내립니다.', '마리아는 육신과 영혼이 함께 하늘에 들어올려집니다.', '마리아는 천상의 모후로 관을 받으십니다.'],
  },
  en: {
    joyful: ['The angel Gabriel announces to Mary that she will bear the Savior; she answers, "Let it be done to me according to your word."', 'Mary visits Elizabeth, who greets her as blessed among women.', 'The Savior is born in a manger in Bethlehem.', 'Mary and Joseph present the child in the Temple; Simeon sees salvation.', 'After three days the boy Jesus is found in his Father\'s house.'],
    luminous: ['At the Jordan a voice is heard over Jesus: "This is my beloved Son."', 'At Cana water becomes wine, the first of his signs.', '"The kingdom of God is at hand. Repent, and believe in the gospel."', 'On the mountain his face shines like the sun.', 'At the Last Supper he gives bread and wine as his body and blood.'],
    sorrowful: ['In Gethsemane he prays until his sweat falls like drops of blood.', 'By Pilate\'s order he is scourged at the pillar.', 'He is crowned with thorns and mocked.', 'He carries the cross toward Golgotha.', 'Nailed to the cross he says, "It is finished," and dies.'],
    glorious: ['At dawn on the third day the tomb is empty; the Lord lives.', 'Before the eyes of his disciples he is taken up into heaven.', 'At Pentecost the Spirit descends on the disciples like tongues of fire.', 'Mary is taken up, body and soul, into heaven.', 'Mary is crowned Queen of heaven and earth.'],
  },
};

export const UI = {
  ko: {
    appName: 'MyRosary World', tagline: '손에 든 묵주, 눈앞의 성화', today: '오늘의 신비', start: '오늘의 기도 시작', resume: '이어서 기도하기', step: '단계',
    home: '홈', gallery: '성화 갤러리', journeys: '기도 여정', settings: '설정', back: '뒤로', close: '닫기',
    joyful: '환희의 신비', luminous: '빛의 신비', sorrowful: '고통의 신비', glorious: '영광의 신비',
    opening: '시작 기도', closing: '마침 기도', decade: '단', decadeN: '제{n}단', mysteryN: '{set} {n}단',
    sign: '성호경', kiss: '십자가에 입맞춤', creed: '사도신경', our: '주님의 기도', hail: '성모송', glory: '영광송', fatima: '구원을 비는 기도', salve: '성모찬송', announce: '신비 선포',
    prev: '이전', next: '다음', voice: '음성', voiceOn: '음성 켜짐', voiceOff: '음성 꺼짐', fontSize: '글자 크기', tapHint: '묵주 가운데를 누르면 다음 기도로', dragHint: '고리를 돌려 앞·뒤로 이동',
    complete: '오늘의 묵주기도를 마쳤습니다', hailCount: '성모송 {n}번', minutes: '{n}분', again: '다시 바치기', toHome: '홈으로', keepImage: '이 성화 고정하기',
    favorites: '즐겨찾기', pin: '고정', pinned: '고정됨', unpin: '고정 해제', view: '전체 화면으로 감상', changeImage: '다른 성화', allImages: '모든 성화',
    region: '지역', language: '언어', regionLang: '지역 및 언어', europe: '유럽', northamerica: '북미', southamerica: '남미', asia: '아시아', korea: '한국',
    regionDesc: { europe: '고전 성화와 촛불, 키아로스쿠로', northamerica: '넓은 공간과 자연광, 영화적 풍경', southamerica: '따뜻한 햇빛과 풍부한 색, 공동체의 신앙', asia: '고요한 자연과 여백, 절제된 빛', korea: '한지의 질감과 새벽빛, 고요한 여백' },
    startJourney: '시작', prayForThis: '이 지향으로 기도하기', newJourney: '새 여정 시작', nine: '9일 기도', fiftyFour: '54일 기도', daily: '날마다', intention: '지향', intentionPh: '누구를, 무엇을 위하여 바치나요', dayOf: '{d}일째 / {t}일', petition: '청원', thanks: '감사', prayedToday: '오늘 바침', notYet: '오늘 아직', noJourney: '진행 중인 여정이 없습니다', delete: '삭제', dueDate: '완료 예정 {date}',
    mysteryGuide: '신비 해설', scripture: '성경', meditate: '묵상', prayThis: '이 신비로 기도하기',
    autoAdvance: '읽은 뒤 자동으로 다음', haptic: '햅틱', reduceMotion: '움직임 줄이기', install: '홈 화면에 추가', offline: '오프라인 사용 가능', data: '기도 기록', history: '완주 기록', clearSession: '진행 중인 기도 지우기', small: '작게', normal: '보통', large: '크게', xlarge: '아주 크게',
    srCurrent: '현재 묵주알: {bead}. {prayer}. {pos}', beadCross: '십자가', beadMedal: '중앙 메달', beadOur: '주님의 기도 알', beadHail: '성모송 알 {i}',
  },
  en: {
    appName: 'MyRosary World', tagline: 'A rosary in hand, sacred art before the eyes', today: 'Today\'s Mystery', start: 'Begin today\'s Rosary', resume: 'Continue praying', step: 'step',
    home: 'Home', gallery: 'Sacred Art', journeys: 'Journeys', settings: 'Settings', back: 'Back', close: 'Close',
    joyful: 'Joyful Mysteries', luminous: 'Luminous Mysteries', sorrowful: 'Sorrowful Mysteries', glorious: 'Glorious Mysteries',
    opening: 'Opening Prayers', closing: 'Closing Prayers', decade: 'Decade', decadeN: 'Decade {n}', mysteryN: '{set}, {n}',
    sign: 'Sign of the Cross', kiss: 'Kiss the Crucifix', creed: 'Apostles\' Creed', our: 'Our Father', hail: 'Hail Mary', glory: 'Glory Be', fatima: 'Fatima Prayer', salve: 'Hail, Holy Queen', announce: 'Announce the Mystery',
    prev: 'Previous', next: 'Next', voice: 'Voice', voiceOn: 'Voice on', voiceOff: 'Voice off', fontSize: 'Text size', tapHint: 'Tap the center of the rosary to go on', dragHint: 'Turn the loop to move back or forward',
    complete: 'You have completed today\'s Rosary', hailCount: '{n} Hail Marys', minutes: '{n} min', again: 'Pray again', toHome: 'Home', keepImage: 'Keep this image',
    favorites: 'Favorites', pin: 'Pin', pinned: 'Pinned', unpin: 'Unpin', view: 'View full screen', changeImage: 'Another image', allImages: 'All images',
    region: 'Region', language: 'Language', regionLang: 'Region & Language', europe: 'Europe', northamerica: 'North America', southamerica: 'Latin America', asia: 'Asia', korea: 'Korea',
    regionDesc: { europe: 'Classical icons, candlelight, chiaroscuro', northamerica: 'Open space, natural light, cinematic landscapes', southamerica: 'Warm sun, rich color, faith in community', asia: 'Quiet nature, empty space, restrained light', korea: 'Hanji texture, dawn light, quiet stillness' },
    startJourney: 'Start', prayForThis: 'Pray for this intention', newJourney: 'Start a journey', nine: '9-day Novena', fiftyFour: '54-day Novena', daily: 'Daily', intention: 'Intention', intentionPh: 'For whom or what do you pray?', dayOf: 'Day {d} of {t}', petition: 'Petition', thanks: 'Thanksgiving', prayedToday: 'Prayed today', notYet: 'Not yet today', noJourney: 'No journey in progress', delete: 'Delete', dueDate: 'Ends {date}',
    mysteryGuide: 'The Mysteries', scripture: 'Scripture', meditate: 'Meditation', prayThis: 'Pray these mysteries',
    autoAdvance: 'Advance automatically after reading', haptic: 'Haptics', reduceMotion: 'Reduce motion', install: 'Add to Home Screen', offline: 'Available offline', data: 'Prayer records', history: 'Completed rosaries', clearSession: 'Clear prayer in progress', small: 'Small', normal: 'Normal', large: 'Large', xlarge: 'Extra large',
    srCurrent: 'Current bead: {bead}. {prayer}. {pos}', beadCross: 'Crucifix', beadMedal: 'Center medal', beadOur: 'Our Father bead', beadHail: 'Hail Mary bead {i}',
  },
  it: {
    appName: 'MyRosary World', tagline: 'Il rosario in mano, l\'arte sacra davanti agli occhi', today: 'Misteri di oggi', start: 'Inizia il Rosario di oggi', resume: 'Continua a pregare', step: 'passo',
    home: 'Home', gallery: 'Arte sacra', journeys: 'Cammini', settings: 'Impostazioni', back: 'Indietro', close: 'Chiudi',
    joyful: 'Misteri della Gioia', luminous: 'Misteri della Luce', sorrowful: 'Misteri del Dolore', glorious: 'Misteri della Gloria',
    opening: 'Preghiere iniziali', closing: 'Preghiere finali', decade: 'Decina', decadeN: 'Decina {n}', mysteryN: '{set}, {n}',
    sign: 'Segno della Croce', kiss: 'Bacio del Crocifisso', creed: 'Credo', our: 'Padre nostro', hail: 'Ave Maria', glory: 'Gloria al Padre', fatima: 'Preghiera di Fatima', salve: 'Salve Regina', announce: 'Annuncio del mistero',
    prev: 'Precedente', next: 'Avanti', voice: 'Voce', voiceOn: 'Voce attiva', voiceOff: 'Voce disattivata', fontSize: 'Dimensione testo', tapHint: 'Tocca il centro del rosario per continuare', dragHint: 'Ruota la corona per andare avanti o indietro',
    complete: 'Hai completato il Rosario di oggi', hailCount: '{n} Ave Maria', minutes: '{n} min', again: 'Prega di nuovo', toHome: 'Home', keepImage: 'Mantieni questa immagine',
    favorites: 'Preferiti', pin: 'Fissa', pinned: 'Fissata', unpin: 'Sblocca', view: 'Schermo intero', changeImage: 'Altra immagine', allImages: 'Tutte le immagini',
    region: 'Regione', language: 'Lingua', regionLang: 'Regione e lingua', europe: 'Europa', northamerica: 'Nord America', southamerica: 'America Latina', asia: 'Asia', korea: 'Corea',
    regionDesc: { europe: 'Icone classiche, candele, chiaroscuro', northamerica: 'Spazi aperti, luce naturale, paesaggi cinematografici', southamerica: 'Sole caldo, colori intensi, fede comunitaria', asia: 'Natura silenziosa, vuoto, luce misurata', korea: 'Carta hanji, luce dell\'alba, quiete' },
    startJourney: 'Inizia', prayForThis: 'Prega per questa intenzione', newJourney: 'Inizia un cammino', nine: 'Novena di 9 giorni', fiftyFour: 'Novena di 54 giorni', daily: 'Ogni giorno', intention: 'Intenzione', intentionPh: 'Per chi o per cosa preghi?', dayOf: 'Giorno {d} di {t}', petition: 'Supplica', thanks: 'Ringraziamento', prayedToday: 'Pregato oggi', notYet: 'Non ancora oggi', noJourney: 'Nessun cammino in corso', delete: 'Elimina', dueDate: 'Termina {date}',
    mysteryGuide: 'I Misteri', scripture: 'Scrittura', meditate: 'Meditazione', prayThis: 'Prega questi misteri',
    autoAdvance: 'Avanza automaticamente dopo la lettura', haptic: 'Vibrazione', reduceMotion: 'Riduci movimento', install: 'Aggiungi alla schermata Home', offline: 'Disponibile offline', data: 'Registro preghiere', history: 'Rosari completati', clearSession: 'Cancella preghiera in corso', small: 'Piccolo', normal: 'Normale', large: 'Grande', xlarge: 'Molto grande',
    srCurrent: 'Grano attuale: {bead}. {prayer}. {pos}', beadCross: 'Crocifisso', beadMedal: 'Medaglia centrale', beadOur: 'Grano del Padre nostro', beadHail: 'Grano dell\'Ave Maria {i}',
  },
  fr: {
    appName: 'MyRosary World', tagline: 'Le chapelet en main, l\'art sacré sous les yeux', today: 'Mystères du jour', start: 'Commencer le Rosaire', resume: 'Continuer la prière', step: 'étape',
    home: 'Accueil', gallery: 'Art sacré', journeys: 'Parcours', settings: 'Réglages', back: 'Retour', close: 'Fermer',
    joyful: 'Mystères joyeux', luminous: 'Mystères lumineux', sorrowful: 'Mystères douloureux', glorious: 'Mystères glorieux',
    opening: 'Prières d\'ouverture', closing: 'Prières finales', decade: 'Dizaine', decadeN: 'Dizaine {n}', mysteryN: '{set}, {n}',
    sign: 'Signe de croix', kiss: 'Baiser du crucifix', creed: 'Je crois en Dieu', our: 'Notre Père', hail: 'Je vous salue Marie', glory: 'Gloire au Père', fatima: 'Prière de Fatima', salve: 'Salve Regina', announce: 'Annonce du mystère',
    prev: 'Précédent', next: 'Suivant', voice: 'Voix', voiceOn: 'Voix activée', voiceOff: 'Voix désactivée', fontSize: 'Taille du texte', tapHint: 'Touchez le centre du chapelet pour continuer', dragHint: 'Tournez la boucle pour avancer ou revenir',
    complete: 'Vous avez achevé le Rosaire du jour', hailCount: '{n} Je vous salue Marie', minutes: '{n} min', again: 'Prier à nouveau', toHome: 'Accueil', keepImage: 'Garder cette image',
    favorites: 'Favoris', pin: 'Épingler', pinned: 'Épinglée', unpin: 'Détacher', view: 'Plein écran', changeImage: 'Autre image', allImages: 'Toutes les images',
    region: 'Région', language: 'Langue', regionLang: 'Région et langue', europe: 'Europe', northamerica: 'Amérique du Nord', southamerica: 'Amérique latine', asia: 'Asie', korea: 'Corée',
    regionDesc: { europe: 'Icônes classiques, chandelles, clair-obscur', northamerica: 'Grands espaces, lumière naturelle, paysages de cinéma', southamerica: 'Soleil chaud, couleurs riches, foi en communauté', asia: 'Nature silencieuse, vide, lumière retenue', korea: 'Papier hanji, lumière de l\'aube, quiétude' },
    startJourney: 'Commencer', prayForThis: 'Prier pour cette intention', newJourney: 'Commencer un parcours', nine: 'Neuvaine de 9 jours', fiftyFour: 'Neuvaine de 54 jours', daily: 'Chaque jour', intention: 'Intention', intentionPh: 'Pour qui, pour quoi priez-vous ?', dayOf: 'Jour {d} sur {t}', petition: 'Supplication', thanks: 'Action de grâce', prayedToday: 'Prié aujourd\'hui', notYet: 'Pas encore aujourd\'hui', noJourney: 'Aucun parcours en cours', delete: 'Supprimer', dueDate: 'Fin le {date}',
    mysteryGuide: 'Les Mystères', scripture: 'Écriture', meditate: 'Méditation', prayThis: 'Prier ces mystères',
    autoAdvance: 'Passer automatiquement après la lecture', haptic: 'Vibrations', reduceMotion: 'Réduire les animations', install: 'Ajouter à l\'écran d\'accueil', offline: 'Disponible hors ligne', data: 'Historique de prière', history: 'Rosaires achevés', clearSession: 'Effacer la prière en cours', small: 'Petit', normal: 'Normal', large: 'Grand', xlarge: 'Très grand',
    srCurrent: 'Grain actuel : {bead}. {prayer}. {pos}', beadCross: 'Crucifix', beadMedal: 'Médaille centrale', beadOur: 'Grain du Notre Père', beadHail: 'Grain du Je vous salue Marie {i}',
  },
  es: {
    appName: 'MyRosary World', tagline: 'El rosario en la mano, el arte sacro ante los ojos', today: 'Misterios de hoy', start: 'Comenzar el Rosario de hoy', resume: 'Continuar la oración', step: 'paso',
    home: 'Inicio', gallery: 'Arte sacro', journeys: 'Caminos', settings: 'Ajustes', back: 'Atrás', close: 'Cerrar',
    joyful: 'Misterios Gozosos', luminous: 'Misterios Luminosos', sorrowful: 'Misterios Dolorosos', glorious: 'Misterios Gloriosos',
    opening: 'Oraciones iniciales', closing: 'Oraciones finales', decade: 'Misterio', decadeN: 'Misterio {n}', mysteryN: '{set}, {n}',
    sign: 'Señal de la Cruz', kiss: 'Beso al crucifijo', creed: 'Credo', our: 'Padre nuestro', hail: 'Ave María', glory: 'Gloria', fatima: 'Oración de Fátima', salve: 'Salve', announce: 'Anuncio del misterio',
    prev: 'Anterior', next: 'Siguiente', voice: 'Voz', voiceOn: 'Voz activada', voiceOff: 'Voz desactivada', fontSize: 'Tamaño del texto', tapHint: 'Toca el centro del rosario para continuar', dragHint: 'Gira el rosario para avanzar o retroceder',
    complete: 'Has completado el Rosario de hoy', hailCount: '{n} Avemarías', minutes: '{n} min', again: 'Rezar de nuevo', toHome: 'Inicio', keepImage: 'Conservar esta imagen',
    favorites: 'Favoritos', pin: 'Fijar', pinned: 'Fijada', unpin: 'Soltar', view: 'Pantalla completa', changeImage: 'Otra imagen', allImages: 'Todas las imágenes',
    region: 'Región', language: 'Idioma', regionLang: 'Región e idioma', europe: 'Europa', northamerica: 'Norteamérica', southamerica: 'América Latina', asia: 'Asia', korea: 'Corea',
    regionDesc: { europe: 'Iconos clásicos, velas, claroscuro', northamerica: 'Espacios abiertos, luz natural, paisajes de cine', southamerica: 'Sol cálido, color intenso, fe en comunidad', asia: 'Naturaleza serena, vacío, luz contenida', korea: 'Papel hanji, luz del alba, quietud' },
    startJourney: 'Comenzar', prayForThis: 'Rezar por esta intención', newJourney: 'Comenzar un camino', nine: 'Novena de 9 días', fiftyFour: 'Novena de 54 días', daily: 'Cada día', intention: 'Intención', intentionPh: '¿Por quién o por qué rezas?', dayOf: 'Día {d} de {t}', petition: 'Petición', thanks: 'Acción de gracias', prayedToday: 'Rezado hoy', notYet: 'Aún no hoy', noJourney: 'No hay camino en curso', delete: 'Eliminar', dueDate: 'Termina el {date}',
    mysteryGuide: 'Los Misterios', scripture: 'Escritura', meditate: 'Meditación', prayThis: 'Rezar estos misterios',
    autoAdvance: 'Avanzar automáticamente tras la lectura', haptic: 'Vibración', reduceMotion: 'Reducir movimiento', install: 'Añadir a la pantalla de inicio', offline: 'Disponible sin conexión', data: 'Registro de oración', history: 'Rosarios completados', clearSession: 'Borrar oración en curso', small: 'Pequeño', normal: 'Normal', large: 'Grande', xlarge: 'Muy grande',
    srCurrent: 'Cuenta actual: {bead}. {prayer}. {pos}', beadCross: 'Crucifijo', beadMedal: 'Medalla central', beadOur: 'Cuenta del Padre nuestro', beadHail: 'Cuenta del Ave María {i}',
  },
  pt: {
    appName: 'MyRosary World', tagline: 'O rosário na mão, a arte sacra diante dos olhos', today: 'Mistérios de hoje', start: 'Começar o Rosário de hoje', resume: 'Continuar a oração', step: 'passo',
    home: 'Início', gallery: 'Arte sacra', journeys: 'Caminhos', settings: 'Ajustes', back: 'Voltar', close: 'Fechar',
    joyful: 'Mistérios Gozosos', luminous: 'Mistérios Luminosos', sorrowful: 'Mistérios Dolorosos', glorious: 'Mistérios Gloriosos',
    opening: 'Orações iniciais', closing: 'Orações finais', decade: 'Mistério', decadeN: 'Mistério {n}', mysteryN: '{set}, {n}',
    sign: 'Sinal da Cruz', kiss: 'Beijo no crucifixo', creed: 'Creio', our: 'Pai Nosso', hail: 'Ave Maria', glory: 'Glória ao Pai', fatima: 'Oração de Fátima', salve: 'Salve Rainha', announce: 'Anúncio do mistério',
    prev: 'Anterior', next: 'Próximo', voice: 'Voz', voiceOn: 'Voz ligada', voiceOff: 'Voz desligada', fontSize: 'Tamanho do texto', tapHint: 'Toque no centro do rosário para continuar', dragHint: 'Gire o rosário para avançar ou voltar',
    complete: 'Você completou o Rosário de hoje', hailCount: '{n} Ave-Marias', minutes: '{n} min', again: 'Rezar novamente', toHome: 'Início', keepImage: 'Manter esta imagem',
    favorites: 'Favoritos', pin: 'Fixar', pinned: 'Fixada', unpin: 'Soltar', view: 'Tela cheia', changeImage: 'Outra imagem', allImages: 'Todas as imagens',
    region: 'Região', language: 'Idioma', regionLang: 'Região e idioma', europe: 'Europa', northamerica: 'América do Norte', southamerica: 'América Latina', asia: 'Ásia', korea: 'Coreia',
    regionDesc: { europe: 'Ícones clássicos, velas, claro-escuro', northamerica: 'Espaços amplos, luz natural, paisagens de cinema', southamerica: 'Sol quente, cores ricas, fé em comunidade', asia: 'Natureza serena, vazio, luz contida', korea: 'Papel hanji, luz da alvorada, quietude' },
    startJourney: 'Começar', prayForThis: 'Rezar por esta intenção', newJourney: 'Começar um caminho', nine: 'Novena de 9 dias', fiftyFour: 'Novena de 54 dias', daily: 'Todo dia', intention: 'Intenção', intentionPh: 'Por quem ou pelo que você reza?', dayOf: 'Dia {d} de {t}', petition: 'Petição', thanks: 'Ação de graças', prayedToday: 'Rezado hoje', notYet: 'Ainda não hoje', noJourney: 'Nenhum caminho em andamento', delete: 'Excluir', dueDate: 'Termina em {date}',
    mysteryGuide: 'Os Mistérios', scripture: 'Escritura', meditate: 'Meditação', prayThis: 'Rezar estes mistérios',
    autoAdvance: 'Avançar automaticamente após a leitura', haptic: 'Vibração', reduceMotion: 'Reduzir movimento', install: 'Adicionar à tela inicial', offline: 'Disponível offline', data: 'Registro de oração', history: 'Rosários completos', clearSession: 'Apagar oração em andamento', small: 'Pequeno', normal: 'Normal', large: 'Grande', xlarge: 'Muito grande',
    srCurrent: 'Conta atual: {bead}. {prayer}. {pos}', beadCross: 'Crucifixo', beadMedal: 'Medalha central', beadOur: 'Conta do Pai Nosso', beadHail: 'Conta da Ave Maria {i}',
  },
  tl: {
    appName: 'MyRosary World', tagline: 'Rosaryo sa kamay, banal na sining sa harap ng mata', today: 'Misteryo ngayon', start: 'Simulan ang Rosaryo ngayon', resume: 'Ipagpatuloy ang pagdarasal', step: 'hakbang',
    home: 'Tahanan', gallery: 'Banal na Sining', journeys: 'Paglalakbay', settings: 'Mga Setting', back: 'Bumalik', close: 'Isara',
    joyful: 'Misteryo ng Tuwa', luminous: 'Misteryo ng Liwanag', sorrowful: 'Misteryo ng Hapis', glorious: 'Misteryo ng Luwalhati',
    opening: 'Panimulang Dasal', closing: 'Pangwakas na Dasal', decade: 'Misteryo', decadeN: 'Ika-{n} Misteryo', mysteryN: '{set}, {n}',
    sign: 'Tanda ng Krus', kiss: 'Paghalik sa Krusipiho', creed: 'Sumasampalataya', our: 'Ama Namin', hail: 'Aba Ginoong Maria', glory: 'Luwalhati', fatima: 'Dasal ng Fatima', salve: 'Aba Po Santa Mariang Hari', announce: 'Pagpapahayag ng Misteryo',
    prev: 'Nakaraan', next: 'Susunod', voice: 'Tinig', voiceOn: 'Tinig bukas', voiceOff: 'Tinig sarado', fontSize: 'Laki ng teksto', tapHint: 'Pindutin ang gitna ng rosaryo upang magpatuloy', dragHint: 'Ikutin ang rosaryo upang umabante o bumalik',
    complete: 'Natapos mo ang Rosaryo ngayon', hailCount: '{n} Aba Ginoong Maria', minutes: '{n} min', again: 'Magdasal muli', toHome: 'Tahanan', keepImage: 'Panatilihin ang larawang ito',
    favorites: 'Mga Paborito', pin: 'I-pin', pinned: 'Naka-pin', unpin: 'Alisin', view: 'Buong screen', changeImage: 'Ibang larawan', allImages: 'Lahat ng larawan',
    region: 'Rehiyon', language: 'Wika', regionLang: 'Rehiyon at Wika', europe: 'Europa', northamerica: 'Hilagang Amerika', southamerica: 'Latin Amerika', asia: 'Asya', korea: 'Korea',
    regionDesc: { europe: 'Klasikong imahen, kandila, chiaroscuro', northamerica: 'Malawak na espasyo, likas na liwanag', southamerica: 'Mainit na araw, masaganang kulay, pananampalataya ng komunidad', asia: 'Tahimik na kalikasan, espasyo, pinigil na liwanag', korea: 'Papel na hanji, liwanag ng madaling-araw, katahimikan' },
    startJourney: 'Simulan', prayForThis: 'Idasal ang layuning ito', newJourney: 'Magsimula ng paglalakbay', nine: '9 na araw na Nobena', fiftyFour: '54 na araw na Nobena', daily: 'Araw-araw', intention: 'Layunin', intentionPh: 'Para kanino o para sa ano ka nagdarasal?', dayOf: 'Araw {d} ng {t}', petition: 'Paghiling', thanks: 'Pasasalamat', prayedToday: 'Nagdasal ngayon', notYet: 'Hindi pa ngayon', noJourney: 'Walang paglalakbay na isinasagawa', delete: 'Burahin', dueDate: 'Magtatapos {date}',
    mysteryGuide: 'Ang mga Misteryo', scripture: 'Kasulatan', meditate: 'Pagninilay', prayThis: 'Idasal ang mga misteryong ito',
    autoAdvance: 'Awtomatikong sumunod pagkatapos basahin', haptic: 'Pag-vibrate', reduceMotion: 'Bawasan ang galaw', install: 'Idagdag sa Home Screen', offline: 'Magagamit offline', data: 'Talaan ng dasal', history: 'Natapos na Rosaryo', clearSession: 'Burahin ang kasalukuyang dasal', small: 'Maliit', normal: 'Normal', large: 'Malaki', xlarge: 'Napakalaki',
    srCurrent: 'Kasalukuyang butil: {bead}. {prayer}. {pos}', beadCross: 'Krusipiho', beadMedal: 'Gitnang medalya', beadOur: 'Butil ng Ama Namin', beadHail: 'Butil ng Aba Ginoong Maria {i}',
  },
};

// ── Sequence: 81 steps, mapped to 59 beads ────────────────────────────────
// bead ids: 'cross', 'tL1' (tail large 1), 'tS1'..'tS3', 'tL2', 'medal', 'L1'..'L4' (loop large), 'S1'..'S50' (loop small)
export function buildSequence() {
  const seq = [];
  const push = (kind, bead, decade, hailIdx, hailOf) => seq.push({ kind, bead, decade, hailIdx, hailOf });
  push('sign', 'cross', 0); push('kiss', 'cross', 0); push('creed', 'cross', 0);
  push('our', 'tL1', 0);
  for (let i = 1; i <= 3; i++) push('hail', 'tS' + i, 0, i, 3);
  push('glory', 'tL2', 0); push('fatima', 'tL2', 0);
  for (let d = 1; d <= 5; d++) {
    const ourBead = d === 1 ? 'tL2' : 'L' + (d - 1);
    push('announce', ourBead, d); push('our', ourBead, d);
    for (let i = 1; i <= 10; i++) push('hail', 'S' + ((d - 1) * 10 + i), d, i, 10);
    const endBead = d === 5 ? 'medal' : 'L' + d;
    push('glory', endBead, d); push('fatima', endBead, d);
  }
  push('salve', 'medal', 6); push('sign', 'medal', 6);
  return seq; // 3+1+3+2 + 5*14 + 2 = 81
}

// loop order from the medal going clockwise: S1..S10, L1, S11..S20, L2, ... S41..S50 (then back to medal)
export function loopOrder() {
  const arr = [];
  for (let d = 1; d <= 5; d++) {
    for (let i = 1; i <= 10; i++) arr.push('S' + ((d - 1) * 10 + i));
    if (d < 5) arr.push('L' + d);
  }
  return arr; // 54
}

export function fmt(str, vars) {
  return String(str || '').replace(/\{(\w+)\}/g, (_, k) => (vars && vars[k] != null ? vars[k] : ''));
}
