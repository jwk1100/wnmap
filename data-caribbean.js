/* 카리브해 문학 데이터: 아이티, 도미니카 공화국, 자메이카, 푸에르토리코, 트리니다드 토바고, 세인트루시아, 바베이도스, 가이아나, 수리남, 앤티가 바부다, 도미니카 연방 (data-jp.js와 같은 형식)
   t 한국어 제목(국내 번역본 제목을 알라딘에서 확인) · o 원제 · a 작가(국내판 표기) · ao 원어 이름 · y 기준 연도 · yl 표기용 시기
   nt: true = 국내 미출간(제목은 원제를 우리말로 옮김)
   작은 섬나라의 작가들은 대부분 영국과 미국으로 떠났기 때문에, 고향을 쓴 이민 작가(나이폴, 진 리스, 킨케이드, 당티카, 디아스, 제임스)도 고향에 넣었다. 쿠바는 data-cu.js에 있다. */
window.ATLAS = window.ATLAS || { countries: {} };

/* ───────── 아이티 ───────── */
window.ATLAS.countries.ht = {
  code: "ht", geoId: "332", name: "아이티", nameEn: "Haiti", native: "Haïti · Ayiti",
  fit: [[-74.5, 18.0], [-71.6, 20.1]], badge: [-72.6, 19.1], badgeSide: "r",
  intro:
    "1804년 노예들의 혁명으로 세계 최초의 흑인 공화국이 된 나라다. 미국의 점령과 뒤발리에 부자의 30년 독재, 2010년 대지진을 겪었다. 프랑스어와 아이티 크레올어로 농민과 주술, 독재의 공포를 그린 문학이 나왔다.",
  periods: [
    { id: "republic", name: "독립 이후", sub: "농민과 땅", jp: "Littérature haïtienne", start: 1804, end: 1957,
      text: "독립 이후 작가들은 프랑스 문학을 본뜨다가, 미국 점령기에 아프리카의 뿌리와 농민의 삶에 눈을 돌렸다.",
      tags: ["독립", "미국 점령", "농민 소설"] },
    { id: "duvalier", name: "독재와 그 이후", sub: "공포와 이민", jp: "Après Duvalier", start: 1957, end: 2026,
      text: "뒤발리에 독재 아래 많은 작가가 망명했고, 남은 작가들은 크레올어와 실험적인 글쓰기로 공포를 그렸다. 이민자의 문학이 미국과 캐나다에서 자랐다.",
      tags: ["뒤발리에", "망명", "크레올어", "대지진"] }
  ],
  events: [
    { id: "duvalier", name: "뒤발리에 독재", start: 1957, end: 1986, win: false,
      desc: "1957년 집권한 ‘파파 독’ 뒤발리에와 아들 ‘베이비 독’이 비밀경찰 통통 마쿠트를 앞세워 30년 가까이 공포 정치를 폈다.",
      about: ["amour", "dezafi"] },
    { id: "earthquake", name: "아이티 대지진", start: 2010, end: 2010, win: false,
      desc: "2010년 1월 수도 포르토프랭스 부근에서 일어난 대지진으로 20만 명 넘게 숨졌다.",
      about: ["everything"] }
  ],
  regions: [
    { id: "portauprince", ic: "lighthouse", side: "r", name: "포르토프랭스", ll: [-72.33, 18.54] },
    { id: "countryside", ic: "coffee", side: "l", name: "농촌 마을", ll: [-72.8, 18.95] },
    { id: "abroad", name: "해외 배경", ll: null },
    { id: "none", name: "특정 지역 없음", ll: null }
  ],
  books: [
    { id: "masters", t: "이슬의 주인들", o: "Gouverneurs de la rosée", a: "자크 루맹", ao: "Jacques Roumain", y: 1944, yl: "1944년", g: "장편 소설", r: ["countryside"], nt: true,
      s: "쿠바의 사탕수수밭에서 15년 만에 돌아온 농부 마뉘엘이, 가뭄과 원한으로 갈라진 고향 마을 사람들을 설득해 산속의 샘을 찾아 물길을 내려다 원수 집안 사내의 칼에 쓰러진다.",
      h: "아이티 농민 소설의 고전으로, 작가는 아이티 공산당을 세웠다.",
      k: ["가뭄", "물길", "농민", "연대"] },
    { id: "amour", t: "사랑, 분노, 광기", o: "Amour, colère et folie", a: "마리 비외쇼베", ao: "Marie Vieux-Chauvet", y: 1968, yl: "1968년", g: "중편 소설집", r: ["portauprince"], nt: true,
      s: "독재의 공포 속에서 사랑과 분노, 광기를 다룬 세 편의 중편. 첫 편에서는 지방 도시의 노처녀 클레르가 형부를 향한 욕망과 군인들의 횡포 속에 일기를 쓴다.",
      h: "독재 정권의 보복을 두려워한 가족이 책을 사들여 없앴고, 작가는 미국으로 망명했다.",
      k: ["독재", "일기", "욕망", "공포"] },
    { id: "dezafi", t: "데자피", o: "Dezafi", a: "프랑케티엔", ao: "Frankétienne", y: 1975, yl: "1975년", g: "장편 소설", r: ["countryside"], nt: true,
      s: "닭싸움판이 열리는 마을에서 주술사가 사람들을 좀비로 만들어 노예처럼 부리지만, 소금을 맛본 좀비들이 깨어나 반란을 일으킨다.",
      h: "아이티 크레올어로 쓴 첫 장편 소설로, 좀비는 독재 아래의 민중을 빗댄다.",
      k: ["좀비", "주술", "반란", "크레올어"] },
    { id: "everything", t: "안에 있는 모든 것", o: "Everything Inside", a: "에드위지 당티카", ao: "Edwidge Danticat", y: 2019, yl: "2019년", g: "단편집", r: ["portauprince", "abroad"],
      s: "마이애미의 아이티 이민자들과 고향 아이티 사람들이 지진과 이별, 이민의 상처 속에서 사랑하고 서로를 붙잡는 이야기들.",
      h: "아이티에서 태어나 미국으로 이민한 작가의 단편집으로, 전미 도서 비평가 협회상을 받았다.",
      k: ["이민자", "대지진", "가족", "마이애미"] }
  ]
};

