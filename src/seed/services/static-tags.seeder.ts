export default async function () {
  const tags = [
    {
      name: 'International Aid',
      hex_color: '#FFC433',
      translations: [
        {
          name: '国際協力',
          language: await this.getLanguagesByCode('ja-Kana'),
        },
        {
          name: 'Ayuda Internacional',
          language: await this.getLanguagesByCode('es-ES'),
        },
        {
          name: 'Internationale Hilfe',
          language: await this.getLanguagesByCode('de-DE'),
        },
        {
          name: '国际援助',
          language: await this.getLanguagesByCode('zh-CN'),
        },
        {
          name: 'Aiuto internazionale',
          language: await this.getLanguagesByCode('it-IT'),
        },
        {
          name: 'Aide internationale',
          language: await this.getLanguagesByCode('fr-FR'),
        },
        {
          name: 'अंतर्राष्ट्रीय सहायता',
          language: await this.getLanguagesByCode('hi-IN'),
        },
      ],
    },
    {
      name: 'Maternal & Child Support',
      hex_color: '#FE7E9E',
      translations: [
        {
          name: '出産・子育て支援',
          language: await this.getLanguagesByCode('ja-Kana'),
        },
        {
          name: 'Apoyo Materno y Infantil',
          language: await this.getLanguagesByCode('es-ES'),
        },
        {
          name: 'Mütter- und Kinderunterstützung',
          language: await this.getLanguagesByCode('de-DE'),
        },
        {
          name: '母婴支持',
          language: await this.getLanguagesByCode('zh-CN'),
        },
        {
          name: 'Supporto materno e infantile',
          language: await this.getLanguagesByCode('it-IT'),
        },
        {
          name: 'Soutien maternel et infantile',
          language: await this.getLanguagesByCode('fr-FR'),
        },
        {
          name: 'मातृ और बाल समर्थन',
          language: await this.getLanguagesByCode('hi-IN'),
        },
      ],
    },
    {
      name: "Children's Education",
      hex_color: '#FF5733',
      translations: [
        {
          name: '子どもの教育',
          language: await this.getLanguagesByCode('ja-Kana'),
        },
        {
          name: 'Educación Infantil',
          language: await this.getLanguagesByCode('es-ES'),
        },
        {
          name: 'Bildung für Kinder',
          language: await this.getLanguagesByCode('de-DE'),
        },
        {
          name: '儿童教育',
          language: await this.getLanguagesByCode('zh-CN'),
        },
        {
          name: 'Educazione dei bambini',
          language: await this.getLanguagesByCode('it-IT'),
        },
        {
          name: 'Éducation des enfants',
          language: await this.getLanguagesByCode('fr-FR'),
        },
        {
          name: 'बच्चों की शिक्षा',
          language: await this.getLanguagesByCode('hi-IN'),
        },
      ],
    },
    {
      name: 'Disability & Elderly Care',
      hex_color: '#A2A2BD',
      translations: [
        {
          name: '障がい・介護支援',
          language: await this.getLanguagesByCode('ja-Kana'),
        },
        {
          name: 'Cuidado de Discapacitados y Ancianos',
          language: await this.getLanguagesByCode('es-ES'),
        },
        {
          name: 'Behinderten- und Altenpflege',
          language: await this.getLanguagesByCode('de-DE'),
        },
        {
          name: '残疾与老年人护理',
          language: await this.getLanguagesByCode('zh-CN'),
        },
        {
          name: 'Assistenza a disabili e anziani',
          language: await this.getLanguagesByCode('it-IT'),
        },
        {
          name: `Soin des personnes handicapées et des personnes âgées`,
          language: await this.getLanguagesByCode('fr-FR'),
        },
        {
          name: 'विकलांगता और वृद्ध देखभाल',
          language: await this.getLanguagesByCode('hi-IN'),
        },
      ],
    },
    {
      name: 'Employment Services',
      hex_color: '#5D6D7E',
      translations: [
        {
          name: '就職・雇用支援',
          language: await this.getLanguagesByCode('ja-Kana'),
        },
        {
          name: 'Servicios de Empleo',
          language: await this.getLanguagesByCode('es-ES'),
        },
        {
          name: 'Beschäftigungsdienste',
          language: await this.getLanguagesByCode('de-DE'),
        },
        {
          name: '就业服务',
          language: await this.getLanguagesByCode('zh-CN'),
        },
        {
          name: "Servizi per l'impiego",
          language: await this.getLanguagesByCode('it-IT'),
        },
        {
          name: "Services d'emploi",
          language: await this.getLanguagesByCode('fr-FR'),
        },
        {
          name: 'रोजगार सेवाएं',
          language: await this.getLanguagesByCode('hi-IN'),
        },
      ],
    },
    {
      name: 'Human Rights',
      hex_color: '#FFA733',
      translations: [
        {
          name: '人権保護',
          language: await this.getLanguagesByCode('ja-Kana'),
        },
        {
          name: 'Derechos Humanos',
          language: await this.getLanguagesByCode('es-ES'),
        },
        {
          name: 'Menschenrechte',
          language: await this.getLanguagesByCode('de-DE'),
        },
        {
          name: '人权',
          language: await this.getLanguagesByCode('zh-CN'),
        },
        {
          name: 'Diritti umani',
          language: await this.getLanguagesByCode('it-IT'),
        },
        {
          name: "Droits de l'homme",
          language: await this.getLanguagesByCode('fr-FR'),
        },
        {
          name: 'मानव अधिकार',
          language: await this.getLanguagesByCode('hi-IN'),
        },
      ],
    },
    {
      name: 'Agriculture Support',
      hex_color: '#33C433',
      translations: [
        {
          name: '農民',
          language: await this.getLanguagesByCode('ja-Kana'),
        },
        {
          name: 'Apoyo a la Agricultura',
          language: await this.getLanguagesByCode('es-ES'),
        },
        {
          name: 'Landwirtschaftliche Unterstützung',
          language: await this.getLanguagesByCode('de-DE'),
        },
        {
          name: '农业支持',
          language: await this.getLanguagesByCode('zh-CN'),
        },
        {
          name: "Supporto all'agricoltura",
          language: await this.getLanguagesByCode('it-IT'),
        },
        {
          name: "Soutien à l'agriculture",
          language: await this.getLanguagesByCode('fr-FR'),
        },
        {
          name: 'कृषि सहायता',
          language: await this.getLanguagesByCode('hi-IN'),
        },
      ],
    },
    {
      name: 'Refugee Aid',
      hex_color: '#8E44AD',
      translations: [
        {
          name: '難民',
          language: await this.getLanguagesByCode('ja-Kana'),
        },
        {
          name: 'Ayuda a Refugiados',
          language: await this.getLanguagesByCode('es-ES'),
        },
        {
          name: 'Flüchtlingshilfe',
          language: await this.getLanguagesByCode('de-DE'),
        },
        {
          name: '难民援助',
          language: await this.getLanguagesByCode('zh-CN'),
        },
        {
          name: 'Aiuto ai rifugiati',
          language: await this.getLanguagesByCode('it-IT'),
        },
        {
          name: 'Aide aux réfugiés',
          language: await this.getLanguagesByCode('fr-FR'),
        },
        {
          name: 'शरणार्थी सहायता',
          language: await this.getLanguagesByCode('hi-IN'),
        },
      ],
    },
    {
      name: "Women's Empowerment",
      hex_color: '#FF33A7',
      translations: [
        {
          name: '女性支援',
          language: await this.getLanguagesByCode('ja-Kana'),
        },
        {
          name: 'Empoderamiento de la Mujer',
          language: await this.getLanguagesByCode('es-ES'),
        },
        {
          name: 'Frauenförderung',
          language: await this.getLanguagesByCode('de-DE'),
        },
        {
          name: '妇女赋权',
          language: await this.getLanguagesByCode('zh-CN'),
        },
        {
          name: 'Empowerment delle donne',
          language: await this.getLanguagesByCode('it-IT'),
        },
        {
          name: 'Autonomisation des femmes',
          language: await this.getLanguagesByCode('fr-FR'),
        },
        {
          name: 'महिला सशक्तिकरण',
          language: await this.getLanguagesByCode('hi-IN'),
        },
      ],
    },
    {
      name: 'Community Education',
      hex_color: '#33A7FF',
      translations: [
        {
          name: '社会教育推進',
          language: await this.getLanguagesByCode('ja-Kana'),
        },
        {
          name: 'Educación Comunitaria',
          language: await this.getLanguagesByCode('es-ES'),
        },
        {
          name: 'Gemeinschaftsbildung',
          language: await this.getLanguagesByCode('de-DE'),
        },
        {
          name: '社区教育',
          language: await this.getLanguagesByCode('zh-CN'),
        },
        {
          name: 'Educazione comunitaria',
          language: await this.getLanguagesByCode('it-IT'),
        },
        {
          name: 'Éducation communautaire',
          language: await this.getLanguagesByCode('fr-FR'),
        },
        {
          name: 'सामुदायिक शिक्षा',
          language: await this.getLanguagesByCode('hi-IN'),
        },
      ],
    },
    {
      name: 'Health & Medical Care',
      hex_color: '#33FFF6',
      translations: [
        {
          name: '保険・医療増進',
          language: await this.getLanguagesByCode('ja-Kana'),
        },
        {
          name: 'Salud y Atención Médica',
          language: await this.getLanguagesByCode('es-ES'),
        },
        {
          name: 'Gesundheits- und medizinische Versorgung',
          language: await this.getLanguagesByCode('de-DE'),
        },
        {
          name: '健康与医疗护理',
          language: await this.getLanguagesByCode('zh-CN'),
        },
        {
          name: 'Assistenza sanitaria e medica',
          language: await this.getLanguagesByCode('it-IT'),
        },
        {
          name: 'Soins de santé et médicaux',
          language: await this.getLanguagesByCode('fr-FR'),
        },
        {
          name: 'स्वास्थ्य और चिकित्सा देखभाल',
          language: await this.getLanguagesByCode('hi-IN'),
        },
      ],
    },
    {
      name: 'Environmental Conservation',
      hex_color: '#83FF33',
      translations: [
        {
          name: '自然・環境保全',
          language: await this.getLanguagesByCode('ja-Kana'),
        },
        {
          name: 'Conservación Ambiental',
          language: await this.getLanguagesByCode('es-ES'),
        },
        {
          name: 'Umweltschutz',
          language: await this.getLanguagesByCode('de-DE'),
        },
        {
          name: '环境保护',
          language: await this.getLanguagesByCode('zh-CN'),
        },
        {
          name: 'Conservazione ambientale',
          language: await this.getLanguagesByCode('it-IT'),
        },
        {
          name: "Conservation de l'environnement",
          language: await this.getLanguagesByCode('fr-FR'),
        },
        {
          name: 'पर्यावरण संरक्षण',
          language: await this.getLanguagesByCode('hi-IN'),
        },
      ],
    },
    {
      name: 'Wildlife Conservation',
      hex_color: '#33FF75',
      translations: [
        {
          name: '動物保全',
          language: await this.getLanguagesByCode('ja-Kana'),
        },
        {
          name: 'Conservación de la Vida Silvestre',
          language: await this.getLanguagesByCode('es-ES'),
        },
        {
          name: 'Wildtierschutz',
          language: await this.getLanguagesByCode('de-DE'),
        },
        {
          name: '野生动物保护',
          language: await this.getLanguagesByCode('zh-CN'),
        },
        {
          name: 'Conservazione della fauna selvatica',
          language: await this.getLanguagesByCode('it-IT'),
        },
        {
          name: 'Conservation de la faune',
          language: await this.getLanguagesByCode('fr-FR'),
        },
        {
          name: 'वन्यजीव संरक्षण',
          language: await this.getLanguagesByCode('hi-IN'),
        },
      ],
    },
    {
      name: 'Disaster Relief',
      hex_color: '#FF3333',
      translations: [
        {
          name: '防災・被災地支援',
          language: await this.getLanguagesByCode('ja-Kana'),
        },
        {
          name: 'Ayuda en Desastres',
          language: await this.getLanguagesByCode('es-ES'),
        },
        {
          name: 'Katastrophenhilfe',
          language: await this.getLanguagesByCode('de-DE'),
        },
        {
          name: '灾害救援',
          language: await this.getLanguagesByCode('zh-CN'),
        },
        {
          name: 'Soccorso in caso di disastri',
          language: await this.getLanguagesByCode('it-IT'),
        },
        {
          name: 'Secours en cas de catastrophe',
          language: await this.getLanguagesByCode('fr-FR'),
        },
        {
          name: 'आपदा राहत',
          language: await this.getLanguagesByCode('hi-IN'),
        },
      ],
    },
    {
      name: 'Asia',
      hex_color: '#FFC750',
      translations: [
        {
          name: 'アジア',
          language: await this.getLanguagesByCode('ja-Kana'),
        },
        {
          name: 'Asia',
          language: await this.getLanguagesByCode('es-ES'),
        },
        {
          name: 'Asien',
          language: await this.getLanguagesByCode('de-DE'),
        },
        {
          name: '亚洲',
          language: await this.getLanguagesByCode('zh-CN'),
        },
        {
          name: 'Asia',
          language: await this.getLanguagesByCode('it-IT'),
        },
        {
          name: 'Asie',
          language: await this.getLanguagesByCode('fr-FR'),
        },
        {
          name: 'एशिया',
          language: await this.getLanguagesByCode('hi-IN'),
        },
      ],
    },
    {
      name: 'Middle East',
      hex_color: '#FEFF57',
      translations: [
        {
          name: '中東',
          language: await this.getLanguagesByCode('ja-Kana'),
        },
        {
          name: 'Medio Oriente',
          language: await this.getLanguagesByCode('es-ES'),
        },
        {
          name: 'Naher Osten',
          language: await this.getLanguagesByCode('de-DE'),
        },
        {
          name: '中东',
          language: await this.getLanguagesByCode('zh-CN'),
        },
        {
          name: 'Medio Oriente',
          language: await this.getLanguagesByCode('it-IT'),
        },
        {
          name: 'Moyen-Orient',
          language: await this.getLanguagesByCode('fr-FR'),
        },
        {
          name: 'मध्य पूर्व',
          language: await this.getLanguagesByCode('hi-IN'),
        },
      ],
    },
    {
      name: 'Africa',
      hex_color: '#00B900',
      translations: [
        {
          name: 'アフリカ',
          language: await this.getLanguagesByCode('ja-Kana'),
        },
        {
          name: 'África',
          language: await this.getLanguagesByCode('es-ES'),
        },
        {
          name: 'Afrika',
          language: await this.getLanguagesByCode('de-DE'),
        },
        {
          name: '非洲',
          language: await this.getLanguagesByCode('zh-CN'),
        },
        {
          name: 'Africa',
          language: await this.getLanguagesByCode('it-IT'),
        },
        {
          name: 'Afrique',
          language: await this.getLanguagesByCode('fr-FR'),
        },
        {
          name: 'अफ्रीका',
          language: await this.getLanguagesByCode('hi-IN'),
        },
      ],
    },
    {
      name: 'Europe',
      hex_color: '#1D8BFE',
      translations: [
        {
          name: 'ヨーロッパ',
          language: await this.getLanguagesByCode('ja-Kana'),
        },
        {
          name: 'Europa',
          language: await this.getLanguagesByCode('es-ES'),
        },
        {
          name: 'Europa',
          language: await this.getLanguagesByCode('de-DE'),
        },
        {
          name: '欧洲',
          language: await this.getLanguagesByCode('zh-CN'),
        },
        {
          name: 'Europa',
          language: await this.getLanguagesByCode('it-IT'),
        },
        {
          name: 'Europe',
          language: await this.getLanguagesByCode('fr-FR'),
        },
        {
          name: 'यूरोप',
          language: await this.getLanguagesByCode('hi-IN'),
        },
      ],
    },
    {
      name: 'North America',
      hex_color: '#FF5F3D',
      translations: [
        {
          name: '北アメリカ',
          language: await this.getLanguagesByCode('ja-Kana'),
        },
        {
          name: 'Norteamérica',
          language: await this.getLanguagesByCode('es-ES'),
        },
        {
          name: 'Nordamerika',
          language: await this.getLanguagesByCode('de-DE'),
        },
        {
          name: '北美',
          language: await this.getLanguagesByCode('zh-CN'),
        },
        {
          name: 'Nord America',
          language: await this.getLanguagesByCode('it-IT'),
        },
        {
          name: 'Amérique du Nord',
          language: await this.getLanguagesByCode('fr-FR'),
        },
        {
          name: 'उत्तर अमेरिका',
          language: await this.getLanguagesByCode('hi-IN'),
        },
      ],
    },
    {
      name: 'South America',
      hex_color: '#009F00',
      translations: [
        {
          name: '南アメリカ',
          language: await this.getLanguagesByCode('ja-Kana'),
        },
        {
          name: 'Sudamérica',
          language: await this.getLanguagesByCode('es-ES'),
        },
        {
          name: 'Südamerika',
          language: await this.getLanguagesByCode('de-DE'),
        },
        {
          name: '南美',
          language: await this.getLanguagesByCode('zh-CN'),
        },
        {
          name: 'Sud America',
          language: await this.getLanguagesByCode('it-IT'),
        },
        {
          name: 'Amérique du Sud',
          language: await this.getLanguagesByCode('fr-FR'),
        },
        {
          name: 'दक्षिण अमेरिका',
          language: await this.getLanguagesByCode('hi-IN'),
        },
      ],
    },
    {
      name: 'Oceania',
      hex_color: '#049EFE',
      translations: [
        {
          name: 'オセアニア',
          language: await this.getLanguagesByCode('ja-Kana'),
        },
        {
          name: 'Oceanía',
          language: await this.getLanguagesByCode('es-ES'),
        },
        {
          name: 'Ozeanien',
          language: await this.getLanguagesByCode('de-DE'),
        },
        {
          name: '大洋洲',
          language: await this.getLanguagesByCode('zh-CN'),
        },
        {
          name: 'Oceania',
          language: await this.getLanguagesByCode('it-IT'),
        },
        {
          name: 'Océanie',
          language: await this.getLanguagesByCode('fr-FR'),
        },
        {
          name: 'ओशिनिया',
          language: await this.getLanguagesByCode('hi-IN'),
        },
      ],
    },
    {
      name: 'Japan',
      hex_color: '#2E5AAC',
      translations: [
        {
          name: '日本',
          language: await this.getLanguagesByCode('ja-Kana'),
        },
        {
          name: 'Japón',
          language: await this.getLanguagesByCode('es-ES'),
        },
        {
          name: 'Japan',
          language: await this.getLanguagesByCode('de-DE'),
        },
        {
          name: '日本',
          language: await this.getLanguagesByCode('zh-CN'),
        },
        {
          name: 'Giappone',
          language: await this.getLanguagesByCode('it-IT'),
        },
        {
          name: 'Japon',
          language: await this.getLanguagesByCode('fr-FR'),
        },
        {
          name: 'जापान',
          language: await this.getLanguagesByCode('hi-IN'),
        },
      ],
    },
    {
      name: 'Afghanistan',
      hex_color: '#009900',
      translations: [
        {
          name: 'アフガニスタン',
          language: await this.getLanguagesByCode('ja-Kana'),
        },
        {
          name: 'Afganistán',
          language: await this.getLanguagesByCode('es-ES'),
        },
        {
          name: 'Afghanistan',
          language: await this.getLanguagesByCode('de-DE'),
        },
        {
          name: '阿富汗',
          language: await this.getLanguagesByCode('zh-CN'),
        },
        {
          name: 'Afghanistan',
          language: await this.getLanguagesByCode('it-IT'),
        },
        {
          name: 'Afghanistan',
          language: await this.getLanguagesByCode('fr-FR'),
        },
        {
          name: 'अफगानिस्तान',
          language: await this.getLanguagesByCode('hi-IN'),
        },
      ],
    },
    {
      name: 'Cambodia',
      hex_color: '#FFCD00',
      translations: [
        {
          name: 'カンボジア',
          language: await this.getLanguagesByCode('ja-Kana'),
        },
        {
          name: 'Camboya',
          language: await this.getLanguagesByCode('es-ES'),
        },
        {
          name: 'Kambodscha',
          language: await this.getLanguagesByCode('de-DE'),
        },
        {
          name: '柬埔寨',
          language: await this.getLanguagesByCode('zh-CN'),
        },
        {
          name: 'Cambogia',
          language: await this.getLanguagesByCode('it-IT'),
        },
        {
          name: 'Cambodge',
          language: await this.getLanguagesByCode('fr-FR'),
        },
        {
          name: 'कंबोडिया',
          language: await this.getLanguagesByCode('hi-IN'),
        },
      ],
    },
    {
      name: 'Thailand',
      hex_color: '#FF9933',
      translations: [
        {
          name: 'タイ',
          language: await this.getLanguagesByCode('ja-Kana'),
        },
        {
          name: 'Tailandia',
          language: await this.getLanguagesByCode('es-ES'),
        },
        {
          name: 'Thailand',
          language: await this.getLanguagesByCode('de-DE'),
        },
        {
          name: '泰国',
          language: await this.getLanguagesByCode('zh-CN'),
        },
        {
          name: 'Thailandia',
          language: await this.getLanguagesByCode('it-IT'),
        },
        {
          name: 'Thaïlande',
          language: await this.getLanguagesByCode('fr-FR'),
        },
        {
          name: 'थाईलैंड',
          language: await this.getLanguagesByCode('hi-IN'),
        },
      ],
    },
    {
      name: 'Nepal',
      hex_color: '#003893',
      translations: [
        {
          name: 'ネパール',
          language: await this.getLanguagesByCode('ja-Kana'),
        },
        {
          name: 'Nepal',
          language: await this.getLanguagesByCode('es-ES'),
        },
        {
          name: 'Nepal',
          language: await this.getLanguagesByCode('de-DE'),
        },
        {
          name: '尼泊尔',
          language: await this.getLanguagesByCode('zh-CN'),
        },
        {
          name: 'Nepal',
          language: await this.getLanguagesByCode('it-IT'),
        },
        {
          name: 'Népal',
          language: await this.getLanguagesByCode('fr-FR'),
        },
        {
          name: 'नेपाल',
          language: await this.getLanguagesByCode('hi-IN'),
        },
      ],
    },
    {
      name: 'Philippines',
      hex_color: '#0038A8',
      translations: [
        {
          name: 'フィリピン',
          language: await this.getLanguagesByCode('ja-Kana'),
        },
        {
          name: 'Filipinas',
          language: await this.getLanguagesByCode('es-ES'),
        },
        {
          name: 'Philippinen',
          language: await this.getLanguagesByCode('de-DE'),
        },
        {
          name: '菲律宾',
          language: await this.getLanguagesByCode('zh-CN'),
        },
        {
          name: 'Filippine',
          language: await this.getLanguagesByCode('it-IT'),
        },
        {
          name: 'Philippines',
          language: await this.getLanguagesByCode('fr-FR'),
        },
        {
          name: 'फिलिपींस',
          language: await this.getLanguagesByCode('hi-IN'),
        },
      ],
    },
    {
      name: 'Vietnam',
      hex_color: '#DA251D',
      translations: [
        {
          name: 'ベトナム',
          language: await this.getLanguagesByCode('ja-Kana'),
        },
        {
          name: 'Vietnam',
          language: await this.getLanguagesByCode('es-ES'),
        },
        {
          name: 'Vietnam',
          language: await this.getLanguagesByCode('de-DE'),
        },
        {
          name: '越南',
          language: await this.getLanguagesByCode('zh-CN'),
        },
        {
          name: 'Vietnam',
          language: await this.getLanguagesByCode('it-IT'),
        },
        {
          name: 'Viêt Nam',
          language: await this.getLanguagesByCode('fr-FR'),
        },
        {
          name: 'वियतनाम',
          language: await this.getLanguagesByCode('hi-IN'),
        },
      ],
    },
    {
      name: 'Myanmar',
      hex_color: '#FECB00',
      translations: [
        {
          name: 'ミャンマー',
          language: await this.getLanguagesByCode('ja-Kana'),
        },
        {
          name: 'Myanmar',
          language: await this.getLanguagesByCode('es-ES'),
        },
        {
          name: 'Myanmar',
          language: await this.getLanguagesByCode('de-DE'),
        },
        {
          name: '缅甸',
          language: await this.getLanguagesByCode('zh-CN'),
        },
        {
          name: 'Myanmar',
          language: await this.getLanguagesByCode('it-IT'),
        },
        {
          name: 'Myanmar',
          language: await this.getLanguagesByCode('fr-FR'),
        },
        {
          name: 'म्यांमार',
          language: await this.getLanguagesByCode('hi-IN'),
        },
      ],
    },
    {
      name: 'Laos',
      hex_color: '#CE1126',
      translations: [
        {
          name: 'ラオス',
          language: await this.getLanguagesByCode('ja-Kana'),
        },
        {
          name: 'Laos',
          language: await this.getLanguagesByCode('es-ES'),
        },
        {
          name: 'Laos',
          language: await this.getLanguagesByCode('de-DE'),
        },
        {
          name: '老挝',
          language: await this.getLanguagesByCode('zh-CN'),
        },
        {
          name: 'Laos',
          language: await this.getLanguagesByCode('it-IT'),
        },
        {
          name: 'Laos',
          language: await this.getLanguagesByCode('fr-FR'),
        },
        {
          name: 'लाओस',
          language: await this.getLanguagesByCode('hi-IN'),
        },
      ],
    },
    {
      name: 'Indonesia',
      hex_color: '#D21034',
      translations: [
        {
          name: 'インドネシア',
          language: await this.getLanguagesByCode('ja-Kana'),
        },
        {
          name: 'Indonesia',
          language: await this.getLanguagesByCode('es-ES'),
        },
        {
          name: 'Indonesien',
          language: await this.getLanguagesByCode('de-DE'),
        },
        {
          name: '印尼',
          language: await this.getLanguagesByCode('zh-CN'),
        },
        {
          name: 'Indonesia',
          language: await this.getLanguagesByCode('it-IT'),
        },
        {
          name: 'Indonésie',
          language: await this.getLanguagesByCode('fr-FR'),
        },
        {
          name: 'इंडोनेशिया',
          language: await this.getLanguagesByCode('hi-IN'),
        },
      ],
    },
    {
      name: 'Burkina Faso',
      hex_color: '#009E49',
      translations: [
        {
          name: 'ブルキナファソ',
          language: await this.getLanguagesByCode('ja-Kana'),
        },
        {
          name: 'Burkina Faso',
          language: await this.getLanguagesByCode('es-ES'),
        },
        {
          name: 'Burkina Faso',
          language: await this.getLanguagesByCode('de-DE'),
        },
        {
          name: '布基纳法索',
          language: await this.getLanguagesByCode('zh-CN'),
        },
        {
          name: 'Burkina Faso',
          language: await this.getLanguagesByCode('it-IT'),
        },
        {
          name: 'Burkina Faso',
          language: await this.getLanguagesByCode('fr-FR'),
        },
        {
          name: 'बुर्किना फासो',
          language: await this.getLanguagesByCode('hi-IN'),
        },
      ],
    },
    {
      name: 'Brazil',
      hex_color: '#009C3B',
      translations: [
        {
          name: 'ブラジル',
          language: await this.getLanguagesByCode('ja-Kana'),
        },
        {
          name: 'Brasil',
          language: await this.getLanguagesByCode('es-ES'),
        },
        {
          name: 'Brasilien',
          language: await this.getLanguagesByCode('de-DE'),
        },
        {
          name: '巴西',
          language: await this.getLanguagesByCode('zh-CN'),
        },
        {
          name: 'Brasile',
          language: await this.getLanguagesByCode('it-IT'),
        },
        {
          name: 'Brésil',
          language: await this.getLanguagesByCode('fr-FR'),
        },
        {
          name: 'ब्राज़ील',
          language: await this.getLanguagesByCode('hi-IN'),
        },
      ],
    },
    {
      name: 'USA',
      hex_color: '#B22234',
      translations: [
        {
          name: '米国',
          language: await this.getLanguagesByCode('ja-Kana'),
        },
        {
          name: 'EE. UU.',
          language: await this.getLanguagesByCode('es-ES'),
        },
        {
          name: 'USA',
          language: await this.getLanguagesByCode('de-DE'),
        },
        {
          name: '美国',
          language: await this.getLanguagesByCode('zh-CN'),
        },
        {
          name: 'Stati Uniti',
          language: await this.getLanguagesByCode('it-IT'),
        },
        {
          name: 'États-Unis',
          language: await this.getLanguagesByCode('fr-FR'),
        },
        {
          name: 'अमेरिका',
          language: await this.getLanguagesByCode('hi-IN'),
        },
      ],
    },
    {
      name: 'China',
      hex_color: '#DE2910',
      translations: [
        {
          name: '中国',
          language: await this.getLanguagesByCode('ja-Kana'),
        },
        {
          name: 'China',
          language: await this.getLanguagesByCode('es-ES'),
        },
        {
          name: 'China',
          language: await this.getLanguagesByCode('de-DE'),
        },
        {
          name: '中国',
          language: await this.getLanguagesByCode('zh-CN'),
        },
        {
          name: 'Cina',
          language: await this.getLanguagesByCode('it-IT'),
        },
        {
          name: 'Chine',
          language: await this.getLanguagesByCode('fr-FR'),
        },
        {
          name: 'चीन',
          language: await this.getLanguagesByCode('hi-IN'),
        },
      ],
    },
    {
      name: 'Hong Kong',
      hex_color: '#EF3340',
      translations: [
        {
          name: '香港',
          language: await this.getLanguagesByCode('ja-Kana'),
        },
        {
          name: 'Hong Kong',
          language: await this.getLanguagesByCode('es-ES'),
        },
        {
          name: 'Hongkong',
          language: await this.getLanguagesByCode('de-DE'),
        },
        {
          name: '香港',
          language: await this.getLanguagesByCode('zh-CN'),
        },
        {
          name: 'Hong Kong',
          language: await this.getLanguagesByCode('it-IT'),
        },
        {
          name: 'Hong Kong',
          language: await this.getLanguagesByCode('fr-FR'),
        },
        {
          name: 'हांग कांग',
          language: await this.getLanguagesByCode('hi-IN'),
        },
      ],
    },
    {
      name: 'Taiwan',
      hex_color: '#FE0000',
      translations: [
        {
          name: '台湾',
          language: await this.getLanguagesByCode('ja-Kana'),
        },
        {
          name: 'Taiwán',
          language: await this.getLanguagesByCode('es-ES'),
        },
        {
          name: 'Taiwan',
          language: await this.getLanguagesByCode('de-DE'),
        },
        {
          name: '台湾',
          language: await this.getLanguagesByCode('zh-CN'),
        },
        {
          name: 'Taiwan',
          language: await this.getLanguagesByCode('it-IT'),
        },
        {
          name: 'Taïwan',
          language: await this.getLanguagesByCode('fr-FR'),
        },
        {
          name: 'ताइवान',
          language: await this.getLanguagesByCode('hi-IN'),
        },
      ],
    },
    {
      name: 'Mongolia',
      hex_color: '#C4272F',
      translations: [
        {
          name: 'モンゴル',
          language: await this.getLanguagesByCode('ja-Kana'),
        },
        {
          name: 'Mongolia',
          language: await this.getLanguagesByCode('es-ES'),
        },
        {
          name: 'Mongolei',
          language: await this.getLanguagesByCode('de-DE'),
        },
        {
          name: '蒙古',
          language: await this.getLanguagesByCode('zh-CN'),
        },
        {
          name: 'Mongolia',
          language: await this.getLanguagesByCode('it-IT'),
        },
        {
          name: 'Mongolie',
          language: await this.getLanguagesByCode('fr-FR'),
        },
        {
          name: 'मंगोलिया',
          language: await this.getLanguagesByCode('hi-IN'),
        },
      ],
    },
    {
      name: 'India',
      hex_color: '#FF9933',
      translations: [
        {
          name: 'インド',
          language: await this.getLanguagesByCode('ja-Kana'),
        },
        {
          name: 'India',
          language: await this.getLanguagesByCode('es-ES'),
        },
        {
          name: 'Indien',
          language: await this.getLanguagesByCode('de-DE'),
        },
        {
          name: '印度',
          language: await this.getLanguagesByCode('zh-CN'),
        },
        {
          name: 'India',
          language: await this.getLanguagesByCode('it-IT'),
        },
        {
          name: 'Inde',
          language: await this.getLanguagesByCode('fr-FR'),
        },
        {
          name: 'भारत',
          language: await this.getLanguagesByCode('hi-IN'),
        },
      ],
    },
    {
      name: 'Canada',
      hex_color: '#FF0000',
      translations: [
        {
          name: 'カナダ',
          language: await this.getLanguagesByCode('ja-Kana'),
        },
        {
          name: 'Canadá',
          language: await this.getLanguagesByCode('es-ES'),
        },
        {
          name: 'Kanada',
          language: await this.getLanguagesByCode('de-DE'),
        },
        {
          name: '加拿大',
          language: await this.getLanguagesByCode('zh-CN'),
        },
        {
          name: 'Canada',
          language: await this.getLanguagesByCode('it-IT'),
        },
        {
          name: 'Canada',
          language: await this.getLanguagesByCode('fr-FR'),
        },
        {
          name: 'कनाडा',
          language: await this.getLanguagesByCode('hi-IN'),
        },
      ],
    },
    {
      name: 'Ukraine',
      hex_color: '#FFD700',
      translations: [
        {
          name: 'ウクライナ',
          language: await this.getLanguagesByCode('ja-Kana'),
        },
        {
          name: 'Ucrania',
          language: await this.getLanguagesByCode('es-ES'),
        },
        {
          name: 'Ukraine',
          language: await this.getLanguagesByCode('de-DE'),
        },
        {
          name: '乌克兰',
          language: await this.getLanguagesByCode('zh-CN'),
        },
        {
          name: 'Ucraina',
          language: await this.getLanguagesByCode('it-IT'),
        },
        {
          name: 'Ukraine',
          language: await this.getLanguagesByCode('fr-FR'),
        },
        {
          name: 'यूक्रेन',
          language: await this.getLanguagesByCode('hi-IN'),
        },
      ],
    },
    {
      name: 'Kyrgyzstan',
      hex_color: '#009900',
      translations: [
        {
          name: 'キルギス',
          language: await this.getLanguagesByCode('ja-Kana'),
        },
        {
          name: 'Kirguistán',
          language: await this.getLanguagesByCode('es-ES'),
        },
        {
          name: 'Kirgisistan',
          language: await this.getLanguagesByCode('de-DE'),
        },
        {
          name: '吉尔吉斯斯坦',
          language: await this.getLanguagesByCode('zh-CN'),
        },
        {
          name: 'Kirghizistan',
          language: await this.getLanguagesByCode('it-IT'),
        },
        {
          name: 'Kirghizistan',
          language: await this.getLanguagesByCode('fr-FR'),
        },
        {
          name: 'किर्गिज़स्तान',
          language: await this.getLanguagesByCode('hi-IN'),
        },
      ],
    },
    {
      name: 'France',
      hex_color: '#002395',
      translations: [
        {
          name: 'フランス',
          language: await this.getLanguagesByCode('ja-Kana'),
        },
        {
          name: 'Francia',
          language: await this.getLanguagesByCode('es-ES'),
        },
        {
          name: 'Frankreich',
          language: await this.getLanguagesByCode('de-DE'),
        },
        {
          name: '法国',
          language: await this.getLanguagesByCode('zh-CN'),
        },
        {
          name: 'Francia',
          language: await this.getLanguagesByCode('it-IT'),
        },
        {
          name: 'France',
          language: await this.getLanguagesByCode('fr-FR'),
        },
        {
          name: 'फ्रांस',
          language: await this.getLanguagesByCode('hi-IN'),
        },
      ],
    },
    {
      name: 'Singapore',
      hex_color: '#ED2939',
      translations: [
        {
          name: 'シンガポール',
          language: await this.getLanguagesByCode('ja-Kana'),
        },
        {
          name: 'Singapur',
          language: await this.getLanguagesByCode('es-ES'),
        },
        {
          name: 'Singapur',
          language: await this.getLanguagesByCode('de-DE'),
        },
        {
          name: '新加坡',
          language: await this.getLanguagesByCode('zh-CN'),
        },
        {
          name: 'Singapore',
          language: await this.getLanguagesByCode('it-IT'),
        },
        {
          name: 'Singapour',
          language: await this.getLanguagesByCode('fr-FR'),
        },
        {
          name: 'सिंगापुर',
          language: await this.getLanguagesByCode('hi-IN'),
        },
      ],
    },
    {
      name: 'South Korea',
      hex_color: '#CD2E3A',
      translations: [
        {
          name: '韓国',
          language: await this.getLanguagesByCode('ja-Kana'),
        },
        {
          name: 'Corea del Sur',
          language: await this.getLanguagesByCode('es-ES'),
        },
        {
          name: 'Südkorea',
          language: await this.getLanguagesByCode('de-DE'),
        },
        {
          name: '韩国',
          language: await this.getLanguagesByCode('zh-CN'),
        },
        {
          name: 'Corea del Sud',
          language: await this.getLanguagesByCode('it-IT'),
        },
        {
          name: 'Corée du Sud',
          language: await this.getLanguagesByCode('fr-FR'),
        },
        {
          name: 'दक्षिण कोरिया',
          language: await this.getLanguagesByCode('hi-IN'),
        },
      ],
    },
    {
      name: 'Russia',
      hex_color: '#D52B1E',
      translations: [
        {
          name: 'ロシア',
          language: await this.getLanguagesByCode('ja-Kana'),
        },
        {
          name: 'Rusia',
          language: await this.getLanguagesByCode('es-ES'),
        },
        {
          name: 'Russland',
          language: await this.getLanguagesByCode('de-DE'),
        },
        {
          name: '俄罗斯',
          language: await this.getLanguagesByCode('zh-CN'),
        },
        {
          name: 'Russia',
          language: await this.getLanguagesByCode('it-IT'),
        },
        {
          name: 'Russie',
          language: await this.getLanguagesByCode('fr-FR'),
        },
        {
          name: 'रूस',
          language: await this.getLanguagesByCode('hi-IN'),
        },
      ],
    },
    {
      name: 'Colombia',
      hex_color: '#FCD116',
      translations: [
        {
          name: 'コロンビア',
          language: await this.getLanguagesByCode('ja-Kana'),
        },
        {
          name: 'Colombia',
          language: await this.getLanguagesByCode('es-ES'),
        },
        {
          name: 'Kolumbien',
          language: await this.getLanguagesByCode('de-DE'),
        },
        {
          name: '哥伦比亚',
          language: await this.getLanguagesByCode('zh-CN'),
        },
        {
          name: 'Colombia',
          language: await this.getLanguagesByCode('it-IT'),
        },
        {
          name: 'Colombie',
          language: await this.getLanguagesByCode('fr-FR'),
        },
        {
          name: 'कोलंबिया',
          language: await this.getLanguagesByCode('hi-IN'),
        },
      ],
    },
    {
      name: 'Uzbekistan',
      hex_color: '#1EB53A',
      translations: [
        {
          name: 'ウズベキスタン',
          language: await this.getLanguagesByCode('ja-Kana'),
        },
        {
          name: 'Uzbekistán',
          language: await this.getLanguagesByCode('es-ES'),
        },
        {
          name: 'Usbekistan',
          language: await this.getLanguagesByCode('de-DE'),
        },
        {
          name: '乌兹别克斯坦',
          language: await this.getLanguagesByCode('zh-CN'),
        },
        {
          name: 'Uzbekistan',
          language: await this.getLanguagesByCode('it-IT'),
        },
        {
          name: 'Ouzbékistan',
          language: await this.getLanguagesByCode('fr-FR'),
        },
        {
          name: 'उज़्बेकिस्तान',
          language: await this.getLanguagesByCode('hi-IN'),
        },
      ],
    },
    {
      name: 'Iran',
      hex_color: '#DA0000',
      translations: [
        {
          name: 'イラン',
          language: await this.getLanguagesByCode('ja-Kana'),
        },
        {
          name: 'Irán',
          language: await this.getLanguagesByCode('es-ES'),
        },
        {
          name: 'Iran',
          language: await this.getLanguagesByCode('de-DE'),
        },
        {
          name: '伊朗',
          language: await this.getLanguagesByCode('zh-CN'),
        },
        {
          name: 'Iran',
          language: await this.getLanguagesByCode('it-IT'),
        },
        {
          name: 'Iran',
          language: await this.getLanguagesByCode('fr-FR'),
        },
        {
          name: 'ईरान',
          language: await this.getLanguagesByCode('hi-IN'),
        },
      ],
    },
    {
      name: 'Netherlands',
      hex_color: '#FF6100',
      translations: [
        {
          name: 'オランダ',
          language: await this.getLanguagesByCode('ja-Kana'),
        },
        {
          name: 'Países Bajos',
          language: await this.getLanguagesByCode('es-ES'),
        },
        {
          name: 'Niederlande',
          language: await this.getLanguagesByCode('de-DE'),
        },
        {
          name: '荷兰',
          language: await this.getLanguagesByCode('zh-CN'),
        },
        {
          name: 'Paesi Bassi',
          language: await this.getLanguagesByCode('it-IT'),
        },
        {
          name: 'Pays-Bas',
          language: await this.getLanguagesByCode('fr-FR'),
        },
        {
          name: 'नीदरलैंड',
          language: await this.getLanguagesByCode('hi-IN'),
        },
      ],
    },
    {
      name: 'Denmark',
      hex_color: '#C60C30',
      translations: [
        {
          name: 'デンマーク',
          language: await this.getLanguagesByCode('ja-Kana'),
        },
        {
          name: 'Dinamarca',
          language: await this.getLanguagesByCode('es-ES'),
        },
        {
          name: 'Dänemark',
          language: await this.getLanguagesByCode('de-DE'),
        },
        {
          name: '丹麦',
          language: await this.getLanguagesByCode('zh-CN'),
        },
        {
          name: 'Danimarca',
          language: await this.getLanguagesByCode('it-IT'),
        },
        {
          name: 'Danemark',
          language: await this.getLanguagesByCode('fr-FR'),
        },
        {
          name: 'डेनमार्क',
          language: await this.getLanguagesByCode('hi-IN'),
        },
      ],
    },
    {
      name: 'Lithuania',
      hex_color: '#006A44',
      translations: [
        {
          name: 'リトアニア',
          language: await this.getLanguagesByCode('ja-Kana'),
        },
        {
          name: 'Lituania',
          language: await this.getLanguagesByCode('es-ES'),
        },
        {
          name: 'Litauen',
          language: await this.getLanguagesByCode('de-DE'),
        },
        {
          name: '立陶宛',
          language: await this.getLanguagesByCode('zh-CN'),
        },
        {
          name: 'Lituania',
          language: await this.getLanguagesByCode('it-IT'),
        },
        {
          name: 'Lituanie',
          language: await this.getLanguagesByCode('fr-FR'),
        },
        {
          name: 'लिथुआनिया',
          language: await this.getLanguagesByCode('hi-IN'),
        },
      ],
    },
    {
      name: 'Venezuela',
      hex_color: '#CF142B',
      translations: [
        {
          name: 'ベネズエラ',
          language: await this.getLanguagesByCode('ja-Kana'),
        },
        {
          name: 'Venezuela',
          language: await this.getLanguagesByCode('es-ES'),
        },
        {
          name: 'Venezuela',
          language: await this.getLanguagesByCode('de-DE'),
        },
        {
          name: '委内瑞拉',
          language: await this.getLanguagesByCode('zh-CN'),
        },
        {
          name: 'Venezuela',
          language: await this.getLanguagesByCode('it-IT'),
        },
        {
          name: 'Venezuela',
          language: await this.getLanguagesByCode('fr-FR'),
        },
        {
          name: 'वेनेज़ुएला',
          language: await this.getLanguagesByCode('hi-IN'),
        },
      ],
    },
    {
      name: 'Malaysia',
      hex_color: '#010066',
      translations: [
        {
          name: 'マレーシア',
          language: await this.getLanguagesByCode('ja-Kana'),
        },
        {
          name: 'Malasia',
          language: await this.getLanguagesByCode('es-ES'),
        },
        {
          name: 'Malaysia',
          language: await this.getLanguagesByCode('de-DE'),
        },
        {
          name: '马来西亚',
          language: await this.getLanguagesByCode('zh-CN'),
        },
        {
          name: 'Malesia',
          language: await this.getLanguagesByCode('it-IT'),
        },
        {
          name: 'Malaisie',
          language: await this.getLanguagesByCode('fr-FR'),
        },
        {
          name: 'मलेशिया',
          language: await this.getLanguagesByCode('hi-IN'),
        },
      ],
    },
    {
      name: 'South Africa',
      hex_color: '#007A4D',
      translations: [
        {
          name: '南アフリカ',
          language: await this.getLanguagesByCode('ja-Kana'),
        },
        {
          name: 'Sudáfrica',
          language: await this.getLanguagesByCode('es-ES'),
        },
        {
          name: 'Südafrika',
          language: await this.getLanguagesByCode('de-DE'),
        },
        {
          name: '南非',
          language: await this.getLanguagesByCode('zh-CN'),
        },
        {
          name: 'Sud Africa',
          language: await this.getLanguagesByCode('it-IT'),
        },
        {
          name: 'Afrique du Sud',
          language: await this.getLanguagesByCode('fr-FR'),
        },
        {
          name: 'दक्षिण अफ्रीका',
          language: await this.getLanguagesByCode('hi-IN'),
        },
      ],
    },
    {
      name: 'Pakistan',
      hex_color: '#01411C',
      translations: [
        {
          name: 'パキスタン',
          language: await this.getLanguagesByCode('ja-Kana'),
        },
        {
          name: 'Pakistán',
          language: await this.getLanguagesByCode('es-ES'),
        },
        {
          name: 'Pakistan',
          language: await this.getLanguagesByCode('de-DE'),
        },
        {
          name: '巴基斯坦',
          language: await this.getLanguagesByCode('zh-CN'),
        },
        {
          name: 'Pakistan',
          language: await this.getLanguagesByCode('it-IT'),
        },
        {
          name: 'Pakistan',
          language: await this.getLanguagesByCode('fr-FR'),
        },
        {
          name: 'पाकिस्तान',
          language: await this.getLanguagesByCode('hi-IN'),
        },
      ],
    },
    {
      name: 'Finland',
      hex_color: '#003580',
      translations: [
        {
          name: 'フィンランド',
          language: await this.getLanguagesByCode('ja-Kana'),
        },
        {
          name: 'Finlandia',
          language: await this.getLanguagesByCode('es-ES'),
        },
        {
          name: 'Finnland',
          language: await this.getLanguagesByCode('de-DE'),
        },
        {
          name: '芬兰',
          language: await this.getLanguagesByCode('zh-CN'),
        },
        {
          name: 'Finlandia',
          language: await this.getLanguagesByCode('it-IT'),
        },
        {
          name: 'Finlande',
          language: await this.getLanguagesByCode('fr-FR'),
        },
        {
          name: 'फिनलैंड',
          language: await this.getLanguagesByCode('hi-IN'),
        },
      ],
    },
    {
      name: 'Israel',
      hex_color: '#0051BA',
      translations: [
        {
          name: 'イスラエル',
          language: await this.getLanguagesByCode('ja-Kana'),
        },
        {
          name: 'Israel',
          language: await this.getLanguagesByCode('es-ES'),
        },
        {
          name: 'Israel',
          language: await this.getLanguagesByCode('de-DE'),
        },
        {
          name: '以色列',
          language: await this.getLanguagesByCode('zh-CN'),
        },
        {
          name: 'Israele',
          language: await this.getLanguagesByCode('it-IT'),
        },
        {
          name: 'Israël',
          language: await this.getLanguagesByCode('fr-FR'),
        },
        {
          name: 'इज़राइल',
          language: await this.getLanguagesByCode('hi-IN'),
        },
      ],
    },
    {
      name: 'Mexico',
      hex_color: '#006847',
      translations: [
        {
          name: 'メキシコ',
          language: await this.getLanguagesByCode('ja-Kana'),
        },
        {
          name: 'México',
          language: await this.getLanguagesByCode('es-ES'),
        },
        {
          name: 'Mexiko',
          language: await this.getLanguagesByCode('de-DE'),
        },
        {
          name: '墨西哥',
          language: await this.getLanguagesByCode('zh-CN'),
        },
        {
          name: 'Messico',
          language: await this.getLanguagesByCode('it-IT'),
        },
        {
          name: 'Mexique',
          language: await this.getLanguagesByCode('fr-FR'),
        },
        {
          name: 'मेक्सिको',
          language: await this.getLanguagesByCode('hi-IN'),
        },
      ],
    },
    {
      name: 'UK',
      hex_color: '#CF142B',
      translations: [
        {
          name: '英国',
          language: await this.getLanguagesByCode('ja-Kana'),
        },
        {
          name: 'Reino Unido',
          language: await this.getLanguagesByCode('es-ES'),
        },
        {
          name: 'Vereinigtes Königreich',
          language: await this.getLanguagesByCode('de-DE'),
        },
        {
          name: '英国',
          language: await this.getLanguagesByCode('zh-CN'),
        },
        {
          name: 'Regno Unito',
          language: await this.getLanguagesByCode('it-IT'),
        },
        {
          name: 'Royaume-Uni',
          language: await this.getLanguagesByCode('fr-FR'),
        },
        {
          name: 'यूके',
          language: await this.getLanguagesByCode('hi-IN'),
        },
      ],
    },
    {
      name: 'Bangladesh',
      hex_color: '#006A4E',
      translations: [
        {
          name: 'バングラデシュ',
          language: await this.getLanguagesByCode('ja-Kana'),
        },
        {
          name: 'Bangladés',
          language: await this.getLanguagesByCode('es-ES'),
        },
        {
          name: 'Bangladesch',
          language: await this.getLanguagesByCode('de-DE'),
        },
        {
          name: '孟加拉国',
          language: await this.getLanguagesByCode('zh-CN'),
        },
        {
          name: 'Bangladesh',
          language: await this.getLanguagesByCode('it-IT'),
        },
        {
          name: 'Bangladesh',
          language: await this.getLanguagesByCode('fr-FR'),
        },
        {
          name: 'बांग्लादेश',
          language: await this.getLanguagesByCode('hi-IN'),
        },
      ],
    },
    {
      name: 'Turkey',
      hex_color: '#E30A17',
      translations: [
        {
          name: 'トルコ',
          language: await this.getLanguagesByCode('ja-Kana'),
        },
        {
          name: 'Turquía',
          language: await this.getLanguagesByCode('es-ES'),
        },
        {
          name: 'Türkei',
          language: await this.getLanguagesByCode('de-DE'),
        },
        {
          name: '土耳其',
          language: await this.getLanguagesByCode('zh-CN'),
        },
        {
          name: 'Turchia',
          language: await this.getLanguagesByCode('it-IT'),
        },
        {
          name: 'Turquie',
          language: await this.getLanguagesByCode('fr-FR'),
        },
        {
          name: 'तुर्की',
          language: await this.getLanguagesByCode('hi-IN'),
        },
      ],
    },
    {
      name: 'Uruguay',
      hex_color: '#FCD116',
      translations: [
        {
          name: 'ウルグアイ',
          language: await this.getLanguagesByCode('ja-Kana'),
        },
        {
          name: 'Uruguay',
          language: await this.getLanguagesByCode('es-ES'),
        },
        {
          name: 'Uruguay',
          language: await this.getLanguagesByCode('de-DE'),
        },
        {
          name: '乌拉圭',
          language: await this.getLanguagesByCode('zh-CN'),
        },
        {
          name: 'Uruguay',
          language: await this.getLanguagesByCode('it-IT'),
        },
        {
          name: 'Uruguay',
          language: await this.getLanguagesByCode('fr-FR'),
        },
        {
          name: 'उरुग्वे',
          language: await this.getLanguagesByCode('hi-IN'),
        },
      ],
    },
    {
      name: 'Hungary',
      hex_color: '#436F4D',
      translations: [
        {
          name: 'ハンガリー',
          language: await this.getLanguagesByCode('ja-Kana'),
        },
        {
          name: 'Hungría',
          language: await this.getLanguagesByCode('es-ES'),
        },
        {
          name: 'Ungarn',
          language: await this.getLanguagesByCode('de-DE'),
        },
        {
          name: '匈牙利',
          language: await this.getLanguagesByCode('zh-CN'),
        },
        {
          name: 'Ungheria',
          language: await this.getLanguagesByCode('it-IT'),
        },
        {
          name: 'Hongrie',
          language: await this.getLanguagesByCode('fr-FR'),
        },
        {
          name: 'हंगरी',
          language: await this.getLanguagesByCode('hi-IN'),
        },
      ],
    },
    {
      name: 'Sweden',
      hex_color: '#FECC00',
      translations: [
        {
          name: 'スウェーデン',
          language: await this.getLanguagesByCode('ja-Kana'),
        },
        {
          name: 'Suecia',
          language: await this.getLanguagesByCode('es-ES'),
        },
        {
          name: 'Schweden',
          language: await this.getLanguagesByCode('de-DE'),
        },
        {
          name: '瑞典',
          language: await this.getLanguagesByCode('zh-CN'),
        },
        {
          name: 'Svezia',
          language: await this.getLanguagesByCode('it-IT'),
        },
        {
          name: 'Suède',
          language: await this.getLanguagesByCode('fr-FR'),
        },
        {
          name: 'स्वीडन',
          language: await this.getLanguagesByCode('hi-IN'),
        },
      ],
    },
    {
      name: 'Slovakia',
      hex_color: '#0B4EA2',
      translations: [
        {
          name: 'スロバキア',
          language: await this.getLanguagesByCode('ja-Kana'),
        },
        {
          name: 'Eslovaquia',
          language: await this.getLanguagesByCode('es-ES'),
        },
        {
          name: 'Slowakei',
          language: await this.getLanguagesByCode('de-DE'),
        },
        {
          name: '斯洛伐克',
          language: await this.getLanguagesByCode('zh-CN'),
        },
        {
          name: 'Slovacchia',
          language: await this.getLanguagesByCode('it-IT'),
        },
        {
          name: 'Slovaquie',
          language: await this.getLanguagesByCode('fr-FR'),
        },
        {
          name: 'स्लोवाकिया',
          language: await this.getLanguagesByCode('hi-IN'),
        },
      ],
    },
    {
      name: 'Guatemala',
      hex_color: '#4997D0',
      translations: [
        {
          name: 'グアテマラ',
          language: await this.getLanguagesByCode('ja-Kana'),
        },
        {
          name: 'Guatemala',
          language: await this.getLanguagesByCode('es-ES'),
        },
        {
          name: 'Guatemala',
          language: await this.getLanguagesByCode('de-DE'),
        },
        {
          name: '危地马拉',
          language: await this.getLanguagesByCode('zh-CN'),
        },
        {
          name: 'Guatemala',
          language: await this.getLanguagesByCode('it-IT'),
        },
        {
          name: 'Guatemala',
          language: await this.getLanguagesByCode('fr-FR'),
        },
        {
          name: 'ग्वाटेमाला',
          language: await this.getLanguagesByCode('hi-IN'),
        },
      ],
    },
    {
      name: 'Tanzania',
      hex_color: '#1EB53A',
      translations: [
        {
          name: 'タンザニア',
          language: await this.getLanguagesByCode('ja-Kana'),
        },
        {
          name: 'Tanzania',
          language: await this.getLanguagesByCode('es-ES'),
        },
        {
          name: 'Tansania',
          language: await this.getLanguagesByCode('de-DE'),
        },
        {
          name: '坦桑尼亚',
          language: await this.getLanguagesByCode('zh-CN'),
        },
        {
          name: 'Tanzania',
          language: await this.getLanguagesByCode('it-IT'),
        },
        {
          name: 'Tanzanie',
          language: await this.getLanguagesByCode('fr-FR'),
        },
        {
          name: 'तंज़ानिया',
          language: await this.getLanguagesByCode('hi-IN'),
        },
      ],
    },
    {
      name: 'Kazakhstan',
      hex_color: '#00AFCA',
      translations: [
        {
          name: 'カザフスタン',
          language: await this.getLanguagesByCode('ja-Kana'),
        },
        {
          name: 'Kazajistán',
          language: await this.getLanguagesByCode('es-ES'),
        },
        {
          name: 'Kasachstan',
          language: await this.getLanguagesByCode('de-DE'),
        },
        {
          name: '哈萨克斯坦',
          language: await this.getLanguagesByCode('zh-CN'),
        },
        {
          name: 'Kazakistan',
          language: await this.getLanguagesByCode('it-IT'),
        },
        {
          name: 'Kazakhstan',
          language: await this.getLanguagesByCode('fr-FR'),
        },
        {
          name: 'कज़ाखस्तान',
          language: await this.getLanguagesByCode('hi-IN'),
        },
      ],
    },
    {
      name: 'Portugal',
      hex_color: '#006600',
      translations: [
        {
          name: 'ポルトガル',
          language: await this.getLanguagesByCode('ja-Kana'),
        },
        {
          name: 'Portugal',
          language: await this.getLanguagesByCode('es-ES'),
        },
        {
          name: 'Portugal',
          language: await this.getLanguagesByCode('de-DE'),
        },
        {
          name: '葡萄牙',
          language: await this.getLanguagesByCode('zh-CN'),
        },
        {
          name: 'Portogallo',
          language: await this.getLanguagesByCode('it-IT'),
        },
        {
          name: 'Portugal',
          language: await this.getLanguagesByCode('fr-FR'),
        },
        {
          name: 'पुर्तगाल',
          language: await this.getLanguagesByCode('hi-IN'),
        },
      ],
    },
    {
      name: 'Australia',
      hex_color: '#003F87',
      translations: [
        {
          name: 'オーストラリア',
          language: await this.getLanguagesByCode('ja-Kana'),
        },
        {
          name: 'Australia',
          language: await this.getLanguagesByCode('es-ES'),
        },
        {
          name: 'Australien',
          language: await this.getLanguagesByCode('de-DE'),
        },
        {
          name: '澳大利亚',
          language: await this.getLanguagesByCode('zh-CN'),
        },
        {
          name: 'Australia',
          language: await this.getLanguagesByCode('it-IT'),
        },
        {
          name: 'Australie',
          language: await this.getLanguagesByCode('fr-FR'),
        },
        {
          name: 'ऑस्ट्रेलिया',
          language: await this.getLanguagesByCode('hi-IN'),
        },
      ],
    },
    {
      name: 'Bulgaria',
      hex_color: '#00966E',
      translations: [
        {
          name: 'ブルガリア',
          language: await this.getLanguagesByCode('ja-Kana'),
        },
        {
          name: 'Bulgaria',
          language: await this.getLanguagesByCode('es-ES'),
        },
        {
          name: 'Bulgarien',
          language: await this.getLanguagesByCode('de-DE'),
        },
        {
          name: '保加利亚',
          language: await this.getLanguagesByCode('zh-CN'),
        },
        {
          name: 'Bulgaria',
          language: await this.getLanguagesByCode('it-IT'),
        },
        {
          name: 'Bulgarie',
          language: await this.getLanguagesByCode('fr-FR'),
        },
        {
          name: 'बुल्गारिया',
          language: await this.getLanguagesByCode('hi-IN'),
        },
      ],
    },
    {
      name: 'Sri Lanka',
      hex_color: '#DA121A',
      translations: [
        {
          name: 'スリランカ',
          language: await this.getLanguagesByCode('ja-Kana'),
        },
        {
          name: 'Sri Lanka',
          language: await this.getLanguagesByCode('es-ES'),
        },
        {
          name: 'Sri Lanka',
          language: await this.getLanguagesByCode('de-DE'),
        },
        {
          name: '斯里兰卡',
          language: await this.getLanguagesByCode('zh-CN'),
        },
        {
          name: 'Sri Lanka',
          language: await this.getLanguagesByCode('it-IT'),
        },
        {
          name: 'Sri Lanka',
          language: await this.getLanguagesByCode('fr-FR'),
        },
        {
          name: 'श्रीलंका',
          language: await this.getLanguagesByCode('hi-IN'),
        },
      ],
    },
    {
      name: 'Chile',
      hex_color: '#D52B1E',
      translations: [
        {
          name: 'チリ',
          language: await this.getLanguagesByCode('ja-Kana'),
        },
        {
          name: 'Chile',
          language: await this.getLanguagesByCode('es-ES'),
        },
        {
          name: 'Chile',
          language: await this.getLanguagesByCode('de-DE'),
        },
        {
          name: '智利',
          language: await this.getLanguagesByCode('zh-CN'),
        },
        {
          name: 'Cile',
          language: await this.getLanguagesByCode('it-IT'),
        },
        {
          name: 'Chili',
          language: await this.getLanguagesByCode('fr-FR'),
        },
        {
          name: 'चिली',
          language: await this.getLanguagesByCode('hi-IN'),
        },
      ],
    },
    {
      name: 'Austria',
      hex_color: '#ED2939',
      translations: [
        {
          name: 'オーストリア',
          language: await this.getLanguagesByCode('ja-Kana'),
        },
        {
          name: 'Austria',
          language: await this.getLanguagesByCode('es-ES'),
        },
        {
          name: 'Österreich',
          language: await this.getLanguagesByCode('de-DE'),
        },
        {
          name: '奥地利',
          language: await this.getLanguagesByCode('zh-CN'),
        },
        {
          name: 'Austria',
          language: await this.getLanguagesByCode('it-IT'),
        },
        {
          name: 'Autriche',
          language: await this.getLanguagesByCode('fr-FR'),
        },
        {
          name: 'ऑस्ट्रिया',
          language: await this.getLanguagesByCode('hi-IN'),
        },
      ],
    },
    {
      name: 'Kuwait',
      hex_color: '#007A3D',
      translations: [
        {
          name: 'クウェート',
          language: await this.getLanguagesByCode('ja-Kana'),
        },
        {
          name: 'Kuwait',
          language: await this.getLanguagesByCode('es-ES'),
        },
        {
          name: 'Kuwait',
          language: await this.getLanguagesByCode('de-DE'),
        },
        {
          name: '科威特',
          language: await this.getLanguagesByCode('zh-CN'),
        },
        {
          name: 'Kuwait',
          language: await this.getLanguagesByCode('it-IT'),
        },
        {
          name: 'Koweït',
          language: await this.getLanguagesByCode('fr-FR'),
        },
        {
          name: 'कुवैत',
          language: await this.getLanguagesByCode('hi-IN'),
        },
      ],
    },
    {
      name: 'Saudi Arabia',
      hex_color: '#006C35',
      translations: [
        {
          name: 'サウジアラビア',
          language: await this.getLanguagesByCode('ja-Kana'),
        },
        {
          name: 'Arabia Saudita',
          language: await this.getLanguagesByCode('es-ES'),
        },
        {
          name: 'Saudi-Arabien',
          language: await this.getLanguagesByCode('de-DE'),
        },
        {
          name: '沙特阿拉伯',
          language: await this.getLanguagesByCode('zh-CN'),
        },
        {
          name: 'Arabia Saudita',
          language: await this.getLanguagesByCode('it-IT'),
        },
        {
          name: 'Arabie Saoudite',
          language: await this.getLanguagesByCode('fr-FR'),
        },
        {
          name: 'सऊदी अरब',
          language: await this.getLanguagesByCode('hi-IN'),
        },
      ],
    },
    {
      name: 'Tunisia',
      hex_color: '#E70013',
      translations: [
        {
          name: 'チュニジア',
          language: await this.getLanguagesByCode('ja-Kana'),
        },
        {
          name: 'Túnez',
          language: await this.getLanguagesByCode('es-ES'),
        },
        {
          name: 'Tunesien',
          language: await this.getLanguagesByCode('de-DE'),
        },
        {
          name: '突尼斯',
          language: await this.getLanguagesByCode('zh-CN'),
        },
        {
          name: 'Tunisia',
          language: await this.getLanguagesByCode('it-IT'),
        },
        {
          name: 'Tunisie',
          language: await this.getLanguagesByCode('fr-FR'),
        },
        {
          name: 'ट्यूनीशिया',
          language: await this.getLanguagesByCode('hi-IN'),
        },
      ],
    },
    {
      name: 'Slovenia',
      hex_color: '#005DA4',
      translations: [
        {
          name: 'スロベニア',
          language: await this.getLanguagesByCode('ja-Kana'),
        },
        {
          name: 'Eslovenia',
          language: await this.getLanguagesByCode('es-ES'),
        },
        {
          name: 'Slowenien',
          language: await this.getLanguagesByCode('de-DE'),
        },
        {
          name: '斯洛文尼亚',
          language: await this.getLanguagesByCode('zh-CN'),
        },
        {
          name: 'Slovenia',
          language: await this.getLanguagesByCode('it-IT'),
        },
        {
          name: 'Slovénie',
          language: await this.getLanguagesByCode('fr-FR'),
        },
        {
          name: 'स्लोवेनिया',
          language: await this.getLanguagesByCode('hi-IN'),
        },
      ],
    },
    {
      name: 'Maldives',
      hex_color: '#D21034',
      translations: [
        {
          name: 'モルディブ',
          language: await this.getLanguagesByCode('ja-Kana'),
        },
        {
          name: 'Maldivas',
          language: await this.getLanguagesByCode('es-ES'),
        },
        {
          name: 'Malediven',
          language: await this.getLanguagesByCode('de-DE'),
        },
        {
          name: '马尔代夫',
          language: await this.getLanguagesByCode('zh-CN'),
        },
        {
          name: 'Maldive',
          language: await this.getLanguagesByCode('it-IT'),
        },
        {
          name: 'Maldives',
          language: await this.getLanguagesByCode('fr-FR'),
        },
        {
          name: 'मालदीव',
          language: await this.getLanguagesByCode('hi-IN'),
        },
      ],
    },
    {
      name: 'Italy',
      hex_color: '#008C45',
      translations: [
        {
          name: 'イタリア',
          language: await this.getLanguagesByCode('ja-Kana'),
        },
        {
          name: 'Italia',
          language: await this.getLanguagesByCode('es-ES'),
        },
        {
          name: 'Italien',
          language: await this.getLanguagesByCode('de-DE'),
        },
        {
          name: '意大利',
          language: await this.getLanguagesByCode('zh-CN'),
        },
        {
          name: 'Italia',
          language: await this.getLanguagesByCode('it-IT'),
        },
        {
          name: 'Italie',
          language: await this.getLanguagesByCode('fr-FR'),
        },
        {
          name: 'इटली',
          language: await this.getLanguagesByCode('hi-IN'),
        },
      ],
    },
    {
      name: 'Oman',
      hex_color: '#D91023',
      translations: [
        {
          name: 'オマーン',
          language: await this.getLanguagesByCode('ja-Kana'),
        },
        {
          name: 'Omán',
          language: await this.getLanguagesByCode('es-ES'),
        },
        {
          name: 'Oman',
          language: await this.getLanguagesByCode('de-DE'),
        },
        {
          name: '阿曼',
          language: await this.getLanguagesByCode('zh-CN'),
        },
        {
          name: 'Oman',
          language: await this.getLanguagesByCode('it-IT'),
        },
        {
          name: 'Oman',
          language: await this.getLanguagesByCode('fr-FR'),
        },
        {
          name: 'ओमान',
          language: await this.getLanguagesByCode('hi-IN'),
        },
      ],
    },
    {
      name: 'Qatar',
      hex_color: '#8D1B3D',
      translations: [
        {
          name: 'カタール',
          language: await this.getLanguagesByCode('ja-Kana'),
        },
        {
          name: 'Catar',
          language: await this.getLanguagesByCode('es-ES'),
        },
        {
          name: 'Katar',
          language: await this.getLanguagesByCode('de-DE'),
        },
        {
          name: '卡塔尔',
          language: await this.getLanguagesByCode('zh-CN'),
        },
        {
          name: 'Qatar',
          language: await this.getLanguagesByCode('it-IT'),
        },
        {
          name: 'Qatar',
          language: await this.getLanguagesByCode('fr-FR'),
        },
        {
          name: 'कतर',
          language: await this.getLanguagesByCode('hi-IN'),
        },
      ],
    },
    {
      name: 'Brunei',
      hex_color: '#FCD116',
      translations: [
        {
          name: 'ブルネイ',
          language: await this.getLanguagesByCode('ja-Kana'),
        },
        {
          name: 'Brunéi',
          language: await this.getLanguagesByCode('es-ES'),
        },
        {
          name: 'Brunei',
          language: await this.getLanguagesByCode('de-DE'),
        },
        {
          name: '文莱',
          language: await this.getLanguagesByCode('zh-CN'),
        },
        {
          name: 'Brunei',
          language: await this.getLanguagesByCode('it-IT'),
        },
        {
          name: 'Brunei',
          language: await this.getLanguagesByCode('fr-FR'),
        },
        {
          name: 'ब्रुनेई',
          language: await this.getLanguagesByCode('hi-IN'),
        },
      ],
    },
    {
      name: 'Romania',
      hex_color: '#F4C430',
      translations: [
        {
          name: 'ルーマニア',
          language: await this.getLanguagesByCode('ja-Kana'),
        },
        {
          name: 'Rumania',
          language: await this.getLanguagesByCode('es-ES'),
        },
        {
          name: 'Rumänien',
          language: await this.getLanguagesByCode('de-DE'),
        },
        {
          name: '罗马尼亚',
          language: await this.getLanguagesByCode('zh-CN'),
        },
        {
          name: 'Romania',
          language: await this.getLanguagesByCode('it-IT'),
        },
        {
          name: 'Roumanie',
          language: await this.getLanguagesByCode('fr-FR'),
        },
        {
          name: 'रोमानिया',
          language: await this.getLanguagesByCode('hi-IN'),
        },
      ],
    },
    {
      name: 'United Arab Emirates',
      hex_color: '#FF8C00',
      translations: [
        {
          name: 'アラブ首長国連邦',
          language: await this.getLanguagesByCode('ja-Kana'),
        },
        {
          name: 'Emiratos Árabes Unidos',
          language: await this.getLanguagesByCode('es-ES'),
        },
        {
          name: 'Vereinigte Arabische Emirate',
          language: await this.getLanguagesByCode('de-DE'),
        },
        {
          name: '阿拉伯联合酋长国',
          language: await this.getLanguagesByCode('zh-CN'),
        },
        {
          name: 'Emirati Arabi Uniti',
          language: await this.getLanguagesByCode('it-IT'),
        },
        {
          name: 'Émirats Arabes Unis',
          language: await this.getLanguagesByCode('fr-FR'),
        },
        {
          name: 'संयुक्त अरब अमीरात',
          language: await this.getLanguagesByCode('hi-IN'),
        },
      ],
    },
    {
      name: 'New Zealand',
      hex_color: '#000000',
      translations: [
        {
          name: 'ニュージーランド',
          language: await this.getLanguagesByCode('ja-Kana'),
        },
        {
          name: 'Nueva Zelanda',
          language: await this.getLanguagesByCode('es-ES'),
        },
        {
          name: 'Neuseeland',
          language: await this.getLanguagesByCode('de-DE'),
        },
        {
          name: '新西兰',
          language: await this.getLanguagesByCode('zh-CN'),
        },
        {
          name: 'Nuova Zelanda',
          language: await this.getLanguagesByCode('it-IT'),
        },
        {
          name: 'Nouvelle-Zélande',
          language: await this.getLanguagesByCode('fr-FR'),
        },
        {
          name: 'न्यूज़ीलैंड',
          language: await this.getLanguagesByCode('hi-IN'),
        },
      ],
    },
    {
      name: 'Papua New Guinea',
      hex_color: '#CE1126',
      translations: [
        {
          name: 'パプアニューギニア',
          language: await this.getLanguagesByCode('ja-Kana'),
        },
        {
          name: 'Papúa Nueva Guinea',
          language: await this.getLanguagesByCode('es-ES'),
        },
        {
          name: 'Papua-Neuguinea',
          language: await this.getLanguagesByCode('de-DE'),
        },
        {
          name: '巴布亚新几内亚',
          language: await this.getLanguagesByCode('zh-CN'),
        },
        {
          name: 'Papua Nuova Guinea',
          language: await this.getLanguagesByCode('it-IT'),
        },
        {
          name: 'Papouasie-Nouvelle-Guinée',
          language: await this.getLanguagesByCode('fr-FR'),
        },
        {
          name: 'पापुआ न्यू गिनी',
          language: await this.getLanguagesByCode('hi-IN'),
        },
      ],
    },
    {
      name: 'Tonga',
      hex_color: '#C8102E',
      translations: [
        {
          name: 'トンガ',
          language: await this.getLanguagesByCode('ja-Kana'),
        },
        {
          name: 'Tonga',
          language: await this.getLanguagesByCode('es-ES'),
        },
        {
          name: 'Tonga',
          language: await this.getLanguagesByCode('de-DE'),
        },
        {
          name: '汤加',
          language: await this.getLanguagesByCode('zh-CN'),
        },
        {
          name: 'Tonga',
          language: await this.getLanguagesByCode('it-IT'),
        },
        {
          name: 'Tonga',
          language: await this.getLanguagesByCode('fr-FR'),
        },
        {
          name: 'टोंगा',
          language: await this.getLanguagesByCode('hi-IN'),
        },
      ],
    },
    {
      name: 'Samoa',
      hex_color: '#002B7F',
      translations: [
        {
          name: 'サモア独立国',
          language: await this.getLanguagesByCode('ja-Kana'),
        },
        {
          name: 'Samoa',
          language: await this.getLanguagesByCode('es-ES'),
        },
        {
          name: 'Samoa',
          language: await this.getLanguagesByCode('de-DE'),
        },
        {
          name: '萨摩亚',
          language: await this.getLanguagesByCode('zh-CN'),
        },
        {
          name: 'Samoa',
          language: await this.getLanguagesByCode('it-IT'),
        },
        {
          name: 'Samoa',
          language: await this.getLanguagesByCode('fr-FR'),
        },
        {
          name: 'समोआ',
          language: await this.getLanguagesByCode('hi-IN'),
        },
      ],
    },
    {
      name: 'Bhutan',
      hex_color: '#FF0000',
      translations: [
        {
          name: 'ブータン',
          language: await this.getLanguagesByCode('ja-Kana'),
        },
        {
          name: 'Bután',
          language: await this.getLanguagesByCode('es-ES'),
        },
        {
          name: 'Bhutan',
          language: await this.getLanguagesByCode('de-DE'),
        },
        {
          name: '不丹',
          language: await this.getLanguagesByCode('zh-CN'),
        },
        {
          name: 'Bhutan',
          language: await this.getLanguagesByCode('it-IT'),
        },
        {
          name: 'Bhoutan',
          language: await this.getLanguagesByCode('fr-FR'),
        },
        {
          name: 'भूटान',
          language: await this.getLanguagesByCode('hi-IN'),
        },
      ],
    },
    {
      name: 'East Timor',
      hex_color: '#DC241F',
      translations: [
        {
          name: '東ティモール',
          language: await this.getLanguagesByCode('ja-Kana'),
        },
        {
          name: 'Timor Oriental',
          language: await this.getLanguagesByCode('es-ES'),
        },
        {
          name: 'Osttimor',
          language: await this.getLanguagesByCode('de-DE'),
        },
        {
          name: '东帝汶',
          language: await this.getLanguagesByCode('zh-CN'),
        },
        {
          name: 'Timor Est',
          language: await this.getLanguagesByCode('it-IT'),
        },
        {
          name: 'Timor oriental',
          language: await this.getLanguagesByCode('fr-FR'),
        },
        {
          name: 'पूर्वी तिमोर',
          language: await this.getLanguagesByCode('hi-IN'),
        },
      ],
    },
    {
      name: 'Iceland',
      hex_color: '#02529C',
      translations: [
        {
          name: 'アイスランド',
          language: await this.getLanguagesByCode('ja-Kana'),
        },
        {
          name: 'Islandia',
          language: await this.getLanguagesByCode('es-ES'),
        },
        {
          name: 'Island',
          language: await this.getLanguagesByCode('de-DE'),
        },
        {
          name: '冰岛',
          language: await this.getLanguagesByCode('zh-CN'),
        },
        {
          name: 'Islanda',
          language: await this.getLanguagesByCode('it-IT'),
        },
        {
          name: 'Islande',
          language: await this.getLanguagesByCode('fr-FR'),
        },
        {
          name: 'आइसलैंड',
          language: await this.getLanguagesByCode('hi-IN'),
        },
      ],
    },
    {
      name: 'Andorra',
      hex_color: '#D52B1E',
      translations: [
        {
          name: 'アンドラ',
          language: await this.getLanguagesByCode('ja-Kana'),
        },
        {
          name: 'Andorra',
          language: await this.getLanguagesByCode('es-ES'),
        },
        {
          name: 'Andorra',
          language: await this.getLanguagesByCode('de-DE'),
        },
        {
          name: '安道尔',
          language: await this.getLanguagesByCode('zh-CN'),
        },
        {
          name: 'Andorra',
          language: await this.getLanguagesByCode('it-IT'),
        },
        {
          name: 'Andorre',
          language: await this.getLanguagesByCode('fr-FR'),
        },
        {
          name: 'एंडोरा',
          language: await this.getLanguagesByCode('hi-IN'),
        },
      ],
    },
    {
      name: 'Ireland',
      hex_color: '#169B62',
      translations: [
        {
          name: 'アイルランド',
          language: await this.getLanguagesByCode('ja-Kana'),
        },
        {
          name: 'Irlanda',
          language: await this.getLanguagesByCode('es-ES'),
        },
        {
          name: 'Irland',
          language: await this.getLanguagesByCode('de-DE'),
        },
        {
          name: '爱尔兰',
          language: await this.getLanguagesByCode('zh-CN'),
        },
        {
          name: 'Irlanda',
          language: await this.getLanguagesByCode('it-IT'),
        },
        {
          name: 'Irlande',
          language: await this.getLanguagesByCode('fr-FR'),
        },
        {
          name: 'आयरलैंड',
          language: await this.getLanguagesByCode('hi-IN'),
        },
      ],
    },
    {
      name: 'Estonia',
      hex_color: '#0072CE',
      translations: [
        {
          name: 'エストニア',
          language: await this.getLanguagesByCode('ja-Kana'),
        },
        {
          name: 'Estonia',
          language: await this.getLanguagesByCode('es-ES'),
        },
        {
          name: 'Estland',
          language: await this.getLanguagesByCode('de-DE'),
        },
        {
          name: '爱沙尼亚',
          language: await this.getLanguagesByCode('zh-CN'),
        },
        {
          name: 'Estonia',
          language: await this.getLanguagesByCode('it-IT'),
        },
        {
          name: 'Estonie',
          language: await this.getLanguagesByCode('fr-FR'),
        },
        {
          name: 'एस्टोनिया',
          language: await this.getLanguagesByCode('hi-IN'),
        },
      ],
    },
    {
      name: 'Vatican',
      hex_color: '#FFFFFF',
      translations: [
        {
          name: 'バチカン',
          language: await this.getLanguagesByCode('ja-Kana'),
        },
        {
          name: 'Vaticano',
          language: await this.getLanguagesByCode('es-ES'),
        },
        {
          name: 'Vatikan',
          language: await this.getLanguagesByCode('de-DE'),
        },
        {
          name: '梵蒂冈',
          language: await this.getLanguagesByCode('zh-CN'),
        },
        {
          name: 'Vaticano',
          language: await this.getLanguagesByCode('it-IT'),
        },
        {
          name: 'Vatican',
          language: await this.getLanguagesByCode('fr-FR'),
        },
        {
          name: 'वेटिकन',
          language: await this.getLanguagesByCode('hi-IN'),
        },
      ],
    },
    {
      name: 'Latvia',
      hex_color: '#9E3039',
      translations: [
        {
          name: 'ラトビア',
          language: await this.getLanguagesByCode('ja-Kana'),
        },
        {
          name: 'Letonia',
          language: await this.getLanguagesByCode('es-ES'),
        },
        {
          name: 'Lettland',
          language: await this.getLanguagesByCode('de-DE'),
        },
        {
          name: '拉脱维亚',
          language: await this.getLanguagesByCode('zh-CN'),
        },
        {
          name: 'Lettonia',
          language: await this.getLanguagesByCode('it-IT'),
        },
        {
          name: 'Lettonie',
          language: await this.getLanguagesByCode('fr-FR'),
        },
        {
          name: 'लात्विया',
          language: await this.getLanguagesByCode('hi-IN'),
        },
      ],
    },
    {
      name: 'Luxembourg',
      hex_color: '#ED2939',
      translations: [
        {
          name: 'ルクセンブルク',
          language: await this.getLanguagesByCode('ja-Kana'),
        },
        {
          name: 'Luxemburgo',
          language: await this.getLanguagesByCode('es-ES'),
        },
        {
          name: 'Luxemburg',
          language: await this.getLanguagesByCode('de-DE'),
        },
        {
          name: '卢森堡',
          language: await this.getLanguagesByCode('zh-CN'),
        },
        {
          name: 'Lussemburgo',
          language: await this.getLanguagesByCode('it-IT'),
        },
        {
          name: 'Luxembourg',
          language: await this.getLanguagesByCode('fr-FR'),
        },
        {
          name: 'लक्ज़मबर्ग',
          language: await this.getLanguagesByCode('hi-IN'),
        },
      ],
    },
    {
      name: 'Croatia',
      hex_color: '#FF0000',
      translations: [
        {
          name: 'クロアチア',
          language: await this.getLanguagesByCode('ja-Kana'),
        },
        {
          name: 'Croacia',
          language: await this.getLanguagesByCode('es-ES'),
        },
        {
          name: 'Kroatien',
          language: await this.getLanguagesByCode('de-DE'),
        },
        {
          name: '克罗地亚',
          language: await this.getLanguagesByCode('zh-CN'),
        },
        {
          name: 'Croazia',
          language: await this.getLanguagesByCode('it-IT'),
        },
        {
          name: 'Croatie',
          language: await this.getLanguagesByCode('fr-FR'),
        },
        {
          name: 'क्रोएशिया',
          language: await this.getLanguagesByCode('hi-IN'),
        },
      ],
    },
    {
      name: 'Serbia',
      hex_color: '#D90012',
      translations: [
        {
          name: 'セルビア',
          language: await this.getLanguagesByCode('ja-Kana'),
        },
        {
          name: 'Serbia',
          language: await this.getLanguagesByCode('es-ES'),
        },
        {
          name: 'Serbien',
          language: await this.getLanguagesByCode('de-DE'),
        },
        {
          name: '塞尔维亚',
          language: await this.getLanguagesByCode('zh-CN'),
        },
        {
          name: 'Serbia',
          language: await this.getLanguagesByCode('it-IT'),
        },
        {
          name: 'Serbie',
          language: await this.getLanguagesByCode('fr-FR'),
        },
        {
          name: 'सर्बिया',
          language: await this.getLanguagesByCode('hi-IN'),
        },
      ],
    },
    {
      name: 'Czech Republic',
      hex_color: '#D7141A',
      translations: [
        {
          name: 'チェコ',
          language: await this.getLanguagesByCode('ja-Kana'),
        },
        {
          name: 'República Checa',
          language: await this.getLanguagesByCode('es-ES'),
        },
        {
          name: 'Tschechische Republik',
          language: await this.getLanguagesByCode('de-DE'),
        },
        {
          name: '捷克共和国',
          language: await this.getLanguagesByCode('zh-CN'),
        },
        {
          name: 'Repubblica Ceca',
          language: await this.getLanguagesByCode('it-IT'),
        },
        {
          name: 'République Tchèque',
          language: await this.getLanguagesByCode('fr-FR'),
        },
        {
          name: 'चेक गणराज्य',
          language: await this.getLanguagesByCode('hi-IN'),
        },
      ],
    },
    {
      name: 'Greece',
      hex_color: '#0D5EAF',
      translations: [
        {
          name: 'ギリシャ',
          language: await this.getLanguagesByCode('ja-Kana'),
        },
        {
          name: 'Grecia',
          language: await this.getLanguagesByCode('es-ES'),
        },
        {
          name: 'Griechenland',
          language: await this.getLanguagesByCode('de-DE'),
        },
        {
          name: '希腊',
          language: await this.getLanguagesByCode('zh-CN'),
        },
        {
          name: 'Grecia',
          language: await this.getLanguagesByCode('it-IT'),
        },
        {
          name: 'Grèce',
          language: await this.getLanguagesByCode('fr-FR'),
        },
        {
          name: 'ग्रीस',
          language: await this.getLanguagesByCode('hi-IN'),
        },
      ],
    },
    {
      name: 'Azerbaijan',
      hex_color: '#3F9C35',
      translations: [
        {
          name: 'アゼルバイジャン',
          language: await this.getLanguagesByCode('ja-Kana'),
        },
        {
          name: 'Azerbaiyán',
          language: await this.getLanguagesByCode('es-ES'),
        },
        {
          name: 'Aserbaidschan',
          language: await this.getLanguagesByCode('de-DE'),
        },
        {
          name: '阿塞拜疆',
          language: await this.getLanguagesByCode('zh-CN'),
        },
        {
          name: 'Azerbaigian',
          language: await this.getLanguagesByCode('it-IT'),
        },
        {
          name: 'Azerbaïdjan',
          language: await this.getLanguagesByCode('fr-FR'),
        },
        {
          name: 'अज़रबैजान',
          language: await this.getLanguagesByCode('hi-IN'),
        },
      ],
    },
    {
      name: 'Georgia',
      hex_color: '#FFCD00',
      translations: [
        {
          name: 'グルジア',
          language: await this.getLanguagesByCode('ja-Kana'),
        },
        {
          name: 'Georgia',
          language: await this.getLanguagesByCode('es-ES'),
        },
        {
          name: 'Georgien',
          language: await this.getLanguagesByCode('de-DE'),
        },
        {
          name: '格鲁吉亚',
          language: await this.getLanguagesByCode('zh-CN'),
        },
        {
          name: 'Georgia',
          language: await this.getLanguagesByCode('it-IT'),
        },
        {
          name: 'Géorgie',
          language: await this.getLanguagesByCode('fr-FR'),
        },
        {
          name: 'जॉर्जिया',
          language: await this.getLanguagesByCode('hi-IN'),
        },
      ],
    },
    {
      name: 'Paraguay',
      hex_color: '#D52B1E',
      translations: [
        {
          name: 'パラグアイ',
          language: await this.getLanguagesByCode('ja-Kana'),
        },
        {
          name: 'Paraguay',
          language: await this.getLanguagesByCode('es-ES'),
        },
        {
          name: 'Paraguay',
          language: await this.getLanguagesByCode('de-DE'),
        },
        {
          name: '巴拉圭',
          language: await this.getLanguagesByCode('zh-CN'),
        },
        {
          name: 'Paraguay',
          language: await this.getLanguagesByCode('it-IT'),
        },
        {
          name: 'Paraguay',
          language: await this.getLanguagesByCode('fr-FR'),
        },
        {
          name: 'पराग्वे',
          language: await this.getLanguagesByCode('hi-IN'),
        },
      ],
    },
    {
      name: 'Algeria',
      hex_color: '#006233',
      translations: [
        {
          name: 'アルジェリア',
          language: await this.getLanguagesByCode('ja-Kana'),
        },
        {
          name: 'Argelia',
          language: await this.getLanguagesByCode('es-ES'),
        },
        {
          name: 'Algerien',
          language: await this.getLanguagesByCode('de-DE'),
        },
        {
          name: '阿尔及利亚',
          language: await this.getLanguagesByCode('zh-CN'),
        },
        {
          name: 'Algeria',
          language: await this.getLanguagesByCode('it-IT'),
        },
        {
          name: 'Algérie',
          language: await this.getLanguagesByCode('fr-FR'),
        },
        {
          name: 'अल्जीरिया',
          language: await this.getLanguagesByCode('hi-IN'),
        },
      ],
    },
    {
      name: 'Gabon',
      hex_color: '#FCD116',
      translations: [
        {
          name: 'ガボン',
          language: await this.getLanguagesByCode('ja-Kana'),
        },
        {
          name: 'Gabón',
          language: await this.getLanguagesByCode('es-ES'),
        },
        {
          name: 'Gabun',
          language: await this.getLanguagesByCode('de-DE'),
        },
        {
          name: '加蓬',
          language: await this.getLanguagesByCode('zh-CN'),
        },
        {
          name: 'Gabon',
          language: await this.getLanguagesByCode('it-IT'),
        },
        {
          name: 'Gabon',
          language: await this.getLanguagesByCode('fr-FR'),
        },
        {
          name: 'गैबॉन',
          language: await this.getLanguagesByCode('hi-IN'),
        },
      ],
    },
    {
      name: 'Sudan',
      hex_color: '#D21034',
      translations: [
        {
          name: 'スーダン',
          language: await this.getLanguagesByCode('ja-Kana'),
        },
        {
          name: 'Sudán',
          language: await this.getLanguagesByCode('es-ES'),
        },
        {
          name: 'Sudan',
          language: await this.getLanguagesByCode('de-DE'),
        },
        {
          name: '苏丹',
          language: await this.getLanguagesByCode('zh-CN'),
        },
        {
          name: 'Sudan',
          language: await this.getLanguagesByCode('it-IT'),
        },
        {
          name: 'Soudan',
          language: await this.getLanguagesByCode('fr-FR'),
        },
        {
          name: 'सूडान',
          language: await this.getLanguagesByCode('hi-IN'),
        },
      ],
    },
    {
      name: 'Equatorial Guinea',
      hex_color: '#F9E814',
      translations: [
        {
          name: '赤道ギニア',
          language: await this.getLanguagesByCode('ja-Kana'),
        },
        {
          name: 'Guinea Ecuatorial',
          language: await this.getLanguagesByCode('es-ES'),
        },
        {
          name: 'Äquatorialguinea',
          language: await this.getLanguagesByCode('de-DE'),
        },
        {
          name: '赤道几内亚',
          language: await this.getLanguagesByCode('zh-CN'),
        },
        {
          name: 'Guinea Equatoriale',
          language: await this.getLanguagesByCode('it-IT'),
        },
        {
          name: 'Guinée Équatoriale',
          language: await this.getLanguagesByCode('fr-FR'),
        },
        {
          name: 'इक्वेटोरियल गिनी',
          language: await this.getLanguagesByCode('hi-IN'),
        },
      ],
    },
    {
      name: 'Eritrea',
      hex_color: '#EA3A00',
      translations: [
        {
          name: 'エリトリア',
          language: await this.getLanguagesByCode('ja-Kana'),
        },
        {
          name: 'Eritrea',
          language: await this.getLanguagesByCode('es-ES'),
        },
        {
          name: 'Eritrea',
          language: await this.getLanguagesByCode('de-DE'),
        },
        {
          name: '厄立特里亚',
          language: await this.getLanguagesByCode('zh-CN'),
        },
        {
          name: 'Eritrea',
          language: await this.getLanguagesByCode('it-IT'),
        },
        {
          name: 'Érythrée',
          language: await this.getLanguagesByCode('fr-FR'),
        },
        {
          name: 'एरिट्रिया',
          language: await this.getLanguagesByCode('hi-IN'),
        },
      ],
    },
    {
      name: 'Namibia',
      hex_color: '#003F87',
      translations: [
        {
          name: 'ナミビア',
          language: await this.getLanguagesByCode('ja-Kana'),
        },
        {
          name: 'Namibia',
          language: await this.getLanguagesByCode('es-ES'),
        },
        {
          name: 'Namibia',
          language: await this.getLanguagesByCode('de-DE'),
        },
        {
          name: '纳米比亚',
          language: await this.getLanguagesByCode('zh-CN'),
        },
        {
          name: 'Namibia',
          language: await this.getLanguagesByCode('it-IT'),
        },
        {
          name: 'Namibie',
          language: await this.getLanguagesByCode('fr-FR'),
        },
        {
          name: 'नामीबिया',
          language: await this.getLanguagesByCode('hi-IN'),
        },
      ],
    },
    {
      name: 'Botswana',
      hex_color: '#75AADB',
      translations: [
        {
          name: 'ボツワナ',
          language: await this.getLanguagesByCode('ja-Kana'),
        },
        {
          name: 'Botsuana',
          language: await this.getLanguagesByCode('es-ES'),
        },
        {
          name: 'Botswana',
          language: await this.getLanguagesByCode('de-DE'),
        },
        {
          name: '博茨瓦纳',
          language: await this.getLanguagesByCode('zh-CN'),
        },
        {
          name: 'Botswana',
          language: await this.getLanguagesByCode('it-IT'),
        },
        {
          name: 'Botswana',
          language: await this.getLanguagesByCode('fr-FR'),
        },
        {
          name: 'बोत्सवाना',
          language: await this.getLanguagesByCode('hi-IN'),
        },
      ],
    },
    {
      name: 'Madagascar',
      hex_color: '#FC3D32',
      translations: [
        {
          name: 'マダガスカル',
          language: await this.getLanguagesByCode('ja-Kana'),
        },
        {
          name: 'Madagascar',
          language: await this.getLanguagesByCode('es-ES'),
        },
        {
          name: 'Madagaskar',
          language: await this.getLanguagesByCode('de-DE'),
        },
        {
          name: '马达加斯加',
          language: await this.getLanguagesByCode('zh-CN'),
        },
        {
          name: 'Madagascar',
          language: await this.getLanguagesByCode('it-IT'),
        },
        {
          name: 'Madagascar',
          language: await this.getLanguagesByCode('fr-FR'),
        },
        {
          name: 'मेडागास्कर',
          language: await this.getLanguagesByCode('hi-IN'),
        },
      ],
    },
    {
      name: 'Rwanda',
      hex_color: '#20603D',
      translations: [
        {
          name: 'ルワンダ',
          language: await this.getLanguagesByCode('ja-Kana'),
        },
        {
          name: 'Ruanda',
          language: await this.getLanguagesByCode('es-ES'),
        },
        {
          name: 'Ruanda',
          language: await this.getLanguagesByCode('de-DE'),
        },
        {
          name: '卢旺达',
          language: await this.getLanguagesByCode('zh-CN'),
        },
        {
          name: 'Ruanda',
          language: await this.getLanguagesByCode('it-IT'),
        },
        {
          name: 'Rwanda',
          language: await this.getLanguagesByCode('fr-FR'),
        },
        {
          name: 'रवांडा',
          language: await this.getLanguagesByCode('hi-IN'),
        },
      ],
    },
    {
      name: 'Armenia',
      hex_color: '#0033A0',
      translations: [
        {
          name: 'アルメニア',
          language: await this.getLanguagesByCode('ja-Kana'),
        },
        {
          name: 'Armenia',
          language: await this.getLanguagesByCode('es-ES'),
        },
        {
          name: 'Armenien',
          language: await this.getLanguagesByCode('de-DE'),
        },
        {
          name: '亚美尼亚',
          language: await this.getLanguagesByCode('zh-CN'),
        },
        {
          name: 'Armenia',
          language: await this.getLanguagesByCode('it-IT'),
        },
        {
          name: 'Arménie',
          language: await this.getLanguagesByCode('fr-FR'),
        },
        {
          name: 'आर्मेनिया',
          language: await this.getLanguagesByCode('hi-IN'),
        },
      ],
    },
    {
      name: 'Tajikistan',
      hex_color: '#006600',
      translations: [
        {
          name: 'タジキスタン',
          language: await this.getLanguagesByCode('ja-Kana'),
        },
        {
          name: 'Tayikistán',
          language: await this.getLanguagesByCode('es-ES'),
        },
        {
          name: 'Tadschikistan',
          language: await this.getLanguagesByCode('de-DE'),
        },
        {
          name: '塔吉克斯坦',
          language: await this.getLanguagesByCode('zh-CN'),
        },
        {
          name: 'Tagikistan',
          language: await this.getLanguagesByCode('it-IT'),
        },
        {
          name: 'Tadjikistan',
          language: await this.getLanguagesByCode('fr-FR'),
        },
        {
          name: 'ताजिकिस्तान',
          language: await this.getLanguagesByCode('hi-IN'),
        },
      ],
    },
    {
      name: 'Montenegro',
      hex_color: '#D52B1E',
      translations: [
        {
          name: 'モンテネグロ',
          language: await this.getLanguagesByCode('ja-Kana'),
        },
        {
          name: 'Montenegro',
          language: await this.getLanguagesByCode('es-ES'),
        },
        {
          name: 'Montenegro',
          language: await this.getLanguagesByCode('de-DE'),
        },
        {
          name: '黑山',
          language: await this.getLanguagesByCode('zh-CN'),
        },
        {
          name: 'Montenegro',
          language: await this.getLanguagesByCode('it-IT'),
        },
        {
          name: 'Monténégro',
          language: await this.getLanguagesByCode('fr-FR'),
        },
        {
          name: 'मोंटेनेग्रो',
          language: await this.getLanguagesByCode('hi-IN'),
        },
      ],
    },
    {
      name: 'Moldova',
      hex_color: '#FFD200',
      translations: [
        {
          name: 'モルドバ',
          language: await this.getLanguagesByCode('ja-Kana'),
        },
        {
          name: 'Moldavia',
          language: await this.getLanguagesByCode('es-ES'),
        },
        {
          name: 'Moldawien',
          language: await this.getLanguagesByCode('de-DE'),
        },
        {
          name: '摩尔多瓦',
          language: await this.getLanguagesByCode('zh-CN'),
        },
        {
          name: 'Moldavia',
          language: await this.getLanguagesByCode('it-IT'),
        },
        {
          name: 'Moldavie',
          language: await this.getLanguagesByCode('fr-FR'),
        },
        {
          name: 'मोल्डोवा',
          language: await this.getLanguagesByCode('hi-IN'),
        },
      ],
    },
    {
      name: 'Belarus',
      hex_color: '#C8102E',
      translations: [
        {
          name: 'ベラルーシ',
          language: await this.getLanguagesByCode('ja-Kana'),
        },
        {
          name: 'Bielorrusia',
          language: await this.getLanguagesByCode('es-ES'),
        },
        {
          name: 'Weißrussland',
          language: await this.getLanguagesByCode('de-DE'),
        },
        {
          name: '白俄罗斯',
          language: await this.getLanguagesByCode('zh-CN'),
        },
        {
          name: 'Bielorussia',
          language: await this.getLanguagesByCode('it-IT'),
        },
        {
          name: 'Biélorussie',
          language: await this.getLanguagesByCode('fr-FR'),
        },
        {
          name: 'बेलारूस',
          language: await this.getLanguagesByCode('hi-IN'),
        },
      ],
    },
    {
      name: 'Albania',
      hex_color: '#E41E20',
      translations: [
        {
          name: 'アルバニア',
          language: await this.getLanguagesByCode('ja-Kana'),
        },
        {
          name: 'Albania',
          language: await this.getLanguagesByCode('es-ES'),
        },
        {
          name: 'Albanien',
          language: await this.getLanguagesByCode('de-DE'),
        },
        {
          name: '阿尔巴尼亚',
          language: await this.getLanguagesByCode('zh-CN'),
        },
        {
          name: 'Albania',
          language: await this.getLanguagesByCode('it-IT'),
        },
        {
          name: 'Albanie',
          language: await this.getLanguagesByCode('fr-FR'),
        },
        {
          name: 'अल्बानिया',
          language: await this.getLanguagesByCode('hi-IN'),
        },
      ],
    },
    {
      name: 'Bosnia and Herzegovina',
      hex_color: '#00205B',
      translations: [
        {
          name: 'ボスニア・ヘルツェゴビナ',
          language: await this.getLanguagesByCode('ja-Kana'),
        },
        {
          name: 'Bosnia y Herzegovina',
          language: await this.getLanguagesByCode('es-ES'),
        },
        {
          name: 'Bosnien und Herzegowina',
          language: await this.getLanguagesByCode('de-DE'),
        },
        {
          name: '波斯尼亚和黑塞哥维那',
          language: await this.getLanguagesByCode('zh-CN'),
        },
        {
          name: 'Bosnia ed Erzegovina',
          language: await this.getLanguagesByCode('it-IT'),
        },
        {
          name: 'Bosnie-Herzégovine',
          language: await this.getLanguagesByCode('fr-FR'),
        },
        {
          name: 'बोस्निया और हर्जेगोविना',
          language: await this.getLanguagesByCode('hi-IN'),
        },
      ],
    },
    {
      name: 'Jamaica',
      hex_color: '#FED141',
      translations: [
        {
          name: 'ジャマイカ',
          language: await this.getLanguagesByCode('ja-Kana'),
        },
        {
          name: 'Jamaica',
          language: await this.getLanguagesByCode('es-ES'),
        },
        {
          name: 'Jamaika',
          language: await this.getLanguagesByCode('de-DE'),
        },
        {
          name: '牙买加',
          language: await this.getLanguagesByCode('zh-CN'),
        },
        {
          name: 'Giamaica',
          language: await this.getLanguagesByCode('it-IT'),
        },
        {
          name: 'Jamaïque',
          language: await this.getLanguagesByCode('fr-FR'),
        },
        {
          name: 'जमैका',
          language: await this.getLanguagesByCode('hi-IN'),
        },
      ],
    },
    {
      name: 'Niger',
      hex_color: '#0DB02B',
      translations: [
        {
          name: 'ニジェール',
          language: await this.getLanguagesByCode('ja-Kana'),
        },
        {
          name: 'Níger',
          language: await this.getLanguagesByCode('es-ES'),
        },
        {
          name: 'Niger',
          language: await this.getLanguagesByCode('de-DE'),
        },
        {
          name: '尼日尔',
          language: await this.getLanguagesByCode('zh-CN'),
        },
        {
          name: 'Niger',
          language: await this.getLanguagesByCode('it-IT'),
        },
        {
          name: 'Niger',
          language: await this.getLanguagesByCode('fr-FR'),
        },
        {
          name: 'नाइजर',
          language: await this.getLanguagesByCode('hi-IN'),
        },
      ],
    },
    {
      name: 'Guyana',
      hex_color: '#009E49',
      translations: [
        {
          name: 'ガイアナ',
          language: await this.getLanguagesByCode('ja-Kana'),
        },
        {
          name: 'Guyana',
          language: await this.getLanguagesByCode('es-ES'),
        },
        {
          name: 'Guyana',
          language: await this.getLanguagesByCode('de-DE'),
        },
        {
          name: '圭亚那',
          language: await this.getLanguagesByCode('zh-CN'),
        },
        {
          name: 'Guyana',
          language: await this.getLanguagesByCode('it-IT'),
        },
        {
          name: 'Guyana',
          language: await this.getLanguagesByCode('fr-FR'),
        },
        {
          name: 'गयाना',
          language: await this.getLanguagesByCode('hi-IN'),
        },
      ],
    },
    {
      name: 'Senegal',
      hex_color: '#00853F',
      translations: [
        {
          name: 'セネガル',
          language: await this.getLanguagesByCode('ja-Kana'),
        },
        {
          name: 'Senegal',
          language: await this.getLanguagesByCode('es-ES'),
        },
        {
          name: 'Senegal',
          language: await this.getLanguagesByCode('de-DE'),
        },
        {
          name: '塞内加尔',
          language: await this.getLanguagesByCode('zh-CN'),
        },
        {
          name: 'Senegal',
          language: await this.getLanguagesByCode('it-IT'),
        },
        {
          name: 'Sénégal',
          language: await this.getLanguagesByCode('fr-FR'),
        },
        {
          name: 'सेनेगल',
          language: await this.getLanguagesByCode('hi-IN'),
        },
      ],
    },
    {
      name: 'Mali',
      hex_color: '#14B53A',
      translations: [
        {
          name: 'マリ',
          language: await this.getLanguagesByCode('ja-Kana'),
        },
        {
          name: 'Malí',
          language: await this.getLanguagesByCode('es-ES'),
        },
        {
          name: 'Mali',
          language: await this.getLanguagesByCode('de-DE'),
        },
        {
          name: '马里',
          language: await this.getLanguagesByCode('zh-CN'),
        },
        {
          name: 'Mali',
          language: await this.getLanguagesByCode('it-IT'),
        },
        {
          name: 'Mali',
          language: await this.getLanguagesByCode('fr-FR'),
        },
        {
          name: 'माली',
          language: await this.getLanguagesByCode('hi-IN'),
        },
      ],
    },
    {
      name: 'Republic of Congo',
      hex_color: '#009543',
      translations: [
        {
          name: 'コンゴ共和国',
          language: await this.getLanguagesByCode('ja-Kana'),
        },
        {
          name: 'República del Congo',
          language: await this.getLanguagesByCode('es-ES'),
        },
        {
          name: 'Republik Kongo',
          language: await this.getLanguagesByCode('de-DE'),
        },
        {
          name: '刚果共和国',
          language: await this.getLanguagesByCode('zh-CN'),
        },
        {
          name: 'Repubblica del Congo',
          language: await this.getLanguagesByCode('it-IT'),
        },
        {
          name: 'République du Congo',
          language: await this.getLanguagesByCode('fr-FR'),
        },
        {
          name: 'कांगो गणराज्य',
          language: await this.getLanguagesByCode('hi-IN'),
        },
      ],
    },
    {
      name: 'Kenya',
      hex_color: '#BB0000',
      translations: [
        {
          name: 'ケニア',
          language: await this.getLanguagesByCode('ja-Kana'),
        },
        {
          name: 'Kenia',
          language: await this.getLanguagesByCode('es-ES'),
        },
        {
          name: 'Kenia',
          language: await this.getLanguagesByCode('de-DE'),
        },
        {
          name: '肯尼亚',
          language: await this.getLanguagesByCode('zh-CN'),
        },
        {
          name: 'Kenya',
          language: await this.getLanguagesByCode('it-IT'),
        },
        {
          name: 'Kenya',
          language: await this.getLanguagesByCode('fr-FR'),
        },
        {
          name: 'केन्या',
          language: await this.getLanguagesByCode('hi-IN'),
        },
      ],
    },
    {
      name: 'Macedonia (Former Yugoslavia)',
      hex_color: '#D20000',
      translations: [
        {
          name: 'マケドニア\n旧ユーゴスラビア',
          language: await this.getLanguagesByCode('ja-Kana'),
        },
        {
          name: 'Macedonia (Antigua Yugoslavia)',
          language: await this.getLanguagesByCode('es-ES'),
        },
        {
          name: 'Mazedonien (ehemaliges Jugoslawien)',
          language: await this.getLanguagesByCode('de-DE'),
        },
        {
          name: '马其顿（前南斯拉夫）',
          language: await this.getLanguagesByCode('zh-CN'),
        },
        {
          name: 'Macedonia (ex Jugoslavia)',
          language: await this.getLanguagesByCode('it-IT'),
        },
        {
          name: 'Macédoine (Ex-Yougoslavie)',
          language: await this.getLanguagesByCode('fr-FR'),
        },
        {
          name: 'मैसेडोनिया (पूर्व युगोस्लाविया)',
          language: await this.getLanguagesByCode('hi-IN'),
        },
      ],
    },
    {
      name: 'Poland',
      hex_color: '#DC143C',
      translations: [
        {
          name: 'ポーランド',
          language: await this.getLanguagesByCode('ja-Kana'),
        },
        {
          name: 'Polonia',
          language: await this.getLanguagesByCode('es-ES'),
        },
        {
          name: 'Polen',
          language: await this.getLanguagesByCode('de-DE'),
        },
        {
          name: '波兰',
          language: await this.getLanguagesByCode('zh-CN'),
        },
        {
          name: 'Polonia',
          language: await this.getLanguagesByCode('it-IT'),
        },
        {
          name: 'Pologne',
          language: await this.getLanguagesByCode('fr-FR'),
        },
        {
          name: 'पोलैंड',
          language: await this.getLanguagesByCode('hi-IN'),
        },
      ],
    },
    {
      name: 'Gambia',
      hex_color: '#0C1C8C',
      translations: [
        {
          name: 'ガンビア',
          language: await this.getLanguagesByCode('ja-Kana'),
        },
        {
          name: 'Gambia',
          language: await this.getLanguagesByCode('es-ES'),
        },
        {
          name: 'Gambia',
          language: await this.getLanguagesByCode('de-DE'),
        },
        {
          name: '冈比亚',
          language: await this.getLanguagesByCode('zh-CN'),
        },
        {
          name: 'Gambia',
          language: await this.getLanguagesByCode('it-IT'),
        },
        {
          name: 'Gambie',
          language: await this.getLanguagesByCode('fr-FR'),
        },
        {
          name: 'गाम्बिया',
          language: await this.getLanguagesByCode('hi-IN'),
        },
      ],
    },
    {
      name: 'Saint Lucia',
      hex_color: '#FCD116',
      translations: [
        {
          name: 'セントルシア',
          language: await this.getLanguagesByCode('ja-Kana'),
        },
        {
          name: 'Santa Lucía',
          language: await this.getLanguagesByCode('es-ES'),
        },
        {
          name: 'St. Lucia',
          language: await this.getLanguagesByCode('de-DE'),
        },
        {
          name: '圣卢西亚',
          language: await this.getLanguagesByCode('zh-CN'),
        },
        {
          name: 'Santa Lucia',
          language: await this.getLanguagesByCode('it-IT'),
        },
        {
          name: 'Sainte-Lucie',
          language: await this.getLanguagesByCode('fr-FR'),
        },
        {
          name: 'सेंट लूसिया',
          language: await this.getLanguagesByCode('hi-IN'),
        },
      ],
    },
    {
      name: 'Micronesia',
      hex_color: '#75AADB',
      translations: [
        {
          name: 'ミクロネシア',
          language: await this.getLanguagesByCode('ja-Kana'),
        },
        {
          name: 'Micronesia',
          language: await this.getLanguagesByCode('es-ES'),
        },
        {
          name: 'Mikronesien',
          language: await this.getLanguagesByCode('de-DE'),
        },
        {
          name: '密克罗尼西亚',
          language: await this.getLanguagesByCode('zh-CN'),
        },
        {
          name: 'Micronesia',
          language: await this.getLanguagesByCode('it-IT'),
        },
        {
          name: 'Micronésie',
          language: await this.getLanguagesByCode('fr-FR'),
        },
        {
          name: 'माइक्रोनेशिया',
          language: await this.getLanguagesByCode('hi-IN'),
        },
      ],
    },
    {
      name: 'Nigeria',
      hex_color: '#008753',
      translations: [
        {
          name: 'ナイジェリア',
          language: await this.getLanguagesByCode('ja-Kana'),
        },
        {
          name: 'Nigeria',
          language: await this.getLanguagesByCode('es-ES'),
        },
        {
          name: 'Nigeria',
          language: await this.getLanguagesByCode('de-DE'),
        },
        {
          name: '尼日利亚',
          language: await this.getLanguagesByCode('zh-CN'),
        },
        {
          name: 'Nigeria',
          language: await this.getLanguagesByCode('it-IT'),
        },
        {
          name: 'Nigéria',
          language: await this.getLanguagesByCode('fr-FR'),
        },
        {
          name: 'नाइजीरिया',
          language: await this.getLanguagesByCode('hi-IN'),
        },
      ],
    },
    {
      name: 'Togo',
      hex_color: '#006A4E',
      translations: [
        {
          name: 'トーゴ',
          language: await this.getLanguagesByCode('ja-Kana'),
        },
        {
          name: 'Togo',
          language: await this.getLanguagesByCode('es-ES'),
        },
        {
          name: 'Togo',
          language: await this.getLanguagesByCode('de-DE'),
        },
        {
          name: '多哥',
          language: await this.getLanguagesByCode('zh-CN'),
        },
        {
          name: 'Togo',
          language: await this.getLanguagesByCode('it-IT'),
        },
        {
          name: 'Togo',
          language: await this.getLanguagesByCode('fr-FR'),
        },
        {
          name: 'टोगो',
          language: await this.getLanguagesByCode('hi-IN'),
        },
      ],
    },
    {
      name: 'Mauritania',
      hex_color: '#006233',
      translations: [
        {
          name: 'モーリタニア',
          language: await this.getLanguagesByCode('ja-Kana'),
        },
        {
          name: 'Mauritania',
          language: await this.getLanguagesByCode('es-ES'),
        },
        {
          name: 'Mauretanien',
          language: await this.getLanguagesByCode('de-DE'),
        },
        {
          name: '毛里塔尼亚',
          language: await this.getLanguagesByCode('zh-CN'),
        },
        {
          name: 'Mauritania',
          language: await this.getLanguagesByCode('it-IT'),
        },
        {
          name: 'Mauritanie',
          language: await this.getLanguagesByCode('fr-FR'),
        },
        {
          name: 'मॉरिटानिया',
          language: await this.getLanguagesByCode('hi-IN'),
        },
      ],
    },
    {
      name: 'Tuvalu',
      hex_color: '#FFD700',
      translations: [
        {
          name: 'ツバル',
          language: await this.getLanguagesByCode('ja-Kana'),
        },
        {
          name: 'Tuvalu',
          language: await this.getLanguagesByCode('es-ES'),
        },
        {
          name: 'Tuvalu',
          language: await this.getLanguagesByCode('de-DE'),
        },
        {
          name: '图瓦卢',
          language: await this.getLanguagesByCode('zh-CN'),
        },
        {
          name: 'Tuvalu',
          language: await this.getLanguagesByCode('it-IT'),
        },
        {
          name: 'Tuvalu',
          language: await this.getLanguagesByCode('fr-FR'),
        },
        {
          name: 'तुवालु',
          language: await this.getLanguagesByCode('hi-IN'),
        },
      ],
    },
    {
      name: 'Ethiopia',
      hex_color: '#DA121A',
      translations: [
        {
          name: 'エチオピア',
          language: await this.getLanguagesByCode('ja-Kana'),
        },
        {
          name: 'Etiopía',
          language: await this.getLanguagesByCode('es-ES'),
        },
        {
          name: 'Äthiopien',
          language: await this.getLanguagesByCode('de-DE'),
        },
        {
          name: '埃塞俄比亚',
          language: await this.getLanguagesByCode('zh-CN'),
        },
        {
          name: 'Etiopia',
          language: await this.getLanguagesByCode('it-IT'),
        },
        {
          name: 'Éthiopie',
          language: await this.getLanguagesByCode('fr-FR'),
        },
        {
          name: 'इथियोपिया',
          language: await this.getLanguagesByCode('hi-IN'),
        },
      ],
    },
    {
      name: 'Iraq',
      hex_color: '#F2A800',
      translations: [
        {
          name: 'イラク',
          language: await this.getLanguagesByCode('ja-Kana'),
        },
        {
          name: 'Irak',
          language: await this.getLanguagesByCode('es-ES'),
        },
        {
          name: 'Irak',
          language: await this.getLanguagesByCode('de-DE'),
        },
        {
          name: '伊拉克',
          language: await this.getLanguagesByCode('zh-CN'),
        },
        {
          name: 'Iraq',
          language: await this.getLanguagesByCode('it-IT'),
        },
        {
          name: 'Irak',
          language: await this.getLanguagesByCode('fr-FR'),
        },
        {
          name: 'इराक',
          language: await this.getLanguagesByCode('hi-IN'),
        },
      ],
    },
    {
      name: 'Antigua and Barbuda',
      hex_color: '#0072C6',
      translations: [
        {
          name: 'アンティグア・バーブーダ',
          language: await this.getLanguagesByCode('ja-Kana'),
        },
        {
          name: 'Antigua y Barbuda',
          language: await this.getLanguagesByCode('es-ES'),
        },
        {
          name: 'Antigua und Barbuda',
          language: await this.getLanguagesByCode('de-DE'),
        },
        {
          name: '安提瓜和巴布达',
          language: await this.getLanguagesByCode('zh-CN'),
        },
        {
          name: 'Antigua e Barbuda',
          language: await this.getLanguagesByCode('it-IT'),
        },
        {
          name: 'Antigua-et-Barbuda',
          language: await this.getLanguagesByCode('fr-FR'),
        },
        {
          name: 'एंटीगुआ और बारबुडा',
          language: await this.getLanguagesByCode('hi-IN'),
        },
      ],
    },
    {
      name: 'Malta',
      hex_color: '#CF142B',
      translations: [
        {
          name: 'マルタ',
          language: await this.getLanguagesByCode('ja-Kana'),
        },
        {
          name: 'Malta',
          language: await this.getLanguagesByCode('es-ES'),
        },
        {
          name: 'Malta',
          language: await this.getLanguagesByCode('de-DE'),
        },
        {
          name: '马耳他',
          language: await this.getLanguagesByCode('zh-CN'),
        },
        {
          name: 'Malta',
          language: await this.getLanguagesByCode('it-IT'),
        },
        {
          name: 'Malte',
          language: await this.getLanguagesByCode('fr-FR'),
        },
        {
          name: 'माल्टा',
          language: await this.getLanguagesByCode('hi-IN'),
        },
      ],
    },
    {
      name: 'Kiribati',
      hex_color: '#D3A025',
      translations: [
        {
          name: 'キリバス',
          language: await this.getLanguagesByCode('ja-Kana'),
        },
        {
          name: 'Kiribati',
          language: await this.getLanguagesByCode('es-ES'),
        },
        {
          name: 'Kiribati',
          language: await this.getLanguagesByCode('de-DE'),
        },
        {
          name: '基里巴斯',
          language: await this.getLanguagesByCode('zh-CN'),
        },
        {
          name: 'Kiribati',
          language: await this.getLanguagesByCode('it-IT'),
        },
        {
          name: 'Kiribati',
          language: await this.getLanguagesByCode('fr-FR'),
        },
        {
          name: 'किरिबाती',
          language: await this.getLanguagesByCode('hi-IN'),
        },
      ],
    },
    {
      name: 'Egypt',
      hex_color: '#CE1126',
      translations: [
        {
          name: 'エジプト',
          language: await this.getLanguagesByCode('ja-Kana'),
        },
        {
          name: 'Egipto',
          language: await this.getLanguagesByCode('es-ES'),
        },
        {
          name: 'Ägypten',
          language: await this.getLanguagesByCode('de-DE'),
        },
        {
          name: '埃及',
          language: await this.getLanguagesByCode('zh-CN'),
        },
        {
          name: 'Egitto',
          language: await this.getLanguagesByCode('it-IT'),
        },
        {
          name: 'Égypte',
          language: await this.getLanguagesByCode('fr-FR'),
        },
        {
          name: 'मिस्र',
          language: await this.getLanguagesByCode('hi-IN'),
        },
      ],
    },
  ]

  const total_count = await this.entityManager.count('tags', {})

  await this.entityManager.query('TRUNCATE TABLE "tag_translations" CASCADE')
  await this.entityManager.query('TRUNCATE TABLE "tags" CASCADE')

  await Promise.all(
    tags.map(async (tag) => {
      return new Promise(async (resolve, reject) => {
        try {
          const savedTag = await this.entityManager.upsert(
            'tags',
            {
              display_order: total_count + 1,
              ...tag,
            },
            ['name', 'status'],
          )

          const tagId = savedTag.raw[0].id

          await this.entityManager.delete('tag_translations', {
            tag: tagId,
          })

          await this.entityManager.save(
            'tag_translations',
            tag.translations.map((translation) => ({
              ...translation,
              tag: tagId,
            })) as any,
          )

          resolve('success')
        } catch (error) {
          reject(error)
        }
      })
    }),
  )
}