/* ───────── 도미니카 공화국 ───────── */
window.ATLAS.countries.do = {
  code: "do", geoId: "214", name: "도미니카 공화국", nameEn: "Dominican Republic", native: "República Dominicana",
  fit: [[-72.0, 17.5], [-68.3, 20.0]], badge: [-70.4, 18.9], badgeSide: "r",
  intro:
    "콜럼버스가 닿은 히스파니올라섬 동쪽의 나라로, 아메리카 최초의 스페인 식민 도시 산토도밍고가 있다. 1930~1961년 트루히요의 잔혹한 독재가 이어졌고, 그 기억은 미국으로 떠난 이민자들의 문학에서 다시 살아났다.",
  periods: [
    { id: "nation", name: "독립과 국민 문학", sub: "타이노의 기억", jp: "Literatura nacional", start: 1844, end: 1930,
      text: "1844년 아이티에서 독립한 뒤 작가들은 스페인 정복기의 원주민 영웅을 국민 문학의 주인공으로 삼았다.",
      tags: ["독립", "원주민 영웅", "국민 문학"] },
    { id: "trujillo", name: "트루히요 이후", sub: "독재와 이민", jp: "Era de Trujillo", start: 1930, end: 2026,
      text: "31년 동안 이어진 트루히요 독재 속에서 작가들은 망명했고, 미국으로 이주한 2세 작가들이 영어로 그 기억을 다시 썼다.",
      tags: ["트루히요", "망명", "이민자", "농민"] }
  ],
  events: [
    { id: "trujillo", name: "트루히요 독재", start: 1930, end: 1961, win: false,
      desc: "라파엘 트루히요는 31년 동안 나라를 사유물처럼 다스리며 반대파를 고문하고 죽였고, 1937년에는 아이티인 수천 명을 학살했다. 1961년 암살되었다.",
      about: ["oscar"] }
  ],
  regions: [
    { id: "santodomingo", ic: "fortress", side: "r", name: "산토도밍고", ll: [-69.9, 18.48] },
    { id: "cibao", ic: "coffee", side: "l", name: "시바오 농촌", ll: [-70.7, 19.4] },
    { id: "abroad", name: "해외 배경", ll: null },
    { id: "none", name: "특정 지역 없음", ll: null }
  ],
  books: [
    { id: "enriquillo", t: "엔리키요", o: "Enriquillo", a: "마누엘 데 헤수스 갈반", ao: "Manuel de Jesús Galván", y: 1882, yl: "1882년", g: "역사 소설", r: ["none"], nt: true,
      s: "16세기 초 스페인 정복자들의 횡포에 맞선 타이노족 족장 엔리키요가 산속에서 13년 동안 저항을 이끈다.",
      h: "도미니카 국민 문학의 출발점으로 꼽히는 역사 소설.",
      k: ["타이노족", "정복", "저항", "족장"] },
    { id: "camino", t: "시골길", o: "Camino real", a: "후안 보스치", ao: "Juan Bosch", y: 1933, yl: "1933년", g: "단편집", r: ["cibao"], nt: true,
      s: "도미니카 시골의 가난한 농민과 소몰이꾼들의 고된 삶을 그린 단편들.",
      h: "라틴 아메리카 단편 소설의 거장으로 꼽히는 작가는 뒤에 대통령이 되었지만 1963년 쿠데타로 쫓겨났다.",
      k: ["농민", "시골", "단편", "가난"] },
    { id: "oscar", t: "오스카 와오의 짧고 놀라운 삶", o: "The Brief Wondrous Life of Oscar Wao", a: "주노 디아스", ao: "Junot Díaz", y: 2007, yl: "2007년", g: "장편 소설", r: ["santodomingo", "abroad"],
      s: "뉴저지의 뚱뚱한 도미니카계 SF 마니아 소년 오스카가 진정한 사랑을 찾으려 애쓰는 이야기 사이로, 트루히요 독재 아래 그의 집안에 내려진 저주 ‘푸쿠’의 역사가 펼쳐진다.",
      h: "도미니카에서 태어나 미국으로 이민한 작가의 소설로, 2008년 퓰리처상을 받았다.",
      k: ["트루히요", "저주", "SF 마니아", "이민자"] }
  ]
};

/* ───────── 자메이카 ───────── */
window.ATLAS.countries.jm = {
  code: "jm", geoId: "388", name: "자메이카", nameEn: "Jamaica", native: "Jamaica",
  fit: [[-78.4, 17.7], [-76.2, 18.6]], badge: [-77.3, 18.2], badgeSide: "r",
  intro:
    "영국의 사탕수수 식민지였다가 1962년 독립한 섬나라로, 라스타파리 운동과 레게 음악의 고향이다. 시인 루이즈 베넷이 크리올어를 문학의 언어로 끌어올렸고, 킹스턴 빈민가의 정치 폭력은 2015년 부커상 수상작이 되었다.",
  periods: [
    { id: "colonial", name: "식민지 시대", sub: "빈민가의 성자", jp: "Colonial era", start: 1930, end: 1962,
      text: "1938년 노동 폭동 이후 민족주의가 자랐고, 작가들은 킹스턴 빈민가와 라스타파리안의 삶을 그렸다.",
      tags: ["식민지", "라스타파리", "빈민가"] },
    { id: "independence", name: "독립 이후", sub: "크리올어와 레게", jp: "Independence", start: 1962, end: 2026,
      text: "독립 뒤 크리올어 시와 레게가 자메이카의 목소리가 되었다. 1970년대에는 두 정당의 갱단이 맞선 정치 폭력이 이어졌다.",
      tags: ["독립", "크리올어", "레게", "정치 폭력"] }
  ],
  events: [
    { id: "violence", name: "1970년대 정치 폭력", start: 1976, end: 1980, win: false,
      desc: "총선을 앞두고 두 정당과 연결된 갱단이 킹스턴에서 총격전을 벌였다. 1976년 12월에는 밥 말리가 집에서 총격을 받았다.",
      about: ["seven"] }
  ],
  regions: [
    { id: "kingston", ic: "guitar", side: "r", name: "킹스턴", ll: [-76.79, 18.0] },
    { id: "abroad", name: "해외 배경", ll: null },
    { id: "none", name: "특정 지역 없음", ll: null }
  ],
  books: [
    { id: "brotherman", t: "브라더 맨", o: "Brother Man", a: "로저 메이스", ao: "Roger Mais", y: 1954, yl: "1954년", g: "장편 소설", r: ["kingston"], nt: true,
      s: "킹스턴 빈민가의 라스타파리안 구두 수선공 브라더 맨이 성자처럼 이웃을 돌보지만, 범죄의 누명을 쓰고 군중에게 폭행당한다.",
      h: "라스타파리안을 처음으로 공감 어린 시선으로 그린 소설로 꼽힌다.",
      k: ["라스타파리", "빈민가", "성자", "누명"] },
    { id: "labrish", t: "자메이카 수다", o: "Jamaica Labrish", a: "루이즈 베넷", ao: "Louise Bennett", y: 1966, yl: "1966년", g: "시집", r: ["none"], nt: true,
      s: "자메이카 크리올어(파투아)로 거리의 수다와 이민, 식민지 사회를 유머러스하게 노래한 시들.",
      h: "‘미스 루’로 불린 시인으로, 크리올어를 문학의 언어로 끌어올렸다.",
      k: ["크리올어", "수다", "유머", "이민"] },
    { id: "seven", t: "일곱 건의 살인에 대한 간략한 역사", o: "A Brief History of Seven Killings", a: "말런 제임스", ao: "Marlon James", y: 2014, yl: "2014년", g: "장편 소설", r: ["kingston", "abroad"],
      s: "1976년 킹스턴에서 레게 가수 ‘싱어’(밥 말리)가 총격을 받은 사건을 중심으로, 갱단 두목과 CIA 요원, 기자 등 수십 명의 목소리가 30년에 걸친 폭력의 역사를 들려준다.",
      h: "자메이카에서 태어나 미국에서 활동하는 작가의 소설로, 2015년 부커상을 받았다.",
      k: ["밥 말리", "갱단", "여러 목소리", "부커상"] }
  ]
};

/* ───────── 푸에르토리코 ───────── */
window.ATLAS.countries.pr = {
  code: "pr", geoId: "630", name: "푸에르토리코", nameEn: "Puerto Rico", native: "Puerto Rico",
  fit: [[-67.3, 17.9], [-65.5, 18.6]], badge: [-66.4, 18.25], badgeSide: "r",
  intro:
    "400년 동안 스페인의 식민지였다가 1898년 미국의 영토가 되었다. 스페인어로 쓰는 푸에르토리코 문학은 미국과 고향 사이에서 흔들리는 정체성과, 뉴욕으로 떠난 대이주의 경험을 그렸다.",
  periods: [
    { id: "us", name: "미국 영토 시대", sub: "두 언어 사이에서", jp: "Literatura puertorriqueña", start: 1898, end: 2026,
      text: "1917년 미국 시민권을 받았고, 1950년대에는 수십만 명이 일자리를 찾아 뉴욕으로 떠났다. 작가들은 정체성과 이주, 대중문화를 썼다.",
      tags: ["미국 영토", "대이주", "정체성", "스페인어"] }
  ],
  events: [
    { id: "migration", name: "뉴욕 대이주", start: 1945, end: 1965, win: false,
      desc: "전후 공업화 정책과 값싼 항공편으로 수십만 명의 푸에르토리코 농민이 뉴욕으로 이주했다.",
      about: ["carreta"] }
  ],
  regions: [
    { id: "sanjuan", ic: "fortress", side: "r", name: "산후안", ll: [-66.1, 18.47] },
    { id: "abroad", name: "해외 배경", ll: null },
    { id: "none", name: "특정 지역 없음", ll: null }
  ],
  books: [
    { id: "carreta", t: "우마차", o: "La carreta", a: "르네 마르케스", ao: "René Marqués", y: 1953, yl: "1953년", g: "희곡", r: ["sanjuan", "abroad"], nt: true,
      s: "산골 마을을 떠난 농민 가족이 산후안의 빈민가를 거쳐 뉴욕으로 이주하지만, 낯선 도시에서 아들을 잃고 고향 땅으로 돌아가기로 한다.",
      h: "푸에르토리코 대이주를 그린 희곡의 고전.",
      k: ["이주", "뉴욕", "농민 가족", "귀향"] },
    { id: "guaracha", t: "마초 카마초의 과라차", o: "La guaracha del Macho Camacho", a: "루이스 라파엘 산체스", ao: "Luis Rafael Sánchez", y: 1976, yl: "1976년", g: "장편 소설", r: ["sanjuan"], nt: true,
      s: "산후안의 교통 체증 속에서 라디오마다 유행가가 울려 퍼지는 어느 수요일 오후, 상원 의원과 그의 정부, 아들, 아내의 하루가 교차한다.",
      h: "대중가요의 리듬으로 식민지 사회를 풍자한 푸에르토리코 현대 소설의 대표작.",
      k: ["교통 체증", "유행가", "풍자", "산후안"] }
  ]
};

/* ───────── 트리니다드 토바고 ───────── */
window.ATLAS.countries.tt = {
  code: "tt", geoId: "780", name: "트리니다드 토바고", nameEn: "Trinidad and Tobago", native: "Trinidad and Tobago",
  fit: [[-61.95, 10.0], [-60.5, 11.4]], badge: [-61.25, 10.45], badgeSide: "r",
  intro:
    "아프리카계와 인도계 사람들이 함께 사는 섬나라로, 카니발과 칼립소의 고향이다. 인도계 계약 노동자의 후손으로 태어난 V. S. 나이폴(2001년 노벨 문학상)이 고향의 거리와 가족을 그려 세계적인 작가가 되었다.",
  periods: [
    { id: "colonial", name: "식민지 시대", sub: "거리와 집", jp: "Colonial era", start: 1900, end: 1962,
      text: "영국 식민지 시절 작가들은 포트오브스페인의 거리와 인도계 대가족의 삶을 그렸다.",
      tags: ["식민지", "인도계", "거리"] },
    { id: "independence", name: "독립 이후", sub: "카니발", jp: "Independence", start: 1962, end: 2026,
      text: "1962년 독립 뒤 작가들은 카니발과 빈민가, 바뀌지 않는 가난과 정체성을 썼다.",
      tags: ["독립", "카니발", "칼립소", "빈민가"] }
  ],
  events: [
    { id: "indenture", name: "인도인 계약 노동 이민", start: 1845, end: 1917, win: false,
      desc: "노예제 폐지 뒤 영국은 사탕수수밭 일손을 채우려고 인도에서 14만여 명의 계약 노동자를 트리니다드로 데려왔다.",
      about: ["biswas"] },
    { id: "independence", name: "독립", start: 1962, end: 1962, win: false,
      desc: "1962년 8월 트리니다드 토바고가 영국에서 독립했다.",
      about: ["dragon"] }
  ],
  regions: [
    { id: "portofspain", ic: "palm", side: "r", name: "포트오브스페인", ll: [-61.52, 10.66] },
    { id: "none", name: "특정 지역 없음", ll: null }
  ],
  books: [
    { id: "miguel", t: "미겔 스트리트", o: "Miguel Street", a: "V. S. 나이폴", ao: "V. S. Naipaul", y: 1959, yl: "1959년", g: "연작 소설", r: ["portofspain"],
      s: "포트오브스페인의 미겔 거리에 사는 소년이, 아무것도 만들지 않는 목수와 시를 쓴다는 떠돌이, 폭죽 장인처럼 꿈과 허세로 사는 이웃들을 지켜본다.",
      h: "트리니다드에서 태어나 영국에서 활동한 나이폴의 첫 책.",
      k: ["거리", "이웃", "소년", "허세"] },
    { id: "biswas", t: "비스와스 씨를 위한 집", o: "A House for Mr Biswas", a: "V. S. 나이폴", ao: "V. S. Naipaul", y: 1961, yl: "1961년", g: "장편 소설", r: ["portofspain"],
      s: "인도계 가난한 집안에서 태어난 모훈 비스와스가 처가인 거대한 툴시 집안에 기대 살면서도 평생 자기만의 집을 갖기를 꿈꾼다.",
      h: "작가의 아버지를 모델로 한 대표작으로, 나이폴은 2001년 노벨 문학상을 받았다.",
      k: ["내 집", "처가", "인도계", "아버지"] },
    { id: "dragon", t: "용은 춤출 수 없다", o: "The Dragon Can't Dance", a: "얼 러브레이스", ao: "Earl Lovelace", y: 1979, yl: "1979년", g: "장편 소설", r: ["portofspain"], nt: true,
      s: "포트오브스페인 언덕 빈민가의 청년 올드리크가 해마다 카니발에서 용 가면을 쓰고 춤추며 살아가지만, 독립 뒤에도 바뀌지 않는 가난 앞에서 반란을 꿈꾼다.",
      h: "트리니다드에 남아 쓴 작가의 대표작으로, 카니발 문화를 깊이 그렸다.",
      k: ["카니발", "용 가면", "빈민가", "반란"] }
  ]
};

/* ───────── 세인트루시아 ───────── */
window.ATLAS.countries.lc = {
  code: "lc", geoId: "662", name: "세인트루시아", nameEn: "Saint Lucia", native: "Saint Lucia",
  fit: [[-61.1, 13.7], [-60.85, 14.12]], badge: [-60.97, 13.9], badgeSide: "r",
  intro:
    "영국과 프랑스가 열네 번이나 주인을 바꾼 작은 화산섬으로, 1979년 독립했다. 이 섬에서 태어난 시인 데릭 월컷이 1992년 노벨 문학상을 받으며 카리브해의 바다와 언어를 세계 문학의 중심에 올렸다.",
  periods: [
    { id: "modern", name: "월컷의 섬", sub: "카리브해의 서사시", jp: "Saint Lucian literature", start: 1940, end: 2026,
      text: "식민지의 영어와 섬의 크리올어, 아프리카와 유럽의 기억이 섞인 시가 섬의 목소리가 되었다.",
      tags: ["시", "크리올어", "혼혈", "바다"] }
  ],
  events: [
    { id: "struggle", name: "영국과 프랑스의 쟁탈전", start: 1660, end: 1814, win: false,
      desc: "세인트루시아는 150년 동안 영국과 프랑스 사이에서 열네 번 주인이 바뀌었고, 1782년 근처 바다에서 대해전이 벌어졌다.",
      about: ["omeros"] }
  ],
  regions: [
    { id: "island", ic: "shell", side: "r", name: "세인트루시아섬", ll: [-60.97, 13.9] },
    { id: "none", name: "특정 지역 없음", ll: null }
  ],
  books: [
    { id: "collected", t: "데릭 월콧 시전집 1948-1984", o: "Collected Poems 1948–1984", a: "데릭 월컷", ao: "Derek Walcott", y: 1986, yl: "1948~1984년 시", g: "시집", r: ["none"],
      s: "카리브해의 바다와 섬, 식민지의 언어와 혼혈의 정체성을 노래한 시들.",
      h: "아프리카와 유럽, 두 혈통 사이에서 갈라진 자신을 노래한 시인의 대표 시를 모았다.",
      k: ["바다", "섬", "혼혈", "식민지 언어"] },
    { id: "omeros", t: "오메로스", o: "Omeros", a: "데릭 월컷", ao: "Derek Walcott", y: 1990, yl: "1990년", g: "서사시", r: ["island"],
      s: "세인트루시아의 어부 아실과 엑토르가 아름다운 여인 헬렌을 두고 다투는 이야기에, 호메로스의 트로이 전쟁과 아프리카 노예의 기억, 카리브해의 식민지 역사를 겹쳐 쓴 서사시.",
      h: "1992년 노벨 문학상을 받은 월컷의 대표작.",
      k: ["어부", "헬렌", "호메로스", "노벨상"] }
  ]
};

/* ───────── 바베이도스 ───────── */
window.ATLAS.countries.bb = {
  code: "bb", geoId: "052", name: "바베이도스", nameEn: "Barbados", native: "Barbados",
  fit: [[-59.7, 13.03], [-59.4, 13.35]], badge: [-59.55, 13.18], badgeSide: "r",
  intro:
    "‘작은 영국’이라 불릴 만큼 영국의 영향이 깊은 사탕수수 섬으로, 1966년 독립해 2021년 공화국이 되었다. 조지 래밍과 카마우 브래스웨이트가 카리브 문학의 고전을 남겼다.",
  periods: [
    { id: "modern", name: "식민지와 독립", sub: "피부의 성", jp: "Barbadian literature", start: 1930, end: 2026,
      text: "작가들은 식민지 교육과 지주의 땅에서 자라는 아이들, 아프리카에서 끌려온 조상의 기억을 썼다.",
      tags: ["식민지", "성장", "아프리카의 뿌리"] }
  ],
  events: [
    { id: "riots", name: "1937년 노동 폭동", start: 1937, end: 1937, win: false,
      desc: "1937년 대공황 속 저임금에 항의하는 노동자들의 폭동이 일어나, 카리브해 노동 운동과 독립 운동의 계기가 되었다.",
      about: ["castle"] }
  ],
  regions: [
    { id: "village", ic: "palm", side: "r", name: "바베이도스섬", ll: [-59.55, 13.15] },
    { id: "none", name: "특정 지역 없음", ll: null }
  ],
  books: [
    { id: "castle", t: "내 피부의 성에서", o: "In the Castle of My Skin", a: "조지 래밍", ao: "George Lamming", y: 1953, yl: "1953년", g: "장편 소설", r: ["village"], nt: true,
      s: "1930~40년대 바베이도스의 마을에서 자라는 소년 G가 친구들과 어울리며 식민지 학교와 지주의 땅, 1937년 노동 폭동을 지켜본다.",
      h: "카리브 영어 문학의 고전으로, 미국판 서문을 리처드 라이트가 썼다.",
      k: ["성장", "식민지 학교", "노동 폭동", "마을"] },
    { id: "arrivants", t: "도착한 사람들", o: "The Arrivants", a: "카마우 브래스웨이트", ao: "Kamau Brathwaite", y: 1973, yl: "1973년", g: "서사시", r: ["none"], nt: true,
      s: "노예로 끌려온 아프리카인의 후손이 아프리카와 카리브해, 신대륙을 오가며 잃어버린 뿌리를 찾는 3부작 서사시.",
      h: "카리브해의 말과 리듬으로 쓴 시를 ‘민족의 언어’라 부른 시인의 대표작.",
      k: ["아프리카의 뿌리", "디아스포라", "3부작", "리듬"] }
  ]
};

/* ───────── 가이아나 ───────── */
window.ATLAS.countries.gy = {
  code: "gy", geoId: "328", name: "가이아나", nameEn: "Guyana", native: "Guyana",
  fit: [[-61.5, 1.1], [-56.4, 8.6]], badge: [-58.9, 5.0], badgeSide: "r",
  intro:
    "남아메리카 북쪽의 영어권 나라로, 열대 우림과 큰 강이 국토 대부분을 덮고 있다. 아프리카계와 인도계, 원주민이 함께 살며, 작가들은 해안의 사탕수수밭과 내륙의 정글을 신화처럼 그렸다.",
  periods: [
    { id: "modern", name: "해안과 정글의 문학", sub: "공작의 궁전", jp: "Guyanese literature", start: 1920, end: 2026,
      text: "영국령 기아나 시절부터 작가들은 인도계 농민의 해안과 내륙 정글의 신화를 썼다. 1966년 독립했다.",
      tags: ["사탕수수밭", "정글", "인도계", "신화"] }
  ],
  events: [
    { id: "indenture", name: "노예 해방과 계약 노동", start: 1834, end: 1917, win: false,
      desc: "1834년 노예제가 폐지된 뒤 영국은 인도에서 24만 명 가까운 계약 노동자를 데려와 사탕수수밭과 논에서 일하게 했다.",
      about: ["corentyne"] }
  ],
  regions: [
    { id: "coast", ic: "rice", side: "r", name: "코렌타인 해안", ll: [-57.5, 6.1] },
    { id: "interior", ic: "toucan", side: "l", name: "내륙 정글", ll: [-59.0, 4.8] },
    { id: "none", name: "특정 지역 없음", ll: null }
  ],
  books: [
    { id: "corentyne", t: "코렌타인의 천둥", o: "Corentyne Thunder", a: "에드거 미텔홀저", ao: "Edgar Mittelholzer", y: 1941, yl: "1941년", g: "장편 소설", r: ["coast"], nt: true,
      s: "코렌타인 해안의 인도계 소몰이꾼 람 롤이 평생 모은 돈을 감춘 채 가난하게 살고, 그의 딸과 혼혈 청년의 사랑이 비극을 부른다.",
      h: "인도계 농민을 그린 카리브 영어 소설의 선구작.",
      k: ["소몰이꾼", "인도계", "해안", "비극"] },
    { id: "peacock", t: "공작의 궁전", o: "Palace of the Peacock", a: "윌슨 해리스", ao: "Wilson Harris", y: 1960, yl: "1960년", g: "장편 소설", r: ["interior"], nt: true,
      s: "잔혹한 선장 도넨이 이끄는 다국적 선원들이 내륙의 강을 거슬러 오르며 도망친 원주민 노동자들을 쫓는 여정이, 꿈과 죽음의 여행이 된다.",
      h: "정복의 역사를 신화적인 언어로 다시 쓴 실험 소설로, ‘기아나 4부작’의 첫 권이다.",
      k: ["정글의 강", "정복", "꿈", "신화"] }
  ]
};

/* ───────── 수리남 ───────── */
window.ATLAS.countries.sr = {
  code: "sr", geoId: "740", name: "수리남", nameEn: "Suriname", native: "Suriname",
  fit: [[-58.1, 1.8], [-53.9, 6.1]], badge: [-55.9, 4.1], badgeSide: "r",
  intro:
    "남아메리카에서 유일하게 네덜란드어를 쓰는 나라로, 노예제와 계약 노동으로 아프리카계, 인도계, 자와계, 중국계 사람들이 모여 산다. 1975년 독립했으며, 작가들은 네덜란드어로 노예제의 기억과 여성의 삶을 썼다.",
  periods: [
    { id: "modern", name: "식민지와 독립", sub: "노예의 목소리", jp: "Surinaamse literatuur", start: 1900, end: 2026,
      text: "작가들은 노예의 시선으로 식민 역사를 고발했고, 독립 뒤에는 폭력과 사랑, 광기를 다뤘다.",
      tags: ["노예제", "반식민주의", "네덜란드어", "여성"] }
  ],
  events: [
    { id: "abolition", name: "노예제 폐지", start: 1863, end: 1873, win: false,
      desc: "1863년 수리남의 노예제가 폐지되었지만, 해방된 사람들은 10년 동안 국가의 감독 아래 농장에서 일해야 했다.",
      about: ["weslaves"] }
  ],
  regions: [
    { id: "paramaribo", ic: "palm", side: "r", name: "파라마리보", ll: [-55.2, 5.85] },
    { id: "none", name: "특정 지역 없음", ll: null }
  ],
  books: [
    { id: "weslaves", t: "우리, 수리남의 노예들", o: "Wij slaven van Suriname", a: "안톤 데 콤", ao: "Anton de Kom", y: 1934, yl: "1934년", g: "논픽션", r: ["paramaribo"], nt: true,
      s: "노예의 손자인 작가가 300년 동안 이어진 수리남 노예제와 식민 착취의 역사를 노예의 시선에서 고발한다.",
      h: "수리남 반식민주의 문학의 출발점으로, 작가는 나치 강제 수용소에서 숨졌다.",
      k: ["노예제", "식민 착취", "고발", "반식민주의"] },
    { id: "madness", t: "한 여자의 광기에 대하여", o: "Over de gekte van een vrouw", a: "아스트리드 루머", ao: "Astrid Roemer", y: 1982, yl: "1982년", g: "장편 소설", r: ["paramaribo"], nt: true,
      s: "남편의 폭력을 피해 집을 나온 수리남의 젊은 교사 누엔카가 사랑과 광기 사이에서 자신을 찾아 간다.",
      h: "작가는 2021년 네덜란드어권 최고 문학상인 네덜란드 문학상을 받았다.",
      k: ["가정 폭력", "여성", "사랑", "광기"] }
  ]
};

/* ───────── 앤티가 바부다 ───────── */
window.ATLAS.countries.ag = {
  code: "ag", geoId: "028", name: "앤티가 바부다", nameEn: "Antigua and Barbuda", native: "Antigua and Barbuda",
  fit: [[-62.0, 16.95], [-61.65, 17.75]], badge: [-61.8, 17.1], badgeSide: "r",
  intro:
    "카리브해 동쪽의 작은 섬나라로, 영국의 사탕수수 식민지였다가 1981년 독립했다. 이 섬에서 태어나 미국으로 건너간 저메이카 킨케이드가 어머니와 섬, 식민 지배를 날카롭게 그렸다.",
  periods: [
    { id: "modern", name: "식민지와 독립", sub: "어머니와 섬", jp: "Antiguan literature", start: 1950, end: 2026,
      text: "작가는 영국식 교육 속에서 자라는 소녀와 관광지가 된 섬의 식민지 역사를 썼다.",
      tags: ["식민지", "어머니", "관광", "독립"] }
  ],
  events: [
    { id: "independence", name: "앤티가 바부다 독립", start: 1981, end: 1981, win: false,
      desc: "1981년 11월 앤티가 바부다가 영국에서 독립했다.",
      about: ["smallplace"] }
  ],
  regions: [
    { id: "stjohns", ic: "shell", side: "r", name: "세인트존스", ll: [-61.85, 17.12] },
    { id: "abroad", name: "해외 배경", ll: null },
    { id: "none", name: "특정 지역 없음", ll: null }
  ],
  books: [
    { id: "annie", t: "애니 존", o: "Annie John", a: "저메이카 킨케이드", ao: "Jamaica Kincaid", y: 1985, yl: "1985년", g: "장편 소설", r: ["stjohns"],
      s: "카리브해의 섬 앤티가에서 자라는 소녀 애니 존이 어머니와의 사랑과 갈등 속에서 사춘기를 보내고, 열일곱 살에 영국으로 떠난다.",
      h: "앤티가에서 태어나 미국으로 건너간 작가의 자전적 성장 소설.",
      k: ["어머니와 딸", "사춘기", "섬", "떠남"] },
    { id: "smallplace", t: "작은 곳", o: "A Small Place", a: "저메이카 킨케이드", ao: "Jamaica Kincaid", y: 1988, yl: "1988년", g: "에세이", r: ["stjohns"], nt: true,
      s: "관광객의 눈에는 낙원인 앤티가의 식민 지배와 독립 뒤의 부패를 독자 ‘당신’에게 날카롭게 들려준다.",
      h: "출간 뒤 작가는 몇 년 동안 사실상 고국에 들어가지 못했다.",
      k: ["관광", "식민지", "부패", "2인칭"] }
  ]
};

/* ───────── 도미니카 연방 ───────── */
window.ATLAS.countries.dm = {
  code: "dm", geoId: "212", name: "도미니카 연방", nameEn: "Dominica", native: "Dominica",
  fit: [[-61.5, 15.18], [-61.2, 15.65]], badge: [-61.35, 15.42], badgeSide: "r",
  intro:
    "울창한 숲과 화산의 섬으로, 카리브해에 원주민 칼리나고족이 남아 있는 몇 안 되는 곳이다. 이 섬에서 태어나 영국에서 활동한 진 리스가 『제인 에어』의 다락방 여인을 카리브해의 크리올 여성으로 다시 썼다.",
  periods: [
    { id: "modern", name: "식민지와 독립", sub: "다락방의 여인", jp: "Dominican literature", start: 1900, end: 2026,
      text: "작가는 노예제 폐지 뒤 몰락한 백인 크리올 가문과 영국으로 건너간 여성들의 고독을 썼다. 섬은 1978년 독립했다.",
      tags: ["크리올", "노예제 폐지", "여성", "고독"] }
  ],
  events: [
    { id: "abolition", name: "영국의 노예제 폐지", start: 1834, end: 1838, win: false,
      desc: "1834년 영국 식민지의 노예제가 폐지되고 1838년 견습 제도도 끝나면서, 노예 노동에 기대던 농장주 가문들이 몰락했다.",
      about: ["sargasso"] }
  ],
  regions: [
    { id: "island", ic: "palm", side: "r", name: "도미니카섬", ll: [-61.35, 15.42] },
    { id: "abroad", name: "해외 배경", ll: null },
    { id: "none", name: "특정 지역 없음", ll: null }
  ],
  books: [
    { id: "voyage", t: "어둠 속의 항해", o: "Voyage in the Dark", a: "진 리스", ao: "Jean Rhys", y: 1934, yl: "1934년", g: "장편 소설", r: ["abroad"], nt: true,
      s: "카리브해 섬 출신의 열여덟 살 애나 모건이 런던의 순회 극단 합창단원으로 일하다 부유한 남자에게 버림받고 무너져 간다.",
      h: "고향 섬의 기억과 런던의 추위가 교차하는 진 리스의 초기 대표작.",
      k: ["합창단원", "런던", "버림받은 여자", "고향의 기억"] },
    { id: "sargasso", t: "광막한 사르가소 바다", o: "Wide Sargasso Sea", a: "진 리스", ao: "Jean Rhys", y: 1966, yl: "1966년", g: "장편 소설", r: ["island", "abroad"],
      s: "노예제 폐지 직후 자메이카의 몰락한 크리올 농장주 딸 앙투아네트가 영국인 로체스터와 결혼해 신혼을 보낸 섬에서 버림받고, 영국 저택의 다락방에 갇힌 ‘미친 여자’가 된다.",
      h: "『제인 에어』의 다락방 여인 버사의 이야기를 다시 쓴 소설로, 작가는 도미니카에서 태어나 영국에서 활동했다.",
      k: ["다락방의 여인", "크리올", "제인 에어", "다시 쓰기"] }
  ]
};
